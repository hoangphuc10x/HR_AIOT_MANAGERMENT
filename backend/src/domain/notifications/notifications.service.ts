import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NotificationGateway } from './notifications.gateway';
import { SocketPayloadDto } from '@/common/dto/socket-payload.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification } from './entities/notification.entity';
import { NotificationType } from '@/common/enums/notification-type.enum';
import { Cron } from '@nestjs/schedule';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Attendance } from '../attendances/entities/attendance.entity';
import { UserStatus } from '@/common/enums/user-status.enum';
import { UserNotification } from '../users/entities/user-notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    private readonly gateway: NotificationGateway,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @InjectRepository(UserNotification)
    private readonly userNotificationRepository: Repository<UserNotification>,
  ) {}

  sendInviteNotification(
    userNotifications: UserNotification[],
    departmentId: number,
    invitedBy: { id: number; fullName: string },
  ) {
    userNotifications.forEach((userNotify) => {
      const payload: SocketPayloadDto = {
        type: userNotify.notification.type,
        title: userNotify.notification.title,
        message: userNotify.notification.content,
        metadata: {
          departmentId,
          invitedBy,
        },
        timestamp: new Date().toISOString(),
      };

      this.gateway.emitToUser(userNotify.user.id, 'notification', payload);
    });
  }

  sendCustomNotification(
    userIds: number[],
    event: string,
    payload: SocketPayloadDto,
  ) {
    this.gateway.emitToUsers(userIds, event, payload);
  }

  async createBulk(
    receiverIds: number[],
    payload: {
      referenceId?: number;
      type: NotificationType;
      title: string;
      content: string;
    },
  ) {
    // Create a single notification
    const notification = this.notificationRepository.create({
      type: payload.type,
      title: payload.title,
      content: payload.content,
    });
    await this.notificationRepository.save(notification);

    // Create UserNotification records for each user
    const userNotifications = receiverIds.map((userId) =>
      this.userNotificationRepository.create({
        user: { id: userId } as User,
        referenceId: payload.referenceId,
        notification,
        isRead: false,
      }),
    );
    return this.userNotificationRepository.save(userNotifications);
  }

  async createNotification(
    dto: CreateNotificationDto,
  ): Promise<UserNotification> {
    const receiver = await this.userRepository.findOne({
      where: { id: dto.receiverId },
    });
    if (!receiver) {
      throw new NotFoundException(`User with id ${dto.receiverId} not found`);
    }

    // Create a single notification
    const notification = this.notificationRepository.create({
      type: dto.type,
      title: dto.title,
      content: dto.content,
    });
    await this.notificationRepository.save(notification);

    // Create a UserNotification record to link the user and notification
    const userNotification = this.userNotificationRepository.create({
      user: receiver,
      referenceId: dto.referenceId,
      notification,
      isRead: false,
    });

    return this.userNotificationRepository.save(userNotification);
  }

  async findAllByUser(userId: number): Promise<UserNotification[]> {
    return this.userNotificationRepository.find({
      where: { user: { id: userId } },
      relations: ['notification'], // Load the related Notification entity
      order: { createdAt: 'DESC' }, // Order by UserNotification's createdAt
    });
  }

  async markNotificationAsRead(notificationId: number, userId: number) {
    const userNotification = await this.userNotificationRepository.findOne({
      where: { notification: { id: notificationId }, user: { id: userId } },
    });
    if (!userNotification) {
      throw new NotFoundException(
        `UserNotification with notification ID ${notificationId} and user ID ${userId} not found`,
      );
    }

    userNotification.isRead = true;
    return this.userNotificationRepository.save(userNotification);
  }

  async markNotificationAsUnread(notificationId: number, userId: number) {
    const userNotification = await this.userNotificationRepository.findOne({
      where: { notification: { id: notificationId }, user: { id: userId } },
    });
    if (!userNotification) {
      throw new NotFoundException(
        `UserNotification with notification ID ${notificationId} and user ID ${userId} not found`,
      );
    }

    userNotification.isRead = false;
    return this.userNotificationRepository.save(userNotification);
  }

  async deleteNotificationById(notificationId: number, userId: number) {
    const userNotification = await this.userNotificationRepository.findOne({
      where: { notification: { id: notificationId }, user: { id: userId } },
    });
    if (!userNotification) {
      throw new NotFoundException(
        `UserNotification with notification ID ${notificationId} and user ID ${userId} not found`,
      );
    }
    await this.userNotificationRepository.remove(userNotification);
    return { message: 'User notification deleted successfully' };
  }

  async deleteAllNotifications(userId: number) {
    const userNotifications = await this.userNotificationRepository.find({
      where: { user: { id: userId } },
    });
    if (userNotifications.length === 0) {
      throw new NotFoundException(`No notifications found for user ${userId}`);
    }

    await this.userNotificationRepository.remove(userNotifications);
    return { message: 'All user notifications deleted successfully' };
  }

  sendLeaveRequestNotification(
    sender_id: number,
    receiverIds: number[],
    title: string,
    content: string,
  ) {
    const payload: SocketPayloadDto = {
      type: NotificationType.LEAVE_REQUEST,
      title: title,
      message: content,
      metadata: {
        sender_id,
      },
      timestamp: new Date().toISOString(),
    };
    this.gateway.emitToUsers(receiverIds, 'notification', payload);
  }

  async findUsersWithoutCheckIn(today: Date): Promise<User[]> {
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));

    // Get all active users
    const activeUsers = await this.userRepository.find({
      where: { status: UserStatus.ACTIVE }, // Assuming UserStatus.ACTIVE is the enum value
    });

    // Get users who have checked in today
    const usersWithCheckIn = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .select('attendance.user_id')
      .where('attendance.attendance_date = :today', { today: startOfDay })
      .andWhere('attendance.check_in IS NOT NULL')
      .getRawMany();

    const checkedInUserIds = usersWithCheckIn.map(
      (row) => row.attendance_user_id,
    );

    // Filter out users who haven't checked in
    const usersWithoutCheckIn = activeUsers.filter(
      (user) => !checkedInUserIds.includes(user.id),
    );

    return usersWithoutCheckIn;
  }

  // Cron job to send check-in reminders at 8:10 AM on weekdays (Monday to Friday)
  @Cron('0 7 9 * * 1-5', {
    name: 'checkInReminder',
    timeZone: 'Asia/Ho_Chi_Minh', // Adjust to your timezone
  })
  async handleCheckInReminder() {
    try {
      this.logger.debug('Running check-in reminder cron job at 8:10 AM');

      const today = new Date();
      const usersWithoutCheckIn = await this.findUsersWithoutCheckIn(today);

      if (usersWithoutCheckIn.length === 0) {
        this.logger.debug('No users need check-in reminders today');
        return;
      }

      const userIds = usersWithoutCheckIn.map((user) => user.id);

      // Prepare notification payload
      const payload: SocketPayloadDto = {
        type: NotificationType.CHECK_IN_REMINDER, // Ensure this is defined in NotificationType enum
        title: 'Check-In Reminder',
        message: 'Please remember to check in for today!',
        metadata: {},
        timestamp: new Date().toISOString(),
      };

      // Send real-time notification
      this.gateway.emitToUsers(userIds, 'notification', payload);
      this.logger.debug(`Sent check-in reminders to ${userIds.length} users`);

      // Save notifications to the database
      const notificationPayload = {
        type: NotificationType.CHECK_IN_REMINDER,
        title: 'Check-In Reminder',
        content: 'Please remember to check in for today!',
      };

      await this.createBulk(userIds, notificationPayload);
      this.logger.debug(
        `Saved ${userIds.length} check-in reminder notifications to the database`,
      );
    } catch (error) {
      this.logger.error('Error in check-in reminder cron job', error);
    }
  }

  // find user who haven't check out
  async findUsersWithoutCheckOut(today: Date): Promise<User[]> {
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));

    // Get all active users
    const activeUsers = await this.userRepository.find({
      where: { status: UserStatus.ACTIVE }, // Assuming UserStatus.ACTIVE is the enum value
    });

    // Get users who have checked out today
    const usersWithCheckOut = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .select('attendance.user_id')
      .where('attendance.attendance_date = :today', { today: startOfDay })
      .andWhere('attendance.check_out IS NOT NULL')
      .getRawMany();

    const checkedOutUserIds = usersWithCheckOut.map(
      (row) => row.attendance_user_id,
    );

    // Filter out users who haven't checked out
    const usersWithoutCheckOut = activeUsers.filter(
      (user) => !checkedOutUserIds.includes(user.id),
    );

    return usersWithoutCheckOut;
  }

  // Cron job to send check-out reminders at 17h30 on weekdays (Monday to Friday)
  @Cron('0 30 17 * * 1-5', {
    name: 'checkOutReminder',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleCheckOutReminder() {
    try {
      this.logger.debug('Running check-out reminder cron job at 5:30 PM');

      const today = new Date();
      const usersWithoutCheckOut = await this.findUsersWithoutCheckOut(today);

      if (usersWithoutCheckOut.length === 0) {
        this.logger.debug('No users need check-out reminders today');
        return;
      }

      const userIds = usersWithoutCheckOut.map((user) => user.id);

      const payload: SocketPayloadDto = {
        type: NotificationType.CHECK_OUT_REMINDER,
        title: 'Check-Out Reminder',
        message: 'Please remember to check out for today!',
        metadata: {},
        timestamp: new Date().toISOString(),
      };

      this.gateway.emitToUsers(userIds, 'notification', payload);
      this.logger.debug(`Sent check-out reminders to ${userIds.length} users`);

      const notificationPayload = {
        type: NotificationType.CHECK_OUT_REMINDER,
        title: 'Check-Out Reminder',
        content: 'Please remember to check out for today!',
      };

      await this.createBulk(userIds, notificationPayload);
      this.logger.debug(
        `Saved ${userIds.length} check-out reminder notifications to the database`,
      );
    } catch (error) {
      this.logger.error('Error in check-out reminder cron job', error);
    }
  }
}
