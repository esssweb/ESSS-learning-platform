import { ResetTwoFactorUseCase } from './reset-two-factor.use-case';
import { Auth } from '../../../domain/models/auth/auth.model';
import { User } from '../../../domain/models/user/user.model';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { TwoFactorMethod } from '../../../domain/enums/two-factor-method.enum';
import { SelfTwoFactorResetException } from '../../../domain/exceptions/self-two-factor-reset.exception';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';

describe('ResetTwoFactorUseCase', () => {
  const newAuth = () =>
    new Auth({
      id: 'auth-1',
      email: 'admin@esss.local',
      emailVerified: true,
      otpAttemptCount: 0,
      otpRequestCount: 0,
      isActive: true,
      loginOtpAttemptCount: 3,
      loginOtpRequestCount: 1,
      loginOtpCode: 'hashed-code',
      loginOtpExpiresAt: new Date(Date.now() + 60_000),
    });

  const enrolledAuth = () => {
    const auth = newAuth();
    auth.enrollTotp('enc(SECRET)');
    auth.confirmTotp();
    auth.consumeTotpStep(42);
    return auth;
  };

  const pendingAuth = () => {
    const auth = newAuth();
    auth.enrollTotp('enc(PENDING)');
    return auth;
  };

  const snapshot = (auth: Auth) => ({
    method: auth.activeTwoFactorMethod(),
    totpSecret: auth.totpSecret,
    totpEnabledAt: auth.totpEnabledAt,
    totpLastUsedStep: auth.totpLastUsedStep,
    loginOtpCode: auth.loginOtpCode,
    loginOtpExpiresAt: auth.loginOtpExpiresAt,
    loginOtpAttemptCount: auth.loginOtpAttemptCount,
  });

  const user = () =>
    new User({
      id: 'user-1',
      authId: 'auth-1',
      firstName: 'A',
      lastName: 'B',
      role: UserRole.ADMIN,
    });

  // `committed` is captured after work returns, mirroring the real commit.
  // findById/update throw so any read-modify-write path fails.
  const build = (auth: Auth | null, foundUser: User | null = user()) => {
    const state: { committed?: ReturnType<typeof snapshot> } = {};
    const authRepository = {
      updateExclusively: jest.fn(async (_id: string, work: (a: Auth) => Promise<unknown>) => {
        if (!auth) return null;
        const result = await work(auth);
        state.committed = snapshot(auth);
        return result;
      }),
      findById: jest.fn(() => {
        throw new Error('stale read: findById must not be used');
      }),
      update: jest.fn(() => {
        throw new Error('stale write: update must not be used');
      }),
    };
    const userRepository = { findById: jest.fn().mockResolvedValue(foundUser) };
    const useCase = new ResetTwoFactorUseCase(userRepository as never, authRepository as never);
    return { useCase, authRepository, userRepository, state };
  };

  it('clears TOTP and login OTP state so the target falls back to email codes', async () => {
    const { useCase, authRepository, state } = build(enrolledAuth());

    await useCase.execute('user-1', 'actor-9');

    expect(authRepository.updateExclusively).toHaveBeenCalledWith('auth-1', expect.any(Function));
    expect(state.committed).toEqual({
      method: TwoFactorMethod.EMAIL,
      totpSecret: undefined,
      totpEnabledAt: undefined,
      totpLastUsedStep: undefined,
      loginOtpCode: undefined,
      loginOtpExpiresAt: undefined,
      loginOtpAttemptCount: 0,
    });
  });

  it('clears a pending (unconfirmed) enrollment', async () => {
    const auth = pendingAuth();
    expect(auth.isTotpEnrollmentPending()).toBe(true);
    const { useCase, state } = build(auth);

    await useCase.execute('user-1', 'actor-9');

    expect(state.committed?.totpSecret).toBeUndefined();
    expect(state.committed?.method).toBe(TwoFactorMethod.EMAIL);
    expect(auth.isTotpEnrollmentPending()).toBe(false);
  });

  it('throws when the user does not exist and never touches auth', async () => {
    const { useCase, authRepository } = build(enrolledAuth(), null);

    await expect(useCase.execute('nope', 'actor-9')).rejects.toBeInstanceOf(UserNotFoundException);
    expect(authRepository.updateExclusively).not.toHaveBeenCalled();
  });

  it('throws when the auth row is missing', async () => {
    const { useCase } = build(null);

    await expect(useCase.execute('user-1', 'actor-9')).rejects.toBeInstanceOf(UserNotFoundException);
  });

  it('returns the confirmation message', async () => {
    const { useCase } = build(enrolledAuth());

    await expect(useCase.execute('user-1', 'actor-9')).resolves.toEqual({
      message: 'Two-factor authentication reset. Email codes will be used.',
    });
  });

  it('refuses a self-reset and touches nothing', async () => {
    const { useCase, authRepository, userRepository } = build(enrolledAuth());

    await expect(useCase.execute('user-1', 'user-1')).rejects.toBeInstanceOf(
      SelfTwoFactorResetException,
    );
    expect(authRepository.updateExclusively).not.toHaveBeenCalled();
    expect(userRepository.findById).not.toHaveBeenCalled();
  });
});
