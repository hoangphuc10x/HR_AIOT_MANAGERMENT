import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DepartmentsRepository } from './departments.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import {
  DataSource,
  Repository,
  ILike,
  QueryRunner,
  Not,
  IsNull,
} from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { GetEmpInDepDto } from './dto/getEmployeeInDep.dto';
import { UserDepartment } from './entities/user-department.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { DeleteDepartmentDto } from './dto/delete-department.dto';
import { NotificationService } from '../notifications/notifications.service';
import { UserDepartmentPositionEnum } from '@/common/enums/user-department-position.enum';
import { UserDepartmentPermission } from '../users/entities/user-department-permission.entity';
import { DepartmentPermissionEnum } from '@/common/enums/department-permission.enum';
import { NotificationType } from '@/common/enums/notification-type.enum';
import { Notification } from '../notifications/entities/notification.entity';
import { Department } from './entities/department.entity';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { PermissionEnum } from '@/common/enums/permission.enum';
import { UserPermission } from '../permissions/entities/user-permission.entity';
import { PermissionsService } from '../permissions/permissions.service';
import { DepartmentLevelEnum } from '@/common/enums/department-level.enum';
import { UpdateUserDepartmentPermissionDto } from './dto/update-user-department-permission.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { AuditLogActionEnum } from '@/common/enums/audit-log-action.enum';
import { UserNotification } from '../users/entities/user-notification.entity';
import { AuditLog } from '../audit-logs/entities/audit-log.entity';

@Injectable()
export class DepartmentsService {
  private logger = new Logger(DepartmentsService.name);
  constructor(
    private readonly dataSource: DataSource,
    private readonly depRepo: DepartmentsRepository,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(UserDepartmentPermission)
    private userDepPermRepo: Repository<UserDepartmentPermission>,
    @InjectRepository(UserPermission)
    private userPermRepo: Repository<UserPermission>,
    @InjectRepository(UserDepartment)
    private userDepRepo: Repository<UserDepartment>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private permissionService: PermissionsService,
    private auditLogService: AuditLogsService,
    private readonly notificationService: NotificationService,
  ) {}

  async existingUser(userId: number) {
    const user = await this.dataSource.manager.findOne(User, {
      where: { id: userId },
    });
    return user;
  }

  async getDepartmentById(dep_id: number) {
    try {
      const department = await this.dataSource.manager.findOne(Department, {
        where: {
          id: dep_id,
        },
        relations: ['userDepartments', 'userDepartments.user'],
      });
      if (!department) {
        throw new BadRequestException('Department not found');
      }
      return {
        id: department.id,
        departmentName: department.departmentName,
        level: department.level,
        status: department.status,
        employee: department.userDepartments.map((ud) => ({
          employeeId: ud.userId,
          fullName: ud.user.fullName,
          position: ud.position,
        })),
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getDepartmentList(departmentPagination: PaginationDto) {
    try {
      const page = Number(departmentPagination.page) || 1;
      const limit = Number(departmentPagination.limit) || 10;

      const query = this.depRepo
        .createQueryBuilder('department')
        .leftJoinAndSelect('department.userDepartments', 'userDepartments')
        .leftJoinAndSelect('userDepartments.user', 'user')
        .orderBy('department.createdAt', 'DESC');

      const total = await query.getCount();

      if (departmentPagination.depStatus) {
        query.where('department.status IN (:...status)', {
          status: departmentPagination.depStatus,
        });
      }

      if (departmentPagination.keyword) {
        query.andWhere('(department.departmentName LIKE :kw)', {
          kw: `%${departmentPagination.keyword}%`,
        });
      }
      const totalFilteredDepartments = await query.getCount();
      query.skip((page - 1) * limit).take(limit);

      const data = await query.getMany();

      const items = data.map((d) => ({
        id: d.id,
        departmentName: d.departmentName,
        depHead:
          d.userDepartments.find(
            (ud) => ud.position === UserDepartmentPositionEnum.HEAD,
          )?.user?.fullName || null,
        empNumber: d.userDepartments.length,
        status: d.status,
      }));

      return {
        items,
        total,
        totalFilteredDepartments,
        page,
        limit,
        totalPages: Math.ceil(totalFilteredDepartments / limit),
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getDepartmentCardData() {
    try {
      const [totalDepartment, totalActive, totalInactive, totalDeleted] =
        await Promise.all([
          this.depRepo.count(), // all (excluding soft deleted)
          this.depRepo.count({ where: { status: 1 } }),
          this.depRepo.count({ where: { status: 2 } }),
          this.depRepo.count({
            withDeleted: true,
            where: { deletedAt: Not(IsNull()) },
          }),
        ]);

      const totalEmployee = await this.userRepo.count();

      return {
        totalDepartment,
        totalActive,
        totalInactive,
        totalDeleted,
        totalEmployee,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getEmployeeInDepartment(data: GetEmpInDepDto) {
    try {
      const userDep = await this.userDepRepo.find({
        relations: ['user', 'user.userRoles', 'user.userRoles.role'],
        where: {
          department: { id: data.dep_id },
        },
      });
      const empList = userDep.map((ud) => ({
        userId: ud.user.id,
        fullName: ud.user.fullName,
        email: ud.user.email,
        address: ud.user.address,
        dateOfBirth: ud.user.dateOfBirth,
        phone: ud.user.phone,
        avatarUrl: ud.user.avatarUrl,
        position: ud.position,
        status: ud.user.status,
        sex: ud.user.sex,
        roles: ud.user.userRoles.map((ur) => ur.role.name),
        createdAt: ud.user.createdAt,
      }));
      return empList;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async searchDepartmentByName(name: string, page?: number) {
    try {
      if (!page) {
        page = 1;
      }
      if (name === '') return await this.getDepartmentList({ page, limit: 10 });
      const limit = 10;
      const result = await this.depRepo.paginate(
        {
          relations: ['user', 'userDepartments'],
          where: {
            departmentName: ILike(`%${name}%`),
          },
        },
        page,
        limit,
      );
      const items = result.data.map((d) => ({
        id: d.id,
        departmentName: d.departmentName,
        // depHead: d.user?.fullName || null,
        empNumber: d.userDepartments.length,
        status: d.status,
      }));
      return {
        items,
        total: result.total,
        page: page,
        limit: result.limit,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
  async addUserPermission(departmentId: number, queryRunner: QueryRunner) {
    const department = await queryRunner.manager.findOne(Department, {
      where: {
        id: departmentId,
      },
    });
    if (!department) {
      this.logger.log(departmentId);
      throw new NotFoundException();
    }
    const userIdsInDepartment = await queryRunner.manager.find(UserDepartment, {
      where: {
        departmentId: departmentId,
      },
    });
    if (userIdsInDepartment.length === 0) {
      return;
    }
    const listUserIds = userIdsInDepartment.map((u) => u.userId);
    if (department.level === DepartmentLevelEnum.LEVEL_2) {
      const level_2_permission = [
        PermissionEnum.VIEW_ATTENDANCE_ALL_DEPARTMENT,
        PermissionEnum.VIEW_LEAVE_REQUEST_ALL_DEPARTMENT,
        PermissionEnum.APPROVE_LEAVE_REQUEST_ALL_DEPARTMENT,
        PermissionEnum.REJECT_LEAVE_REQUEST_ALL_DEPARTMENT,
      ];
      for (const userId of listUserIds) {
        const user_permission = level_2_permission.map((p) =>
          queryRunner.manager.create(UserPermission, {
            userId: userId,
            permissionId: p,
          }),
        );
        await queryRunner.manager.save(UserPermission, user_permission);
      }
    } else if (department.level === DepartmentLevelEnum.LEVEL_1) {
      const level_1_permission = Object.values(PermissionEnum).filter(
        (v) => typeof v === 'number',
      );
      for (const userId of listUserIds) {
        const user_permission = level_1_permission.map((p) =>
          queryRunner.manager.create(UserPermission, {
            userId: userId,
            permissionId: p,
          }),
        );
        await queryRunner.manager.save(UserPermission, user_permission);
      }
    }
  }

  async addNewDepartment(data: CreateDepartmentDto) {
    this.logger.log('data to add: ', data);
    const department_permissions = [
      DepartmentPermissionEnum.VIEW_ONLY,
      DepartmentPermissionEnum.DELETE_EMPLOYEE_IN_SPECIFIC_DEPARTMENT,
      DepartmentPermissionEnum.INVITE_EMPLOYEE_TO_SPECIFIC_DEPARTMENT,
      DepartmentPermissionEnum.UPDATE_EMPLOYEE_IN_SPECIFIC_DEPARTMENT,
      DepartmentPermissionEnum.VIEW_ALL_EMPLOYEE_IN_SPECIFIC_DEPARTMENT,
      DepartmentPermissionEnum.UPDATE_PERMISSION_IN_DEPARTMENT,
      DepartmentPermissionEnum.DELETE_DEPARTMENT,
      DepartmentPermissionEnum.UPDATE_DEPARTMENT,
    ];
    const {
      userId,
      departmentName,
      headDepartmentId,
      deputyDepartmentId,
      level,
      listOfUserIdToAdd,
    } = data;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check duplicate department name
      const trimmedDepName = departmentName
        .trim()
        .replace(/\s+/g, ' ')
        .toUpperCase();
      const existingDepName = await this.depRepo.findOne({
        where: { departmentName: trimmedDepName },
      });
      if (existingDepName) {
        throw new BadRequestException('Duplicate department name');
      }
      // Check action user existing
      const actionUser = await this.existingUser(data.userId);
      if (!actionUser) {
        throw new BadRequestException('Action user does not exist');
      }

      // Check head department existing
      if (headDepartmentId) {
        if (!(await this.existingUser(headDepartmentId))) {
          throw new BadRequestException('Head department does not exist');
        }
      }
      // Check deputy department existing
      if (deputyDepartmentId) {
        if (!(await this.existingUser(deputyDepartmentId))) {
          throw new BadRequestException('Deputy department does not exist');
        }
      }

      // Check list staff existing
      if (listOfUserIdToAdd && listOfUserIdToAdd.length > 0) {
        const existingUsers = await queryRunner.manager.find(User, {
          where: listOfUserIdToAdd.map((id) => ({ id })),
          select: ['id'],
        });

        if (existingUsers.length !== listOfUserIdToAdd.length) {
          throw new BadRequestException(
            'One or more user IDs in list not found',
          );
        }
      }

      // Create new department
      const department = queryRunner.manager.create(Department, {
        departmentName: trimmedDepName,
        level: level || 3,
      });

      const new_dep = await queryRunner.manager.save(Department, department);

      // Add head, deputy to user department and user department permission
      if (headDepartmentId) {
        const head_department = queryRunner.manager.create(UserDepartment, {
          userId: headDepartmentId,
          departmentId: new_dep.id,
          position: UserDepartmentPositionEnum.HEAD,
        });
        await queryRunner.manager.save(UserDepartment, head_department);
        // Add permission to head department
        const head_department_permission = department_permissions.map((p) =>
          queryRunner.manager.create(UserDepartmentPermission, {
            userId: headDepartmentId,
            departmentId: new_dep.id,
            departmentPermissionId: p,
          }),
        );
        await queryRunner.manager.save(
          UserDepartmentPermission,
          head_department_permission,
        );
        // Add new head department notification
        const headNotification =
          await this.notificationService.createNotification({
            receiverId: headDepartmentId,
            type: NotificationType.INVITATION_TO_DEPARTMENT,
            title: 'Department',
            content: `You are assigned as the head of the new department: ${new_dep.departmentName}`,
          });

        // Send WebSocket notification with real DB id
        this.notificationService.sendInviteNotification(
          [headNotification],
          new_dep.id,
          { id: userId, fullName: actionUser.fullName || 'System' },
        );
      }

      if (deputyDepartmentId) {
        const deputy_department = queryRunner.manager.create(UserDepartment, {
          userId: deputyDepartmentId,
          departmentId: new_dep.id,
          position: UserDepartmentPositionEnum.DEPUTY,
        });
        await queryRunner.manager.save(UserDepartment, deputy_department);
        // Add deputy department permission
        const deputy_department_permission = [
          DepartmentPermissionEnum.VIEW_ONLY,
          DepartmentPermissionEnum.VIEW_ALL_EMPLOYEE_IN_SPECIFIC_DEPARTMENT,
          DepartmentPermissionEnum.INVITE_EMPLOYEE_TO_SPECIFIC_DEPARTMENT,
          DepartmentPermissionEnum.UPDATE_EMPLOYEE_IN_SPECIFIC_DEPARTMENT,
          DepartmentPermissionEnum.UPDATE_DEPARTMENT,
        ].map((p) =>
          queryRunner.manager.create(UserDepartmentPermission, {
            userId: deputyDepartmentId,
            departmentId: new_dep.id,
            departmentPermissionId: p,
          }),
        );
        await queryRunner.manager.save(
          UserDepartmentPermission,
          deputy_department_permission,
        );
        // Add new deputy department notification
        const deputyNotification =
          await this.notificationService.createNotification({
            receiverId: deputyDepartmentId,
            type: NotificationType.INVITATION_TO_DEPARTMENT,
            title: 'Department',
            content: `You are assigned as the deputy of the new department: ${new_dep.departmentName}`,
          });
        // Send WebSocket notification
        this.notificationService.sendInviteNotification(
          [deputyNotification],
          new_dep.id,
          { id: userId, fullName: actionUser.fullName || 'System' },
        );
      }

      // Add new employee to department
      if (listOfUserIdToAdd && listOfUserIdToAdd.length > 0) {
        const new_employee_department = listOfUserIdToAdd.map((id) =>
          queryRunner.manager.create(UserDepartment, {
            userId: id,
            departmentId: new_dep.id,
          }),
        );
        await queryRunner.manager.save(UserDepartment, new_employee_department);
        const new_employee_department_permission = listOfUserIdToAdd.map((id) =>
          queryRunner.manager.create(UserDepartmentPermission, {
            userId: id,
            departmentId: new_dep.id,
            departmentPermissionId: DepartmentPermissionEnum.VIEW_ONLY,
          }),
        );
        await queryRunner.manager.save(
          UserDepartmentPermission,
          new_employee_department_permission,
        );
        // Add employee notifications
        const notificationOfEmployee =
          await this.notificationService.createBulk(listOfUserIdToAdd, {
            type: NotificationType.INVITATION_TO_DEPARTMENT,
            title: 'Invitation to Join New Department',
            content: `You have been invited to join the new department: ${new_dep.departmentName}`,
          });
        // Send WebSocket notification
        this.notificationService.sendInviteNotification(
          notificationOfEmployee,
          new_dep.id,
          { id: userId, fullName: actionUser.fullName || 'System' },
        );
      }

      // Add user permission depend on department level
      await this.addUserPermission(new_dep.id, queryRunner);
      const depp = await queryRunner.manager.findOne(Department, {
        where: { id: new_dep.id },
        relations: ['userDepartments'],
      });
      //Audit log
      await this.auditLogService.logAction(
        {
          userId: userId,
          action: AuditLogActionEnum.CREATE_DEPARTMENT,
          entityName: this.dataSource.getMetadata(Department).tableName,
          recordId: new_dep.id,
          newValue: depp,
          description: `Created department: ${new_dep.departmentName}, id : ${new_dep.id}`,
          createdAt: new Date(),
        },
        queryRunner,
      );

      await queryRunner.commitTransaction();
      return { message: 'Add new department successful' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getEmployeeToAddDepartment() {
    try {
      const empList = await this.dataSource.manager.find(User);
      return empList.map((d) => ({
        userId: d.id,
        fullName: d.fullName,
        email: d.email,
        avatarUrl: d.avatarUrl,
      }));
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async updateDepartment(data: UpdateDepartmentDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate action user
      const actionUser = await this.existingUser(data.userId);
      if (!actionUser) {
        throw new BadRequestException('User does not exist');
      }

      // Validate new head department
      if (data.newHeadDepartmentId) {
        if (!(await this.existingUser(data.newHeadDepartmentId))) {
          throw new BadRequestException('Head department does not exist');
        }
      }

      // Validate new deputy department
      if (data.newDeputyDepartmentId) {
        if (!(await this.existingUser(data.newDeputyDepartmentId))) {
          throw new BadRequestException('Deputy department does not exist');
        }
      }

      // Validate employee permissions
      if (data.employeePermissions) {
        for (const ep of data.employeePermissions) {
          if (!(await this.existingUser(ep.employeeId))) {
            throw new BadRequestException('Employee does not exist');
          }
        }
      }

      // Validate department existence
      const department = await queryRunner.manager.findOne(Department, {
        where: { id: data.departmentId },
        relations: ['userDepartments'],
      });
      if (!department) {
        throw new BadRequestException('Department does not exist');
      }
      const previousValue: any = {};
      const newValue: any = {};
      // Update department details
      if (data.newDepartmentName) {
        const trimmedDepartmentName = data.newDepartmentName
          .trim()
          .replace(/\s+/g, ' ')
          .toUpperCase();
        previousValue.departmentName = department.departmentName;
        department.departmentName = trimmedDepartmentName;
        newValue.departmentName = trimmedDepartmentName;
      }
      if (data.level !== undefined) {
        previousValue.level = department.level;
        department.level = data.level;
        newValue.level = data.level;
      }
      if (data.status !== undefined) {
        previousValue.status = department.status;
        department.status = data.status;
        newValue.status = data.status;
      }
      const departmentSave = await queryRunner.manager.save(
        Department,
        department,
      );

      // Handle new employee additions
      if (data.listOfUserIdToAdd?.length) {
        const newEmployeeDepartments = data.listOfUserIdToAdd.map((id) =>
          queryRunner.manager.create(UserDepartment, {
            userId: id,
            departmentId: data.departmentId,
          }),
        );
        const new_emp = await queryRunner.manager.save(
          UserDepartment,
          newEmployeeDepartments,
        );
        const auditLogNewEmp = new_emp.map((emp) =>
          queryRunner.manager.create(AuditLog, {
            user: { id: data.userId },
            action: AuditLogActionEnum.ADD_EMPLOYEE_INTO_DEPARTMENT,
            entityName: this.dataSource.getMetadata(UserDepartment).tableName,
            recordId: emp.userId,
            newValue: emp,
            description: `Add new emp id: ${emp.userId} into department ${department.departmentName}`,
            createdAt: new Date(),
          }),
        );
        await queryRunner.manager.save(AuditLog, auditLogNewEmp);
        const newEmployeePermissions = data.listOfUserIdToAdd.map((id) =>
          queryRunner.manager.create(UserDepartmentPermission, {
            userId: id,
            departmentId: data.departmentId,
            departmentPermissionId: DepartmentPermissionEnum.VIEW_ONLY,
          }),
        );
        await queryRunner.manager.save(
          UserDepartmentPermission,
          newEmployeePermissions,
        );
      }

      // Update head department
      if (data.newHeadDepartmentId || data.listOfHeadPermissionId?.length) {
        await this.updateHeadDepartment(data, queryRunner);
      }

      // Update deputy department
      if (data.newDeputyDepartmentId || data.listOfDeputyPermissionId?.length) {
        await this.updateDeputyDepartment(data, queryRunner);
      }

      // Update employee permissions
      if (data.employeePermissions?.length) {
        for (const employeePermission of data.employeePermissions) {
          await queryRunner.manager.delete(UserDepartmentPermission, {
            userId: employeePermission.employeeId,
            departmentId: data.departmentId,
          });
          const newPermissions =
            employeePermission.listOfEmployeePermissionId.map((p) =>
              queryRunner.manager.create(UserDepartmentPermission, {
                userId: employeePermission.employeeId,
                departmentId: data.departmentId,
                departmentPermissionId: p,
              }),
            );
          await queryRunner.manager.save(
            UserDepartmentPermission,
            newPermissions,
          );
        }
      }

      // const updatedDepartment = await queryRunner.manager.findOne(Department, {
      //   where: { id: department.id },
      //   relations: ['userDepartments'],
      // });

      //Audit log
      if (
        Object.keys(previousValue).length > 0 &&
        Object.keys(newValue).length > 0
      ) {
        await this.auditLogService.logAction(
          {
            userId: data.userId,
            action: AuditLogActionEnum.UPDATE_DEPARTMENT,
            entityName: this.dataSource.getMetadata(Department).tableName,
            recordId: department.id,
            previousValue: previousValue,
            newValue: newValue,
            description: `Updated department: ${department.departmentName}`,
            createdAt: new Date(),
          },
          queryRunner,
        );
      }

      // Generate notification message
      const messageParts: string[] = [];
      if (data.newDepartmentName) {
        messageParts.push(`New department name: ${data.newDepartmentName}`);
      }
      if (data.newHeadDepartmentId) {
        messageParts.push(
          `New head assigned: User ${data.newHeadDepartmentId}`,
        );
      }
      if (data.newDeputyDepartmentId) {
        messageParts.push(
          `New deputy assigned: User ${data.newDeputyDepartmentId}`,
        );
      }
      if (data.listOfUserIdToAdd?.length) {
        messageParts.push(
          `Invited users: ${data.listOfUserIdToAdd.join(', ')}`,
        );
      }
      const message = `Your department ${departmentSave.departmentName} has been updated ${messageParts.length ? 'with changes: ' + messageParts.join('; ') : ''}.`;

      // Get all users in department
      const usersInDepartment = await queryRunner.manager.find(UserDepartment, {
        where: { departmentId: data.departmentId },
        select: ['userId'],
      });
      const allUserIds = [
        ...new Set([
          ...usersInDepartment.map((u) => u.userId),
          ...(data.listOfUserIdToAdd ?? []),
        ]),
      ];

      // Create and save notifications
      if (allUserIds.length > 0) {
        await this.notificationService.createBulk(allUserIds, {
          type: NotificationType.UPDATE_DEPARTMENT_INFORMATION,
          title: 'Department',
          content: message,
        });
        this.notificationService.sendCustomNotification(
          allUserIds,
          'notification',
          {
            type: NotificationType.UPDATE_DEPARTMENT_INFORMATION,
            title: 'Department',
            message: message,
            metadata: { departmentId: data.departmentId },
            timestamp: new Date().toISOString(),
          },
        );
      }

      await queryRunner.commitTransaction();
      return { message: 'Update department successful' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error updating department:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async updateHeadDepartment(
    data: UpdateDepartmentDto,
    queryRunner: QueryRunner,
  ) {
    const { newHeadDepartmentId, listOfHeadPermissionId, departmentId } = data;

    if (newHeadDepartmentId) {
      const existingUserDepartment = await queryRunner.manager.findOne(
        UserDepartment,
        {
          where: { userId: newHeadDepartmentId, departmentId },
        },
      );
      if (existingUserDepartment) {
        const permissions = await queryRunner.manager.find(
          UserDepartmentPermission,
          {
            where: { userId: newHeadDepartmentId, departmentId },
          },
        );
        await queryRunner.manager.delete(
          UserDepartmentPermission,
          permissions.map((p) => ({
            userId: p.userId,
            departmentId: p.departmentId,
            departmentPermissionId: p.departmentPermissionId,
          })),
        );
        await queryRunner.manager.delete(UserDepartment, {
          userId: newHeadDepartmentId,
          departmentId,
        });
      }

      const currentHead = await queryRunner.manager.findOne(UserDepartment, {
        where: { departmentId, position: UserDepartmentPositionEnum.HEAD },
      });

      if (!currentHead) {
        await queryRunner.manager.save(UserDepartment, {
          userId: newHeadDepartmentId,
          departmentId,
          position: UserDepartmentPositionEnum.HEAD,
        });
        const headPermissions = Object.values(DepartmentPermissionEnum)
          .filter((p) => typeof p === 'number')
          .map((p) =>
            queryRunner.manager.create(UserDepartmentPermission, {
              userId: newHeadDepartmentId,
              departmentId,
              departmentPermissionId: p,
            }),
          );
        await queryRunner.manager.save(
          UserDepartmentPermission,
          headPermissions,
        );
      } else {
        const oldHeadId = currentHead.userId;
        await queryRunner.manager.update(
          UserDepartment,
          { departmentId, position: UserDepartmentPositionEnum.HEAD },
          { userId: newHeadDepartmentId },
        );
        await queryRunner.manager.update(
          UserDepartmentPermission,
          { userId: oldHeadId, departmentId },
          { userId: newHeadDepartmentId },
        );

        const employee = queryRunner.manager.create(UserDepartment, {
          userId: oldHeadId,
          departmentId,
        });
        const employeePermission = queryRunner.manager.create(
          UserDepartmentPermission,
          {
            userId: oldHeadId,
            departmentId,
            departmentPermissionId: DepartmentPermissionEnum.VIEW_ONLY,
          },
        );
        await queryRunner.manager.save(UserDepartment, employee);
        await queryRunner.manager.save(
          UserDepartmentPermission,
          employeePermission,
        );
      }
      const newHead = await queryRunner.manager.findOne(UserDepartment, {
        where: {
          departmentId: departmentId,
          position: UserDepartmentPositionEnum.HEAD,
        },
      });
      await this.auditLogService.logAction(
        {
          userId: data.userId,
          action: AuditLogActionEnum.UPDATE_DEPARTMENT,
          entityName: this.dataSource.getMetadata(UserDepartment).tableName,
          recordId: currentHead?.userId,
          previousValue: currentHead,
          newValue: newHead,
          description: `Updated department id: ${departmentId} , new head department id: ${newHead?.userId} `,
          createdAt: new Date(),
        },
        queryRunner,
      );
    }

    if (listOfHeadPermissionId?.length) {
      const currentHead = await queryRunner.manager.findOne(UserDepartment, {
        where: { departmentId, position: UserDepartmentPositionEnum.HEAD },
      });
      if (!currentHead) {
        throw new BadRequestException(
          'Head department position does not exist',
        );
      }
      await queryRunner.manager.delete(UserDepartmentPermission, {
        userId: currentHead.userId,
        departmentId,
      });
      const newPermissions = listOfHeadPermissionId.map((p) =>
        queryRunner.manager.create(UserDepartmentPermission, {
          userId: currentHead.userId,
          departmentId,
          departmentPermissionId: p,
        }),
      );
      await queryRunner.manager.save(UserDepartmentPermission, newPermissions);
    }
  }

  private async updateDeputyDepartment(
    data: UpdateDepartmentDto,
    queryRunner: QueryRunner,
  ) {
    const { newDeputyDepartmentId, listOfDeputyPermissionId, departmentId } =
      data;

    if (newDeputyDepartmentId) {
      const existingUserDepartment = await queryRunner.manager.findOne(
        UserDepartment,
        {
          where: { userId: newDeputyDepartmentId, departmentId },
        },
      );
      if (existingUserDepartment) {
        const permissions = await queryRunner.manager.find(
          UserDepartmentPermission,
          {
            where: { userId: newDeputyDepartmentId, departmentId },
          },
        );
        await queryRunner.manager.delete(
          UserDepartmentPermission,
          permissions.map((p) => ({
            userId: p.userId,
            departmentId: p.departmentId,
            departmentPermissionId: p.departmentPermissionId,
          })),
        );
        await queryRunner.manager.delete(UserDepartment, {
          userId: newDeputyDepartmentId,
          departmentId,
        });
      }

      const currentDeputy = await queryRunner.manager.findOne(UserDepartment, {
        where: { departmentId, position: UserDepartmentPositionEnum.DEPUTY },
      });

      if (!currentDeputy) {
        await queryRunner.manager.save(UserDepartment, {
          userId: newDeputyDepartmentId,
          departmentId,
          position: UserDepartmentPositionEnum.DEPUTY,
        });
        const deputyPermissions = [
          DepartmentPermissionEnum.VIEW_ONLY,
          DepartmentPermissionEnum.VIEW_ALL_EMPLOYEE_IN_SPECIFIC_DEPARTMENT,
          DepartmentPermissionEnum.INVITE_EMPLOYEE_TO_SPECIFIC_DEPARTMENT,
          DepartmentPermissionEnum.UPDATE_EMPLOYEE_IN_SPECIFIC_DEPARTMENT,
          DepartmentPermissionEnum.UPDATE_DEPARTMENT,
        ].map((p) =>
          queryRunner.manager.create(UserDepartmentPermission, {
            userId: newDeputyDepartmentId,
            departmentId,
            departmentPermissionId: p,
          }),
        );
        await queryRunner.manager.save(
          UserDepartmentPermission,
          deputyPermissions,
        );
      } else {
        const oldDeputyId = currentDeputy.userId;
        await queryRunner.manager.update(
          UserDepartment,
          { departmentId, position: UserDepartmentPositionEnum.DEPUTY },
          { userId: newDeputyDepartmentId },
        );
        await queryRunner.manager.update(
          UserDepartmentPermission,
          { userId: oldDeputyId, departmentId },
          { userId: newDeputyDepartmentId },
        );

        const employee = queryRunner.manager.create(UserDepartment, {
          userId: oldDeputyId,
          departmentId,
        });
        const employeePermission = queryRunner.manager.create(
          UserDepartmentPermission,
          {
            userId: oldDeputyId,
            departmentId,
            departmentPermissionId: DepartmentPermissionEnum.VIEW_ONLY,
          },
        );
        await queryRunner.manager.save(UserDepartment, employee);
        await queryRunner.manager.save(
          UserDepartmentPermission,
          employeePermission,
        );
      }
      const newDeputy = await queryRunner.manager.findOne(UserDepartment, {
        where: {
          departmentId: departmentId,
          position: UserDepartmentPositionEnum.DEPUTY,
        },
      });
      await this.auditLogService.logAction(
        {
          userId: data.userId,
          action: AuditLogActionEnum.UPDATE_DEPARTMENT,
          entityName: this.dataSource.getMetadata(UserDepartment).tableName,
          recordId: currentDeputy?.userId,
          previousValue: currentDeputy,
          newValue: newDeputy,
          description: `Updated department id: ${departmentId} , new deputy department id: ${newDeputy?.userId} `,
          createdAt: new Date(),
        },
        queryRunner,
      );
    }

    if (listOfDeputyPermissionId?.length) {
      const currentDeputy = await queryRunner.manager.findOne(UserDepartment, {
        where: { departmentId, position: UserDepartmentPositionEnum.DEPUTY },
      });
      if (!currentDeputy) {
        throw new BadRequestException(
          'Deputy department position does not exist',
        );
      }
      await queryRunner.manager.delete(UserDepartmentPermission, {
        userId: currentDeputy.userId,
        departmentId,
      });
      const newPermissions = listOfDeputyPermissionId.map((p) =>
        queryRunner.manager.create(UserDepartmentPermission, {
          userId: currentDeputy.userId,
          departmentId,
          departmentPermissionId: p,
        }),
      );
      await queryRunner.manager.save(UserDepartmentPermission, newPermissions);
    }
  }

  async softDeleteDepartment(data: DeleteDepartmentDto) {
    const { user_id, dep_id } = data;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check action user existing
      const actionUser = await queryRunner.manager.findOne(User, {
        where: { id: user_id },
      });
      if (!actionUser) {
        throw new BadRequestException('Action user does not exist');
      }

      // Check department id existing
      const dep = await queryRunner.manager.findOne(Department, {
        where: { id: dep_id },
      });
      if (!dep) {
        throw new BadRequestException('Department does not exist');
      }

      // Permission check
      const canDeleteDepartment =
        (await this.permissionService.hasUserPermission(
          user_id,
          PermissionEnum.DELETE_DEPARTMENT_ALL_DEPARTMENT,
        )) ||
        (await this.permissionService.hasUserDepartmentPermission(
          user_id,
          dep_id,
          DepartmentPermissionEnum.DELETE_DEPARTMENT,
        ));

      if (!canDeleteDepartment) {
        throw new ForbiddenException(
          'You do not have permission to delete this department',
        );
      }

      // Get user list in department
      const userDepartments = await queryRunner.manager.find(UserDepartment, {
        where: { departmentId: dep_id },
        relations: ['user'],
      });
      const listOfUserIdInDepartment = userDepartments.map((ud) => ud.userId);

      // Delete user in department
      await queryRunner.manager.delete(UserDepartment, {
        departmentId: dep_id,
      });
      await queryRunner.manager.delete(UserDepartmentPermission, {
        departmentId: dep_id,
      });

      // Soft delete department
      await queryRunner.manager.softDelete(Department, { id: dep_id });

      // Create a single notification
      const notification = queryRunner.manager.create(Notification, {
        type: NotificationType.DELETE_DEPARTMENT,
        title: 'Department deleted',
        content: `Your department "${dep.departmentName}" has been deleted. Please wait for reassignment.`,
      });
      await queryRunner.manager.save(Notification, notification);

      // Create UserNotification for each user
      const userNotifications = listOfUserIdInDepartment.map((userId) =>
        queryRunner.manager.create(UserNotification, {
          user: { id: userId },
          notification,
          isRead: false,
        }),
      );
      if (userNotifications.length > 0) {
        await queryRunner.manager.save(UserNotification, userNotifications);
      }

      // Audit log
      // Audit log
      await this.auditLogService.logAction(
        {
          userId: user_id,
          action: AuditLogActionEnum.DELETE_DEPARTMENT,
          entityName: this.dataSource.getMetadata(Department).tableName,
          recordId: dep.id,
          previousValue: dep,
          description: `Soft delete department: ${dep.departmentName}`,
          createdAt: new Date(),
        },
        queryRunner,
      );

      await queryRunner.commitTransaction();
      return { message: 'Soft delete department successful' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error); // Replace with logger if available
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Delete user in department with permission check
  async deleteUserInDepartment(
    actorId: number,
    userId: number,
    departmentId: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // check permission
      const canDelete =
        (await this.permissionService.hasUserPermission(
          actorId,
          PermissionEnum.REMOVE_EMPLOYEE_ALL_DEPARTMENT,
        )) ||
        (await this.permissionService.hasUserDepartmentPermission(
          actorId,
          departmentId,
          DepartmentPermissionEnum.DELETE_EMPLOYEE_IN_SPECIFIC_DEPARTMENT,
        ));
      if (!canDelete) {
        throw new ForbiddenException(
          'You do not have permission to delete user in this department',
        );
      }

      // verify record exist
      const record = await queryRunner.manager.findOne(UserDepartment, {
        where: { userId, departmentId },
        relations: ['department'],
      });
      if (!record) {
        throw new NotFoundException(
          `User ${userId} is not in Department ${departmentId}`,
        );
      }

      // delete UserDepartment
      await queryRunner.manager.remove(UserDepartment, record);

      // delete UserDepartmentPermission
      await queryRunner.manager.delete(UserDepartmentPermission, {
        userId,
        departmentId,
      });

      const department = await queryRunner.manager.findOne(Department, {
        where: { id: departmentId },
      });
      // create notification for user deleted
      const notifyToUser = queryRunner.manager.create(Notification, {
        receiver: { id: userId },
        referenceId: departmentId,
        type: NotificationType.DELETE_OUT_OF_DEPARTMENT,
        title: 'Department',
        content: `You are deleted from department: ${record.department.departmentName}`,
      });

      await queryRunner.manager.save(notifyToUser);

      // Create UserNotification
      const userNotification = queryRunner.manager.create(UserNotification, {
        user: { id: userId },
        notification: notifyToUser,
        isRead: false,
      });
      await queryRunner.manager.save(userNotification);

      await this.notificationService.sendCustomNotification(
        [userId],
        'notification',
        {
          type: NotificationType.DELETE_OUT_OF_DEPARTMENT,
          title: 'Delete user from department',
          message: `Your have deleted out of department "${department?.departmentName}"`,
          metadata: {
            departmentId: department?.id,
            departmentName: department?.departmentName,
          },
          timestamp: new Date().toISOString(),
        },
      );
      // log audit
      const user_dep = await queryRunner.manager.find(UserDepartment, {
        where: { departmentId: departmentId },
      });
      const updated_user_dep = await queryRunner.manager.find(UserDepartment, {
        where: { departmentId: departmentId },
      });

      await this.auditLogService.logAction(
        {
          userId: actorId,
          action: AuditLogActionEnum.REMOVE_EMPLOYEE_FROM_DEPARTMENT,
          entityName: this.dataSource.getMetadata(UserDepartment).tableName,
          previousValue: user_dep,
          newValue: updated_user_dep,
          description: `delete user ${userId} from department ${departmentId}`,
          createdAt: new Date(),
        },
        queryRunner,
      );

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: `User ${userId} removed from Department ${departmentId}`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(
        `[deleteUserInDepartment] Error when actor ${actorId} tries to remove user ${userId} from department ${departmentId}:`,
        error,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  //user service call
  async getEmployeesByHeadDepartment(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    try {
      const cacheKey = `employees_${userId}_page_${page}`;

      const cachedData = await this.cacheManager.get(cacheKey);
      if (cachedData) {
        this.logger.log(`Cache hit: ${cacheKey}`);
        return cachedData;
      }

      const [employees, total] = await this.userRepo
        .createQueryBuilder('u')
        .innerJoin('u.userDepartments', 'ud')
        .innerJoin('ud.department', 'd')
        .where('d.user.id = :userId', { userId })
        .distinct(true)
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      const data = {
        items: employees.map((emp) => ({
          userId: emp.id,
          fullName: emp.fullName,
          email: emp.email,
          phone: emp.phone,
          status: emp.status,
        })),
        total,
        page,
        limit,
      };

      await this.cacheManager.set(cacheKey, data, 60);
      this.logger.log(`Cache miss: ${cacheKey}`);

      return data;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  // async getEmployeesByDepartmentId(departmentId: string, page = 1, limit = 10) {
  //   try {
  //     const cacheKey = `employees_department_${departmentId}_page_${page}`;

  //     const cachedData = await this.cacheManager.get(cacheKey);
  //     if (cachedData) {
  //       this.logger.log(`Cache hit: ${cacheKey}`);
  //       return cachedData;
  //     }

  //     const [users, total] = await this.userRepo
  //       .createQueryBuilder('user')
  //       .innerJoin(
  //         'user.userDepartments',
  //         'ud',
  //         'ud.departmentId = :departmentId AND ud.status= :status',
  //         // { departmentId, status: UserDepartmentStatusEnum.JOINED },
  //       )
  //       .leftJoinAndSelect('user.userRoles', 'ur')
  //       .leftJoinAndSelect('ur.role', 'role')
  //       .skip((page - 1) * limit)
  //       .take(limit)
  //       .getManyAndCount();

  //     const data = {
  //       items: users.map((u) => ({
  //         userId: u.id,
  //         fullName: u.fullName,
  //         email: u.email,
  //         phone: u.phone,
  //         address: u.address,
  //         dateOfBirth: u.dateOfBirth,
  //         avatarUrl: u.avatarUrl,
  //         sex: u.sex,
  //         status: u.status,
  //         roles: u.userRoles?.map((ur) => ur.roleId) || [],
  //       })),
  //       total,
  //       page,
  //       limit,
  //     };

  //     await this.cacheManager.set(cacheKey, data, 60);
  //     this.logger.log(`Cache miss: ${cacheKey}`);
  //     return data;
  //   } catch (error) {
  //     this.logger.error(error);
  //     throw error;
  //   }
  // }

  async getDepartmentsAndPermissionsByUserId(
    userId: string,
    page = 1,
    limit = 10,
  ) {
    try {
      const cacheKey = `departments_with_permissions_${userId}_page_${page}`;

      const cachedData = await this.cacheManager.get(cacheKey);
      if (cachedData) {
        this.logger.log(`Cache hit: ${cacheKey}`);
        return cachedData;
      }

      const [departments, total] = await this.userDepRepo
        .createQueryBuilder('ud')
        .innerJoinAndSelect('ud.department', 'department')
        .leftJoinAndSelect(
          'department.userDepartmentPermissions',
          'udp',
          'udp.userId = :userId',
          { userId },
        )
        .leftJoinAndSelect('udp.permission', 'permission')
        .loadRelationCountAndMap(
          'department.empNumber',
          'department.userDepartments',
          'ud2',
          (qb) =>
            qb.where('ud2.status = :joinStatus', {
              // joinStatus: UserDepartmentStatusEnum.JOINED,
            }),
        )
        .where('ud.userId = :userId', { userId })
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      const data = {
        items: departments.map((ud) => ({
          id: ud.department.id,
          departmentName: ud.department.departmentName,
          empNumber: (ud.department as any).empNumber ?? 0,
          status: ud.department.status,
          permissions: Array.from(
            new Set(
              ud.department.userDepartmentPermissions?.map(
                (p) => p.departmentPermission.id,
              ) || [],
            ),
          ),
        })),
        total,
        page,
        limit,
      };

      await this.cacheManager.set(cacheKey, data, 60);

      this.logger.log(`Cache miss: ${cacheKey}`);
      return data;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async updateUserPermissions(
    dto: UpdateUserDepartmentPermissionDto,
  ): Promise<void> {
    try {
      const { userId, departmentId, listOfUserDepartmentPermissionId } = dto;

      // Validate input
      if (
        !userId ||
        !departmentId ||
        !Array.isArray(listOfUserDepartmentPermissionId)
      ) {
        throw new BadRequestException(
          'Invalid input: userId, departmentId, and listOfUserDepartmentPermissionId are required',
        );
      }

      // Check if user exists
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Check if department exists
      const department = await this.depRepo.findOne({
        where: { id: departmentId },
      });
      if (!department) {
        throw new NotFoundException(
          `Department with ID ${departmentId} not found`,
        );
      }
      const oldUserDepartmentPermission = await this.dataSource.manager.find(
        UserDepartmentPermission,
        {
          where: { userId: userId, departmentId: departmentId },
        },
      );
      const prevPermission = oldUserDepartmentPermission.map(
        (udp) => udp.departmentPermissionId,
      );
      // Start a transaction to ensure atomicity
      await this.userDepPermRepo.manager.transaction(
        async (transactionalEntityManager) => {
          // Delete existing permissions for the user in the department
          await transactionalEntityManager.delete(UserDepartmentPermission, {
            userId,
            departmentId,
          });

          // // Create new permission records
          // const newPermissions = listOfUserDepartmentPermissionId.map(
          //   (permissionId) => ({
          //     userId,
          //     departmentId,
          //   });

          // Create new permission records
          const newPermissions = listOfUserDepartmentPermissionId.map(
            (permissionId) => ({
              userId,
              departmentId,
              departmentPermissionId: permissionId,
            }),
          );

          // Insert new permissions
          if (newPermissions.length > 0) {
            await transactionalEntityManager.insert(
              UserDepartmentPermission,
              newPermissions,
            );
          }

          // Create notification for permission update
          await this.notificationService.createNotification({
            receiverId: userId,
            type: NotificationType.CHANGE_PERMISSION_IN_DEPARTMENT,
            title: 'Department Permission Updated',
            content: `Your permissions for the department "${department.departmentName}" have been updated.`,
          });

          // Send WebSocket notification
          await this.notificationService.sendCustomNotification(
            [userId],
            'notification',
            {
              type: NotificationType.CHANGE_PERMISSION_IN_DEPARTMENT,
              title: 'Department Permission Updated',
              message: `Your permissions for the department "${department.departmentName}" have been updated.`,
              metadata: {
                departmentId: department.id,
                departmentName: department.departmentName,
              },
              timestamp: new Date().toISOString(),
            },
          );
        },
      );

      await this.auditLogService.logAction({
        userId: userId,
        action: AuditLogActionEnum.UPDATE_USER_DEPARTMENT_PERMISSION,
        entityName: this.dataSource.getMetadata(UserDepartmentPermission)
          .tableName,
        previousValue: { listOfDepartmentPermissionId: prevPermission },
        newValue: {
          listOfDepartmentPermissionId: listOfUserDepartmentPermissionId,
        },
        description: `Updated permissions for user ${userId} in department ${departmentId}`,
        createdAt: new Date(),
      });
    } catch (error) {
      this.logger.error(
        `Failed to update permissions for user ${dto.userId} in department ${dto.departmentId}`,
        error.stack,
      );
      throw error;
    }
  }

  async getDepartmentIdsByUserId(userId: number): Promise<number[]> {
    const userDepartments = await this.userDepRepo.find({
      where: { userId },
      select: ['departmentId'],
    });

    if (!userDepartments || userDepartments.length === 0) {
      return [];
    }

    return userDepartments.map((ud) => ud.departmentId);
  }

  async getDeletedDepartments(): Promise<Department[]> {
    return this.depRepo.find({
      where: { deletedAt: Not(IsNull()) },
      withDeleted: true,
    });
  }

  async restoreDepartment(
    userId: number,
    id: number,
  ): Promise<{ message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // check user tồn tại
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // check department đã bị xoá
      const department = await queryRunner.manager.findOne(Department, {
        where: { id },
        withDeleted: true,
      });
      if (!department || !department.deletedAt) {
        throw new NotFoundException(
          `Department with ID ${id} not found or not deleted`,
        );
      }

      const previousValue = JSON.parse(JSON.stringify(department));

      // restore
      department.deletedAt = null;
      await queryRunner.manager.save(Department, department);

      // audit log
      const auditLog = queryRunner.manager.create(AuditLog, {
        action: AuditLogActionEnum.RESTORE_DEPARTMENT,
        entityName: this.dataSource.getMetadata(Department).tableName,
        recordId: id,
        previousValue,
        newValue: department,
        description: `Department id ${id} has been restored`,
        user: { id: userId },
        createdAt: new Date(),
      });
      await queryRunner.manager.save(AuditLog, auditLog);

      await queryRunner.commitTransaction();
      return {
        message: `Department with ID ${id} has been restored successfully`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async hardDeleteDepartment(
    userId: number,
    id: number,
  ): Promise<{ message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // check user tồn tại
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // check department tồn tại
      const department = await queryRunner.manager.findOne(Department, {
        where: { id },
        withDeleted: true,
      });
      if (!department) {
        throw new NotFoundException(`Department with ID ${id} not found`);
      }

      const previousValue = JSON.parse(JSON.stringify(department));

      // xoá vĩnh viễn
      await queryRunner.manager.remove(Department, department);

      // audit log
      const auditLog = queryRunner.manager.create(AuditLog, {
        action: AuditLogActionEnum.HARD_DELETE_DEPARTMENT,
        entityName: this.dataSource.getMetadata(Department).tableName,
        recordId: id,
        previousValue,
        newValue: null,
        description: `Department id ${id} has been permanently deleted`,
        user: { id: userId },
        createdAt: new Date(),
      });
      await queryRunner.manager.save(AuditLog, auditLog);

      await queryRunner.commitTransaction();
      return {
        message: `Department with ID ${id} has been permanently deleted`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
