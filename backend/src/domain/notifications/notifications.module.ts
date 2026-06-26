import { forwardRef, Module } from '@nestjs/common';
import { NotificationGateway } from './notifications.gateway';
import { NotificationService } from './notifications.service';
import { NotificationController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Notification } from './entities/notification.entity';
import { UsersModule } from '../users/users.module';
import { Attendance } from '../attendances/entities/attendance.entity';
import { UserNotification } from '../users/entities/user-notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      User,
      Attendance,
      UserNotification,
    ]),
    forwardRef(() => UsersModule),
  ],
  controllers: [NotificationController],
  providers: [NotificationGateway, NotificationService],
  exports: [NotificationService, NotificationGateway, TypeOrmModule],
})
export class NotificationModule {}
