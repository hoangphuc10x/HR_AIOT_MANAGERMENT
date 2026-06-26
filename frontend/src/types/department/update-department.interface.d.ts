// Define interface for department staff
export interface Employee {
  employeeId: number;
  fullName: string;
  position: number; // 1: Head, 2: Deputy, 3: Member
}

// Define export interface for department
export interface Department {
  departmentId: number;
  departmentName: string;
  status: number;
  level: number;
  employee: Employee[];
}

// Define export interface for API send payload
export interface UpdateDepartmentPayload {
  userId: number | null;
  departmentId: number;
  newDepartmentName?: string;
  newHeadDepartmentId?: number;
  newDeputyDepartmentId?: number;
  listOfUserIdToAdd?: number[];
  level?: number;
  status?: number;
}

export interface UserDepartment {
  id: number;
  departmentName: string;
  level: number;
  status: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}
