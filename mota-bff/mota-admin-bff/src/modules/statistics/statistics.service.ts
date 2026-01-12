import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ServiceClientService } from '../../common/service-client/service-client.service';

/**
 * 平台概览统计
 */
interface PlatformOverview {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  totalTasks: number;
  totalDocuments: number;
  storageUsed: number;
  aiTokensUsed: number;
}

/**
 * 趋势数据
 */
interface TrendData {
  date: string;
  value: number;
}

/**
 * 租户统计
 */
interface TenantStats {
  tenantId: string;
  tenantName: string;
  userCount: number;
  projectCount: number;
  taskCount: number;
  storageUsed: number;
  aiTokensUsed: number;
  lastActiveAt: string;
}

@Injectable()
export class StatisticsService {
  private readonly logger = new Logger(StatisticsService.name);

  constructor(
    private readonly serviceClient: ServiceClientService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * 获取平台概览统计
   */
  async getPlatformOverview(): Promise<PlatformOverview> {
    const cacheKey = 'admin:stats:overview';

    // 尝试从缓存获取
    const cached = await this.cacheManager.get<PlatformOverview>(cacheKey);
    if (cached) {
      this.logger.debug('Cache hit for platform overview');
      return cached;
    }

    // 并行获取各项统计数据
    const [
      tenantStats,
      userStats,
      projectStats,
      taskStats,
      documentStats,
      storageStats,
      aiStats,
    ] = await Promise.all([
      this.getTenantCount(),
      this.getUserCount(),
      this.getProjectCount(),
      this.getTaskCount(),
      this.getDocumentCount(),
      this.getStorageUsage(),
      this.getAITokenUsage(),
    ]);

    const result: PlatformOverview = {
      totalTenants: tenantStats.total,
      activeTenants: tenantStats.active,
      totalUsers: userStats.total,
      activeUsers: userStats.active,
      totalProjects: projectStats,
      totalTasks: taskStats,
      totalDocuments: documentStats,
      storageUsed: storageStats,
      aiTokensUsed: aiStats,
    };

    // 缓存结果（5分钟）
    await this.cacheManager.set(cacheKey, result, 300000);

    return result;
  }

  /**
   * 获取用户增长趋势
   */
  async getUserGrowthTrend(
    startDate: string,
    endDate: string,
    granularity: 'day' | 'week' | 'month' = 'day',
  ): Promise<TrendData[]> {
    const cacheKey = `admin:stats:user-growth:${startDate}:${endDate}:${granularity}`;

    const cached = await this.cacheManager.get<TrendData[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.serviceClient.get(
        'user',
        `/api/v1/admin/stats/user-growth?startDate=${startDate}&endDate=${endDate}&granularity=${granularity}`,
        {},
        { userId: 'admin', tenantId: 'system' },
      );
      const result = (response.data as TrendData[]) || [];
      await this.cacheManager.set(cacheKey, result, 300000);
      return result;
    } catch (error) {
      this.logger.error('Failed to get user growth trend', error);
      return [];
    }
  }

  /**
   * 获取租户统计列表
   */
  async getTenantStatsList(
    page: number = 1,
    pageSize: number = 20,
    sortBy: string = 'userCount',
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<{ data: TenantStats[]; total: number }> {
    try {
      const response = await this.serviceClient.get(
        'tenant',
        `/api/v1/admin/tenants/stats?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
        {},
        { userId: 'admin', tenantId: 'system' },
      );
      return response.data as { data: TenantStats[]; total: number };
    } catch (error) {
      this.logger.error('Failed to get tenant stats list', error);
      return { data: [], total: 0 };
    }
  }

  /**
   * 获取活跃度统计
   */
  async getActivityStats(
    startDate: string,
    endDate: string,
  ): Promise<any> {
    const cacheKey = `admin:stats:activity:${startDate}:${endDate}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const [loginStats, taskStats, documentStats] = await Promise.all([
        this.serviceClient.get(
          'user',
          `/api/v1/admin/stats/logins?startDate=${startDate}&endDate=${endDate}`,
          {},
          { userId: 'admin', tenantId: 'system' },
        ),
        this.serviceClient.get(
          'task',
          `/api/v1/admin/stats/activity?startDate=${startDate}&endDate=${endDate}`,
          {},
          { userId: 'admin', tenantId: 'system' },
        ),
        this.serviceClient.get(
          'knowledge',
          `/api/v1/admin/stats/activity?startDate=${startDate}&endDate=${endDate}`,
          {},
          { userId: 'admin', tenantId: 'system' },
        ),
      ]);

      const result = {
        logins: loginStats.data,
        tasks: taskStats.data,
        documents: documentStats.data,
      };

      await this.cacheManager.set(cacheKey, result, 300000);
      return result;
    } catch (error) {
      this.logger.error('Failed to get activity stats', error);
      return { logins: [], tasks: [], documents: [] };
    }
  }

  /**
   * 获取AI使用统计
   */
  async getAIUsageStats(
    startDate: string,
    endDate: string,
    tenantId?: string,
  ): Promise<any> {
    try {
      let url = `/api/v1/admin/stats/ai-usage?startDate=${startDate}&endDate=${endDate}`;
      if (tenantId) {
        url += `&tenantId=${tenantId}`;
      }

      const response = await this.serviceClient.get(
        'ai',
        url,
        {},
        { userId: 'admin', tenantId: 'system' },
      );
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get AI usage stats', error);
      return null;
    }
  }

  /**
   * 获取存储使用统计
   */
  async getStorageStats(tenantId?: string): Promise<any> {
    try {
      let url = '/api/v1/admin/stats/storage';
      if (tenantId) {
        url += `?tenantId=${tenantId}`;
      }

      const response = await this.serviceClient.get(
        'file',
        url,
        {},
        { userId: 'admin', tenantId: 'system' },
      );
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get storage stats', error);
      return null;
    }
  }

  /**
   * 获取系统健康状态
   */
  async getSystemHealth(): Promise<any> {
    const services = [
      'user', 'tenant', 'project', 'task', 'collab',
      'knowledge', 'ai', 'notify', 'calendar', 'search', 'file', 'report',
    ];

    const healthChecks = await Promise.all(
      services.map(async (service) => {
        try {
          const response = await this.serviceClient.get(
            service,
            '/health',
            { timeout: 5000 },
            { userId: 'admin', tenantId: 'system' },
          );
          return {
            service,
            status: 'healthy',
            responseTime: response.responseTime || 0,
          };
        } catch (error) {
          return {
            service,
            status: 'unhealthy',
            error: error.message,
          };
        }
      }),
    );

    return {
      timestamp: new Date().toISOString(),
      services: healthChecks,
      overallStatus: healthChecks.every(h => h.status === 'healthy') ? 'healthy' : 'degraded',
    };
  }

  // Private helper methods

  private async getTenantCount(): Promise<{ total: number; active: number }> {
    try {
      const response = await this.serviceClient.get(
        'tenant',
        '/api/v1/admin/tenants/count',
        {},
        { userId: 'admin', tenantId: 'system' },
      );
      return response.data as { total: number; active: number };
    } catch (error) {
      return { total: 0, active: 0 };
    }
  }

  private async getUserCount(): Promise<{ total: number; active: number }> {
    try {
      const response = await this.serviceClient.get(
        'user',
        '/api/v1/admin/users/count',
        {},
        { userId: 'admin', tenantId: 'system' },
      );
      return response.data as { total: number; active: number };
    } catch (error) {
      return { total: 0, active: 0 };
    }
  }

  private async getProjectCount(): Promise<number> {
    try {
      const response = await this.serviceClient.get(
        'project',
        '/api/v1/admin/projects/count',
        {},
        { userId: 'admin', tenantId: 'system' },
      );
      return (response.data as any)?.count || 0;
    } catch (error) {
      return 0;
    }
  }

  private async getTaskCount(): Promise<number> {
    try {
      const response = await this.serviceClient.get(
        'task',
        '/api/v1/admin/tasks/count',
        {},
        { userId: 'admin', tenantId: 'system' },
      );
      return (response.data as any)?.count || 0;
    } catch (error) {
      return 0;
    }
  }

  private async getDocumentCount(): Promise<number> {
    try {
      const response = await this.serviceClient.get(
        'knowledge',
        '/api/v1/admin/documents/count',
        {},
        { userId: 'admin', tenantId: 'system' },
      );
      return (response.data as any)?.count || 0;
    } catch (error) {
      return 0;
    }
  }

  private async getStorageUsage(): Promise<number> {
    try {
      const response = await this.serviceClient.get(
        'file',
        '/api/v1/admin/storage/usage',
        {},
        { userId: 'admin', tenantId: 'system' },
      );
      return (response.data as any)?.totalBytes || 0;
    } catch (error) {
      return 0;
    }
  }

  private async getAITokenUsage(): Promise<number> {
    try {
      const response = await this.serviceClient.get(
        'ai',
        '/api/v1/admin/tokens/usage',
        {},
        { userId: 'admin', tenantId: 'system' },
      );
      return (response.data as any)?.totalTokens || 0;
    } catch (error) {
      return 0;
    }
  }
}