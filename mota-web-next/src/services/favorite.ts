import { api } from '@/lib/api-client';

// 收藏项类型
export interface FavoriteItem {
  id: string;
  name: string;
  description: string;
  type: 'project' | 'document' | 'task' | 'team';
  color?: string;
  time: string;
  tags?: string[];
  status?: string;
  members?: number;
}

// 收藏列表参数
export interface FavoriteListParams {
  type?: string;
  page?: number;
  pageSize?: number;
  keyword?: string;
}

// 收藏列表响应
export interface FavoriteListResponse {
  records: FavoriteItem[];
  total: number;
  page: number;
  pageSize: number;
}

// 收藏服务
export const favoriteService = {
  // 获取收藏列表
  getFavorites: async (params?: FavoriteListParams): Promise<FavoriteListResponse> => {
    try {
      const response = await api.get<FavoriteListResponse>('/api/v1/favorites', { params });
      return response.data;
    } catch (error) {
      return { records: [], total: 0, page: 1, pageSize: 20 };
    }
  },

  // 添加收藏
  addFavorite: async (targetType: string, targetId: string): Promise<FavoriteItem> => {
    const response = await api.post<FavoriteItem>('/api/v1/favorites', { targetType, targetId });
    return response.data;
  },

  // 取消收藏
  removeFavorite: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/favorites/${id}`);
  },

  // 检查是否已收藏
  checkFavorite: async (targetType: string, targetId: string): Promise<boolean> => {
    try {
      const response = await api.get<{ isFavorite: boolean }>('/api/v1/favorites/check', {
        params: { targetType, targetId },
      });
      return response.data.isFavorite;
    } catch (error) {
      return false;
    }
  },

  // 获取收藏统计
  getFavoriteStats: async (): Promise<{ project: number; document: number; task: number; team: number; total: number }> => {
    try {
      const response = await api.get<{ project: number; document: number; task: number; team: number; total: number }>('/api/v1/favorites/stats');
      return response.data;
    } catch (error) {
      return { project: 0, document: 0, task: 0, team: 0, total: 0 };
    }
  },
};

export default favoriteService;