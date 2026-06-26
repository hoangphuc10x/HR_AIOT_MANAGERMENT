import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  Body,
  Put,
} from '@nestjs/common';
import { AttendancesService } from './attendances.service';
import { UpdateAttendanceDto } from './dto/attendances.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import * as jwtPayloadInterface from '@/common/share/jwt-payload.interface';
import express from 'express';
import { ExportAttendanceDto } from './dto/export-attendances.dto';

@Controller('attendances')
export class AttendancesController {
  constructor(private readonly attendancesService: AttendancesService) {}

  @Get('summary')
  async getMonthlySummary(
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    try {
      const now = new Date();
      const yearValue = year ? parseInt(year, 10) : now.getFullYear();
      const monthValue = month ? parseInt(month, 10) : now.getMonth() + 1;

      console.log('yearValue', yearValue);
      console.log('monthValue', monthValue);

      return await this.attendancesService.findAttendanceByMonth(
        yearValue,
        monthValue,
      );
    } catch (error) {
      console.log(error);
    }
  }

  @Get('summary/:code')
  async getAttendanceDetail(
    @Param('code') code: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    try {
      const now = new Date();
      const yearValue = year ? parseInt(year, 10) : now.getFullYear();
      const monthValue = month ? parseInt(month, 10) : now.getMonth() + 1;

      console.log('Employee code:', code);
      console.log('Year:', yearValue);
      console.log('Month:', monthValue);

      const result = await this.attendancesService.findDetailAttendance(
        code,
        yearValue,
        monthValue,
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.log('Controller error:', error);
      return {
        success: false,
        message: 'Failed to fetch attendance data',
        error: error.message,
      };
    }
  }

  @Post('checkin/:userId')
  async checkIn(@Param('userId') userId: number) {
    try {
      const result = await this.attendancesService.checkIn(userId);
      return {
        success: true,
        message: 'Check-in successful',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Check-in fail',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('checkout/:userId')
  async checkOut(@Param('userId') userId: number) {
    try {
      const result = await this.attendancesService.checkOut(userId);
      return {
        success: true,
        message: 'Check-out successful',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Check-out fail',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('detail/:code')
  async getAttendanceByDate(
    @Param('code') code: string,
    @Query('date') date: string, // YYYY-MM-DD
  ) {
    try {
      if (!date) {
        throw new Error('Date is required (format YYYY-MM-DD)');
      }

      console.log('this.attendancesService.findAttendanceByDate');

      const result = await this.attendancesService.findAttendanceByDate(
        code,
        new Date(date),
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.log('Controller error:', error);
      return {
        success: false,
        message: 'Failed to fetch attendance data by date',
        error: error.message,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('detail/:code')
  async updateAttendance(
    @Param('code') code: string,
    @Query('date') date: string,
    @Body() updateDto: UpdateAttendanceDto,
    @Req() req: jwtPayloadInterface.AuthJwtRequest,
  ) {
    const userId = req['user'].userId;
    return this.attendancesService.updateAttendance(
      code,
      date,
      updateDto,
      userId,
    );
  }

  @Get('today/:code')
  async getTodayAttendance(@Param('code') code: string) {
    try {
      const today = new Date();
      const result = await this.attendancesService.findTodayAttendance(
        code,
        today,
      );

      return {
        success: true,
        message: 'Success',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch today attendance',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('export')
  async exportAttendanceCSV(
    @Query() query: ExportAttendanceDto,
    @Res() res: express.Response,
  ): Promise<void> {
    try {
      const { year, month, isByDate, code } = query;

      const filename = `attendance_${year}_${month.toString().padStart(2, '0')}.csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );

      if (code) {
        await this.attendancesService.exportEmployeeAttendance(
          code,
          year,
          month,
          res,
        );
      } else {
        await this.attendancesService.exportAttendanceToCSV(
          year,
          month,
          res,
          isByDate ?? false,
        );
      }
    } catch (error) {
      console.log(error);
    }
  }
}
