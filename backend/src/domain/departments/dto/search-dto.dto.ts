import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SearchDepartmentDto {
  @ApiProperty({ description: 'Department name' })
  @IsString()
  depName: string;
  @ApiProperty({ description: 'number of page' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page: number;
}
