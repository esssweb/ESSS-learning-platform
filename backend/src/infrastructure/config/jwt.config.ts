import { registerAs } from '@nestjs/config';

export interface JwtConfig {
  accessTokenSecret: string;
  accessTokenExpiresIn: string;
  refreshTokenSecret: string;
  refreshTokenExpiresIn: string;
}

export default registerAs(
  'jwt',
  (): JwtConfig => ({
    accessTokenSecret: process.env.JWT_SECRET || '',
    accessTokenExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || '',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  }),
);
