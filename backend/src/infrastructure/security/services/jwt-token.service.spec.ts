import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { JwtTokenService } from './jwt-token.service';

const config = {
  get: (key: string) =>
    ({
      JWT_SECRET: 'access-secret',
      JWT_EXPIRES_IN: '15m',
      REFRESH_TOKEN_SECRET: 'refresh-secret',
      REFRESH_TOKEN_EXPIRES_IN: '7d',
    })[key],
} as unknown as ConfigService;

describe('JwtTokenService two-factor challenge tokens', () => {
  const service = new JwtTokenService(config);

  it('round-trips a challenge payload', () => {
    const token = service.generateTwoFactorChallengeToken({
      authId: 'auth-1',
      method: 'EMAIL',
    });

    expect(service.verifyTwoFactorChallengeToken(token)).toMatchObject({
      authId: 'auth-1',
      method: 'EMAIL',
    });
  });

  it('refuses a token issued for a different purpose', () => {
    const verification = service.generateVerificationToken({ email: 'a@b.co' });

    expect(() => service.verifyTwoFactorChallengeToken(verification)).toThrow();
  });

  it('refuses an access token as a challenge', () => {
    const access = service.generateAccessToken({
      userId: 'u-1',
      email: 'a@b.co',
      role: 'ADMIN',
    });

    expect(() => service.verifyTwoFactorChallengeToken(access)).toThrow();
  });

  it('signs the challenge with the 2fa-challenge purpose claim', () => {
    const token = service.generateTwoFactorChallengeToken({
      authId: 'auth-1',
      method: 'EMAIL',
    });

    expect(jwt.decode(token)).toMatchObject({ purpose: '2fa-challenge' });
  });
});
