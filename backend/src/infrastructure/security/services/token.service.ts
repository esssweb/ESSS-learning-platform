import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ITokenService } from '../../../core/domain/repositories/token-service.interface';

@Injectable()
export class TokenService implements ITokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generateAccessToken(payload: Record<string, unknown>): Promise<string> {
    return this.jwtService.signAsync(
      {
        ...payload,
        type: 'access',
      },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
      },
    );
  }

  async generateRefreshToken(payload: Record<string, unknown>): Promise<string> {
    return this.jwtService.signAsync(
      {
        ...payload,
        type: 'refresh',
      },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      },
    );
  }

  async verifyToken<T extends object= Record<string, unknown>>(
    token: string,
    type: 'access' | 'refresh',
  ): Promise<T> {
    try {
      const secret =
        type === 'access' ? process.env.JWT_ACCESS_SECRET : process.env.JWT_REFRESH_SECRET;

      return await this.jwtService.verifyAsync<T>(token, { secret });
    } catch {
      throw new UnauthorizedException(`Invalid or expired ${type} token`);
    }
  }

  decodeToken<T = Record<string, unknown>>(token: string): T | null {
    return this.jwtService.decode(token) as T | null;
  }
}
