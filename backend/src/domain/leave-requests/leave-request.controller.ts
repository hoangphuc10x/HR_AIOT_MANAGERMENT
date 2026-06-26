import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { LeaveRequestService } from './leave-request.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { LeaveRequestApprovalDto } from './dto/approve-leave-request.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('leave-request')
export class LeaveRequestController {
  constructor(private readonly leaveRequestService: LeaveRequestService) {}
  @Post()
  async userSendLeaveRequest(@Body() data: CreateLeaveRequestDto) {
    return await this.leaveRequestService.userSendLeaveRequest(data);
  }

  @Post('approval')
  async leaveRequestApproval(@Body() data: LeaveRequestApprovalDto) {
    return await this.leaveRequestService.leaveRequestApproval(data);
  }

  @ApiOperation({ summary: 'Get leave request by ID' })
  @ApiResponse({
    status: 200,
    description: 'Leave request fetched successfully',
  })
  @ApiResponse({ status: 404, description: 'Leave request not found' })
  @Get('leaveId/:id')
  async getLeaveRequestById(@Param('id', ParseIntPipe) id: number) {
    return await this.leaveRequestService.getLeaveRequestById(id);
  }

  @Get('summary')
  async getLeaveRequestSummary(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('pageSize', ParseIntPipe) pageSize: number = 10,
    @Query('month', ParseIntPipe) month?: number,
    @Query('year', ParseIntPipe) year?: number,
  ) {
    return await this.leaveRequestService.getLeaveRequestSummary(
      page,
      pageSize,
      month,
      year,
    );
  }

  @Get('user/:userId')
  async getAllLeaveRequest(@Param('userId', ParseIntPipe) userId: number) {
    return await this.leaveRequestService.getAllLeaveRequestByUserId(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async softDeleteLeaveRequest(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return await this.leaveRequestService.softDeleteLeaveRequest(
      req.user.userId,
      id,
    );
  }

  @Get('deleted')
  async getDeletedLeaveRequests() {
    return this.leaveRequestService.getDeletedLeaveRequests();
  }

  @Patch(':id/restore/:userId')
  async restoreLeaveRequest(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<{ message: string }> {
    return this.leaveRequestService.restoreLeaveRequest(userId, id);
  }

  @Delete(':id/hard-delete/:userId')
  async hardDeleteLeaveRequest(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<{ message: string }> {
    return this.leaveRequestService.hardDeleteLeaveRequest(userId, id);
  }
}
