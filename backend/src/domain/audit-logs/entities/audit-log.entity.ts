import { AuditLogActionEnum } from '@/common/enums/audit-log-action.enum';
import { User } from 'src/domain/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.auditLogs, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ type: 'enum', enum: AuditLogActionEnum, name: 'action' })
  action: AuditLogActionEnum;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'entity_name', nullable: true })
  entityName: string;

  @Column({ name: 'record_id', nullable: true })
  recordId: number;

  @Column({ name: 'previous_value', type: 'json', nullable: true })
  previousValue: Record<string, any> | null;

  @Column({ name: 'new_value', type: 'json', nullable: true })
  newValue: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
