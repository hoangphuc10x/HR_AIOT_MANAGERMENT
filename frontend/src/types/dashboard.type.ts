import { TooltipProps } from 'recharts';

// Custom tooltip component props
export interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    dataKey: string;
    color: string;
  }>;
  label?: string;
}

// Type definitions for API responses
export interface OverviewData {
  totalEmployees: number;
  absentToday: number;
  absentThisMonth: number;
  averageAbsenceRate: number;
}

export interface DepartmentStats {
  name: string;
  employees: number;
  absences: number;
}

// interface DepartmentWithRate extends DepartmentStats {
//   rate: string;
// }

export interface TopAbsentEmployee {
  userId: string;
  name: string;
  department: string;
  position: string;
  absences: number;
}

export interface MonthlyAbsence {
  month: string;
  absences: number;
  workDays: number;
}

export interface ApiResponse<T> {
  data: T;
  success?: boolean;
  message?: string;
}

// Props for icon components
export interface IconProps {
  className?: string;
}

export type ChartDataInput = Record<string, string | number>;

export type DepartmentWithRate = ChartDataInput &
  DepartmentStats & {
    name: string;
    absences: number;
    rate: number;
  };
