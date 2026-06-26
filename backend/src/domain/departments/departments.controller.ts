import {
  Controller,
  Query,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetEmpInDepDto } from './dto/getEmployeeInDep.dto';
import { SearchDepartmentDto } from './dto/search-dto.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { DeleteDepartmentDto } from './dto/delete-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DeleteUserDepartmentDto } from './dto/delete-user-department.dto';
import { UpdateUserDepartmentPermissionDto } from './dto/update-user-department-permission.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { Department } from './entities/department.entity';
// import { InvitationDepartmentDto } from './dto/accept-invitation.dto';
// import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
// import { RoleGuard } from 'src/common/guards/roles.guard';
// @UseGuards(JwtAuthGuard,RoleGuard)

@Controller('departments')
export class DepartmentsController {
  constructor(private depService: DepartmentsService) {}
  @Get()
  @ApiOperation({ summary: 'Get department list' })
  @ApiResponse({ status: 200, description: 'get successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async getDepartmentList(@Query() departmentPagination: PaginationDto) {
    return this.depService.getDepartmentList(departmentPagination);
  }

  @Get('dep_id/:dep_id')
  async getDepartmentById(@Param('dep_id') dep_id: string) {
    const id = Number(dep_id);
    if (isNaN(id)) {
      throw new BadRequestException('Invalid department id');
    }
    return await this.depService.getDepartmentById(id);
  }

  @Get('CardData')
  @ApiOperation({ summary: 'Get department card data' })
  @ApiResponse({ status: 200, description: 'get successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async getDepartmentInfo() {
    return await this.depService.getDepartmentCardData();
  }

  @Post()
  @ApiOperation({ summary: 'Add new department' })
  @ApiResponse({ status: 201, description: 'add successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 500, description: 'Invalid value or missing field' })
  async addNewDepartment(@Body() data: CreateDepartmentDto) {
    return await this.depService.addNewDepartment(data);
  }

  @Get('StaffList')
  @ApiOperation({ summary: 'Get list of employee has staff role' })
  @ApiResponse({ status: 200, description: 'get successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async getEmployeeToAddDepartment() {
    return await this.depService.getEmployeeToAddDepartment();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search department by name' })
  @ApiResponse({ status: 200, description: 'get successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async searchDepartmentByName(@Query() data: SearchDepartmentDto) {
    return await this.depService.searchDepartmentByName(
      data.depName,
      data.page,
    );
  }

  @Delete()
  @ApiOperation({ summary: 'delete department' })
  @ApiResponse({ status: 201, description: 'delete successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async softDeleteDepartment(@Body() data: DeleteDepartmentDto) {
    return await this.depService.softDeleteDepartment(data);
  }

  @Patch()
  @ApiOperation({ summary: 'Update department' })
  @ApiResponse({ status: 200, description: 'update successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 500, description: 'Invalid value' })
  async updateDepartment(@Body() data: UpdateDepartmentDto) {
    return await this.depService.updateDepartment(data);
  }
  @Delete('user')
  @ApiOperation({ summary: 'delete user in department' })
  @ApiResponse({ status: 200, description: 'delete successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  async deleteUserInDepartment(@Body() data: DeleteUserDepartmentDto) {
    try {
      return await this.depService.deleteUserInDepartment(
        data.user_actor_id,
        data.user_id,
        data.dep_id,
      );
    } catch (error) {
      // Log lỗi để debug
      console.error(
        `[Controller] Error deleteUserInDepartment: actor=${data.user_actor_id}, user=${data.user_id}, dep=${data.dep_id}`,
        error,
      );
      throw error;
    }
  }

  @Get('users/:dep_id')
  @ApiOperation({ summary: 'Get employee in department' })
  @ApiResponse({ status: 200, description: 'get successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async getEmployeeInDepartment(@Param() data: GetEmpInDepDto) {
    return await this.depService.getEmployeeInDepartment(data);
  }

  // @Get('users/:departmentId')
  // @ApiOperation({ summary: 'Get user by departmentId' })
  // @ApiResponse({ status: 200, description: 'get successful' })
  // @ApiResponse({ status: 401, description: 'Invalid credentials' })
  // async getEmployeesByDepartmentId(
  //   @Param('departmentId') departmentId: string,
  //   @Query('page') page: number,
  // ) {
  //   return await this.depService.getEmployeesByDepartmentId(departmentId, page);
  // }

  @Get('department-join/:userID')
  @ApiOperation({ summary: 'Get user by userID' })
  @ApiResponse({ status: 200, description: 'get successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async getDepartmentOfUser(
    @Param('userID') userID: string,
    @Query('page') page: number,
  ) {
    return await this.depService.getDepartmentsAndPermissionsByUserId(
      userID,
      page,
    );
  }

  @Patch('updateUserDepartmentPermissions')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user department permissions' })
  @ApiResponse({ status: 200, description: 'Permissions updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 404,
    description: 'User, department, or permissions not found',
  })
  async updateUserPermissions(
    @Body() updateDto: UpdateUserDepartmentPermissionDto,
  ) {
    return this.depService.updateUserPermissions(updateDto);
  }

  @Get('user-department/:id')
  async getDepartmentsByUser(@Param('id', ParseIntPipe) id: number) {
    return await this.depService.getDepartmentIdsByUserId(id);
  }

  //get department deleted
  @Get('deleted/dep')
  getDeletedDepartments(): Promise<Department[]> {
    return this.depService.getDeletedDepartments();
  }

  // Restore department
  @Patch(':id/restore/:userId')
  async restoreDepartment(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<{ message: string }> {
    return this.depService.restoreDepartment(userId, id);
  }

  // delete permanently department
  @Delete(':id/hard-delete/:userId')
  async hardDeleteDepartment(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<{ message: string }> {
    return this.depService.hardDeleteDepartment(userId, id);
  }
}
