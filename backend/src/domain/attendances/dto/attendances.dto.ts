// dto/update-attendance.dto.ts
import { IsDateString, IsOptional } from 'class-validator';

export class UpdateAttendanceDto {
  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @IsOptional()
  @IsDateString()
  checkOut?: string;
}

export interface AttendanceMonthSummary {
  user_id: number;
  full_name: string;
  email: string;
  code: string;

  total_on_time: number;
  total_late: number;
  total_leave_early: number;
  total_absent: number;
  total_on_leave: number;
  total_late_and_leave_early: number;
}

export interface EmployeeInfo {
  code: string;
  name: string;
  email: string;
  phone: string;
}

export interface AttendanceRecord {
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  workingHours: string;
}

export interface ApproverInfo {
  id: number;
  fullName: string | null;
  email: string | null;
}

export interface OnLeaveInfo {
  id: number;
  type: string | null;
  startDate: string | null;
  endDate: string | null;
  reason: string | null;
  status: string | null;
  approvedBy: ApproverInfo | null;
}

export interface AttendanceDetailResponse {
  employee: EmployeeInfo;
  attendance: AttendanceRecord;
  onLeave?: OnLeaveInfo; // optional
}

export interface AttendanceDetailResult {
  code: string;
  full_name: string;
  email: string;
  phone: string;

  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: number;

  leaveRequestId: number | null;
  leaveType: string | null;
  leaveStartDate: string | Date | null;
  leaveEndDate: string | Date | null;
  leaveReason: string | null;
  leaveStatus: string | null;

  approverId: number | null;
  approverFullName: string | null;
  approverEmail: string | null;
}
