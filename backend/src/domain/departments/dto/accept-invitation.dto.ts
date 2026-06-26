import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class InvitationDepartmentDto {
  @ApiProperty({ description: 'Id of user has invitation' })
  @IsUUID()
  @IsNotEmpty({ message: 'Id of user is required' })
  user_id: string;

  @ApiProperty({ description: 'Id of department in invitation' })
  @IsUUID()
  @IsNotEmpty({ message: 'Id of department is required' })
  dep_id: string;
}
