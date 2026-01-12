import { Controller, Get, UseGuards, Request, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService, DashboardData } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: '获取仪表盘聚合数据' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getDashboard(@Request() req: any): Promise<DashboardData> {
    return this.dashboardService.getDashboardData(
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Delete('cache')
  @ApiOperation({ summary: '清除仪表盘缓存' })
  @ApiResponse({ status: 200, description: '清除成功' })
  async clearCache(@Request() req: any): Promise<{ message: string }> {
    await this.dashboardService.clearCache(req.user.userId, req.user.tenantId);
    return { message: 'Cache cleared' };
  }
}