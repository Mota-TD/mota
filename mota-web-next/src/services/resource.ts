import { api } from '@/lib/api-client';

// 团队成员类型
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  workload: number;
  projects: string[];
  status: 'available' | 'busy' | 'overloaded';
  skills: string[];
}

// 资源分配类型
export interface ResourceAllocation {
  project: string;
  projectId: string;
  members: number;
  hours: number;
  budget: number;
  progress: number;
}

// 资源统计类型
export interface ResourceStats {
  totalMembers: number;
  available: number;
  busy: number;
  overloaded: number;
  avgWorkload: number;
}

// 资源服务
export const resourceService = {
  // 获取团队成员列表
  getTeamMembers: async (params?: { department?: string; status?: string }): Promise<TeamMember[]> => {
    try {
      const response = await api.get<TeamMember[]>('/api/v1/resources/members', { params });
      return response.data;
    } catch (error) {
      return [];
    }
  },

  // 获取资源分配列表
  getResourceAllocations: async (): Promise<ResourceAllocation[]> => {
    try {
      const response = await api.get<ResourceAllocation[]>('/api/v1/resources/allocations');
      return response.data;
    } catch (error) {
      return [];
    }
  },

  // 获取资源统计
  getResourceStats: async (): Promise<ResourceStats> => {
    try {
      const response = await api.get<ResourceStats>('/api/v1/resources/stats');
      return response.data;
    } catch (error) {
      return {
        totalMembers: 0,
        available: 0,
        busy: 0,
        overloaded: 0,
        avgWorkload: 0,
      };
    }
  },

  // 分配任务给成员
  assignTask: async (memberId: string, taskId: string): Promise<void> => {
    await api.post(`/api/v1/resources/members/${memberId}/assign`, { taskId });
  },

  // 更新成员工作负载
  updateWorkload: async (memberId: string, workload: number): Promise<void> => {
    await api.patch(`/api/v1/resources/members/${memberId}/workload`, { workload });
  },

  // 获取成员详情
  getMemberDetail: async (memberId: string): Promise<TeamMember | null> => {
    try {
      const response = await api.get<TeamMember>(`/api/v1/resources/members/${memberId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  },

  // 获取排期日历数据
  getScheduleCalendar: async (year: number, month: number): Promise<{ date: string; events: string[] }[]> => {
    try {
      const response = await api.get<{ date: string; events: string[] }[]>('/api/v1/resources/schedule', {
        params: { year, month },
      });
      return response.data;
    } catch (error) {
      return [];
    }
  },
};

export default resourceService;