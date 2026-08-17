import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { AesEncryptionService } from './encryption.service';

const configWithKey = (key: string) =>
  ({ get: () => key }) as unknown as ConfigService;

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
    expect(() => new AesEncryptionService(configWithKey('dG9vLXNob3J0'))).toThrow(
      /32 bytes/,
    );
  });
});
