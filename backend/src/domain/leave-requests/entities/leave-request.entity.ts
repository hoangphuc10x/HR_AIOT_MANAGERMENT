import { LeaveRequestStatus } from 'src/common/enums/leave-request-status.enum';
import { User } from 'src/domain/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LeaveAttachment } from './leave_attachment.entity';
import { LeaveType } from '@/common/enums/leave-type.enum';

@Entity('leave_requests')
export class LeaveRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.leaveRequests)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'leave_type', type: 'enum', enum: LeaveType })
  leaveType: LeaveType;

  @Column({ name: 'start_date' })
  startDate: Date;

  @Column({ name: 'end_date' })
  endDate: Date;

  @Column()
  reason: string;

  @Column({
    type: 'enum',
    enum: LeaveRequestStatus,
    default: LeaveRequestStatus.PENDING,
  })
  status: LeaveRequestStatus;

  @ManyToOne(() => User, (user) => user.leaveRequestApprovedBys)
  @JoinColumn({ name: 'approved_by' })
  approvedBy: User | null;

  @OneToMany(
    () => LeaveAttachment,
    (leaveAttachment) => leaveAttachment.leaveRequest,
  )
  leaveAttachments: LeaveAttachment[];

  @Column({ name: 'approved_at', default: null })
  approvedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
