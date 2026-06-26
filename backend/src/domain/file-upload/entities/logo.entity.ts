import { LogoStatus } from '@/common/enums/logo-status.enum';
import { User } from '@/domain/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('logos')
export class Logo {
  @PrimaryGeneratedColumn({ type: 'tinyint', name: 'id' })
  id: number;

  @Column({ name: 'logo_url' })
  logoUrl: string;

  @Column({ name: 'uploaded_by' })
  uploadedBy: number;

  @ManyToOne(() => User, (user) => user.logos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'uploaded_by' })
  user: User;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;

  @Column({
    type: 'enum',
    enum: LogoStatus,
    name: 'is_active',
    default: LogoStatus.ACTIVE,
  })
  isActive: LogoStatus;
}
