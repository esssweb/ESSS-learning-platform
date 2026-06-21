import { Inject, Injectable } from '@nestjs/common';
import { AuthRepositoryInterface } from '../../../domain/repositories/auth.repository.interface';
import { UserRepositoryInterface } from '../../../domain/repositories/user.repository.interface';
import { RefreshTokenRepositoryInterface } from '../../../domain/repositories/refresh-token.repository.interface';
import { DeviceTokenRepositoryInterface } from '../../../domain/repositories/device-token.repository.interface';
import { HashServiceInterface } from '../../ports/output/hash.service.interface';
import { TokenServiceInterface } from '../../ports/output/token.service.interface';
import { RegisterRequestDto } from '../../dto/auth/register-request.dto';
import { RegisterResponseDto } from '../../dto/auth/register-response.dto';
import { PhoneNumber } from '../../../domain/value-objects/phone-number.vo';
import { User } from '../../../domain/models/user/user.model';
import { RefreshToken } from '../../../domain/models/auth/refresh-token.model';
import { DeviceToken } from '../../../domain/models/auth/device-token.model';
import { EmailNotVerifiedException } from '../../../domain/exceptions/email-not-verified.exception';
import { UserAlreadyExistsException } from '../../../domain/exceptions/user-already-exists.exception';
import {
  AUTH_REPOSITORY,
  DEVICE_TOKEN_REPOSITORY,
  HASH_SERVICE,
  REFRESH_TOKEN_REPOSITORY,
  TOKEN_SERVICE,
  USER_REPOSITORY,
} from '../../ports/tokens';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepositoryInterface,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepositoryInterface,
    @Inject(DEVICE_TOKEN_REPOSITORY)
    private readonly deviceTokenRepository: DeviceTokenRepositoryInterface,
    @Inject(HASH_SERVICE)
    private readonly hashService: HashServiceInterface,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenServiceInterface,
  ) {}

  async execute(dto: RegisterRequestDto): Promise<RegisterResponseDto> {
    let verifiedPayload: { email: string };
    try {
      verifiedPayload = this.tokenService.verifyVerificationToken(
        dto.verificationToken,
      );
    } catch {
      throw new EmailNotVerifiedException();
    }

    if (verifiedPayload.email !== dto.email.toLowerCase().trim()) {
      throw new EmailNotVerifiedException();
    }

    const auth = await this.authRepository.findByEmail(verifiedPayload.email);

    if (!auth || !auth.emailVerified || auth.verificationToken !== dto.verificationToken) {
      throw new EmailNotVerifiedException();
    }

    if (auth.isFullyRegistered()) {
      throw new UserAlreadyExistsException(auth.email);
    }

    const hashedPassword = await this.hashService.hash(dto.password);
    auth.setPassword(hashedPassword);
    await this.authRepository.update(auth.id!, auth);

    const user = new User({
      authId: auth.id!,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phoneNumber: dto.phoneNumber ? new PhoneNumber(dto.phoneNumber) : undefined,
      gender: dto.gender,
      role: dto.role,
    });

    const createdUser = await this.userRepository.create(user);

    let deviceTokenId: string | undefined;
    if (dto.deviceToken) {
      const deviceToken = new DeviceToken({
        userId: createdUser.id!,
        firebaseToken: dto.deviceToken,
        deviceName: dto.deviceName,
        deviceType: dto.deviceType,
        isActive: true,
      });
      const savedDeviceToken = await this.deviceTokenRepository.create(deviceToken);
      deviceTokenId = savedDeviceToken.id;
    }

    const tokenPayload = {
      userId: createdUser.id!,
      email: auth.email,
      role: createdUser.role,
    };

    const accessToken = this.tokenService.generateAccessToken(tokenPayload);
    const refreshTokenString = this.tokenService.generateRefreshToken(tokenPayload);

    // Save refresh token
    const refreshToken = new RefreshToken({
      userId: createdUser.id!,
      token: refreshTokenString,
      deviceTokenId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isRevoked: false,
    });

    await this.refreshTokenRepository.create(refreshToken);

    return {
      accessToken,
      refreshToken: refreshTokenString,
      user: {
        id: createdUser.id!,
        email: auth.email,
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
        role: createdUser.role,
      },
    };
  }
}
