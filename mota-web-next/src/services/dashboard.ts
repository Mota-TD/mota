import { api } from '@/lib/api-client';

// 仪表盘数据类型
export interface DashboardData {
  // 项目统计
  projectStats: {
    total: number;
    active: number;
    completed: number;
    overdue: number;
  };
  // 任务统计
  taskStats: {
    total: number;
    todo: number;
    inProgress: number;
    completed: number;
    overdue: number;
  };
  // 今日任务
  todayTasks: TaskItem[];
  // 最近项目
  recentProjects: ProjectItem[];
  // 通知数量
  unreadNotifications: number;
  // 日程事件
  upcomingEvents: EventItem[];
  // AI建议
  aiSuggestions: AISuggestion[];
}

export interface TaskItem {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  projectId: string;
  projectName: string;
  assigneeId: string;
  assigneeName: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  progress: number;
  icon: string;
  color: string;
  memberCount: number;
  taskCount: number;
  updatedAt: string;
}

export interface EventItem {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  type: 'meeting' | 'task' | 'reminder';
  location?: string;
}

export interface AISuggestion {
  id: string;
  type: 'task' | 'project' | 'schedule';
  title: string;
  description: string;
  action?: string;
}

// 新闻追踪数据类型
export interface NewsItem {
  id: string;
  title: string;
  source: string;
  category: string;
  publishedAt: string;
  summary?: string;
  url?: string;
}

// 仪表盘服务
export const dashboardService = {
  // 获取仪表盘聚合数据
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await api.get<DashboardData>('/api/v1/dashboard');
    return response.data;
  },

  // 清除仪表盘缓存
  clearCache: async (): Promise<void> => {
    await api.delete('/api/v1/dashboard/cache');
  },

  // 获取新闻追踪数据
  getNews: async (params?: { category?: string; limit?: number }): Promise<NewsItem[]> => {
    const response = await api.get<NewsItem[]>('/api/v1/news', { params });
    return response.data;
  },

  // 获取任务动态
  getTaskActivities: async (limit?: number): Promise<any[]> => {
    const response = await api.get<any[]>('/api/v1/tasks/activities', { params: { limit } });
    return response.data;
  },
};

export default dashboardService;