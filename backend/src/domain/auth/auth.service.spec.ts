import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { DataSource } from 'typeorm';
import { UserStatus } from 'src/common/enums/user-status.enum';
import { JwtDto } from './dto/jwt.dto';
import {
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuditLogActionEnum } from '@/common/enums/audit-log-action.enum';
import { RoleEnum } from '@/common/enums/role.enum';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

const mockUser = {
  id: 1,
  email: 'test@example.com',
  password: '$2b$10$hashedpassword',
  fullName: 'Test User',
  code: 'USER001',
  status: UserStatus.ACTIVE,
  deletedAt: null,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  refreshToken: 'old-refresh-token',
  userRoles: [
    {
      role: { id: 1, name: RoleEnum.ADMIN },
    },
  ],
};

const mockJwtPayload = {
  userId: 1,
  code: 'USER001',
  role: [RoleEnum.ADMIN],
  expireAt: mockUser.expiresAt,
};

describe('AuthService', () => {
  let service: AuthService;
  let logger: any;

  const mockUserRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockAuditLogsService = {
    logAction: jest.fn(),
  };

  const mockLogger = {
    error: jest.fn(),
  };

  const mockDataSource = {
    getMetadata: jest.fn().mockReturnValue({ tableName: 'users' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: AuditLogsService, useValue: mockAuditLogsService },
        { provide: WINSTON_MODULE_PROVIDER, useValue: mockLogger },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    logger = module.get(WINSTON_MODULE_PROVIDER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return JwtDto if credentials are valid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser(loginDto);

      expect(result).toEqual({
        userId: 1,
        code: 'USER001',
        fullName: 'Test User',
        roles: [RoleEnum.ADMIN],
        expireAt: mockUser.expiresAt,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto: LoginDto = {
        email: 'wrong@example.com',
        password: 'password',
      };
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.validateUser(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.validateUser(loginDto)).rejects.toThrow(
        'Invalid account',
      );
    });

    it('should throw UnauthorizedException if account is deleted', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        deletedAt: new Date(),
      });

      await expect(service.validateUser(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.validateUser(loginDto)).rejects.toThrow(
        'Your account cannot access to system',
      );
    });

    it('should throw UnauthorizedException if account is inactive', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        status: UserStatus.INACTIVE,
      });

      await expect(service.validateUser(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.validateUser(loginDto)).rejects.toThrow(
        'Your account has not active',
      );
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpass',
      };
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.validateUser(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.validateUser(loginDto)).rejects.toThrow(
        'Invalid password',
      );
    });
  });

  describe('login', () => {
    it('should return access and refresh tokens on successful login', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      jest.spyOn(service, 'validateUser').mockResolvedValue({
        userId: 1,
        code: 'USER001',
        fullName: 'Test User',
        roles: [RoleEnum.ADMIN],
        expireAt: mockUser.expiresAt,
      } as JwtDto);

      mockJwtService.sign.mockReturnValue(accessToken);
      jest
        .spyOn(service, 'generateRefreshToken')
        .mockResolvedValue(refreshToken);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        user_info: expect.any(Object),
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 900,
      });
    });

    it('should log error and rethrow if login fails', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const error = new UnauthorizedException('Invalid account');

      jest.spyOn(service, 'validateUser').mockRejectedValue(error);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(logger.error).toHaveBeenCalledWith(`error login: ${error}`);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate and store refresh token', async () => {
      const user: JwtDto = {
        userId: 1,
        code: 'USER001',
        fullName: 'Test',
        roles: [RoleEnum.ADMIN],
        expireAt: new Date(),
      };
      const refreshToken = 'new-refresh-token';

      mockJwtService.sign.mockReturnValue(refreshToken);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue(undefined);

      const result = await service.generateRefreshToken(user);

      expect(result).toBe(refreshToken);
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { id: 1 },
        { refreshToken },
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      const user: JwtDto = {
        userId: 999,
        code: 'USER001',
        fullName: 'Test',
        roles: [RoleEnum.ADMIN],
        expireAt: new Date(),
      };
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.generateRefreshToken(user)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('refreshToken', () => {
    it('should return new access and refresh tokens', async () => {
      const refreshToken = 'valid-refresh-token';
      const newAccessToken = 'new-access-token';
      const newRefreshToken = 'new-refresh-token';

      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);
      mockJwtService.verify.mockReturnValue(mockJwtPayload);
      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);
      mockJwtService.sign.mockReturnValue(newAccessToken);
      jest
        .spyOn(service, 'generateRefreshToken')
        .mockResolvedValue(newRefreshToken);

      const result = await service.refreshToken(refreshToken);

      expect(result).toEqual({
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        expires_in: 900,
      });
    });

    it('should throw UnauthorizedException if token not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.refreshToken('invalid')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refreshToken('invalid')).rejects.toThrow(
        'Invalid refresh token',
      );
    });

    it('should throw UnauthorizedException if token expired', async () => {
      const expiredUser = {
        ...mockUser,
        expiresAt: new Date(Date.now() - 10000),
      };
      mockUserRepository.findOne.mockResolvedValue(expiredUser);

      await expect(service.refreshToken('token')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refreshToken('token')).rejects.toThrow(
        'Refresh token has expired',
      );
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { id: expiredUser.id },
        { refreshToken: '' },
      );
    });
  });

  describe('logout', () => {
    it('should clear refresh token and expiresAt', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue(undefined);

      await service.logout(1);

      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { id: 1 },
        { refreshToken: '', expiresAt: '' },
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.logout(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('changePassword', () => {
    it('should change password and log audit', async () => {
      const changePasswordDto: ChangePasswordDto = {
        oldPassword: 'oldpass',
        newPassword: 'newpass123',
      };
      const hashedNew = '$2b$10$newhashed';

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedNew);

      mockUserRepository.update.mockResolvedValue(undefined);

      await service.changePassword(999, 1, changePasswordDto);

      expect(mockUserRepository.update).toHaveBeenCalledWith(1, {
        password: hashedNew,
      });
      expect(mockAuditLogsService.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditLogActionEnum.CHANGE_PASSWORD,
          userId: 999,
          recordId: 1,
          description: 'Password reset for user: Test User',
        }),
      );
    });

    it('should throw BadRequestException if old password wrong', async () => {
      const changePasswordDto: ChangePasswordDto = {
        oldPassword: 'wrong',
        newPassword: 'newpass',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        service.changePassword(999, 1, changePasswordDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.changePassword(999, 1, changePasswordDto),
      ).rejects.toThrow('Old password is incorrect');
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      mockUserRepository.findOne.mockRejectedValue(new Error('DB error'));

      await expect(
        service.changePassword(1, 2, {
          oldPassword: '',
          newPassword: '',
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
