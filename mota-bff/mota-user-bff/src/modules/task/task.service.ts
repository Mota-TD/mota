import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ServiceClientService } from '../../common/service-client/service-client.service';

interface TaskDetail {
  task: any;
  subtasks: any[];
  comments: any[];
  attachments: any[];
  dependencies: any[];
  history: any[];
}

interface TaskBoard {
  columns: any[];
  tasks: any[];
}

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    private readonly serviceClient: ServiceClientService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * 获取任务列表
   */
  async getTasks(
    userId: string,
    tenantId: string,
    query: any,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const queryString = new URLSearchParams(query).toString();
    const response = await this.serviceClient.get(
      'task',
      `/api/v1/tasks?${queryString}`,
      {},
      userContext,
    );
    return response.data;
  }

  /**
   * 获取任务详情（聚合数据）
   */
  async getTaskDetail(
    taskId: string,
    userId: string,
    tenantId: string,
  ): Promise<TaskDetail> {
    const userContext = { userId, tenantId };
    const cacheKey = `task:detail:${taskId}`;

    // 尝试从缓存获取
    const cached = await this.cacheManager.get<TaskDetail>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for task detail: ${taskId}`);
      return cached;
    }

    // 并行获取任务相关数据
    const [
      taskResponse,
      subtasksResponse,
      commentsResponse,
      attachmentsResponse,
      dependenciesResponse,
      historyResponse,
    ] = await Promise.all([
      this.serviceClient.get('task', `/api/v1/tasks/${taskId}`, {}, userContext),
      this.serviceClient.get('task', `/api/v1/tasks/${taskId}/subtasks`, {}, userContext),
      this.serviceClient.get('task', `/api/v1/tasks/${taskId}/comments`, {}, userContext),
      this.serviceClient.get('file', `/api/v1/files?entityType=task&entityId=${taskId}`, {}, userContext),
      this.serviceClient.get('task', `/api/v1/tasks/${taskId}/dependencies`, {}, userContext),
      this.serviceClient.get('task', `/api/v1/tasks/${taskId}/history`, {}, userContext),
    ]);

    const result: TaskDetail = {
      task: taskResponse.data,
      subtasks: subtasksResponse.data || [],
      comments: commentsResponse.data || [],
      attachments: attachmentsResponse.data || [],
      dependencies: dependenciesResponse.data || [],
      history: historyResponse.data || [],
    };

    // 缓存结果（5分钟）
    await this.cacheManager.set(cacheKey, result, 300000);

    return result;
  }

  /**
   * 获取看板视图数据
   */
  async getTaskBoard(
    projectId: string,
    userId: string,
    tenantId: string,
  ): Promise<TaskBoard> {
    const userContext = { userId, tenantId };
    const cacheKey = `task:board:${projectId}`;

    // 尝试从缓存获取
    const cached = await this.cacheManager.get<TaskBoard>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for task board: ${projectId}`);
      return cached;
    }

    // 并行获取看板数据
    const [columnsResponse, tasksResponse] = await Promise.all([
      this.serviceClient.get('task', `/api/v1/projects/${projectId}/columns`, {}, userContext),
      this.serviceClient.get('task', `/api/v1/tasks?projectId=${projectId}`, {}, userContext),
    ]);

    const result: TaskBoard = {
      columns: columnsResponse.data || [],
      tasks: tasksResponse.data || [],
    };

    // 缓存结果（2分钟）
    await this.cacheManager.set(cacheKey, result, 120000);

    return result;
  }

  /**
   * 获取我的任务
   */
  async getMyTasks(
    userId: string,
    tenantId: string,
    query: any,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const queryString = new URLSearchParams({
      ...query,
      assigneeId: userId,
    }).toString();
    const response = await this.serviceClient.get(
      'task',
      `/api/v1/tasks?${queryString}`,
      {},
      userContext,
    );
    return response.data;
  }

  /**
   * 获取今日任务
   */
  async getTodayTasks(userId: string, tenantId: string): Promise<any> {
    const userContext = { userId, tenantId };
    const today = new Date().toISOString().split('T')[0];
    const response = await this.serviceClient.get(
      'task',
      `/api/v1/tasks?assigneeId=${userId}&dueDate=${today}`,
      {},
      userContext,
    );
    return response.data;
  }

  /**
   * 获取逾期任务
   */
  async getOverdueTasks(userId: string, tenantId: string): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.get(
      'task',
      `/api/v1/tasks?assigneeId=${userId}&overdue=true`,
      {},
      userContext,
    );
    return response.data;
  }

  /**
   * 创建任务
   */
  async createTask(
    data: any,
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.post(
      'task',
      '/api/v1/tasks',
      data,
      {},
      userContext,
    );

    // 清除相关缓存
    if (data.projectId) {
      await this.cacheManager.del(`task:board:${data.projectId}`);
    }

    return response.data;
  }

  /**
   * 更新任务
   */
  async updateTask(
    taskId: string,
    data: any,
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.put(
      'task',
      `/api/v1/tasks/${taskId}`,
      data,
      {},
      userContext,
    );

    // 清除相关缓存
    await this.cacheManager.del(`task:detail:${taskId}`);
    if (data.projectId) {
      await this.cacheManager.del(`task:board:${data.projectId}`);
    }

    return response.data;
  }

  /**
   * 删除任务
   */
  async deleteTask(
    taskId: string,
    userId: string,
    tenantId: string,
  ): Promise<void> {
    const userContext = { userId, tenantId };

    // 先获取任务信息以便清除缓存
    const taskResponse = await this.serviceClient.get(
      'task',
      `/api/v1/tasks/${taskId}`,
      {},
      userContext,
    );

    await this.serviceClient.delete(
      'task',
      `/api/v1/tasks/${taskId}`,
      {},
      userContext,
    );

    // 清除相关缓存
    await this.cacheManager.del(`task:detail:${taskId}`);
    if (taskResponse.data?.projectId) {
      await this.cacheManager.del(`task:board:${taskResponse.data.projectId}`);
    }
  }

  /**
   * 更新任务状态
   */
  async updateTaskStatus(
    taskId: string,
    status: string,
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.put(
      'task',
      `/api/v1/tasks/${taskId}/status`,
      { status },
      {},
      userContext,
    );

    // 清除相关缓存
    await this.cacheManager.del(`task:detail:${taskId}`);

    return response.data;
  }

  /**
   * 添加任务评论
   */
  async addComment(
    taskId: string,
    content: string,
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.post(
      'task',
      `/api/v1/tasks/${taskId}/comments`,
      { content },
      {},
      userContext,
    );

    // 清除任务详情缓存
    await this.cacheManager.del(`task:detail:${taskId}`);

    return response.data;
  }

  /**
   * 添加子任务
   */
  async addSubtask(
    taskId: string,
    data: any,
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.post(
      'task',
      `/api/v1/tasks/${taskId}/subtasks`,
      data,
      {},
      userContext,
    );

    // 清除任务详情缓存
    await this.cacheManager.del(`task:detail:${taskId}`);

    return response.data;
  }

  /**
   * 批量更新任务
   */
  async batchUpdateTasks(
    taskIds: string[],
    data: any,
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.put(
      'task',
      '/api/v1/tasks/batch',
      { taskIds, ...data },
      {},
      userContext,
    );

    // 清除相关缓存
    for (const taskId of taskIds) {
      await this.cacheManager.del(`task:detail:${taskId}`);
    }

    return response.data;
  }
}