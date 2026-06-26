import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateUserPermissionDto } from './dto/user-permission';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @ApiTags('permissions')
  @Get('/:userId')
  @ApiOperation({ summary: 'Get all permissions by user ID' })
  @ApiResponse({ status: 200, description: 'List of permission IDs' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getAllPermissions(@Param('userId') userId: number) {
    return this.permissionsService.getAllPermissionsByUserId(userId);
  }

  @ApiTags('permissions')
  @Get('/department/:userId')
  @ApiOperation({ summary: 'Get department permissions by user ID' })
  @ApiResponse({
    status: 200,
    description: 'List of department permission IDs',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserDepartmentPermissions(@Param('userId') userId: number) {
    return this.permissionsService.getUserDepartmentPermissions(userId);
  }

  @ApiTags('permissions')
  @Patch('UpdatePermission')
  @ApiOperation({ summary: 'update permission of user' })
  @ApiResponse({
    status: 200,
    description: 'Update user permission successful',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async editUserPermission(@Body() data: UpdateUserPermissionDto) {
    return this.permissionsService.editUserPermission(data);
  }
}
