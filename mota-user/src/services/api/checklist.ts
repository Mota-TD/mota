import { get, post, put, del } from '../request';

// 检查清单类型
export interface Checklist {
  id?: number;
  taskId: number;
  name: string;
  sortOrder?: number;
  items?: ChecklistItem[];
  completedCount?: number;
  totalCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

// 检查清单项类型
export interface ChecklistItem {
  id?: number;
  checklistId?: number;
  content: string;
  isCompleted?: number;
  completedBy?: number;
  completedAt?: string;
  assigneeId?: number;
  dueDate?: string;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

// 完成情况统计
export interface ChecklistCompletion {
  total: number;
  completed: number;
  percentage: number;
}

// 创建检查清单
export const createChecklist = (data: Checklist) => {
  return post<Checklist>('/api/v1/checklists', data);
};

// 创建检查清单（包含清单项）
export const createChecklistWithItems = (data: {
  taskId: number;
  name: string;
  items: Array<{ content: string; assigneeId?: number; dueDate?: string }>;
}) => {
  return post<Checklist>('/api/v1/checklists/with-items', data);
};

// 更新检查清单
export const updateChecklist = (id: number, data: Partial<Checklist>) => {
  return put<Checklist>(`/api/v1/checklists/${id}`, data);
};

// 删除检查清单
export const deleteChecklist = (id: number) => {
  return del<boolean>(`/api/v1/checklists/${id}`);
};

// 获取检查清单详情
export const getChecklist = (id: number) => {
  return get<Checklist>(`/api/v1/checklists/${id}`);
};

// 获取任务的检查清单列表
export const getChecklistsByTaskId = (taskId: number) => {
  return get<Checklist[]>(`/api/v1/checklists/task/${taskId}`);
};

// 获取任务的检查清单列表（包含清单项）
export const getChecklistsWithItemsByTaskId = (taskId: number) => {
  return get<Checklist[]>(`/api/v1/checklists/task/${taskId}/with-items`);
};

// 更新检查清单排序
export const updateChecklistSortOrder = (checklists: Array<{ id: number; sortOrder: number }>) => {
  return put<boolean>('/api/v1/checklists/sort-order', checklists);
};

// 获取任务的检查清单完成情况
export const getTaskChecklistCompletion = (taskId: number) => {
  return get<ChecklistCompletion>(`/api/v1/checklists/task/${taskId}/completion`);
};

// 计算任务的检查清单完成百分比
export const calculateTaskChecklistProgress = (taskId: number) => {
  return get<number>(`/api/v1/checklists/task/${taskId}/progress`);
};

// ==================== 清单项相关接口 ====================

// 添加清单项
export const addChecklistItem = (checklistId: number, item: ChecklistItem) => {
  return post<ChecklistItem>(`/api/v1/checklists/${checklistId}/items`, item);
};

// 批量添加清单项
export const batchAddChecklistItems = (checklistId: number, items: ChecklistItem[]) => {
  return post<boolean>(`/api/v1/checklists/${checklistId}/items/batch`, items);
};

// 更新清单项
export const updateChecklistItem = (itemId: number, item: Partial<ChecklistItem>) => {
  return put<ChecklistItem>(`/api/v1/checklists/items/${itemId}`, item);
};

// 删除清单项
export const deleteChecklistItem = (itemId: number) => {
  return del<boolean>(`/api/v1/checklists/items/${itemId}`);
};

// 切换清单项完成状态
export const toggleChecklistItemCompleted = (itemId: number) => {
  return put<boolean>(`/api/v1/checklists/items/${itemId}/toggle`);
};

// 更新清单项完成状态
export const updateChecklistItemCompleted = (itemId: number, completed: boolean) => {
  return put<boolean>(`/api/v1/checklists/items/${itemId}/completed`, { completed });
};

// 更新清单项排序
export const updateChecklistItemSortOrder = (items: Array<{ id: number; sortOrder: number }>) => {
  return put<boolean>('/api/v1/checklists/items/sort-order', items);
};

// 获取清单的清单项列表
export const getChecklistItems = (checklistId: number) => {
  return get<ChecklistItem[]>(`/api/v1/checklists/${checklistId}/items`);
};

// 获取检查清单的完成情况
export const getChecklistCompletion = (checklistId: number) => {
  return get<ChecklistCompletion>(`/api/v1/checklists/${checklistId}/completion`);
};