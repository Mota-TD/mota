import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HomeService } from './home.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('home')
@Controller('home')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  @ApiOperation({ summary: '获取移动端首页数据' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getHomeData(@Request() req: any): Promise<any> {
    return this.homeService.getHomeData(
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Post('refresh')
  @ApiOperation({ summary: '刷新首页数据' })
  @ApiResponse({ status: 200, description: '刷新成功' })
  async refreshHomeData(@Request() req: any): Promise<any> {
    return this.homeService.refreshHomeData(
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Get('quick-actions')
  @ApiOperation({ summary: '获取快速操作' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getQuickActions(@Request() req: any): Promise<any> {
    return this.homeService.getQuickActions(
      req.user.userId,
      req.user.tenantId,
    );
  }
}