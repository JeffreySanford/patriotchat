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
    console.log('[JWT Strategy] Token validation:', {
      userId: payload.sub,
      issuedAt: new Date(payload.iat * 1000),
      expiresAt: new Date(payload.exp * 1000),
      now: new Date(),
      isExpired: Date.now() > payload.exp * 1000,
    });
    return { userId: payload.sub };
  }
}
