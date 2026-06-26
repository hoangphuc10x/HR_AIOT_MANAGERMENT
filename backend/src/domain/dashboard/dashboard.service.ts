import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Attendance } from '../attendances/entities/attendance.entity';
import { Department } from '../departments/entities/department.entity';
import { PeriodEnum } from './dto/get-department-stats.dto';
import {
  DepartmentStatsResponseDto,
  TopAbsentEmployeesResponseDto,
  MonthlyAbsencesResponseDto,
  DashboardOverviewResponseDto,
} from './dto/dashboard-response.dto';
import { AttendanceStatusEnum } from '../../common/enums/attendance-status.enum';
import { UserStatus } from '../../common/enums/user-status.enum';
import { DepartmentStatus } from '../../common/enums/department-status.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  async getDashboardOverview(): Promise<DashboardOverviewResponseDto> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Total active employees
    const totalEmployees = await this.userRepository.count({
      where: {
        status: UserStatus.ACTIVE,
        deletedAt: IsNull(),
      },
    });

    // Absent today
    const absentToday = await this.attendanceRepository.count({
      where: {
        attendanceDate: today,
        status: AttendanceStatusEnum.ABSENT,
      },
    });

    // Absent this month
    const absentThisMonth = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .where('attendance.attendanceDate >= :startOfMonth', { startOfMonth })
      .andWhere('attendance.attendanceDate <= :today', { today })
      .andWhere('attendance.status = :status', {
        status: AttendanceStatusEnum.ABSENT,
      })
      .getCount();

    // Calculate average absence rate for the year
    const totalWorkDaysThisYear = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .where('attendance.attendanceDate >= :startOfYear', { startOfYear })
      .andWhere('attendance.attendanceDate <= :today', { today })
      .getCount();

    const totalAbsencesThisYear = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .where('attendance.attendanceDate >= :startOfYear', { startOfYear })
      .andWhere('attendance.attendanceDate <= :today', { today })
      .andWhere('attendance.status = :status', {
        status: AttendanceStatusEnum.ABSENT,
      })
      .getCount();

    const averageAbsenceRate =
      totalWorkDaysThisYear > 0
        ? Number(
            ((totalAbsencesThisYear / totalWorkDaysThisYear) * 100).toFixed(2),
          )
        : 0;

    return {
      totalEmployees,
      absentToday,
      absentThisMonth,
      averageAbsenceRate,
    };
  }

  async getDepartmentStats(
    period: PeriodEnum,
  ): Promise<DepartmentStatsResponseDto[]> {
    const endDate = new Date();
    let startDate: Date;

    switch (period) {
      case PeriodEnum.THREE_MONTHS:
        startDate = new Date();
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case PeriodEnum.SIX_MONTHS:
        startDate = new Date();
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case PeriodEnum.YEAR:
      default:
        startDate = new Date();
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    const query = `
      SELECT 
        d.department_name as name,
        COUNT(CASE WHEN a.status = ? THEN 1 END) as absences,
        COUNT(DISTINCT ud.user_id) as employees
      FROM departments d
      LEFT JOIN user_departments ud ON d.id = ud.department_id
      LEFT JOIN users u ON ud.user_id = u.id AND u.status = ? AND u.deleted_at IS NULL
      LEFT JOIN attendances a ON u.id = a.user_id 
        AND a.attendance_date >= ? 
        AND a.attendance_date <= ?
      WHERE d.status = ?
        AND d.deleted_at IS NULL
      GROUP BY d.id, d.department_name
      HAVING employees > 0
      ORDER BY absences DESC
    `;

    const results = await this.departmentRepository.query(query, [
      AttendanceStatusEnum.ABSENT,
      UserStatus.ACTIVE,
      startDate,
      endDate,
      DepartmentStatus.ACTIVE,
    ]);

    return results.map((result) => ({
      name: result.name,
      absences: parseInt(result.absences) || 0,
      employees: parseInt(result.employees) || 0,
    }));
  }

  async getTopAbsentEmployees(
    limit: number,
  ): Promise<TopAbsentEmployeesResponseDto[]> {
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    const endDate = new Date();

    const query = `
      SELECT 
        u.id as userId,
        u.full_name as name,
        d.department_name as department,
        ud.position as position,
        COUNT(CASE WHEN a.status = ? THEN 1 END) as absences
      FROM users u
      LEFT JOIN user_departments ud ON u.id = ud.user_id
      LEFT JOIN departments d ON ud.department_id = d.id
      LEFT JOIN attendances a ON u.id = a.user_id 
        AND a.attendance_date >= ? 
        AND a.attendance_date <= ?
        AND a.status = ?
      WHERE u.status = ?
        AND u.deleted_at IS NULL
        AND d.status = ?
        AND d.deleted_at IS NULL
      GROUP BY u.id, u.full_name, d.department_name, ud.position
      HAVING absences > 0
      ORDER BY absences DESC
      LIMIT ?
    `;

    const results = await this.userRepository.query(query, [
      AttendanceStatusEnum.ABSENT,
      startDate,
      endDate,
      AttendanceStatusEnum.ABSENT,
      UserStatus.ACTIVE,
      DepartmentStatus.ACTIVE,
      limit,
    ]);

    return results.map((result) => ({
      userId: result.userId,
      name: result.name,
      department: result.department,
      position: this.formatPosition(result.position),
      absences: parseInt(result.absences) || 0,
    }));
  }

  async getMonthlyAbsences(
    year: number,
  ): Promise<MonthlyAbsencesResponseDto[]> {
    const results: MonthlyAbsencesResponseDto[] = [];

    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); // Last day of month

      // Count total absences for the month
      const absences = await this.attendanceRepository
        .createQueryBuilder('attendance')
        .where('attendance.attendanceDate >= :startDate', { startDate })
        .andWhere('attendance.attendanceDate <= :endDate', { endDate })
        .andWhere('attendance.status = :status', {
          status: AttendanceStatusEnum.ABSENT,
        })
        .getCount();

      // Calculate work days (excluding weekends - simplified)
      const workDays = this.calculateWorkDays(startDate, endDate);

      results.push({
        month: `T${month}`,
        monthNumber: month,
        absences,
        workDays,
      });
    }

    return results;
  }

  private calculateWorkDays(startDate: Date, endDate: Date): number {
    let workDays = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      // Exclude Sundays (0) and Saturdays (6)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workDays;
  }

  private formatPosition(position: string): string {
    const positionMap = {
      '1': 'HEAD',
      '2': 'DEPUTY',
      '3': 'EMPLOYEE',
    };

    return positionMap[position] || position;
  }
}
