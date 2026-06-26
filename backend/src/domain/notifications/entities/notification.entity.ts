import { NotificationType } from '@/common/enums/notification-type.enum';
import { UserNotification } from '@/domain/users/entities/user-notification.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(
    () => UserNotification,
    (userNotification) => userNotification.notification,
  )
  userNotifications: UserNotification[];

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column()
  title: string;

  @Column()
  content: string;

  @CreateDateColumn({ name: 'day_inform' })
  dayInform: Date;
}
