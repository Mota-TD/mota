import { api } from '@/lib/api-client';

// 项目类型定义
export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived' | 'paused';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  icon?: string;
  color?: string;
  startDate: string;
  endDate: string;
  ownerId: string;
  ownerName: string;
  tenantId: string;
  memberCount: number;
  taskCount: number;
  completedTaskCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDetail extends Project {
  members: ProjectMember[];
  tasks: ProjectTask[];
  milestones: ProjectMilestone[];
}

export interface ProjectMember {
  id: string;
  userId: string;
  username: string;
  nickname: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId?: string;
  assigneeName?: string;
  dueDate?: string;
  createdAt: string;
}

export interface ProjectMilestone {
  id: string;
  name: string;
  description?: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
}

export interface ProjectListParams {
  page?: number;
  pageSize?: number;
  status?: string;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProjectListResponse {
  records: Project[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  status?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  icon?: string;
  color?: string;
  templateId?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  icon?: string;
  color?: string;
  progress?: number;
}

// 项目统计
export interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  overdue: number;
}

// 项目服务
export const projectService = {
  // 获取项目列表
  getProjects: async (params?: ProjectListParams): Promise<ProjectListResponse> => {
    const response = await api.get<ProjectListResponse>('/api/v1/projects', { params });
    return response.data;
  },

  // 获取项目详情
  getProjectDetail: async (id: string): Promise<ProjectDetail> => {
    const response = await api.get<ProjectDetail>(`/api/v1/projects/${id}`);
    return response.data;
  },

  // 创建项目
  createProject: async (data: CreateProjectRequest): Promise<Project> => {
    const response = await api.post<Project>('/api/v1/projects', data);
    return response.data;
  },

  // 更新项目
  updateProject: async (id: string, data: UpdateProjectRequest): Promise<Project> => {
    const response = await api.put<Project>(`/api/v1/projects/${id}`, data);
    return response.data;
  },

  // 删除项目
  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/projects/${id}`);
  },

  // 获取项目统计
  getProjectStats: async (): Promise<ProjectStats> => {
    const response = await api.get<ProjectStats>('/api/v1/projects/stats');
    return response.data;
  },

  // 获取最近项目
  getRecentProjects: async (limit?: number): Promise<Project[]> => {
    const response = await api.get<Project[]>('/api/v1/projects/recent', { params: { limit } });
    return response.data;
  },

  // 归档项目
  archiveProject: async (id: string): Promise<void> => {
    await api.post(`/api/v1/projects/${id}/archive`);
  },

  // 恢复项目
  restoreProject: async (id: string): Promise<void> => {
    await api.post(`/api/v1/projects/${id}/restore`);
  },

  // 获取项目成员
  getProjectMembers: async (id: string): Promise<ProjectMember[]> => {
    const response = await api.get<ProjectMember[]>(`/api/v1/projects/${id}/members`);
    return response.data;
  },

  // 添加项目成员
  addProjectMember: async (id: string, userId: string, role?: string): Promise<void> => {
    await api.post(`/api/v1/projects/${id}/members`, { userId, role });
  },

  // 移除项目成员
  removeProjectMember: async (id: string, userId: string): Promise<void> => {
    await api.delete(`/api/v1/projects/${id}/members/${userId}`);
  },

  // 获取项目里程碑
  getProjectMilestones: async (id: string): Promise<ProjectMilestone[]> => {
    const response = await api.get<ProjectMilestone[]>(`/api/v1/projects/${id}/milestones`);
    return response.data;
  },

  // ==================== 补充的 API 接口 ====================

  // 收藏/取消收藏项目
  toggleProjectStar: async (id: string): Promise<void> => {
    await api.post(`/api/v1/projects/${id}/star`);
  },

  // 获取收藏的项目列表
  getStarredProjects: async (): Promise<Project[]> => {
    const response = await api.get<Project[]>('/api/v1/projects/starred');
    return response.data;
  },

  // 获取归档项目列表
  getArchivedProjects: async (): Promise<Project[]> => {
    const response = await api.get<Project[]>('/api/v1/projects/archived');
    return response.data;
  },

  // 获取项目统计信息（详细）
  getProjectStatistics: async (id: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    pendingTasks: number;
    overdueTasks: number;
    departmentTaskCount: number;
    completedMilestones: number;
    totalMilestones: number;
    completionRate: number;
  }> => {
    const response = await api.get<{
      totalTasks: number;
      completedTasks: number;
      inProgressTasks: number;
      pendingTasks: number;
      overdueTasks: number;
      departmentTaskCount: number;
      completedMilestones: number;
      totalMilestones: number;
      completionRate: number;
    }>(`/api/v1/projects/${id}/statistics`);
    return response.data;
  },

  // 更新项目状态
  updateProjectStatus: async (id: string, status: string): Promise<void> => {
    await api.put(`/api/v1/projects/${id}/status`, null, { params: { status } });
  },

  // 更新项目进度
  updateProjectProgress: async (id: string, progress: number): Promise<void> => {
    await api.put(`/api/v1/projects/${id}/progress`, null, { params: { progress } });
  },

  // 获取下一个项目标识
  getNextProjectKey: async (): Promise<string> => {
    const response = await api.get<string>('/api/v1/projects/key/next');
    return response.data;
  },

  // 批量添加项目成员
  addProjectMembers: async (id: string, userIds: string[], role?: string): Promise<void> => {
    await api.post(`/api/v1/projects/${id}/members/batch`, userIds, { params: { role } });
  },

  // 更新成员角色
  updateMemberRole: async (projectId: string, userId: string, role: string): Promise<void> => {
    await api.put(`/api/v1/projects/${projectId}/members/${userId}/role`, null, { params: { role } });
  },

  // 添加里程碑
  addMilestone: async (projectId: string, milestone: Partial<ProjectMilestone>): Promise<ProjectMilestone> => {
    const response = await api.post<ProjectMilestone>(`/api/v1/projects/${projectId}/milestones`, milestone);
    return response.data;
  },

  // 更新里程碑
  updateMilestone: async (milestoneId: string, milestone: Partial<ProjectMilestone>): Promise<ProjectMilestone> => {
    const response = await api.put<ProjectMilestone>(`/api/v1/projects/milestones/${milestoneId}`, milestone);
    return response.data;
  },

  // 删除里程碑
  deleteMilestone: async (milestoneId: string): Promise<void> => {
    await api.delete(`/api/v1/projects/milestones/${milestoneId}`);
  },

  // 完成里程碑
  completeMilestone: async (milestoneId: string): Promise<void> => {
    await api.post(`/api/v1/projects/milestones/${milestoneId}/complete`);
  },
};

export default projectService;