import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Department } from './department.entity';
import { User } from 'src/domain/users/entities/user.entity';
import { UserDepartmentPositionEnum } from '../../../common/enums/user-department-position.enum';

@Entity('user_departments')
export class UserDepartment {
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @PrimaryColumn({ name: 'department_id' })
  departmentId: number;

  @Column({
    type: 'enum',
    enum: UserDepartmentPositionEnum,
    default: UserDepartmentPositionEnum.EMPLOYEE,
  })
  position: UserDepartmentPositionEnum;

  @ManyToOne(() => User, (user) => user.userDepartments)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Department, (department) => department.userDepartments)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @CreateDateColumn({ name: 'assigned_at' })
  assignedAt: Date;
}
