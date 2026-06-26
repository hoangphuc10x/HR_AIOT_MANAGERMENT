export interface AttendanceSummary {
  user_id: number;
  full_name: string;
  code: string;
  email: string;
  total_on_time: string;
  total_late: string;
  total_leave_early: string;
  total_absent: string;
  total_on_leave: string;
  total_late_and_leave_early: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data: AttendanceSummary[];
  statusCode: number;
  timeStamp: string;
}

export interface EmployeeAttendance {
  id: number;
  name: string;
  email: string;
  avatar: string;
  code: string;
  attendanceSummary?: AttendanceSummary;
}

export interface EmployeeAttendanceDetail {
  code: string;
  name: string;
}

export interface attendanceDetailData {
  code: string;
  full_name: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: string;
}

export interface AttendanceCalendarParam {
  employee: EmployeeAttendanceDetail;
  attendanceData: attendanceDetailData[];
  onBack: () => void;
  month?: number;
  year?: number;
}

export interface Employee {
  code: string;
  name: string;
  email: string;
  phone: string;
}

interface Attendance {
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  workingHours: number;
}

interface ApprovedBy {
  id: number;
  fullName: string;
  email: string;
}

interface OnLeave {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  approvedBy: ApprovedBy;
}

export interface AttendanceRecord {
  employee: Employee;
  attendance: Attendance;
  onLeave: OnLeave | null;
}

export interface AttendanceData {
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  workingHours: number;
}

export interface TodayAttendance {
  checkIn: string | null;
  checkOut: string | null;
  workingHours: number;
  status: 'not_started' | 'working' | 'completed';
  isCheckedIn: boolean;
}
