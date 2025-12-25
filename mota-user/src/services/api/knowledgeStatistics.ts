import request from '../request';

// ========== 类型定义 ==========

// 文档访问记录
export interface DocumentAccessLog {
  id?: number;
  documentId: number;
  userId: number;
  projectId?: number;
  accessType: 'view' | 'download' | 'share' | 'copy' | 'reference';
  accessSource?: 'search' | 'direct' | 'recommendation' | 'link';
  durationSeconds?: number;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  ipAddress?: string;
  accessDate?: string;
  accessTime?: string;
}

// 文档统计
export interface DocumentStatsDaily {
  id: number;
  documentId: number;
  statsDate: string;
  viewCount: number;
  uniqueVisitors: number;
  downloadCount: number;
  shareCount: number;
  copyCount: number;
  referenceCount: number;
  totalDurationSeconds: number;
  avgDurationSeconds: number;
  searchVisits: number;
  directVisits: number;
  recommendationVisits: number;
  linkVisits: number;
}

// 文档排行
export interface DocumentRanking {
  id: number;
  documentId: number;
  documentTitle?: string;
  projectId?: number;
  rankingType: 'daily' | 'weekly' | 'monthly' | 'all_time';
  rankingDate: string;
  rankPosition: number;
  score: number;
  viewCount: number;
  uniqueVisitors: number;
  reuseCount: number;
  likeCount: number;
  commentCount: number;
  rankChange: number;
  viewChangeRate: number;
}

// 搜索记录
export interface SearchLog {
  id?: number;
  userId?: number;
  projectId?: number;
  keyword: string;
  searchType?: 'document' | 'knowledge' | 'all';
  resultCount?: number;
  clickedDocumentId?: number;
  clickPosition?: number;
  searchDate?: string;
  searchTime?: string;
}

// 搜索热词统计
export interface SearchKeywordStats {
  id: number;
  keyword: string;
  projectId?: number;
  statsDate: string;
  searchCount: number;
  uniqueUsers: number;
  clickCount: number;
  avgResultCount: number;
  clickRate: number;
}

// 知识复用记录
export interface KnowledgeReuseLog {
  id?: number;
  sourceDocumentId: number;
  targetDocumentId?: number;
  targetTaskId?: number;
  targetProjectId?: number;
  userId: number;
  reuseType: 'copy' | 'reference' | 'template' | 'quote';
  reuseContent?: string;
  contentLength?: number;
  reuseDate?: string;
  reuseTime?: string;
}

// 知识缺口
export interface KnowledgeGap {
  id: number;
  projectId?: number;
  gapType: 'search_no_result' | 'frequent_question' | 'missing_topic';
  keyword?: string;
  description?: string;
  occurrenceCount: number;
  affectedUsers: number;
  status: 'open' | 'in_progress' | 'resolved' | 'ignored';
  priority: 'low' | 'medium' | 'high' | 'critical';
  resolvedBy?: number;
  resolvedDocumentId?: number;
  resolvedAt?: string;
  resolutionNote?: string;
  firstOccurredAt: string;
  lastOccurredAt: string;
  createdAt: string;
  updatedAt: string;
}

// 分页结果
export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

// 统计概览
export interface KnowledgeStatsOverview {
  access: {
    trend: Array<{ date: string; viewCount: number; uniqueVisitors: number; avgDuration: number }>;
    sourceDistribution: Array<{ source: string; count: number; percentage: number }>;
    deviceDistribution: Array<{ deviceType: string; count: number; percentage: number }>;
  };
  search: {
    totalSearches: number;
    successRate: number;
    avgResultCount: number;
  };
  reuse: {
    totalReuses: number;
    reuseRate: number;
    topDocuments: Array<{ documentId: number; reuseCount: number }>;
  };
  gaps: {
    totalGaps: number;
    openGaps: number;
    resolvedGaps: number;
    criticalGaps: number;
  };
  hotDocuments: DocumentRanking[];
  hotKeywords: SearchKeywordStats[];
}

// ========== 访问统计 API (KS-001) ==========

/**
 * 记录文档访问
 */
export const recordDocumentAccess = (accessLog: DocumentAccessLog) => {
  return request.post<{ success: boolean; message: string }>('/api/knowledge/statistics/access', accessLog);
};

/**
 * 获取文档访问统计
 */
export const getDocumentAccessStats = (documentId: number, startDate?: string, endDate?: string) => {
  const params: Record<string, string | number> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  return request.get<Record<string, number>>(`/api/knowledge/statistics/access/document/${documentId}`, params);
};

/**
 * 获取项目访问统计概览
 */
export const getProjectAccessOverview = (projectId?: number, startDate?: string, endDate?: string) => {
  const params: Record<string, string | number | undefined> = { projectId, startDate, endDate };
  return request.get<Record<string, unknown>>('/api/knowledge/statistics/access/overview', params);
};

// ========== 热门排行 API (KS-002) ==========

/**
 * 获取热门文档排行
 */
export const getHotDocuments = (projectId?: number, rankingType = 'daily', limit = 10) => {
  const params: Record<string, string | number | undefined> = { projectId, rankingType, limit };
  return request.get<DocumentRanking[]>('/api/knowledge/statistics/ranking/hot', params);
};

/**
 * 获取上升最快的文档
 */
export const getFastestRisingDocuments = (projectId?: number, rankingType = 'daily', limit = 10) => {
  const params: Record<string, string | number | undefined> = { projectId, rankingType, limit };
  return request.get<DocumentRanking[]>('/api/knowledge/statistics/ranking/rising', params);
};

/**
 * 获取文档排名历史
 */
export const getDocumentRankingHistory = (documentId: number, rankingType = 'daily', startDate?: string, endDate?: string) => {
  const params: Record<string, string | number | undefined> = { rankingType, startDate, endDate };
  return request.get<DocumentRanking[]>(`/api/knowledge/statistics/ranking/history/${documentId}`, params);
};

// ========== 访问趋势 API (KS-003) ==========

/**
 * 获取访问趋势
 */
export const getAccessTrend = (projectId?: number, startDate?: string, endDate?: string, groupBy = 'day') => {
  const params: Record<string, string | number | undefined> = { projectId, startDate, endDate, groupBy };
  return request.get<Array<{ date: string; viewCount: number; uniqueVisitors: number; avgDuration: number }>>('/api/knowledge/statistics/trend/access', params);
};

/**
 * 获取文档统计趋势
 */
export const getDocumentStatsTrend = (documentId: number, startDate?: string, endDate?: string) => {
  const params: Record<string, string | undefined> = { startDate, endDate };
  return request.get<DocumentStatsDaily[]>(`/api/knowledge/statistics/trend/document/${documentId}`, params);
};

// ========== 复用率 API (KS-004) ==========

/**
 * 记录知识复用
 */
export const recordKnowledgeReuse = (reuseLog: KnowledgeReuseLog) => {
  return request.post<{ success: boolean; message: string }>('/api/knowledge/statistics/reuse', reuseLog);
};

/**
 * 获取复用统计
 */
export const getReuseStats = (projectId?: number, startDate?: string, endDate?: string) => {
  const params: Record<string, string | number | undefined> = { projectId, startDate, endDate };
  return request.get<Record<string, number>>('/api/knowledge/statistics/reuse/stats', params);
};

/**
 * 获取复用趋势
 */
export const getReuseTrend = (projectId?: number, startDate?: string, endDate?: string) => {
  const params: Record<string, string | number | undefined> = { projectId, startDate, endDate };
  return request.get<Array<{ date: string; reuseCount: number }>>('/api/knowledge/statistics/reuse/trend', params);
};

/**
 * 获取复用类型分布
 */
export const getReuseTypeDistribution = (projectId?: number, startDate?: string, endDate?: string) => {
  const params: Record<string, string | number | undefined> = { projectId, startDate, endDate };
  return request.get<Array<{ reuseType: string; count: number; percentage: number }>>('/api/knowledge/statistics/reuse/distribution', params);
};

/**
 * 获取高复用文档
 */
export const getHighReuseDocuments = (projectId?: number, startDate?: string, endDate?: string, limit = 10) => {
  const params: Record<string, string | number | undefined> = { projectId, startDate, endDate, limit };
  return request.get<Array<{ documentId: number; documentTitle: string; reuseCount: number }>>('/api/knowledge/statistics/reuse/top', params);
};

// ========== 搜索热词 API (KS-005) ==========

/**
 * 记录搜索
 */
export const recordSearch = (searchLog: SearchLog) => {
  return request.post<{ success: boolean; message: string }>('/api/knowledge/statistics/search', searchLog);
};

/**
 * 获取热门搜索词
 */
export const getHotKeywords = (projectId?: number, startDate?: string, endDate?: string, limit = 20) => {
  const params: Record<string, string | number | undefined> = { projectId, startDate, endDate, limit };
  return request.get<SearchKeywordStats[]>('/api/knowledge/statistics/search/hot', params);
};

/**
 * 获取关键词云数据
 */
export const getKeywordCloud = (projectId?: number, startDate?: string, endDate?: string, limit = 50) => {
  const params: Record<string, string | number | undefined> = { projectId, startDate, endDate, limit };
  return request.get<Array<{ keyword: string; value: number }>>('/api/knowledge/statistics/search/cloud', params);
};

/**
 * 获取搜索统计
 */
export const getSearchStats = (projectId?: number, startDate?: string, endDate?: string) => {
  const params: Record<string, string | number | undefined> = { projectId, startDate, endDate };
  return request.get<Record<string, number>>('/api/knowledge/statistics/search/stats', params);
};

/**
 * 获取搜索趋势
 */
export const getSearchTrend = (projectId?: number, startDate?: string, endDate?: string) => {
  const params: Record<string, string | number | undefined> = { projectId, startDate, endDate };
  return request.get<Array<{ date: string; searchCount: number; successRate: number }>>('/api/knowledge/statistics/search/trend', params);
};

// ========== 知识缺口 API (KS-006) ==========

/**
 * 获取知识缺口列表
 */
export const getKnowledgeGaps = (params: {
  projectId?: number;
  gapType?: string;
  status?: string;
  priority?: string;
  page?: number;
  pageSize?: number;
}) => {
  return request.get<PageResult<KnowledgeGap>>('/api/knowledge/statistics/gaps', params);
};

/**
 * 获取知识缺口统计
 */
export const getGapStats = (projectId?: number) => {
  const params: Record<string, number | undefined> = { projectId };
  return request.get<Record<string, number>>('/api/knowledge/statistics/gaps/stats', params);
};

/**
 * 获取缺口类型分布
 */
export const getGapTypeDistribution = (projectId?: number) => {
  const params: Record<string, number | undefined> = { projectId };
  return request.get<Array<{ gapType: string; count: number; occurrences: number }>>('/api/knowledge/statistics/gaps/distribution', params);
};

/**
 * 获取高优先级未解决缺口
 */
export const getHighPriorityOpenGaps = (projectId?: number, limit = 10) => {
  const params: Record<string, number | undefined> = { projectId, limit };
  return request.get<KnowledgeGap[]>('/api/knowledge/statistics/gaps/priority', params);
};

/**
 * 更新知识缺口状态
 */
export const updateGapStatus = (gapId: number, data: {
  status: string;
  resolvedBy?: number;
  resolvedDocumentId?: number;
  resolutionNote?: string;
}) => {
  return request.put<{ success: boolean; message: string }>(`/api/knowledge/statistics/gaps/${gapId}/status`, data);
};

/**
 * 创建知识缺口
 */
export const createKnowledgeGap = (gap: Partial<KnowledgeGap>) => {
  return request.post<KnowledgeGap>('/api/knowledge/statistics/gaps', gap);
};

/**
 * 获取低点击率关键词（潜在知识缺口）
 */
export const getLowClickRateKeywords = (params: {
  projectId?: number;
  startDate?: string;
  endDate?: string;
  minSearchCount?: number;
  maxClickRate?: number;
  limit?: number;
}) => {
  return request.get<SearchKeywordStats[]>('/api/knowledge/statistics/gaps/potential', params);
};

// ========== 综合统计 API ==========

/**
 * 获取知识统计概览
 */
export const getKnowledgeStatsOverview = (projectId?: number, startDate?: string, endDate?: string) => {
  const params: Record<string, string | number | undefined> = { projectId, startDate, endDate };
  return request.get<KnowledgeStatsOverview>('/api/knowledge/statistics/overview', params);
};

// ========== 工具函数 ==========

/**
 * 格式化缺口类型
 */
export const formatGapType = (gapType: string): string => {
  const typeMap: Record<string, string> = {
    search_no_result: '搜索无结果',
    frequent_question: '频繁问题',
    missing_topic: '缺失主题'
  };
  return typeMap[gapType] || gapType;
};

/**
 * 格式化缺口状态
 */
export const formatGapStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    open: '待处理',
    in_progress: '处理中',
    resolved: '已解决',
    ignored: '已忽略'
  };
  return statusMap[status] || status;
};

/**
 * 格式化优先级
 */
export const formatPriority = (priority: string): string => {
  const priorityMap: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '紧急'
  };
  return priorityMap[priority] || priority;
};

/**
 * 获取优先级颜色
 */
export const getPriorityColor = (priority: string): string => {
  const colorMap: Record<string, string> = {
    low: '#8c8c8c',
    medium: '#faad14',
    high: '#fa8c16',
    critical: '#ff4d4f'
  };
  return colorMap[priority] || '#8c8c8c';
};

/**
 * 获取状态颜色
 */
export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    open: '#ff4d4f',
    in_progress: '#1890ff',
    resolved: '#52c41a',
    ignored: '#8c8c8c'
  };
  return colorMap[status] || '#8c8c8c';
};

/**
 * 格式化复用类型
 */
export const formatReuseType = (reuseType: string): string => {
  const typeMap: Record<string, string> = {
    copy: '复制',
    reference: '引用',
    template: '模板',
    quote: '引述'
  };
  return typeMap[reuseType] || reuseType;
};

/**
 * 格式化排行类型
 */
export const formatRankingType = (rankingType: string): string => {
  const typeMap: Record<string, string> = {
    daily: '日榜',
    weekly: '周榜',
    monthly: '月榜',
    all_time: '总榜'
  };
  return typeMap[rankingType] || rankingType;
};