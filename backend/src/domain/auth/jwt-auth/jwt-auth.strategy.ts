import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy as JwtStrategyBase } from 'passport-jwt';
import { JwtPayload } from '../../../common/share/jwt-payload.interface';
import * as dotenv from 'dotenv';

dotenv.config();
@Injectable()
export class JwtStrategy extends PassportStrategy(JwtStrategyBase) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET as string,
    });
  }

  validate(payload: JwtPayload) {
    return {
      userid: payload.userId,
      role: payload.role,
      expireAt: payload.expireAt,
    };
  }
}
