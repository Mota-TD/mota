/**
 * 智能新闻推送服务
 * 对应 mota-web 的 smartNewsPush.ts 和 aiNews.ts
 */

import { api } from '@/lib/api-client';

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

// 统计数据
export interface NewsStatistics {
  totalArticles: number;
  todayArticles: number;
  policyCount: number;
  matchedCount: number;
  favoriteCount: number;
  pushCount: number;
  categoryDistribution: Record<string, number>;
}

// 新闻项（前端使用）
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content?: string;
  source: string;
  publishTime: string;
  category: string;
  tags: string[];
  url: string;
  isStarred: boolean;
  relevance: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
  isPolicy?: boolean;
  policyLevel?: string;
  author?: string;
}

// ==================== 辅助函数 ====================

/**
 * 格式化发布时间
 */
export const formatPublishTime = (time: string): string => {
  try {
    const date = new Date(time);
    
    if (isNaN(date.getTime())) {
      return '时间未知';
    }
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
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
  } catch {
    return '时间未知';
  }
};

/**
 * 转换API返回的新闻数据为组件使用的格式
 */
export const transformNewsArticle = (article: NewsArticle): NewsItem => {
  const relevanceScore = article.importanceScore
    ? Math.round(Number(article.importanceScore))
    : 80;
  
  return {
    id: String(article.id),
    title: article.title,
    summary: article.summary || article.content?.substring(0, 200) || '',
    content: article.content,
    source: article.sourceName || '未知来源',
    publishTime: formatPublishTime(article.publishTime),
    category: article.category || 'general',
    tags: article.tags || [],
    url: article.sourceUrl || '#',
    isStarred: false,
    relevance: Math.min(100, Math.max(0, relevanceScore)),
    sentiment: article.sentiment,
    isPolicy: article.isPolicy,
    policyLevel: article.policyLevel,
    author: article.author
  };
};

// ==================== 新闻服务 ====================

export const newsService = {
  // ==================== 行业识别 ====================
  
  /**
   * 自动识别企业行业
   */
  async detectIndustry(teamId: number, description: string): Promise<EnterpriseIndustry[]> {
    const response = await api.post<EnterpriseIndustry[]>(
      `/api/news/industry/detect?teamId=${teamId}`,
      { description }
    );
    return response.data || [];
  },

  /**
   * 获取团队行业配置
   */
  async getTeamIndustries(teamId: number): Promise<EnterpriseIndustry[]> {
    const response = await api.get<EnterpriseIndustry[]>(`/api/news/industry/team/${teamId}`);
    return response.data || [];
  },

  /**
   * 保存行业配置
   */
  async saveIndustry(industry: Partial<EnterpriseIndustry>): Promise<EnterpriseIndustry> {
    const response = await api.post<EnterpriseIndustry>('/api/news/industry', industry);
    return response.data;
  },

  /**
   * 删除行业配置
   */
  async deleteIndustry(id: number): Promise<void> {
    await api.delete(`/api/news/industry/${id}`);
  },

  // ==================== 业务领域 ====================

  /**
   * 获取团队业务领域
   */
  async getTeamBusinessDomains(teamId: number): Promise<BusinessDomain[]> {
    const response = await api.get<BusinessDomain[]>(`/api/news/business/team/${teamId}`);
    return response.data || [];
  },

  /**
   * 保存业务领域
   */
  async saveBusinessDomain(domain: Partial<BusinessDomain>): Promise<BusinessDomain> {
    const response = await api.post<BusinessDomain>('/api/news/business', domain);
    return response.data;
  },

  // ==================== 新闻搜索 ====================

  /**
   * 搜索新闻
   */
  async searchNews(params: {
    keyword: string;
    category?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ list: NewsArticle[]; total: number }> {
    const response = await api.get<{ list: NewsArticle[]; total: number }>('/api/news/search', { params });
    return response.data || { list: [], total: 0 };
  },

  /**
   * 获取新闻详情
   */
  async getArticle(id: number): Promise<NewsArticle> {
    const response = await api.get<NewsArticle>(`/api/news/article/${id}`);
    return response.data;
  },

  // ==================== 政策监控 ====================

  /**
   * 获取政策监控列表
   */
  async getPolicyMonitors(teamId: number): Promise<PolicyMonitor[]> {
    const response = await api.get<PolicyMonitor[]>(`/api/news/policy/monitors/${teamId}`);
    return response.data || [];
  },

  /**
   * 更新政策监控
   */
  async updatePolicyMonitor(id: number, monitor: Partial<PolicyMonitor>): Promise<PolicyMonitor> {
    const response = await api.put<PolicyMonitor>(`/api/news/policy/monitor/${id}`, monitor);
    return response.data;
  },

  /**
   * 创建政策监控
   */
  async createPolicyMonitor(monitor: Partial<PolicyMonitor>): Promise<PolicyMonitor> {
    const response = await api.post<PolicyMonitor>('/api/news/policy/monitor', monitor);
    return response.data;
  },

  /**
   * 删除政策监控
   */
  async deletePolicyMonitor(id: number): Promise<void> {
    await api.delete(`/api/news/policy/monitor/${id}`);
  },

  // ==================== 推送配置 ====================

  /**
   * 获取推送配置
   */
  async getPushConfig(userId: number): Promise<NewsPushConfig> {
    const response = await api.get<NewsPushConfig>(`/api/news/push/config/${userId}`);
    return response.data;
  },

  /**
   * 更新推送配置
   */
  async updatePushConfig(userId: number, config: Partial<NewsPushConfig>): Promise<NewsPushConfig> {
    const response = await api.put<NewsPushConfig>(`/api/news/push/config/${userId}`, config);
    return response.data;
  },

  // ==================== 收藏管理 ====================

  /**
   * 收藏新闻
   */
  async favoriteNews(userId: number, articleId: number, folderId?: number, note?: string): Promise<NewsFavorite> {
    const response = await api.post<NewsFavorite>('/api/news/favorite', {
      userId,
      articleId,
      folderId,
      note
    });
    return response.data;
  },

  /**
   * 取消收藏
   */
  async unfavoriteNews(userId: number, articleId: number): Promise<void> {
    await api.delete(`/api/news/favorite?userId=${userId}&articleId=${articleId}`);
  },

  /**
   * 获取收藏列表
   */
  async getFavorites(userId: number, folderId?: number): Promise<NewsFavorite[]> {
    try {
      const response = await api.get<NewsFavorite[]>(`/api/news/favorites/${userId}`, { params: { folderId } });
      return response.data;
    } catch {
      return [];
    }
  },

  // ==================== 统计数据 ====================

  /**
   * 获取新闻统计
   */
  async getStatistics(teamId?: number): Promise<NewsStatistics> {
    const response = await api.get<NewsStatistics>('/api/news/statistics', { params: { teamId } });
    return response.data;
  },

  /**
   * 获取热门话题
   */
  async getHotTopics(limit = 10): Promise<HotTopic[]> {
    const response = await api.get<HotTopic[]>('/api/news/hot-topics', { params: { limit } });
    return response.data || [];
  },

  /**
   * 获取推荐新闻
   */
  async getRecommendedNews(userId: number, teamId?: number, limit = 10): Promise<NewsArticle[]> {
    const response = await api.get<NewsArticle[]>('/api/news/recommended', { params: { userId, teamId, limit } });
    return response.data || [];
  }
};

// ==================== 常量配置 ====================

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

export default newsService;