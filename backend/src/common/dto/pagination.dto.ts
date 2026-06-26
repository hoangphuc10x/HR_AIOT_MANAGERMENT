import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { RoleEnum } from '../enums/role.enum';
import { SexEnum } from '../enums/sex.enum';
import { UserStatus } from '../enums/user-status.enum';
import { DepartmentStatus } from '../enums/department-status.enum';

export class PaginationDto {
  @ApiProperty({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page: number = 1;

  @ApiProperty({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit: number = 10;

  @IsOptional()
  @IsEnum(RoleEnum)
  @Transform(({ value }) => Number(value))
  role?: RoleEnum;

  @IsOptional()
  @IsEnum(SexEnum)
  @Transform(({ value }) => Number(value))
  sex?: SexEnum;

  @IsOptional()
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((v) => Number(v))
      : String(value)
          .split(',')
          .map((v) => Number(v.trim())),
  )
  @IsNumber({}, { each: true })
  departmentIds?: number[];

  @IsOptional()
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((v) => Number(v))
      : String(value)
          .split(',')
          .map((v) => Number(v.trim())),
  )
  @IsEnum(UserStatus, { each: true })
  status?: UserStatus[];

  @IsOptional()
  @Transform(({ value }) => Number(value))
  minAge?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  maxAge?: number;

  @IsOptional()
  keyword?: string;

  @IsOptional()
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((v) => Number(v))
      : String(value)
          .split(',')
          .map((v) => Number(v.trim())),
  )
  @IsEnum(DepartmentStatus, { each: true })
  depStatus?: DepartmentStatus;
}
