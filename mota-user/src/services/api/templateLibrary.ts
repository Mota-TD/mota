import request from '../request';

// ========== 类型定义 ==========

// 模板类型枚举
export type TemplateType = 'document' | 'task' | 'project' | 'workflow';

// 模板来源
export type TemplateSource = 'system' | 'custom' | 'shared';

// 模板状态
export type TemplateStatus = 'draft' | 'published' | 'archived';

// 基础模板接口
export interface Template {
  id: number;
  name: string;
  description?: string;
  type: TemplateType;
  source: TemplateSource;
  status: TemplateStatus;
  category: string;
  tags: string[];
  content: string; // JSON格式的模板内容
  thumbnail?: string;
  useCount: number;
  rating: number;
  ratingCount: number;
  isPublic: boolean;
  creatorId: number;
  creatorName: string;
  creatorAvatar?: string;
  teamId?: number;
  teamName?: string;
  projectId?: number;
  createdAt: string;
  updatedAt: string;
}

// 文档模板内容
export interface DocumentTemplateContent {
  title: string;
  content: string; // 富文本内容
  format: 'markdown' | 'html' | 'richtext';
  sections?: Array<{
    title: string;
    content: string;
    order: number;
  }>;
  variables?: Array<{
    name: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select';
    defaultValue?: string;
    options?: string[];
    required?: boolean;
  }>;
}

// 任务模板内容
export interface TaskTemplateContent {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours?: number;
  tags?: string[];
  subtasks?: Array<{
    title: string;
    description?: string;
    estimatedHours?: number;
  }>;
  checklist?: Array<{
    title: string;
    items: string[];
  }>;
  dependencies?: Array<{
    type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish';
    taskIndex: number;
  }>;
}

// 项目模板内容
export interface ProjectTemplateContent {
  name: string;
  description?: string;
  type: string;
  milestones?: Array<{
    name: string;
    description?: string;
    daysFromStart: number;
    tasks?: TaskTemplateContent[];
  }>;
  defaultTasks?: TaskTemplateContent[];
  roles?: Array<{
    name: string;
    permissions: string[];
  }>;
  workflows?: Array<{
    name: string;
    stages: string[];
  }>;
  settings?: Record<string, unknown>;
}

// 工作流模板内容
export interface WorkflowTemplateContent {
  name: string;
  description?: string;
  stages: Array<{
    name: string;
    order: number;
    color?: string;
    actions?: string[];
    transitions?: Array<{
      to: string;
      condition?: string;
    }>;
  }>;
  triggers?: Array<{
    event: string;
    action: string;
    conditions?: Record<string, unknown>;
  }>;
}

// 模板分类
export interface TemplateCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: number;
  children?: TemplateCategory[];
  templateCount: number;
  order: number;
  createdAt: string;
}

// 模板统计
export interface TemplateStats {
  totalTemplates: number;
  systemTemplates: number;
  customTemplates: number;
  sharedTemplates: number;
  documentTemplates: number;
  taskTemplates: number;
  projectTemplates: number;
  workflowTemplates: number;
  totalUseCount: number;
  averageRating: number;
  topCategories: Array<{
    name: string;
    count: number;
  }>;
  recentlyUsed: Template[];
  popularTemplates: Template[];
  trendingTemplates: Template[];
}

// 模板使用记录
export interface TemplateUsageRecord {
  id: number;
  templateId: number;
  templateName: string;
  templateType: TemplateType;
  userId: number;
  userName: string;
  createdItemId: number;
  createdItemType: string;
  createdAt: string;
}

// 模板评价
export interface TemplateReview {
  id: number;
  templateId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

// 模板共享设置
export interface TemplateShareSettings {
  isPublic: boolean;
  sharedWithTeams: number[];
  sharedWithUsers: number[];
  allowCopy: boolean;
  allowModify: boolean;
  expiresAt?: string;
}

// 查询参数
export interface TemplateQueryParams {
  keyword?: string;
  type?: TemplateType;
  source?: TemplateSource;
  status?: TemplateStatus;
  category?: string;
  tags?: string[];
  creatorId?: number;
  teamId?: number;
  isPublic?: boolean;
  sortBy?: 'name' | 'useCount' | 'rating' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

// 分页结果
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ========== 系统模板 (TP-001) ==========

// 获取系统预置模板
export const getSystemTemplates = async (type?: TemplateType): Promise<Template[]> => {
  let url = '/api/templates/system';
  if (type) url += `?type=${type}`;
  return await request.get<Template[]>(url);
};

// 获取系统模板详情
export const getSystemTemplate = async (id: number): Promise<Template> => {
  return await request.get<Template>(`/api/templates/system/${id}`);
};

// ========== 自定义模板 (TP-002) ==========

// 创建自定义模板
export const createTemplate = async (template: Partial<Template>): Promise<Template> => {
  return await request.post<Template>('/api/templates', template);
};

// 更新模板
export const updateTemplate = async (id: number, template: Partial<Template>): Promise<Template> => {
  return await request.put<Template>(`/api/templates/${id}`, template);
};

// 删除模板
export const deleteTemplate = async (id: number): Promise<boolean> => {
  await request.del(`/api/templates/${id}`);
  return true;
};

// 复制模板
export const duplicateTemplate = async (id: number, name?: string): Promise<Template> => {
  return await request.post<Template>(`/api/templates/${id}/duplicate`, { name });
};

// 从现有内容创建模板
export const createTemplateFromContent = async (
  type: TemplateType,
  sourceId: number,
  templateInfo: { name: string; description?: string; category?: string; tags?: string[] }
): Promise<Template> => {
  return await request.post<Template>(`/api/templates/from-content`, {
    type,
    sourceId,
    ...templateInfo
  });
};

// ========== 模板分类 (TP-003) ==========

// 获取所有分类
export const getCategories = async (type?: TemplateType): Promise<TemplateCategory[]> => {
  let url = '/api/templates/categories';
  if (type) url += `?type=${type}`;
  return await request.get<TemplateCategory[]>(url);
};

// 创建分类
export const createCategory = async (category: Partial<TemplateCategory>): Promise<TemplateCategory> => {
  return await request.post<TemplateCategory>('/api/templates/categories', category);
};

// 更新分类
export const updateCategory = async (id: number, category: Partial<TemplateCategory>): Promise<TemplateCategory> => {
  return await request.put<TemplateCategory>(`/api/templates/categories/${id}`, category);
};

// 删除分类
export const deleteCategory = async (id: number): Promise<boolean> => {
  await request.del(`/api/templates/categories/${id}`);
  return true;
};

// 获取分类树
export const getCategoryTree = async (): Promise<TemplateCategory[]> => {
  return await request.get<TemplateCategory[]>('/api/templates/categories/tree');
};

// ========== 模板共享 (TP-004) ==========

// 共享模板给团队
export const shareTemplateWithTeam = async (templateId: number, teamIds: number[]): Promise<boolean> => {
  await request.post(`/api/templates/${templateId}/share/teams`, { teamIds });
  return true;
};

// 共享模板给用户
export const shareTemplateWithUsers = async (templateId: number, userIds: number[]): Promise<boolean> => {
  await request.post(`/api/templates/${templateId}/share/users`, { userIds });
  return true;
};

// 设置模板公开状态
export const setTemplatePublic = async (templateId: number, isPublic: boolean): Promise<boolean> => {
  await request.put(`/api/templates/${templateId}/public`, { isPublic });
  return true;
};

// 获取共享设置
export const getShareSettings = async (templateId: number): Promise<TemplateShareSettings> => {
  return await request.get<TemplateShareSettings>(`/api/templates/${templateId}/share`);
};

// 更新共享设置
export const updateShareSettings = async (templateId: number, settings: TemplateShareSettings): Promise<boolean> => {
  await request.put(`/api/templates/${templateId}/share`, settings);
  return true;
};

// 获取团队共享的模板
export const getTeamSharedTemplates = async (teamId: number): Promise<Template[]> => {
  return await request.get<Template[]>(`/api/templates/shared/team/${teamId}`);
};

// 获取用户可用的共享模板
export const getAvailableSharedTemplates = async (): Promise<Template[]> => {
  return await request.get<Template[]>('/api/templates/shared/available');
};

// ========== 模板使用 (TP-005) ==========

// 从模板创建文档
export const createDocumentFromTemplate = async (
  templateId: number,
  options: {
    projectId?: number;
    folderId?: number;
    variables?: Record<string, string>;
    name?: string;
  }
): Promise<{ documentId: number; documentName: string }> => {
  return await request.post(`/api/templates/${templateId}/create/document`, options);
};

// 从模板创建任务
export const createTaskFromTemplate = async (
  templateId: number,
  options: {
    projectId: number;
    assigneeId?: number;
    overrides?: Partial<TaskTemplateContent>;
  }
): Promise<{ taskId: number; taskName: string }> => {
  return await request.post(`/api/templates/${templateId}/create/task`, options);
};

// 从模板创建项目
export const createProjectFromTemplate = async (
  templateId: number,
  options: {
    name: string;
    description?: string;
    startDate?: string;
    teamId?: number;
    overrides?: Partial<ProjectTemplateContent>;
  }
): Promise<{ projectId: number; projectName: string }> => {
  return await request.post(`/api/templates/${templateId}/create/project`, options);
};

// 预览模板应用效果
export const previewTemplateApplication = async (
  templateId: number,
  variables?: Record<string, string>
): Promise<{ preview: string; warnings?: string[] }> => {
  return await request.post(`/api/templates/${templateId}/preview`, { variables });
};

// 获取模板变量
export const getTemplateVariables = async (templateId: number): Promise<Array<{
  name: string;
  label: string;
  type: string;
  required: boolean;
  defaultValue?: string;
}>> => {
  return await request.get(`/api/templates/${templateId}/variables`);
};

// ========== 任务模板 (TP-006) ==========

// 获取任务模板列表
export const getTaskTemplates = async (params?: TemplateQueryParams): Promise<PaginatedResult<Template>> => {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, Array.isArray(value) ? value.join(',') : String(value));
      }
    });
  }
  return await request.get<PaginatedResult<Template>>(`/api/templates/tasks?${queryParams}`);
};

// 获取任务模板分类
export const getTaskTemplateCategories = async (): Promise<string[]> => {
  return await request.get<string[]>('/api/templates/tasks/categories');
};

// 批量从任务模板创建任务
export const batchCreateTasksFromTemplate = async (
  templateId: number,
  projectId: number,
  count: number,
  options?: { assigneeIds?: number[]; startDate?: string }
): Promise<{ taskIds: number[]; successCount: number }> => {
  return await request.post(`/api/templates/${templateId}/batch-create/tasks`, {
    projectId,
    count,
    ...options
  });
};

// ========== 项目模板 (TP-007) ==========

// 获取项目模板列表
export const getProjectTemplates = async (params?: TemplateQueryParams): Promise<PaginatedResult<Template>> => {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, Array.isArray(value) ? value.join(',') : String(value));
      }
    });
  }
  return await request.get<PaginatedResult<Template>>(`/api/templates/projects?${queryParams}`);
};

// 获取项目模板类型
export const getProjectTemplateTypes = async (): Promise<Array<{ value: string; label: string; description: string }>> => {
  return await request.get('/api/templates/projects/types');
};

// 验证项目模板
export const validateProjectTemplate = async (templateId: number): Promise<{
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}> => {
  return await request.get(`/api/templates/projects/${templateId}/validate`);
};

// ========== 模板统计 (TP-008) ==========

// 获取模板统计概览
export const getTemplateStats = async (): Promise<TemplateStats> => {
  return await request.get<TemplateStats>('/api/templates/stats');
};

// 获取模板使用记录
export const getTemplateUsageHistory = async (params?: {
  templateId?: number;
  userId?: number;
  type?: TemplateType;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResult<TemplateUsageRecord>> => {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, String(value));
    });
  }
  return await request.get<PaginatedResult<TemplateUsageRecord>>(`/api/templates/usage?${queryParams}`);
};

// 获取热门模板
export const getPopularTemplates = async (type?: TemplateType, limit = 10): Promise<Template[]> => {
  let url = `/api/templates/popular?limit=${limit}`;
  if (type) url += `&type=${type}`;
  return await request.get<Template[]>(url);
};

// 获取最近使用的模板
export const getRecentlyUsedTemplates = async (limit = 10): Promise<Template[]> => {
  return await request.get<Template[]>(`/api/templates/recent?limit=${limit}`);
};

// 获取推荐模板
export const getRecommendedTemplates = async (context?: {
  projectType?: string;
  taskType?: string;
  keywords?: string[];
}): Promise<Template[]> => {
  return await request.post<Template[]>('/api/templates/recommend', context);
};

// 获取模板使用趋势
export const getTemplateUsageTrend = async (params: {
  templateId?: number;
  type?: TemplateType;
  period: 'day' | 'week' | 'month';
  startDate: string;
  endDate: string;
}): Promise<Array<{ date: string; count: number }>> => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) queryParams.append(key, String(value));
  });
  return await request.get(`/api/templates/stats/trend?${queryParams}`);
};

// 评价模板
export const rateTemplate = async (templateId: number, rating: number, comment?: string): Promise<boolean> => {
  await request.post(`/api/templates/${templateId}/rate`, { rating, comment });
  return true;
};

// 获取模板评价
export const getTemplateReviews = async (templateId: number, page = 1, pageSize = 10): Promise<PaginatedResult<TemplateReview>> => {
  return await request.get<PaginatedResult<TemplateReview>>(
    `/api/templates/${templateId}/reviews?page=${page}&pageSize=${pageSize}`
  );
};

// ========== 通用查询 ==========

// 搜索模板
export const searchTemplates = async (params: TemplateQueryParams): Promise<PaginatedResult<Template>> => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, Array.isArray(value) ? value.join(',') : String(value));
    }
  });
  return await request.get<PaginatedResult<Template>>(`/api/templates/search?${queryParams}`);
};

// 获取我的模板
export const getMyTemplates = async (params?: TemplateQueryParams): Promise<PaginatedResult<Template>> => {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, Array.isArray(value) ? value.join(',') : String(value));
      }
    });
  }
  return await request.get<PaginatedResult<Template>>(`/api/templates/my?${queryParams}`);
};

// 导出模板
export const exportTemplate = async (templateId: number, format: 'json' | 'yaml'): Promise<string> => {
  return await request.get<string>(`/api/templates/${templateId}/export?format=${format}`);
};

// 导入模板
export const importTemplate = async (data: string, format: 'json' | 'yaml'): Promise<Template> => {
  return await request.post<Template>('/api/templates/import', { data, format });
};

// ========== 辅助函数 ==========

// 解析模板内容
export const parseTemplateContent = <T>(content: string): T => {
  try {
    return JSON.parse(content);
  } catch {
    return {} as T;
  }
};

// 序列化模板内容
export const stringifyTemplateContent = (content: unknown): string => {
  return JSON.stringify(content, null, 2);
};

// 获取模板类型标签
export const getTemplateTypeLabel = (type: TemplateType): string => {
  const labels: Record<TemplateType, string> = {
    document: '文档模板',
    task: '任务模板',
    project: '项目模板',
    workflow: '工作流模板'
  };
  return labels[type] || type;
};

// 获取模板来源标签
export const getTemplateSourceLabel = (source: TemplateSource): string => {
  const labels: Record<TemplateSource, string> = {
    system: '系统预置',
    custom: '自定义',
    shared: '团队共享'
  };
  return labels[source] || source;
};