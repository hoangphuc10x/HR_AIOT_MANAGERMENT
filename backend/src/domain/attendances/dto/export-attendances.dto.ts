import {
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class ExportAttendanceDto {
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(3000)
  year: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isByDate?: boolean;

  @IsOptional()
  @IsString()
  code?: string;
}

export interface WideFormatRow {
  EmployeeCode: string;
  EmployeeName: string;
  Email: string;
  [key: string]: string | number | null; // For dynamic date columns
}

export interface AttendanceDetail {
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  workingHours: number;
}
