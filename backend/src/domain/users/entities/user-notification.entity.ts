import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '@/domain/users/entities/user.entity';
import { Notification } from '@/domain/notifications/entities/notification.entity';

@Entity('user_notifications')
export class UserNotification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.userNotifications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(
    () => Notification,
    (notification) => notification.userNotifications,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'notification_id' })
  notification: Notification;

  @Column({ name: 'reference_id', nullable: true })
  referenceId: number;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
