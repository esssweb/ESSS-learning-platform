import { issueTwoFactorChallenge } from './two-factor-challenge.helper';
import { Auth } from '../../../domain/models/auth/auth.model';

describe('issueTwoFactorChallenge email delivery', () => {
  it('sends the EMAIL code via sendLoginOtp (with the challenge expiry), never sendOtp', async () => {
    const auth = new Auth({
      id: 'auth-1',
      email: 'admin@esss.local',
      emailVerified: true,
      otpAttemptCount: 0,
      otpRequestCount: 0,
      isActive: true,
      loginOtpAttemptCount: 0,
      loginOtpRequestCount: 0,
    });
    const authRepository = {
      updateExclusively: jest.fn(async (_id: string, work: (a: Auth) => Promise<unknown>) =>
        work(auth),
      ),
    };
    const emailService = {
      sendOtp: jest.fn(),
      sendLoginOtp: jest.fn().mockResolvedValue(undefined),
    };
    const result = await issueTwoFactorChallenge(
      {
        authRepository: authRepository as never,
        hashService: { hash: jest.fn().mockResolvedValue('hashed') } as never,
        tokenService: {
          generateTwoFactorChallengeToken: jest.fn().mockReturnValue('tok'),
        } as never,
        emailService: emailService as never,
      },
      auth,
    );

    expect(emailService.sendOtp).not.toHaveBeenCalled();
    expect(emailService.sendLoginOtp).toHaveBeenCalledTimes(1);
    const [email, code, expiresAt] = emailService.sendLoginOtp.mock.calls[0];
    expect(email).toBe('admin@esss.local');
    expect(code).toMatch(/^\d{6}$/);
    expect(expiresAt).toBe(result.expiresAt);
  });
});
