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
    const response = await api.get<SmartSearchResult>('/api/v1/search/keyword', {
      params: { query, type, page, pageSize }
    });
    return response.data;
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
    const response = await api.get<SmartSearchResult>('/api/v1/search/semantic', {
      params: { query, type, page, pageSize }
    });
    return response.data;
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
    const response = await api.get<SmartSearchResult>('/api/v1/search/hybrid', {
      params: { query, type, page, pageSize }
    });
    return response.data;
  },

  // ==================== SS-005 意图识别 ====================
  
  /**
   * 搜索意图识别
   */
  async detectIntent(query: string): Promise<SearchIntent> {
    const response = await api.get<SearchIntent>('/api/v1/search/intent', {
      params: { query }
    });
    return response.data;
  },

  // ==================== SS-006 自动纠错 ====================
  
  /**
   * 搜索词自动纠错
   */
  async autoCorrect(query: string): Promise<CorrectionResult> {
    const response = await api.get<CorrectionResult>('/api/v1/search/correct', {
      params: { query }
    });
    return response.data;
  },

  // ==================== SS-007 智能补全 ====================
  
  /**
   * 搜索词智能补全
   */
  async getCompletions(
    prefix: string,
    limit: number = 10
  ): Promise<SearchSuggestion[]> {
    if (!prefix || prefix.length < 1) return [];
    const response = await api.get<SearchSuggestion[]>('/api/v1/search/complete', {
      params: { prefix, limit }
    });
    return response.data || [];
  },

  // ==================== SS-008 相关推荐 ====================
  
  /**
   * 相关搜索推荐
   */
  async getRelatedQueries(
    query: string,
    limit: number = 10
  ): Promise<SearchRelatedQuery[]> {
    const response = await api.get<SearchRelatedQuery[]>('/api/v1/search/related', {
      params: { query, limit }
    });
    return response.data || [];
  },

  /**
   * 获取热门搜索
   */
  async getHotSearches(
    period: string = 'daily',
    limit: number = 10
  ): Promise<SearchHotWord[]> {
    const response = await api.get<SearchHotWord[]>('/api/v1/search/hot', {
      params: { period, limit }
    });
    return response.data || [];
  },

  // ==================== 用户偏好与历史 ====================
  
  /**
   * 获取搜索历史
   */
  async getSearchHistory(limit: number = 20): Promise<SearchLog[]> {
    const response = await api.get<SearchLog[]>('/api/v1/search/history', {
      params: { limit }
    });
    return response.data || [];
  },

  /**
   * 清除搜索历史
   */
  async clearSearchHistory(): Promise<{ success: boolean; message: string }> {
    const response = await api.delete<{ success: boolean; message: string }>('/api/v1/search/history');
    return response.data;
  },

  /**
   * 获取用户搜索偏好
   */
  async getUserPreference(): Promise<UserSearchPreference> {
    const response = await api.get<UserSearchPreference>('/api/v1/search/preference');
    return response.data;
  },

  /**
   * 保存用户搜索偏好
   */
  async saveUserPreference(
    preference: Partial<UserSearchPreference>
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>('/api/v1/search/preference', preference);
    return response.data;
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
    const response = await api.get<SmartSearchResult>('/api/v1/search', {
      params: { query, mode, type, page, pageSize }
    });
    return response.data;
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
    const response = await api.get<string[]>('/api/v1/search/history/simple');
    return response.data || [];
  },

  /**
   * 旧版清除历史（兼容）
   */
  async clearHistory(): Promise<void> {
    await api.delete('/api/v1/search/history');
  },
};
