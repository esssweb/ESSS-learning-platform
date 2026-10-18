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

    // Challenge and email-verification tokens are signed with the same secret
    // but must never authenticate as a bearer token. Access tokens never carry
    // `purpose`, so its presence alone is disqualifying.
    if (payload.purpose !== undefined) {
      throw new UnauthorizedException('Invalid access token');
    }

    if (!(payload.userId ?? payload.sub)) {
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
