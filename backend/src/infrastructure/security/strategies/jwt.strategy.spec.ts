import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { JwtPayload } from '../types/jwt-payload.type';

describe('JwtStrategy.validate', () => {
  let strategy: JwtStrategy;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
    strategy = new JwtStrategy();
  });

  it('accepts a normal access payload', async () => {
    await expect(
      strategy.validate({ userId: 'u-1', email: 'a@b.co', role: 'ADMIN' } as JwtPayload),
    ).resolves.toMatchObject({ userId: 'u-1', role: 'ADMIN' });
  });

  it('rejects a two-factor challenge token', async () => {
    await expect(
      strategy.validate({
        authId: 'auth-1',
        method: 'EMAIL',
        purpose: '2fa-challenge',
      } as JwtPayload),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejects an email-verification token', async () => {
    await expect(
      strategy.validate({ email: 'a@b.co', purpose: 'email-verification' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejects a payload with a purpose even when it carries a userId', async () => {
    await expect(
      strategy.validate({ userId: 'u-1', email: 'a@b.co', purpose: '2fa-challenge' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejects a payload with no user id', async () => {
    await expect(strategy.validate({ email: 'a@b.co' })).rejects.toThrow(UnauthorizedException);
  });

  it('rejects a refresh-typed token', async () => {
    await expect(strategy.validate({ userId: 'u-1', type: 'refresh' })).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
