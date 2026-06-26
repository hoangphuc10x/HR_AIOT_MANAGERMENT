import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/domain/users/entities/user.entity';
import { Department } from 'src/domain/departments/entities/department.entity';
import { DepartmentPermission } from '@/domain/permissions/entities/department-permission.entity';

@Entity('user_department_permissions')
export class UserDepartmentPermission {
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @PrimaryColumn({ name: 'department_id' })
  departmentId: number;

  @PrimaryColumn({ name: 'department_permission_id' })
  departmentPermissionId: number;

  @ManyToOne(() => User, (user) => user.userDepartmentPermissions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(
    () => Department,
    (department) => department.userDepartmentPermissions,
  )
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(
    () => DepartmentPermission,
    (departmentPermission) => departmentPermission.userDepartmentPermissions,
  )
  @JoinColumn({ name: 'department_permission_id' })
  departmentPermission: DepartmentPermission;

  @CreateDateColumn({ name: 'assigned_at' })
  assignedAt: Date;
}
