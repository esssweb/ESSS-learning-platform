import { ResendTwoFactorOtpUseCase } from './resend-two-factor-otp.use-case';
import { Auth } from '../../../domain/models/auth/auth.model';
import { TwoFactorChallengeInvalidException } from '../../../domain/exceptions/two-factor-challenge-invalid.exception';
import { OtpRateLimitException } from '../../../domain/exceptions/otp-rate-limit.exception';

const build = (opts: { totp?: boolean; challengeMethod?: string } = {}) => {
  const { totp = false, challengeMethod = totp ? 'TOTP' : 'EMAIL' } = opts;
  const auth = new Auth({
    id: 'auth-1',
    email: 'admin@esss.local',
    password: 'hashed',
    emailVerified: true,
    otpAttemptCount: 0,
    otpRequestCount: 0,
    isActive: true,
    loginOtpAttemptCount: 0,
    loginOtpRequestCount: 0,
    totpSecret: totp ? 'enc' : undefined,
    totpEnabledAt: totp ? new Date() : undefined,
  });
  const authRepository = {
    findById: jest.fn().mockResolvedValue(auth),
    update: jest.fn().mockResolvedValue(auth),
  };
  const tokenService = {
    verifyTwoFactorChallengeToken: jest
      .fn()
      .mockReturnValue({ authId: 'auth-1', method: challengeMethod }),
    generateTwoFactorChallengeToken: jest.fn().mockReturnValue('fresh-token'),
  };
  const emailService = { sendOtp: jest.fn().mockResolvedValue(undefined) };
  const useCase = new ResendTwoFactorOtpUseCase(
    authRepository as never,
    { hash: jest.fn().mockResolvedValue('hashed') } as never,
    tokenService as never,
    emailService as never,
  );
  return { useCase, authRepository, tokenService, emailService };
};

describe('ResendTwoFactorOtpUseCase', () => {
  it('sends a new email OTP and returns a fresh challenge token', async () => {
    const { useCase, tokenService, emailService } = build();

    const result = await useCase.execute({ challengeToken: 'old-token' });

    expect(emailService.sendOtp).toHaveBeenCalledTimes(1);
    expect(tokenService.generateTwoFactorChallengeToken).toHaveBeenCalledWith({
      authId: 'auth-1',
      method: 'EMAIL',
    });
    expect(result.challengeToken).toBe('fresh-token');
    expect(result.challengeToken).not.toBe('old-token');
    expect(result.expiresAt).toBeInstanceOf(Date);
    expect(result.message).toBeDefined();
  });

  it('rejects a TOTP account and sends nothing', async () => {
    const { useCase, emailService } = build({ totp: true });

    await expect(useCase.execute({ challengeToken: 't' })).rejects.toBeInstanceOf(
      TwoFactorChallengeInvalidException,
    );
    expect(emailService.sendOtp).not.toHaveBeenCalled();
  });

  it('rejects a challenge whose method does not match the account', async () => {
    const { useCase, emailService } = build({ challengeMethod: 'TOTP' });

    await expect(useCase.execute({ challengeToken: 't' })).rejects.toBeInstanceOf(
      TwoFactorChallengeInvalidException,
    );
    expect(emailService.sendOtp).not.toHaveBeenCalled();
  });

  it('rejects when the token has no authId', async () => {
    const { useCase, authRepository, tokenService } = build();
    tokenService.verifyTwoFactorChallengeToken.mockReturnValue({ method: 'EMAIL' });

    await expect(useCase.execute({ challengeToken: 't' })).rejects.toBeInstanceOf(
      TwoFactorChallengeInvalidException,
    );
    expect(authRepository.findById).not.toHaveBeenCalled();
  });

  it('rate-limits the 4th resend within the hour', async () => {
    const { useCase } = build();

    for (let i = 0; i < 3; i++) {
      await useCase.execute({ challengeToken: 't' });
    }

    await expect(useCase.execute({ challengeToken: 't' })).rejects.toBeInstanceOf(
      OtpRateLimitException,
    );
  });
});
