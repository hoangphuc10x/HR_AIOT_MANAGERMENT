import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, DataSource, IsNull, In, Not } from 'typeorm';
import { CreateUserDto } from './dto/user-create.dto';
import { UserRole } from './entities/user-role.entity';
import { EmailSend } from 'src/common/repositories/send-email.repository';
import * as bcrypt from 'bcrypt';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { UserStatus } from 'src/common/enums/user-status.enum';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { AuditLog } from '../audit-logs/entities/audit-log.entity';
import { Role } from './entities/role.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { RoleDict } from './dto/user-role-count.dto';
import { RoleEnum } from 'src/common/enums/role.enum';
import { UserResponseDto } from './dto/user-response.dto';
import { UserDepartmentSearchDto } from './dto/user-department-search.dto';
import { Department } from '../departments/entities/department.entity';
import { UpdateUserDto } from './dto/user-update.dto';
import { UserDepartment } from '../departments/entities/user-department.entity';
import { SocketPayloadDto } from '@/common/dto/socket-payload.dto';
import { NotificationService } from '../notifications/notifications.service';
import { NotificationType } from '@/common/enums/notification-type.enum';
import { hash } from 'bcrypt';
import { UserPermissionInfoDto } from './dto/user-permission-response.dto';
import { UserPermission } from '../permissions/entities/user-permission.entity';
import { randomBytes } from 'crypto';
import { Permission } from '../permissions/entities/permission.entity';
import { UserDepartmentPermission } from './entities/user-department-permission.entity';
import { FileUploadService } from '../file-upload/file-upload.service';
import { type Express } from 'express';
import { AuditLogActionEnum } from '@/common/enums/audit-log-action.enum';
import { AuditLogDto } from '../audit-logs/dto/audit-logs.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly fileUploadService: FileUploadService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectRepository(UserPermission)
    private userPermissionsRepository: Repository<UserPermission>,
    private dataSource: DataSource,
    private auditLogsService: AuditLogsService,
    private emailSend: EmailSend,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private notificationService: NotificationService,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(UserDepartmentPermission)
    private userDepartmentPermissionRepository: Repository<UserDepartmentPermission>,
  ) {}

  async createUser(dto: CreateUserDto) {
    try {
      const result = await this.dataSource.transaction(async (manager) => {
        const roleRepository = manager.getRepository(Role);
        const existingRole = await roleRepository.findOne({
          where: { name: dto.userRoles },
        });
        if (!existingRole) {
          throw new BadRequestException(
            `Role with name ${dto.userRoles} does not exist`,
          );
        }

        const existingEmail = await this.userRepository.findOne({
          where: { email: dto.email },
        });
        if (existingEmail) {
          throw new BadRequestException({
            errors: { email: 'Email already exists' },
          });
        }
        const existingPhone = await this.userRepository.findOne({
          where: { phone: dto.phone },
        });
        if (existingPhone) {
          throw new BadRequestException({
            errors: { phone: 'Phone number already exists' },
          });
        }
        const existingIdentityNumber = await this.userRepository.findOne({
          where: { identityNumber: dto.identityNumber },
        });
        if (existingIdentityNumber) {
          throw new BadRequestException({
            errors: { identityNumber: 'Identity number already exists' },
          });
        }
        const codeGenerated = randomBytes(16).toString('hex');

        const userData: Partial<User> = {
          fullName: dto.fullName,
          code: codeGenerated,
          identityNumber: dto.identityNumber,
          address: dto.address,
          email: dto.email,
          phone: dto.phone,
          password: '',
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
          avatarUrl: dto.avatarUrl,
          sex: dto.sex,
          status: dto.status || UserStatus.INACTIVE,
          bankAccount: dto.bankAccount,
          bankName: dto.bankName,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        };

        const user = this.userRepository.create(userData);
        const savedUser = await manager.save(user);

        const userRole = this.userRoleRepository.create({
          userId: savedUser.id,
          roleId: existingRole.id,
        });
        await manager.save(userRole);

        // Assign permissions based on userPermissions from DTO
        if (dto.userPermissions && dto.userPermissions.length > 0) {
          const permissionsToAssign = await this.permissionRepository.findBy({
            id: In(dto.userPermissions), // Get permissions based on array of IDs
          });

          if (permissionsToAssign.length !== dto.userPermissions.length) {
            throw new BadRequestException('Some permissions do not exist');
          }

          const userPermissions = permissionsToAssign.map((permission) =>
            this.userPermissionsRepository.create({
              user: savedUser,
              permission,
            }),
          );

          await manager.save(userPermissions);
        }

        const roles = await manager.find(UserRole, {
          where: { userId: savedUser.id },
          relations: ['role'],
        });

        await this.emailSend.sendActivationLink(dto.email, savedUser.id);
        this.logger.info(`email: ${dto.email}`);
        const auditLog = manager.create(AuditLog, {
          action: AuditLogActionEnum.CREATE_USER,
          entityName: this.dataSource.getMetadata(User).tableName,
          recordId: user.id,
          newValue: user,
          description: `User ${savedUser.fullName} has been created`,
          user: { id: savedUser.id },
          createdAt: new Date(),
        });
        await manager.save(AuditLog, auditLog);

        return {
          user: savedUser,
          roles,
        };
      });

      return {
        id: result.user.id,
        userName: result.user.fullName,
        email: result.user.email,
        avatarUrl: result.user.avatarUrl,
        roles: result.roles.map((r) => r.role.name),
      };
    } catch (err) {
      console.error(err);
      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException('Could not create user');
    }
  }

  async activeAccountAndChangePasswordInit(
    userId: number,
    newPassword: string,
  ) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');
      const hashedPassword = await hash(newPassword, 10);
      user.password = hashedPassword;
      user.status = UserStatus.ACTIVE;
      await this.userRepository.save(user);
      this.logger.info(`User ${user.email} activated and changed password`);
    } catch (error) {
      this.logger.error(`Error activating account: ${error}`);
      throw error;
    }
  }

  async resetPassword(id: number, password: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = await queryRunner.manager.findOne(User, { where: { id } });
      const previousValue = JSON.parse(JSON.stringify(user));
      if (!user) throw new NotFoundException('User not found');

      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;

      await queryRunner.manager.save(User, user);
      this.logger.info(`Password reset for user: ${user.fullName}`);
      const auditLog = queryRunner.manager.create(AuditLog, {
        action: AuditLogActionEnum.CHANGE_PASSWORD,
        entityName: this.dataSource.getMetadata(User).tableName,
        recordId: user.id,
        previousValue: previousValue,
        newValue: user,
        description: `Password reset for user: ${user.fullName}`,
        user: { id: id },
        createdAt: new Date(),
      });
      await queryRunner.manager.save(AuditLog, auditLog);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error resetting password: ${error}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async verifyEmail(email: string): Promise<number> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['userRoles', 'userRoles.role'],
    });
    if (!user) {
      throw new UnauthorizedException('Email not found');
    }
    return user.id;
  }

  async deleteUser(userId: number, adminId): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId, deletedAt: IsNull() },
    });

    if (!user) {
      throw new NotFoundException('User not found or deleted');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();
      // Check and remove user from department in transaction
      const departmentRelations = await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from('user_departments')
        .where('user_id = :userId', { userId })
        .execute();

      if (departmentRelations.affected && departmentRelations.affected > 0) {
        this.logger.info(
          `User ${user.fullName} (ID: ${userId}) has been removed from ${departmentRelations.affected} departments before deletion`,
        );
      }

      // Soft delete user
      await queryRunner.manager.softDelete(User, user.id);
      // Ghi log
      const auditLog: AuditLogDto = {
        userId: adminId,
        action: AuditLogActionEnum.DELETE_USER,
        entityName: this.dataSource.getMetadata(User).tableName,
        recordId: user.id,
        previousValue: { deletedAt: null },
        newValue: { deletedAt: new Date() },
        description: `User ${user.fullName}, id:${user.id} has been soft deleted`,
        createdAt: new Date(),
      };

      await this.auditLogsService.logAction(auditLog, queryRunner);

      await queryRunner.commitTransaction();
      this.logger.info(
        `User ${user.fullName} (ID: ${userId}) has been soft deleted`,
      );

      // Clear cache
      try {
        for (let i = 1; i <= 10; i++) {
          await this.cacheManager.del(`departments_page_${i}`);
        }
        await this.cacheManager.del('departments_search_');
        this.logger.info('Department cache cleared after user deletion');
      } catch (cacheError) {
        this.logger.warn('Failed to clear cache:', cacheError);
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error deleting user ${userId}: ${error}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getAllRoleAndSex() {
    const raw1 = await this.userRoleRepository
      .createQueryBuilder('ur')
      .innerJoin('ur.role', 'role')
      .innerJoin('ur.user', 'user')
      .select('role.name', 'role')
      .addSelect('COUNT(DISTINCT ur.userId)', 'count')
      .where('role.name IN (:...roles)', {
        roles: [RoleEnum.ADMIN, RoleEnum.STAFF],
      })
      .andWhere('user.deletedAt IS NULL')
      .groupBy('role.name')
      .getRawMany();

    const maleCount = await this.userRepository.count({
      where: { sex: 1, deletedAt: IsNull() },
    });

    const femaleCount = await this.userRepository.count({
      where: { sex: 2, deletedAt: IsNull() },
    });

    const roleData: RoleDict = raw1.reduce((acc, { role, count }) => {
      switch (role) {
        case '1':
          acc['ADMIN'] = parseInt(count, 10);
          break;
        case '2':
          acc['STAFF'] = parseInt(count, 10);
          break;
      }
      return acc;
    }, {} as RoleDict);
    roleData['MALE'] = maleCount;
    roleData['FEMALE'] = femaleCount;

    return roleData;
  }

  async getUsers(userPagination: PaginationDto) {
    try {
      const query = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.userRoles', 'userRoles')
        .leftJoinAndSelect('userRoles.role', 'role')
        .innerJoin('user.userRoles', 'filterUserRoles')
        .innerJoin('filterUserRoles.role', 'filterRole')
        .leftJoinAndSelect('user.userDepartments', 'userDepartments')
        .leftJoinAndSelect('userDepartments.department', 'department')
        .orderBy('user.createdAt', 'DESC');

      const totalUsers = await query.getCount();

      if (userPagination.role) {
        query.where('filterRole.id = :roleId', { roleId: userPagination.role });
      } else if (userPagination.sex) {
        query.where('user.sex = :sex', { sex: userPagination.sex });
      }

      if (
        userPagination.departmentIds &&
        userPagination.departmentIds.length > 0
      ) {
        query.andWhere('department.id IN (:...deptIds)', {
          deptIds: userPagination.departmentIds,
        });
      }

      if (userPagination.status && userPagination.status.length > 0) {
        query.andWhere('user.status IN (:...status)', {
          status: userPagination.status,
        });
      }

      if (userPagination.keyword) {
        query.andWhere('(user.fullName LIKE :kw OR user.email LIKE :kw)', {
          kw: `%${userPagination.keyword}%`,
        });
      }

      const totalFilteredUsers = await query.getCount();

      query
        .skip((userPagination.page - 1) * userPagination.limit)
        .take(userPagination.limit);

      const data = await query.getMany();

      const roleData = await this.getAllRoleAndSex();

      return {
        employees: data.map((user, index) => ({
          no: (userPagination.page - 1) * userPagination.limit + index + 1,
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          status: user.status,
          roles: user.userRoles.map((ur) => ur.role.name),
          sex: user.sex,
        })),
        totalUsers,
        page: userPagination.page,
        limit: userPagination.limit,
        totalPages: Math.ceil(totalFilteredUsers / userPagination.limit),
        totalFilteredUsers,
        roleData,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async getUserList() {
    try {
      const userList = await this.dataSource.manager.find(User);
      return {
        employees: userList.map((user) => ({
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          status: user.status,
          sex: user.sex,
        })),
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getUser(userId: number) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: userId,
        },
        relations: [
          'userRoles',
          'userRoles.role',
          'userDepartments',
          'userDepartments.department',
          'userPermissions',
          'userPermissions.permission',
        ],
      });
      if (!user) return user;
      return UserResponseDto.fromEntity(user);
    } catch (error) {
      console.error(error);
    }
  }

  async getDepartmentAvailableForUser(dto: UserDepartmentSearchDto) {
    const { userId, departmentName } = dto;

    console.log('userId, departmentName', userId, departmentName);

    try {
      return this.departmentRepository
        .createQueryBuilder('department')
        .where('department.departmentName LIKE :name', {
          name: `%${departmentName}%`,
        })
        .andWhere(
          `department.id NOT IN (
    SELECT tmp.department_id
    FROM (
      SELECT ud.department_id
      FROM user_departments ud
      WHERE ud.user_id = :userId
      LIMIT 5
    ) AS tmp
  )`,
          { userId },
        )
        .getMany();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateUser(
    adminId,
    userId: number,
    dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.info(`Starting user update for ID: ${userId}`, {
        context: 'UsersService.updateUser',
        data: { userId, updateFields: Object.keys(dto) },
      });

      const existingUser = await this.userRepository.findOne({
        where: { id: userId },
        relations: [
          'userRoles',
          'userRoles.role',
          'userDepartments',
          'userDepartments.department',
        ],
      });

      if (!existingUser) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      const previousValue: Partial<User> = {};
      const updateData: Partial<User> = {};

      if (
        dto.fullName !== undefined &&
        dto.fullName !== existingUser.fullName
      ) {
        updateData.fullName = dto.fullName;
        previousValue.fullName = existingUser.fullName;
      }
      if (dto.email !== undefined && dto.email !== existingUser.email) {
        const existingEmail = await this.userRepository.findOne({
          where: { email: dto.email },
        });
        if (existingEmail && existingEmail.id !== userId) {
          throw new BadRequestException('Email already exists');
        }
        updateData.email = dto.email;
        previousValue.email = existingUser.email;
      }
      if (dto.phone !== undefined && dto.phone !== existingUser.phone) {
        const existingPhone = await this.userRepository.findOne({
          where: { phone: dto.phone },
        });
        if (existingPhone && existingPhone.id !== userId) {
          throw new BadRequestException('Phone number already exists');
        }
        updateData.phone = dto.phone;
        previousValue.phone = existingUser.phone;
      }
      if (dto.sex !== undefined && dto.sex !== existingUser.sex) {
        updateData.sex = dto.sex;
        previousValue.sex = existingUser.sex;
      }
      if (
        dto.dateOfBirth !== undefined &&
        new Date(dto.dateOfBirth).getTime() !==
          existingUser.dateOfBirth.getTime()
      ) {
        updateData.dateOfBirth = new Date(dto.dateOfBirth);
        previousValue.dateOfBirth = existingUser.dateOfBirth;
      }
      if (
        dto.avatarUrl !== undefined &&
        dto.avatarUrl !== existingUser.avatarUrl
      ) {
        updateData.avatarUrl = dto.avatarUrl;
        previousValue.avatarUrl = existingUser.avatarUrl;
      }
      if (dto.address !== undefined && dto.address !== existingUser.address) {
        updateData.address = dto.address;
        previousValue.address = existingUser.address;
      }
      if (
        dto.identityNumber !== undefined &&
        dto.identityNumber !== existingUser.identityNumber
      ) {
        updateData.identityNumber = dto.identityNumber;
        previousValue.identityNumber = existingUser.identityNumber;
      }

      if (dto.status !== existingUser.status) {
        updateData.status = dto.status;
        previousValue.status = existingUser.status;
      }

      if (Object.keys(updateData).length > 0) {
        await queryRunner.manager.update(User, userId, updateData);
        this.logger.info(`Updated user basic info`, {
          context: 'UsersService.updateUser',
          data: { userId, updatedFields: Object.keys(updateData) },
        });
      }

      if (dto.roles && dto.roles.length > 0) {
        await queryRunner.manager.delete(UserRole, { userId });

        this.logger.info(`Deleted existing roles for user ${userId}`, {
          context: 'UsersService.updateUser',
        });

        for (const roleName of dto.roles) {
          const role = await queryRunner.manager.findOne(Role, {
            where: { name: roleName },
          });

          if (!role) {
            throw new BadRequestException(`Role '${roleName}' not found`);
          }

          const userRole = queryRunner.manager.create(UserRole, {
            userId,
            roleId: role.id,
          });

          await queryRunner.manager.save(UserRole, userRole);
        }

        this.logger.info(`Added new roles for user ${userId}`, {
          context: 'UsersService.updateUser',
          data: { roles: dto.roles },
        });
      }

      if (dto.departments !== undefined) {
        await queryRunner.manager.delete(UserDepartment, { userId });

        this.logger.info(`Deleted existing departments for user ${userId}`, {
          context: 'UsersService.updateUser',
        });

        if (dto.departments.length > 0) {
          for (const departmentName of dto.departments) {
            const department = await this.departmentRepository.findOne({
              where: { departmentName },
            });

            if (!department) {
              throw new BadRequestException(
                `Department '${departmentName}' not found`,
              );
            }

            const userDepartment = queryRunner.manager.create(UserDepartment, {
              userId,
              departmentId: department.id,
              assignedAt: new Date(),
            });

            await queryRunner.manager.save(UserDepartment, userDepartment);
          }

          this.logger.info(`Added new departments for user ${userId}`, {
            context: 'UsersService.updateUser',
            data: { departments: dto.departments },
          });
        }
      }

      const updatedUser = await queryRunner.manager.findOne(User, {
        where: { id: userId },
        relations: [
          'userRoles',
          'userRoles.role',
          'userDepartments',
          'userDepartments.department',
        ],
      });

      this.logger.info('updated user', updatedUser);
      const auditLog = this.dataSource.manager.create(AuditLog, {
        action: AuditLogActionEnum.UPDATE_USER,
        description: `Update user id  ${userId}`,
        entityName: this.dataSource.getMetadata(User).tableName,
        recordId: userId,
        previousValue: previousValue,
        newValue: updateData,
        user: { id: adminId },
      });
      await this.dataSource.manager.save(AuditLog, auditLog);
      await queryRunner.commitTransaction();

      this.logger.info(`Successfully updated user ${userId}`, {
        context: 'UsersService.updateUser',
        data: { userId },
      });

      return UserResponseDto.fromEntity(updatedUser!);
    } catch (error) {
      await queryRunner.rollbackTransaction();

      this.logger.error(`Failed to update user ${userId}`, {
        context: 'UsersService.updateUser',
        error: error.message,
        stack: error.stack,
      });

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async deleteUserFromDepartment(
    userId: string,
    departmentId: string,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      // Remove user from department
      await queryRunner.manager.delete('user_departments', {
        userId: userId,
        departmentId: departmentId,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error deleting user ${userId} from department ${departmentId}: ${error}`,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async notifyHrLeaveToday(requesterId: number, reason?: string) {
    try {
      const requester = await this.userRepository.findOne({
        where: { id: requesterId },
      });
      if (!requester) {
        throw new Error('User not found');
      }
      // 2. Get all HR
      const hrUsers = await this.userRepository
        .createQueryBuilder('user')
        .innerJoin('user.userRoles', 'ur')
        .innerJoin('ur.role', 'role')
        .where('role.name IN (:...roleNames)', {
          // roleNames: [RoleEnum.HR, RoleEnum.ADMIN, RoleEnum.HEAD_DEPARTMENT],
          roleNames: RoleEnum.ADMIN,
        })
        .select(['user.id', 'user.fullName'])
        .getMany();

      const hrIds = hrUsers.map((u) => u.id);

      if (hrIds.length === 0) {
        return { message: 'No HR found to send notification' };
      }

      const payload: SocketPayloadDto = {
        type: NotificationType.LEAVE_REQUEST,
        title: 'Leave Request',
        message: `${requester.fullName} is requesting leave today${
          reason ? `: ${reason}` : ''
        }`,
        metadata: {
          requesterId: requester.id,
          date: new Date().toISOString().split('T')[0],
        },
        timestamp: new Date().toISOString(),
      };

      await this.notificationService.createBulk(hrIds, {
        type: NotificationType.LEAVE_REQUEST,
        title: payload.title,
        content: payload.message,
      });

      this.notificationService.sendCustomNotification(
        hrIds,
        'notification',
        payload,
      );

      return { message: `Notification sent to ${hrIds.length} HR` };
    } catch (err) {
      console.log('err:', err);
      throw err();
    }
  }

  async findUserIdByEmail(email: string): Promise<number | null> {
    const user = await this.userRepository.findOne({
      where: { email, deletedAt: IsNull() },
      select: ['id'],
    });
    return user?.id ?? null;
  }

  async getAllUsersPermissions(): Promise<
    { userId: number; permissions: number[] }[]
  > {
    const userPermissions = await this.userPermissionsRepository.find({
      relations: ['permission'],
    });

    // group by userId
    const groupedPermissions: Record<number, number[]> = {};

    userPermissions.forEach((up) => {
      if (!groupedPermissions[up.userId]) {
        groupedPermissions[up.userId] = [];
      }
      groupedPermissions[up.userId].push(up.permission.id);
    });

    // convert to array [{ userId, permissions }]
    return Object.entries(groupedPermissions).map(([userId, permissions]) => ({
      userId: Number(userId),
      permissions,
    }));
  }

  async getUserPermissionInfo(userId: number): Promise<UserPermissionInfoDto> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.userPermissions', 'userPermissions')
      .select([
        'user.id',
        'user.fullName',
        'user.email',
        'COUNT(userPermissions.permissionId) as permissionCount',
        'ARRAY_AGG(userPermissions.permissionId) as permissions',
      ])
      .where('user.id = :userId', { userId })
      .andWhere('user.deletedAt IS NULL')
      .groupBy('user.id, user.fullName, user.email')
      .getRawOne();

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return {
      id: user.id,
      name: user.fullName,
      email: user.email,
      permissionCount: parseInt(user.permissionCount, 10) || 0,
      permissions: user.permissions
        ? user.permissions.filter((id: number) => id !== null)
        : [],
    };
  }

  async getUsersWithPermissionCount() {
    const users = await this.userRepository.find({
      relations: ['userPermissions'],
    });

    return users.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      permissionCount: user.userPermissions?.length || 0,
    }));
  }

  async getUserPermissions(
    userId: number,
    departmentId: number,
  ): Promise<number[]> {
    try {
      const records = await this.userDepartmentPermissionRepository.find({
        where: { userId, departmentId },
        select: ['departmentPermissionId'],
      });

      return records.map((r) => r.departmentPermissionId);
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      throw new Error('Failed to fetch user permissions');
    }
  }
  async updateAvatar(userId: number, file: Express.Multer.File) {
    try {
      const img = await this.fileUploadService.uploadImage(file);
      //check user exist
      const user = await this.dataSource.manager.findOne(User, {
        where: { id: userId },
      });
      if (!user) {
        throw new BadRequestException('user does not exist');
      }
      //Delete old avatar url if exist
      if (user.publicImgId) {
        await this.fileUploadService.deleteImage(user.publicImgId);
      }
      //update avatar url of this user
      user.avatarUrl = img.url;
      user.publicImgId = img.publicId;
      await this.dataSource.manager.save(user);
      this.logger.info(
        `userId :${userId} , new avatar url : ${user.avatarUrl}`,
      );
      return {
        message: `update avatar url successful`,
        avatarUrl: user.avatarUrl,
      };
    } catch (error) {
      this.logger.info(error);
      throw error;
    }
  }

  async getDeletedUsers() {
    const deletedUser = await this.userRepository.find({
      select: [
        'id',
        'identityNumber',
        'fullName',
        'email',
        'phone',
        'dateOfBirth',
        'createdAt',
        'updatedAt',
        'deletedAt',
      ],
      where: { deletedAt: Not(IsNull()) },
      withDeleted: true,
      relations: ['userDepartments'],
    });
    return deletedUser;
  }
}
