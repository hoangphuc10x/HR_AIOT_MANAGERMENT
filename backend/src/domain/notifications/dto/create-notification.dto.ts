import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { NotificationType } from '@/common/enums/notification-type.enum';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  receiverId: number;

  @IsNumber()
  @IsOptional()
  referenceId?: number;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
