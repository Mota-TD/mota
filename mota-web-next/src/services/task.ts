import { api } from '@/lib/api-client';

// 任务类型定义
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  projectId: string;
  projectName?: string;
  assigneeId?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  creatorId: string;
  creatorName?: string;
  parentId?: string;
  dueDate?: string;
  startDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
  attachmentCount?: number;
  commentCount?: number;
  subtaskCount?: number;
  completedSubtaskCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDetail extends Task {
  subtasks: Task[];
  checklists: Checklist[];
  comments: TaskComment[];
  attachments: TaskAttachment[];
  activities: TaskActivity[];
}

export interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
  progress: number;
}

export interface ChecklistItem {
  id: string;
  content: string;
  completed: boolean;
  assigneeId?: string;
  dueDate?: string;
}

export interface TaskComment {
  id: string;
  content: string;
  userId: string;
  username: string;
  avatar?: string;
  createdAt: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploaderId: string;
  uploaderName: string;
  createdAt: string;
}

export interface TaskActivity {
  id: string;
  type: string;
  content: string;
  userId: string;
  username: string;
  createdAt: string;
}

export interface TaskListParams {
  page?: number;
  pageSize?: number;
  projectId?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  keyword?: string;
  dueDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TaskListResponse {
  records: Task[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  projectId: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  parentId?: string;
  dueDate?: string;
  startDate?: string;
  estimatedHours?: number;
  tags?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  dueDate?: string;
  startDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
}

// 任务统计
export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

// 状态统计
export interface StatusCount {
  status: string;
  count: number;
}

// 待办任务
export interface TodoTask extends Task {
  dueInDays?: number;
  isOverdue?: boolean;
}

// 任务状态枚举
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// 优先级枚举
export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// 任务服务
export const taskService = {
  // 获取任务列表
  getTasks: async (params?: TaskListParams): Promise<TaskListResponse> => {
    const response = await api.get<TaskListResponse>('/api/v1/tasks', { params });
    return response.data;
  },

  // 获取任务详情
  getTaskDetail: async (id: string): Promise<TaskDetail> => {
    const response = await api.get<TaskDetail>(`/api/v1/tasks/${id}`);
    return response.data;
  },

  // 创建任务
  createTask: async (data: CreateTaskRequest): Promise<Task> => {
    const response = await api.post<Task>('/api/v1/tasks', data);
    return response.data;
  },

  // 更新任务
  updateTask: async (id: string, data: UpdateTaskRequest): Promise<Task> => {
    const response = await api.put<Task>(`/api/v1/tasks/${id}`, data);
    return response.data;
  },

  // 删除任务
  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/tasks/${id}`);
  },

  // 获取任务统计
  getTaskStats: async (projectId?: string): Promise<TaskStats> => {
    const response = await api.get<TaskStats>('/api/v1/tasks/stats', { params: { projectId } });
    return response.data;
  },

  // 获取今日任务
  getTodayTasks: async (): Promise<Task[]> => {
    const response = await api.get<Task[]>('/api/v1/tasks/today');
    return response.data;
  },

  // 获取我的任务
  getMyTasks: async (params?: TaskListParams): Promise<TaskListResponse> => {
    const response = await api.get<TaskListResponse>('/api/v1/tasks/my', { params });
    return response.data;
  },

  // 更新任务状态
  updateTaskStatus: async (id: string, status: string): Promise<void> => {
    await api.patch(`/api/v1/tasks/${id}/status`, { status });
  },

  // 分配任务
  assignTask: async (id: string, assigneeId: string): Promise<void> => {
    await api.patch(`/api/v1/tasks/${id}/assign`, { assigneeId });
  },

  // 获取子任务
  getSubtasks: async (id: string): Promise<Task[]> => {
    const response = await api.get<Task[]>(`/api/v1/tasks/${id}/subtasks`);
    return response.data;
  },

  // 创建子任务
  createSubtask: async (parentId: string, data: CreateTaskRequest): Promise<Task> => {
    const response = await api.post<Task>(`/api/v1/tasks/${parentId}/subtasks`, data);
    return response.data;
  },

  // 获取任务评论
  getTaskComments: async (id: string): Promise<TaskComment[]> => {
    const response = await api.get<TaskComment[]>(`/api/v1/tasks/${id}/comments`);
    return response.data;
  },

  // 添加任务评论
  addTaskComment: async (id: string, content: string): Promise<TaskComment> => {
    const response = await api.post<TaskComment>(`/api/v1/tasks/${id}/comments`, { content });
    return response.data;
  },

  // 获取任务清单
  getTaskChecklists: async (id: string): Promise<Checklist[]> => {
    const response = await api.get<Checklist[]>(`/api/v1/tasks/${id}/checklists`);
    return response.data;
  },

  // 创建任务清单
  createChecklist: async (taskId: string, title: string): Promise<Checklist> => {
    const response = await api.post<Checklist>(`/api/v1/tasks/${taskId}/checklists`, { title });
    return response.data;
  },

  // 添加清单项
  addChecklistItem: async (checklistId: string, content: string): Promise<ChecklistItem> => {
    const response = await api.post<ChecklistItem>(`/api/v1/checklists/${checklistId}/items`, { content });
    return response.data;
  },

  // 更新清单项状态
  updateChecklistItem: async (itemId: string, completed: boolean): Promise<void> => {
    await api.patch(`/api/v1/checklist-items/${itemId}`, { completed });
  },

  // ==================== 补充的 API 接口 ====================

  // 根据部门任务ID获取执行任务列表
  getTasksByDepartmentTaskId: async (departmentTaskId: string): Promise<Task[]> => {
    const response = await api.get<Task[]>(`/api/v1/tasks/department-task/${departmentTaskId}`);
    return response.data;
  },

  // 根据项目ID获取执行任务列表
  getTasksByProjectId: async (projectId: string): Promise<Task[]> => {
    const response = await api.get<Task[]>(`/api/v1/tasks/project/${projectId}`);
    return response.data;
  },

  // 根据执行人ID获取任务列表
  getTasksByAssigneeId: async (assigneeId: string): Promise<Task[]> => {
    const response = await api.get<Task[]>(`/api/v1/tasks/assignee/${assigneeId}`);
    return response.data;
  },

  // 更新任务进度
  updateTaskProgress: async (id: string, progress: number, note?: string): Promise<void> => {
    await api.put(`/api/v1/tasks/${id}/progress`, { progress, note });
  },

  // 完成任务
  completeTask: async (id: string): Promise<void> => {
    await api.put(`/api/v1/tasks/${id}/complete`);
  },

  // 获取用户待办任务列表
  getTodoList: async (userId: string): Promise<TodoTask[]> => {
    const response = await api.get<TodoTask[]>(`/api/v1/tasks/todo/${userId}`);
    return response.data;
  },

  // 获取即将到期的任务
  getUpcomingTasks: async (userId: string, days: number = 7): Promise<Task[]> => {
    const response = await api.get<Task[]>(`/api/v1/tasks/upcoming/${userId}`, { params: { days } });
    return response.data;
  },

  // 获取已逾期的任务
  getOverdueTasks: async (userId: string): Promise<Task[]> => {
    const response = await api.get<Task[]>(`/api/v1/tasks/overdue/${userId}`);
    return response.data;
  },

  // 获取部门任务下各状态的执行任务数量统计
  getTaskStatsByDepartmentTask: async (departmentTaskId: string): Promise<StatusCount[]> => {
    const response = await api.get<StatusCount[]>(`/api/v1/tasks/stats/department-task/${departmentTaskId}`);
    return response.data;
  },

  // 获取项目下各状态的执行任务数量统计
  getTaskStatsByProject: async (projectId: string): Promise<StatusCount[]> => {
    const response = await api.get<StatusCount[]>(`/api/v1/tasks/stats/project/${projectId}`);
    return response.data;
  },
};

// ==================== 辅助函数 ====================

/**
 * 获取状态显示文本
 */
export function getStatusText(status: TaskStatus | string): string {
  const statusMap: Record<string, string> = {
    'pending': '待开始',
    'in_progress': '进行中',
    'paused': '已暂停',
    'completed': '已完成',
    'cancelled': '已取消',
    'todo': '待办'
  };
  return statusMap[status] || status;
}

/**
 * 获取状态颜色
 */
export function getStatusColor(status: TaskStatus | string): string {
  const colorMap: Record<string, string> = {
    'pending': 'default',
    'in_progress': 'processing',
    'paused': 'warning',
    'completed': 'success',
    'cancelled': 'error',
    'todo': 'default'
  };
  return colorMap[status] || 'default';
}

/**
 * 获取优先级显示文本
 */
export function getPriorityText(priority: Priority | string): string {
  const priorityMap: Record<string, string> = {
    [Priority.LOW]: '低',
    [Priority.MEDIUM]: '中',
    [Priority.HIGH]: '高',
    [Priority.URGENT]: '紧急'
  };
  return priorityMap[priority] || priority;
}

/**
 * 获取优先级颜色
 */
export function getPriorityColor(priority: Priority | string): string {
  const colorMap: Record<string, string> = {
    [Priority.LOW]: 'green',
    [Priority.MEDIUM]: 'blue',
    [Priority.HIGH]: 'orange',
    [Priority.URGENT]: 'red'
  };
  return colorMap[priority] || 'default';
}

export default taskService;