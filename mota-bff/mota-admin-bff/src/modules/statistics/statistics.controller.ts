import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('statistics')
@Controller('statistics')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth('JWT-auth')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('overview')
  @ApiOperation({ summary: '获取平台概览统计' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPlatformOverview(): Promise<any> {
    return this.statisticsService.getPlatformOverview();
  }

  @Get('user-growth')
  @ApiOperation({ summary: '获取用户增长趋势' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getUserGrowthTrend(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('granularity') granularity: 'day' | 'week' | 'month' = 'day',
  ): Promise<any> {
    return this.statisticsService.getUserGrowthTrend(startDate, endDate, granularity);
  }

  @Get('tenants')
  @ApiOperation({ summary: '获取租户统计列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getTenantStatsList(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
    @Query('sortBy') sortBy: string = 'userCount',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<any> {
    return this.statisticsService.getTenantStatsList(page, pageSize, sortBy, sortOrder);
  }

  @Get('activity')
  @ApiOperation({ summary: '获取活跃度统计' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getActivityStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<any> {
    return this.statisticsService.getActivityStats(startDate, endDate);
  }

  @Get('ai-usage')
  @ApiOperation({ summary: '获取AI使用统计' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getAIUsageStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('tenantId') tenantId?: string,
  ): Promise<any> {
    return this.statisticsService.getAIUsageStats(startDate, endDate, tenantId);
  }

  @Get('storage')
  @ApiOperation({ summary: '获取存储使用统计' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getStorageStats(@Query('tenantId') tenantId?: string): Promise<any> {
    return this.statisticsService.getStorageStats(tenantId);
  }

  @Get('health')
  @ApiOperation({ summary: '获取系统健康状态' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getSystemHealth(): Promise<any> {
    return this.statisticsService.getSystemHealth();
  }
}