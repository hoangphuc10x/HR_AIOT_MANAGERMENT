import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from './user-role.entity';
import { UserDepartment } from 'src/domain/departments/entities/user-department.entity';
import { UserStatus } from 'src/common/enums/user-status.enum';
import { SexEnum } from 'src/common/enums/sex.enum';
import { UserDepartmentPermission } from './user-department-permission.entity';
import { UserPermission } from '../../permissions/entities/user-permission.entity';
import { Attendance } from '@/domain/attendances/entities/attendance.entity';
import { AuditLog } from '@/domain/audit-logs/entities/audit-log.entity';
import { LeaveRequest } from '@/domain/leave-requests/entities/leave-request.entity';
import { Logo } from '@/domain/file-upload/entities/logo.entity';
import { UserNotification } from './user-notification.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ name: 'code', unique: true })
  code: string;

  @Column({
    name: 'identity_number',
    unique: true,
    type: 'varchar',
    length: 12,
  })
  identityNumber: string;

  @Column()
  address: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'date_of_birth', nullable: true })
  dateOfBirth: Date;

  @Column({ unique: true })
  phone: string;

  @Column()
  password: string;

  @Column({ name: 'refresh_token', nullable: true })
  refreshToken!: string;

  @Column({ name: 'expires_at', nullable: true })
  expiresAt!: Date;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ name: 'public_img_id', nullable: true })
  publicImgId: string;

  @Column({ type: 'enum', enum: SexEnum })
  sex: SexEnum;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ name: 'bank_account', type: 'varchar', length: 20 })
  bankAccount: string;

  @Column({ name: 'bank_name' })
  bankName: string;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];

  @OneToMany(() => UserDepartment, (userDepartment) => userDepartment.user)
  userDepartments: UserDepartment[];

  @OneToMany(() => UserDepartmentPermission, (udp) => udp.user)
  userDepartmentPermissions: UserDepartmentPermission[];

  @OneToMany(() => UserPermission, (up) => up.user)
  userPermissions: UserPermission[];

  @OneToMany(() => Attendance, (attendance) => attendance.user)
  attendances: Attendance[];

  @OneToMany(() => AuditLog, (auditLog) => auditLog.user)
  auditLogs: AuditLog[];

  @OneToMany(() => Logo, (logos) => logos.user)
  logos: Logo[];

  @OneToMany(() => LeaveRequest, (leaveRequest) => leaveRequest.user)
  leaveRequests: LeaveRequest[];

  @OneToMany(() => LeaveRequest, (leaveRequest) => leaveRequest.approvedBy)
  leaveRequestApprovedBys: LeaveRequest[];

  @OneToMany(
    () => UserNotification,
    (userNotification) => userNotification.user,
  )
  userNotifications: UserNotification[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
