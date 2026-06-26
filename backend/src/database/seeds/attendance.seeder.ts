import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import {
  Attendance,
  AttendanceStatusEnum,
} from 'src/domain/attendances/entities/attendance.entity';
import { User } from 'src/domain/users/entities/user.entity';

export default class AttendanceSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const attendanceRepository = dataSource.getRepository(Attendance);
    const users = await dataSource.getRepository(User).find();

    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0;');
    await dataSource.query('TRUNCATE TABLE attendances;');
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1;');

    // Normal distribution
    const normalRandom = (mean: number, stdDev: number) => {
      let u = 0,
        v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      return (
        mean +
        stdDev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
      );
    };

    // Convert time VN to UTC
    const toUTC = (
      year: number,
      month: number,
      day: number,
      hour: number,
      minute = 0,
      second = 0,
    ) => {
      return new Date(Date.UTC(year, month, day, hour - 7, minute, second));
    };

    const today = new Date();
    const startDate = new Date(today);
    startDate.setMonth(today.getMonth() - 2);

    const attendances: Attendance[] = [];

    for (const user of users) {
      const date = new Date(startDate);

      while (date <= today) {
        const dayOfWeek = date.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          const rand = Math.random();
          let status: AttendanceStatusEnum;
          let checkIn: Date | null = null;
          let checkOut: Date | null = null;
          let overtimeHours = 0;

          // Normalize attendanceDate (UTC 00:00 with VN time is 07:00 yesterday)
          const attendanceDate = toUTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            0,
            0,
            0,
          );

          // Random status
          if (rand < 0.7) {
            status = AttendanceStatusEnum.ON_TIME;
          } else if (rand < 0.8) {
            status = AttendanceStatusEnum.LATE;
          } else if (rand < 0.85) {
            status = AttendanceStatusEnum.LEAVE_EARLY;
          } else if (rand < 0.9) {
            status = AttendanceStatusEnum.LATE_AND_LEAVE_EARLY;
          } else if (rand < 0.95) {
            status = AttendanceStatusEnum.ABSENT;
          } else {
            status = AttendanceStatusEnum.ON_LEAVE;
          }

          // Create check-in/check-out (VN time → convert UTC)
          if (
            status !== AttendanceStatusEnum.ABSENT &&
            status !== AttendanceStatusEnum.ON_LEAVE
          ) {
            // Original VN check-in: 08:00
            const baseCheckIn = toUTC(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
              8,
              0,
              0,
            );
            const minutesOffset = normalRandom(0, 20);
            baseCheckIn.setUTCMinutes(
              baseCheckIn.getUTCMinutes() + minutesOffset,
            );

            checkIn = new Date(baseCheckIn);

            // Make sure the status matches the time
            if (
              status === AttendanceStatusEnum.LATE ||
              status === AttendanceStatusEnum.LATE_AND_LEAVE_EARLY
            ) {
              // LATE: sau 08:15 VN
              const lateTime = toUTC(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                8,
                16 + Math.floor(Math.random() * 30),
              );
              checkIn = lateTime;
            }

            if (status === AttendanceStatusEnum.ON_TIME) {
              // ON_TIME: <= 08:15 VN
              const onTime = toUTC(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                8,
                Math.floor(Math.random() * 16),
              );
              checkIn = onTime;
            }

            // Check-out VN original: 17:00
            let checkOutTime = toUTC(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
              17,
              0,
              0,
            );
            const offsetMinutes = Math.floor(Math.random() * 11) - 5;
            checkOutTime.setUTCMinutes(
              checkOutTime.getUTCMinutes() + offsetMinutes,
            );

            if (
              status === AttendanceStatusEnum.LEAVE_EARLY ||
              status === AttendanceStatusEnum.LATE_AND_LEAVE_EARLY
            ) {
              checkOutTime = toUTC(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                15 + Math.floor(Math.random() * 2),
                Math.floor(Math.random() * 60),
              );
            }

            checkOut = checkOutTime;

            // Overtime
            if (
              status === AttendanceStatusEnum.ON_TIME &&
              Math.random() < 0.1
            ) {
              overtimeHours = Math.floor(Math.random() * 3) + 1; // 1–3 hours
              checkOut.setUTCHours(checkOut.getUTCHours() + overtimeHours);
            }
          }

          attendances.push(
            attendanceRepository.create({
              user,
              attendanceDate,
              checkIn,
              checkOut,
              status,
              note: '',
              overtimeHours,
            }),
          );
        }

        date.setDate(date.getDate() + 1);
      }
    }

    await attendanceRepository.save(attendances);
  }
}
