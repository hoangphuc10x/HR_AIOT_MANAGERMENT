import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { SocketPayloadDto } from '@/common/dto/socket-payload.dto';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.PORT_ACCEPT || 'http://localhost:3001/',
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('NotificationGateway');

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId;
    if (userId) {
      client.join(this.getUserRoom(Number(userId)));
      this.logger.log(`Client ${client.id} joined room ${userId}`);
    } else {
      this.logger.log(`Client ${client.id} connected (no userId)`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
  private getUserRoom(userId: number) {
    return `user_${userId}`;
  }

  emitToUser(userId: number, event: string, payload: SocketPayloadDto) {
    const room = this.getUserRoom(userId);
    this.server.to(room).emit(event, payload);
    this.logger.log(`Emit event "${event}" to ${room}`);
    this.logger.debug(`Payload: ${JSON.stringify(payload)}`);
  }

  emitToUsers(userIds: number[], event: string, payload: SocketPayloadDto) {
    userIds.forEach((id) => this.emitToUser(id, event, payload));
    this.logger.debug(`Payload: ${JSON.stringify(payload)}`);
  }

  emitToAll(event: string, payload: SocketPayloadDto) {
    this.server.emit(event, payload);
    this.logger.log(`Broadcast event "${event}" to all clients`);
  }

  @SubscribeMessage('hello')
  handleHello(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    this.logger.log(
      `Received hello from ${client.id}: ${JSON.stringify(data)}`,
    );
    return { ack: true };
  }
}
