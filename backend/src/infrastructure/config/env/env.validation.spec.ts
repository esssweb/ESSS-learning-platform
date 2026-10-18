import 'reflect-metadata';
import { validateEnvironment } from './env.validation';

describe('validateEnvironment', () => {
  const valid = () => ({
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    DB_USERNAME: 'u',
    DB_PASSWORD: 'p',
    DB_DATABASE: 'd',
    JWT_SECRET: 'access-secret',
    JWT_EXPIRES_IN: '15m',
    REFRESH_TOKEN_SECRET: 'refresh-secret',
    REFRESH_TOKEN_EXPIRES_IN: '7d',
    TOTP_ENCRYPTION_KEY: 'key',
  });

  it('accepts a valid configuration', () => {
    expect(() => validateEnvironment(valid())).not.toThrow();
  });

  it('rejects identical access and refresh secrets', () => {
    expect(() =>
      validateEnvironment({ ...valid(), REFRESH_TOKEN_SECRET: 'access-secret' }),
    ).toThrow('REFRESH_TOKEN_SECRET must differ from JWT_SECRET');
  });

  it('accepts DB_SSL true/false and rejects anything else', () => {
    expect(() => validateEnvironment({ ...valid(), DB_SSL: 'true' })).not.toThrow();
    expect(() => validateEnvironment({ ...valid(), DB_SSL: 'false' })).not.toThrow();
    expect(() => validateEnvironment({ ...valid(), DB_SSL: 'yes' })).toThrow();
  });
});
