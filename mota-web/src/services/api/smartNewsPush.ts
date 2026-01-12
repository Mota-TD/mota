import request from '../request';

// ==================== 类型定义 ====================

// 企业行业配置
export interface EnterpriseIndustry {
  id: number;
  teamId: number;
  industryCode: string;
  industryName: string;
  parentIndustryCode?: string;
  confidence: number;
  isPrimary: boolean;
  isAutoDetected: boolean;
  detectionSource: string;
  keywords?: string[];
  description?: string;
  createdAt: string;
}

// 业务领域
export interface BusinessDomain {
  id: number;
  teamId: number;
  domainName: string;
  domainType: 'product' | 'service' | 'market' | 'technology';
  keywords?: string[];
  description?: string;
  importance: number;
  isCore: boolean;
  relatedIndustries?: string[];
  competitors?: string[];
  targetCustomers?: string[];
  createdAt: string;
}

// 新闻数据源
export interface NewsDataSource {
  id: number;
  sourceName: string;
  sourceType: 'rss' | 'api' | 'crawler' | 'manual';
  sourceUrl?: string;
  category: string;
  language: string;
  updateFrequency: number;
  isEnabled: boolean;
  priority: number;
  reliabilityScore: number;
  totalArticles: number;
  lastCrawlAt?: string;
}

// 新闻文章
export interface NewsArticle {
  id: number;
  sourceId?: number;
  title: string;
  content?: string;
  summary?: string;
  author?: string;
  sourceName: string;
  sourceUrl?: string;
  imageUrl?: string;
  category: string;
  tags?: string[];
  keywords?: string[];
  publishTime: string;
  wordCount?: number;
  readTime?: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
  sentimentScore?: number;
  importanceScore?: number;
  qualityScore?: number;
  isPolicy?: boolean;
  policyLevel?: string;
  policyType?: string;
  viewCount?: number;
  shareCount?: number;
  favoriteCount?: number;
  status: string;
}

// 政策监控
export interface PolicyMonitor {
  id: number;
  teamId: number;
  monitorName: string;
  policyTypes?: string[];
  policyLevels?: string[];
  keywords?: string[];
  industries?: string[];
  regions?: string[];
  departments?: string[];
  isEnabled: boolean;
  alertEnabled: boolean;
  alertChannels?: string[];
  lastCheckAt?: string;
  matchedCount: number;
  createdAt: string;
}

// 新闻匹配记录
export interface NewsMatchRecord {
  id: number;
  articleId: number;
  teamId?: number;
  userId?: number;
  matchType: 'industry' | 'keyword' | 'semantic' | 'policy';
  matchScore: number;
  matchedKeywords?: string[];
  matchedIndustries?: string[];
  matchedDomains?: string[];
  semanticSimilarity?: number;
  relevanceReason?: string;
  isRecommended: boolean;
  recommendationRank?: number;
  createdAt: string;
}

// 用户新闻偏好
export interface NewsUserPreference {
  id: number;
  userId: number;
  teamId?: number;
  role?: string;
  preferredCategories?: string[];
  preferredSources?: string[];
  preferredKeywords?: string[];
  blockedKeywords?: string[];
  blockedSources?: string[];
  interestIndustries?: string[];
  interestTopics?: string[];
  readingLevel: 'brief' | 'normal' | 'detailed';
  contentLanguage: string;
  minQualityScore: number;
}

// 推送配置
export interface NewsPushConfig {
  id: number;
  userId: number;
  teamId?: number;
  pushEnabled: boolean;
  pushChannels?: string[];
  pushFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  pushTime?: string;
  pushDays?: number[];
  timezone: string;
  maxArticlesPerPush: number;
  minMatchScore: number;
  includeSummary: boolean;
  includeImage: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  lastPushAt?: string;
  nextPushAt?: string;
}

// 推送记录
export interface NewsPushRecord {
  id: number;
  userId: number;
  teamId?: number;
  pushChannel: string;
  pushType: 'scheduled' | 'manual' | 'realtime';
  articleIds?: number[];
  articleCount: number;
  pushTitle?: string;
  pushContent?: string;
  pushStatus: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  openedAt?: string;
  clickCount: number;
  errorMessage?: string;
  createdAt: string;
}

// 新闻收藏
export interface NewsFavorite {
  id: number;
  userId: number;
  articleId: number;
  folderId?: number;
  note?: string;
  tags?: string[];
  createdAt: string;
  article?: NewsArticle;
}

// 收藏夹
export interface NewsFavoriteFolder {
  id: number;
  userId: number;
  folderName: string;
  description?: string;
  isDefault: boolean;
  articleCount: number;
  createdAt: string;
}

// 新闻分类
export interface NewsCategory {
  id: number;
  categoryCode: string;
  categoryName: string;
  parentId?: number;
  level: number;
  path?: string;
  icon?: string;
  color?: string;
  description?: string;
  keywords?: string[];
  sortOrder: number;
  isSystem: boolean;
  isEnabled: boolean;
  articleCount: number;
  children?: NewsCategory[];
}

// 热门话题
export interface HotTopic {
  name: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  change: string;
}

// ==================== NW-001 行业识别 ====================

/**
 * 自动识别企业行业
 */
export const detectIndustry = (teamId: number, description: string) => {
  return request.post<EnterpriseIndustry[]>(`/api/news/industry/detect?teamId=${teamId}`, { description });
};

/**
 * 获取团队行业配置
 */
export const getTeamIndustries = (teamId: number) => {
  return request.get<EnterpriseIndustry[]>(`/api/news/industry/team/${teamId}`);
};

/**
 * 保存行业配置
 */
export const saveIndustry = (industry: Partial<EnterpriseIndustry>) => {
  return request.post<EnterpriseIndustry>('/api/news/industry', industry);
};

/**
 * 删除行业配置
 */
export const deleteIndustry = (id: number) => {
  return request.del<void>(`/api/news/industry/${id}`);
};

// ==================== NW-002 业务理解 ====================

/**
 * 提取企业业务领域
 */
export const extractBusinessDomains = (teamId: number, description: string) => {
  return request.post<BusinessDomain[]>(`/api/news/business/extract?teamId=${teamId}`, { description });
};

/**
 * 获取团队业务领域
 */
export const getTeamBusinessDomains = (teamId: number) => {
  return request.get<BusinessDomain[]>(`/api/news/business/team/${teamId}`);
};

/**
 * 保存业务领域
 */
export const saveBusinessDomain = (domain: Partial<BusinessDomain>) => {
  return request.post<BusinessDomain>('/api/news/business', domain);
};

// ==================== NW-003 新闻采集 ====================

/**
 * 获取新闻数据源列表
 */
export const getDataSources = () => {
  return request.get<NewsDataSource[]>('/api/news/sources');
};

/**
 * 采集新闻
 */
export const crawlNews = (sourceId: number) => {
  return request.post<NewsArticle[]>(`/api/news/crawl/${sourceId}`);
};

/**
 * 搜索新闻
 */
export const searchNews = (params: {
  keyword: string;
  category?: string;
  page?: number;
  pageSize?: number;
}) => {
  const queryParams: Record<string, string | number | boolean | undefined> = {
    keyword: params.keyword,
    category: params.category,
    page: params.page,
    pageSize: params.pageSize
  };
  return request.get<{ list: NewsArticle[]; total: number }>('/api/news/search', queryParams);
};

/**
 * 获取新闻详情
 */
export const getArticle = (id: number) => {
  return request.get<NewsArticle>(`/api/news/article/${id}`);
};

/**
 * 获取新闻完整内容(实时抓取)
 * 如果数据库中没有完整内容,会尝试从原文链接抓取
 */
export const getArticleFullContent = (id: number) => {
  return request.get<{ content: string; source: 'database' | 'crawled' }>(`/api/news/article/${id}/full-content`);
};

// ==================== NW-004 政策监控 ====================

/**
 * 创建政策监控
 */
export const createPolicyMonitor = (monitor: Partial<PolicyMonitor>) => {
  return request.post<PolicyMonitor>('/api/news/policy/monitor', monitor);
};

/**
 * 获取政策监控列表
 */
export const getPolicyMonitors = (teamId: number) => {
  return request.get<PolicyMonitor[]>(`/api/news/policy/monitors/${teamId}`);
};

/**
 * 更新政策监控
 */
export const updatePolicyMonitor = (id: number, monitor: Partial<PolicyMonitor>) => {
  return request.put<PolicyMonitor>(`/api/news/policy/monitor/${id}`, monitor);
};

/**
 * 删除政策监控
 */
export const deletePolicyMonitor = (id: number) => {
  return request.del<void>(`/api/news/policy/monitor/${id}`);
};

/**
 * 获取政策新闻
 */
export const getPolicyNews = (teamId: number, limit = 10) => {
  return request.get<NewsArticle[]>(`/api/news/policy/news/${teamId}`, { limit });
};

// ==================== NW-005 智能匹配 ====================

/**
 * 计算新闻匹配度
 */
export const calculateMatch = (articleId: number, teamId?: number, userId?: number) => {
  return request.get<NewsMatchRecord>(`/api/news/match/${articleId}`, { teamId, userId });
};

/**
 * 获取推荐新闻
 */
export const getRecommendedNews = (userId: number, teamId?: number, limit = 10) => {
  return request.get<NewsArticle[]>('/api/news/recommended', { userId, teamId, limit });
};

/**
 * 批量计算匹配度
 */
export const batchCalculateMatch = (articleIds: number[], teamId?: number, userId?: number) => {
  return request.post<NewsMatchRecord[]>('/api/news/match/batch', {
    articleIds,
    teamId,
    userId
  });
};

// ==================== NW-006 个性化推送 ====================

/**
 * 获取用户偏好
 */
export const getUserPreference = (userId: number) => {
  return request.get<NewsUserPreference>(`/api/news/preference/${userId}`);
};

/**
 * 更新用户偏好
 */
export const updateUserPreference = (userId: number, preference: Partial<NewsUserPreference>) => {
  return request.put<NewsUserPreference>(`/api/news/preference/${userId}`, preference);
};

/**
 * 基于角色获取推荐
 */
export const getNewsByRole = (role: string, limit = 10) => {
  return request.get<NewsArticle[]>('/api/news/by-role', { role, limit });
};

// ==================== NW-007 推送优化 ====================

/**
 * 获取推送配置
 */
export const getPushConfig = (userId: number) => {
  return request.get<NewsPushConfig>(`/api/news/push/config/${userId}`);
};

/**
 * 更新推送配置
 */
export const updatePushConfig = (userId: number, config: Partial<NewsPushConfig>) => {
  return request.put<NewsPushConfig>(`/api/news/push/config/${userId}`, config);
};

/**
 * 执行推送
 */
export const executePush = (userId: number, articleIds: number[], channel: string) => {
  return request.post<NewsPushRecord>('/api/news/push/execute', {
    userId,
    articleIds,
    channel
  });
};

/**
 * 获取推送历史
 */
export const getPushHistory = (userId: number, page = 1, pageSize = 20) => {
  return request.get<{ list: NewsPushRecord[]; total: number }>(`/api/news/push/history/${userId}`, { page, pageSize });
};

// ==================== NW-008 新闻收藏 ====================

/**
 * 收藏新闻
 */
export const favoriteNews = (userId: number, articleId: number, folderId?: number, note?: string) => {
  return request.post<NewsFavorite>('/api/news/favorite', {
    userId,
    articleId,
    folderId,
    note
  });
};

/**
 * 取消收藏
 */
export const unfavoriteNews = (userId: number, articleId: number) => {
  return request.del<void>(`/api/news/favorite?userId=${userId}&articleId=${articleId}`);
};

/**
 * 获取收藏列表
 */
export const getFavorites = (userId: number, folderId?: number) => {
  return request.get<NewsFavorite[]>(`/api/news/favorites/${userId}`, { folderId });
};

/**
 * 获取收藏夹列表
 */
export const getFolders = (userId: number) => {
  return request.get<NewsFavoriteFolder[]>(`/api/news/folders/${userId}`);
};

/**
 * 创建收藏夹
 */
export const createFolder = (userId: number, folderName: string, description?: string) => {
  return request.post<NewsFavoriteFolder>('/api/news/folder', {
    userId,
    folderName,
    description
  });
};

/**
 * 删除收藏夹
 */
export const deleteFolder = (id: number) => {
  return request.del<void>(`/api/news/folder/${id}`);
};

// ==================== NW-009 新闻分类 ====================

/**
 * 获取分类列表
 */
export const getCategories = () => {
  return request.get<NewsCategory[]>('/api/news/categories');
};

/**
 * 获取分类树
 */
export const getCategoryTree = () => {
  return request.get<NewsCategory[]>('/api/news/categories/tree');
};

/**
 * 自动分类新闻
 */
export const classifyNews = (title: string, content: string) => {
  return request.post<{ category: string; confidence: number }>('/api/news/classify', {
    title,
    content
  });
};

/**
 * 创建分类
 */
export const createCategory = (category: Partial<NewsCategory>) => {
  return request.post<NewsCategory>('/api/news/category', category);
};

/**
 * 更新分类
 */
export const updateCategory = (id: number, category: Partial<NewsCategory>) => {
  return request.put<NewsCategory>(`/api/news/category/${id}`, category);
};

/**
 * 删除分类
 */
export const deleteCategory = (id: number) => {
  return request.del<void>(`/api/news/category/${id}`);
};

// ==================== 统计接口 ====================

/**
 * 获取新闻统计
 */
export const getStatistics = (teamId?: number) => {
  return request.get<{
    totalArticles: number;
    todayArticles: number;
    policyCount: number;
    matchedCount: number;
    favoriteCount: number;
    pushCount: number;
    categoryDistribution: Record<string, number>;
  }>('/api/news/statistics', { teamId });
};

/**
 * 获取热门话题
 */
export const getHotTopics = (limit = 10) => {
  return request.get<HotTopic[]>('/api/news/hot-topics', { limit });
};

/**
 * 获取行业动态新闻
 */
export const getIndustryNews = (teamId?: number, limit = 20) => {
  return request.get<NewsArticle[]>('/api/news/industry', { teamId, limit });
};

/**
 * 获取科技资讯
 */
export const getTechnologyNews = (limit = 20) => {
  return request.get<NewsArticle[]>('/api/news/technology', { limit });
};

/**
 * 手动触发新闻采集
 */
export const triggerCrawl = () => {
  return request.post<{ message: string; timestamp: number }>('/api/news/crawl/trigger');
};

// ==================== 辅助函数 ====================

/**
 * 分类选项
 */
export const categoryOptions = [
  { value: 'technology', label: '科技', color: '#1890ff' },
  { value: 'industry', label: '行业动态', color: '#52c41a' },
  { value: 'policy', label: '政策法规', color: '#faad14' },
  { value: 'finance', label: '财经', color: '#f5222d' },
  { value: 'market', label: '市场分析', color: '#722ed1' },
  { value: 'management', label: '企业管理', color: '#13c2c2' }
];

/**
 * 推送频率选项
 */
export const pushFrequencyOptions = [
  { value: 'realtime', label: '实时推送' },
  { value: 'hourly', label: '每小时' },
  { value: 'daily', label: '每日' },
  { value: 'weekly', label: '每周' }
];

/**
 * 推送渠道选项
 */
export const pushChannelOptions = [
  { value: 'email', label: '邮件' },
  { value: 'app', label: 'App推送' },
  { value: 'wechat', label: '微信' },
  { value: 'dingtalk', label: '钉钉' }
];

/**
 * 行业选项
 */
export const industryOptions = [
  { value: 'IT', label: '信息技术' },
  { value: 'FINANCE', label: '金融服务' },
  { value: 'MANUFACTURING', label: '制造业' },
  { value: 'RETAIL', label: '零售业' },
  { value: 'HEALTHCARE', label: '医疗健康' },
  { value: 'EDUCATION', label: '教育培训' }
];

/**
 * 格式化发布时间
 */
export const formatPublishTime = (time: string): string => {
  try {
    const date = new Date(time);
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return '时间未知';
    }
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // 如果时间是未来的,返回时间未知
    if (diff < 0) {
      return '时间未知';
    }
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (seconds < 60) {
      return `${seconds}秒前`;
    } else if (minutes < 60) {
      return `${minutes}分钟前`;
    } else if (hours < 24) {
      return `${hours}小时前`;
    } else if (days < 30) {
      return `${days}天前`;
    } else if (months < 12) {
      return `${months}月前`;
    } else {
      return `${years}年前`;
    }
  } catch (error) {
    console.error('时间格式化失败:', error);
    return '时间未知';
  }
};

/**
 * 获取情感颜色
 */
export const getSentimentColor = (sentiment?: string): string => {
  switch (sentiment) {
    case 'positive':
      return '#52c41a';
    case 'negative':
      return '#f5222d';
    default:
      return '#faad14';
  }
};

/**
 * 获取趋势图标
 */
export const getTrendIcon = (trend: string): string => {
  switch (trend) {
    case 'up':
      return '↑';
    case 'down':
      return '↓';
    default:
      return '→';
  }
};

/**
 * 获取趋势颜色
 */
export const getTrendColor = (trend: string): string => {
  switch (trend) {
    case 'up':
      return '#52c41a';
    case 'down':
      return '#f5222d';
    default:
      return '#faad14';
  }
};