import { Auth, AuthProps } from './auth.model';
import { TwoFactorMethod } from '../../enums/two-factor-method.enum';

const baseProps = (overrides: Partial<AuthProps> = {}): AuthProps => ({
  email: 'admin@esss.local',
  emailVerified: true,
  otpAttemptCount: 0,
  otpRequestCount: 0,
  isActive: true,
  loginOtpAttemptCount: 0,
  loginOtpRequestCount: 0,
  ...overrides,
});

describe('Auth two-factor behaviour', () => {
  it('defaults to the EMAIL factor when TOTP is not enabled', () => {
    const auth = new Auth(baseProps());
    expect(auth.activeTwoFactorMethod()).toBe(TwoFactorMethod.EMAIL);
  });

  it('uses TOTP only once enrollment is confirmed', () => {
    const auth = new Auth(baseProps());

    auth.enrollTotp('encrypted-secret');
    expect(auth.isTotpEnrollmentPending()).toBe(true);
    expect(auth.activeTwoFactorMethod()).toBe(TwoFactorMethod.EMAIL);

    auth.confirmTotp();
    expect(auth.isTotpEnrollmentPending()).toBe(false);
    expect(auth.activeTwoFactorMethod()).toBe(TwoFactorMethod.TOTP);
  });

  it('reverts to EMAIL when TOTP is disabled', () => {
    const auth = new Auth(baseProps());
    auth.enrollTotp('encrypted-secret');
    auth.confirmTotp();
    auth.consumeTotpStep(100);

    auth.disableTotp();

    expect(auth.activeTwoFactorMethod()).toBe(TwoFactorMethod.EMAIL);
    expect(auth.totpSecret).toBeUndefined();
    expect(auth.totpLastUsedStep).toBeUndefined();
  });

  it('rejects a TOTP step at or below the last consumed step', () => {
    const auth = new Auth(baseProps());
    auth.consumeTotpStep(100);

    expect(auth.hasTotpStepBeenUsed(99)).toBe(true);
    expect(auth.hasTotpStepBeenUsed(100)).toBe(true);
    expect(auth.hasTotpStepBeenUsed(101)).toBe(false);
  });

  it('has never used a TOTP step on a fresh Auth', () => {
    const auth = new Auth(baseProps());
    expect(auth.hasTotpStepBeenUsed(1)).toBe(false);
  });

  it('allows login OTP attempts until the fifth failure', () => {
    const auth = new Auth(baseProps());
    auth.setLoginOtp('hash', new Date(Date.now() + 60_000));

    for (let i = 0; i < 5; i += 1) {
      expect(auth.canAttemptLoginOtp()).toBe(true);
      auth.incrementLoginOtpAttempts();
    }

    expect(auth.canAttemptLoginOtp()).toBe(false);
  });

  it('treats an expired login OTP as unusable', () => {
    const auth = new Auth(baseProps());
    auth.setLoginOtp('hash', new Date(Date.now() - 1_000));

    expect(auth.isLoginOtpExpired()).toBe(true);
    expect(auth.canAttemptLoginOtp()).toBe(false);
  });

  it('allows the first three login OTP requests within the hour', () => {
    const auth = new Auth(baseProps());
    const later = () => new Date(Date.now() + 600_000);

    expect(auth.canRequestLoginOtp()).toBe(true);
    auth.setLoginOtp('a', later());
    expect(auth.canRequestLoginOtp()).toBe(true);
    auth.setLoginOtp('b', later());
    expect(auth.canRequestLoginOtp()).toBe(true);
    auth.setLoginOtp('c', later());
  });

  it('rate limits to three login OTP requests per hour', () => {
    const auth = new Auth(baseProps());
    const later = () => new Date(Date.now() + 600_000);

    auth.setLoginOtp('a', later());
    auth.setLoginOtp('b', later());
    auth.setLoginOtp('c', later());

    expect(auth.canRequestLoginOtp()).toBe(false);
  });

  it('resets the login OTP request count after an hour has passed', () => {
    const auth = new Auth(
      baseProps({
        loginOtpRequestCount: 3,
        loginOtpLastSentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      }),
    );

    expect(auth.canRequestLoginOtp()).toBe(true);
  });

  it('clears login OTP state', () => {
    const auth = new Auth(baseProps());
    auth.setLoginOtp('hash', new Date(Date.now() + 60_000));
    auth.incrementLoginOtpAttempts();
    auth.incrementLoginOtpAttempts();

    auth.clearLoginOtp();

    expect(auth.loginOtpCode).toBeUndefined();
    expect(auth.loginOtpAttemptCount).toBe(0);
    expect(auth.canAttemptLoginOtp()).toBe(false);
  });

  it('keeps registration OTP state independent of login OTP state', () => {
    const auth = new Auth(baseProps({ otpCode: 'registration-hash' }));

    auth.setLoginOtp('login-hash', new Date(Date.now() + 60_000));
    auth.clearLoginOtp();

    expect(auth.otpCode).toBe('registration-hash');
  });
});

describe('Auth TOTP challenge bookkeeping', () => {
  it('recordTotpChallenge resets a nonzero attempt count', () => {
    const auth = new Auth(baseProps());
    auth.incrementLoginOtpAttempts();
    auth.incrementLoginOtpAttempts();
    expect(auth.loginOtpAttemptCount).toBe(2);

    auth.recordTotpChallenge();

    expect(auth.loginOtpAttemptCount).toBe(0);
  });

  it('counts toward the hourly request limit', () => {
    const auth = new Auth(baseProps());

    auth.recordTotpChallenge();
    auth.recordTotpChallenge();
    auth.recordTotpChallenge();

    expect(auth.canRequestLoginOtp()).toBe(false);
  });

  it('stores no login OTP code', () => {
    const auth = new Auth(baseProps());

    auth.recordTotpChallenge();

    expect(auth.loginOtpCode).toBeUndefined();
  });

  it('canAttemptTotp is true below 5 attempts and false at 5', () => {
    const auth = new Auth(baseProps());
    for (let i = 0; i < 4; i++) auth.incrementLoginOtpAttempts();
    expect(auth.canAttemptTotp()).toBe(true);

    auth.incrementLoginOtpAttempts();
    expect(auth.canAttemptTotp()).toBe(false);
  });
});
