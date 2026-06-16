import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import {
  TokenPayload,
  TokenServiceInterface,
} from '../../../core/application/ports/output/token.service.interface';

@Injectable()
export class JwtTokenService implements TokenServiceInterface {
  private readonly accessTokenSecret: string;
  private readonly accessTokenExpiresIn: string;
  private readonly refreshTokenSecret: string;
  private readonly refreshTokenExpiresIn: string;

  constructor(private readonly configService: ConfigService) {
    this.accessTokenSecret = this.configService.get<string>('JWT_SECRET') || '';
    this.accessTokenExpiresIn =
      this.configService.get<string>('JWT_EXPIRES_IN') || '15m';
    this.refreshTokenSecret =
      this.configService.get<string>('REFRESH_TOKEN_SECRET') || '';
    this.refreshTokenExpiresIn =
      this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN') || '7d';
  }

  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiresIn,
    });
  }

  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiresIn,
    });
  }

  verifyAccessToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, this.accessTokenSecret) as jwt.JwtPayload;
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
  }

  verifyRefreshToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, this.refreshTokenSecret) as jwt.JwtPayload;
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
  }

  generateVerificationToken(payload: { email: string }): string {
    return jwt.sign(
      { email: payload.email, purpose: 'email-verification' },
      this.accessTokenSecret,
      { expiresIn: '30m' },
    );
  }

  verifyVerificationToken(token: string): { email: string } {
    const decoded = jwt.verify(token, this.accessTokenSecret) as jwt.JwtPayload;
    if (decoded.purpose !== 'email-verification') {
      throw new Error('Invalid verification token');
    }
    return { email: decoded.email };
  }
}
