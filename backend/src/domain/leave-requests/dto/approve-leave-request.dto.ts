import { LeaveRequestStatus } from '@/common/enums/leave-request-status.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber } from 'class-validator';

export class LeaveRequestApprovalDto {
  @ApiProperty({ description: 'Id of HR ', example: 1 })
  @IsNumber()
  @IsNotEmpty({ message: 'Id of HR is required' })
  userId: number;

  @ApiProperty({ description: 'Id of leave request ', example: 1 })
  @IsNumber()
  @IsNotEmpty({ message: 'Id of leave request is required' })
  leaveRequestId: number;

  @ApiProperty({
    description: 'Id of leave request , APPROVED:2,REJECTED:3',
    example: 2,
  })
  @IsIn([LeaveRequestStatus.APPROVED, LeaveRequestStatus.REJECTED])
  @IsNotEmpty()
  leaveRequestStatus: LeaveRequestStatus;
}
