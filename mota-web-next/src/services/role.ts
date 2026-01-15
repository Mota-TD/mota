import { api } from '@/lib/api-client';

// 角色类型定义
export interface Role {
  id: string;
  name: string;
  code: string;
  sort: number;
  dataScope: number;
  status: number;
  isSystem: number;
  remark?: string;
  createdAt: string;
  updatedAt: string;
  permissionIds?: string[];
  userCount?: number;
}

export interface RoleListParams {
  pageNum?: number;
  pageSize?: number;
  name?: string;
  code?: string;
  status?: number;
}

export interface RoleListResponse {
  records: Role[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export interface CreateRoleRequest {
  name: string;
  code: string;
  sort?: number;
  dataScope?: number;
  remark?: string;
  permissionIds?: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  code?: string;
  sort?: number;
  dataScope?: number;
  status?: number;
  remark?: string;
  permissionIds?: string[];
}

// 数据范围选项
export const DATA_SCOPE_OPTIONS = [
  { value: 1, label: '全部数据' },
  { value: 2, label: '自定义数据' },
  { value: 3, label: '本部门数据' },
  { value: 4, label: '本部门及以下数据' },
  { value: 5, label: '仅本人数据' },
];

// 角色服务
export const roleService = {
  // 获取角色列表
  getRoles: async (params?: RoleListParams): Promise<RoleListResponse> => {
    const response = await api.get<RoleListResponse>('/api/v1/roles', { params });
    return response.data;
  },

  // 获取角色详情
  getRoleById: async (id: string): Promise<Role> => {
    const response = await api.get<Role>(`/api/v1/roles/${id}`);
    return response.data;
  },

  // 获取所有启用的角色
  getEnabledRoles: async (): Promise<Role[]> => {
    const response = await api.get<Role[]>('/api/v1/roles/enabled');
    return response.data;
  },

  // 创建角色
  createRole: async (data: CreateRoleRequest): Promise<string> => {
    const response = await api.post<string>('/api/v1/roles', data);
    return response.data;
  },

  // 更新角色
  updateRole: async (id: string, data: UpdateRoleRequest): Promise<void> => {
    await api.put(`/api/v1/roles/${id}`, data);
  },

  // 删除角色
  deleteRole: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/roles/${id}`);
  },

  // 批量删除角色
  deleteRoles: async (ids: string[]): Promise<void> => {
    await api.delete('/api/v1/roles/batch', { data: ids });
  },

  // 启用角色
  enableRole: async (id: string): Promise<void> => {
    await api.put(`/api/v1/roles/${id}/enable`);
  },

  // 禁用角色
  disableRole: async (id: string): Promise<void> => {
    await api.put(`/api/v1/roles/${id}/disable`);
  },

  // 分配权限
  assignPermissions: async (id: string, permissionIds: string[]): Promise<void> => {
    await api.put(`/api/v1/roles/${id}/permissions`, permissionIds);
  },

  // 获取角色权限ID列表
  getRolePermissionIds: async (id: string): Promise<string[]> => {
    const response = await api.get<string[]>(`/api/v1/roles/${id}/permissions`);
    return response.data;
  },

  // 检查角色编码是否存在
  checkCodeExists: async (code: string): Promise<boolean> => {
    const response = await api.get<boolean>('/api/v1/roles/exists/code', { params: { code } });
    return response.data;
  },
};

export default roleService;