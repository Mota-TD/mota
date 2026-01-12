import { api } from '@/lib/api-client';

// 项目进度类型
export interface ProjectProgress {
  id: string;
  name: string;
  progress: number;
  status: 'on_track' | 'at_risk' | 'delayed';
  startDate: string;
  endDate: string;
  tasks: {
    total: number;
    completed: number;
  };
  team: string[];
}

// 里程碑类型
export interface Milestone {
  id: string;
  name: string;
  project: string;
  projectId: string;
  date: string;
  status: 'completed' | 'in_progress' | 'pending';
}

// 活动类型
export interface Activity {
  id: string;
  user: string;
  userId: string;
  action: string;
  target: string;
  targetId: string;
  time: string;
  project: string;
  projectId: string;
}

// 进度统计类型
export interface ProgressStats {
  total: number;
  onTrack: number;
  atRisk: number;
  delayed: number;
  avgProgress: number;
}

// 进度服务
export const progressService = {
  // 获取项目进度列表
  getProjectProgress: async (projectId?: string): Promise<ProjectProgress[]> => {
    try {
      const response = await api.get<ProjectProgress[]>('/api/v1/progress/projects', {
        params: projectId ? { projectId } : undefined,
      });
      return response.data;
    } catch (error) {
      return [];
    }
  },

  // 获取进度统计
  getProgressStats: async (): Promise<ProgressStats> => {
    try {
      const response = await api.get<ProgressStats>('/api/v1/progress/stats');
      return response.data;
    } catch (error) {
      return {
        total: 0,
        onTrack: 0,
        atRisk: 0,
        delayed: 0,
        avgProgress: 0,
      };
    }
  },

  // 获取里程碑列表
  getMilestones: async (projectId?: string, limit?: number): Promise<Milestone[]> => {
    try {
      const response = await api.get<Milestone[]>('/api/v1/progress/milestones', {
        params: { projectId, limit },
      });
      return response.data;
    } catch (error) {
      return [];
    }
  },

  // 获取最近活动
  getRecentActivities: async (limit?: number): Promise<Activity[]> => {
    try {
      const response = await api.get<Activity[]>('/api/v1/progress/activities', {
        params: { limit: limit || 10 },
      });
      return response.data;
    } catch (error) {
      return [];
    }
  },

  // 更新项目进度
  updateProjectProgress: async (projectId: string, progress: number): Promise<void> => {
    await api.patch(`/api/v1/progress/projects/${projectId}`, { progress });
  },

  // 更新里程碑状态
  updateMilestoneStatus: async (milestoneId: string, status: string): Promise<void> => {
    await api.patch(`/api/v1/progress/milestones/${milestoneId}`, { status });
  },

  // 导出进度报告
  exportProgressReport: async (projectId?: string): Promise<Blob> => {
    const response = await api.get<Blob>('/api/v1/progress/export', {
      params: { projectId },
      responseType: 'blob',
    });
    return response.data as Blob;
  },
};

export default progressService;