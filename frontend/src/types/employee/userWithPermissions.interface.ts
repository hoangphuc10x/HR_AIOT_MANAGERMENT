import { DepartmentPermissionEnum } from '@/enums/department-permission.enum';
import { PermissionEnum } from '@/enums/permission.enum';

export interface UserWithPermissions {
  id: number;
  fullName: string;
  email: string;
  permissionCount: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data: UserWithPermissions[];
}

export interface PermissionGroup {
  title: string;
  icon: React.ReactNode;
  permissions: {
    id: PermissionEnum;
    name: string;
    description?: string;
  }[];
}

export interface UserDepartmentPermissionGroup {
  title: string;
  icon: React.ReactNode;
  permissions: {
    id: DepartmentPermissionEnum;
    name: string;
    description?: string;
  }[];
}
