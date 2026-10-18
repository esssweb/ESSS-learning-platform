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

  // Generates with a private clone and an explicit epoch, never touching the global.
  const codeForStep = (secret: string, step: number): string => {
    const totp = authenticator.clone();
    totp.options = { step: 30, window: 1, epoch: step * 30 * 1000 };
    return totp.generate(secret);
  };

  it('accepts a freshly generated code and reports its time-step', () => {
    const secret = service.generateSecret();
    const code = codeForStep(secret, currentStep);

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

  it('does not touch the global authenticator options', () => {
    const before = { ...authenticator.options };
    const secret = service.generateSecret();
    service.verify(secret, codeForStep(secret, currentStep - 1));
    service.buildOtpauthUri(secret, 'a@b.c');

    expect(authenticator.options).toEqual(before);
    expect('epoch' in authenticator.options).toBe(false);
    expect(service.verify(secret, codeForStep(secret, currentStep))).toBe(currentStep);
  });

  it('rejects non-numeric and wrong-length codes', () => {
    const secret = service.generateSecret();

    for (const bad of ['abcdef', '12345', '1234567', '', '12 456']) {
      expect(service.verify(secret, bad)).toBeNull();
    }
  });

  it('reads the clock once: a boundary crossed mid-verify still reports the right step', () => {
    const secret = service.generateSecret();
    const stepS = currentStep;
    const t1 = (stepS + 1) * 30 * 1000 - 1; // last ms of step S
    const t2 = (stepS + 1) * 30 * 1000; // first ms of step S+1
    const code = codeForStep(secret, stepS - 1);

    let calls = 0;
    const spy = jest.spyOn(Date, 'now').mockImplementation(() => (++calls === 1 ? t1 : t2));
    try {
      expect(service.verify(secret, code)).toBe(stepS - 1);
    } finally {
      spy.mockRestore();
    }
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
