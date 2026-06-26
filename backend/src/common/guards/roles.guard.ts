import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY } from '../decorators/roles.decorator';
import { RoleEnum } from '../enums/role.enum';
import { Request } from 'express';
import { JwtPayload } from 'src/common/share/jwt-payload.interface';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requireRole = this.reflector.getAllAndOverride<RoleEnum[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requireRole) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>() as Request & {
      user: JwtPayload;
    };
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    if (!user.role.some((r) => requireRole.includes(r))) {
      throw new ForbiddenException(`Access denied for role ${user.role}`);
    }

    return true;
  }
}
