import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ServiceClientService } from '../../common/service-client/service-client.service';

/**
 * 移动端首页数据 - 针对移动端优化的轻量级数据结构
 */
interface MobileHomeData {
  // 用户信息摘要
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  // 今日任务统计
  todayStats: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
  };
  // 今日任务列表（最多10条）
  todayTasks: any[];
  // 即将到来的事件（最多5条）
  upcomingEvents: any[];
  // 未读通知数量
  unreadNotifications: number;
  // 最近项目（最多5个）
  recentProjects: any[];
  // AI建议（最多3条）
  aiSuggestions: any[];
}

@Injectable()
export class HomeService {
  private readonly logger = new Logger(HomeService.name);

  constructor(
    private readonly serviceClient: ServiceClientService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * 获取移动端首页数据（聚合多个服务的数据）
   */
  async getHomeData(userId: string, tenantId: string): Promise<MobileHomeData> {
    const userContext = { userId, tenantId };
    const cacheKey = `app:home:${userId}`;

    // 尝试从缓存获取
    const cached = await this.cacheManager.get<MobileHomeData>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for mobile home data: ${userId}`);
      return cached;
    }

    // 并行获取各项数据
    const [
      userResponse,
      todayTasksResponse,
      taskStatsResponse,
      eventsResponse,
      notificationCountResponse,
      recentProjectsResponse,
      suggestionsResponse,
    ] = await Promise.all([
      this.serviceClient.get('user', `/api/v1/users/${userId}/profile`, {}, userContext),
      this.getTodayTasks(userId, tenantId),
      this.getTaskStats(userId, tenantId),
      this.getUpcomingEvents(userId, tenantId),
      this.getUnreadNotificationCount(userId, tenantId),
      this.getRecentProjects(userId, tenantId),
      this.getAISuggestions(userId, tenantId),
    ]);

    const userData = userResponse.data as any;
    const result: MobileHomeData = {
      user: {
        id: userData?.id || userId,
        name: userData?.name || '',
        avatar: userData?.avatar || '',
      },
      todayStats: taskStatsResponse,
      todayTasks: todayTasksResponse,
      upcomingEvents: eventsResponse,
      unreadNotifications: notificationCountResponse,
      recentProjects: recentProjectsResponse,
      aiSuggestions: suggestionsResponse,
    };

    // 缓存结果（2分钟，移动端需要更频繁更新）
    await this.cacheManager.set(cacheKey, result, 120000);

    return result;
  }

  /**
   * 获取今日任务
   */
  private async getTodayTasks(userId: string, tenantId: string): Promise<any[]> {
    try {
      const userContext = { userId, tenantId };
      const today = new Date().toISOString().split('T')[0];
      const response = await this.serviceClient.get(
        'task',
        `/api/v1/tasks?assigneeId=${userId}&dueDate=${today}&limit=10`,
        {},
        userContext,
      );
      return (response.data as any[]) || [];
    } catch (error) {
      this.logger.error('Failed to get today tasks', error);
      return [];
    }
  }

  /**
   * 获取任务统计
   */
  private async getTaskStats(userId: string, tenantId: string): Promise<any> {
    try {
      const userContext = { userId, tenantId };
      const response = await this.serviceClient.get(
        'task',
        `/api/v1/tasks/stats?assigneeId=${userId}`,
        {},
        userContext,
      );
      return response.data || {
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
      };
    } catch (error) {
      this.logger.error('Failed to get task stats', error);
      return {
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
      };
    }
  }

  /**
   * 获取即将到来的事件
   */
  private async getUpcomingEvents(userId: string, tenantId: string): Promise<any[]> {
    try {
      const userContext = { userId, tenantId };
      const today = new Date();
      const endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const response = await this.serviceClient.get(
        'calendar',
        `/api/v1/events?startDate=${today.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}&limit=5`,
        {},
        userContext,
      );
      return (response.data as any[]) || [];
    } catch (error) {
      this.logger.error('Failed to get upcoming events', error);
      return [];
    }
  }

  /**
   * 获取未读通知数量
   */
  private async getUnreadNotificationCount(userId: string, tenantId: string): Promise<number> {
    try {
      const userContext = { userId, tenantId };
      const response = await this.serviceClient.get(
        'notify',
        '/api/v1/notifications/unread-count',
        {},
        userContext,
      );
      return (response.data as any)?.count || 0;
    } catch (error) {
      this.logger.error('Failed to get unread notification count', error);
      return 0;
    }
  }

  /**
   * 获取最近项目
   */
  private async getRecentProjects(userId: string, tenantId: string): Promise<any[]> {
    try {
      const userContext = { userId, tenantId };
      const response = await this.serviceClient.get(
        'project',
        `/api/v1/projects?memberId=${userId}&sort=updatedAt&order=desc&limit=5`,
        {},
        userContext,
      );
      return (response.data as any[]) || [];
    } catch (error) {
      this.logger.error('Failed to get recent projects', error);
      return [];
    }
  }

  /**
   * 获取AI建议
   */
  private async getAISuggestions(userId: string, tenantId: string): Promise<any[]> {
    try {
      const userContext = { userId, tenantId };
      const response = await this.serviceClient.get(
        'ai',
        `/api/v1/suggestions/daily?limit=3`,
        {},
        userContext,
      );
      return (response.data as any[]) || [];
    } catch (error) {
      this.logger.error('Failed to get AI suggestions', error);
      return [];
    }
  }

  /**
   * 刷新首页数据（清除缓存并重新获取）
   */
  async refreshHomeData(userId: string, tenantId: string): Promise<MobileHomeData> {
    const cacheKey = `app:home:${userId}`;
    await this.cacheManager.del(cacheKey);
    return this.getHomeData(userId, tenantId);
  }

  /**
   * 获取快速操作数据
   */
  async getQuickActions(userId: string, tenantId: string): Promise<any[]> {
    const userContext = { userId, tenantId };
    
    // 获取用户常用操作
    try {
      const response = await this.serviceClient.get(
        'user',
        `/api/v1/users/${userId}/quick-actions`,
        {},
        userContext,
      );
      return (response.data as any[]) || this.getDefaultQuickActions();
    } catch (error) {
      return this.getDefaultQuickActions();
    }
  }

  /**
   * 默认快速操作
   */
  private getDefaultQuickActions(): any[] {
    return [
      { id: 'create_task', name: '新建任务', icon: 'task_add' },
      { id: 'scan_qr', name: '扫一扫', icon: 'qr_code' },
      { id: 'voice_input', name: '语音输入', icon: 'mic' },
      { id: 'ai_chat', name: 'AI助手', icon: 'smart_toy' },
    ];
  }
}