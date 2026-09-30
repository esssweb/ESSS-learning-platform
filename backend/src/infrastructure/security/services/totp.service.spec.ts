import { authenticator } from 'otplib';
import { OtplibTotpService } from './totp.service';

describe('OtplibTotpService', () => {
  const service = new OtplibTotpService();
  // Pinned mid-step so no test can straddle a 30s boundary.
  const PINNED_NOW = 1_800_000_015_000;
  const currentStep = Math.floor(PINNED_NOW / 1000 / 30);

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(PINNED_NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const codeForStep = (secret: string, step: number): string => {
    const saved = authenticator.options;
    try {
      authenticator.options = { ...saved, epoch: step * 30 * 1000 };
      return authenticator.generate(secret);
    } finally {
      authenticator.resetOptions();
      authenticator.options = saved;
    }
  };

  it('accepts a freshly generated code and reports its time-step', () => {
    const secret = service.generateSecret();
    const code = authenticator.generate(secret);

    const step = service.verify(secret, code);

    expect(step).toBe(currentStep);
  });

  it('reports the previous step for a code from the previous step', () => {
    const secret = service.generateSecret();

    expect(service.verify(secret, codeForStep(secret, currentStep - 1))).toBe(currentStep - 1);
  });

  it('reports the next step for a code from the next step', () => {
    const secret = service.generateSecret();

    expect(service.verify(secret, codeForStep(secret, currentStep + 1))).toBe(currentStep + 1);
  });

  it('rejects a code two steps away', () => {
    const secret = service.generateSecret();

    expect(service.verify(secret, codeForStep(secret, currentStep - 2))).toBeNull();
  });

  it('does not leak the probe epoch into later calls', () => {
    const secret = service.generateSecret();
    service.verify(secret, codeForStep(secret, currentStep - 1));

    expect(authenticator.options.epoch).toBeUndefined();
    expect(service.verify(secret, authenticator.generate(secret))).toBe(currentStep);
  });

  it('rejects an incorrect code', () => {
    const secret = service.generateSecret();

    expect(service.verify(secret, '000000')).toBeNull();
  });

  it('builds an otpauth URI carrying the issuer and account', () => {
    const uri = service.buildOtpauthUri('JBSWY3DPEHPK3PXP', 'admin@esss.local');

    expect(uri).toMatch(/^otpauth:\/\/totp\//);
    expect(uri).toContain('admin%40esss.local');
    expect(uri).toContain('secret=JBSWY3DPEHPK3PXP');
  });

  it('generates a distinct secret each call', () => {
    expect(service.generateSecret()).not.toBe(service.generateSecret());
  });
});
