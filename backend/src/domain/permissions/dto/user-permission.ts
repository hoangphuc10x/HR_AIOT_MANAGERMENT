import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateUserPermissionDto {
  @ApiProperty({ description: 'Id of admin' })
  @IsNotEmpty({ message: 'Id of admin is required' })
  @IsNumber()
  adminId: number;

  @ApiProperty({ description: 'Id of new head department' })
  @IsNotEmpty({ message: 'user id is required' })
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: 'List of new head department permission',
    type: [Number],
  })
  @IsNumber({}, { each: true })
  @ArrayNotEmpty({ message: 'list of permission id is required' })
  listOfUserPermissionId: number[];
}
