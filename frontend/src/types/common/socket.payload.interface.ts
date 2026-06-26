import { NotificationType } from '@/enums/notification-type.enum';

export interface SocketPayloadInterface {
  type: NotificationType;
  title: string;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
  timestamp?: string;
}

export interface UserNotification {
  id: number;
  user: { id: number };
  notification: {
    id: number;
    type: NotificationType;
    title: string;
    content: string;
    isRead: boolean;
    dayInform: string;
  };
  referenceId?: number;
  isRead: boolean;
  createdAt: string;
}
