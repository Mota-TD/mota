import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ServiceClientService } from '../../common/service-client/service-client.service';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  calendarId: string;
  location?: string;
  attendees?: any[];
  reminders?: any[];
}

interface CalendarView {
  calendars: any[];
  events: CalendarEvent[];
  tasks: any[];
}

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(
    private readonly serviceClient: ServiceClientService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * 获取日历列表
   */
  async getCalendars(userId: string, tenantId: string): Promise<any> {
    const userContext = { userId, tenantId };
    const cacheKey = `calendar:list:${userId}`;

    // 尝试从缓存获取
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.serviceClient.get(
      'calendar',
      '/api/v1/calendars',
      {},
      userContext,
    );

    // 缓存结果（5分钟）
    await this.cacheManager.set(cacheKey, response.data, 300000);

    return response.data;
  }

  /**
   * 获取日历视图数据（聚合日历事件和任务）
   */
  async getCalendarView(
    startDate: string,
    endDate: string,
    userId: string,
    tenantId: string,
  ): Promise<CalendarView> {
    const userContext = { userId, tenantId };
    const cacheKey = `calendar:view:${userId}:${startDate}:${endDate}`;

    // 尝试从缓存获取
    const cached = await this.cacheManager.get<CalendarView>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for calendar view: ${startDate} - ${endDate}`);
      return cached;
    }

    // 并行获取日历、事件和任务
    const [calendarsResponse, eventsResponse, tasksResponse] = await Promise.all([
      this.serviceClient.get('calendar', '/api/v1/calendars', {}, userContext),
      this.serviceClient.get(
        'calendar',
        `/api/v1/events?startDate=${startDate}&endDate=${endDate}`,
        {},
        userContext,
      ),
      this.serviceClient.get(
        'task',
        `/api/v1/tasks?assigneeId=${userId}&dueDateStart=${startDate}&dueDateEnd=${endDate}`,
        {},
        userContext,
      ),
    ]);

    const result: CalendarView = {
      calendars: (calendarsResponse.data as any[]) || [],
      events: (eventsResponse.data as CalendarEvent[]) || [],
      tasks: (tasksResponse.data as any[]) || [],
    };

    // 缓存结果（2分钟）
    await this.cacheManager.set(cacheKey, result, 120000);

    return result;
  }

  /**
   * 获取事件详情
   */
  async getEventDetail(
    eventId: string,
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.get(
      'calendar',
      `/api/v1/events/${eventId}`,
      {},
      userContext,
    );
    return response.data;
  }

  /**
   * 创建日历
   */
  async createCalendar(
    data: any,
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.post(
      'calendar',
      '/api/v1/calendars',
      data,
      {},
      userContext,
    );

    // 清除日历列表缓存
    await this.cacheManager.del(`calendar:list:${userId}`);

    return response.data;
  }

  /**
   * 更新日历
   */
  async updateCalendar(
    calendarId: string,
    data: any,
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.put(
      'calendar',
      `/api/v1/calendars/${calendarId}`,
      data,
      {},
      userContext,
    );

    // 清除日历列表缓存
    await this.cacheManager.del(`calendar:list:${userId}`);

    return response.data;
  }

  /**
   * 删除日历
   */
  async deleteCalendar(
    calendarId: string,
    userId: string,
    tenantId: string,
  ): Promise<void> {
    const userContext = { userId, tenantId };
    await this.serviceClient.delete(
      'calendar',
      `/api/v1/calendars/${calendarId}`,
      {},
      userContext,
    );

    // 清除日历列表缓存
    await this.cacheManager.del(`calendar:list:${userId}`);
  }

  /**
   * 创建事件
   */
  async createEvent(
    data: any,
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.post(
      'calendar',
      '/api/v1/events',
      data,
      {},
      userContext,
    );
    return response.data;
  }

  /**
   * 更新事件
   */
  async updateEvent(
    eventId: string,
    data: any,
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.put(
      'calendar',
      `/api/v1/events/${eventId}`,
      data,
      {},
      userContext,
    );
    return response.data;
  }

  /**
   * 删除事件
   */
  async deleteEvent(
    eventId: string,
    userId: string,
    tenantId: string,
  ): Promise<void> {
    const userContext = { userId, tenantId };
    await this.serviceClient.delete(
      'calendar',
      `/api/v1/events/${eventId}`,
      {},
      userContext,
    );
  }

  /**
   * 获取今日事件
   */
  async getTodayEvents(userId: string, tenantId: string): Promise<any> {
    const userContext = { userId, tenantId };
    const today = new Date().toISOString().split('T')[0];
    const response = await this.serviceClient.get(
      'calendar',
      `/api/v1/events?startDate=${today}&endDate=${today}`,
      {},
      userContext,
    );
    return response.data;
  }

  /**
   * 获取即将到来的事件
   */
  async getUpcomingEvents(
    userId: string,
    tenantId: string,
    days: number = 7,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const today = new Date();
    const endDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    const response = await this.serviceClient.get(
      'calendar',
      `/api/v1/events?startDate=${today.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`,
      {},
      userContext,
    );
    return response.data;
  }

  /**
   * 共享日历
   */
  async shareCalendar(
    calendarId: string,
    shareWith: string[],
    permission: string,
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.post(
      'calendar',
      `/api/v1/calendars/${calendarId}/share`,
      { shareWith, permission },
      {},
      userContext,
    );
    return response.data;
  }

  /**
   * 取消共享日历
   */
  async unshareCalendar(
    calendarId: string,
    userId: string,
    tenantId: string,
    targetUserId: string,
  ): Promise<void> {
    const userContext = { userId, tenantId };
    await this.serviceClient.delete(
      'calendar',
      `/api/v1/calendars/${calendarId}/share/${targetUserId}`,
      {},
      userContext,
    );
  }

  /**
   * 订阅外部日历
   */
  async subscribeExternalCalendar(
    url: string,
    name: string,
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.post(
      'calendar',
      '/api/v1/calendars/subscribe',
      { url, name },
      {},
      userContext,
    );

    // 清除日历列表缓存
    await this.cacheManager.del(`calendar:list:${userId}`);

    return response.data;
  }

  /**
   * 同步外部日历
   */
  async syncExternalCalendar(
    calendarId: string,
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.post(
      'calendar',
      `/api/v1/calendars/${calendarId}/sync`,
      {},
      {},
      userContext,
    );
    return response.data;
  }

  /**
   * 设置事件提醒
   */
  async setEventReminder(
    eventId: string,
    reminders: any[],
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.put(
      'calendar',
      `/api/v1/events/${eventId}/reminders`,
      { reminders },
      {},
      userContext,
    );
    return response.data;
  }

  /**
   * 响应事件邀请
   */
  async respondToInvitation(
    eventId: string,
    response: 'accept' | 'decline' | 'tentative',
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const result = await this.serviceClient.post(
      'calendar',
      `/api/v1/events/${eventId}/respond`,
      { response },
      {},
      userContext,
    );
    return result.data;
  }
}