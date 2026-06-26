import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PeriodEnum {
  THREE_MONTHS = '3months',
  SIX_MONTHS = '6months',
  YEAR = 'year',
}

export class GetDepartmentStatsDto {
  @ApiProperty({
    enum: PeriodEnum,
    default: PeriodEnum.YEAR,
    description: 'Time period for statistics',
  })
  @IsOptional()
  @IsEnum(PeriodEnum)
  period?: PeriodEnum = PeriodEnum.YEAR;
}
