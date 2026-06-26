import { DepartmentPermissionEnum } from '../../../common/enums/department-permission.enum';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserDepartmentPermission } from '../../users/entities/user-department-permission.entity';
import { UserPermission } from './user-permission.entity';

@Entity('department_permissions')
export class DepartmentPermission {
  @PrimaryGeneratedColumn({ type: 'tinyint' })
  id: number;

  @Column({ type: 'enum', enum: DepartmentPermissionEnum })
  action: DepartmentPermissionEnum;

  @OneToMany(
    () => UserDepartmentPermission,
    (userDepartmentPermission) => userDepartmentPermission.departmentPermission,
  )
  userDepartmentPermissions: UserDepartmentPermission[];

  @OneToMany(
    () => UserPermission,
    (userPermission) => userPermission.permission,
  )
  userPermissions: UserPermission[];
}
