import { RoleEnum } from '@/enums/role.enum';
import { SexEnum } from '@/enums/sex.enum';
import { UserStatus } from '@/enums/user-status.enum';

export interface CreateUserInterface {
  fullName: string;
  identityNumber: string;
  address: string;
  email: string;
  phone: string;
  sex: SexEnum;
  dateOfBirth: string;
  userRoles: RoleEnum;
  status: UserStatus;
  avatarUrl?: string;
  bankAccount?: string;
  bankName?: string;
  userPermissions: number[];
}
