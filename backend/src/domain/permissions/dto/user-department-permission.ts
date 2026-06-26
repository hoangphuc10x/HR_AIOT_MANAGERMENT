import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UserDepartmentPermissionDto {
  @ApiProperty({ description: 'Id of new head department' })
  @IsNotEmpty({ message: 'user id is required' })
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: 'List of new head department permission',
  })
  @IsNotEmpty({ message: 'department id is required' })
  @IsNumber({}, { each: true })
  departmentId: number;
}
