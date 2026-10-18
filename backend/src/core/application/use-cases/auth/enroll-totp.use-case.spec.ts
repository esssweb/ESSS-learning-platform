import { EnrollTotpUseCase } from './enroll-totp.use-case';
import { ConfirmTotpUseCase } from './confirm-totp.use-case';
import { DisableTotpUseCase } from './disable-totp.use-case';
import { Auth } from '../../../domain/models/auth/auth.model';
import { TwoFactorMethod } from '../../../domain/enums/two-factor-method.enum';
import { InvalidCredentialsException } from '../../../domain/exceptions/invalid-credentials.exception';
import { InvalidTwoFactorCodeException } from '../../../domain/exceptions/invalid-two-factor-code.exception';
import { TwoFactorAlreadyEnabledException } from '../../../domain/exceptions/two-factor-already-enabled.exception';
import { TwoFactorNotEnrolledException } from '../../../domain/exceptions/two-factor-not-enrolled.exception';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';

interface Committed {
  totpSecret?: string;
  method: TwoFactorMethod;
  pending: boolean;
  totpLastUsedStep?: number;
  attempts: number;
}

interface Opts {
  secret?: string;
  enabled?: boolean;
  attempts?: number;
  lastStep?: number;
  missing?: boolean;
}

const build = (opts: Opts = {}) => {
  const auth = new Auth({
    id: 'auth-1',
    email: 'admin@esss.local',
    password: 'hashed',
    emailVerified: true,
    otpAttemptCount: 0,
    otpRequestCount: 0,
    isActive: true,
    loginOtpAttemptCount: opts.attempts ?? 0,
    loginOtpRequestCount: 0,
    totpSecret: opts.secret,
    totpEnabledAt: opts.enabled ? new Date() : undefined,
    totpLastUsedStep: opts.lastStep,
  });

  // Snapshot after `work` returns = committed state. Plain reads/writes throw so
  // any stale read-modify-write path fails loudly.
  const committed: Committed[] = [];
  const repo = {
    findById: jest.fn().mockImplementation(() => {
      throw new Error('findById must not be used for two-factor state');
    }),
    update: jest.fn().mockImplementation(() => {
      throw new Error('plain update must not be used for two-factor state');
    }),
    updateExclusively: jest
      .fn()
      .mockImplementation(async (_id: string, work: (a: Auth) => Promise<unknown>) => {
        if (opts.missing) return null;
        const result = await work(auth);
        committed.push({
          totpSecret: auth.totpSecret,
          method: auth.activeTwoFactorMethod(),
          pending: auth.isTotpEnrollmentPending(),
          totpLastUsedStep: auth.totpLastUsedStep,
          attempts: auth.loginOtpAttemptCount,
        });
        return result;
      }),
  };
  const last = () => committed[committed.length - 1];
  return { auth, repo, last };
};

const makeTotp = (step: number | null = 42) => ({
  generateSecret: jest.fn().mockReturnValue('SECRET'),
  buildOtpauthUri: jest.fn().mockReturnValue('otpauth://x'),
  verify: jest.fn().mockReturnValue(step),
});
const makeHash = (ok = true) => ({
  hash: jest.fn(),
  compare: jest.fn().mockResolvedValue(ok),
});
const makeEnc = () => ({
  encrypt: jest.fn().mockImplementation((v: string) => `enc(${v})`),
  decrypt: jest.fn().mockReturnValue('SECRET'),
});

describe('EnrollTotpUseCase', () => {
  it('stores an encrypted secret without activating TOTP', async () => {
    const { repo, last } = build();
    const totp = makeTotp();
    const enc = makeEnc();
    const useCase = new EnrollTotpUseCase(
      repo as never,
      totp as never,
      enc as never,
      makeHash() as never,
    );

    const result = await useCase.execute('auth-1', 'pw');

    expect(result).toEqual({ otpauthUri: 'otpauth://x', secret: 'SECRET' });
    expect(enc.encrypt).toHaveBeenCalledWith('SECRET');
    expect(last().totpSecret).toBe('enc(SECRET)');
    expect(last().pending).toBe(true);
    expect(last().method).toBe(TwoFactorMethod.EMAIL);
  });

  it('rejects a wrong password and commits no secret or method change', async () => {
    const { repo, last } = build();
    const enc = makeEnc();
    const useCase = new EnrollTotpUseCase(
      repo as never,
      makeTotp() as never,
      enc as never,
      makeHash(false) as never,
    );

    await expect(useCase.execute('auth-1', 'wrong')).rejects.toBeInstanceOf(
      InvalidCredentialsException,
    );

    expect(last().totpSecret).toBeUndefined();
    expect(last().pending).toBe(false);
    expect(last().method).toBe(TwoFactorMethod.EMAIL);
  });

  it('rejects when the account has no stored password', async () => {
    const { auth, repo, last } = build();
    (auth as unknown as { props: { password?: string } }).props.password = undefined;
    const hash = makeHash(true);
    const useCase = new EnrollTotpUseCase(
      repo as never,
      makeTotp() as never,
      makeEnc() as never,
      hash as never,
    );

    await expect(useCase.execute('auth-1', 'pw')).rejects.toBeInstanceOf(
      InvalidCredentialsException,
    );

    expect(hash.compare).not.toHaveBeenCalled();
    expect(last().totpSecret).toBeUndefined();
  });

  it('rejects enrollment while TOTP is enabled and leaves committed state unchanged', async () => {
    const { repo, last } = build({ secret: 'enc(OLD)', enabled: true });
    const useCase = new EnrollTotpUseCase(
      repo as never,
      makeTotp() as never,
      makeEnc() as never,
      makeHash() as never,
    );

    await expect(useCase.execute('auth-1', 'pw')).rejects.toBeInstanceOf(
      TwoFactorAlreadyEnabledException,
    );

    expect(last().method).toBe(TwoFactorMethod.TOTP);
    expect(last().totpSecret).toBe('enc(OLD)');
  });

  it('allows re-enrolling while still pending, replacing the pending secret', async () => {
    const { repo, last } = build({ secret: 'enc(OLD)' });
    const useCase = new EnrollTotpUseCase(
      repo as never,
      makeTotp() as never,
      makeEnc() as never,
      makeHash() as never,
    );

    await useCase.execute('auth-1', 'pw');

    expect(last().totpSecret).toBe('enc(SECRET)');
    expect(last().method).toBe(TwoFactorMethod.EMAIL);
  });

  it('throws UserNotFoundException for an unknown auth id', async () => {
    const { repo } = build({ missing: true });
    const useCase = new EnrollTotpUseCase(
      repo as never,
      makeTotp() as never,
      makeEnc() as never,
      makeHash() as never,
    );

    await expect(useCase.execute('nope', 'pw')).rejects.toBeInstanceOf(UserNotFoundException);
  });
});

describe('ConfirmTotpUseCase', () => {
  it('activates TOTP and consumes the step on a valid code', async () => {
    const { repo, last } = build({ secret: 'enc(SECRET)' });
    const useCase = new ConfirmTotpUseCase(
      repo as never,
      makeTotp(42) as never,
      makeEnc() as never,
    );

    await useCase.execute('auth-1', '123456');

    expect(last().method).toBe(TwoFactorMethod.TOTP);
    expect(last().totpLastUsedStep).toBe(42);
  });

  it('rejects a bad code and stays on email codes', async () => {
    const { repo, last } = build({ secret: 'enc(SECRET)' });
    const useCase = new ConfirmTotpUseCase(
      repo as never,
      makeTotp(null) as never,
      makeEnc() as never,
    );

    await expect(useCase.execute('auth-1', '000000')).rejects.toBeInstanceOf(
      InvalidTwoFactorCodeException,
    );
    expect(last().method).toBe(TwoFactorMethod.EMAIL);
    expect(last().pending).toBe(true);
  });

  it('rejects when nothing is stored', async () => {
    const { repo } = build();
    const totp = makeTotp();
    const useCase = new ConfirmTotpUseCase(repo as never, totp as never, makeEnc() as never);

    await expect(useCase.execute('auth-1', '123456')).rejects.toBeInstanceOf(
      TwoFactorNotEnrolledException,
    );
    expect(totp.verify).not.toHaveBeenCalled();
  });

  it('rejects when TOTP is already enabled (no pending enrollment)', async () => {
    const { repo, last } = build({ secret: 'enc(SECRET)', enabled: true });
    const totp = makeTotp();
    const useCase = new ConfirmTotpUseCase(repo as never, totp as never, makeEnc() as never);

    await expect(useCase.execute('auth-1', '123456')).rejects.toBeInstanceOf(
      TwoFactorNotEnrolledException,
    );
    expect(totp.verify).not.toHaveBeenCalled();
    expect(last().totpLastUsedStep).toBeUndefined();
  });

  it('throws UserNotFoundException for an unknown auth id', async () => {
    const { repo } = build({ missing: true });
    const useCase = new ConfirmTotpUseCase(repo as never, makeTotp() as never, makeEnc() as never);

    await expect(useCase.execute('nope', '123456')).rejects.toBeInstanceOf(UserNotFoundException);
  });
});

describe('DisableTotpUseCase', () => {
  const enabled = (extra: Opts = {}) => build({ secret: 'enc(SECRET)', enabled: true, ...extra });

  it('disables on a valid code, clears the secret and resets attempts', async () => {
    const { repo, last } = enabled({ attempts: 3 });
    const useCase = new DisableTotpUseCase(
      repo as never,
      makeTotp(50) as never,
      makeEnc() as never,
    );

    await useCase.execute('auth-1', '123456');

    expect(last().method).toBe(TwoFactorMethod.EMAIL);
    expect(last().totpSecret).toBeUndefined();
    expect(last().attempts).toBe(0);
  });

  it('commits the incremented attempt count on a wrong code', async () => {
    const { repo, last } = enabled({ attempts: 1 });
    const useCase = new DisableTotpUseCase(
      repo as never,
      makeTotp(null) as never,
      makeEnc() as never,
    );

    await expect(useCase.execute('auth-1', '000000')).rejects.toBeInstanceOf(
      InvalidTwoFactorCodeException,
    );

    expect(last().attempts).toBe(2);
    expect(last().method).toBe(TwoFactorMethod.TOTP);
  });

  it('rejects a valid code once 5 attempts are spent, without verifying', async () => {
    const { repo, last } = enabled({ attempts: 5 });
    const totp = makeTotp(50);
    const useCase = new DisableTotpUseCase(repo as never, totp as never, makeEnc() as never);

    await expect(useCase.execute('auth-1', '123456')).rejects.toBeInstanceOf(
      InvalidTwoFactorCodeException,
    );

    expect(totp.verify).not.toHaveBeenCalled();
    expect(last().method).toBe(TwoFactorMethod.TOTP);
  });

  it('caps at 5 failures across sequential attempts', async () => {
    const { repo } = enabled();
    const totp = makeTotp(null);
    const useCase = new DisableTotpUseCase(repo as never, totp as never, makeEnc() as never);

    for (let i = 0; i < 8; i++) {
      await expect(useCase.execute('auth-1', '000000')).rejects.toBeInstanceOf(
        InvalidTwoFactorCodeException,
      );
    }
    expect(totp.verify).toHaveBeenCalledTimes(5);
  });

  it('rejects a replayed step and counts it as a failure', async () => {
    const { repo, last } = enabled({ lastStep: 50 });
    const useCase = new DisableTotpUseCase(
      repo as never,
      makeTotp(50) as never,
      makeEnc() as never,
    );

    await expect(useCase.execute('auth-1', '123456')).rejects.toBeInstanceOf(
      InvalidTwoFactorCodeException,
    );

    expect(last().method).toBe(TwoFactorMethod.TOTP);
    expect(last().attempts).toBe(1);
  });

  it('rejects when TOTP is not enabled', async () => {
    const { repo } = build({ secret: 'enc(SECRET)' });
    const useCase = new DisableTotpUseCase(repo as never, makeTotp() as never, makeEnc() as never);

    await expect(useCase.execute('auth-1', '123456')).rejects.toBeInstanceOf(
      TwoFactorNotEnrolledException,
    );
  });

  it('throws UserNotFoundException for an unknown auth id', async () => {
    const { repo } = build({ missing: true });
    const useCase = new DisableTotpUseCase(repo as never, makeTotp() as never, makeEnc() as never);

    await expect(useCase.execute('nope', '123456')).rejects.toBeInstanceOf(UserNotFoundException);
  });
});
