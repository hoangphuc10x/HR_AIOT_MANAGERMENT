import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { EmailSend } from 'src/common/repositories/send-email.repository';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import {
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Response, Request } from 'express';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

const mockJwtAuthGuard = {
  canActivate: jest.fn(() => true),
};

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    login: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    changePassword: jest.fn(),
  };

  const mockUsersService = {
    findUserIdByEmail: jest.fn(),
    activeAccountAndChangePasswordInit: jest.fn(),
    resetPassword: jest.fn(),
  };

  const mockEmailSend = {
    sendLink: jest.fn(),
  };

  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
  };

  const mockResponse = (): Partial<Response> => {
    const res: any = {};
    res.cookie = jest.fn().mockReturnThis();
    res.clearCookie = jest.fn().mockReturnThis();
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn().mockReturnThis();
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: EmailSend, useValue: mockEmailSend },
        { provide: WINSTON_MODULE_PROVIDER, useValue: mockLogger },
        { provide: JwtAuthGuard, useValue: mockJwtAuthGuard },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);

    jest.clearAllMocks();
  });

  // ------------------------------------------------
  describe('login', () => {
    it('should return success response and set cookies', async () => {
      const loginDto = { email: 'test@example.com', password: '123456' };
      const res = mockResponse();

      mockAuthService.login.mockResolvedValue({
        user_info: { id: 1, email: 'test@example.com' },
        access_token: 'access123',
        refresh_token: 'refresh123',
        expires_in: 900,
      });

      const result = await controller.login(loginDto, res as Response);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(res.cookie).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Login successful',
        data: {
          user: { id: 1, email: 'test@example.com' },
          expires_in: 15,
          access_token: 'access123',
        },
      });
    });

    it('should throw HttpException if login fails', async () => {
      const loginDto = { email: 'wrong@example.com', password: 'wrong' };
      const res = mockResponse();
      mockAuthService.login.mockResolvedValue(null);

      await expect(controller.login(loginDto, res as Response)).rejects.toThrow(
        HttpException,
      );
    });
  });

  // ------------------------------------------------
  describe('refresh', () => {
    it('should refresh token successfully', async () => {
      const req = {
        cookies: { refresh_token: 'refresh123' },
      } as unknown as Request;
      const res = mockResponse();

      mockAuthService.refreshToken.mockResolvedValue({
        access_token: 'newAccess',
        refresh_token: 'newRefresh',
        expires_in: 900,
      });

      const result = await controller.refresh(req, res as Response);
      expect(res.cookie).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Token refreshed successfully',
        data: { expires_in: 15 },
      });
    });

    it('should throw HttpException if no refresh token', async () => {
      const req = { cookies: {} } as Request;
      const res = mockResponse();
      await expect(controller.refresh(req, res as Response)).rejects.toThrow(
        HttpException,
      );
    });
  });

  // ------------------------------------------------
  describe('logout', () => {
    it('should clear cookies and call logout', async () => {
      const res = mockResponse();
      mockAuthService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(1, res as Response);
      expect(mockAuthService.logout).toHaveBeenCalledWith(1);
      expect(res.clearCookie).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Logout successful',
      });
    });
  });

  // ------------------------------------------------
  describe('sendCode', () => {
    it('should call sendLink when user found', async () => {
      mockUsersService.findUserIdByEmail.mockResolvedValue(1);
      mockEmailSend.sendLink.mockResolvedValue(undefined);

      await controller.sendCode({ email: 'test@example.com' });

      expect(mockUsersService.findUserIdByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(mockEmailSend.sendLink).toHaveBeenCalledWith(
        'test@example.com',
        1,
      );
    });

    it('should throw error when user not found', async () => {
      mockUsersService.findUserIdByEmail.mockResolvedValue(null);
      await expect(
        controller.sendCode({ email: 'notfound@example.com' }),
      ).rejects.toThrow(Error);
    });
  });

  // ------------------------------------------------
  describe('activeAccount', () => {
    it('should activate account successfully', async () => {
      const body = { newPassword: '123456' };
      mockUsersService.activeAccountAndChangePasswordInit.mockResolvedValue(
        undefined,
      );

      const result = await controller.activeAccount(1, body);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Account activated successfully',
      });
    });

    it('should throw if missing params', async () => {
      await expect(
        controller.activeAccount(1, { newPassword: '' }),
      ).rejects.toThrow(HttpException);
    });
  });

  // ------------------------------------------------
  describe('resetPassword', () => {
    it('should call resetPassword', async () => {
      mockUsersService.resetPassword.mockResolvedValue(undefined);
      await controller.resetPassword(1, { newPassword: 'newpass' });
      expect(mockUsersService.resetPassword).toHaveBeenCalledWith(1, 'newpass');
    });
  });

  // ------------------------------------------------
  describe('changePassword', () => {
    it('should call changePassword successfully', async () => {
      const req = {
        user: { userId: 1 },
      } as Request;
      const dto: ChangePasswordDto = {
        oldPassword: 'old',
        newPassword: 'new',
      };

      mockAuthService.changePassword.mockResolvedValue(undefined);

      const result = await controller.changePassword(req, dto);
      expect(mockAuthService.changePassword).toHaveBeenCalledWith(1, 1, dto);
      expect(result).toEqual({ message: 'Password changed successfully' });
    });

    it('should throw UnauthorizedException if no userId in req', async () => {
      const req = {} as Request;
      const dto: ChangePasswordDto = {
        oldPassword: 'old',
        newPassword: 'new',
      };

      await expect(controller.changePassword(req, dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
