import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Email' })
  @ApiProperty({ example: 'hoangphuc123@gmail.com' })
  @IsString()
  @IsNotEmpty({ message: 'User name is required' })
  @Matches(/^(?:[a-zA-Z0-9._-]{6,255}|[^\s@]+@[^\s@]+\.[^\s@]+)$/, {
    message: 'Username must not contain spaces or accented characters',
  })
  email: string;

  @ApiProperty({ description: 'Password for the user account' })
  @ApiProperty({ example: 'hoangphuc123' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @Length(8, 225, { message: 'Password must be 8 to 255 characters long' })
  password: string;
}
