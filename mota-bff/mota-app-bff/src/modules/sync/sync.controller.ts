import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SyncService } from './sync.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('sync')
@Controller('sync')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post()
  @ApiOperation({ summary: '执行同步操作' })
  @ApiResponse({ status: 200, description: '同步成功' })
  async sync(
    @Body('items') items: any[],
    @Body('lastSyncTimestamp') lastSyncTimestamp: number,
    @Request() req: any,
  ): Promise<any> {
    return this.syncService.sync(
      items,
      lastSyncTimestamp,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Get('delta')
  @ApiOperation({ summary: '获取增量同步数据' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getDeltaSync(
    @Query('lastSyncTimestamp') lastSyncTimestamp: number,
    @Request() req: any,
  ): Promise<any> {
    return this.syncService.getDeltaSync(
      lastSyncTimestamp,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Get('full')
  @ApiOperation({ summary: '获取完整同步数据' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getFullSync(@Request() req: any): Promise<any> {
    return this.syncService.getFullSync(
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Get('status')
  @ApiOperation({ summary: '获取同步状态' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getSyncStatus(@Request() req: any): Promise<any> {
    return this.syncService.getSyncStatus(req.user.userId);
  }

  @Post('resolve-conflict')
  @ApiOperation({ summary: '解决同步冲突' })
  @ApiResponse({ status: 200, description: '解决成功' })
  async resolveConflict(
    @Body('entityType') entityType: string,
    @Body('entityId') entityId: string,
    @Body('resolution') resolution: 'client' | 'server' | 'merge',
    @Body('mergedData') mergedData: any,
    @Request() req: any,
  ): Promise<any> {
    return this.syncService.resolveConflict(
      entityType,
      entityId,
      resolution,
      mergedData,
      req.user.userId,
      req.user.tenantId,
    );
  }
}