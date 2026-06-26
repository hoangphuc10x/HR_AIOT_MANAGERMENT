import { AttendanceStatusEnum } from 'src/common/enums/attendance-status.enum';
import { User } from 'src/domain/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('attendances')
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'check_in', type: 'datetime', nullable: true })
  checkIn: Date | null;

  @Column({ name: 'check_out', type: 'datetime', nullable: true })
  checkOut: Date | null;

  @Column({ name: 'attendance_date', type: 'date' })
  attendanceDate: Date;

  @Column({ type: 'enum', enum: AttendanceStatusEnum })
  status: AttendanceStatusEnum;

  @Column({ type: 'text' })
  note: string;

  @Column({
    name: 'overtime_hours',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  overtimeHours: number;

  @ManyToOne(() => User, (user) => user.attendances)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}

export { AttendanceStatusEnum };
