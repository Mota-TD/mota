import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ServiceClientService } from '../../common/service-client/service-client.service';

interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly serviceClient: ServiceClientService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * 获取通知列表
   */
  async getNotifications(
    userId: string,
    tenantId: string,
    query: any = {},
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const queryString = new URLSearchParams(query).toString();
    const response = await this.serviceClient.get(
      'notify',
      `/api/v1/notifications?${queryString}`,
      {},
      userContext,
    );
    return response.data;
  }

  /**
   * 获取未读通知数量
   */
  async getUnreadCount(userId: string, tenantId: string): Promise<number> {
    const userContext = { userId, tenantId };
    const cacheKey = `notification:unread:${userId}`;

    // 尝试从缓存获取
    const cached = await this.cacheManager.get<number>(cacheKey);
    if (cached !== undefined && cached !== null) {
      return cached;
    }

    const response = await this.serviceClient.get(
      'notify',
      '/api/v1/notifications/unread-count',
      {},
      userContext,
    );

    const count = (response.data as any)?.count || 0;

    // 缓存结果（1分钟）
    await this.cacheManager.set(cacheKey, count, 60000);

    return count;
  }

  /**
   * 获取通知统计
   */
  async getNotificationStats(
    userId: string,
    tenantId: string,
  ): Promise<NotificationStats> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.get(
      'notify',
      '/api/v1/notifications/stats',
      {},
      userContext,
    );
    return response.data as NotificationStats;
  }

  /**
   * 标记通知为已读
   */
  async markAsRead(
    notificationId: string,
    userId: string,
    tenantId: string,
  ): Promise<void> {
    const userContext = { userId, tenantId };
    await this.serviceClient.put(
      'notify',
      `/api/v1/notifications/${notificationId}/read`,
      {},
      {},
      userContext,
    );

    // 清除未读数量缓存
    await this.cacheManager.del(`notification:unread:${userId}`);
  }

  /**
   * 标记所有通知为已读
   */
  async markAllAsRead(userId: string, tenantId: string): Promise<void> {
    const userContext = { userId, tenantId };
    await this.serviceClient.put(
      'notify',
      '/api/v1/notifications/read-all',
      {},
      {},
      userContext,
    );

    // 清除未读数量缓存
    await this.cacheManager.del(`notification:unread:${userId}`);
  }

  /**
   * 删除通知
   */
  async deleteNotification(
    notificationId: string,
    userId: string,
    tenantId: string,
  ): Promise<void> {
    const userContext = { userId, tenantId };
    await this.serviceClient.delete(
      'notify',
      `/api/v1/notifications/${notificationId}`,
      {},
      userContext,
    );

    // 清除未读数量缓存
    await this.cacheManager.del(`notification:unread:${userId}`);
  }

  /**
   * 批量删除通知
   */
  async batchDeleteNotifications(
    notificationIds: string[],
    userId: string,
    tenantId: string,
  ): Promise<void> {
    const userContext = { userId, tenantId };
    await this.serviceClient.post(
      'notify',
      '/api/v1/notifications/batch-delete',
      { notificationIds },
      {},
      userContext,
    );

    // 清除未读数量缓存
    await this.cacheManager.del(`notification:unread:${userId}`);
  }

  /**
   * 获取通知设置
   */
  async getNotificationSettings(
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const cacheKey = `notification:settings:${userId}`;

    // 尝试从缓存获取
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.serviceClient.get(
      'notify',
      '/api/v1/notifications/settings',
      {},
      userContext,
    );

    // 缓存结果（10分钟）
    await this.cacheManager.set(cacheKey, response.data, 600000);

    return response.data;
  }

  /**
   * 更新通知设置
   */
  async updateNotificationSettings(
    settings: any,
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.put(
      'notify',
      '/api/v1/notifications/settings',
      settings,
      {},
      userContext,
    );

    // 清除设置缓存
    await this.cacheManager.del(`notification:settings:${userId}`);

    return response.data;
  }

  /**
   * 获取订阅列表
   */
  async getSubscriptions(userId: string, tenantId: string): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.get(
      'notify',
      '/api/v1/subscriptions',
      {},
      userContext,
    );
    return response.data;
  }

  /**
   * 订阅通知
   */
  async subscribe(
    entityType: string,
    entityId: string,
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.post(
      'notify',
      '/api/v1/subscriptions',
      { entityType, entityId },
      {},
      userContext,
    );
    return response.data;
  }

  /**
   * 取消订阅
   */
  async unsubscribe(
    entityType: string,
    entityId: string,
    userId: string,
    tenantId: string,
  ): Promise<void> {
    const userContext = { userId, tenantId };
    await this.serviceClient.delete(
      'notify',
      `/api/v1/subscriptions?entityType=${entityType}&entityId=${entityId}`,
      {},
      userContext,
    );
  }

  /**
   * 设置免打扰
   */
  async setDoNotDisturb(
    enabled: boolean,
    startTime: string | null,
    endTime: string | null,
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.put(
      'notify',
      '/api/v1/notifications/do-not-disturb',
      { enabled, startTime, endTime },
      {},
      userContext,
    );

    // 清除设置缓存
    await this.cacheManager.del(`notification:settings:${userId}`);

    return response.data;
  }
}