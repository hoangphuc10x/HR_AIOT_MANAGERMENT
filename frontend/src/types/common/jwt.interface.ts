import { RoleEnum } from '../../enums/role.enum';

export interface JwtPayload {
  userId: number;
  code: string;
  role: RoleEnum;
  expireAt: number;
}
