import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Attendance, AttendanceStatusEnum } from './entities/attendance.entity';
import { Raw, Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AttendanceDetailResponse,
  AttendanceDetailResult,
  AttendanceMonthSummary,
  UpdateAttendanceDto,
} from './dto/attendances.dto';
import { User } from '../users/entities/user.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { AuditLogActionEnum } from '@/common/enums/audit-log-action.enum';

@Injectable()
export class AttendancesService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAttendanceByMonth(year: number, month: number) {
    try {
      const attendanceMonth: AttendanceMonthSummary[] =
        await this.attendanceRepository
          .createQueryBuilder('a')
          .select('u.id', 'user_id')
          .addSelect('u.fullName', 'full_name')
          .addSelect('u.email', 'email')
          .addSelect('u.code', 'code')
          .addSelect(
            `SUM(CASE WHEN a.status = ${AttendanceStatusEnum.ON_TIME} THEN 1 ELSE 0 END)`,
            'total_on_time',
          )
          .addSelect(
            `SUM(CASE WHEN a.status = ${AttendanceStatusEnum.LATE} THEN 1 ELSE 0 END)`,
            'total_late',
          )
          .addSelect(
            `SUM(CASE WHEN a.status = ${AttendanceStatusEnum.LEAVE_EARLY} THEN 1 ELSE 0 END)`,
            'total_leave_early',
          )
          .addSelect(
            `SUM(CASE WHEN a.status = ${AttendanceStatusEnum.ABSENT} THEN 1 ELSE 0 END)`,
            'total_absent',
          )
          .addSelect(
            `SUM(CASE WHEN a.status = ${AttendanceStatusEnum.ON_LEAVE} THEN 1 ELSE 0 END)`,
            'total_on_leave',
          )
          .addSelect(
            `SUM(CASE WHEN a.status = ${AttendanceStatusEnum.LATE_AND_LEAVE_EARLY} THEN 1 ELSE 0 END)`,
            'total_late_and_leave_early',
          )
          .innerJoin('a.user', 'u')
          .where('MONTH(a.attendance_date) = :month', { month })
          .andWhere('YEAR(a.attendance_date) = :year', { year })
          .groupBy('u.id')
          .addGroupBy('u.fullName')
          .addGroupBy('u.email')
          .addGroupBy('u.code')
          .orderBy('total_on_time')
          .getRawMany();

      return attendanceMonth;
    } catch (error) {
      console.log(error);
    }
  }

  private formatDateLocal(input: Date | string): string {
    const d = new Date(input);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  async findDetailAttendance(code: string, year: number, month: number) {
    try {
      const result = await this.attendanceRepository
        .createQueryBuilder('a')
        .select([
          'u.code AS code',
          'u.full_name AS full_name',
          'a.attendance_date as date',
          'a.check_in as checkIn',
          'a.check_out as checkOut',
          'a.status AS status',
        ])
        .innerJoin('a.user', 'u')
        .where('u.code = :code', { code })
        .andWhere('MONTH(a.attendance_date) = :month', { month })
        .andWhere('YEAR(a.attendance_date) = :year', { year })
        .orderBy('a.attendance_date', 'DESC')
        .getRawMany();

      const attendanceRecords = result.map((record) => {
        const checkIn = record.checkIn ? new Date(record.checkIn) : null;
        const checkOut = record.checkOut ? new Date(record.checkOut) : null;

        let workingHours = 0;
        if (checkIn && checkOut) {
          const diffMs = checkOut.getTime() - checkIn.getTime();
          workingHours = diffMs / (1000 * 60 * 60);
          workingHours = Math.round((workingHours - 1) * 10) / 10; // deuce 1 h lunch break
        }

        return {
          date: this.formatDateLocal(record.date), // YYYY-MM-DD
          checkIn: checkIn ? checkIn.toISOString() : null,
          checkOut: checkOut ? checkOut.toISOString() : null,
          status: this.mapStatusToString(Number(record.status)),
          workingHours,
        };
      });

      return {
        employee: {
          code: result[0]?.code,
          name: result[0]?.full_name,
        },
        attendanceData: attendanceRecords,
      };
    } catch (error) {
      console.log('Error fetching attendance detail:', error);
      throw error;
    }
  }

  private getCheckInStatus(now: Date): AttendanceStatusEnum {
    const hour = now.getHours();
    const minute = now.getMinutes();

    // If after 08:15 then it is considered late.
    if (hour > 8 || (hour === 8 && minute > 15)) {
      return AttendanceStatusEnum.LATE;
    }

    return AttendanceStatusEnum.ON_TIME;
  }

  async checkIn(userId: number): Promise<Attendance> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const now = new Date();
    // create attendanceDate = 00:00:00 of today
    const attendanceDate = new Date(now);
    attendanceDate.setHours(0, 0, 0, 0);
    const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);

    // find attendance for the day
    let attendance = await this.attendanceRepository.findOne({
      where: { user: { id: userId }, attendanceDate },
    });

    if (attendance) {
      if (attendance.checkIn) {
        throw new BadRequestException('Already checked in today');
      }
      attendance.checkIn = now;
    } else {
      attendance = this.attendanceRepository.create({
        user,
        attendanceDate,
        checkIn: now,
        status: this.getCheckInStatus(vnTime),
        note: '',
        overtimeHours: 0,
      });
    }

    return this.attendanceRepository.save(attendance);
  }

  async checkOut(userId: number): Promise<Attendance> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const now = new Date();
    const dateOnly = now.toISOString().split('T')[0]; // YYYY-MM-DD

    const attendance = await this.attendanceRepository.findOne({
      where: { user: { id: userId }, attendanceDate: dateOnly as any },
    });

    if (!attendance) {
      throw new BadRequestException('User has not checked in today');
    }

    if (attendance.checkOut) {
      throw new BadRequestException('Already checked out today');
    }

    attendance.checkOut = now;

    const checkoutHour = now.getHours();
    const checkoutMinute = now.getMinutes();

    const isLeaveEarly =
      checkoutHour < 16 || (checkoutHour === 16 && checkoutMinute < 45);

    if (isLeaveEarly) {
      if (attendance.status === AttendanceStatusEnum.ON_TIME) {
        attendance.status = AttendanceStatusEnum.LEAVE_EARLY;
      } else if (attendance.status === AttendanceStatusEnum.LATE) {
        attendance.status = AttendanceStatusEnum.LATE_AND_LEAVE_EARLY;
      }
    }

    return this.attendanceRepository.save(attendance);
  }

  async findAttendanceByDate(code: string, date: Date) {
    console.log('findAttendanceByDate');
    try {
      const formattedDate = date.toISOString().split('T')[0];

      const result: AttendanceDetailResult | undefined =
        await this.attendanceRepository
          .createQueryBuilder('a')
          .select([
            'u.code AS code',
            'u.full_name AS full_name',
            'u.email AS email',
            'u.phone AS phone',
            'a.attendance_date AS date',
            'a.check_in AS checkIn',
            'a.check_out AS checkOut',
            'a.status AS status',
            'lr.id AS leaveRequestId',
            'lr.leave_type AS leaveType',
            'lr.start_date AS leaveStartDate',
            'lr.end_date AS leaveEndDate',
            'lr.reason AS leaveReason',
            'lr.status AS leaveStatus',
            'approver.id AS approverId',
            'approver.full_name AS approverFullName',
            'approver.email AS approverEmail',
          ])
          .innerJoin('a.user', 'u')
          .leftJoin(
            'leave_requests',
            'lr',
            'lr.user_id = u.id AND :date BETWEEN lr.start_date AND lr.end_date',
            { date: formattedDate },
          )
          .leftJoin('users', 'approver', 'approver.id = lr.approved_by')
          .where('u.code = :code', { code })
          .andWhere('DATE(a.attendance_date) = :date', { date: formattedDate })
          .getRawOne();

      if (!result) {
        return null;
      }

      const attendance = {
        date: new Date(result.checkIn || result.date)
          .toISOString()
          .split('T')[0],
        checkIn: result.checkIn || null,
        checkOut: result.checkOut || null,
        status: this.mapStatusToString(Number(result.status)),
        workingHours: this.calculateWorkingHours(
          result.checkIn,
          result.checkOut,
        ),
      };

      const response: AttendanceDetailResponse = {
        employee: {
          code: result.code,
          name: result.full_name,
          email: result.email,
          phone: result.phone,
        },
        attendance,
      };

      console.log(
        'AttendanceStatusEnum.ON_LEAVE',
        AttendanceStatusEnum.ON_LEAVE,
      );

      console.log('result.status', result.status);
      console.log('result.leaveRequestId', result.leaveRequestId);

      if (
        Number(result.status) === AttendanceStatusEnum.ON_LEAVE &&
        result.leaveRequestId
      ) {
        response.onLeave = {
          id: result.leaveRequestId,
          type: result.leaveType,
          startDate:
            result.leaveStartDate instanceof Date
              ? result.leaveStartDate.toISOString().split('T')[0]
              : result.leaveStartDate,
          endDate:
            result.leaveEndDate instanceof Date
              ? result.leaveEndDate.toISOString().split('T')[0]
              : result.leaveEndDate,
          reason: result.leaveReason,
          status: result.leaveStatus,
          approvedBy: result.approverId
            ? {
                id: result.approverId,
                fullName: result.approverFullName,
                email: result.approverEmail,
              }
            : null,
        };
      }

      return response;
    } catch (error) {
      console.log('Error fetching attendance by date:', error);
      throw error;
    }
  }

  calculateWorkingHours(
    checkInStr?: string | null,
    checkOutStr?: string | null,
  ) {
    if (!checkInStr || !checkOutStr) return '0.0';

    const checkIn = new Date(checkInStr);
    const checkOut = new Date(checkOutStr);

    const morningEnd = new Date(checkIn);
    morningEnd.setHours(12, 0, 0, 0);

    const afternoonStart = new Date(checkIn);
    afternoonStart.setHours(13, 0, 0, 0);

    const overlap = (start: Date, end: Date) =>
      Math.max(
        0,
        Math.min(checkOut.getTime(), end.getTime()) -
          Math.max(checkIn.getTime(), start.getTime()),
      );

    const workingMs =
      overlap(checkIn, morningEnd) + overlap(afternoonStart, checkOut);

    return (Math.round((workingMs / 1000 / 60 / 60) * 10) / 10).toFixed(1);
  }

  async updateAttendance(
    code: string,
    date: string,
    updateDto: UpdateAttendanceDto,
    userId: number,
  ) {
    try {
      const user = await this.userRepository.findOne({ where: { code } });
      if (!user) throw new NotFoundException('User not found');

      const targetDate = new Date(date);
      const today = new Date();
      const startCurrentMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      );
      const endToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59,
        999,
      );

      if (targetDate < startCurrentMonth || targetDate > endToday) {
        throw new ForbiddenException(
          'Editing is only allowed from the first day of this month until today',
        );
      }

      const attendance = await this.attendanceRepository.findOne({
        where: {
          user: { id: user.id },
          attendanceDate: Raw((alias) => `${alias} = :date`, { date }),
        },
        relations: ['user'],
      });

      if (!attendance)
        throw new NotFoundException('Attendance not found for this date');

      const previousValue = { ...attendance };

      if (updateDto.checkIn) {
        attendance.checkIn = new Date(updateDto.checkIn);
      }
      if (updateDto.checkOut) {
        attendance.checkOut = new Date(updateDto.checkOut);
      }

      if (attendance.checkIn || attendance.checkOut) {
        const lateThreshold = new Date(targetDate);
        lateThreshold.setHours(8, 15, 0, 0);

        const leaveEarlyThreshold = new Date(targetDate);
        leaveEarlyThreshold.setHours(17, 0, 0, 0);

        const isLate = attendance.checkIn && attendance.checkIn > lateThreshold;
        const isLeaveEarly =
          attendance.checkOut && attendance.checkOut < leaveEarlyThreshold;

        if (isLate && isLeaveEarly) {
          attendance.status = AttendanceStatusEnum.LATE_AND_LEAVE_EARLY;
        } else if (isLate) {
          attendance.status = AttendanceStatusEnum.LATE;
        } else if (isLeaveEarly) {
          attendance.status = AttendanceStatusEnum.LEAVE_EARLY;
        } else {
          attendance.status = AttendanceStatusEnum.ON_TIME;
        }
      }

      const updated = await this.attendanceRepository.save(attendance);

      await this.auditLogsService.createLog({
        userId: userId,
        action: AuditLogActionEnum.UPDATE_ATTENDANCE,
        description: `User id ${userId} updated attendance on ${date}`,
        entityName: 'Attendance',
        entityId: attendance.id.toString(),
        previousValue,
        newValue: updated,
      });

      return updated;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findTodayAttendance(code: string, today: Date) {
    const user = await this.userRepository.findOne({ where: { code: code } });
    if (!user) throw new NotFoundException('User not found');

    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    console.log('start date: ', startOfDay);
    console.log('end date', endOfDay);
    const attendance = await this.attendanceRepository.findOne({
      where: {
        user: { code },
        attendanceDate: Between(startOfDay, endOfDay),
      },
      relations: ['user'],
    });

    if (!attendance) {
      return null;
    }

    const checkIn = attendance.checkIn ? new Date(attendance.checkIn) : null;
    const checkOut = attendance.checkOut ? new Date(attendance.checkOut) : null;

    let workingHours = 0;
    if (checkIn && checkOut) {
      workingHours =
        Math.round(
          ((checkOut.getTime() - checkIn.getTime() - 1) / (1000 * 60 * 60)) *
            10,
        ) / 10;
    }

    return {
      employee: {
        code: attendance.user.code,
        name: attendance.user.fullName,
      },
      attendance: {
        id: attendance.id,
        date: attendance.attendanceDate,
        checkIn: attendance.checkIn,
        checkOut: attendance.checkOut,
        status: this.mapStatusToString(Number(attendance.status)),
        workingHours,
      },
    };
  }

  async exportAttendanceToCSV(
    year: number,
    month: number,
    res: Response,
    isByDate: boolean,
  ): Promise<void> {
    // Get all employees with attendance data for the month
    const employeesData = await this.findAttendanceByMonth(year, month);

    if (!employeesData || employeesData.length === 0) {
      throw new NotFoundException(
        'No attendance data found for the specified period',
      );
    }

    const datesInMonth = this.getDatesInMonth(year, month);

    this.exportAttendanceMultiSheet(
      employeesData,
      datesInMonth,
      year,
      month,
      res,
      isByDate
        ? this.prepareAttendanceDataByDate.bind(this)
        : this.prepareAttendanceDataByEmployee.bind(this),
    );
  }

  private getDatesInMonth(year: number, month: number): string[] {
    const dates: string[] = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);

      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      const dateString = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

      dates.push(dateString);
    }

    return dates;
  }

  private mapStatusToString(status: number): string {
    const statusMap: Record<number, string> = {
      [AttendanceStatusEnum.ON_TIME]: 'on_time',
      [AttendanceStatusEnum.LATE]: 'late',
      [AttendanceStatusEnum.LEAVE_EARLY]: 'early_leave',
      [AttendanceStatusEnum.ABSENT]: 'absent',
      [AttendanceStatusEnum.ON_LEAVE]: 'on_leave',
      [AttendanceStatusEnum.LATE_AND_LEAVE_EARLY]: 'late_and_early_leave',
    };

    return statusMap[status] || 'Unknown';
  }

  private formatVietnamTime(date: string | undefined | null): string {
    if (!date) return '';

    return new Date(date).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Ho_Chi_Minh',
    });
  }

  async exportAttendanceMultiSheet(
    employeesData: AttendanceMonthSummary[],
    datesInMonth: string[],
    year: number,
    month: number,
    res: Response,
    callback: (
      employeesData: AttendanceMonthSummary[],
      workbook: ExcelJS.Workbook,
      year: number,
      month: number,
      datesInMonth: string[],
    ) => Promise<void>,
  ) {
    const workbook = new ExcelJS.Workbook();

    // ==== Sheet Summary ====
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.addRow([
      'EmployeeCode',
      'EmployeeName',
      'Email',
      'On Time',
      'Late',
      'Leave Early',
      'Absent',
      'On Leave',
      'Late & Leave Early',
    ]);

    const summaryData = await this.findAttendanceByMonth(year, month);

    if (!summaryData)
      throw new BadRequestException(
        'Cannot export attendance data, date not found',
      );

    summaryData.forEach((employee) => {
      summarySheet.addRow([
        employee.code,
        employee.full_name,
        employee.email,
        employee.total_on_time,
        employee.total_late,
        employee.total_leave_early,
        employee.total_absent,
        employee.total_on_leave,
        employee.total_late_and_leave_early,
      ]);
    });

    this.fitWidthSheet(summarySheet);

    await callback(employeesData, workbook, year, month, datesInMonth);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Attendance_${year}_${month}.xlsx"`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  async prepareAttendanceDataByEmployee(
    employeesData: AttendanceMonthSummary[],
    workbook: ExcelJS.Workbook,
    year: number,
    month: number,
    datesInMonth: string[],
  ) {
    for (const employee of employeesData) {
      const sheetName = employee.full_name || employee.code || 'Unknown';
      const sheet = workbook.addWorksheet(sheetName.substring(0, 31));

      sheet.addRow(['Date', 'CheckIn', 'CheckOut', 'Status', 'WorkingHours']);

      const detailData = await this.findDetailAttendance(
        employee.code,
        year,
        month,
      );

      datesInMonth.forEach((date) => {
        const record = detailData?.attendanceData.find((r) => r.date === date);

        sheet.addRow([
          date,
          record?.checkIn ? this.formatVietnamTime(record.checkIn) : '',
          record?.checkOut ? this.formatVietnamTime(record.checkOut) : '',
          record?.status || '',
          record
            ? this.calculateWorkingHours(
                record.checkIn,
                record.checkOut,
              ).toString()
            : '',
        ]);
      });

      this.fitWidthSheet(sheet);
    }
  }

  async prepareAttendanceDataByDate(
    employeesData: AttendanceMonthSummary[],
    workbook: ExcelJS.Workbook,
    year: number,
    month: number,
    datesInMonth: string[],
  ) {
    for (const date of datesInMonth) {
      const sheet = workbook.addWorksheet(date);

      sheet.addRow([
        'EmployeeCode',
        'EmployeeName',
        'Email',
        'CheckIn',
        'CheckOut',
        'Status',
        'WorkingHours',
      ]);

      for (const employee of employeesData) {
        const detailData = await this.findDetailAttendance(
          employee.code,
          year,
          month,
        );
        const record = detailData?.attendanceData.find((r) => r.date === date);

        sheet.addRow([
          employee.code || '',
          employee.full_name || '',
          employee.email || '',
          record?.checkIn ? this.formatVietnamTime(record.checkIn) : '',
          record?.checkOut ? this.formatVietnamTime(record.checkOut) : '',
          record?.status || '',
          record
            ? this.calculateWorkingHours(
                record.checkIn,
                record.checkOut,
              ).toString()
            : '',
        ]);
      }

      this.fitWidthSheet(sheet);
    }
  }

  fitWidthSheet(sheet: ExcelJS.Worksheet) {
    (sheet.columns ?? []).forEach((col) => {
      const column = col as ExcelJS.Column & {
        eachCell: (
          options: { includeEmpty: boolean },
          callback: (cell: ExcelJS.Cell) => void,
        ) => void;
      };

      let maxLength = 10;

      column.eachCell({ includeEmpty: true }, (cell) => {
        const value = cell.value != null ? String(cell.value) : '';
        maxLength = Math.max(maxLength, value.length);
      });

      column.width = maxLength + 2;
    });

    sheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'center',
          wrapText: true,
        };
        if (rowNumber === 1) {
          cell.font = { bold: true };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD9D9D9' },
          };
        }
      });
    });
  }
  async exportEmployeeAttendance(
    code: string,
    year: number,
    month: number,
    res: Response,
  ) {
    const detail = await this.findDetailAttendance(code, year, month);
    const { employee, attendanceData } = detail;

    const monthSummaries = await this.findAttendanceByMonth(year, month);
    if (!monthSummaries) throw new BadRequestException('Cannot export data');
    const summary = monthSummaries.find((s) => s.code === code);

    const workbook = new ExcelJS.Workbook();

    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Employee Code', key: 'code', width: 15 },
      { header: 'Employee Name', key: 'name', width: 25 },
      { header: 'Month', key: 'month', width: 10 },
      { header: 'Year', key: 'year', width: 10 },
      { header: 'On Time', key: 'onTime', width: 12 },
      { header: 'Late', key: 'late', width: 12 },
      { header: 'Leave Early', key: 'leaveEarly', width: 15 },
      { header: 'Absent', key: 'absent', width: 12 },
      { header: 'On Leave', key: 'onLeave', width: 12 },
      { header: 'Late + Leave Early', key: 'lateAndLeaveEarly', width: 20 },
      { header: 'Total Days', key: 'days', width: 12 },
      { header: 'Total Hours', key: 'hours', width: 15 },
    ];

    const totalDays = attendanceData.length;
    const totalHours = attendanceData.reduce(
      (sum, r) => sum + (r.workingHours || 0),
      0,
    );

    const summaryRow = summarySheet.addRow({
      code: employee.code,
      name: employee.name,
      month,
      year,
      onTime: summary?.total_on_time || 0,
      late: summary?.total_late || 0,
      leaveEarly: summary?.total_leave_early || 0,
      absent: summary?.total_absent || 0,
      onLeave: summary?.total_on_leave || 0,
      lateAndLeaveEarly: summary?.total_late_and_leave_early || 0,
      days: totalDays,
      hours: Math.round(totalHours * 10) / 10,
    });

    summaryRow.eachCell((cell) => {
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    summarySheet.getRow(1).eachCell((cell) => {
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.font = { bold: true };
    });

    const detailSheet = workbook.addWorksheet('Details');
    detailSheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Check In', key: 'checkIn', width: 15 },
      { header: 'Check Out', key: 'checkOut', width: 15 },
      { header: 'Status', key: 'status', width: 20 },
      { header: 'Working Hours', key: 'workingHours', width: 20 },
    ];

    detailSheet.getRow(1).eachCell((cell) => {
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.font = { bold: true };
    });

    const formatTime = (iso: string | null) => {
      if (!iso) return '';
      const d = new Date(iso);
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return `${hh}:${mm}`;
    };

    attendanceData.forEach((record) => {
      const row = detailSheet.addRow({
        date: record.date,
        checkIn: formatTime(record.checkIn),
        checkOut: formatTime(record.checkOut),
        status: record.status,
        workingHours: record.workingHours,
      });

      row.eachCell((cell) => {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Attendance_${employee.code}_${year}_${month}.xlsx"`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}
