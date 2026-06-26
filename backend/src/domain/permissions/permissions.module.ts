import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { UserDepartmentPermission } from '../users/entities/user-department-permission.entity';
import { UserPermission } from './entities/user-permission.entity';
import { User } from '../users/entities/user.entity';
import { NotificationModule } from '../notifications/notifications.module';
import { AuditLog } from '../audit-logs/entities/audit-log.entity';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Permission,
      UserPermission,
      UserDepartmentPermission,
      User,
      AuditLog,
    ]),
    NotificationModule,
    AuditLogsModule,
  ],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
