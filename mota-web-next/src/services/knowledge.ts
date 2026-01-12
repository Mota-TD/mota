import { api } from '@/lib/api-client';

// 知识库类型
export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'personal' | 'team' | 'public';
  documentCount: number;
  memberCount: number;
  updatedAt: string;
  starred: boolean;
}

// 文件夹类型
export interface Folder {
  key: string;
  title: string;
  icon?: React.ReactNode;
  children?: Folder[];
  isLeaf?: boolean;
  documentCount?: number;
}

// 文档类型
export interface KnowledgeDocument {
  id: string;
  title: string;
  type: 'markdown' | 'pdf' | 'word' | 'excel' | 'ppt' | 'image' | 'other';
  size: number;
  folderId: string;
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  starred: boolean;
  tags: string[];
  permission: 'private' | 'team' | 'public';
}

// AI推荐
export interface AIRecommendation {
  id: string;
  title: string;
  reason: string;
}

// 知识库统计
export interface KnowledgeStats {
  totalDocuments: number;
  totalViews: number;
  totalStorage: number;
  recentUpdates: number;
}

// 知识库概览统计
export interface KnowledgeOverviewStats {
  totalDocuments: number;
  totalKnowledgeBases: number;
  totalViews: number;
  totalDownloads: number;
  documentsTrend: number;
  knowledgeBasesTrend: number;
  viewsTrend: number;
  downloadsTrend: number;
}

// 分类统计
export interface CategoryStats {
  name: string;
  count: number;
  percentage: number;
}

// 热门文档
export interface HotDocument {
  id: string;
  name: string;
  views: number;
  downloads: number;
  category: string;
}

// 贡献者
export interface Contributor {
  id: string;
  name: string;
  avatar?: string;
  documents: number;
  views: number;
}

// 月度趋势
export interface MonthlyTrend {
  month: string;
  documents: number;
  views: number;
}

// 知识库服务
export const knowledgeService = {
  // 获取概览统计
  getOverviewStats: async (): Promise<KnowledgeOverviewStats> => {
    try {
      const response = await api.get<KnowledgeOverviewStats>('/api/v1/knowledge/stats/overview');
      return response.data;
    } catch (error) {
      return {
        totalDocuments: 0,
        totalKnowledgeBases: 0,
        totalViews: 0,
        totalDownloads: 0,
        documentsTrend: 0,
        knowledgeBasesTrend: 0,
        viewsTrend: 0,
        downloadsTrend: 0,
      };
    }
  },

  // 获取分类统计
  getCategoryStats: async (): Promise<CategoryStats[]> => {
    try {
      const response = await api.get<CategoryStats[]>('/api/v1/knowledge/stats/categories');
      return response.data;
    } catch (error) {
      return [];
    }
  },

  // 获取热门文档
  getHotDocuments: async (limit?: number): Promise<HotDocument[]> => {
    try {
      const response = await api.get<HotDocument[]>('/api/v1/knowledge/stats/hot-documents', {
        params: { limit: limit || 5 },
      });
      return response.data;
    } catch (error) {
      return [];
    }
  },

  // 获取贡献者排行
  getTopContributors: async (limit?: number): Promise<Contributor[]> => {
    try {
      const response = await api.get<Contributor[]>('/api/v1/knowledge/stats/contributors', {
        params: { limit: limit || 5 },
      });
      return response.data;
    } catch (error) {
      return [];
    }
  },

  // 获取月度趋势
  getMonthlyTrend: async (months?: number): Promise<MonthlyTrend[]> => {
    try {
      const response = await api.get<MonthlyTrend[]>('/api/v1/knowledge/stats/monthly-trend', {
        params: { months: months || 6 },
      });
      return response.data;
    } catch (error) {
      return [];
    }
  },

  // 导出报告
  exportReport: async (timeRange: string): Promise<Blob> => {
    const response = await api.get<Blob>('/api/v1/knowledge/stats/export', {
      params: { timeRange },
      responseType: 'blob',
    });
    return response.data as Blob;
  },

  // 创建知识库
  createKnowledgeBase: async (data: { name: string; description?: string; type: string; icon?: string }): Promise<any> => {
    const response = await api.post('/api/v1/knowledge-bases', data);
    return response.data;
  },

  // 上传文档
  uploadDocument: async (data: { files: any; folder?: string; tags?: string[]; permission?: string }): Promise<any> => {
    const formData = new FormData();
    if (data.files) {
      const fileList = Array.isArray(data.files) ? data.files : [data.files];
      fileList.forEach((file: any) => {
        formData.append('files', file);
      });
    }
    if (data.folder) formData.append('folder', data.folder);
    if (data.tags) formData.append('tags', JSON.stringify(data.tags));
    if (data.permission) formData.append('permission', data.permission);
    const response = await api.post('/api/v1/knowledge/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // 切换知识库收藏
  toggleKnowledgeBaseStar: async (id: string): Promise<{ starred: boolean }> => {
    const response = await api.post<{ starred: boolean }>(`/api/v1/knowledge-bases/${id}/star`);
    return response.data;
  },

  // 切换文档收藏
  toggleDocumentStar: async (id: string): Promise<{ starred: boolean }> => {
    const response = await api.post<{ starred: boolean }>(`/api/v1/knowledge/documents/${id}/star`);
    return response.data;
  },

  // 删除文档
  deleteDocument: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/knowledge/documents/${id}`);
  },

  // 获取知识库列表
  getKnowledgeBases: async (): Promise<KnowledgeBase[]> => {
    try {
      const response = await api.get<KnowledgeBase[]>('/api/v1/knowledge-bases');
      return response.data;
    } catch (error) {
      return [];
    }
  },

  // 获取文件夹树
  getFolderTree: async (knowledgeBaseId: string): Promise<Folder[]> => {
    try {
      const response = await api.get<Folder[]>(`/api/v1/knowledge-bases/${knowledgeBaseId}/folders`);
      return response.data;
    } catch (error) {
      return [];
    }
  },

  // 获取文档列表
  getDocuments: async (params: { knowledgeBaseId?: string; folderId?: string; keyword?: string }): Promise<KnowledgeDocument[]> => {
    try {
      const response = await api.get<KnowledgeDocument[]>('/api/v1/knowledge/documents', { params });
      return response.data;
    } catch (error) {
      return [];
    }
  },

  // 获取知识库统计
  getStats: async (): Promise<KnowledgeStats> => {
    try {
      const response = await api.get<KnowledgeStats>('/api/v1/knowledge/stats');
      return response.data;
    } catch (error) {
      return {
        totalDocuments: 0,
        totalViews: 0,
        totalStorage: 0,
        recentUpdates: 0,
      };
    }
  },

  // 获取AI推荐
  getAIRecommendations: async (): Promise<AIRecommendation[]> => {
    try {
      const response = await api.get<AIRecommendation[]>('/api/v1/knowledge/ai-recommendations');
      return response.data;
    } catch (error) {
      return [];
    }
  },
};

export default knowledgeService;