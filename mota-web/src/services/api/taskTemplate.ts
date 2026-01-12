import request from '../request';

// 任务模板类型定义
export interface TaskTemplate {
  id: number;
  name: string;
  description?: string;
  category: string;
  templateData: string;
  useCount: number;
  isPublic: boolean;
  creatorId: number;
  projectId?: number;
  createdAt: string;
  updatedAt: string;
}

// 模板数据结构
export interface TemplateData {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours?: number;
  tags?: string[];
  subtasks?: Array<{
    title: string;
    description?: string;
  }>;
  checklist?: Array<{
    title: string;
    items: string[];
  }>;
}

// 分类统计
export interface CategoryStats {
  [category: string]: number;
}

// ========== 模板CRUD ==========

export const createTemplate = (template: Partial<TaskTemplate>) => {
  return request.post<TaskTemplate>('/api/task-templates', template);
};

export const updateTemplate = (id: number, template: Partial<TaskTemplate>) => {
  return request.put<TaskTemplate>(`/api/task-templates/${id}`, template);
};

export const deleteTemplate = (id: number) => {
  return request.del<boolean>(`/api/task-templates/${id}`);
};

export const getTemplate = (id: number) => {
  return request.get<TaskTemplate>(`/api/task-templates/${id}`);
};

export const getTemplates = (params?: {
  category?: string;
  isPublic?: boolean;
  creatorId?: number;
  page?: number;
  pageSize?: number;
}) => {
  const { category, isPublic, creatorId, page = 1, pageSize = 20 } = params || {};
  let url = `/api/task-templates?page=${page}&pageSize=${pageSize}`;
  if (category) url += `&category=${encodeURIComponent(category)}`;
  if (isPublic !== undefined) url += `&isPublic=${isPublic}`;
  if (creatorId) url += `&creatorId=${creatorId}`;
  return request.get<TaskTemplate[]>(url);
};

export const searchTemplates = (keyword: string, page = 1, pageSize = 20) => {
  return request.get<TaskTemplate[]>(`/api/task-templates/search?keyword=${encodeURIComponent(keyword)}&page=${page}&pageSize=${pageSize}`);
};

// ========== 模板分类 ==========

export const getAllCategories = () => {
  return request.get<string[]>('/api/task-templates/categories');
};

export const getTemplatesByCategory = (category: string) => {
  return request.get<TaskTemplate[]>(`/api/task-templates/category/${encodeURIComponent(category)}`);
};

export const getCategoryStats = () => {
  return request.get<CategoryStats>('/api/task-templates/categories/stats');
};

// ========== 模板使用 ==========

export const createTaskFromTemplate = (
  templateId: number,
  projectId: number,
  assigneeId?: number,
  overrides?: Record<string, unknown>
) => {
  let url = `/api/task-templates/${templateId}/create-task?projectId=${projectId}`;
  if (assigneeId) url += `&assigneeId=${assigneeId}`;
  return request.post<number>(url, overrides || {});
};

export const batchCreateTasksFromTemplate = (
  templateId: number,
  projectId: number,
  taskDataList: Array<Record<string, unknown>>
) => {
  return request.post<number[]>(`/api/task-templates/${templateId}/batch-create-tasks?projectId=${projectId}`, taskDataList);
};

export const getPopularTemplates = (limit = 10) => {
  return request.get<TaskTemplate[]>(`/api/task-templates/popular?limit=${limit}`);
};

export const getRecentlyUsedTemplates = (userId: number, limit = 10) => {
  return request.get<TaskTemplate[]>(`/api/task-templates/recent?userId=${userId}&limit=${limit}`);
};

// ========== 模板权限 ==========

export const setTemplatePublic = (templateId: number, isPublic: boolean) => {
  return request.put<void>(`/api/task-templates/${templateId}/public?isPublic=${isPublic}`);
};

export const canUseTemplate = (templateId: number, userId: number) => {
  return request.get<boolean>(`/api/task-templates/${templateId}/can-use?userId=${userId}`);
};

export const getUserTemplates = (userId: number) => {
  return request.get<TaskTemplate[]>(`/api/task-templates/user/${userId}`);
};

export const getProjectTemplates = (projectId: number) => {
  return request.get<TaskTemplate[]>(`/api/task-templates/project/${projectId}`);
};

// ========== 模板导入导出 ==========

export const exportTemplateAsJson = (templateId: number) => {
  return request.get<string>(`/api/task-templates/${templateId}/export`);
};

export const importTemplateFromJson = (json: string, creatorId: number) => {
  return request.post<TaskTemplate>(`/api/task-templates/import?creatorId=${creatorId}`, json);
};

export const duplicateTemplate = (templateId: number, newCreatorId: number) => {
  return request.post<TaskTemplate>(`/api/task-templates/${templateId}/duplicate?newCreatorId=${newCreatorId}`);
};

// ========== 模板推荐 ==========

export const recommendTemplates = (projectId: number, limit = 5) => {
  return request.get<TaskTemplate[]>(`/api/task-templates/recommend/project/${projectId}?limit=${limit}`);
};

export const recommendTemplatesByDescription = (description: string, limit = 5) => {
  return request.get<TaskTemplate[]>(`/api/task-templates/recommend/description?description=${encodeURIComponent(description)}&limit=${limit}`);
};

// ========== 辅助函数 ==========

/**
 * 解析模板数据
 */
export const parseTemplateData = (templateDataJson: string): TemplateData => {
  try {
    return JSON.parse(templateDataJson);
  } catch {
    return {
      title: '新任务',
      priority: 'medium'
    };
  }
};

/**
 * 序列化模板数据
 */
export const stringifyTemplateData = (templateData: TemplateData): string => {
  return JSON.stringify(templateData);
};

/**
 * 创建模板数据
 */
export const createTemplateData = (data: Partial<TemplateData>): TemplateData => {
  return {
    title: data.title || '新任务',
    description: data.description,
    priority: data.priority || 'medium',
    estimatedHours: data.estimatedHours,
    tags: data.tags,
    subtasks: data.subtasks,
    checklist: data.checklist
  };
};