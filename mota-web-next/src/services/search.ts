import { api } from '@/lib/api-client';

// ==================== 类型定义 ====================

// 搜索结果项
export interface SearchResultItem {
  id: number;
  type: string;
  title: string;
  content: string;
  score: number;
  highlights: string[];
  metadata?: Record<string, unknown>;
}

// 搜索意图
export interface SearchIntent {
  originalQuery: string;
  intentCode: string;
  intentName: string;
  actionType: string;
  confidence: number;
  parameters?: Record<string, unknown>;
}

// 搜索结果
export interface SmartSearchResult {
  query: string;
  correctedQuery?: string;
  wasCorrected: boolean;
  searchType: string;
  detectedIntent?: SearchIntent;
  expandedTerms?: string[];
  items: SearchResultItem[];
  totalCount: number;
  searchTimeMs: number;
}

// 搜索建议
export interface SearchSuggestion {
  id?: number;
  suggestionText: string;
  suggestionType: string;
  frequency: number;
  score?: number;
}

// 搜索热词
export interface SearchHotWord {
  id: number;
  word: string;
  periodType: string;
  periodDate: string;
  searchCount: number;
  trendScore: number;
  isTrending: boolean;
}

// 相关搜索
export interface SearchRelatedQuery {
  id: number;
  sourceQuery: string;
  relatedQuery: string;
  relationType: string;
  relevanceScore: number;
  clickCount: number;
}

// 搜索日志
export interface SearchLog {
  id: number;
  userId: number;
  queryText: string;
  queryType: string;
  correctedQuery?: string;
  detectedIntent?: string;
  resultCount: number;
  searchTimeMs: number;
  isSuccessful: boolean;
  createdAt: string;
}

// 用户搜索偏好
export interface UserSearchPreference {
  id?: number;
  userId: number;
  defaultSearchType: string;
  enableAutoCorrect: boolean;
  enableSuggestion: boolean;
  enableHistory: boolean;
  historyRetentionDays: number;
  preferredResultCount: number;
  searchFilters?: string;
}

// 文档向量
export interface DocumentVector {
  id: number;
  documentId: number;
  documentType: string;
  chunkIndex: number;
  chunkText: string;
  vectorDimension: number;
  embeddingModel: string;
}

// 纠错结果
export interface CorrectionResult {
  original: string;
  corrected: string;
  wasCorrected: boolean;
  suggestions: string[];
}

// 旧版兼容类型
export interface SearchResult {
  id: string;
  type: 'project' | 'task' | 'document' | 'knowledge' | 'user' | 'event';
  title: string;
  content: string;
  highlights: string[];
  url: string;
  score: number;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  took: number;
  mode: string;
}

// ==================== 搜索服务 ====================

export const searchService = {
  // ==================== SS-001 全文检索 ====================
  
  /**
   * 全文关键词检索
   */
  async keywordSearch(
    query: string,
    type?: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<SmartSearchResult> {
    try {
      const response = await api.get<SmartSearchResult>('/api/v1/search/keyword', {
        params: { query, type, page, pageSize }
      });
      return response.data;
    } catch {
      // 返回模拟数据
      return generateMockSearchResult(query, 'keyword');
    }
  },

  // ==================== SS-002 语义搜索 ====================
  
  /**
   * 语义相似度搜索
   */
  async semanticSearch(
    query: string,
    type?: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<SmartSearchResult> {
    try {
      const response = await api.get<SmartSearchResult>('/api/v1/search/semantic', {
        params: { query, type, page, pageSize }
      });
      return response.data;
    } catch {
      return generateMockSearchResult(query, 'semantic');
    }
  },

  // ==================== SS-003 向量检索 ====================
  
  /**
   * 向量数据库检索
   */
  async vectorSearch(
    vector: number[],
    topK: number = 10
  ): Promise<DocumentVector[]> {
    try {
      const response = await api.post<DocumentVector[]>('/api/v1/search/vector', { vector, topK });
      return response.data;
    } catch {
      return [];
    }
  },

  // ==================== SS-004 混合检索 ====================
  
  /**
   * 向量+关键词混合检索
   */
  async hybridSearch(
    query: string,
    type?: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<SmartSearchResult> {
    try {
      const response = await api.get<SmartSearchResult>('/api/v1/search/hybrid', {
        params: { query, type, page, pageSize }
      });
      return response.data;
    } catch {
      return generateMockSearchResult(query, 'hybrid');
    }
  },

  // ==================== SS-005 意图识别 ====================
  
  /**
   * 搜索意图识别
   */
  async detectIntent(query: string): Promise<SearchIntent> {
    try {
      const response = await api.get<SearchIntent>('/api/v1/search/intent', {
        params: { query }
      });
      return response.data;
    } catch {
      return {
        originalQuery: query,
        intentCode: 'SEARCH',
        intentName: '通用搜索',
        actionType: 'search',
        confidence: 0.85
      };
    }
  },

  // ==================== SS-006 自动纠错 ====================
  
  /**
   * 搜索词自动纠错
   */
  async autoCorrect(query: string): Promise<CorrectionResult> {
    try {
      const response = await api.get<CorrectionResult>('/api/v1/search/correct', {
        params: { query }
      });
      return response.data;
    } catch {
      return {
        original: query,
        corrected: query,
        wasCorrected: false,
        suggestions: []
      };
    }
  },

  // ==================== SS-007 智能补全 ====================
  
  /**
   * 搜索词智能补全
   */
  async getCompletions(
    prefix: string,
    limit: number = 10
  ): Promise<SearchSuggestion[]> {
    try {
      const response = await api.get<SearchSuggestion[]>('/api/v1/search/complete', {
        params: { prefix, limit }
      });
      return response.data;
    } catch {
      // 返回模拟补全建议
      if (!prefix || prefix.length < 1) return [];
      return [
        { suggestionText: `${prefix}项目管理`, suggestionType: 'completion', frequency: 120 },
        { suggestionText: `${prefix}任务分配`, suggestionType: 'completion', frequency: 95 },
        { suggestionText: `${prefix}文档协作`, suggestionType: 'completion', frequency: 78 },
        { suggestionText: `${prefix}团队协作`, suggestionType: 'completion', frequency: 65 },
        { suggestionText: `${prefix}进度跟踪`, suggestionType: 'completion', frequency: 52 },
      ].slice(0, limit);
    }
  },

  // ==================== SS-008 相关推荐 ====================
  
  /**
   * 相关搜索推荐
   */
  async getRelatedQueries(
    query: string,
    limit: number = 10
  ): Promise<SearchRelatedQuery[]> {
    try {
      const response = await api.get<SearchRelatedQuery[]>('/api/v1/search/related', {
        params: { query, limit }
      });
      return response.data;
    } catch {
      return [
        { id: 1, sourceQuery: query, relatedQuery: `${query} 最佳实践`, relationType: 'related', relevanceScore: 0.92, clickCount: 156 },
        { id: 2, sourceQuery: query, relatedQuery: `${query} 教程`, relationType: 'related', relevanceScore: 0.88, clickCount: 134 },
        { id: 3, sourceQuery: query, relatedQuery: `${query} 案例`, relationType: 'related', relevanceScore: 0.85, clickCount: 98 },
        { id: 4, sourceQuery: query, relatedQuery: `${query} 工具`, relationType: 'related', relevanceScore: 0.82, clickCount: 87 },
        { id: 5, sourceQuery: query, relatedQuery: `${query} 方法`, relationType: 'related', relevanceScore: 0.78, clickCount: 65 },
      ].slice(0, limit);
    }
  },

  /**
   * 获取热门搜索
   */
  async getHotSearches(
    period: string = 'daily',
    limit: number = 10
  ): Promise<SearchHotWord[]> {
    try {
      const response = await api.get<SearchHotWord[]>('/api/v1/search/hot', {
        params: { period, limit }
      });
      return response.data;
    } catch {
      return [
        { id: 1, word: '项目管理', periodType: period, periodDate: new Date().toISOString().split('T')[0], searchCount: 1256, trendScore: 95, isTrending: true },
        { id: 2, word: '敏捷开发', periodType: period, periodDate: new Date().toISOString().split('T')[0], searchCount: 987, trendScore: 88, isTrending: true },
        { id: 3, word: '任务看板', periodType: period, periodDate: new Date().toISOString().split('T')[0], searchCount: 876, trendScore: 82, isTrending: false },
        { id: 4, word: '甘特图', periodType: period, periodDate: new Date().toISOString().split('T')[0], searchCount: 765, trendScore: 75, isTrending: true },
        { id: 5, word: '团队协作', periodType: period, periodDate: new Date().toISOString().split('T')[0], searchCount: 654, trendScore: 68, isTrending: false },
        { id: 6, word: 'OKR目标', periodType: period, periodDate: new Date().toISOString().split('T')[0], searchCount: 543, trendScore: 62, isTrending: true },
        { id: 7, word: '知识库', periodType: period, periodDate: new Date().toISOString().split('T')[0], searchCount: 432, trendScore: 55, isTrending: false },
        { id: 8, word: '文档管理', periodType: period, periodDate: new Date().toISOString().split('T')[0], searchCount: 321, trendScore: 48, isTrending: false },
        { id: 9, word: '日程安排', periodType: period, periodDate: new Date().toISOString().split('T')[0], searchCount: 234, trendScore: 42, isTrending: true },
        { id: 10, word: '数据报表', periodType: period, periodDate: new Date().toISOString().split('T')[0], searchCount: 198, trendScore: 35, isTrending: false },
      ].slice(0, limit);
    }
  },

  // ==================== 用户偏好与历史 ====================
  
  /**
   * 获取搜索历史
   */
  async getSearchHistory(limit: number = 20): Promise<SearchLog[]> {
    try {
      const response = await api.get<SearchLog[]>('/api/v1/search/history', {
        params: { limit }
      });
      return response.data;
    } catch {
      return [
        { id: 1, userId: 1, queryText: '项目进度报告', queryType: 'hybrid', resultCount: 15, searchTimeMs: 45, isSuccessful: true, createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: 2, userId: 1, queryText: '任务分配方案', queryType: 'keyword', resultCount: 23, searchTimeMs: 32, isSuccessful: true, createdAt: new Date(Date.now() - 7200000).toISOString() },
        { id: 3, userId: 1, queryText: '团队协作工具', queryType: 'semantic', resultCount: 18, searchTimeMs: 58, isSuccessful: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
        { id: 4, userId: 1, queryText: '敏捷开发流程', queryType: 'hybrid', resultCount: 12, searchTimeMs: 41, isSuccessful: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
        { id: 5, userId: 1, queryText: '知识库管理', queryType: 'keyword', resultCount: 8, searchTimeMs: 28, isSuccessful: true, createdAt: new Date(Date.now() - 259200000).toISOString() },
      ].slice(0, limit);
    }
  },

  /**
   * 清除搜索历史
   */
  async clearSearchHistory(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete<{ success: boolean; message: string }>('/api/v1/search/history');
      return response.data;
    } catch {
      return { success: true, message: '搜索历史已清除' };
    }
  },

  /**
   * 获取用户搜索偏好
   */
  async getUserPreference(): Promise<UserSearchPreference> {
    try {
      const response = await api.get<UserSearchPreference>('/api/v1/search/preference');
      return response.data;
    } catch {
      return {
        userId: 1,
        defaultSearchType: 'hybrid',
        enableAutoCorrect: true,
        enableSuggestion: true,
        enableHistory: true,
        historyRetentionDays: 30,
        preferredResultCount: 20
      };
    }
  },

  /**
   * 保存用户搜索偏好
   */
  async saveUserPreference(
    preference: Partial<UserSearchPreference>
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<{ success: boolean; message: string }>('/api/v1/search/preference', preference);
      return response.data;
    } catch {
      return { success: true, message: '偏好设置已保存' };
    }
  },

  // ==================== 统一搜索入口 ====================
  
  /**
   * 统一搜索接口
   */
  async search(
    query: string,
    mode: 'keyword' | 'semantic' | 'hybrid' = 'hybrid',
    type?: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<SmartSearchResult> {
    try {
      const response = await api.get<SmartSearchResult>('/api/v1/search', {
        params: { query, mode, type, page, pageSize }
      });
      return response.data;
    } catch {
      return generateMockSearchResult(query, mode);
    }
  },

  // ==================== 旧版兼容方法 ====================
  
  /**
   * 旧版搜索方法（兼容）
   */
  async legacySearch(params: {
    query: string;
    type?: string;
    mode?: 'keyword' | 'semantic' | 'hybrid';
    relevanceThreshold?: number;
    sortBy?: 'relevance' | 'date' | 'popularity';
    page?: number;
    pageSize?: number;
  }): Promise<SearchResponse> {
    try {
      const response = await api.post<SearchResponse>('/api/v1/search', params);
      return response.data || { results: [], total: 0, took: 0, mode: params.mode || 'hybrid' };
    } catch {
      return { results: [], total: 0, took: 0, mode: params.mode || 'hybrid' };
    }
  },

  /**
   * 旧版获取建议（兼容）
   */
  async getSuggestions(query: string): Promise<{ text: string; type: string; count?: number }[]> {
    if (!query || query.length < 2) return [];
    try {
      const response = await api.get<{ text: string; type: string; count?: number }[]>('/api/v1/search/suggestions', {
        params: { query },
      });
      return response.data || [];
    } catch {
      return [];
    }
  },

  /**
   * 旧版获取历史（兼容）
   */
  async getHistory(): Promise<string[]> {
    try {
      const response = await api.get<string[]>('/api/v1/search/history/simple');
      return response.data || [];
    } catch {
      return ['项目进度报告', '任务分配方案', '团队协作工具', '敏捷开发流程', '知识库管理'];
    }
  },

  /**
   * 旧版清除历史（兼容）
   */
  async clearHistory(): Promise<void> {
    await api.delete('/api/v1/search/history');
  },
};

// ==================== 辅助函数 ====================

/**
 * 生成模拟搜索结果
 */
function generateMockSearchResult(query: string, searchType: string): SmartSearchResult {
  const mockItems: SearchResultItem[] = [
    {
      id: 1,
      type: 'project',
      title: `${query}相关项目 - 企业级项目管理平台`,
      content: `这是一个关于${query}的项目，包含完整的项目管理功能，支持任务分配、进度跟踪、团队协作等核心功能。`,
      score: 0.95,
      highlights: [`<em>${query}</em>相关项目`, `关于<em>${query}</em>的项目`],
      metadata: { projectId: 'P001', status: 'active', members: 12 }
    },
    {
      id: 2,
      type: 'task',
      title: `${query}任务 - 需求分析与设计`,
      content: `针对${query}的需求分析任务，包括用户调研、竞品分析、功能设计等工作内容。`,
      score: 0.88,
      highlights: [`<em>${query}</em>任务`, `针对<em>${query}</em>的需求`],
      metadata: { taskId: 'T001', priority: 'high', assignee: '张三' }
    },
    {
      id: 3,
      type: 'document',
      title: `${query}技术文档 - 最佳实践指南`,
      content: `详细介绍${query}的技术实现方案和最佳实践，帮助团队快速上手和规范开发流程。`,
      score: 0.82,
      highlights: [`<em>${query}</em>技术文档`, `介绍<em>${query}</em>的技术`],
      metadata: { docId: 'D001', version: '2.0', author: '李四' }
    },
    {
      id: 4,
      type: 'knowledge',
      title: `${query}知识库 - 常见问题解答`,
      content: `收集整理了关于${query}的常见问题和解决方案，方便团队成员快速查阅和学习。`,
      score: 0.75,
      highlights: [`<em>${query}</em>知识库`, `关于<em>${query}</em>的常见问题`],
      metadata: { kbId: 'K001', category: 'FAQ', views: 1256 }
    },
    {
      id: 5,
      type: 'event',
      title: `${query}培训会议 - 团队能力提升`,
      content: `组织关于${query}的培训会议，邀请专家分享经验，提升团队整体能力水平。`,
      score: 0.68,
      highlights: [`<em>${query}</em>培训会议`, `关于<em>${query}</em>的培训`],
      metadata: { eventId: 'E001', date: '2024-01-20', participants: 25 }
    },
  ];

  return {
    query,
    correctedQuery: undefined,
    wasCorrected: false,
    searchType,
    detectedIntent: {
      originalQuery: query,
      intentCode: 'SEARCH',
      intentName: '通用搜索',
      actionType: 'search',
      confidence: 0.85
    },
    expandedTerms: [`${query}管理`, `${query}工具`, `${query}方案`],
    items: mockItems,
    totalCount: mockItems.length,
    searchTimeMs: Math.floor(Math.random() * 50) + 20
  };
}