import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';

import { User } from 'src/domain/users/entities/user.entity';
import { LeaveRequest } from '@/domain/leave-requests/entities/leave-request.entity';
import { LeaveType } from '@/common/enums/leave-type.enum';
import { LeaveRequestStatus } from '@/common/enums/leave-request-status.enum';

export default class LeaveRequestSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0;');
    await dataSource.query('TRUNCATE TABLE leave_requests;');
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1;');

    const leaveRequestRepository = dataSource.getRepository(LeaveRequest);
    const userRepository = dataSource.getRepository(User);

    const users = await userRepository.find();

    const statuses = [
      LeaveRequestStatus.PENDING,
      LeaveRequestStatus.APPROVED,
      LeaveRequestStatus.REJECTED,
      LeaveRequestStatus.CANCELLED,
    ];

    const reasons = [
      'Đi khám bệnh',
      'Việc gia đình',
      'Du lịch cùng bạn bè',
      'Chăm sóc con nhỏ',
      'Tham dự đám cưới',
      'Mệt mỏi cần nghỉ ngơi',
      'Tham gia khóa học',
      'Về quê thăm người thân',
    ];

    for (const user of users) {
      for (let i = 0; i < statuses.length; i++) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + i);

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);

        const leave = new LeaveRequest();
        leave.user = user;
        leave.leaveType =
          Math.random() > 0.5 ? LeaveType.ANNUAL : LeaveType.SICK;
        leave.startDate = startDate;
        leave.endDate = endDate;

        leave.reason = reasons[Math.floor(Math.random() * reasons.length)];

        leave.status = statuses[i];
        leave.approvedBy = null;

        await leaveRequestRepository.save(leave);
      }
    }
  }
}
