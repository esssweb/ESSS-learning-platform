import { ConfigService } from '@nestjs/config';
// `import * as crypto from 'crypto'` compiles (under this project's
// commonjs + esModuleInterop tsconfig) to TypeScript's __importStar helper,
// which copies properties onto a NEW object via non-configurable getters —
// jest.spyOn cannot redefine those, and even if it could, it would not be
// the same module object the implementation calls into. `import = require`
// compiles to a plain `require('crypto')`, returning Node's cached,
// configurable module object — the exact one `encryption.service.ts` uses.
import crypto = require('crypto');
import { randomBytes } from 'crypto';
import { AesEncryptionService } from './encryption.service';

const configWithKey = (key: string) =>
  ({
    get: (name: string) => (name === 'TOTP_ENCRYPTION_KEY' ? key : undefined),
  }) as unknown as ConfigService;

describe('AesEncryptionService', () => {
  const key = randomBytes(32).toString('base64');

  it('round-trips a secret', () => {
    const service = new AesEncryptionService(configWithKey(key));
    const cipher = service.encrypt('JBSWY3DPEHPK3PXP');

    expect(cipher).not.toContain('JBSWY3DPEHPK3PXP');
    expect(service.decrypt(cipher)).toBe('JBSWY3DPEHPK3PXP');
  });

  it('produces a different ciphertext each time', () => {
    const service = new AesEncryptionService(configWithKey(key));

    expect(service.encrypt('same')).not.toBe(service.encrypt('same'));
  });

  it('rejects a tampered ciphertext rather than returning garbage', () => {
    const service = new AesEncryptionService(configWithKey(key));
    const cipher = service.encrypt('JBSWY3DPEHPK3PXP');
    const tampered = `${cipher.slice(0, -2)}00`;

    expect(() => service.decrypt(tampered)).toThrow();
  });

  it('refuses to start with a key that is not 32 bytes', () => {
    expect(() => new AesEncryptionService(configWithKey('dG9vLXNob3J0'))).toThrow(/32 bytes/);
  });

  it('rejects a ciphertext whose auth tag has been truncated', () => {
    const service = new AesEncryptionService(configWithKey(key));
    const cipher = service.encrypt('JBSWY3DPEHPK3PXP');
    const [ivPart, tagPart, dataPart] = cipher.split('.');
    const truncatedTag = Buffer.from(tagPart, 'base64').subarray(0, 4).toString('base64');
    const truncated = [ivPart, truncatedTag, dataPart].join('.');

    expect(() => service.decrypt(truncated)).toThrow();
  });

  it('round-trips an empty string', () => {
    const service = new AesEncryptionService(configWithKey(key));

    expect(service.decrypt(service.encrypt(''))).toBe('');
  });

  it('rejects a ciphertext with extra components appended', () => {
    const service = new AesEncryptionService(configWithKey(key));
    const cipher = service.encrypt('JBSWY3DPEHPK3PXP');

    expect(() => service.decrypt(`${cipher}.GARBAGE`)).toThrow();
  });

  it('generates a fresh, full-length IV on every call', () => {
    const service = new AesEncryptionService(configWithKey(key));
    const ivs = Array.from({ length: 20 }, () => {
      const [ivPart] = service.encrypt('same').split('.');
      return Buffer.from(ivPart, 'base64');
    });

    ivs.forEach((iv) => expect(iv.length).toBe(12));

    const uniqueIvs = new Set(ivs.map((iv) => iv.toString('base64')));
    expect(uniqueIvs.size).toBe(ivs.length);
  });

  it('draws a fresh 12-byte IV from the CSPRNG for every encryption', () => {
    const service = new AesEncryptionService(configWithKey(key));
    const spy = jest.spyOn(crypto, 'randomBytes');
    try {
      service.encrypt('a');
      service.encrypt('a');
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenCalledWith(12);
    } finally {
      spy.mockRestore();
    }
  });
});
