import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('notification')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: '获取通知列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getNotifications(@Request() req: any, @Query() query: any): Promise<any> {
    return this.notificationService.getNotifications(
      req.user.userId,
      req.user.tenantId,
      query,
    );
  }

  @Get('unread-count')
  @ApiOperation({ summary: '获取未读通知数量' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getUnreadCount(@Request() req: any): Promise<{ count: number }> {
    const count = await this.notificationService.getUnreadCount(
      req.user.userId,
      req.user.tenantId,
    );
    return { count };
  }

  @Get('stats')
  @ApiOperation({ summary: '获取通知统计' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getNotificationStats(@Request() req: any): Promise<any> {
    return this.notificationService.getNotificationStats(
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Put(':id/read')
  @ApiOperation({ summary: '标记通知为已读' })
  @ApiResponse({ status: 200, description: '标记成功' })
  async markAsRead(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    await this.notificationService.markAsRead(
      id,
      req.user.userId,
      req.user.tenantId,
    );
    return { message: 'Marked as read' };
  }

  @Put('read-all')
  @ApiOperation({ summary: '标记所有通知为已读' })
  @ApiResponse({ status: 200, description: '标记成功' })
  async markAllAsRead(@Request() req: any): Promise<{ message: string }> {
    await this.notificationService.markAllAsRead(
      req.user.userId,
      req.user.tenantId,
    );
    return { message: 'All marked as read' };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除通知' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteNotification(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    await this.notificationService.deleteNotification(
      id,
      req.user.userId,
      req.user.tenantId,
    );
    return { message: 'Notification deleted' };
  }

  @Post('batch-delete')
  @ApiOperation({ summary: '批量删除通知' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async batchDeleteNotifications(
    @Body('notificationIds') notificationIds: string[],
    @Request() req: any,
  ): Promise<{ message: string }> {
    await this.notificationService.batchDeleteNotifications(
      notificationIds,
      req.user.userId,
      req.user.tenantId,
    );
    return { message: 'Notifications deleted' };
  }

  @Get('settings')
  @ApiOperation({ summary: '获取通知设置' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getNotificationSettings(@Request() req: any): Promise<any> {
    return this.notificationService.getNotificationSettings(
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Put('settings')
  @ApiOperation({ summary: '更新通知设置' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateNotificationSettings(
    @Body() settings: any,
    @Request() req: any,
  ): Promise<any> {
    return this.notificationService.updateNotificationSettings(
      settings,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Get('subscriptions')
  @ApiOperation({ summary: '获取订阅列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getSubscriptions(@Request() req: any): Promise<any> {
    return this.notificationService.getSubscriptions(
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Post('subscriptions')
  @ApiOperation({ summary: '订阅通知' })
  @ApiResponse({ status: 201, description: '订阅成功' })
  async subscribe(
    @Body('entityType') entityType: string,
    @Body('entityId') entityId: string,
    @Request() req: any,
  ): Promise<any> {
    return this.notificationService.subscribe(
      entityType,
      entityId,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Delete('subscriptions')
  @ApiOperation({ summary: '取消订阅' })
  @ApiResponse({ status: 200, description: '取消成功' })
  async unsubscribe(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    await this.notificationService.unsubscribe(
      entityType,
      entityId,
      req.user.userId,
      req.user.tenantId,
    );
    return { message: 'Unsubscribed' };
  }

  @Put('do-not-disturb')
  @ApiOperation({ summary: '设置免打扰' })
  @ApiResponse({ status: 200, description: '设置成功' })
  async setDoNotDisturb(
    @Body('enabled') enabled: boolean,
    @Body('startTime') startTime: string | null,
    @Body('endTime') endTime: string | null,
    @Request() req: any,
  ): Promise<any> {
    return this.notificationService.setDoNotDisturb(
      enabled,
      startTime,
      endTime,
      req.user.userId,
      req.user.tenantId,
    );
  }
}