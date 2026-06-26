import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { DataSource, In, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { UserPermission } from './entities/user-permission.entity';
import { UserDepartmentPermission } from '@/domain/users/entities/user-department-permission.entity';
import { PermissionEnum } from '@/common/enums/permission.enum';
import { DepartmentPermissionEnum } from '@/common/enums/department-permission.enum';
import { User } from '../users/entities/user.entity';
import { UpdateUserPermissionDto } from './dto/user-permission';
import { Notification } from '../notifications/entities/notification.entity';
import { NotificationType } from '@/common/enums/notification-type.enum';
import { NotificationService } from '../notifications/notifications.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditLogActionEnum } from '@/common/enums/audit-log-action.enum';
import { UserNotification } from '../users/entities/user-notification.entity';

@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name);
  constructor(
    private readonly auditLogService: AuditLogsService,
    private readonly notificationService: NotificationService,
    private readonly dataSource: DataSource,
    @InjectRepository(Permission)
    private readonly permissionsRepository: Repository<Permission>,
    @InjectRepository(UserPermission)
    private readonly userPermissionsRepository: Repository<UserPermission>,
    @InjectRepository(UserDepartmentPermission)
    private readonly userDepartmentPermissionRepository: Repository<UserDepartmentPermission>,
  ) {}

  async getAllPermissionsByUserId(userId: number): Promise<number[]> {
    const userPermissions = await this.userPermissionsRepository.find({
      where: { userId },
      relations: ['permission'],
    });
    return userPermissions.map((up) => up.permission.id);
  }

  async getUserDepartmentPermissions(userId: number) {
    try {
      const udps = await this.userDepartmentPermissionRepository.find({
        where: { userId },
        relations: ['department', 'departmentPermission'],
      });

      if (!udps || udps.length === 0) {
        return [];
      }

      const grouped = Object.values(
        udps.reduce(
          (count, udp) => {
            // Bỏ qua nếu department null
            if (!udp.department || !udp.departmentPermission) {
              return count;
            }

            const deptId = udp.departmentId;

            if (!count[deptId]) {
              count[deptId] = {
                departmentId: deptId,
                departmentName: udp.department.departmentName,
                permissions: new Set<number>(),
              };
            }

            count[deptId].permissions.add(udp.departmentPermissionId);

            return count;
          },
          {} as Record<number, any>,
        ),
      ).map((dept) => ({
        ...dept,
        permissions: Array.from(dept.permissions),
      }));

      return grouped;
    } catch (error) {
      console.error(
        `Error in getUserDepartmentPermissions for userId=${userId}:`,
        error,
      );
      return [];
    }
  }

  // Check global permission
  async hasUserPermission(
    userId: number,
    permission: PermissionEnum,
  ): Promise<boolean> {
    const perms = await this.userPermissionsRepository.find({
      where: { userId },
      relations: ['permission'],
    });

    console.log('User global permissions:', perms);

    // check user permission
    return perms.some((perm) => perm.permission?.action === permission);
  }

  // Check department-specific permission
  async hasUserDepartmentPermission(
    userId: number,
    departmentId: number,
    permission: DepartmentPermissionEnum,
  ): Promise<boolean> {
    // query all permission in department
    const perms = await this.userDepartmentPermissionRepository.find({
      where: { userId, departmentId },
      relations: ['departmentPermission'],
    });

    console.log('UDP log:', perms);

    // check permission in list user department permission
    return perms.some((perm) => perm.departmentPermission?.id === permission);
  }

  async editUserPermission(data: UpdateUserPermissionDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Check action user exists
      const userAction = await queryRunner.manager.findOne(User, {
        where: { id: data.adminId },
      });
      if (!userAction) {
        throw new BadRequestException('Action user does not exist');
      }

      // Check user exists
      const user = await queryRunner.manager.findOne(User, {
        where: { id: data.userId },
      });
      if (!user) {
        throw new BadRequestException('User does not exist');
      }
      const userPermission = await queryRunner.manager.find(UserPermission, {
        where: {
          userId: data.userId,
        },
      });
      const prevPermission = userPermission.map((up) => up.permissionId);
      // Update new permission
      await queryRunner.manager.delete(UserPermission, {
        userId: data.userId,
        permissionId: Not(In(data.listOfUserPermissionId)),
      });

      await queryRunner.manager.upsert(
        UserPermission,
        data.listOfUserPermissionId.map((pid) => ({
          userId: data.userId,
          permissionId: pid,
        })),
        ['userId', 'permissionId'],
      );

      // Save notification
      const notification = queryRunner.manager.create(Notification, {
        receiver: { id: data.userId },
        type: NotificationType.CHANGE_USER_PERMISSION,
        title: 'Update Permission',
        content: `You have been changed permissions`,
      });
      await queryRunner.manager.save(Notification, notification);

      // Create UserNotification
      const userNotification = queryRunner.manager.create(UserNotification, {
        user: { id: data.userId },
        notification,
        isRead: false,
      });
      await queryRunner.manager.save(UserNotification, userNotification);

      // Send notification
      this.notificationService.sendCustomNotification(
        [data.userId],
        'notification',
        {
          type: NotificationType.CHANGE_USER_PERMISSION,
          title: 'Update Permission',
          message: `You have been changed permissions`,
          metadata: {},
          timestamp: new Date().toISOString(),
        },
      );

      // Audit log
      await this.auditLogService.logAction(
        {
          userId: data.adminId,
          action: AuditLogActionEnum.UPDATE_USER_PERMISSION,
          entityName: this.dataSource.getMetadata(UserPermission).tableName,
          recordId: data.userId,
          previousValue: { listOfPermissionId: prevPermission },
          newValue: { listOfUserPermissionId: data.listOfUserPermissionId },
          description: `Update user permission id:${data.userId}`,
          createdAt: new Date(),
        },
        queryRunner,
      );

      await queryRunner.commitTransaction();
      return { message: 'Update user permission successful' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
