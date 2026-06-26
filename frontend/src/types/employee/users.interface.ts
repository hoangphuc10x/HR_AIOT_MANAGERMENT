import { RoleEnum } from '@/enums/role.enum';
import { SexEnum } from '@/enums/sex.enum';
import { UserStatus } from '@/enums/user-status.enum';
import { PermissionEnum } from '@/enums/permission.enum';

export interface User {
  userId: number;
  fullName: string;
  identityNumber: string;
  phone: string;
  email: string;
  dateOfBirth?: Date;
  address?: string;
  roles: RoleEnum[];
  avatarUrl?: string;
  sex: SexEnum;
  status: UserStatus;
  position?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  departments?: string[];
  userPermissions?: PermissionEnum[];
  bankAccount?: string;
  bankName?: string;
}

export interface EmployeeQueryParams {
  limit: number;
  page: number;
  keyword?: string;
  role?: number | null;
  sex?: number | null;
  status?: UserStatus[];
  departmentIds?: number[];
}

export interface ApiErrorResponse {
  message: string | Record<string, string>;
  statusCode: number;
  success: boolean;
  timeStamp: string;
}

export interface ChangePasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
