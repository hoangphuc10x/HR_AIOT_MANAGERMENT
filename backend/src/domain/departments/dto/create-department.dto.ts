import { DepartmentLevelEnum } from '@/common/enums/department-level.enum';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({ description: 'Id of admin add department' })
  @IsNumber()
  @IsNotEmpty({ message: 'Id of admin is required' })
  userId: number;

  @ApiProperty({ description: 'Name of department' })
  @IsString()
  @IsNotEmpty({ message: 'Name of department is required' })
  departmentName: string;

  @ApiProperty({ description: 'Id of department head' })
  @IsNumber()
  @IsOptional()
  headDepartmentId: number;

  @ApiProperty({ description: 'Id of department deputy' })
  @IsNumber()
  @IsOptional()
  deputyDepartmentId: number;

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

  @ApiProperty({
    description: 'Array of user_id to add to department',
    type: [Number],
    example: [0, 1, 2, 3],
  })
  @IsNumber({}, { each: true })
  @IsOptional()
  listOfUserIdToAdd: number[];
}
