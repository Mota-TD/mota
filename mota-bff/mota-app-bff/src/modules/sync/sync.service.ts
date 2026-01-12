import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ServiceClientService } from '../../common/service-client/service-client.service';

/**
 * 同步操作类型
 */
enum SyncOperationType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

/**
 * 同步项
 */
interface SyncItem {
  id: string;
  entityType: string; // task, project, event, etc.
  entityId: string;
  operation: SyncOperationType;
  data: any;
  timestamp: number;
  clientId: string;
}

/**
 * 同步结果
 */
interface SyncResult {
  success: boolean;
  syncedItems: string[];
  failedItems: { id: string; error: string }[];
  conflicts: { id: string; serverData: any; clientData: any }[];
  serverChanges: any[];
  lastSyncTimestamp: number;
}

/**
 * 增量同步数据
 */
interface DeltaSyncData {
  tasks: any[];
  projects: any[];
  events: any[];
  notifications: any[];
  lastSyncTimestamp: number;
}

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly serviceClient: ServiceClientService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * 执行同步操作
   * 处理客户端离线期间的变更，并返回服务器端的变更
   */
  async sync(
    syncItems: SyncItem[],
    lastSyncTimestamp: number,
    userId: string,
    tenantId: string,
  ): Promise<SyncResult> {
    const userContext = { userId, tenantId };
    const result: SyncResult = {
      success: true,
      syncedItems: [],
      failedItems: [],
      conflicts: [],
      serverChanges: [],
      lastSyncTimestamp: Date.now(),
    };

    // 1. 处理客户端变更
    for (const item of syncItems) {
      try {
        const syncResult = await this.processSyncItem(item, userContext);
        if (syncResult.success) {
          result.syncedItems.push(item.id);
        } else if (syncResult.conflict) {
          result.conflicts.push({
            id: item.id,
            serverData: syncResult.serverData,
            clientData: item.data,
          });
        } else {
          result.failedItems.push({
            id: item.id,
            error: syncResult.error || 'Unknown error',
          });
        }
      } catch (error) {
        result.failedItems.push({
          id: item.id,
          error: error.message,
        });
      }
    }

    // 2. 获取服务器端变更
    try {
      const serverChanges = await this.getServerChanges(
        lastSyncTimestamp,
        userId,
        tenantId,
      );
      result.serverChanges = serverChanges;
    } catch (error) {
      this.logger.error('Failed to get server changes', error);
    }

    // 3. 更新同步状态
    await this.updateSyncStatus(userId, result.lastSyncTimestamp);

    return result;
  }

  /**
   * 处理单个同步项
   */
  private async processSyncItem(
    item: SyncItem,
    userContext: { userId: string; tenantId: string },
  ): Promise<{ success: boolean; conflict?: boolean; serverData?: any; error?: string }> {
    const serviceMap: Record<string, string> = {
      task: 'task',
      project: 'project',
      event: 'calendar',
      document: 'knowledge',
    };

    const service = serviceMap[item.entityType];
    if (!service) {
      return { success: false, error: `Unknown entity type: ${item.entityType}` };
    }

    try {
      // 检查冲突
      if (item.operation === SyncOperationType.UPDATE) {
        const serverResponse = await this.serviceClient.get(
          service,
          `/api/v1/${item.entityType}s/${item.entityId}`,
          {},
          userContext,
        );
        const serverData = serverResponse.data as any;
        
        // 如果服务器数据更新时间晚于客户端操作时间，存在冲突
        if (serverData && new Date(serverData.updatedAt).getTime() > item.timestamp) {
          return {
            success: false,
            conflict: true,
            serverData,
          };
        }
      }

      // 执行操作
      switch (item.operation) {
        case SyncOperationType.CREATE:
          await this.serviceClient.post(
            service,
            `/api/v1/${item.entityType}s`,
            item.data,
            {},
            userContext,
          );
          break;
        case SyncOperationType.UPDATE:
          await this.serviceClient.put(
            service,
            `/api/v1/${item.entityType}s/${item.entityId}`,
            item.data,
            {},
            userContext,
          );
          break;
        case SyncOperationType.DELETE:
          await this.serviceClient.delete(
            service,
            `/api/v1/${item.entityType}s/${item.entityId}`,
            {},
            userContext,
          );
          break;
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取服务器端变更
   */
  private async getServerChanges(
    lastSyncTimestamp: number,
    userId: string,
    tenantId: string,
  ): Promise<any[]> {
    const userContext = { userId, tenantId };
    const changes: any[] = [];
    const since = new Date(lastSyncTimestamp).toISOString();

    // 并行获取各类型的变更
    const [tasksResponse, projectsResponse, eventsResponse] = await Promise.all([
      this.serviceClient.get(
        'task',
        `/api/v1/tasks?assigneeId=${userId}&updatedSince=${since}`,
        {},
        userContext,
      ),
      this.serviceClient.get(
        'project',
        `/api/v1/projects?memberId=${userId}&updatedSince=${since}`,
        {},
        userContext,
      ),
      this.serviceClient.get(
        'calendar',
        `/api/v1/events?updatedSince=${since}`,
        {},
        userContext,
      ),
    ]);

    // 合并变更
    const tasks = (tasksResponse.data as any[]) || [];
    const projects = (projectsResponse.data as any[]) || [];
    const events = (eventsResponse.data as any[]) || [];

    tasks.forEach(task => changes.push({ type: 'task', data: task }));
    projects.forEach(project => changes.push({ type: 'project', data: project }));
    events.forEach(event => changes.push({ type: 'event', data: event }));

    return changes;
  }

  /**
   * 获取增量同步数据
   */
  async getDeltaSync(
    lastSyncTimestamp: number,
    userId: string,
    tenantId: string,
  ): Promise<DeltaSyncData> {
    const userContext = { userId, tenantId };
    const since = new Date(lastSyncTimestamp).toISOString();

    const [tasksResponse, projectsResponse, eventsResponse, notificationsResponse] = await Promise.all([
      this.serviceClient.get(
        'task',
        `/api/v1/tasks?assigneeId=${userId}&updatedSince=${since}`,
        {},
        userContext,
      ),
      this.serviceClient.get(
        'project',
        `/api/v1/projects?memberId=${userId}&updatedSince=${since}`,
        {},
        userContext,
      ),
      this.serviceClient.get(
        'calendar',
        `/api/v1/events?updatedSince=${since}`,
        {},
        userContext,
      ),
      this.serviceClient.get(
        'notify',
        `/api/v1/notifications?createdSince=${since}`,
        {},
        userContext,
      ),
    ]);

    return {
      tasks: (tasksResponse.data as any[]) || [],
      projects: (projectsResponse.data as any[]) || [],
      events: (eventsResponse.data as any[]) || [],
      notifications: (notificationsResponse.data as any[]) || [],
      lastSyncTimestamp: Date.now(),
    };
  }

  /**
   * 获取完整同步数据（首次同步或重置同步）
   */
  async getFullSync(userId: string, tenantId: string): Promise<DeltaSyncData> {
    const userContext = { userId, tenantId };

    const [tasksResponse, projectsResponse, eventsResponse, notificationsResponse] = await Promise.all([
      this.serviceClient.get(
        'task',
        `/api/v1/tasks?assigneeId=${userId}&limit=100`,
        {},
        userContext,
      ),
      this.serviceClient.get(
        'project',
        `/api/v1/projects?memberId=${userId}&limit=50`,
        {},
        userContext,
      ),
      this.serviceClient.get(
        'calendar',
        `/api/v1/events?limit=100`,
        {},
        userContext,
      ),
      this.serviceClient.get(
        'notify',
        `/api/v1/notifications?limit=50`,
        {},
        userContext,
      ),
    ]);

    return {
      tasks: (tasksResponse.data as any[]) || [],
      projects: (projectsResponse.data as any[]) || [],
      events: (eventsResponse.data as any[]) || [],
      notifications: (notificationsResponse.data as any[]) || [],
      lastSyncTimestamp: Date.now(),
    };
  }

  /**
   * 更新同步状态
   */
  private async updateSyncStatus(userId: string, timestamp: number): Promise<void> {
    const cacheKey = `sync:status:${userId}`;
    await this.cacheManager.set(cacheKey, { lastSyncTimestamp: timestamp }, 86400000); // 24小时
  }

  /**
   * 获取同步状态
   */
  async getSyncStatus(userId: string): Promise<{ lastSyncTimestamp: number | null }> {
    const cacheKey = `sync:status:${userId}`;
    const status = await this.cacheManager.get<{ lastSyncTimestamp: number }>(cacheKey);
    return { lastSyncTimestamp: status?.lastSyncTimestamp || null };
  }

  /**
   * 解决冲突
   */
  async resolveConflict(
    entityType: string,
    entityId: string,
    resolution: 'client' | 'server' | 'merge',
    mergedData: any | null,
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const serviceMap: Record<string, string> = {
      task: 'task',
      project: 'project',
      event: 'calendar',
      document: 'knowledge',
    };

    const service = serviceMap[entityType];
    if (!service) {
      throw new Error(`Unknown entity type: ${entityType}`);
    }

    if (resolution === 'server') {
      // 使用服务器数据，不需要操作
      const response = await this.serviceClient.get(
        service,
        `/api/v1/${entityType}s/${entityId}`,
        {},
        userContext,
      );
      return response.data;
    }

    if (resolution === 'client' || resolution === 'merge') {
      // 使用客户端数据或合并数据
      const dataToSave = resolution === 'merge' ? mergedData : mergedData;
      const response = await this.serviceClient.put(
        service,
        `/api/v1/${entityType}s/${entityId}`,
        { ...dataToSave, forceUpdate: true },
        {},
        userContext,
      );
      return response.data;
    }

    throw new Error(`Invalid resolution: ${resolution}`);
  }
}