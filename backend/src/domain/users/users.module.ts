import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.entity';
import { EmailSend } from 'src/common/repositories/send-email.repository';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { Department } from '../departments/entities/department.entity';
import { NotificationModule } from '../notifications/notifications.module';
import { DepartmentsModule } from '../departments/departments.module';
import { UserPermission } from '../permissions/entities/user-permission.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { UserDepartmentPermission } from './entities/user-department-permission.entity';
import { FileUploadModule } from '../file-upload/file-upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserRole,
      Department,
      Permission,
      UserPermission,
      UserDepartmentPermission,
    ]),
    AuditLogsModule,
    NotificationModule,
    DepartmentsModule,
    FileUploadModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, EmailSend],
  exports: [UsersService],
})
export class UsersModule {}
