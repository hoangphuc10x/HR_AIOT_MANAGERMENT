import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  Inject,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '../../common/share/jwt-payload.interface';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { UserStatus } from 'src/common/enums/user-status.enum';
import { JwtDto } from './dto/jwt.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuditLogActionEnum } from '@/common/enums/audit-log-action.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    private jwtService: JwtService,
    private auditLogsService: AuditLogsService,
    private readonly dataSource: DataSource,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<JwtDto> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      relations: ['userRoles', 'userRoles.role'],
    });
    if (!user) {
      throw new UnauthorizedException('Invalid account');
    }
    if (user.deletedAt) {
      throw new UnauthorizedException(
        'Your account cannot access to system. Please contact the administrator.',
      );
    }
    if (user.status == UserStatus.INACTIVE) {
      throw new UnauthorizedException(
        'Your account has not active, let check your mail and active your account',
      );
    }
    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid password');
    }

    return {
      userId: user.id,
      code: user.code,
      fullName: user.fullName,
      roles: user.userRoles?.map((ur) => ur.role.name) || [],
      expireAt: user.expiresAt,
    };
  }

  async generateRefreshToken(user: JwtDto): Promise<string> {
    const payload: JwtPayload = {
      userId: user.userId,
      code: user.code,
      role: user.roles,
      expireAt: user.expireAt,
    };
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const userInfo = await this.userRepository.findOne({
      where: { id: payload.userId },
    });
    if (!userInfo) {
      throw new NotFoundException('User not found');
    }

    if (userInfo) {
      await this.userRepository.update(
        { id: userInfo.id },
        { refreshToken: refreshToken },
      );
    }
    return refreshToken;
  }

  async login(loginDto: LoginDto) {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      const user = await this.validateUser(loginDto);
      const payload: JwtPayload = {
        userId: user.userId,
        code: user.code,
        role: user.roles,
        expireAt: expiresAt,
      };

      const accessToken = this.jwtService.sign(payload, {
        secret: process.env.JWT_ACCESS_SECRET || 'access_secret',
        expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m',
      });

      const refreshToken = await this.generateRefreshToken(user);
      // log action login
      // await this.auditLogsService.logAction({
      //   userId: user.userId,
      //   action: 'LOGIN',
      //   description: `User ${user.fullName} logged to system`,
      //   createdAt: new Date(),
      // });

      return {
        user_info: user,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: parseInt(
          process.env.JWT_ACCESS_EXPIRATION_SECONDS ?? '900',
          10,
        ), // 15 minutes
      };
    } catch (error) {
      this.logger.error(`error login: ${error}`);
      throw error;
    }
  }

  async refreshToken(refreshToken: string) {
    const tokenRecord = await this.userRepository.findOne({
      where: { refreshToken: refreshToken },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (tokenRecord.expiresAt < new Date()) {
      await this.userRepository.update(
        { id: tokenRecord.id },
        { refreshToken: '' },
      );
      throw new UnauthorizedException('Refresh token has expired');
    }

    try {
      const payload: JwtPayload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.userId },
        relations: ['userRoles', 'userRoles.role'],
      });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      if (!user.userRoles || user.userRoles.length === 0) {
        throw new UnauthorizedException('User has no role assigned');
      }
      const accessTokenExpiresAt = new Date();
      accessTokenExpiresAt.setMinutes(accessTokenExpiresAt.getMinutes() + 15);
      const newAccessToken = this.jwtService.sign(
        {
          userId: user.id,
          role: user.userRoles[0].role.id,
          expireAt: accessTokenExpiresAt,
        },
        {
          secret: process.env.JWT_ACCESS_SECRET || 'access_secret',
          expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m',
        },
      );
      const dto: JwtDto = {
        userId: user.id,
        code: user.code,
        fullName: user.fullName,
        expireAt: user.expiresAt,
        roles: user.userRoles?.map((ur) => ur.role.name) || [],
      };

      const newRefreshToken = await this.generateRefreshToken(dto);

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        expires_in: parseInt(
          process.env.JWT_ACCESS_EXPIRATION_SECONDS ?? '900',
          10,
        ), // 15 minutes
      };
    } catch (error) {
      this.logger.error(`error of refresh token: ${error}`);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      await this.userRepository.update(
        { id: user.id },
        { refreshToken: '', expiresAt: '' },
      );
    } catch (error) {
      this.logger.error(`Error while logging out user ${userId}: ${error}`);
      throw new InternalServerErrorException('Failed to logout user');
    }
  }

  async changePassword(
    adminId: number,
    userId: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    try {
      const { oldPassword, newPassword } = changePasswordDto;

      // find by user id
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        throw new BadRequestException('User not found');
      }
      const previousValue = JSON.parse(
        JSON.stringify({ password: user.password }),
      );
      // check old password
      const isOldPasswordValid = await bcrypt.compare(
        oldPassword,
        user.password,
      );
      if (!isOldPasswordValid) {
        throw new BadRequestException('Old password is incorrect');
      }

      // hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // change password
      await this.userRepository.update(userId, { password: hashedNewPassword });
      //Audit log
      await this.auditLogsService.logAction({
        action: AuditLogActionEnum.CHANGE_PASSWORD,
        entityName: this.dataSource.getMetadata(User).tableName,
        recordId: user.id,
        previousValue: previousValue,
        newValue: { password: hashedNewPassword },
        description: `Password reset for user: ${user.fullName}`,
        userId: adminId,
        createdAt: new Date(),
      });
    } catch (err) {
      // Nếu đã là BadRequestException thì ném lại
      this.logger.error(err);
      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException('Failed to change password');
    }
  }
}
