import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type && payload.type !== 'access') {
      throw new UnauthorizedException('Invalid access token');
    }

    return {
      id: payload.userId ?? payload.sub,
      userId: payload.userId ?? payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
