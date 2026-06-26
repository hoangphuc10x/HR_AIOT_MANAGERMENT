import { LeaveType } from '@/common/enums/leave-type.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsEnum,
  IsDate,
  IsString,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  Validate,
  IsNumber,
} from 'class-validator';

@ValidatorConstraint({ name: 'DateRangeValidator', async: false })
class DateRangeValidator implements ValidatorConstraintInterface {
  validate(endDate: Date, args: ValidationArguments) {
    const obj: any = args.object;
    return endDate >= obj.startDate;
  }

  defaultMessage() {
    return 'endDate must be greater than or equal to startDate';
  }
}
export class CreateLeaveRequestDto {
  @ApiProperty({ description: 'Id of user send leave request' })
  @IsNumber()
  @IsNotEmpty({ message: 'Id of sender is required' })
  userId: number;

  @ApiProperty({
    example: 1,
    enum: LeaveType,
    description: '1: ANNUAL, 2: SICK, 3:UNPAID,4:OTHER',
  })
  @IsEnum(LeaveType, {
    message: 'Invalid leave type status ',
  })
  leaveType: LeaveType;

  @ApiProperty({ description: 'reason of leave request' })
  @IsString()
  reason: string;

  @ApiProperty({ description: 'start date of leave request' })
  @Type(() => Date)
  @IsDate({ message: 'start date must be a valid date' })
  startDate: Date;

  @ApiProperty({ description: 'end date of leave request' })
  @Type(() => Date)
  @IsDate({ message: 'start date must be a valid date' })
  @Validate(DateRangeValidator)
  endDate: Date;
}
