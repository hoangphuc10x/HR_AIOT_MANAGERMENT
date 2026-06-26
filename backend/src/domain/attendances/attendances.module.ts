import { Module } from '@nestjs/common';
import { AttendancesService } from './attendances.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { AttendancesController } from './attendances.controller';
import { LeaveAttachment } from '../leave-requests/entities/leave_attachment.entity';
import { LeaveRequest } from '../leave-requests/entities/leave-request.entity';
import { User } from '../users/entities/user.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditLog } from '../audit-logs/entities/audit-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Attendance,
      LeaveAttachment,
      LeaveRequest,
      User,
      AuditLog,
    ]),
  ],
  controllers: [AttendancesController],
  providers: [AttendancesService, AuditLogsService],
  exports: [AttendancesModule],
})
export class AttendancesModule {}
