import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './config/winston-logger.config';
import { ConfigModule } from '@nestjs/config';
import { AuditLogsModule } from './domain/audit-logs/audit-logs.module';
import { AuthModule } from './domain/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './config/database.config';
import { DepartmentsModule } from './domain/departments/departments.module';
import { CacheModule } from '@nestjs/cache-manager';
import { UsersModule } from './domain/users/users.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LeaveRequestModule } from './domain/leave-requests/leave-request.module';
import { NotificationModule } from './domain/notifications/notifications.module';
import { PermissionsModule } from './domain/permissions/permissions.module';
import { CloudinaryConfig } from './config/cloud.config';
import { AttendancesModule } from './domain/attendances/attendances.module';
import { cacheConfig } from './config/cache.config';
import { ScheduleModule } from '@nestjs/schedule';
import { DashboardModule } from './domain/dashboard/dashboard.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    WinstonModule.forRoot(winstonConfig),
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    CacheModule.registerAsync(cacheConfig),
    AuthModule,
    AuditLogsModule,
    DepartmentsModule,
    UsersModule,
    NotificationModule,
    LeaveRequestModule,
    PermissionsModule,
    AttendancesModule,
    ScheduleModule.forRoot(),
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService, CloudinaryConfig],
})
export class AppModule {}
