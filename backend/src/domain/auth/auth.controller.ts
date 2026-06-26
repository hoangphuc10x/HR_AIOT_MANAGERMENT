import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpStatus,
  HttpException,
  Res,
  Param,
  Inject,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import type { Response, Request } from 'express';
import { EmailSend } from 'src/common/repositories/send-email.repository';
import { UsersService } from '../users/users.service';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    private authService: AuthService,
    private emailSend: EmailSend,
    private usersService: UsersService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Login user and return tokens' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const result = await this.authService.login(loginDto);
      if (!result) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }

      // Set refresh token cookie (7 days)
      res.cookie('refresh_token', result.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Set access token cookie (15 mins)
      res.cookie('access_token', result.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 15 minutes
      });
      this.logger.info('login successful');
      return {
        statusCode: HttpStatus.OK,
        message: 'Login successful',
        data: {
          user: result.user_info,
          expires_in: result.expires_in / 60, // minutes
          access_token: result.access_token,
        },
      };
    } catch (error) {
      this.logger.error(`error login: ${error}`);
      throw error;
    }
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const refreshToken = (req.cookies as { refresh_token?: string })
        ?.refresh_token;

      if (!refreshToken) {
        throw new HttpException(
          'Refresh token not found',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const tokens = await this.authService.refreshToken(refreshToken);
      // set new access token
      res.cookie('access_token', tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 15 minutes
      });

      // update refresh_token cookie if rotated
      res.cookie('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      this.logger.info('refresh token successful');
      return {
        statusCode: HttpStatus.OK,
        message: 'Token refreshed successfully',
        data: {
          expires_in: tokens.expires_in / 60,
        },
      };
    } catch (error) {
      this.logger.error(`error refresh token: ${error}`);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout/:id')
  @ApiOperation({ summary: 'Logout user and invalidate refresh tokens' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(
    @Param('id') id: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      await this.authService.logout(id);

      // clear cookies
      res.clearCookie('access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      this.logger.info('logout success full');
      return {
        statusCode: HttpStatus.OK,
        message: 'Logout successful',
      };
    } catch (error) {
      this.logger.error(`error logout: ${error}`);
      throw error;
    }
  }

  @Post('send-code')
  @ApiOperation({ summary: 'Send code to email' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendCode(@Body() body: { email: string }) {
    try {
      const userId = await this.usersService.findUserIdByEmail(body.email);
      if (!userId) throw new Error('User not found');
      await this.emailSend.sendLink(body.email, userId);
    } catch (error) {
      this.logger.error(`error send code: ${error}`);
      throw error;
    }
  }

  @Post('active-account/:userId')
  @ApiOperation({ summary: 'Activate user account' })
  @ApiResponse({ status: 200, description: 'Account activated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async activeAccount(
    @Param('userId') userId: number,
    @Body() body: { newPassword: string },
  ) {
    try {
      const { newPassword } = body;
      if (!newPassword || !userId) {
        throw new HttpException(
          'User ID and new password are required',
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.usersService.activeAccountAndChangePasswordInit(
        userId,
        newPassword,
      );
      this.logger.info(`Account activated for userId: ${userId}`);
      return {
        statusCode: HttpStatus.OK,
        message: 'Account activated successfully',
      };
    } catch (error) {
      this.logger.error(`error activating account: ${error}`);
      throw error;
    }
  }

  @Post('reset-password/:userId')
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  resetPassword(
    @Param('userId') userId: number,
    @Body() body: { newPassword: string },
  ) {
    try {
      this.usersService.resetPassword(userId, body.newPassword);
    } catch (error) {
      this.logger.error(`error reset password: ${error}`);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @Req() req: Request,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('Invalid token, no userId found');
    }
    await this.authService.changePassword(userId, userId, changePasswordDto);
    return { message: 'Password changed successfully' };
  }
}
