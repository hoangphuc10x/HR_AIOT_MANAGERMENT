import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LeaveRequest } from './leave-request.entity';

@Entity('leave_attachments')
export class LeaveAttachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'file_path' })
  filePath: string;

  @ManyToOne(
    () => LeaveRequest,
    (leaveRequest) => leaveRequest.leaveAttachments,
  )
  @JoinColumn({ name: 'leave_request_id' })
  leaveRequest: LeaveRequest;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
