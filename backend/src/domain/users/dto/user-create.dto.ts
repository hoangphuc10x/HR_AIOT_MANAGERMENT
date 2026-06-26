import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsOptional,
  IsDateString,
  Length,
  Matches,
  IsArray,
  IsInt,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RoleEnum } from '../../../common/enums/role.enum';
import { SexEnum } from 'src/common/enums/sex.enum';
import { UserStatus } from 'src/common/enums/user-status.enum';

export class CreateUserDto {
  @ApiProperty({ description: 'Full name of the user' })
  @IsNotEmpty({ message: 'Username should not be empty' })
  @Length(2, 255, { message: 'Username must be between 2 and 255 characters' })
  @IsString()
  fullName: string;

  @ApiProperty({
    example: '045211233652',
    description: 'Identity Number must be 12 number',
  })
  @IsString({ message: 'Identity number must be a number string' })
  @Length(12, 12, { message: 'Identity number must be exactly 12 characters' })
  @Matches(/^\d{12}$/, { message: 'Identity number must contain only digits' })
  identityNumber: string;

  @ApiProperty({ description: 'Current Address' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'phuc1092003@gmail.com' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({ example: '0329526357' })
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^\d{10}$/, {
    message: 'Phone number must be 10 digits',
  })
  phone: string;

  @ApiProperty({
    example: 1,
    enum: SexEnum,
    description: '1: MALE, 2: FEMALE, 3: OTHER',
  })
  @IsEnum(SexEnum, {
    message: 'Invalid sex value (1: MALE, 2: FEMALE, 3: OTHER)',
  })
  sex: SexEnum;

  @ApiProperty({ example: '1990-01-15T00:00:00Z' })
  @IsDateString({}, { message: 'Date of birth must be a valid ISO date' })
  dateOfBirth: Date;

  @ApiProperty({
    example: 4,
    enum: RoleEnum,
    description: '1: ADMIN, 2: HR, 3: HEAD_DEPARTMENT, 4: STAFF',
  })
  @IsEnum(RoleEnum, {
    message: 'Invalid role value (1: ADMIN, 2: STAFF)',
  })
  userRoles: RoleEnum;

  @ApiProperty({
    example: 1,
    enum: UserStatus,
    description: '1: ACTIVE, 2: INACTIVE, 3: SUSPENDED',
  })
  @IsEnum(UserStatus, {
    message: 'Invalid status value (1: ACTIVE, 2: INACTIVE, 3: SUSPENDED)',
  })
  status: UserStatus;

  @IsOptional()
  @ApiProperty({ example: 'https://example.com/avatar/john.png' })
  avatarUrl?: string;

  @IsOptional()
  @ApiProperty({ example: '123456789012' })
  bankAccount?: string;

  @IsOptional()
  @ApiProperty({ example: 'ACB' })
  bankName?: string;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  userPermissions?: number[];
}
