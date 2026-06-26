import { NotificationType } from '../enums/notification-type.enum';

export class SocketPayloadDto {
  type: NotificationType;
  title: string;
  message: string;
  metadata?: any;
  timestamp?: string;
}
