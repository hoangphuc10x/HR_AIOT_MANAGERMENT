import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Between, DataSource, IsNull, Not, Repository } from 'typeorm';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { User } from '../users/entities/user.entity';
import { LeaveRequest } from './entities/leave-request.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { NotificationType } from '@/common/enums/notification-type.enum';
import { NotificationService } from '../notifications/notifications.service';
import { UserDepartment } from '../departments/entities/user-department.entity';
import { LeaveRequestApprovalDto } from './dto/approve-leave-request.dto';
import { LeaveRequestStatus } from '@/common/enums/leave-request-status.enum';
import { AuditLog } from '../audit-logs/entities/audit-log.entity';
import { AuditLogActionEnum } from '@/common/enums/audit-log-action.enum';
import { UserNotification } from '../users/entities/user-notification.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class LeaveRequestService {
  private readonly logger = new Logger(LeaveRequestService.name);
  permissionService: any;
  constructor(
    private readonly dataSource: DataSource,
    private readonly notificationService: NotificationService,
    @InjectRepository(LeaveRequest)
    private leaveRequestRepo: Repository<LeaveRequest>,
  ) {}

  async userSendLeaveRequest(data: CreateLeaveRequestDto) {
    const { userId, leaveType, reason, startDate, endDate } = data;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check user existing
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });
      if (!user) {
        throw new BadRequestException('User does not exist');
      }

      // Get all HR IDs from department ID 1
      const hrIds = (
        await queryRunner.manager.find(UserDepartment, {
          where: { departmentId: 1 },
          select: ['userId'],
        })
      ).map((ur) => ur.userId);
      this.logger.log('hr ids:', hrIds);

      // Receiver IDs (exclude the requesting user)
      const receiverIds = hrIds.filter((i) => i !== userId);
      this.logger.log('receiver ids:', receiverIds);

      // Save new leave request record
      const leaveRequest = queryRunner.manager.create(LeaveRequest, {
        user: { id: userId },
        leaveType,
        reason,
        startDate,
        endDate,
      });
      const saveLeave = await queryRunner.manager.save(
        LeaveRequest,
        leaveRequest,
      );

      // Create a single notification
      const notification = queryRunner.manager.create(Notification, {
        type: NotificationType.LEAVE_REQUEST,
        title: `Leave Request from ${user.fullName}`,
        content: reason,
      });
      await queryRunner.manager.save(Notification, notification);

      // Create UserNotifications for receivers
      const userNotifications = receiverIds.map((id) =>
        queryRunner.manager.create(UserNotification, {
          user: { id },
          referenceId: saveLeave.id,
          notification,
          isRead: false,
        }),
      );
      if (userNotifications.length > 0) {
        await queryRunner.manager.save(UserNotification, userNotifications);
      }

      // Send WebSocket notification to receiver IDs
      this.notificationService.sendLeaveRequestNotification(
        userId,
        receiverIds,
        `Leave Request from ${user.fullName}`,
        reason,
      );

      await queryRunner.commitTransaction();
      return { message: 'Send leave request successful' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getAllLeaveRequestByUserId(userId: number) {
    try {
      const leaveRequests = await this.dataSource.manager.find(LeaveRequest, {
        where: { user: { id: userId } },
        order: { status: 1 },
      });
      return leaveRequests.map((lr) => ({
        id: lr.id,
        type: lr.leaveType,
        startDate: lr.startDate.toISOString().split('T')[0],
        endDate: lr.endDate.toISOString().split('T')[0],
        days: this.calculateDays(lr.startDate, lr.endDate),
        status: lr.status,
        reason: lr.reason,
        appliedDate: lr.createdAt.toISOString().split('T')[0],
      }));
    } catch (error) {
      this.logger.log(error);
      throw error;
    }
  }

  calculateDays(startDate: Date, endDate: Date): number {
    const diffTime = endDate.getTime() - startDate.getTime();
    return diffTime >= 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 : 0;
  }

  async leaveRequestApproval(data: LeaveRequestApprovalDto) {
    const { userId, leaveRequestId, leaveRequestStatus } = data;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Check leave request exists
      const leaveRequest = await queryRunner.manager.findOne(LeaveRequest, {
        where: { id: leaveRequestId },
        relations: ['user', 'approvedBy'],
      });
      if (!leaveRequest) {
        throw new BadRequestException('Leave request not found');
      }
      const previousValue = JSON.parse(JSON.stringify(leaveRequest.status));
      // Check user exists
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
        relations: ['leaveRequests'],
      });
      if (!user) {
        throw new BadRequestException('User ID not found');
      }

      // Check user cannot approve or reject their own leave request (except user ID 1)
      if (
        user.leaveRequests.some((lr) => lr.id === leaveRequestId) &&
        user.id !== 1
      ) {
        return { message: 'You cannot approve or reject your leave request' };
      }

      this.logger.log(user.leaveRequests);

      // Update leave request
      leaveRequest.status = leaveRequestStatus;
      leaveRequest.approvedBy = user;
      leaveRequest.approvedAt = new Date();
      await queryRunner.manager.save(LeaveRequest, leaveRequest);

      // Create notification
      const notification = queryRunner.manager.create(Notification, {
        type: NotificationType.APPROVE_LEAVE_REQUEST,
        title: 'LEAVE REQUEST APPROVAL',
        content: `Your leave request has been ${LeaveRequestStatus[leaveRequestStatus].toLowerCase()}`,
        receiver: { id: leaveRequest.user.id },
      });
      await queryRunner.manager.save(Notification, notification);

      // Create UserNotification
      const userNotification = queryRunner.manager.create(UserNotification, {
        user: { id: leaveRequest.user.id },
        referenceId: leaveRequest.id,
        notification,
        isRead: false,
      });
      await queryRunner.manager.save(UserNotification, userNotification);

      // Send WebSocket notification
      this.notificationService.sendLeaveRequestNotification(
        userId,
        [leaveRequest.user.id],
        'LEAVE REQUEST APPROVAL',
        `Your leave request has been ${LeaveRequestStatus[leaveRequestStatus].toLowerCase()}`,
      );

      // Create audit log
      const updated = await queryRunner.manager.findOne(LeaveRequest, {
        where: { id: leaveRequestId },
        relations: ['user', 'approvedBy'],
      });
      const auditLog = queryRunner.manager.create(AuditLog, {
        action:
          leaveRequestStatus === LeaveRequestStatus.APPROVED
            ? AuditLogActionEnum.ACCEPT_LEAVE_REQUEST
            : AuditLogActionEnum.REJECT_LEAVE_REQUEST,
        entityName: this.dataSource.getMetadata(LeaveRequest).tableName,
        recordId: leaveRequestId,
        previousValue: {
          status: previousValue,
          approvedBy: null,
          approvedAt: null,
        },
        newValue: {
          status: updated?.status,
          approvedBy: updated?.approvedBy?.id,
          approvedAt: updated?.approvedAt,
        },
        description: `Leave request ID ${leaveRequestId} has been ${LeaveRequestStatus[leaveRequestStatus].toLowerCase()}`,
        user: { id: userId },
        createdAt: new Date(),
      });
      await queryRunner.manager.save(AuditLog, auditLog);

      await queryRunner.commitTransaction();
      return { message: 'Update leave request successful' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getLeaveRequestById(id: number) {
    try {
      const leaveRequest = await this.dataSource.manager.findOne(LeaveRequest, {
        where: { id },
        relations: ['user', 'approvedBy'],
      });

      if (!leaveRequest) {
        throw new NotFoundException(`Leave request with id ${id} not found`);
      }

      return {
        id: leaveRequest.id,
        leaveType: leaveRequest.leaveType,
        reason: leaveRequest.reason,
        startDate: leaveRequest.startDate.toISOString().split('T')[0],
        endDate: leaveRequest.endDate.toISOString().split('T')[0],
        status: leaveRequest.status,
        sender: {
          code: leaveRequest.user.code,
          fullName: leaveRequest.user.fullName,
          email: leaveRequest.user.email,
          avatarUrl: leaveRequest.user.avatarUrl,
        },
        approvedBy: leaveRequest.approvedBy
          ? {
              code: leaveRequest.approvedBy.code,
              fullName: leaveRequest.approvedBy.fullName,
              email: leaveRequest.approvedBy.email,
              avatarUrl: leaveRequest.approvedBy.avatarUrl,
            }
          : null,
        approvedAt: leaveRequest.approvedAt,
        appliedDate: leaveRequest.createdAt,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getLeaveRequestSummary(
    page: number = 1,
    pageSize: number = 10,
    month?: number,
    year?: number,
  ) {
    try {
      const where: any = {};

      if (month && year) {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);
        where.createdAt = Between(start, end);
      }

      // const [leave_requests, total] =
      //   await this.dataSource.manager.findAndCount(LeaveRequest, {
      //     where,
      //     relations: ['user', 'approvedBy'],
      //     order: { status: 'ASC', createdAt: 'ASC' },
      //     skip: (page - 1) * pageSize,
      //     take: pageSize,
      //     withDeleted:false
      //   });
      const [leave_requests, total] = await this.dataSource
        .getRepository(LeaveRequest)
        .createQueryBuilder('lr')
        .innerJoinAndSelect('lr.user', 'user', 'user.deletedAt IS NULL') // 🔑 chỉ lấy user chưa soft delete
        .leftJoinAndSelect('lr.approvedBy', 'approvedBy')
        .where(where)
        .orderBy('lr.status', 'ASC')
        .addOrderBy('lr.createdAt', 'ASC')
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getManyAndCount();

      // Bỏ những đơn mà user null (đã bị xoá)
      const filtered = leave_requests.filter((lr) => lr.user !== null);

      const data = filtered.map((lr) => ({
        id: lr.id,
        leaveType: lr.leaveType,
        reason: lr.reason,
        startDate: lr.startDate.toISOString().split('T')[0],
        endDate: lr.endDate.toISOString().split('T')[0],
        status: lr.status,
        sender: {
          code: lr.user.code,
          fullName: lr.user.fullName,
          email: lr.user.email,
          avatarUrl: lr.user.avatarUrl,
        },
        approvedBy: lr.approvedBy
          ? {
              code: lr.approvedBy.code,
              fullName: lr.approvedBy.fullName,
              email: lr.approvedBy.email,
              avatarUrl: lr.approvedBy.avatarUrl,
            }
          : null,
        approvedAt: lr.approvedAt,
        appliedDate: lr.createdAt,
      }));

      return {
        data,
        page,
        totalPages: Math.ceil(total / pageSize),
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async softDeleteLeaveRequest(userId: number, id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      //check user exist
      const user = await queryRunner.manager.findOne(User, {
        where: {
          id: userId,
        },
      });
      if (!user) {
        throw new BadRequestException('user not found');
      }
      //check leave request exist
      const leave_request = await queryRunner.manager.findOne(LeaveRequest, {
        where: {
          id: id,
        },
        relations: ['user', 'approvedBy'],
      });
      if (!leave_request) {
        throw new NotFoundException('Leave request not found');
      }
      //soft delete leave request
      leave_request.deletedAt = new Date();
      leave_request.status = LeaveRequestStatus.DELETED;
      await queryRunner.manager.save(LeaveRequest, leave_request);

      // Create notification
      const notification = queryRunner.manager.create(Notification, {
        type: NotificationType.APPROVE_LEAVE_REQUEST,
        title: 'Leave request deleted',
        content: `Your leave request has been deleted`,
      });
      await queryRunner.manager.save(Notification, notification);

      // Create UserNotification
      const userNotification = queryRunner.manager.create(UserNotification, {
        user: { id: leave_request.user.id },
        referenceId: leave_request.id,
        notification,
        isRead: false,
      });
      await queryRunner.manager.save(UserNotification, userNotification);

      this.notificationService.sendLeaveRequestNotification(
        userId,
        [leave_request.user.id],
        'Leave request deleted',
        `Your leave request has been deleted`,
      );

      //audit log
      const auditLog = queryRunner.manager.create(AuditLog, {
        action: AuditLogActionEnum.REMOVE_LEAVE_REQUEST,
        entityName: this.dataSource.getMetadata(LeaveRequest).tableName,
        recordId: id,
        previousValue: { deletedAt: null },
        newValue: { deletedAt: new Date() },
        description: `leave request id ${id} has been soft deleted`,
        user: { id: userId },
        createdAt: new Date(),
      });
      await queryRunner.manager.save(AuditLog, auditLog);
      await queryRunner.commitTransaction();
      return { message: 'Delete leave request successful' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getDeletedLeaveRequests() {
    try {
      const leaveRequests = await this.leaveRequestRepo.find({
        where: { deletedAt: Not(IsNull()) },
        withDeleted: true,
        relations: ['user'],
      });

      return leaveRequests.map((lr) => ({
        id: lr.id,
        leaveType: lr.leaveType,
        startDate: lr.startDate,
        endDate: lr.endDate,
        reason: lr.reason,
        status: lr.status,
        createdAt: lr.createdAt,
        deletedAt: lr.deletedAt,
        user: lr.user
          ? {
              id: lr.user.id,
              fullName: lr.user.fullName,
              email: lr.user.email,
            }
          : null,
      }));
    } catch (error) {
      throw new Error(
        `Failed to fetch deleted leave requests: ${error.message}`,
      );
    }
  }

  // restore leave request
  async restoreLeaveRequest(
    userId: number,
    id: number,
  ): Promise<{ message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // check leave request đã bị xóa
      const leave_request = await queryRunner.manager.findOne(LeaveRequest, {
        where: { id },
        withDeleted: true, // cần để query bản ghi đã bị soft delete
        relations: ['user', 'approvedBy'],
      });
      if (!leave_request || !leave_request.deletedAt) {
        throw new NotFoundException(
          `LeaveRequest with ID ${id} not found or not deleted`,
        );
      }

      const previousValue = JSON.parse(JSON.stringify(leave_request));

      // restore leave request
      // leave_request.deletedAt = null;
      leave_request.status = LeaveRequestStatus.PENDING;
      await queryRunner.manager.save(LeaveRequest, leave_request);

      // lưu audit log
      const auditLog = queryRunner.manager.create(AuditLog, {
        action: AuditLogActionEnum.RESTORE_LEAVE_REQUEST,
        entityName: this.dataSource.getMetadata(LeaveRequest).tableName,
        recordId: id,
        previousValue,
        newValue: leave_request,
        description: `Leave request id ${id} has been restored`,
        user: { id: userId },
        createdAt: new Date(),
      });
      await queryRunner.manager.save(AuditLog, auditLog);

      await queryRunner.commitTransaction();
      return {
        message: `LeaveRequest with ID ${id} has been restored successfully`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error);
      throw new Error(`Failed to restore leave request: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  // delete permanently
  async hardDeleteLeaveRequest(
    userId: number,
    id: number,
  ): Promise<{ message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // check user exist
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // check leave request exist (include case soft delete)
      const leave_request = await queryRunner.manager.findOne(LeaveRequest, {
        where: { id },
        withDeleted: true,
        relations: ['user', 'approvedBy'],
      });
      if (!leave_request) {
        throw new NotFoundException(`LeaveRequest with ID ${id} not found`);
      }

      const previousValue = JSON.parse(JSON.stringify(leave_request));

      // delete leave request permanently
      await queryRunner.manager.remove(LeaveRequest, leave_request);

      // save audit log
      const auditLog = queryRunner.manager.create(AuditLog, {
        action: AuditLogActionEnum.HARD_DELETE_LEAVE_REQUEST,
        entityName: this.dataSource.getMetadata(LeaveRequest).tableName,
        recordId: id,
        previousValue,
        newValue: null,
        description: `Leave request id ${id} has been hard deleted`,
        user: { id: userId },
        createdAt: new Date(),
      });
      await queryRunner.manager.save(AuditLog, auditLog);

      await queryRunner.commitTransaction();
      return {
        message: `LeaveRequest with ID ${id} has been permanently deleted`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error);
      throw new Error(`Failed to hard delete leave request: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }
}
