import { Module } from '@nestjs/common';
import { LeaveRequestService } from './leave-request.service';
import { LeaveRequestController } from './leave-request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveRequest } from './entities/leave-request.entity';
import { User } from '../users/entities/user.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { UserRole } from '../users/entities/user-role.entity';
import { UserDepartment } from '../departments/entities/user-department.entity';
import { NotificationService } from '../notifications/notifications.service';
import { NotificationGateway } from '../notifications/notifications.gateway';
import { Attendance } from '../attendances/entities/attendance.entity';
import { UserNotification } from '../users/entities/user-notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LeaveRequest,
      User,
      Notification,
      UserRole,
      UserDepartment,
      Attendance,
      UserNotification,
    ]),
  ],
  providers: [LeaveRequestService, NotificationService, NotificationGateway],
  controllers: [LeaveRequestController],
})
export class LeaveRequestModule {}
