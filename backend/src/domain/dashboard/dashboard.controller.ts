import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { GetDepartmentStatsDto } from './dto/get-department-stats.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  DepartmentStatsResponseDto,
  TopAbsentEmployeesResponseDto,
  MonthlyAbsencesResponseDto,
  DashboardOverviewResponseDto,
} from './dto/dashboard-response.dto';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get dashboard overview statistics' })
  @ApiResponse({ status: 200, type: DashboardOverviewResponseDto })
  async getDashboardOverview(): Promise<DashboardOverviewResponseDto> {
    return this.dashboardService.getDashboardOverview();
  }

  @Get('department-stats')
  @ApiOperation({ summary: 'Get department absence statistics' })
  @ApiResponse({ status: 200, type: [DepartmentStatsResponseDto] })
  async getDepartmentStats(
    @Query() query: GetDepartmentStatsDto,
  ): Promise<DepartmentStatsResponseDto[]> {
    return this.dashboardService.getDepartmentStats(query.period as any);
  }

  @Get('top-absent-employees')
  @ApiOperation({ summary: 'Get top absent employees in the year' })
  @ApiResponse({ status: 200, type: [TopAbsentEmployeesResponseDto] })
  async getTopAbsentEmployees(
    @Query('limit') limit = 10,
  ): Promise<TopAbsentEmployeesResponseDto[]> {
    return this.dashboardService.getTopAbsentEmployees(limit);
  }

  @Get('monthly-absences')
  @ApiOperation({ summary: 'Get monthly absence statistics' })
  @ApiResponse({ status: 200, type: [MonthlyAbsencesResponseDto] })
  async getMonthlyAbsences(
    @Query('year') year?: number,
  ): Promise<MonthlyAbsencesResponseDto[]> {
    const currentYear = year || new Date().getFullYear();
    return this.dashboardService.getMonthlyAbsences(currentYear);
  }
}
