import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsDateString,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SexEnum } from 'src/common/enums/sex.enum';
import { UserStatus } from 'src/common/enums/user-status.enum';

export class UpdateUserDto {
  @ApiProperty({ description: 'Username of the user', required: false })
  @IsString()
  @IsOptional()
  userName?: string;

  @ApiProperty({ description: 'Full name of the user', required: false })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({ description: 'Email address of the user', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Phone number of the user', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: 'Anna123',
    description: 'Password must be 8 to 255 characters long',
    required: false,
  })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({
    description: 'Roles of the user',
    type: String,
    isArray: true,
  })
  @IsArray()
  roles: number[];

  @ApiProperty({
    description: 'List of department names',
    type: String,
    isArray: true,
  })
  @IsArray()
  @IsString({ each: true })
  departments: string[];

  @ApiProperty({
    example: 1,
    enum: SexEnum,
    description: '1: MALE, 2: FEMALE, 3: OTHER',
    required: false,
  })
  @IsEnum(SexEnum, {
    message: 'Invalid sex value (1: MALE, 2: FEMALE, 3: OTHER)',
  })
  @IsOptional()
  sex?: SexEnum;

  @ApiProperty({
    example: '1990-01-15T00:00:00Z',
    description: 'Date of birth in ISO format',
    required: false,
  })
  @IsDateString({}, { message: 'Date of birth must be a valid ISO date' })
  @IsOptional()
  dateOfBirth?: string;

  @ApiProperty({ description: 'Avatar URL of the user', required: false })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty({ description: 'Identity card number', required: false })
  @IsString()
  @IsOptional()
  identityNumber?: string;

  @ApiProperty({
    description: 'Address of residence',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ description: 'Is the user active?', required: false })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: number;
}
