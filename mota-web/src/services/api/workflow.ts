import request from '../request';

// 工作流模板类型定义
export interface WorkflowTemplate {
  id: number;
  name: string;
  description?: string;
  projectId?: number;
  isDefault: boolean;
  isSystem: boolean;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
  statuses?: WorkflowStatus[];
  transitions?: WorkflowTransition[];
}

// 工作流状态类型定义
export interface WorkflowStatus {
  id: number;
  workflowId: number;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  sortOrder: number;
  isInitial: boolean;
  isFinal: boolean;
  statusType: 'todo' | 'in_progress' | 'done' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// 工作流流转规则类型定义
export interface WorkflowTransition {
  id: number;
  workflowId: number;
  fromStatusId: number;
  toStatusId: number;
  name?: string;
  description?: string;
  conditions?: string;
  actions?: string;
  allowedRoles?: string;
  createdAt: string;
  updatedAt: string;
  fromStatus?: WorkflowStatus;
  toStatus?: WorkflowStatus;
}

// ========== 工作流模板管理 ==========

export const createWorkflow = (template: Partial<WorkflowTemplate>) => {
  return request.post<WorkflowTemplate>('/api/workflows', template);
};

export const updateWorkflow = (id: number, template: Partial<WorkflowTemplate>) => {
  return request.put<WorkflowTemplate>(`/api/workflows/${id}`, template);
};

export const deleteWorkflow = (id: number) => {
  return request.del<boolean>(`/api/workflows/${id}`);
};

export const getWorkflow = (id: number) => {
  return request.get<WorkflowTemplate>(`/api/workflows/${id}`);
};

export const getWorkflowWithDetails = (id: number) => {
  return request.get<WorkflowTemplate>(`/api/workflows/${id}/details`);
};

export const getSystemWorkflows = () => {
  return request.get<WorkflowTemplate[]>('/api/workflows/system');
};

export const getProjectWorkflows = (projectId: number) => {
  return request.get<WorkflowTemplate[]>(`/api/workflows/project/${projectId}`);
};

export const getUserWorkflows = (userId: number) => {
  return request.get<WorkflowTemplate[]>(`/api/workflows/user/${userId}`);
};

export const setDefaultWorkflow = (workflowId: number, projectId?: number) => {
  let url = `/api/workflows/${workflowId}/default`;
  if (projectId) url += `?projectId=${projectId}`;
  return request.put<void>(url);
};

export const getDefaultWorkflow = (projectId?: number) => {
  let url = '/api/workflows/default';
  if (projectId) url += `?projectId=${projectId}`;
  return request.get<WorkflowTemplate>(url);
};

// ========== 工作流状态管理 ==========

export const addStatus = (workflowId: number, status: Partial<WorkflowStatus>) => {
  return request.post<WorkflowStatus>(`/api/workflows/${workflowId}/statuses`, status);
};

export const updateStatus = (statusId: number, status: Partial<WorkflowStatus>) => {
  return request.put<WorkflowStatus>(`/api/workflows/statuses/${statusId}`, status);
};

export const deleteStatus = (statusId: number) => {
  return request.del<boolean>(`/api/workflows/statuses/${statusId}`);
};

export const getWorkflowStatuses = (workflowId: number) => {
  return request.get<WorkflowStatus[]>(`/api/workflows/${workflowId}/statuses`);
};

export const getInitialStatus = (workflowId: number) => {
  return request.get<WorkflowStatus>(`/api/workflows/${workflowId}/statuses/initial`);
};

export const getFinalStatuses = (workflowId: number) => {
  return request.get<WorkflowStatus[]>(`/api/workflows/${workflowId}/statuses/final`);
};

export const updateStatusOrder = (workflowId: number, statusIds: number[]) => {
  return request.put<void>(`/api/workflows/${workflowId}/statuses/order`, statusIds);
};

// ========== 工作流流转规则管理 ==========

export const addTransition = (workflowId: number, transition: Partial<WorkflowTransition>) => {
  return request.post<WorkflowTransition>(`/api/workflows/${workflowId}/transitions`, transition);
};

export const updateTransition = (transitionId: number, transition: Partial<WorkflowTransition>) => {
  return request.put<WorkflowTransition>(`/api/workflows/transitions/${transitionId}`, transition);
};

export const deleteTransition = (transitionId: number) => {
  return request.del<boolean>(`/api/workflows/transitions/${transitionId}`);
};

export const getWorkflowTransitions = (workflowId: number) => {
  return request.get<WorkflowTransition[]>(`/api/workflows/${workflowId}/transitions`);
};

export const getAvailableTransitions = (fromStatusId: number) => {
  return request.get<WorkflowTransition[]>(`/api/workflows/statuses/${fromStatusId}/available-transitions`);
};

export const canTransition = (workflowId: number, fromStatusId: number, toStatusId: number) => {
  return request.get<boolean>(`/api/workflows/${workflowId}/can-transition?fromStatusId=${fromStatusId}&toStatusId=${toStatusId}`);
};

// ========== 工作流复制 ==========

export const duplicateWorkflow = (workflowId: number, newName?: string, projectId?: number) => {
  let url = `/api/workflows/${workflowId}/duplicate`;
  const params: string[] = [];
  if (newName) params.push(`newName=${encodeURIComponent(newName)}`);
  if (projectId) params.push(`projectId=${projectId}`);
  if (params.length > 0) url += `?${params.join('&')}`;
  return request.post<WorkflowTemplate>(url);
};

export const createFromSystemTemplate = (templateId: number, projectId: number) => {
  return request.post<WorkflowTemplate>(`/api/workflows/from-system-template/${templateId}?projectId=${projectId}`);
};

// ========== 辅助函数 ==========

/**
 * 获取状态类型的显示名称
 */
export const getStatusTypeLabel = (statusType: string): string => {
  const labels: Record<string, string> = {
    todo: '待办',
    in_progress: '进行中',
    done: '已完成',
    cancelled: '已取消'
  };
  return labels[statusType] || statusType;
};

/**
 * 获取状态类型的颜色
 */
export const getStatusTypeColor = (statusType: string): string => {
  const colors: Record<string, string> = {
    todo: '#909399',
    in_progress: '#409EFF',
    done: '#67C23A',
    cancelled: '#F56C6C'
  };
  return colors[statusType] || '#909399';
};

/**
 * 预设状态颜色列表
 */
export const STATUS_COLORS = [
  '#909399', // 灰色
  '#409EFF', // 蓝色
  '#67C23A', // 绿色
  '#E6A23C', // 橙色
  '#F56C6C', // 红色
  '#9B59B6', // 紫色
  '#1ABC9C', // 青色
  '#3498DB', // 天蓝色
  '#E74C3C', // 深红色
  '#2ECC71', // 翠绿色
];