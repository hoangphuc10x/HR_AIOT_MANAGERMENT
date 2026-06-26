import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  NotFoundException,
  Post,
  Put,
  Query,
  UseGuards,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/user-create.dto';
import { UserActiveAccountDto } from './dto/user-active-account';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleEnum } from 'src/common/enums/role.enum';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { UpdateUserDto } from './dto/user-update.dto';
import { DepartmentsService } from '../departments/departments.service';
import { DeleteUserFromDepartmentDto } from './dto/user-delete-department.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserPermissionInfoDto } from './dto/user-permission-response.dto';
import { imageMulterConfig } from '@/config/file-upload.config';
import { FileInterceptor } from '@nestjs/platform-express';
import { type Express } from 'express';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly departmentService: DepartmentsService,
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {}

  @Post('update-avatar/:userId')
  @ApiOperation({ summary: 'Update user avatar' })
  @ApiResponse({ status: 201, description: 'update user avatar successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UseInterceptors(FileInterceptor('file', imageMulterConfig))
  async updateAvatar(
    @Param('userId', ParseIntPipe) userId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.updateAvatar(userId, file);
  }
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RoleEnum.ADMIN)
  @Post('/create-user')
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  createUser(@Body() createUserDto: CreateUserDto) {
    try {
      return this.usersService.createUser(createUserDto);
    } catch (error) {
      this.logger.error(`error login: ${error}`);
      throw error;
    }
  }

  @Post('/active-account/:userId')
  @ApiOperation({ summary: 'Activate user account' })
  @ApiResponse({ status: 200, description: 'Account activated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  activeAccount(
    @Param('userId') userId: number,
    @Body() UserActiveAccountDto: UserActiveAccountDto,
  ) {
    try {
      return this.usersService.activeAccountAndChangePasswordInit(
        userId,
        UserActiveAccountDto.newPassword,
      );
    } catch (error) {
      this.logger.error(`error login: ${error}`);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RoleEnum.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(
    @Param('id') id: number,
    @Request() req,
  ): Promise<{ message: string }> {
    try {
      await this.usersService.deleteUser(id, req.user.userId);
      return { message: 'Delete user Successful' };
    } catch (error) {
      this.logger.error(`Error in deleteUser controller: ${error.message}`, {
        stack: error.stack,
      });
      throw error;
    }
  }

  @Get()
  getUsers(@Query() userPagination: PaginationDto) {
    this.logger.info(
      `get user, page: ${userPagination.page}, limit: ${userPagination.limit}, role: ${userPagination.role}, sex: ${userPagination.sex}, departmentsId: ${userPagination.departmentIds}, status: ${userPagination.status}`,
    );
    return this.usersService.getUsers(userPagination);
  }

  @Get('UserList')
  async getUserList() {
    return await this.usersService.getUserList();
  }

  // @UseGuards(JwtAuthGuard, RoleGuard)
  // @Roles(RoleEnum.ADMIN)
  @Get(':userId')
  async getUserDetail(@Param('userId', ParseIntPipe) userId: number) {
    this.logger.info(`get user by id: ${userId}`);
    const user = await this.usersService.getUser(userId);
    if (!user) {
      this.logger.error(`user not found for id: ${userId}`);
      return new NotFoundException('User not found');
    }
    return user;
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RoleEnum.ADMIN)
  @Get(':userId/departments')
  async getAvailableDepartmentForUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('search') search?: string,
  ) {
    this.logger.info(
      `get departments for user: ${userId} with search: ${search}`,
    );
    try {
      return await this.usersService.getDepartmentAvailableForUser({
        userId,
        departmentName: search || '',
      });
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RoleEnum.ADMIN)
  @Put(':userId')
  updateUserDetail(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    this.logger.info(`get user by id: ${userId}`);
    const user = this.usersService.updateUser(
      req.user.userId,
      userId,
      updateUserDto,
    );
    return user;
  }

  @Post('notify-hr')
  async notifyHr(@Body() body: { requesterId: number; reason?: string }) {
    return await this.usersService.notifyHrLeaveToday(
      body.requesterId,
      body.reason,
    );
  }

  // @UseGuards(JwtAuthGuard, RoleGuard)
  // @Roles(RoleEnum.HEAD_DEPARTMENT)
  @Get('department/:userId')
  @ApiOperation({ summary: 'Get users by department ID' })
  @ApiResponse({
    status: 200,
    description: 'Get users by department ID successfully',
  })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async getUserByDepartmentID(
    @Param('userId') userId: string,
    @Query('page') page: number,
  ) {
    try {
      const user = await this.departmentService.getEmployeesByHeadDepartment(
        userId,
        page,
      );
      return user;
    } catch (error) {
      this.logger.error(`Error in deleteUser controller: ${error.message}`, {
        stack: error.stack,
      });
      throw error;
    }
  }

  // @UseGuards(JwtAuthGuard, RoleGuard)
  // @Roles(RoleEnum.ADMIN, RoleEnum.HEAD_DEPARTMENT)
  @Post('deleteUserDepartment')
  @ApiOperation({ summary: 'Remove user from department' })
  @ApiResponse({
    status: 200,
    description: 'User removed from department successfully',
  })
  @ApiResponse({ status: 404, description: 'User or department not found' })
  async deleteUserDepartment(
    @Body() body: DeleteUserFromDepartmentDto,
  ): Promise<void> {
    try {
      await this.usersService.deleteUserFromDepartment(
        body.userId,
        body.departmentId,
      );
    } catch (error) {
      this.logger.error(
        `Error in deleteUserFromDepartment controller: ${error.message}`,
        {
          stack: error.stack,
        },
      );
      throw error;
    }
  }

  @ApiOperation({ summary: 'Get all users with their permissions' })
  @ApiResponse({
    status: 200,
    description: 'Get all users with their permissions successfully',
  })
  @ApiResponse({ status: 404, description: 'Users not found' })
  @Get('permissions')
  async getAllUsersWithPermissions() {
    try {
      return await this.usersService.getAllUsersPermissions();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('Failed to retrieve users with permissions');
    }
  }

  @ApiOperation({ summary: 'Get user permissions by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Get user permissions successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get('permissions/:userId')
  async getUserPermissionInfo(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<UserPermissionInfoDto> {
    try {
      return await this.usersService.getUserPermissionInfo(userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('Failed to retrieve user permission info');
    }
  }

  @Get('all/permissions')
  async getUsersWithPermissionCount() {
    return this.usersService.getUsersWithPermissionCount();
  }

  @Get('userDepartment/Permission')
  async getUserPermissions(
    @Query('userId') userId: number,
    @Query('departmentId') departmentId: number,
  ) {
    return await this.usersService.getUserPermissions(userId, departmentId);
  }

  @Get('deleted/user')
  getDeletedUsers() {
    return this.usersService.getDeletedUsers();
  }
}
