import { Inject, Injectable } from '@nestjs/common';
import { TwoFactorMethod } from '../../../domain/enums/two-factor-method.enum';
import { TwoFactorChallengeInvalidException } from '../../../domain/exceptions/two-factor-challenge-invalid.exception';
import { AuthRepositoryInterface } from '../../../domain/repositories/auth.repository.interface';
import { EmailServiceInterface } from '../../ports/output/email.service.interface';
import { HashServiceInterface } from '../../ports/output/hash.service.interface';
import { TokenServiceInterface } from '../../ports/output/token.service.interface';
import { AUTH_REPOSITORY, EMAIL_SERVICE, HASH_SERVICE, TOKEN_SERVICE } from '../../ports/tokens';
import { issueTwoFactorChallenge } from './two-factor-challenge.helper';

@Injectable()
export class ResendTwoFactorOtpUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepositoryInterface,
    @Inject(HASH_SERVICE) private readonly hashService: HashServiceInterface,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenServiceInterface,
    @Inject(EMAIL_SERVICE) private readonly emailService: EmailServiceInterface,
  ) {}

  async execute(dto: { challengeToken: string }): Promise<{
    message: string;
    expiresAt: Date;
    challengeToken: string;
  }> {
    let payload: { authId: string; method: string };
    try {
      payload = this.tokenService.verifyTwoFactorChallengeToken(dto.challengeToken);
    } catch {
      throw new TwoFactorChallengeInvalidException();
    }

    if (!payload?.authId) {
      throw new TwoFactorChallengeInvalidException();
    }

    const auth = await this.authRepository.findById(payload.authId);
    if (!auth || !auth.isActive) {
      throw new TwoFactorChallengeInvalidException();
    }

    if (
      payload.method !== auth.activeTwoFactorMethod() ||
      auth.activeTwoFactorMethod() !== TwoFactorMethod.EMAIL
    ) {
      // Nothing to resend for an authenticator app.
      throw new TwoFactorChallengeInvalidException();
    }

    const challenge = await issueTwoFactorChallenge(
      {
        authRepository: this.authRepository,
        hashService: this.hashService,
        tokenService: this.tokenService,
        emailService: this.emailService,
      },
      auth,
    );

    // The original token may be nearly expired; hand back a fresh one matching the new OTP.
    return {
      message: 'Verification code sent.',
      expiresAt: challenge.expiresAt,
      challengeToken: challenge.challengeToken,
    };
  }
}
