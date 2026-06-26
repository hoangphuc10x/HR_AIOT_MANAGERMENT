import { RoleEnum } from 'src/common/enums/role.enum';
import { Request } from 'express';

export interface JwtPayload {
  userId: number;
  role: RoleEnum[];
  expireAt: Date;
  code: string;
}

export interface AuthJwtRequest extends Request {
  user: JwtPayload;
}
