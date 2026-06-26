import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Get,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificationService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get(':userId')
  async findAllByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationService.findAllByUser(userId);
  }

  @Post()
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.createNotification(createNotificationDto);
  }

  @Patch(':notificationId/read/:userId')
  async markAsRead(
    @Param('notificationId', ParseIntPipe) notificationId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.notificationService.markNotificationAsRead(
      notificationId,
      userId,
    );
  }

  @Patch(':notificationId/unread/:userId')
  async markAsUnread(
    @Param('notificationId', ParseIntPipe) notificationId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.notificationService.markNotificationAsUnread(
      notificationId,
      userId,
    );
  }

  @Delete(':notificationId/delete/:userId')
  async deleteNotificationById(
    @Param('notificationId', ParseIntPipe) notificationId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.notificationService.deleteNotificationById(
      notificationId,
      userId,
    );
  }

  @Delete('user/:userId')
  async deleteAllNotifications(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationService.deleteAllNotifications(userId);
  }
}
