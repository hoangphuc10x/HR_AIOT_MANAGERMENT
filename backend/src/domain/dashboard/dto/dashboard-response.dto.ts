import { ApiProperty } from '@nestjs/swagger';

export class DepartmentStatsResponseDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  absences: number;

  @ApiProperty()
  employees: number;

  @ApiProperty()
  rate?: number;
}

export class TopAbsentEmployeesResponseDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  department: string;

  @ApiProperty()
  absences: number;

  @ApiProperty()
  position: string;

  @ApiProperty()
  userId: number;
}

export class MonthlyAbsencesResponseDto {
  @ApiProperty()
  month: string;

  @ApiProperty()
  monthNumber: number;

  @ApiProperty()
  absences: number;

  @ApiProperty()
  workDays: number;
}

export class DashboardOverviewResponseDto {
  @ApiProperty()
  totalEmployees: number;

  @ApiProperty()
  absentToday: number;

  @ApiProperty()
  absentThisMonth: number;

  @ApiProperty()
  averageAbsenceRate: number;
}
