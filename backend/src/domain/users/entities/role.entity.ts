import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from './user-role.entity';
import { RoleEnum } from 'src/common/enums/role.enum';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: RoleEnum })
  name: RoleEnum;

  @Column({ type: 'text' })
  description: string;

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles: UserRole[];
}
