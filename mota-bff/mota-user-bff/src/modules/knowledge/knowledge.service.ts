import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ServiceClientService } from '../../common/service-client/service-client.service';

interface KnowledgeDetail {
  document: any;
  versions: any[];
  relatedDocuments: any[];
  accessHistory: any[];
  tags: any[];
}

interface KnowledgeGraph {
  nodes: any[];
  edges: any[];
}

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(
    private readonly serviceClient: ServiceClientService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * 获取知识库列表
   */
  async getKnowledgeBases(
    userId: string,
    tenantId: string,
    query: any,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const queryString = new URLSearchParams(query).toString();
    const response = await this.serviceClient.get(
      'knowledge',
      `/api/v1/knowledge-bases?${queryString}`,
      {},
      userContext,
    );
    return response.data;
  }

  /**
   * 获取文档列表
   */
  async getDocuments(
    knowledgeBaseId: string,
    userId: string,
    tenantId: string,
    query: any,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const queryString = new URLSearchParams(query).toString();
    const response = await this.serviceClient.get(
      'knowledge',
      `/api/v1/knowledge-bases/${knowledgeBaseId}/documents?${queryString}`,
      {},
      userContext,
    );
    return response.data;
  }

  /**
   * 获取文档详情（聚合数据）
   */
  async getDocumentDetail(
    documentId: string,
    userId: string,
    tenantId: string,
  ): Promise<KnowledgeDetail> {
    const userContext = { userId, tenantId };
    const cacheKey = `knowledge:document:${documentId}`;

    // 尝试从缓存获取
    const cached = await this.cacheManager.get<KnowledgeDetail>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for document detail: ${documentId}`);
      return cached;
    }

    // 并行获取文档相关数据
    const [
      documentResponse,
      versionsResponse,
      relatedResponse,
      accessHistoryResponse,
      tagsResponse,
    ] = await Promise.all([
      this.serviceClient.get('knowledge', `/api/v1/documents/${documentId}`, {}, userContext),
      this.serviceClient.get('knowledge', `/api/v1/documents/${documentId}/versions`, {}, userContext),
      this.serviceClient.get('knowledge', `/api/v1/documents/${documentId}/related`, {}, userContext),
      this.serviceClient.get('knowledge', `/api/v1/documents/${documentId}/access-history`, {}, userContext),
      this.serviceClient.get('knowledge', `/api/v1/documents/${documentId}/tags`, {}, userContext),
    ]);

    const result: KnowledgeDetail = {
      document: documentResponse.data,
      versions: (versionsResponse.data as any[]) || [],
      relatedDocuments: (relatedResponse.data as any[]) || [],
      accessHistory: (accessHistoryResponse.data as any[]) || [],
      tags: (tagsResponse.data as any[]) || [],
    };

    // 缓存结果（10分钟）
    await this.cacheManager.set(cacheKey, result, 600000);

    return result;
  }

  /**
   * 获取知识图谱
   */
  async getKnowledgeGraph(
    knowledgeBaseId: string,
    userId: string,
    tenantId: string,
  ): Promise<KnowledgeGraph> {
    const userContext = { userId, tenantId };
    const cacheKey = `knowledge:graph:${knowledgeBaseId}`;

    // 尝试从缓存获取
    const cached = await this.cacheManager.get<KnowledgeGraph>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for knowledge graph: ${knowledgeBaseId}`);
      return cached;
    }

    const response = await this.serviceClient.get(
      'knowledge',
      `/api/v1/knowledge-bases/${knowledgeBaseId}/graph`,
      {},
      userContext,
    );

    const result: KnowledgeGraph = {
      nodes: (response.data as any)?.nodes || [],
      edges: (response.data as any)?.edges || [],
    };

    // 缓存结果（5分钟）
    await this.cacheManager.set(cacheKey, result, 300000);

    return result;
  }

  /**
   * 搜索知识库
   */
  async searchKnowledge(
    query: string,
    userId: string,
    tenantId: string,
    options: any = {},
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.post(
      'search',
      '/api/v1/search',
      {
        query,
        type: 'knowledge',
        ...options,
      },
      {},
      userContext,
    );
    return response.data;
  }

  /**
   * 创建知识库
   */
  async createKnowledgeBase(
    data: any,
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.post(
      'knowledge',
      '/api/v1/knowledge-bases',
      data,
      {},
      userContext,
    );
    return response.data;
  }

  /**
   * 创建文档
   */
  async createDocument(
    knowledgeBaseId: string,
    data: any,
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.post(
      'knowledge',
      `/api/v1/knowledge-bases/${knowledgeBaseId}/documents`,
      data,
      {},
      userContext,
    );

    // 清除知识图谱缓存
    await this.cacheManager.del(`knowledge:graph:${knowledgeBaseId}`);

    return response.data;
  }

  /**
   * 更新文档
   */
  async updateDocument(
    documentId: string,
    data: any,
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.put(
      'knowledge',
      `/api/v1/documents/${documentId}`,
      data,
      {},
      userContext,
    );

    // 清除文档缓存
    await this.cacheManager.del(`knowledge:document:${documentId}`);

    return response.data;
  }

  /**
   * 删除文档
   */
  async deleteDocument(
    documentId: string,
    userId: string,
    tenantId: string,
  ): Promise<void> {
    const userContext = { userId, tenantId };
    await this.serviceClient.delete(
      'knowledge',
      `/api/v1/documents/${documentId}`,
      {},
      userContext,
    );

    // 清除文档缓存
    await this.cacheManager.del(`knowledge:document:${documentId}`);
  }

  /**
   * 获取最近访问的文档
   */
  async getRecentDocuments(
    userId: string,
    tenantId: string,
    limit: number = 10,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.get(
      'knowledge',
      `/api/v1/documents/recent?limit=${limit}`,
      {},
      userContext,
    );
    return response.data;
  }

  /**
   * 获取收藏的文档
   */
  async getFavoriteDocuments(
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.get(
      'knowledge',
      '/api/v1/documents/favorites',
      {},
      userContext,
    );
    return response.data;
  }

  /**
   * 收藏/取消收藏文档
   */
  async toggleFavorite(
    documentId: string,
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.post(
      'knowledge',
      `/api/v1/documents/${documentId}/favorite`,
      {},
      {},
      userContext,
    );
    return response.data;
  }

  /**
   * 获取文档版本
   */
  async getDocumentVersion(
    documentId: string,
    versionId: string,
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.get(
      'knowledge',
      `/api/v1/documents/${documentId}/versions/${versionId}`,
      {},
      userContext,
    );
    return response.data;
  }

  /**
   * 恢复文档版本
   */
  async restoreDocumentVersion(
    documentId: string,
    versionId: string,
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const userContext = { userId, tenantId };
    const response = await this.serviceClient.post(
      'knowledge',
      `/api/v1/documents/${documentId}/versions/${versionId}/restore`,
      {},
      {},
      userContext,
    );

    // 清除文档缓存
    await this.cacheManager.del(`knowledge:document:${documentId}`);

    return response.data;
  }
}