import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserDepartmentSearchDto {
  @ApiProperty({
    description: 'User ID',
    example: '123',
  })
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    description: 'Department name to search',
    example: 'Anna',
  })
  @IsString()
  departmentName: string;
}
