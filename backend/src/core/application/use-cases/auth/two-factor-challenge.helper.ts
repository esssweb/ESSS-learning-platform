import { randomInt } from 'crypto';
import { Auth } from '../../../domain/models/auth/auth.model';
import { TwoFactorMethod } from '../../../domain/enums/two-factor-method.enum';
import { TwoFactorChallengeInvalidException } from '../../../domain/exceptions/two-factor-challenge-invalid.exception';
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

type ChallengeOutcome =
  | { rateLimited: true }
  | { rateLimited: false; method: TwoFactorMethod; email: string; otpCode?: string };

/**
 * Issues a rate-limited two-factor challenge. For the EMAIL factor this also
 * generates, stores, and sends a fresh OTP; for TOTP it only records the
 * challenge (request count, fresh attempt budget). Never returns access or
 * refresh tokens.
 *
 * The rate-limit check and the state change run under a row lock so concurrent
 * requests cannot all pass the check against the same stale counters. The
 * email is sent only after that transaction has committed.
 */
export async function issueTwoFactorChallenge(
  deps: TwoFactorChallengeDeps,
  auth: Auth,
): Promise<TwoFactorChallengeDto> {
  const expiresAt = new Date(Date.now() + TWO_FACTOR_CHALLENGE_TTL_MS);

  const outcome = await deps.authRepository.updateExclusively<ChallengeOutcome>(
    auth.id!,
    async (locked) => {
      if (!locked.canRequestLoginOtp()) {
        return { rateLimited: true };
      }

      const method = locked.activeTwoFactorMethod();
      if (method === TwoFactorMethod.EMAIL) {
        const otpCode = randomInt(100000, 1000000).toString();
        locked.setLoginOtp(await deps.hashService.hash(otpCode), expiresAt);
        return { rateLimited: false, method, email: locked.email, otpCode };
      }

      locked.recordTotpChallenge();
      return { rateLimited: false, method, email: locked.email };
    },
  );

  if (outcome === null) {
    throw new TwoFactorChallengeInvalidException();
  }
  if (outcome.rateLimited) {
    throw new OtpRateLimitException();
  }

  if (outcome.method === TwoFactorMethod.EMAIL) {
    await deps.emailService.sendLoginOtp(outcome.email, outcome.otpCode!, expiresAt);
  }

  return {
    twoFactorRequired: true,
    method: outcome.method,
    challengeToken: deps.tokenService.generateTwoFactorChallengeToken({
      authId: auth.id!,
      method: outcome.method,
    }),
    expiresAt,
  };
}
