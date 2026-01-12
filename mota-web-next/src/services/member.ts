import { api } from '@/lib/api-client';

// 成员类型定义
export interface Member {
  id: string;
  userId: string;
  username: string;
  nickname: string;
  email: string;
  phone?: string;
  avatar?: string;
  departmentId?: string;
  departmentName?: string;
  position?: string;
  role: 'admin' | 'manager' | 'member';
  status: 'active' | 'inactive' | 'pending';
  joinedAt: string;
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberDetail extends Member {
  projects: MemberProject[];
  tasks: MemberTask[];
  statistics: MemberStatistics;
}

export interface MemberProject {
  id: string;
  name: string;
  role: string;
  joinedAt: string;
}

export interface MemberTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string;
}

export interface MemberStatistics {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
}

export interface MemberListParams {
  page?: number;
  pageSize?: number;
  departmentId?: string;
  role?: string;
  status?: string;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MemberListResponse {
  records: Member[];
  total: number;
  page: number;
  pageSize: number;
}

export interface InviteMemberRequest {
  email: string;
  role?: string;
  departmentId?: string;
  message?: string;
}

export interface UpdateMemberRequest {
  nickname?: string;
  phone?: string;
  avatar?: string;
  departmentId?: string;
  position?: string;
  role?: string;
  status?: string;
}

// 成员统计
export interface MemberStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  byDepartment: { departmentId: string; departmentName: string; count: number }[];
  byRole: { role: string; count: number }[];
}

// 成员服务
export const memberService = {
  // 获取成员列表
  getMembers: async (params?: MemberListParams): Promise<MemberListResponse> => {
    const response = await api.get<MemberListResponse>('/api/v1/members', { params });
    return response.data;
  },

  // 获取成员详情
  getMemberDetail: async (id: string): Promise<MemberDetail> => {
    const response = await api.get<MemberDetail>(`/api/v1/members/${id}`);
    return response.data;
  },

  // 邀请成员
  inviteMember: async (data: InviteMemberRequest): Promise<void> => {
    await api.post('/api/v1/members/invite', data);
  },

  // 批量邀请成员
  batchInviteMembers: async (emails: string[], role?: string, departmentId?: string): Promise<void> => {
    await api.post('/api/v1/members/batch-invite', { emails, role, departmentId });
  },

  // 更新成员信息
  updateMember: async (id: string, data: UpdateMemberRequest): Promise<Member> => {
    const response = await api.put<Member>(`/api/v1/members/${id}`, data);
    return response.data;
  },

  // 移除成员
  removeMember: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/members/${id}`);
  },

  // 创建成员（别名）
  createMember: async (data: InviteMemberRequest): Promise<void> => {
    await api.post('/api/v1/members/invite', data);
  },

  // 删除成员（别名）
  deleteMember: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/members/${id}`);
  },

  // 获取成员统计
  getMemberStats: async (): Promise<MemberStats> => {
    const response = await api.get<MemberStats>('/api/v1/members/stats');
    return response.data;
  },

  // 更新成员角色
  updateMemberRole: async (id: string, role: string): Promise<void> => {
    await api.patch(`/api/v1/members/${id}/role`, { role });
  },

  // 更新成员状态
  updateMemberStatus: async (id: string, status: string): Promise<void> => {
    await api.patch(`/api/v1/members/${id}/status`, { status });
  },

  // 更新成员部门
  updateMemberDepartment: async (id: string, departmentId: string): Promise<void> => {
    await api.patch(`/api/v1/members/${id}/department`, { departmentId });
  },

  // 获取成员项目列表
  getMemberProjects: async (id: string): Promise<MemberProject[]> => {
    const response = await api.get<MemberProject[]>(`/api/v1/members/${id}/projects`);
    return response.data;
  },

  // 获取成员任务列表
  getMemberTasks: async (id: string, params?: { status?: string; limit?: number }): Promise<MemberTask[]> => {
    const response = await api.get<MemberTask[]>(`/api/v1/members/${id}/tasks`, { params });
    return response.data;
  },

  // 重新发送邀请
  resendInvitation: async (id: string): Promise<void> => {
    await api.post(`/api/v1/members/${id}/resend-invitation`);
  },

  // 搜索成员
  searchMembers: async (keyword: string, limit?: number): Promise<Member[]> => {
    const response = await api.get<Member[]>('/api/v1/members/search', { params: { keyword, limit } });
    return response.data;
  },
};

export default memberService;