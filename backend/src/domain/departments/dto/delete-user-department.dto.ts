import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteUserDepartmentDto {
  @ApiProperty({ description: 'Id of actor action' })
  @IsNumber()
  @IsNotEmpty({ message: 'Id of actor action is required' })
  user_actor_id: number;

  @ApiProperty({ description: 'Id of admin add department' })
  @IsNumber()
  @IsNotEmpty({ message: 'Id of admin is required' })
  user_id: number;

  @ApiProperty({ description: 'Id of department need to soft delete' })
  @IsNumber()
  @IsNotEmpty({ message: 'Id of department is required' })
  dep_id: number;
}
