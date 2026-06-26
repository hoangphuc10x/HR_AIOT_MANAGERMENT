import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteUserFromDepartmentDto {
  @ApiProperty({ example: 'mbxvmn,zxbcv,' })
  @IsString()
  @IsNotEmpty({ message: 'Invalid user ID format' })
  userId: string;

  @ApiProperty({ example: 'hoangphuc123' })
  @IsString()
  @IsNotEmpty({ message: 'Invalid old password format' })
  departmentId: string;
}
