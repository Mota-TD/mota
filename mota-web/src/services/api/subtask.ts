import { get, post, put, del } from '../request';

// 子任务类型
export interface Subtask {
  id?: number;
  parentTaskId: number;
  parentSubtaskId?: number;
  level?: number;
  projectId?: number;
  name: string;
  description?: string;
  assigneeId?: number;
  assigneeName?: string;
  assigneeAvatar?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  startDate?: string;
  endDate?: string;
  progress?: number;
  sortOrder?: number;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  children?: Subtask[];
  childrenCount?: number;
  completedChildrenCount?: number;
}

// 进度汇总类型
export interface SubtaskProgressSummary {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  averageProgress: number;
  completionRate: number;
}

// 状态标签
export const SubtaskStatusLabels: Record<string, string> = {
  pending: '待处理',
  in_progress: '进行中',
  completed: '已完成',
  cancelled: '已取消',
};

// 状态颜色
export const SubtaskStatusColors: Record<string, string> = {
  pending: 'default',
  in_progress: 'processing',
  completed: 'success',
  cancelled: 'error',
};

// 优先级标签
export const SubtaskPriorityLabels: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
};

// 优先级颜色
export const SubtaskPriorityColors: Record<string, string> = {
  low: 'green',
  medium: 'blue',
  high: 'orange',
  urgent: 'red',
};

// 创建子任务
export const createSubtask = (data: Subtask) => {
  return post<Subtask>('/api/v1/subtasks', data);
};

// 创建子子任务（多级子任务）
export const createChildSubtask = (parentSubtaskId: number, data: Subtask) => {
  return post<Subtask>(`/api/v1/subtasks/${parentSubtaskId}/children`, data);
};

// 批量创建子任务
export const batchCreateSubtasks = (data: Subtask[]) => {
  return post<boolean>('/api/v1/subtasks/batch', data);
};

// 更新子任务
export const updateSubtask = (id: number, data: Partial<Subtask>) => {
  return put<Subtask>(`/api/v1/subtasks/${id}`, data);
};

// 删除子任务（包含所有子子任务）
export const deleteSubtask = (id: number) => {
  return del<boolean>(`/api/v1/subtasks/${id}`);
};

// 获取子任务详情
export const getSubtask = (id: number) => {
  return get<Subtask>(`/api/v1/subtasks/${id}`);
};

// 获取父任务的一级子任务列表
export const getSubtasksByParentTaskId = (parentTaskId: number) => {
  return get<Subtask[]>(`/api/v1/subtasks/parent/${parentTaskId}`);
};

// 获取父任务的所有子任务（包含所有层级）
export const getAllSubtasksByParentTaskId = (parentTaskId: number) => {
  return get<Subtask[]>(`/api/v1/subtasks/parent/${parentTaskId}/all`);
};

// 获取父任务的子任务树形结构
export const getSubtaskTreeByParentTaskId = (parentTaskId: number) => {
  return get<Subtask[]>(`/api/v1/subtasks/parent/${parentTaskId}/tree`);
};

// 获取子任务的子子任务列表
export const getChildSubtasks = (parentSubtaskId: number) => {
  return get<Subtask[]>(`/api/v1/subtasks/${parentSubtaskId}/children`);
};

// 获取项目的所有子任务
export const getSubtasksByProjectId = (projectId: number) => {
  return get<Subtask[]>(`/api/v1/subtasks/project/${projectId}`);
};

// 获取执行人的子任务列表
export const getSubtasksByAssigneeId = (assigneeId: number) => {
  return get<Subtask[]>(`/api/v1/subtasks/assignee/${assigneeId}`);
};

// 更新子任务状态
export const updateSubtaskStatus = (id: number, status: string) => {
  return put<boolean>(`/api/v1/subtasks/${id}/status`, { status });
};

// 更新子任务进度
export const updateSubtaskProgress = (id: number, progress: number) => {
  return put<boolean>(`/api/v1/subtasks/${id}/progress`, { progress });
};

// 完成子任务
export const completeSubtask = (id: number) => {
  return put<boolean>(`/api/v1/subtasks/${id}/complete`);
};

// 分配子任务
export const assignSubtask = (id: number, assigneeId: number) => {
  return put<boolean>(`/api/v1/subtasks/${id}/assign`, { assigneeId });
};

// 移动子任务
export const moveSubtask = (id: number, parentTaskId?: number, parentSubtaskId?: number) => {
  return put<boolean>(`/api/v1/subtasks/${id}/move`, { parentTaskId, parentSubtaskId });
};

// 获取父任务的子任务状态统计
export const getSubtaskStatsByParentTask = (parentTaskId: number) => {
  return get<Record<string, number>>(`/api/v1/subtasks/stats/parent/${parentTaskId}`);
};

// 计算父任务进度
export const calculateParentTaskProgress = (parentTaskId: number) => {
  return get<number>(`/api/v1/subtasks/progress/parent/${parentTaskId}`);
};

// 获取子任务进度汇总
export const getSubtaskProgressSummary = (parentTaskId: number) => {
  return get<SubtaskProgressSummary>(`/api/v1/subtasks/progress/parent/${parentTaskId}/summary`);
};

// 更新子任务排序
export const updateSubtaskSortOrder = (subtasks: Array<{ id: number; sortOrder: number }>) => {
  return put<boolean>('/api/v1/subtasks/sort-order', subtasks);
};