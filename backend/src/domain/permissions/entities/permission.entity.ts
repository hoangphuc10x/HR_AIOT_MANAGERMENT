import { PermissionEnum } from '../../../common/enums/permission.enum';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserPermission } from './user-permission.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn({ type: 'tinyint' })
  id: number;

  @Column({ type: 'enum', enum: PermissionEnum })
  action: PermissionEnum;

  @OneToMany(
    () => UserPermission,
    (userPermission) => userPermission.permission,
  )
  userPermissions: UserPermission[];
}
