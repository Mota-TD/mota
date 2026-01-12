import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ServiceClientService } from '../../common/service-client/service-client.service';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(
    private readonly serviceClient: ServiceClientService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * 发送聊天消息
   */
  async chat(
    sessionId: string | null,
    message: string,
    userId: string,
    tenantId: string,
    options: any = {},
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.post(
      'ai',
      '/api/v1/chat',
      {
        sessionId,
        message,
        ...options,
      },
      {},
      userContext,
    );

    // 清除会话缓存
    if (sessionId) {
      await this.cacheManager.del(`ai:session:${sessionId}`);
    }

    return response.data;
  }

  /**
   * 流式聊天（返回流式响应URL）
   */
  async chatStream(
    sessionId: string | null,
    message: string,
    userId: string,
    tenantId: string,
    options: any = {},
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.post(
      'ai',
      '/api/v1/chat/stream',
      {
        sessionId,
        message,
        ...options,
      },
      {},
      userContext,
    );
    return response.data;
  }

  /**
   * 获取聊天会话列表
   */
  async getChatSessions(
    userId: string,
    tenantId: string,
    query: any = {},
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const queryString = new URLSearchParams(query).toString();
    const response = await this.serviceClient.get(
      'ai',
      `/api/v1/chat/sessions?${queryString}`,
      {},
      userContext,
    );
    return response.data;
  }

  /**
   * 获取聊天会话详情
   */
  async getChatSession(
    sessionId: string,
    userId: string,
    tenantId: string,
  ): Promise<ChatSession | null> {
    const userContext = { userId, tenantId };
    const cacheKey = `ai:session:${sessionId}`;

    // 尝试从缓存获取
    const cached = await this.cacheManager.get<ChatSession>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for chat session: ${sessionId}`);
      return cached;
    }

    const response = await this.serviceClient.get(
      'ai',
      `/api/v1/chat/sessions/${sessionId}`,
      {},
      userContext,
    );

    const session = response.data as ChatSession;

    // 缓存结果（5分钟）
    if (session) {
      await this.cacheManager.set(cacheKey, session, 300000);
    }

    return session;
  }

  /**
   * 删除聊天会话
   */
  async deleteChatSession(
    sessionId: string,
    userId: string,
    tenantId: string,
  ): Promise<void> {
    const userContext = { userId, tenantId };
    await this.serviceClient.delete(
      'ai',
      `/api/v1/chat/sessions/${sessionId}`,
      {},
      userContext,
    );

    // 清除缓存
    await this.cacheManager.del(`ai:session:${sessionId}`);
  }

  /**
   * 获取AI建议
   */
  async getSuggestions(
    context: string,
    type: string,
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.post(
      'ai',
      '/api/v1/suggestions',
      {
        context,
        type,
      },
      {},
      userContext,
    );
    return response.data;
  }

  /**
   * 获取任务建议
   */
  async getTaskSuggestions(
    taskId: string,
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.get(
      'ai',
      `/api/v1/tasks/${taskId}/suggestions`,
      {},
      userContext,
    );
    return response.data;
  }

  /**
   * 获取项目建议
   */
  async getProjectSuggestions(
    projectId: string,
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.get(
      'ai',
      `/api/v1/projects/${projectId}/suggestions`,
      {},
      userContext,
    );
    return response.data;
  }

  /**
   * 智能搜索
   */
  async smartSearch(
    query: string,
    userId: string,
    tenantId: string,
    options: any = {},
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.post(
      'ai',
      '/api/v1/smart-search',
      {
        query,
        ...options,
      },
      {},
      userContext,
    );
    return response.data;
  }

  /**
   * 文档摘要
   */
  async summarizeDocument(
    documentId: string,
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.post(
      'ai',
      `/api/v1/documents/${documentId}/summarize`,
      {},
      {},
      userContext,
    );
    return response.data;
  }

  /**
   * 文本翻译
   */
  async translate(
    text: string,
    targetLanguage: string,
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.post(
      'ai',
      '/api/v1/translate',
      {
        text,
        targetLanguage,
      },
      {},
      userContext,
    );
    return response.data;
  }

  /**
   * 获取AI使用统计
   */
  async getUsageStats(
    userId: string,
    tenantId: string,
    period: string = 'month',
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.get(
      'ai',
      `/api/v1/usage/stats?period=${period}`,
      {},
      userContext,
    );
    return response.data;
  }

  /**
   * 获取可用的AI模型列表
   */
  async getAvailableModels(
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const cacheKey = `ai:models:${tenantId}`;

    // 尝试从缓存获取
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.serviceClient.get(
      'ai',
      '/api/v1/models',
      {},
      userContext,
    );

    // 缓存结果（1小时）
    await this.cacheManager.set(cacheKey, response.data, 3600000);

    return response.data;
  }

  /**
   * 生成内容
   */
  async generateContent(
    prompt: string,
    type: string,
    userId: string,
    tenantId: string,
    options: any = {},
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.post(
      'ai',
      '/api/v1/generate',
      {
        prompt,
        type,
        ...options,
      },
      {},
      userContext,
    );
    return response.data;
  }
}