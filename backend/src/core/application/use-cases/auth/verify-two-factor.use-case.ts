import { Inject, Injectable } from '@nestjs/common';
import { TwoFactorMethod } from '../../../domain/enums/two-factor-method.enum';
import { Auth } from '../../../domain/models/auth/auth.model';
import { DeviceToken } from '../../../domain/models/auth/device-token.model';
import { RefreshToken } from '../../../domain/models/auth/refresh-token.model';
import { InvalidTwoFactorCodeException } from '../../../domain/exceptions/invalid-two-factor-code.exception';
import { TwoFactorChallengeInvalidException } from '../../../domain/exceptions/two-factor-challenge-invalid.exception';
import { AuthRepositoryInterface } from '../../../domain/repositories/auth.repository.interface';
import { DeviceTokenRepositoryInterface } from '../../../domain/repositories/device-token.repository.interface';
import { RefreshTokenRepositoryInterface } from '../../../domain/repositories/refresh-token.repository.interface';
import { UserRepositoryInterface } from '../../../domain/repositories/user.repository.interface';
import { LoginResponseDto } from '../../dto/auth/login-response.dto';
import { EncryptionServiceInterface } from '../../ports/output/encryption.service.interface';
import { HashServiceInterface } from '../../ports/output/hash.service.interface';
import { TokenServiceInterface } from '../../ports/output/token.service.interface';
import { TotpServiceInterface } from '../../ports/output/totp.service.interface';
import {
  AUTH_REPOSITORY,
  DEVICE_TOKEN_REPOSITORY,
  ENCRYPTION_SERVICE,
  HASH_SERVICE,
  REFRESH_TOKEN_REPOSITORY,
  TOKEN_SERVICE,
  TOTP_SERVICE,
  USER_REPOSITORY,
} from '../../ports/tokens';

export interface VerifyTwoFactorRequestDto {
  challengeToken: string;
  code: string;
  deviceToken?: string;
  deviceName?: string;
  deviceType?: string;
}

type VerifyOutcome = { ok: true; email: string } | { ok: false; reason: 'challenge' | 'code' };

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class VerifyTwoFactorUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepositoryInterface,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepositoryInterface,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepositoryInterface,
    @Inject(DEVICE_TOKEN_REPOSITORY)
    private readonly deviceTokenRepository: DeviceTokenRepositoryInterface,
    @Inject(HASH_SERVICE) private readonly hashService: HashServiceInterface,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenServiceInterface,
    @Inject(TOTP_SERVICE) private readonly totpService: TotpServiceInterface,
    @Inject(ENCRYPTION_SERVICE)
    private readonly encryptionService: EncryptionServiceInterface,
  ) {}

  async execute(dto: VerifyTwoFactorRequestDto): Promise<LoginResponseDto> {
    // A JSON number/object would otherwise reach bcrypt and surface as a 500.
    if (typeof dto.code !== 'string') {
      throw new InvalidTwoFactorCodeException();
    }

    let payload: { authId: string; method: string };
    try {
      payload = this.tokenService.verifyTwoFactorChallengeToken(dto.challengeToken);
    } catch {
      throw new TwoFactorChallengeInvalidException();
    }
    if (!payload?.authId) {
      throw new TwoFactorChallengeInvalidException();
    }

    // Everything that reads or changes attempt state happens under the row lock,
    // so concurrent guesses are serialized and each one is counted. `work`
    // returns outcomes instead of throwing: a throw would roll back the
    // failed-attempt increment.
    const outcome = await this.authRepository.updateExclusively<VerifyOutcome>(
      payload.authId,
      async (auth) => {
        if (!auth.isActive) {
          return { ok: false, reason: 'challenge' };
        }
        // A challenge issued for one factor must never be redeemed against the other.
        if (payload.method !== auth.activeTwoFactorMethod()) {
          return { ok: false, reason: 'challenge' };
        }
        const codeOk =
          auth.activeTwoFactorMethod() === TwoFactorMethod.TOTP
            ? await this.checkTotp(auth, dto.code)
            : await this.checkEmailOtp(auth, dto.code);
        return codeOk ? { ok: true, email: auth.email } : { ok: false, reason: 'code' };
      },
    );

    if (outcome === null || (!outcome.ok && outcome.reason === 'challenge')) {
      throw new TwoFactorChallengeInvalidException();
    }
    if (!outcome.ok) {
      throw new InvalidTwoFactorCodeException();
    }

    const user = await this.userRepository.findByAuthId(payload.authId);
    if (!user) {
      throw new TwoFactorChallengeInvalidException();
    }

    let deviceTokenId: string | undefined;
    if (dto.deviceToken) {
      const savedDevice = await this.deviceTokenRepository.create(
        new DeviceToken({
          userId: user.id!,
          firebaseToken: dto.deviceToken,
          deviceName: dto.deviceName,
          deviceType: dto.deviceType,
          isActive: true,
        }),
      );
      deviceTokenId = savedDevice.id;
    }

    const tokenPayload = { userId: user.id!, email: outcome.email, role: user.role };
    const accessToken = this.tokenService.generateAccessToken(tokenPayload);
    const refreshTokenString = this.tokenService.generateRefreshToken(tokenPayload);

    await this.refreshTokenRepository.create(
      new RefreshToken({
        userId: user.id!,
        token: refreshTokenString,
        deviceTokenId,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
        isRevoked: false,
      }),
    );

    return {
      accessToken,
      refreshToken: refreshTokenString,
      user: {
        id: user.id!,
        email: outcome.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  // Both checkers run under the row lock and mutate the locked aggregate; the
  // repository persists it when `work` returns.
  private async checkEmailOtp(auth: Auth, code: string): Promise<boolean> {
    if (!auth.canAttemptLoginOtp()) {
      auth.clearLoginOtp();
      return false;
    }

    const matches = await this.hashService.compare(code, auth.loginOtpCode!);

    if (!matches) {
      auth.incrementLoginOtpAttempts();
      // The fifth failure clears the OTP, killing the challenge entirely.
      if (!auth.canAttemptLoginOtp()) {
        auth.clearLoginOtp();
      }
      return false;
    }

    auth.clearLoginOtp();
    return true;
  }

  private async checkTotp(auth: Auth, code: string): Promise<boolean> {
    // Bounded guesses: with the password alone an attacker must not be able to
    // brute-force codes. The budget resets only when a new challenge is issued.
    if (!auth.canAttemptTotp()) {
      return false;
    }

    const secret = this.encryptionService.decrypt(auth.totpSecret!);
    const step = this.totpService.verify(secret, code);

    if (step === null || auth.hasTotpStepBeenUsed(step)) {
      auth.incrementLoginOtpAttempts();
      return false;
    }

    auth.consumeTotpStep(step);
    auth.clearLoginOtp();
    return true;
  }
}
