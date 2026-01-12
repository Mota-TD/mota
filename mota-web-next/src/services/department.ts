import { api } from '@/lib/api-client';

// 部门类型定义
export interface Department {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  parentName?: string;
  leaderId?: string;
  leaderName?: string;
  leaderAvatar?: string;
  memberCount: number;
  level: number;
  sortOrder: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentTree extends Department {
  children?: DepartmentTree[];
}

export interface DepartmentDetail extends Department {
  members: DepartmentMember[];
  subDepartments: Department[];
  statistics: DepartmentStatistics;
}

export interface DepartmentMember {
  id: string;
  userId: string;
  username: string;
  nickname: string;
  avatar?: string;
  position?: string;
  role: string;
  joinedAt: string;
}

export interface DepartmentStatistics {
  totalMembers: number;
  activeMembers: number;
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
}

export interface DepartmentListParams {
  page?: number;
  pageSize?: number;
  parentId?: string;
  status?: string;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DepartmentListResponse {
  records: Department[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateDepartmentRequest {
  name: string;
  description?: string;
  parentId?: string;
  leaderId?: string;
  sortOrder?: number;
}

export interface UpdateDepartmentRequest {
  name?: string;
  description?: string;
  parentId?: string;
  leaderId?: string;
  sortOrder?: number;
  status?: string;
}

// 部门统计
export interface DepartmentStats {
  total: number;
  active: number;
  inactive: number;
  totalMembers: number;
  avgMembersPerDepartment: number;
}

// 部门服务
export const departmentService = {
  // 获取部门列表
  getDepartments: async (params?: DepartmentListParams): Promise<DepartmentListResponse> => {
    const response = await api.get<DepartmentListResponse>('/api/v1/departments', { params });
    return response.data;
  },

  // 获取部门树形结构
  getDepartmentTree: async (): Promise<DepartmentTree[]> => {
    const response = await api.get<DepartmentTree[]>('/api/v1/departments/tree');
    return response.data;
  },

  // 获取部门详情
  getDepartmentDetail: async (id: string): Promise<DepartmentDetail> => {
    const response = await api.get<DepartmentDetail>(`/api/v1/departments/${id}`);
    return response.data;
  },

  // 创建部门
  createDepartment: async (data: CreateDepartmentRequest): Promise<Department> => {
    const response = await api.post<Department>('/api/v1/departments', data);
    return response.data;
  },

  // 更新部门
  updateDepartment: async (id: string, data: UpdateDepartmentRequest): Promise<Department> => {
    const response = await api.put<Department>(`/api/v1/departments/${id}`, data);
    return response.data;
  },

  // 删除部门
  deleteDepartment: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/departments/${id}`);
  },

  // 获取部门统计
  getDepartmentStats: async (): Promise<DepartmentStats> => {
    const response = await api.get<DepartmentStats>('/api/v1/departments/stats');
    return response.data;
  },

  // 获取部门成员
  getDepartmentMembers: async (id: string, params?: { page?: number; pageSize?: number }): Promise<{ records: DepartmentMember[]; total: number }> => {
    const response = await api.get<{ records: DepartmentMember[]; total: number }>(`/api/v1/departments/${id}/members`, { params });
    return response.data;
  },

  // 添加部门成员
  addDepartmentMember: async (id: string, userId: string, position?: string): Promise<void> => {
    await api.post(`/api/v1/departments/${id}/members`, { userId, position });
  },

  // 移除部门成员
  removeDepartmentMember: async (id: string, userId: string): Promise<void> => {
    await api.delete(`/api/v1/departments/${id}/members/${userId}`);
  },

  // 设置部门负责人
  setDepartmentLeader: async (id: string, leaderId: string): Promise<void> => {
    await api.patch(`/api/v1/departments/${id}/leader`, { leaderId });
  },

  // 移动部门
  moveDepartment: async (id: string, parentId: string | null): Promise<void> => {
    await api.patch(`/api/v1/departments/${id}/move`, { parentId });
  },

  // 更新部门排序
  updateDepartmentOrder: async (id: string, sortOrder: number): Promise<void> => {
    await api.patch(`/api/v1/departments/${id}/order`, { sortOrder });
  },

  // 批量更新部门排序
  batchUpdateOrder: async (orders: { id: string; sortOrder: number }[]): Promise<void> => {
    await api.patch('/api/v1/departments/batch-order', { orders });
  },

  // 获取子部门
  getSubDepartments: async (id: string): Promise<Department[]> => {
    const response = await api.get<Department[]>(`/api/v1/departments/${id}/children`);
    return response.data;
  },
};

export default departmentService;