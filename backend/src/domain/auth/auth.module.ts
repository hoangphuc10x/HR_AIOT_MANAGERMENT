import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt-auth/jwt-auth.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditLog } from '../audit-logs/entities/audit-log.entity';
import { Role } from '../users/entities/role.entity';
import { UserRole } from '../users/entities/user-role.entity';
import { EmailSend } from 'src/common/repositories/send-email.repository';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, AuditLog, Role, UserRole]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: {
        expiresIn: process.env.JWT_ACCESS_EXPIRATION || '1h',
      },
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AuditLogsService, EmailSend],
  exports: [AuthService],
})
export class AuthModule {}
