import { IsInt, IsArray, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDepartmentPermissionDto {
  @ApiProperty({ description: 'ID of the user' })
  @IsInt()
  @Min(1)
  userId: number;

  @ApiProperty({ description: 'ID of the department' })
  @IsInt()
  @Min(1)
  departmentId: number;

  @ApiProperty({ description: 'List of department permission IDs' })
  @IsArray()
  @IsInt({ each: true })
  listOfUserDepartmentPermissionId: number[];
}
