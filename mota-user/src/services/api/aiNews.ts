import request from '../request';

// 新闻类型定义
export interface AINews {
  id: number;
  title: string;
  content: string;
  summary?: string;
  source: string;
  sourceUrl?: string;
  author?: string;
  category: string;
  industry?: string;
  tags?: string[];
  imageUrl?: string;
  publishTime: string;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  createdAt: string;
}

// 用户画像
export interface UserProfile {
  interests: string[];
  readingStats: Record<string, unknown>;
  preferredCategories: string[];
  activeTime: string;
  readingFrequency: string;
}

// 新闻相关性分析
export interface NewsRelevance {
  newsId: number;
  userId: number;
  relevanceScore: number;
  matchedInterests: string[];
  reason: string;
}

// 情感分析结果
export interface SentimentAnalysis {
  newsId: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  confidence: number;
  aspects: Record<string, string>;
}

// 推送设置
export interface PushSettings {
  enabled: boolean;
  frequency: 'realtime' | 'daily' | 'weekly';
  time?: string;
  categories: string[];
  emailEnabled: boolean;
  pushEnabled: boolean;
}

// 新闻源
export interface NewsSource {
  id: number;
  name: string;
  category: string;
  description: string;
  subscriberCount: number;
}

// 热门话题
export interface HotTopic {
  name: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  change: string;
}

// 阅读统计
export interface ReadingStats {
  userId: number;
  period: string;
  totalRead: number;
  totalTime: string;
  favoriteCount: number;
  shareCount: number;
  categoryDistribution: Record<string, number>;
  dailyAverage: number;
}

// ========== 新闻获取 ==========

export const getRecommendedNews = (userId: number, limit = 10) => {
  return request.get<AINews[]>(`/api/ai/news/recommended?userId=${userId}&limit=${limit}`);
};

export const getIndustryNews = (industry: string, limit = 10) => {
  return request.get<AINews[]>(`/api/ai/news/industry/${encodeURIComponent(industry)}?limit=${limit}`);
};

export const getTrendingNews = (limit = 10) => {
  return request.get<AINews[]>(`/api/ai/news/trending?limit=${limit}`);
};

export const searchNews = (keyword: string, page = 1, pageSize = 20) => {
  return request.get<AINews[]>(`/api/ai/news/search?keyword=${encodeURIComponent(keyword)}&page=${page}&pageSize=${pageSize}`);
};

export const getNewsById = (newsId: number) => {
  return request.get<AINews>(`/api/ai/news/${newsId}`);
};

// ========== 个性化推荐 ==========

export const buildUserProfile = (userId: number) => {
  return request.get<UserProfile>(`/api/ai/news/user/${userId}/profile`);
};

export const updateUserInterests = (userId: number, interests: string[]) => {
  return request.put<void>(`/api/ai/news/user/${userId}/interests`, interests);
};

export const getUserInterests = (userId: number) => {
  return request.get<string[]>(`/api/ai/news/user/${userId}/interests`);
};

export const getNewsForProject = (projectId: number, limit = 10) => {
  return request.get<AINews[]>(`/api/ai/news/project/${projectId}?limit=${limit}`);
};

// ========== 新闻分析 ==========

export const analyzeNewsRelevance = (newsId: number, userId: number) => {
  return request.get<NewsRelevance>(`/api/ai/news/${newsId}/relevance?userId=${userId}`);
};

export const extractNewsKeyInfo = (newsId: number) => {
  return request.get<Record<string, unknown>>(`/api/ai/news/${newsId}/key-info`);
};

export const generateNewsSummary = (newsId: number, maxLength = 200) => {
  return request.get<string>(`/api/ai/news/${newsId}/summary?maxLength=${maxLength}`);
};

export const analyzeNewsSentiment = (newsId: number) => {
  return request.get<SentimentAnalysis>(`/api/ai/news/${newsId}/sentiment`);
};

// ========== 用户交互 ==========

export const recordNewsRead = (newsId: number, userId: number) => {
  return request.post<void>(`/api/ai/news/${newsId}/read?userId=${userId}`);
};

export const favoriteNews = (newsId: number, userId: number) => {
  return request.post<void>(`/api/ai/news/${newsId}/favorite?userId=${userId}`);
};

export const unfavoriteNews = (newsId: number, userId: number) => {
  return request.del<void>(`/api/ai/news/${newsId}/favorite?userId=${userId}`);
};

export const getFavoriteNews = (userId: number, page = 1, pageSize = 20) => {
  return request.get<AINews[]>(`/api/ai/news/user/${userId}/favorites?page=${page}&pageSize=${pageSize}`);
};

export const markAsNotInterested = (newsId: number, userId: number, reason?: string) => {
  let url = `/api/ai/news/${newsId}/not-interested?userId=${userId}`;
  if (reason) {
    url += `&reason=${encodeURIComponent(reason)}`;
  }
  return request.post<void>(url);
};

export const shareNews = (newsId: number, userId: number, platform: string) => {
  return request.post<void>(`/api/ai/news/${newsId}/share?userId=${userId}&platform=${encodeURIComponent(platform)}`);
};

// ========== 推送管理 ==========

export const getPushSettings = (userId: number) => {
  return request.get<PushSettings>(`/api/ai/news/user/${userId}/push-settings`);
};

export const updatePushSettings = (userId: number, settings: Partial<PushSettings>) => {
  return request.put<void>(`/api/ai/news/user/${userId}/push-settings`, settings);
};

export const sendNewsPush = (userId: number, newsIds: number[]) => {
  return request.post<void>(`/api/ai/news/user/${userId}/push`, newsIds);
};

export const getPushHistory = (userId: number, page = 1, pageSize = 20) => {
  return request.get<Array<{ id: number; time: string; newsCount: number; opened: boolean }>>(
    `/api/ai/news/user/${userId}/push-history?page=${page}&pageSize=${pageSize}`
  );
};

// ========== 新闻源管理 ==========

export const getNewsSources = () => {
  return request.get<NewsSource[]>('/api/ai/news/sources');
};

export const subscribeSource = (sourceId: number, userId: number) => {
  return request.post<void>(`/api/ai/news/sources/${sourceId}/subscribe?userId=${userId}`);
};

export const unsubscribeSource = (sourceId: number, userId: number) => {
  return request.del<void>(`/api/ai/news/sources/${sourceId}/subscribe?userId=${userId}`);
};

export const getUserSubscribedSources = (userId: number) => {
  return request.get<NewsSource[]>(`/api/ai/news/user/${userId}/subscribed-sources`);
};

// ========== 统计分析 ==========

export const getReadingStats = (userId: number, period = 'month') => {
  return request.get<ReadingStats>(`/api/ai/news/user/${userId}/reading-stats?period=${period}`);
};

export const getHotTopics = (limit = 10) => {
  return request.get<HotTopic[]>(`/api/ai/news/hot-topics?limit=${limit}`);
};

export const getIndustryTrends = (industry: string) => {
  return request.get<Record<string, unknown>>(`/api/ai/news/industry/${encodeURIComponent(industry)}/trends`);
};

// ========== 辅助函数 ==========

/**
 * 新闻分类选项
 */
export const newsCategories = [
  { value: 'technology', label: '科技' },
  { value: 'industry', label: '行业动态' },
  { value: 'management', label: '管理' },
  { value: 'finance', label: '财经' },
  { value: 'policy', label: '政策' },
  { value: 'market', label: '市场' }
];

/**
 * 推送频率选项
 */
export const pushFrequencies = [
  { value: 'realtime', label: '实时推送' },
  { value: 'daily', label: '每日推送' },
  { value: 'weekly', label: '每周推送' }
];

/**
 * 格式化发布时间
 */
export const formatPublishTime = (time: string): string => {
  const date = new Date(time);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 60) {
    return `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    return date.toLocaleDateString();
  }
};

/**
 * 获取情感颜色
 */
export const getSentimentColor = (sentiment: string): string => {
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