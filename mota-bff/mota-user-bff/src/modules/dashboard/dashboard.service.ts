import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ServiceClientService } from '../../common/service-client/service-client.service';

export interface DashboardData {
  // 项目统计
  projectStats: {
    total: number;
    active: number;
    completed: number;
    overdue: number;
  };
  // 任务统计
  taskStats: {
    total: number;
    todo: number;
    inProgress: number;
    completed: number;
    overdue: number;
  };
  // 今日任务
  todayTasks: any[];
  // 最近项目
  recentProjects: any[];
  // 通知数量
  unreadNotifications: number;
  // 日程事件
  upcomingEvents: any[];
  // AI建议
  aiSuggestions: any[];
}

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);
  private readonly CACHE_KEY_PREFIX = 'dashboard:';
  private readonly CACHE_TTL = 60; // 60秒缓存

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly serviceClient: ServiceClientService,
  ) {}

  /**
   * 获取仪表盘聚合数据
   */
  async getDashboardData(
    userId: string,
    tenantId: string,
  ): Promise<DashboardData> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}${tenantId}:${userId}`;

    // 尝试从缓存获取
    try {
      const cached = await this.cacheManager.get<DashboardData>(cacheKey);
      if (cached) {
        this.logger.debug(`Dashboard data from cache: ${cacheKey}`);
        return cached;
      }
    } catch (cacheError) {
      this.logger.warn('Cache get failed, proceeding without cache', cacheError);
    }

    // 并行获取各服务数据，使用 Promise.allSettled 确保即使部分服务失败也能返回数据
    const results = await Promise.allSettled([
      this.getProjectStats(userId, tenantId),
      this.getTaskStats(userId, tenantId),
      this.getTodayTasks(userId, tenantId),
      this.getRecentProjects(userId, tenantId),
      this.getUnreadNotificationCount(userId, tenantId),
      this.getUpcomingEvents(userId, tenantId),
      this.getAISuggestions(userId, tenantId),
    ]);

    // 提取结果，失败的使用默认值
    const projectStats = results[0].status === 'fulfilled'
      ? results[0].value
      : { total: 0, active: 0, completed: 0, overdue: 0 };
    const taskStats = results[1].status === 'fulfilled'
      ? results[1].value
      : { total: 0, todo: 0, inProgress: 0, completed: 0, overdue: 0 };
    const todayTasks = results[2].status === 'fulfilled' ? results[2].value : [];
    const recentProjects = results[3].status === 'fulfilled' ? results[3].value : [];
    const unreadNotifications = results[4].status === 'fulfilled' ? results[4].value : 0;
    const upcomingEvents = results[5].status === 'fulfilled' ? results[5].value : [];
    const aiSuggestions = results[6].status === 'fulfilled' ? results[6].value : [];

    const dashboardData: DashboardData = {
      projectStats,
      taskStats,
      todayTasks,
      recentProjects,
      unreadNotifications,
      upcomingEvents,
      aiSuggestions,
    };

    // 尝试缓存数据
    try {
      await this.cacheManager.set(cacheKey, dashboardData, this.CACHE_TTL * 1000);
    } catch (cacheError) {
      this.logger.warn('Cache set failed', cacheError);
    }

    return dashboardData;
  }

  /**
   * 获取项目统计
   */
  private async getProjectStats(
    userId: string,
    tenantId: string,
  ): Promise<DashboardData['projectStats']> {
    try {
      const response = await this.serviceClient.get<any>(
        'project',
        '/api/v1/projects/stats',
        {},
        { userId, tenantId },
      );
      return response.data || { total: 0, active: 0, completed: 0, overdue: 0 };
    } catch (error) {
      this.logger.error('Failed to get project stats', error);
      return { total: 0, active: 0, completed: 0, overdue: 0 };
    }
  }

  /**
   * 获取任务统计
   */
  private async getTaskStats(
    userId: string,
    tenantId: string,
  ): Promise<DashboardData['taskStats']> {
    try {
      const response = await this.serviceClient.get<any>(
        'task',
        '/api/v1/tasks/stats',
        { params: { assigneeId: userId } },
        { userId, tenantId },
      );
      return (
        response.data || {
          total: 0,
          todo: 0,
          inProgress: 0,
          completed: 0,
          overdue: 0,
        }
      );
    } catch (error) {
      this.logger.error('Failed to get task stats', error);
      return { total: 0, todo: 0, inProgress: 0, completed: 0, overdue: 0 };
    }
  }

  /**
   * 获取今日任务
   */
  private async getTodayTasks(userId: string, tenantId: string): Promise<any[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await this.serviceClient.get<any>(
        'task',
        '/api/v1/tasks',
        {
          params: {
            assigneeId: userId,
            dueDate: today,
            pageSize: 10,
          },
        },
        { userId, tenantId },
      );
      return response.data?.records || [];
    } catch (error) {
      this.logger.error('Failed to get today tasks', error);
      return [];
    }
  }

  /**
   * 获取最近项目
   */
  private async getRecentProjects(
    userId: string,
    tenantId: string,
  ): Promise<any[]> {
    try {
      const response = await this.serviceClient.get<any>(
        'project',
        '/api/v1/projects/recent',
        { params: { limit: 5 } },
        { userId, tenantId },
      );
      return response.data || [];
    } catch (error) {
      this.logger.error('Failed to get recent projects', error);
      return [];
    }
  }

  /**
   * 获取未读通知数量
   */
  private async getUnreadNotificationCount(
    userId: string,
    tenantId: string,
  ): Promise<number> {
    try {
      const response = await this.serviceClient.get<any>(
        'notify',
        '/api/v1/notifications/unread-count',
        {},
        { userId, tenantId },
      );
      return response.data || 0;
    } catch (error) {
      this.logger.error('Failed to get unread notification count', error);
      return 0;
    }
  }

  /**
   * 获取即将到来的日程事件
   */
  private async getUpcomingEvents(
    userId: string,
    tenantId: string,
  ): Promise<any[]> {
    try {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      const response = await this.serviceClient.get<any>(
        'calendar',
        '/api/v1/events',
        {
          params: {
            startTime: now.toISOString(),
            endTime: endOfDay.toISOString(),
            limit: 5,
          },
        },
        { userId, tenantId },
      );
      return response.data?.records || [];
    } catch (error) {
      this.logger.error('Failed to get upcoming events', error);
      return [];
    }
  }

  /**
   * 获取AI建议
   */
  private async getAISuggestions(
    userId: string,
    tenantId: string,
  ): Promise<any[]> {
    try {
      const response = await this.serviceClient.get<any>(
        'ai',
        '/api/v1/suggestions',
        { params: { limit: 3 } },
        { userId, tenantId },
      );
      return response.data || [];
    } catch (error) {
      this.logger.error('Failed to get AI suggestions', error);
      return [];
    }
  }

  /**
   * 清除仪表盘缓存
   */
  async clearCache(userId: string, tenantId: string): Promise<void> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}${tenantId}:${userId}`;
    await this.cacheManager.del(cacheKey);
  }
}