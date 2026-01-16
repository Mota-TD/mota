import { Controller, Get, UseGuards, Request, Delete, Logger, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService, DashboardData } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('dashboard')
@Controller('dashboard')
@ApiBearerAuth('JWT-auth')
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(private readonly dashboardService: DashboardService) {}

  @Version('1')
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取仪表盘聚合数据' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getDashboard(@Request() req: any): Promise<DashboardData> {
    const userId = req.user?.userId || 'anonymous';
    const tenantId = req.user?.tenantId || 'default';
    this.logger.log(`Getting dashboard data for user: ${userId}, tenant: ${tenantId}`);
    return this.dashboardService.getDashboardData(userId, tenantId);
  }

  @Version('1')
  @Delete('cache')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '清除仪表盘缓存' })
  @ApiResponse({ status: 200, description: '清除成功' })
  async clearCache(@Request() req: any): Promise<{ message: string }> {
    const userId = req.user?.userId || 'anonymous';
    const tenantId = req.user?.tenantId || 'default';
    await this.dashboardService.clearCache(userId, tenantId);
    return { message: 'Cache cleared' };
  }
}