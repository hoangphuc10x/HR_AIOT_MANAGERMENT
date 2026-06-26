import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GetEmpInDepDto {
  @ApiProperty({ description: 'Department Id' })
  @IsNotEmpty({ message: 'Department Id is required' })
  dep_id: number;
}
