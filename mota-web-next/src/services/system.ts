import { api } from '@/lib/api-client';

// 系统状态类型
export interface SystemStatus {
  cpu: number;
  memory: number;
  disk: number;
  uptime: string;
  version: string;
  lastUpdate: string;
}

// 服务状态类型
export interface ServiceStatus {
  name: string;
  status: 'running' | 'warning' | 'stopped';
  uptime: string;
}

// 操作日志类型
export interface OperationLog {
  id: string;
  user: string;
  action: string;
  time: string;
  ip: string;
}

// 系统设置类型
export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  language: string;
  timezone: string;
}

// 安全设置类型
export interface SecuritySettings {
  twoFactorAuth: boolean;
  loginLockout: boolean;
  passwordStrength: boolean;
  sessionTimeout: boolean;
}

// 当前用户类型
export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  department?: string;
  position?: string;
  timezone?: string;
  language?: string;
}

// 角色类型
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
}

// API密钥类型
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  lastUsed: string;
  createdAt: string;
  expiresAt?: string;
}

// 审计日志类型
export interface AuditLog {
  id: string;
  user: string;
  action: string;
  target: string;
  ip: string;
  timestamp: string;
  status: 'success' | 'failed';
}

// 系统统计类型
export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  totalTasks: number;
  storageUsed: number;
  storageTotal: number;
  apiCalls: number;
  lastBackup: string;
}

// 系统服务
export const systemService = {
  // 获取系统状态
  getSystemStatus: async (): Promise<SystemStatus> => {
    try {
      const response = await api.get<SystemStatus>('/api/v1/system/status');
      return response.data;
    } catch (error) {
      // 返回空状态
      return {
        cpu: 0,
        memory: 0,
        disk: 0,
        uptime: '-',
        version: '-',
        lastUpdate: '-',
      };
    }
  },

  // 获取服务状态列表
  getServices: async (): Promise<ServiceStatus[]> => {
    try {
      const response = await api.get<ServiceStatus[]>('/api/v1/system/services');
      return response.data;
    } catch (error) {
      return [];
    }
  },

  // 获取操作日志
  getOperationLogs: async (params?: { page?: number; pageSize?: number }): Promise<{ records: OperationLog[]; total: number }> => {
    try {
      const response = await api.get<{ records: OperationLog[]; total: number }>('/api/v1/system/logs', { params });
      return response.data;
    } catch (error) {
      return { records: [], total: 0 };
    }
  },

  // 获取系统设置
  getSystemSettings: async (): Promise<SystemSettings> => {
    try {
      const response = await api.get<SystemSettings>('/api/v1/system/settings');
      return response.data;
    } catch (error) {
      return {
        siteName: '',
        siteDescription: '',
        language: 'zh-CN',
        timezone: 'Asia/Shanghai',
      };
    }
  },

  // 更新系统设置
  updateSystemSettings: async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
    const response = await api.put<SystemSettings>('/api/v1/system/settings', settings);
    return response.data;
  },

  // 获取安全设置
  getSecuritySettings: async (): Promise<SecuritySettings> => {
    try {
      const response = await api.get<SecuritySettings>('/api/v1/system/security');
      return response.data;
    } catch (error) {
      return {
        twoFactorAuth: false,
        loginLockout: false,
        passwordStrength: false,
        sessionTimeout: false,
      };
    }
  },

  // 更新安全设置
  updateSecuritySettings: async (settings: Partial<SecuritySettings>): Promise<SecuritySettings> => {
    const response = await api.put<SecuritySettings>('/api/v1/system/security', settings);
    return response.data;
  },

  // 重启服务
  restartService: async (serviceName: string): Promise<void> => {
    await api.post(`/api/v1/system/services/${serviceName}/restart`);
  },

  // 获取当前用户
  getCurrentUser: async (): Promise<CurrentUser | null> => {
    try {
      const response = await api.get<CurrentUser>('/api/v1/users/me');
      return response.data;
    } catch {
      return null;
    }
  },

  // 更新个人资料
  updateProfile: async (data: Partial<CurrentUser>): Promise<CurrentUser> => {
    const response = await api.put<CurrentUser>('/api/v1/users/me', data);
    return response.data;
  },

  // 获取角色列表
  getRoles: async (): Promise<Role[]> => {
    try {
      const response = await api.get<Role[]>('/api/v1/roles');
      return response.data;
    } catch {
      return [];
    }
  },

  // 创建角色
  createRole: async (data: Partial<Role>): Promise<Role> => {
    const response = await api.post<Role>('/api/v1/roles', data);
    return response.data;
  },

  // 更新角色
  updateRole: async (id: string, data: Partial<Role>): Promise<Role> => {
    const response = await api.put<Role>(`/api/v1/roles/${id}`, data);
    return response.data;
  },

  // 删除角色
  deleteRole: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/roles/${id}`);
  },

  // 获取API密钥列表
  getApiKeys: async (): Promise<ApiKey[]> => {
    try {
      const response = await api.get<ApiKey[]>('/api/v1/api-keys');
      return response.data;
    } catch {
      return [];
    }
  },

  // 创建API密钥
  createApiKey: async (data: { name: string; permissions?: string[]; expiresAt?: string }): Promise<ApiKey> => {
    const response = await api.post<ApiKey>('/api/v1/api-keys', data);
    return response.data;
  },

  // 删除API密钥
  deleteApiKey: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/api-keys/${id}`);
  },

  // 获取审计日志
  getAuditLogs: async (params?: { page?: number; pageSize?: number; action?: string }): Promise<AuditLog[]> => {
    try {
      const response = await api.get<{ records: AuditLog[] }>('/api/v1/audit-logs', { params });
      return response.data.records || [];
    } catch {
      return [];
    }
  },

  // 获取系统统计
  getSystemStats: async (): Promise<SystemStats> => {
    try {
      const response = await api.get<SystemStats>('/api/v1/system/stats');
      return response.data;
    } catch {
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalProjects: 0,
        totalTasks: 0,
        storageUsed: 0,
        storageTotal: 10,
        apiCalls: 0,
        lastBackup: '',
      };
    }
  },
};

export default systemService;