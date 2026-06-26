import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { DepartmentsService } from './departments.service';
import { DepartmentsRepository } from './departments.repository';
import { DepartmentsController } from './departments.controller';
import { User } from '../users/entities/user.entity';
import { UserDepartment } from './entities/user-department.entity';
import { AuditLog } from '../audit-logs/entities/audit-log.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { Role } from '../users/entities/role.entity';
import { UserRole } from '../users/entities/user-role.entity';
import { NotificationModule } from '../notifications/notifications.module';
import { NotificationService } from '../notifications/notifications.service';
import { UserDepartmentPermission } from '../users/entities/user-department-permission.entity';
import { UserPermission } from '../permissions/entities/user-permission.entity';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Department,
      User,
      UserDepartment,
      AuditLog,
      Role,
      UserRole,
      UserDepartmentPermission,
      UserPermission,
    ]),
    NotificationModule,
    PermissionsModule,
  ],

  providers: [
    DepartmentsService,
    DepartmentsRepository,
    AuditLogsService,
    NotificationService,
  ],
  controllers: [DepartmentsController],
  exports: [DepartmentsService],
})
export class DepartmentsModule {}
