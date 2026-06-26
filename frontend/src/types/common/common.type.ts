export type ChildrenReactNodeType = {
  children: React.ReactNode;
};

export type Employee = {
  no: number;
  id: number;
  email: string;
  identityNumber: string;
  phone: string;
  fullName: string;
  createdAt?: Date;
  roles?: number[];
  departments?: string[];
  avatarUrl?: string;
  sex?: number;
  status?: number;
  deletedAt?: Date;
  address?: string;
  dateOfBirth?: Date;
  updatedAt?: Date;
  bankAccount?: string;
  bankName?: string;
};

export type GetEmployeesResponse = {
  employees: Employee[];
  totalPages: number;
  limit: number;
  currentPage: number;
  roleData: RoleAndSexDict;
  totalUsers: number;
  totalFilteredUsers: number;
};

export type RoleAndSexDict = {
  STAFF?: number | undefined;
  ADMIN?: number | undefined;
  MALE?: number | undefined;
  FEMALE?: number | undefined;
};

// Enums
export enum RoleEnum {
  ADMIN = 1,
  STAFF = 2,
}

export enum SexEnum {
  MALE = 1,
  FEMALE = 2,
  OTHER = 3,
}

export enum StatusEnum {
  ACTIVE = 1,
  INACTIVE = 2,
}

export interface Department {
  id: string;
  departmentName: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
