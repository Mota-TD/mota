import { api } from '@/lib/api-client';

// 通知类型定义
export interface Notification {
  id: string;
  type: 'task' | 'project' | 'mention' | 'system' | 'reminder' | 'comment';
  title: string;
  content: string;
  read: boolean;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  targetType?: string;
  targetId?: string;
  targetTitle?: string;
  actionUrl?: string;
  createdAt: string;
}

export interface NotificationListParams {
  page?: number;
  pageSize?: number;
  type?: string;
  read?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface NotificationListResponse {
  records: Notification[];
  total: number;
  page: number;
  pageSize: number;
  unreadCount: number;
}

// 通知统计
export interface NotificationStats {
  total: number;
  unread: number;
  byType: { type: string; count: number; unread: number }[];
}

// 通知设置
export interface NotificationSettings {
  email: {
    enabled: boolean;
    taskAssigned: boolean;
    taskCompleted: boolean;
    projectUpdated: boolean;
    mentioned: boolean;
    dailyDigest: boolean;
  };
  push: {
    enabled: boolean;
    taskAssigned: boolean;
    taskCompleted: boolean;
    projectUpdated: boolean;
    mentioned: boolean;
  };
  inApp: {
    enabled: boolean;
    taskAssigned: boolean;
    taskCompleted: boolean;
    projectUpdated: boolean;
    mentioned: boolean;
    systemAnnouncements: boolean;
  };
  dnd: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    weekends: boolean;
  };
}

// 通知服务
export const notificationService = {
  // 获取通知列表
  getNotifications: async (params?: NotificationListParams): Promise<NotificationListResponse> => {
    const response = await api.get<NotificationListResponse>('/api/v1/notifications', { params });
    return response.data;
  },

  // 获取未读通知数量
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<{ count: number }>('/api/v1/notifications/unread-count');
    return response.data.count;
  },

  // 获取通知统计
  getNotificationStats: async (): Promise<NotificationStats> => {
    const response = await api.get<NotificationStats>('/api/v1/notifications/stats');
    return response.data;
  },

  // 标记通知为已读
  markAsRead: async (id: string): Promise<void> => {
    await api.patch(`/api/v1/notifications/${id}/read`);
  },

  // 标记所有通知为已读
  markAllAsRead: async (): Promise<void> => {
    await api.patch('/api/v1/notifications/read-all');
  },

  // 批量标记为已读
  batchMarkAsRead: async (ids: string[]): Promise<void> => {
    await api.patch('/api/v1/notifications/batch-read', { ids });
  },

  // 删除通知
  deleteNotification: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/notifications/${id}`);
  },

  // 批量删除通知
  batchDeleteNotifications: async (ids: string[]): Promise<void> => {
    await api.delete('/api/v1/notifications/batch', { data: { ids } });
  },

  // 清空所有通知
  clearAllNotifications: async (): Promise<void> => {
    await api.delete('/api/v1/notifications/clear-all');
  },

  // 获取通知设置
  getNotificationSettings: async (): Promise<NotificationSettings> => {
    const response = await api.get<NotificationSettings>('/api/v1/notifications/settings');
    return response.data;
  },

  // 更新通知设置
  updateNotificationSettings: async (settings: Partial<NotificationSettings>): Promise<NotificationSettings> => {
    const response = await api.put<NotificationSettings>('/api/v1/notifications/settings', settings);
    return response.data;
  },

  // 订阅实时通知 (WebSocket)
  subscribeToNotifications: (onNotification: (notification: Notification) => void): (() => void) => {
    const token = localStorage.getItem('token');
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/v1/notifications/ws?token=${token}`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data) as Notification;
        onNotification(notification);
      } catch (error) {
        console.error('Failed to parse notification:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // 返回取消订阅函数
    return () => {
      ws.close();
    };
  },
};

export default notificationService;