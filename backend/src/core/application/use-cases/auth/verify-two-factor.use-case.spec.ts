import { VerifyTwoFactorUseCase } from './verify-two-factor.use-case';
import { Auth } from '../../../domain/models/auth/auth.model';
import { User } from '../../../domain/models/user/user.model';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { InvalidTwoFactorCodeException } from '../../../domain/exceptions/invalid-two-factor-code.exception';
import { TwoFactorChallengeInvalidException } from '../../../domain/exceptions/two-factor-challenge-invalid.exception';

interface Snapshot {
  loginOtpAttemptCount: number;
  loginOtpCode?: string;
  totpLastUsedStep?: number;
}

interface BuildOptions {
  compareResult?: boolean;
  totp?: boolean;
  isActive?: boolean;
  challengeMethod?: string;
  challengePayload?: Record<string, unknown>;
  verifyThrows?: boolean;
  totpStep?: number | null;
  totpLastUsedStep?: number;
  expiredOtp?: boolean;
  priorAttempts?: number;
}

const build = (opts: BuildOptions = {}) => {
  const {
    compareResult = true,
    totp = false,
    isActive = true,
    challengeMethod = totp ? 'TOTP' : 'EMAIL',
    totpStep = 100,
  } = opts;

  const auth = new Auth({
    id: 'auth-1',
    email: 'admin@esss.local',
    password: 'hashed',
    emailVerified: true,
    otpAttemptCount: 0,
    otpRequestCount: 0,
    isActive,
    loginOtpAttemptCount: opts.priorAttempts ?? 0,
    loginOtpRequestCount: 0,
    totpSecret: totp ? 'enc-secret' : undefined,
    totpEnabledAt: totp ? new Date() : undefined,
    totpLastUsedStep: opts.totpLastUsedStep,
  });
  if (!totp) {
    auth.setLoginOtp(
      'hashed-otp',
      opts.expiredOtp ? new Date(Date.now() - 1000) : new Date(Date.now() + 60_000),
    );
  }

  // `updateExclusively` runs `work` on the in-memory aggregate and snapshots
  // primitive state AFTER work returns: that snapshot is the committed state.
  // Plain `update` throws so any path still using it fails loudly.
  const persisted: Snapshot[] = [];
  const authRepository = {
    findById: jest.fn().mockResolvedValue(auth),
    update: jest.fn().mockImplementation(() => {
      throw new Error('plain update must not be used for two-factor state');
    }),
    updateExclusively: jest
      .fn()
      .mockImplementation(async (_id: string, work: (a: Auth) => Promise<unknown>) => {
        const result = await work(auth);
        persisted.push({
          loginOtpAttemptCount: auth.loginOtpAttemptCount,
          loginOtpCode: auth.loginOtpCode,
          totpLastUsedStep: auth.totpLastUsedStep,
        });
        return result;
      }),
  };
  const userRepository = {
    findByAuthId: jest.fn().mockResolvedValue(
      new User({
        id: 'user-1',
        authId: 'auth-1',
        firstName: 'A',
        lastName: 'B',
        role: UserRole.ADMIN,
      }),
    ),
  };
  const refreshTokenRepository = { create: jest.fn().mockResolvedValue({}) };
  const deviceTokenRepository = { create: jest.fn().mockResolvedValue({ id: 'dev-1' }) };
  const tokenService = {
    verifyTwoFactorChallengeToken: opts.verifyThrows
      ? jest.fn().mockImplementation(() => {
          throw new Error('bad token');
        })
      : jest
          .fn()
          .mockReturnValue(opts.challengePayload ?? { authId: 'auth-1', method: challengeMethod }),
    generateAccessToken: jest.fn().mockReturnValue('access'),
    generateRefreshToken: jest.fn().mockReturnValue('refresh'),
  };
  const totpService = { verify: jest.fn().mockReturnValue(totpStep) };
  const encryptionService = { decrypt: jest.fn().mockReturnValue('plain-secret') };

  const hashService = { compare: jest.fn().mockResolvedValue(compareResult) };
  const useCase = new VerifyTwoFactorUseCase(
    authRepository as never,
    userRepository as never,
    refreshTokenRepository as never,
    deviceTokenRepository as never,
    hashService as never,
    tokenService as never,
    totpService as never,
    encryptionService as never,
  );

  return {
    useCase,
    auth,
    persisted,
    authRepository,
    userRepository,
    refreshTokenRepository,
    deviceTokenRepository,
    tokenService,
    totpService,
    hashService,
  };
};

const run = (useCase: VerifyTwoFactorUseCase, code = '123456') =>
  useCase.execute({ challengeToken: 't', code });

describe('VerifyTwoFactorUseCase', () => {
  describe('EMAIL factor', () => {
    it('issues tokens, creates a refresh token row, and persists the cleared OTP', async () => {
      const { useCase, refreshTokenRepository, persisted } = build();

      const result = await run(useCase);

      expect(result).toMatchObject({ accessToken: 'access', refreshToken: 'refresh' });
      expect(refreshTokenRepository.create).toHaveBeenCalledTimes(1);
      expect(persisted).toHaveLength(1);
      expect(persisted[0].loginOtpCode).toBeUndefined();
      expect(persisted[0].loginOtpAttemptCount).toBe(0);
    });

    it('rejects a wrong code, persists the failed attempt, and issues no tokens', async () => {
      const { useCase, persisted, tokenService, refreshTokenRepository } = build({
        compareResult: false,
      });

      await expect(run(useCase, '000000')).rejects.toBeInstanceOf(InvalidTwoFactorCodeException);

      expect(persisted).toHaveLength(1);
      expect(persisted[0].loginOtpAttemptCount).toBe(1);
      expect(tokenService.generateAccessToken).not.toHaveBeenCalled();
      expect(tokenService.generateRefreshToken).not.toHaveBeenCalled();
      expect(refreshTokenRepository.create).not.toHaveBeenCalled();
    });

    it('kills the challenge after 5 wrong codes, even for the correct code', async () => {
      const { useCase, auth, tokenService } = build({ compareResult: false });
      for (let i = 0; i < 5; i++) {
        await expect(run(useCase, '000000')).rejects.toBeInstanceOf(InvalidTwoFactorCodeException);
      }

      // Now the correct code (hash compare would succeed).
      const hashCompare = jest.fn().mockResolvedValue(true);
      (useCase as unknown as { hashService: { compare: jest.Mock } }).hashService = {
        compare: hashCompare,
      };

      await expect(run(useCase, '123456')).rejects.toBeInstanceOf(InvalidTwoFactorCodeException);
      expect(auth.loginOtpCode).toBeUndefined();
      expect(tokenService.generateAccessToken).not.toHaveBeenCalled();
    });
  });

  describe('TOTP factor', () => {
    it('issues tokens and persists the consumed step', async () => {
      const { useCase, persisted } = build({ totp: true, totpStep: 100 });

      const result = await run(useCase);

      expect(result).toMatchObject({ accessToken: 'access', refreshToken: 'refresh' });
      expect(persisted).toHaveLength(1);
      expect(persisted[0].totpLastUsedStep).toBe(100);
      expect(persisted[0].loginOtpAttemptCount).toBe(0);
    });

    it('rejects a replayed step and counts it as a persisted failed attempt', async () => {
      const { useCase, persisted, tokenService } = build({
        totp: true,
        totpStep: 100,
        totpLastUsedStep: 100,
      });

      await expect(run(useCase)).rejects.toBeInstanceOf(InvalidTwoFactorCodeException);

      expect(persisted).toHaveLength(1);
      expect(persisted[0].loginOtpAttemptCount).toBe(1);
      expect(tokenService.generateAccessToken).not.toHaveBeenCalled();
    });

    it('rejects a wrong code and persists the failed attempt', async () => {
      const { useCase, persisted } = build({ totp: true, totpStep: null });

      await expect(run(useCase, '000000')).rejects.toBeInstanceOf(InvalidTwoFactorCodeException);

      expect(persisted).toHaveLength(1);
      expect(persisted[0].loginOtpAttemptCount).toBe(1);
    });

    it('rejects a valid code after 5 wrong ones without even checking it', async () => {
      const { useCase, totpService, tokenService, persisted } = build({
        totp: true,
        totpStep: null,
      });
      for (let i = 0; i < 5; i++) {
        await expect(run(useCase, '000000')).rejects.toBeInstanceOf(InvalidTwoFactorCodeException);
      }
      expect(persisted[4].loginOtpAttemptCount).toBe(5);
      totpService.verify.mockClear();
      totpService.verify.mockReturnValue(100);

      await expect(run(useCase, '123456')).rejects.toBeInstanceOf(InvalidTwoFactorCodeException);

      expect(totpService.verify).not.toHaveBeenCalled();
      expect(tokenService.generateAccessToken).not.toHaveBeenCalled();
    });
  });

  describe('challenge validation', () => {
    it('rejects an EMAIL challenge when the account now has TOTP enabled', async () => {
      const { useCase, auth, persisted, tokenService } = build({
        totp: true,
        challengeMethod: 'EMAIL',
      });

      await expect(run(useCase)).rejects.toBeInstanceOf(TwoFactorChallengeInvalidException);
      expect(auth.loginOtpAttemptCount).toBe(0);
      expect(persisted[0]).toMatchObject({ loginOtpAttemptCount: 0 });
      expect(tokenService.generateAccessToken).not.toHaveBeenCalled();
    });

    it('rejects a TOTP challenge when the account is on EMAIL', async () => {
      const { useCase, auth, persisted, tokenService } = build({
        challengeMethod: 'TOTP',
      });

      await expect(run(useCase)).rejects.toBeInstanceOf(TwoFactorChallengeInvalidException);
      expect(auth.loginOtpAttemptCount).toBe(0);
      expect(persisted[0]).toMatchObject({ loginOtpAttemptCount: 0 });
      expect(tokenService.generateAccessToken).not.toHaveBeenCalled();
    });

    it('rejects a payload with no authId before querying the repository', async () => {
      const { useCase, authRepository } = build({
        challengePayload: { method: 'EMAIL' },
      });

      await expect(run(useCase)).rejects.toBeInstanceOf(TwoFactorChallengeInvalidException);
      expect(authRepository.updateExclusively).not.toHaveBeenCalled();
    });

    it('rejects when token verification throws', async () => {
      const { useCase, authRepository } = build({ verifyThrows: true });

      await expect(run(useCase)).rejects.toBeInstanceOf(TwoFactorChallengeInvalidException);
      expect(authRepository.updateExclusively).not.toHaveBeenCalled();
    });

    it('rejects an inactive account', async () => {
      const { useCase, tokenService } = build({ isActive: false });

      await expect(run(useCase)).rejects.toBeInstanceOf(TwoFactorChallengeInvalidException);
      expect(tokenService.generateAccessToken).not.toHaveBeenCalled();
    });
  });

  it('rejects an expired EMAIL OTP without comparing and without issuing tokens', async () => {
    const { useCase, hashService, tokenService } = build({ expiredOtp: true });

    await expect(run(useCase)).rejects.toBeInstanceOf(InvalidTwoFactorCodeException);

    expect(hashService.compare).not.toHaveBeenCalled();
    expect(tokenService.generateAccessToken).not.toHaveBeenCalled();
  });

  it('resets a NONZERO attempt count on TOTP success and persists it', async () => {
    const { useCase, persisted } = build({ totp: true, priorAttempts: 3 });

    await run(useCase);

    expect(persisted).toHaveLength(1);
    expect(persisted[0].loginOtpAttemptCount).toBe(0);
  });

  it('rejects a non-string code without touching the repository', async () => {
    const { useCase, authRepository, tokenService } = build();

    for (const code of [123456, null, undefined, {}]) {
      await expect(
        useCase.execute({ challengeToken: 't', code: code as never }),
      ).rejects.toBeInstanceOf(InvalidTwoFactorCodeException);
    }

    expect(authRepository.updateExclusively).not.toHaveBeenCalled();
    expect(authRepository.findById).not.toHaveBeenCalled();
    expect(tokenService.verifyTwoFactorChallengeToken).not.toHaveBeenCalled();
  });

  it('never uses the plain update for two-factor state', async () => {
    const { useCase, authRepository } = build({ compareResult: false });

    await expect(run(useCase)).rejects.toBeInstanceOf(InvalidTwoFactorCodeException);

    expect(authRepository.update).not.toHaveBeenCalled();
  });

  it('creates a device row and links it on the refresh token', async () => {
    const { useCase, deviceTokenRepository, refreshTokenRepository } = build();

    await useCase.execute({
      challengeToken: 't',
      code: '123456',
      deviceToken: 'fcm',
      deviceName: 'phone',
      deviceType: 'ios',
    });

    expect(deviceTokenRepository.create).toHaveBeenCalledTimes(1);
    const saved = refreshTokenRepository.create.mock.calls[0][0];
    expect(saved.deviceTokenId).toBe('dev-1');
  });
});
