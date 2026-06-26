import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from '../attendances/entities/attendance.entity';
import { Department } from '../departments/entities/department.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance, Department, User])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
