import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserDepartment } from './user-department.entity';
import { DepartmentStatus } from 'src/common/enums/department-status.enum';
import { UserDepartmentPermission } from 'src/domain/users/entities/user-department-permission.entity';
import { DepartmentLevelEnum } from '@/common/enums/department-level.enum';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn({ type: 'tinyint' })
  id: number;

  @Column({ name: 'department_name' })
  departmentName: string;

  @Column({
    type: 'enum',
    enum: DepartmentLevelEnum,
    default: DepartmentLevelEnum.LEVEL_1,
  })
  level: DepartmentLevelEnum;
  @OneToMany(
    () => UserDepartment,
    (userDepartment) => userDepartment.department,
  )
  userDepartments: UserDepartment[];

  @OneToMany(() => UserDepartmentPermission, (udp) => udp.department)
  userDepartmentPermissions: UserDepartmentPermission[];

  @Column({
    type: 'enum',
    enum: DepartmentStatus,
    default: DepartmentStatus.ACTIVE,
  })
  status: DepartmentStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
