import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.REFRESH_TOKEN_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type && payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return {
      id: payload.userId ?? payload.sub,
      userId: payload.userId ?? payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
