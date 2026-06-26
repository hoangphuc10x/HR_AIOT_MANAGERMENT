import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Permission } from './permission.entity';

@Entity('user_permissions')
export class UserPermission {
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @PrimaryColumn({ name: 'permission_id' })
  permissionId: number;

  @ManyToOne(() => User, (user) => user.userPermissions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Permission, (permission) => permission.userPermissions)
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;
}
