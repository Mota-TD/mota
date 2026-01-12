import { api } from '@/lib/api-client';

// 帮助分类类型
export interface HelpCategory {
  key: string;
  title: string;
  description: string;
  articles: number;
  icon?: string;
  color?: string;
}

// FAQ 类型
export interface FAQ {
  key: string;
  question: string;
  answer: string;
  category?: string;
}

// 视频教程类型
export interface VideoTutorial {
  id: string;
  title: string;
  duration: string;
  views: number;
  thumbnail?: string;
  url?: string;
}

// 热门文章类型
export interface PopularArticle {
  id: string;
  title: string;
  category: string;
  views: number;
}

// 帮助服务
export const helpService = {
  // 获取帮助分类
  getCategories: async (): Promise<HelpCategory[]> => {
    try {
      const response = await api.get<HelpCategory[]>('/api/v1/help/categories');
      return response.data;
    } catch (error) {
      return [];
    }
  },

  // 获取常见问题
  getFAQs: async (category?: string): Promise<FAQ[]> => {
    try {
      const response = await api.get<FAQ[]>('/api/v1/help/faqs', {
        params: category ? { category } : undefined,
      });
      return response.data;
    } catch (error) {
      return [];
    }
  },

  // 获取视频教程
  getVideoTutorials: async (limit?: number): Promise<VideoTutorial[]> => {
    try {
      const response = await api.get<VideoTutorial[]>('/api/v1/help/videos', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      return [];
    }
  },

  // 获取热门文章
  getPopularArticles: async (limit?: number): Promise<PopularArticle[]> => {
    try {
      const response = await api.get<PopularArticle[]>('/api/v1/help/articles/popular', {
        params: { limit: limit || 5 },
      });
      return response.data;
    } catch (error) {
      return [];
    }
  },

  // 搜索帮助文档
  searchHelp: async (keyword: string): Promise<{ faqs: FAQ[]; articles: PopularArticle[] }> => {
    try {
      const response = await api.get<{ faqs: FAQ[]; articles: PopularArticle[] }>('/api/v1/help/search', {
        params: { keyword },
      });
      return response.data;
    } catch (error) {
      return { faqs: [], articles: [] };
    }
  },

  // 提交工单
  submitTicket: async (data: { title: string; content: string; category: string }): Promise<{ ticketId: string }> => {
    const response = await api.post<{ ticketId: string }>('/api/v1/help/tickets', data);
    return response.data;
  },

  // 获取文章详情
  getArticleDetail: async (articleId: string): Promise<{ id: string; title: string; content: string; category: string } | null> => {
    try {
      const response = await api.get<{ id: string; title: string; content: string; category: string }>(`/api/v1/help/articles/${articleId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  },
};

export default helpService;