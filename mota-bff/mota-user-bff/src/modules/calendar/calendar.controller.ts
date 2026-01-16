import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Version,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('calendar')
@Controller('v1/calendar')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Version('1')
  @Get('calendars')
  @ApiOperation({ summary: '获取日历列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCalendars(@Request() req: any): Promise<any> {
    return this.calendarService.getCalendars(
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Version('1')
  @Get('view')
  @ApiOperation({ summary: '获取日历视图数据' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCalendarView(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req: any,
  ): Promise<any> {
    return this.calendarService.getCalendarView(
      startDate,
      endDate,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Version('1')
  @Post('calendars')
  @ApiOperation({ summary: '创建日历' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createCalendar(@Body() data: any, @Request() req: any): Promise<any> {
    return this.calendarService.createCalendar(
      data,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Version('1')
  @Put('calendars/:id')
  @ApiOperation({ summary: '更新日历' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateCalendar(
    @Param('id') id: string,
    @Body() data: any,
    @Request() req: any,
  ): Promise<any> {
    return this.calendarService.updateCalendar(
      id,
      data,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Version('1')
  @Delete('calendars/:id')
  @ApiOperation({ summary: '删除日历' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteCalendar(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    await this.calendarService.deleteCalendar(
      id,
      req.user.userId,
      req.user.tenantId,
    );
    return { message: 'Calendar deleted' };
  }

  @Version('1')
  @Get('events/today')
  @ApiOperation({ summary: '获取今日事件' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getTodayEvents(@Request() req: any): Promise<any> {
    return this.calendarService.getTodayEvents(
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Version('1')
  @Get('events/upcoming')
  @ApiOperation({ summary: '获取即将到来的事件' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getUpcomingEvents(
    @Request() req: any,
    @Query('days') days: number = 7,
  ): Promise<any> {
    return this.calendarService.getUpcomingEvents(
      req.user.userId,
      req.user.tenantId,
      days,
    );
  }

  @Version('1')
  @Get('events/:id')
  @ApiOperation({ summary: '获取事件详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getEventDetail(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<any> {
    return this.calendarService.getEventDetail(
      id,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Version('1')
  @Post('events')
  @ApiOperation({ summary: '创建事件' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createEvent(@Body() data: any, @Request() req: any): Promise<any> {
    return this.calendarService.createEvent(
      data,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Version('1')
  @Put('events/:id')
  @ApiOperation({ summary: '更新事件' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateEvent(
    @Param('id') id: string,
    @Body() data: any,
    @Request() req: any,
  ): Promise<any> {
    return this.calendarService.updateEvent(
      id,
      data,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Version('1')
  @Delete('events/:id')
  @ApiOperation({ summary: '删除事件' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteEvent(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    await this.calendarService.deleteEvent(
      id,
      req.user.userId,
      req.user.tenantId,
    );
    return { message: 'Event deleted' };
  }

  @Version('1')
  @Post('calendars/:id/share')
  @ApiOperation({ summary: '共享日历' })
  @ApiResponse({ status: 200, description: '共享成功' })
  async shareCalendar(
    @Param('id') id: string,
    @Body('shareWith') shareWith: string[],
    @Body('permission') permission: string,
    @Request() req: any,
  ): Promise<any> {
    return this.calendarService.shareCalendar(
      id,
      shareWith,
      permission,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Version('1')
  @Delete('calendars/:id/share/:targetUserId')
  @ApiOperation({ summary: '取消共享日历' })
  @ApiResponse({ status: 200, description: '取消成功' })
  async unshareCalendar(
    @Param('id') id: string,
    @Param('targetUserId') targetUserId: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    await this.calendarService.unshareCalendar(
      id,
      req.user.userId,
      req.user.tenantId,
      targetUserId,
    );
    return { message: 'Unshared' };
  }

  @Version('1')
  @Post('calendars/subscribe')
  @ApiOperation({ summary: '订阅外部日历' })
  @ApiResponse({ status: 201, description: '订阅成功' })
  async subscribeExternalCalendar(
    @Body('url') url: string,
    @Body('name') name: string,
    @Request() req: any,
  ): Promise<any> {
    return this.calendarService.subscribeExternalCalendar(
      url,
      name,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Version('1')
  @Post('calendars/:id/sync')
  @ApiOperation({ summary: '同步外部日历' })
  @ApiResponse({ status: 200, description: '同步成功' })
  async syncExternalCalendar(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<any> {
    return this.calendarService.syncExternalCalendar(
      id,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Version('1')
  @Put('events/:id/reminders')
  @ApiOperation({ summary: '设置事件提醒' })
  @ApiResponse({ status: 200, description: '设置成功' })
  async setEventReminder(
    @Param('id') id: string,
    @Body('reminders') reminders: any[],
    @Request() req: any,
  ): Promise<any> {
    return this.calendarService.setEventReminder(
      id,
      reminders,
      req.user.userId,
      req.user.tenantId,
    );
  }

  @Version('1')
  @Post('events/:id/respond')
  @ApiOperation({ summary: '响应事件邀请' })
  @ApiResponse({ status: 200, description: '响应成功' })
  async respondToInvitation(
    @Param('id') id: string,
    @Body('response') response: 'accept' | 'decline' | 'tentative',
    @Request() req: any,
  ): Promise<any> {
    return this.calendarService.respondToInvitation(
      id,
      response,
      req.user.userId,
      req.user.tenantId,
    );
  }
}
