import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RoleEnum } from '../../../common/enums/role.enum';

export class JwtDto {
  @ApiProperty({ description: 'Unique ID of the user' })
  userId: number;

  @ApiProperty({ description: 'Code of user' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'FullName of the user' })
  @IsString()
  fullName: string;

  @ApiProperty({
    description: 'Roles of the user',
    enum: RoleEnum,
    isArray: true,
  })
  @IsEnum(RoleEnum, { each: true }) // important: validate each item is RoleEnum
  roles: RoleEnum[];

  @ApiProperty({ description: 'Updated date' })
  expireAt: Date;
}
