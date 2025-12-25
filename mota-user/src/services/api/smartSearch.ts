import { get, post, del } from '../request';

// ==================== 类型定义 ====================

// 搜索结果项
export interface SearchResultItem {
  id: number;
  type: string;
  title: string;
  content: string;
  score: number;
  highlights: string[];
  metadata?: Record<string, any>;
}

// 搜索意图
export interface SearchIntent {
  originalQuery: string;
  intentCode: string;
  intentName: string;
  actionType: string;
  confidence: number;
  parameters?: Record<string, any>;
}

// 搜索结果
export interface SearchResult {
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

// ==================== SS-001 全文检索 ====================

/**
 * 全文关键词检索
 */
export const keywordSearch = (
  query: string,
  type?: string,
  page: number = 1,
  pageSize: number = 20
): Promise<SearchResult> => {
  const params: Record<string, string | number | boolean | undefined> = { 
    query, 
    type, 
    page, 
    pageSize 
  };
  return get<SearchResult>('/api/search/keyword', params);
};

// ==================== SS-002 语义搜索 ====================

/**
 * 语义相似度搜索
 */
export const semanticSearch = (
  query: string,
  type?: string,
  page: number = 1,
  pageSize: number = 20
): Promise<SearchResult> => {
  const params: Record<string, string | number | boolean | undefined> = { 
    query, 
    type, 
    page, 
    pageSize 
  };
  return get<SearchResult>('/api/search/semantic', params);
};

// ==================== SS-003 向量检索 ====================

/**
 * 向量数据库检索
 */
export const vectorSearch = (
  vector: number[],
  topK: number = 10
): Promise<DocumentVector[]> => {
  return post<DocumentVector[]>('/api/search/vector', { vector, topK });
};

// ==================== SS-004 混合检索 ====================

/**
 * 向量+关键词混合检索
 */
export const hybridSearch = (
  query: string,
  type?: string,
  page: number = 1,
  pageSize: number = 20
): Promise<SearchResult> => {
  const params: Record<string, string | number | boolean | undefined> = { 
    query, 
    type, 
    page, 
    pageSize 
  };
  return get<SearchResult>('/api/search/hybrid', params);
};

// ==================== SS-005 意图识别 ====================

/**
 * 搜索意图识别
 */
export const detectIntent = (query: string): Promise<SearchIntent> => {
  return get<SearchIntent>('/api/search/intent', { query });
};

// ==================== SS-006 自动纠错 ====================

/**
 * 搜索词自动纠错
 */
export const autoCorrect = (query: string): Promise<CorrectionResult> => {
  return get<CorrectionResult>('/api/search/correct', { query });
};

// ==================== SS-007 智能补全 ====================

/**
 * 搜索词智能补全
 */
export const getCompletions = (
  prefix: string,
  limit: number = 10
): Promise<SearchSuggestion[]> => {
  return get<SearchSuggestion[]>('/api/search/complete', { prefix, limit });
};

// ==================== SS-008 相关推荐 ====================

/**
 * 相关搜索推荐
 */
export const getRelatedQueries = (
  query: string,
  limit: number = 10
): Promise<SearchRelatedQuery[]> => {
  return get<SearchRelatedQuery[]>('/api/search/related', { query, limit });
};

/**
 * 获取热门搜索
 */
export const getHotSearches = (
  period: string = 'daily',
  limit: number = 10
): Promise<SearchHotWord[]> => {
  return get<SearchHotWord[]>('/api/search/hot', { period, limit });
};

// ==================== 用户偏好与历史 ====================

/**
 * 获取搜索历史
 */
export const getSearchHistory = (limit: number = 20): Promise<SearchLog[]> => {
  return get<SearchLog[]>('/api/search/history', { limit });
};

/**
 * 清除搜索历史
 */
export const clearSearchHistory = (): Promise<{ success: boolean; message: string }> => {
  return del<{ success: boolean; message: string }>('/api/search/history');
};

/**
 * 获取用户搜索偏好
 */
export const getUserPreference = (): Promise<UserSearchPreference> => {
  return get<UserSearchPreference>('/api/search/preference');
};

/**
 * 保存用户搜索偏好
 */
export const saveUserPreference = (
  preference: Partial<UserSearchPreference>
): Promise<{ success: boolean; message: string }> => {
  return post<{ success: boolean; message: string }>('/api/search/preference', preference);
};

// ==================== 统一搜索入口 ====================

/**
 * 统一搜索接口
 */
export const search = (
  query: string,
  mode: 'keyword' | 'semantic' | 'hybrid' = 'hybrid',
  type?: string,
  page: number = 1,
  pageSize: number = 20
): Promise<SearchResult> => {
  const params: Record<string, string | number | boolean | undefined> = { 
    query, 
    mode, 
    type, 
    page, 
    pageSize 
  };
  return get<SearchResult>('/api/search', params);
};

// ==================== 导出所有API ====================

export default {
  // SS-001 全文检索
  keywordSearch,
  
  // SS-002 语义搜索
  semanticSearch,
  
  // SS-003 向量检索
  vectorSearch,
  
  // SS-004 混合检索
  hybridSearch,
  
  // SS-005 意图识别
  detectIntent,
  
  // SS-006 自动纠错
  autoCorrect,
  
  // SS-007 智能补全
  getCompletions,
  
  // SS-008 相关推荐
  getRelatedQueries,
  getHotSearches,
  
  // 用户偏好与历史
  getSearchHistory,
  clearSearchHistory,
  getUserPreference,
  saveUserPreference,
  
  // 统一搜索
  search
};