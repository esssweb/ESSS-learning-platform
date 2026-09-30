import { LoginUseCase } from './login.use-case';
import { Auth } from '../../../domain/models/auth/auth.model';
import { User } from '../../../domain/models/user/user.model';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { OtpRateLimitException } from '../../../domain/exceptions/otp-rate-limit.exception';

const makeAuth = () =>
  new Auth({
    id: 'auth-1',
    email: 'admin@esss.local',
    password: 'hashed',
    emailVerified: true,
    otpAttemptCount: 0,
    otpRequestCount: 0,
    isActive: true,
    loginOtpAttemptCount: 0,
    loginOtpRequestCount: 0,
  });

const makeUser = (role: UserRole) =>
  new User({ id: 'user-1', authId: 'auth-1', firstName: 'A', lastName: 'B', role });

const build = (role: UserRole, auth: Auth = makeAuth()) => {
  const authRepository = {
    findByEmail: jest.fn().mockResolvedValue(auth),
    update: jest.fn().mockResolvedValue(auth),
  };
  const userRepository = { findByAuthId: jest.fn().mockResolvedValue(makeUser(role)) };
  const refreshTokenRepository = { create: jest.fn().mockResolvedValue({}) };
  const deviceTokenRepository = { create: jest.fn() };
  const hashService = {
    compare: jest.fn().mockResolvedValue(true),
    hash: jest.fn().mockResolvedValue('hashed-otp'),
  };
  const tokenService = {
    generateAccessToken: jest.fn().mockReturnValue('access'),
    generateRefreshToken: jest.fn().mockReturnValue('refresh'),
    generateTwoFactorChallengeToken: jest.fn().mockReturnValue('challenge'),
  };
  const emailService = { sendOtp: jest.fn().mockResolvedValue(undefined) };

  const useCase = new LoginUseCase(
    authRepository as never,
    userRepository as never,
    refreshTokenRepository as never,
    deviceTokenRepository as never,
    hashService as never,
    tokenService as never,
    emailService as never,
  );

  return { useCase, tokenService, emailService, authRepository };
};

describe('LoginUseCase two-factor branch', () => {
  it('returns a challenge and no tokens for an admin', async () => {
    const { useCase, emailService } = build(UserRole.ADMIN);

    const result: never = (await useCase.execute({
      email: 'admin@esss.local',
      password: 'pw',
    })) as never;

    expect(result).toMatchObject({ twoFactorRequired: true, method: 'EMAIL' });
    expect(result).not.toHaveProperty('accessToken');
    expect(emailService.sendOtp).toHaveBeenCalledTimes(1);
  });

  it('returns a challenge for a super admin', async () => {
    const { useCase } = build(UserRole.SUPER_ADMIN);

    const result = await useCase.execute({ email: 'a@b.co', password: 'pw' });

    expect(result).toMatchObject({ twoFactorRequired: true });
  });

  it('returns tokens directly for a student', async () => {
    const { useCase, emailService } = build(UserRole.STUDENT);

    const result = await useCase.execute({ email: 'a@b.co', password: 'pw' });

    expect(result).toMatchObject({ accessToken: 'access', refreshToken: 'refresh' });
    expect(emailService.sendOtp).not.toHaveBeenCalled();
  });

  it('returns expiresAt about five minutes out, matching the challenge token', async () => {
    const { useCase } = build(UserRole.ADMIN);

    const result = (await useCase.execute({ email: 'a@b.co', password: 'pw' })) as {
      expiresAt: Date;
    };

    const delta = result.expiresAt.getTime() - Date.now();
    expect(delta).toBeGreaterThan(5 * 60 * 1000 - 5000);
    expect(delta).toBeLessThanOrEqual(5 * 60 * 1000);
  });

  it('issues a TOTP challenge without sending email and persists bookkeeping', async () => {
    const auth = makeAuth();
    auth.enrollTotp('encrypted-secret');
    auth.confirmTotp();
    auth.incrementLoginOtpAttempts();
    const { useCase, emailService, authRepository } = build(UserRole.ADMIN, auth);

    const result = await useCase.execute({ email: 'a@b.co', password: 'pw' });

    expect(result).toMatchObject({ twoFactorRequired: true, method: 'TOTP' });
    expect(emailService.sendOtp).not.toHaveBeenCalled();
    expect(authRepository.update).toHaveBeenCalledTimes(1);
    expect(auth.loginOtpAttemptCount).toBe(0);
  });

  it('rejects a 4th admin login within the hour', async () => {
    const { useCase } = build(UserRole.ADMIN);

    for (let i = 0; i < 3; i++) {
      await useCase.execute({ email: 'a@b.co', password: 'pw' });
    }

    await expect(useCase.execute({ email: 'a@b.co', password: 'pw' })).rejects.toBeInstanceOf(
      OtpRateLimitException,
    );
  });
});
