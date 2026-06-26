import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../share/jwt-payload.interface';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const token = (request.cookies as { access_token?: string })?.access_token;
    if (!token) {
      throw new UnauthorizedException('Token not found in cookies');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      request['user'] = payload;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
