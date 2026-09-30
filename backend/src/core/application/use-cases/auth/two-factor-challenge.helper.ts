import { randomInt } from 'crypto';
import { Auth } from '../../../domain/models/auth/auth.model';
import { TwoFactorMethod } from '../../../domain/enums/two-factor-method.enum';
import { OtpRateLimitException } from '../../../domain/exceptions/otp-rate-limit.exception';
import { AuthRepositoryInterface } from '../../../domain/repositories/auth.repository.interface';
import { EmailServiceInterface } from '../../ports/output/email.service.interface';
import { HashServiceInterface } from '../../ports/output/hash.service.interface';
import { TokenServiceInterface } from '../../ports/output/token.service.interface';
import { TwoFactorChallengeDto } from '../../dto/auth/login-response.dto';

// Must equal the '5m' JWT expiry in JwtTokenService.generateTwoFactorChallengeToken,
// so the stored OTP, the returned expiresAt and the challenge token all expire together.
export const TWO_FACTOR_CHALLENGE_TTL_MS = 5 * 60 * 1000;

export interface TwoFactorChallengeDeps {
  authRepository: AuthRepositoryInterface;
  hashService: HashServiceInterface;
  tokenService: TokenServiceInterface;
  emailService: EmailServiceInterface;
}

/**
 * Issues a rate-limited two-factor challenge. For the EMAIL factor this also
 * generates, stores, and sends a fresh OTP; for TOTP it only records the
 * challenge (request count, fresh attempt budget). Never returns access or
 * refresh tokens.
 */
export async function issueTwoFactorChallenge(
  deps: TwoFactorChallengeDeps,
  auth: Auth,
): Promise<TwoFactorChallengeDto> {
  const method = auth.activeTwoFactorMethod();
  const expiresAt = new Date(Date.now() + TWO_FACTOR_CHALLENGE_TTL_MS);

  if (!auth.canRequestLoginOtp()) {
    throw new OtpRateLimitException();
  }

  if (method === TwoFactorMethod.EMAIL) {
    const otpCode = randomInt(100000, 1000000).toString();
    auth.setLoginOtp(await deps.hashService.hash(otpCode), expiresAt);
    await deps.authRepository.update(auth.id!, auth);
    await deps.emailService.sendOtp(auth.email, otpCode);
  } else {
    auth.recordTotpChallenge();
    await deps.authRepository.update(auth.id!, auth);
  }

  return {
    twoFactorRequired: true,
    method,
    challengeToken: deps.tokenService.generateTwoFactorChallengeToken({
      authId: auth.id!,
      method,
    }),
    expiresAt,
  };
}
