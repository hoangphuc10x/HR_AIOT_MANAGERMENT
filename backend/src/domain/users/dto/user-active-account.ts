import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserActiveAccountDto {
  @ApiProperty({ example: 'mbxvmn,zxbcv,' })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({ example: 'hoangphuc123' })
  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @ApiProperty({ example: 'hoangphuc123@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
