import { DepartmentStatus } from '@/enums/department-status.enum';

export interface Department {
  id: number;
  departmentName: string;
  depHead: string;
  headDepartmentId: number;
  empNumber: number;
  status: number;
  permissions: [1, 2, 3, 4];
}

export interface PaginateProps {
  totalPages: number;
  page: number;
  setPage: (page: number) => void;
}

export interface DepListData {
  items: Department[];
  total: number;
  totalFilteredDepartments: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DepOverview {
  totalDepartment: number;
  totalActive: number;
  totalInactive: number;
  totalEmployee: number;
  totalDeleted: number;
}

export interface DepartmentUpdatePayload {
  user_id: number | string;
  dep_id?: number;
  departmentName?: string;
  headDepartment?: number;
  listOfNewUserId?: number[];
  listOfPermissionId?: number[];
  status?: number;
}
export interface DepartmentQueryParams {
  limit: number;
  page: number;
  keyword?: string;
  depStatus?: DepartmentStatus;
}

export interface departmentDelete {
  id: number;
  departmentName: string;
  level: number;
  status: DepartmentStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
