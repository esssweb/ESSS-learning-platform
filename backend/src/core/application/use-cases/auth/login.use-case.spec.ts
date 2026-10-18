import { LoginUseCase } from './login.use-case';
import { Auth, AuthProps } from '../../../domain/models/auth/auth.model';
import { User } from '../../../domain/models/user/user.model';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { OtpRateLimitException } from '../../../domain/exceptions/otp-rate-limit.exception';
import { InvalidCredentialsException } from '../../../domain/exceptions/invalid-credentials.exception';
import { UnauthorizedAccessException } from '../../../domain/exceptions/unauthorized-access.exception';

const makeAuth = (overrides: Partial<AuthProps> = {}) =>
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
    ...overrides,
  });

const makeUser = (role: UserRole) =>
  new User({ id: 'user-1', authId: 'auth-1', firstName: 'A', lastName: 'B', role });

const limited = () => makeAuth({ loginOtpRequestCount: 3, loginOtpLastSentAt: new Date() });

const withTotp = (auth: Auth) => {
  auth.enrollTotp('encrypted-secret');
  auth.confirmTotp();
  return auth;
};

const build = (role: UserRole, auth: Auth = makeAuth(), passwordOk = true) => {
  // updateExclusively runs `work` on the in-memory aggregate and snapshots primitive
  // state AFTER work returns (the committed state), logging 'commit' to the same
  // list as sendLoginOtp so commit-before-send ordering is pinned. Plain update throws
  // so any path still using it fails loudly.
  const calls: string[] = [];
  const snapshots: {
    code?: string;
    expiresAt?: Date;
    requestCount: number;
    attemptCount: number;
  }[] = [];
  const authRepository = {
    findByEmail: jest.fn().mockResolvedValue(auth),
    update: jest.fn().mockImplementation(() => {
      throw new Error('plain update must not be used for two-factor state');
    }),
    updateExclusively: jest
      .fn()
      .mockImplementation(async (_id: string, work: (a: Auth) => Promise<unknown>) => {
        const result = await work(auth);
        calls.push('commit');
        snapshots.push({
          code: auth.loginOtpCode,
          expiresAt: auth.loginOtpExpiresAt,
          requestCount: auth.loginOtpRequestCount,
          attemptCount: auth.loginOtpAttemptCount,
        });
        return result;
      }),
  };
  const userRepository = { findByAuthId: jest.fn().mockResolvedValue(makeUser(role)) };
  const refreshTokenRepository = { create: jest.fn().mockResolvedValue({}) };
  const deviceTokenRepository = { create: jest.fn().mockResolvedValue({ id: 'dt-1' }) };
  const hashService = {
    compare: jest.fn().mockResolvedValue(passwordOk),
    hash: jest.fn().mockResolvedValue('hashed-otp'),
  };
  const tokenService = {
    generateAccessToken: jest.fn().mockReturnValue('access'),
    generateRefreshToken: jest.fn().mockReturnValue('refresh'),
    generateTwoFactorChallengeToken: jest.fn().mockReturnValue('challenge'),
  };
  const emailService = {
    sendLoginOtp: jest.fn().mockImplementation(async () => {
      calls.push('send');
    }),
  };

  const useCase = new LoginUseCase(
    authRepository as never,
    userRepository as never,
    refreshTokenRepository as never,
    deviceTokenRepository as never,
    hashService as never,
    tokenService as never,
    emailService as never,
  );

  return {
    useCase,
    calls,
    snapshots,
    authRepository,
    refreshTokenRepository,
    deviceTokenRepository,
    hashService,
    tokenService,
    emailService,
  };
};

const creds = { email: 'a@b.co', password: 'pw' };

describe('LoginUseCase two-factor branch', () => {
  it('returns a challenge and no tokens for an admin', async () => {
    const { useCase, emailService } = build(UserRole.ADMIN);

    const result: never = (await useCase.execute({
      email: 'admin@esss.local',
      password: 'pw',
    })) as never;

    expect(result).toMatchObject({ twoFactorRequired: true, method: 'EMAIL' });
    expect(result).not.toHaveProperty('accessToken');
    expect(emailService.sendLoginOtp).toHaveBeenCalledTimes(1);
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
    expect(emailService.sendLoginOtp).not.toHaveBeenCalled();
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
    expect(emailService.sendLoginOtp).not.toHaveBeenCalled();
    expect(authRepository.updateExclusively).toHaveBeenCalledTimes(1);
    expect(authRepository.update).not.toHaveBeenCalled();
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

describe('LoginUseCase admin two-factor invariants', () => {
  for (const role of [UserRole.ADMIN, UserRole.SUPER_ADMIN]) {
    it(`${role} with a wrong password gets InvalidCredentials and no side effects`, async () => {
      const h = build(role, makeAuth(), false);

      await expect(h.useCase.execute(creds)).rejects.toBeInstanceOf(InvalidCredentialsException);

      expect(h.authRepository.updateExclusively).not.toHaveBeenCalled();
      expect(h.emailService.sendLoginOtp).not.toHaveBeenCalled();
      expect(h.tokenService.generateTwoFactorChallengeToken).not.toHaveBeenCalled();
    });

    it(`${role} rate-limited with a wrong password gets 401-type error, not rate limit`, async () => {
      for (const auth of [limited(), withTotp(limited())]) {
        const h = build(role, auth, false);
        await expect(h.useCase.execute(creds)).rejects.toBeInstanceOf(InvalidCredentialsException);
      }
    });

    it(`${role} rate-limited with the right password is rejected without persisting or emailing`, async () => {
      for (const auth of [limited(), withTotp(limited())]) {
        const h = build(role, auth);
        await expect(h.useCase.execute(creds)).rejects.toBeInstanceOf(OtpRateLimitException);
        // The locked section returns without mutating: committed counters unchanged.
        expect(h.snapshots.at(-1)).toMatchObject({ requestCount: 3, code: undefined });
        expect(h.emailService.sendLoginOtp).not.toHaveBeenCalled();
        expect(h.tokenService.generateTwoFactorChallengeToken).not.toHaveBeenCalled();
      }
    });

    it(`inactive ${role} with the correct password is rejected and no email is sent`, async () => {
      const h = build(role, makeAuth({ isActive: false }));

      await expect(h.useCase.execute(creds)).rejects.toBeInstanceOf(UnauthorizedAccessException);

      expect(h.emailService.sendLoginOtp).not.toHaveBeenCalled();
      expect(h.authRepository.updateExclusively).not.toHaveBeenCalled();
    });

    it(`${role} login never creates device/refresh rows or tokens, even with device info`, async () => {
      for (const auth of [makeAuth(), withTotp(makeAuth())]) {
        const h = build(role, auth);

        const result = await h.useCase.execute({
          ...creds,
          deviceToken: 'fcm',
          deviceName: 'phone',
          deviceType: 'ios',
        } as never);

        expect(Object.keys(result).sort()).toEqual([
          'challengeToken',
          'expiresAt',
          'method',
          'twoFactorRequired',
        ]);
        expect(h.deviceTokenRepository.create).not.toHaveBeenCalled();
        expect(h.refreshTokenRepository.create).not.toHaveBeenCalled();
        expect(h.tokenService.generateAccessToken).not.toHaveBeenCalled();
        expect(h.tokenService.generateRefreshToken).not.toHaveBeenCalled();
      }
    });
  }

  it('EMAIL persists the OTP and bookkeeping before sending, with expiry equal to expiresAt', async () => {
    const h = build(UserRole.ADMIN, makeAuth({ loginOtpAttemptCount: 4 }));

    const result = (await h.useCase.execute(creds)) as { expiresAt: Date };

    expect(h.calls).toEqual(['commit', 'send']);
    expect(h.snapshots[0].code).toBe('hashed-otp');
    expect(h.snapshots[0].requestCount).toBe(1);
    expect(h.snapshots[0].attemptCount).toBe(0);
    expect(h.snapshots[0].expiresAt?.getTime()).toBe(result.expiresAt.getTime());
    const sentCode = h.emailService.sendLoginOtp.mock.calls[0][1];
    expect(sentCode).toMatch(/^\d{6}$/);
    expect(h.hashService.hash).toHaveBeenCalledWith(sentCode);
  });

  it('TOTP persists bookkeeping after recording the challenge, sends nothing, and is rate limited', async () => {
    const h = build(UserRole.ADMIN, withTotp(makeAuth({ loginOtpAttemptCount: 3 })));

    const result = await h.useCase.execute(creds);

    expect(result).toMatchObject({ method: 'TOTP' });
    expect(h.calls).toEqual(['commit']);
    expect(h.snapshots[0]).toMatchObject({ requestCount: 1, attemptCount: 0, code: undefined });

    await h.useCase.execute(creds);
    await h.useCase.execute(creds);
    await expect(h.useCase.execute(creds)).rejects.toBeInstanceOf(OtpRateLimitException);
    expect(h.snapshots.map((s) => s.requestCount)).toEqual([1, 2, 3, 3]); // the rate-limited 4th commits unchanged state
  });

  it('students and instructors keep device and refresh rows with no 2FA side effects', async () => {
    for (const role of [UserRole.STUDENT, UserRole.INSTRUCTOR]) {
      const h = build(role);

      const result = await h.useCase.execute({ ...creds, deviceToken: 'fcm' } as never);

      expect(result).toMatchObject({ accessToken: 'access', refreshToken: 'refresh' });
      expect(h.deviceTokenRepository.create).toHaveBeenCalledTimes(1);
      expect(h.refreshTokenRepository.create.mock.calls[0][0].deviceTokenId).toBe('dt-1');
      expect(h.authRepository.updateExclusively).not.toHaveBeenCalled();
      expect(h.emailService.sendLoginOtp).not.toHaveBeenCalled();
      expect(h.tokenService.generateTwoFactorChallengeToken).not.toHaveBeenCalled();
    }
  });
});
