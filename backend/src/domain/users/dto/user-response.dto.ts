import { IsArray, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({ description: 'Unique ID of the user' })
  @IsString()
  userId: number;

  @ApiProperty({ description: 'FullName of the user' })
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'Identity Number of the user' })
  @IsString()
  identityNumber: string;

  @ApiProperty({ description: 'Phone number of the user' })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Date of birth of the user' })
  dateOfBirth: Date;

  @ApiProperty({ description: 'Address of the user' })
  @IsString()
  address: string;

  @ApiProperty({ description: 'Email address of the user' })
  @IsString()
  email: string;

  @ApiProperty({
    description: 'Roles of the user',
    type: String,
    isArray: true,
  })
  @IsArray()
  @IsString({ each: true })
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
    description: 'List of user permission',
    type: String,
    isArray: true,
  })
  @IsArray()
  userPermissions: number[];

  @ApiProperty({ description: 'Avatar URL of the user', required: false })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty({
    description: 'Sex of the user (1: Male, 2: Female, 3: Other)',
  })
  sex: number;

  @ApiProperty({
    description: 'Status of the user (1: Active, 2: Inactive, 3: Suspended)',
  })
  status: number;

  @ApiProperty({ description: 'Bank account of the user' })
  bankAccount: string;

  @ApiProperty({ description: `Bank's name of the user` })
  bankName: string;

  @ApiProperty({ description: 'Created date' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated date' })
  updatedAt: Date;

  @ApiProperty({ description: 'Deleted date', required: false })
  @IsOptional()
  deletedAt?: Date | null;

  static fromEntity(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.userId = user.id;
    dto.fullName = user.fullName;
    dto.phone = user.phone;
    dto.dateOfBirth = user.dateOfBirth;
    dto.address = user.address;
    dto.email = user.email;
    dto.identityNumber = user.identityNumber;
    dto.roles = user.userRoles?.map((ur) => ur.role.name) || [];
    dto.departments =
      user.userDepartments?.map((ud) => ud.department.departmentName) || [];
    dto.userPermissions =
      user.userPermissions?.map((up) => up.permission.action) || [];
    dto.bankAccount = user.bankAccount;
    dto.bankName = user.bankName;
    dto.avatarUrl = user.avatarUrl;
    dto.sex = user.sex;
    dto.status = user.status;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}
