import { DepartmentLevelEnum } from '@/common/enums/department-level.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { DepartmentStatus } from 'src/common/enums/department-status.enum';

class UpdateEmployeePermissionDto {
  @ApiProperty({ description: 'Id of new head department' })
  @IsNumber()
  employeeId: number;

  @ApiProperty({
    description: 'List of new head department permission',
    type: [Number],
  })
  @IsNumber({}, { each: true })
  listOfEmployeePermissionId: number[];
}

export class UpdateDepartmentDto {
  @ApiProperty({ description: 'Id of admin add department' })
  @IsNumber()
  @IsNotEmpty({ message: 'Id of admin is required' })
  userId: number;

  @ApiProperty({ description: 'Id of department' })
  @IsNumber()
  @IsNotEmpty({ message: 'Id of department is required' })
  departmentId: number;

  @ApiProperty({ description: 'New name of department' })
  @IsString()
  @IsOptional()
  newDepartmentName: string;

  @ApiProperty({
    example: 1,
    enum: DepartmentStatus,
    description: '1: ACTIVE, 2: INACTIVE',
  })
  @IsEnum(DepartmentStatus, {
    message: 'Invalid department status value (1: ACTIVE, 2: INACTIVE)',
  })
  @IsOptional()
  status: DepartmentStatus;

  @ApiProperty({
    example: 1,
    enum: DepartmentLevelEnum,
    description: '1: LEVEL_1, 2: LEVEL_2,3: LEVEL_3,4: LEVEL_4',
  })
  @IsEnum(DepartmentLevelEnum, {
    message: 'Invalid department level value',
  })
  @IsOptional()
  level: DepartmentLevelEnum;

  @ApiProperty({ description: 'Id of new head department' })
  @IsNumber()
  @IsOptional()
  newHeadDepartmentId: number;

  @ApiProperty({
    description: 'List of new head department permission',
    type: [Number],
  })
  @IsNumber({}, { each: true })
  @IsOptional()
  listOfHeadPermissionId: number[];

  @ApiProperty({ description: 'Id of new deputy department' })
  @IsNumber()
  @IsOptional()
  newDeputyDepartmentId: number;

  @ApiProperty({
    description: 'List of new deputy department permission',
    type: [Number],
  })
  @IsNumber({}, { each: true })
  @IsOptional()
  listOfDeputyPermissionId: number[];

  @ApiProperty({
    description: 'List of user to add to department',
    type: [Number],
  })
  @IsNumber({}, { each: true })
  @IsOptional()
  listOfUserIdToAdd: number[];

  @ApiProperty({
    description: 'Update permission for employee in department',
    type: [UpdateEmployeePermissionDto],
  })
  @ValidateNested({ each: true })
  @Type(() => UpdateEmployeePermissionDto)
  @IsOptional()
  employeePermissions: UpdateEmployeePermissionDto[];
}
