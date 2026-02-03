import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { PassportStrategy } from '@nestjs/passport';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthPayload } from '../types/api.dto';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret-change-in-prod',
    });
  }

  async validate(payload: AuthPayload) {
    return { userId: payload.sub };
  }
}
