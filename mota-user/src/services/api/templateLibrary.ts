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
  try {
    let url = '/api/templates/system';
    if (type) url += `?type=${type}`;
    return await request.get<Template[]>(url);
  } catch {
    // 返回模拟数据
    return mockSystemTemplates.filter(t => !type || t.type === type);
  }
};

// 获取系统模板详情
export const getSystemTemplate = async (id: number): Promise<Template> => {
  try {
    return await request.get<Template>(`/api/templates/system/${id}`);
  } catch {
    const template = mockSystemTemplates.find(t => t.id === id);
    if (!template) throw new Error('Template not found');
    return template;
  }
};

// ========== 自定义模板 (TP-002) ==========

// 创建自定义模板
export const createTemplate = async (template: Partial<Template>): Promise<Template> => {
  try {
    return await request.post<Template>('/api/templates', template);
  } catch {
    const newTemplate: Template = {
      id: Date.now(),
      name: template.name || '新模板',
      description: template.description,
      type: template.type || 'document',
      source: 'custom',
      status: 'draft',
      category: template.category || '未分类',
      tags: template.tags || [],
      content: template.content || '{}',
      useCount: 0,
      rating: 0,
      ratingCount: 0,
      isPublic: false,
      creatorId: 1,
      creatorName: '当前用户',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return newTemplate;
  }
};

// 更新模板
export const updateTemplate = async (id: number, template: Partial<Template>): Promise<Template> => {
  try {
    return await request.put<Template>(`/api/templates/${id}`, template);
  } catch {
    return { ...mockSystemTemplates[0], ...template, id, updatedAt: new Date().toISOString() };
  }
};

// 删除模板
export const deleteTemplate = async (id: number): Promise<boolean> => {
  try {
    await request.del(`/api/templates/${id}`);
    return true;
  } catch {
    return true;
  }
};

// 复制模板
export const duplicateTemplate = async (id: number, name?: string): Promise<Template> => {
  try {
    return await request.post<Template>(`/api/templates/${id}/duplicate`, { name });
  } catch {
    const original = mockSystemTemplates.find(t => t.id === id);
    if (!original) throw new Error('Template not found');
    return {
      ...original,
      id: Date.now(),
      name: name || `${original.name} (副本)`,
      source: 'custom',
      useCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
};

// 从现有内容创建模板
export const createTemplateFromContent = async (
  type: TemplateType,
  sourceId: number,
  templateInfo: { name: string; description?: string; category?: string; tags?: string[] }
): Promise<Template> => {
  try {
    return await request.post<Template>(`/api/templates/from-content`, {
      type,
      sourceId,
      ...templateInfo
    });
  } catch {
    return {
      id: Date.now(),
      name: templateInfo.name,
      description: templateInfo.description,
      type,
      source: 'custom',
      status: 'draft',
      category: templateInfo.category || '未分类',
      tags: templateInfo.tags || [],
      content: '{}',
      useCount: 0,
      rating: 0,
      ratingCount: 0,
      isPublic: false,
      creatorId: 1,
      creatorName: '当前用户',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
};

// ========== 模板分类 (TP-003) ==========

// 获取所有分类
export const getCategories = async (type?: TemplateType): Promise<TemplateCategory[]> => {
  try {
    let url = '/api/templates/categories';
    if (type) url += `?type=${type}`;
    return await request.get<TemplateCategory[]>(url);
  } catch {
    return mockCategories.filter(c => !type || c.name.includes(type));
  }
};

// 创建分类
export const createCategory = async (category: Partial<TemplateCategory>): Promise<TemplateCategory> => {
  try {
    return await request.post<TemplateCategory>('/api/templates/categories', category);
  } catch {
    return {
      id: Date.now(),
      name: category.name || '新分类',
      description: category.description,
      icon: category.icon,
      color: category.color,
      parentId: category.parentId,
      templateCount: 0,
      order: mockCategories.length,
      createdAt: new Date().toISOString()
    };
  }
};

// 更新分类
export const updateCategory = async (id: number, category: Partial<TemplateCategory>): Promise<TemplateCategory> => {
  try {
    return await request.put<TemplateCategory>(`/api/templates/categories/${id}`, category);
  } catch {
    const existing = mockCategories.find(c => c.id === id);
    return { ...existing!, ...category };
  }
};

// 删除分类
export const deleteCategory = async (id: number): Promise<boolean> => {
  try {
    await request.del(`/api/templates/categories/${id}`);
    return true;
  } catch {
    return true;
  }
};

// 获取分类树
export const getCategoryTree = async (): Promise<TemplateCategory[]> => {
  try {
    return await request.get<TemplateCategory[]>('/api/templates/categories/tree');
  } catch {
    return mockCategories;
  }
};

// ========== 模板共享 (TP-004) ==========

// 共享模板给团队
export const shareTemplateWithTeam = async (templateId: number, teamIds: number[]): Promise<boolean> => {
  try {
    await request.post(`/api/templates/${templateId}/share/teams`, { teamIds });
    return true;
  } catch {
    return true;
  }
};

// 共享模板给用户
export const shareTemplateWithUsers = async (templateId: number, userIds: number[]): Promise<boolean> => {
  try {
    await request.post(`/api/templates/${templateId}/share/users`, { userIds });
    return true;
  } catch {
    return true;
  }
};

// 设置模板公开状态
export const setTemplatePublic = async (templateId: number, isPublic: boolean): Promise<boolean> => {
  try {
    await request.put(`/api/templates/${templateId}/public`, { isPublic });
    return true;
  } catch {
    return true;
  }
};

// 获取共享设置
export const getShareSettings = async (templateId: number): Promise<TemplateShareSettings> => {
  try {
    return await request.get<TemplateShareSettings>(`/api/templates/${templateId}/share`);
  } catch {
    return {
      isPublic: false,
      sharedWithTeams: [],
      sharedWithUsers: [],
      allowCopy: true,
      allowModify: false
    };
  }
};

// 更新共享设置
export const updateShareSettings = async (templateId: number, settings: TemplateShareSettings): Promise<boolean> => {
  try {
    await request.put(`/api/templates/${templateId}/share`, settings);
    return true;
  } catch {
    return true;
  }
};

// 获取团队共享的模板
export const getTeamSharedTemplates = async (teamId: number): Promise<Template[]> => {
  try {
    return await request.get<Template[]>(`/api/templates/shared/team/${teamId}`);
  } catch {
    return mockSystemTemplates.filter(t => t.source === 'shared');
  }
};

// 获取用户可用的共享模板
export const getAvailableSharedTemplates = async (): Promise<Template[]> => {
  try {
    return await request.get<Template[]>('/api/templates/shared/available');
  } catch {
    return mockSystemTemplates.filter(t => t.isPublic || t.source === 'shared');
  }
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
  try {
    return await request.post(`/api/templates/${templateId}/create/document`, options);
  } catch {
    return {
      documentId: Date.now(),
      documentName: options.name || '新文档'
    };
  }
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
  try {
    return await request.post(`/api/templates/${templateId}/create/task`, options);
  } catch {
    return {
      taskId: Date.now(),
      taskName: '新任务'
    };
  }
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
  try {
    return await request.post(`/api/templates/${templateId}/create/project`, options);
  } catch {
    return {
      projectId: Date.now(),
      projectName: options.name
    };
  }
};

// 预览模板应用效果
export const previewTemplateApplication = async (
  templateId: number,
  variables?: Record<string, string>
): Promise<{ preview: string; warnings?: string[] }> => {
  try {
    return await request.post(`/api/templates/${templateId}/preview`, { variables });
  } catch {
    return {
      preview: '模板预览内容',
      warnings: []
    };
  }
};

// 获取模板变量
export const getTemplateVariables = async (templateId: number): Promise<Array<{
  name: string;
  label: string;
  type: string;
  required: boolean;
  defaultValue?: string;
}>> => {
  try {
    return await request.get(`/api/templates/${templateId}/variables`);
  } catch {
    return [
      { name: 'projectName', label: '项目名称', type: 'text', required: true },
      { name: 'date', label: '日期', type: 'date', required: false, defaultValue: new Date().toISOString().split('T')[0] }
    ];
  }
};

// ========== 任务模板 (TP-006) ==========

// 获取任务模板列表
export const getTaskTemplates = async (params?: TemplateQueryParams): Promise<PaginatedResult<Template>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, Array.isArray(value) ? value.join(',') : String(value));
        }
      });
    }
    return await request.get<PaginatedResult<Template>>(`/api/templates/tasks?${queryParams}`);
  } catch {
    const filtered = mockSystemTemplates.filter(t => t.type === 'task');
    return {
      items: filtered,
      total: filtered.length,
      page: 1,
      pageSize: 20,
      totalPages: 1
    };
  }
};

// 获取任务模板分类
export const getTaskTemplateCategories = async (): Promise<string[]> => {
  try {
    return await request.get<string[]>('/api/templates/tasks/categories');
  } catch {
    return ['开发任务', '测试任务', '设计任务', '运维任务', '会议任务'];
  }
};

// 批量从任务模板创建任务
export const batchCreateTasksFromTemplate = async (
  templateId: number,
  projectId: number,
  count: number,
  options?: { assigneeIds?: number[]; startDate?: string }
): Promise<{ taskIds: number[]; successCount: number }> => {
  try {
    return await request.post(`/api/templates/${templateId}/batch-create/tasks`, {
      projectId,
      count,
      ...options
    });
  } catch {
    return {
      taskIds: Array.from({ length: count }, (_, i) => Date.now() + i),
      successCount: count
    };
  }
};

// ========== 项目模板 (TP-007) ==========

// 获取项目模板列表
export const getProjectTemplates = async (params?: TemplateQueryParams): Promise<PaginatedResult<Template>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, Array.isArray(value) ? value.join(',') : String(value));
        }
      });
    }
    return await request.get<PaginatedResult<Template>>(`/api/templates/projects?${queryParams}`);
  } catch {
    const filtered = mockSystemTemplates.filter(t => t.type === 'project');
    return {
      items: filtered,
      total: filtered.length,
      page: 1,
      pageSize: 20,
      totalPages: 1
    };
  }
};

// 获取项目模板类型
export const getProjectTemplateTypes = async (): Promise<Array<{ value: string; label: string; description: string }>> => {
  try {
    return await request.get('/api/templates/projects/types');
  } catch {
    return [
      { value: 'agile', label: '敏捷开发', description: '适用于敏捷开发团队的项目模板' },
      { value: 'waterfall', label: '瀑布模型', description: '传统瀑布式开发项目模板' },
      { value: 'kanban', label: '看板项目', description: '基于看板的项目管理模板' },
      { value: 'marketing', label: '营销活动', description: '营销活动项目模板' },
      { value: 'product', label: '产品开发', description: '产品开发全流程模板' }
    ];
  }
};

// 验证项目模板
export const validateProjectTemplate = async (templateId: number): Promise<{
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}> => {
  try {
    return await request.get(`/api/templates/projects/${templateId}/validate`);
  } catch {
    return { valid: true, warnings: [] };
  }
};

// ========== 模板统计 (TP-008) ==========

// 获取模板统计概览
export const getTemplateStats = async (): Promise<TemplateStats> => {
  try {
    return await request.get<TemplateStats>('/api/templates/stats');
  } catch {
    return mockStats;
  }
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
  try {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }
    return await request.get<PaginatedResult<TemplateUsageRecord>>(`/api/templates/usage?${queryParams}`);
  } catch {
    return {
      items: mockUsageRecords,
      total: mockUsageRecords.length,
      page: 1,
      pageSize: 20,
      totalPages: 1
    };
  }
};

// 获取热门模板
export const getPopularTemplates = async (type?: TemplateType, limit = 10): Promise<Template[]> => {
  try {
    let url = `/api/templates/popular?limit=${limit}`;
    if (type) url += `&type=${type}`;
    return await request.get<Template[]>(url);
  } catch {
    return mockSystemTemplates
      .filter(t => !type || t.type === type)
      .sort((a, b) => b.useCount - a.useCount)
      .slice(0, limit);
  }
};

// 获取最近使用的模板
export const getRecentlyUsedTemplates = async (limit = 10): Promise<Template[]> => {
  try {
    return await request.get<Template[]>(`/api/templates/recent?limit=${limit}`);
  } catch {
    return mockSystemTemplates.slice(0, limit);
  }
};

// 获取推荐模板
export const getRecommendedTemplates = async (context?: {
  projectType?: string;
  taskType?: string;
  keywords?: string[];
}): Promise<Template[]> => {
  try {
    return await request.post<Template[]>('/api/templates/recommend', context);
  } catch {
    return mockSystemTemplates.slice(0, 5);
  }
};

// 获取模板使用趋势
export const getTemplateUsageTrend = async (params: {
  templateId?: number;
  type?: TemplateType;
  period: 'day' | 'week' | 'month';
  startDate: string;
  endDate: string;
}): Promise<Array<{ date: string; count: number }>> => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, String(value));
    });
    return await request.get(`/api/templates/stats/trend?${queryParams}`);
  } catch {
    const days = 7;
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i - 1) * 86400000).toISOString().split('T')[0],
      count: Math.floor(Math.random() * 50) + 10
    }));
  }
};

// 评价模板
export const rateTemplate = async (templateId: number, rating: number, comment?: string): Promise<boolean> => {
  try {
    await request.post(`/api/templates/${templateId}/rate`, { rating, comment });
    return true;
  } catch {
    return true;
  }
};

// 获取模板评价
export const getTemplateReviews = async (templateId: number, page = 1, pageSize = 10): Promise<PaginatedResult<TemplateReview>> => {
  try {
    return await request.get<PaginatedResult<TemplateReview>>(
      `/api/templates/${templateId}/reviews?page=${page}&pageSize=${pageSize}`
    );
  } catch {
    return {
      items: mockReviews,
      total: mockReviews.length,
      page: 1,
      pageSize: 10,
      totalPages: 1
    };
  }
};

// ========== 通用查询 ==========

// 搜索模板
export const searchTemplates = async (params: TemplateQueryParams): Promise<PaginatedResult<Template>> => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, Array.isArray(value) ? value.join(',') : String(value));
      }
    });
    return await request.get<PaginatedResult<Template>>(`/api/templates/search?${queryParams}`);
  } catch {
    let filtered = [...mockSystemTemplates];
    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(kw) || 
        t.description?.toLowerCase().includes(kw)
      );
    }
    if (params.type) {
      filtered = filtered.filter(t => t.type === params.type);
    }
    if (params.source) {
      filtered = filtered.filter(t => t.source === params.source);
    }
    if (params.category) {
      filtered = filtered.filter(t => t.category === params.category);
    }
    return {
      items: filtered,
      total: filtered.length,
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      totalPages: Math.ceil(filtered.length / (params.pageSize || 20))
    };
  }
};

// 获取我的模板
export const getMyTemplates = async (params?: TemplateQueryParams): Promise<PaginatedResult<Template>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, Array.isArray(value) ? value.join(',') : String(value));
        }
      });
    }
    return await request.get<PaginatedResult<Template>>(`/api/templates/my?${queryParams}`);
  } catch {
    const filtered = mockSystemTemplates.filter(t => t.source === 'custom');
    return {
      items: filtered,
      total: filtered.length,
      page: 1,
      pageSize: 20,
      totalPages: 1
    };
  }
};

// 导出模板
export const exportTemplate = async (templateId: number, format: 'json' | 'yaml'): Promise<string> => {
  try {
    return await request.get<string>(`/api/templates/${templateId}/export?format=${format}`);
  } catch {
    const template = mockSystemTemplates.find(t => t.id === templateId);
    return JSON.stringify(template, null, 2);
  }
};

// 导入模板
export const importTemplate = async (data: string, format: 'json' | 'yaml'): Promise<Template> => {
  try {
    return await request.post<Template>('/api/templates/import', { data, format });
  } catch {
    const parsed = JSON.parse(data);
    return {
      ...parsed,
      id: Date.now(),
      source: 'custom',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
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

// ========== 模拟数据 ==========

const mockSystemTemplates: Template[] = [
  {
    id: 1,
    name: '需求文档模板',
    description: '标准的产品需求文档模板，包含背景、目标、功能需求、非功能需求等章节',
    type: 'document',
    source: 'system',
    status: 'published',
    category: '产品文档',
    tags: ['需求', 'PRD', '产品'],
    content: JSON.stringify({
      title: '产品需求文档',
      format: 'markdown',
      sections: [
        { title: '1. 背景', content: '## 背景\n\n请描述项目背景...', order: 1 },
        { title: '2. 目标', content: '## 目标\n\n请描述项目目标...', order: 2 },
        { title: '3. 功能需求', content: '## 功能需求\n\n### 3.1 功能列表\n\n| 功能 | 描述 | 优先级 |\n|------|------|--------|\n| | | |', order: 3 },
        { title: '4. 非功能需求', content: '## 非功能需求\n\n### 4.1 性能要求\n\n### 4.2 安全要求', order: 4 }
      ],
      variables: [
        { name: 'projectName', label: '项目名称', type: 'text', required: true },
        { name: 'version', label: '版本号', type: 'text', defaultValue: '1.0.0' },
        { name: 'author', label: '作者', type: 'text', required: true }
      ]
    }),
    thumbnail: '/templates/prd-template.png',
    useCount: 1256,
    rating: 4.8,
    ratingCount: 89,
    isPublic: true,
    creatorId: 0,
    creatorName: '系统',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: '技术设计文档模板',
    description: '技术方案设计文档模板，包含架构设计、接口设计、数据库设计等',
    type: 'document',
    source: 'system',
    status: 'published',
    category: '技术文档',
    tags: ['技术', '设计', '架构'],
    content: JSON.stringify({
      title: '技术设计文档',
      format: 'markdown',
      sections: [
        { title: '1. 概述', content: '## 概述\n\n### 1.1 文档目的\n\n### 1.2 术语定义', order: 1 },
        { title: '2. 架构设计', content: '## 架构设计\n\n### 2.1 系统架构图\n\n### 2.2 模块说明', order: 2 },
        { title: '3. 接口设计', content: '## 接口设计\n\n### 3.1 接口列表\n\n### 3.2 接口详情', order: 3 },
        { title: '4. 数据库设计', content: '## 数据库设计\n\n### 4.1 ER图\n\n### 4.2 表结构', order: 4 }
      ]
    }),
    useCount: 892,
    rating: 4.6,
    ratingCount: 56,
    isPublic: true,
    creatorId: 0,
    creatorName: '系统',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 3,
    name: '会议纪要模板',
    description: '标准会议纪要模板，记录会议时间、参与人、议题和决议',
    type: 'document',
    source: 'system',
    status: 'published',
    category: '办公文档',
    tags: ['会议', '纪要'],
    content: JSON.stringify({
      title: '会议纪要',
      format: 'markdown',
      variables: [
        { name: 'meetingTitle', label: '会议主题', type: 'text', required: true },
        { name: 'meetingDate', label: '会议日期', type: 'date', required: true },
        { name: 'attendees', label: '参会人员', type: 'text', required: true }
      ]
    }),
    useCount: 2341,
    rating: 4.9,
    ratingCount: 156,
    isPublic: true,
    creatorId: 0,
    creatorName: '系统',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 4,
    name: '功能开发任务模板',
    description: '标准功能开发任务模板，包含需求分析、设计、开发、测试等子任务',
    type: 'task',
    source: 'system',
    status: 'published',
    category: '开发任务',
    tags: ['开发', '功能'],
    content: JSON.stringify({
      title: '功能开发',
      description: '完成功能的开发工作',
      priority: 'medium',
      estimatedHours: 40,
      subtasks: [
        { title: '需求分析', estimatedHours: 4 },
        { title: '技术设计', estimatedHours: 8 },
        { title: '编码实现', estimatedHours: 20 },
        { title: '单元测试', estimatedHours: 4 },
        { title: '代码评审', estimatedHours: 2 },
        { title: '文档更新', estimatedHours: 2 }
      ],
      checklist: [
        { title: '开发检查', items: ['代码规范检查', '单元测试覆盖率', '接口文档更新'] },
        { title: '提测检查', items: ['功能自测通过', '测试用例准备', '环境部署完成'] }
      ]
    }),
    useCount: 1567,
    rating: 4.7,
    ratingCount: 98,
    isPublic: true,
    creatorId: 0,
    creatorName: '系统',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 5,
    name: 'Bug修复任务模板',
    description: 'Bug修复任务模板，包含问题分析、修复、验证等步骤',
    type: 'task',
    source: 'system',
    status: 'published',
    category: '开发任务',
    tags: ['Bug', '修复'],
    content: JSON.stringify({
      title: 'Bug修复',
      priority: 'high',
      estimatedHours: 8,
      subtasks: [
        { title: '问题复现', estimatedHours: 1 },
        { title: '原因分析', estimatedHours: 2 },
        { title: '修复实现', estimatedHours: 3 },
        { title: '回归测试', estimatedHours: 2 }
      ],
      checklist: [
        { title: '修复检查', items: ['问题已复现', '根因已定位', '修复方案已评审', '回归测试通过'] }
      ]
    }),
    useCount: 2134,
    rating: 4.8,
    ratingCount: 134,
    isPublic: true,
    creatorId: 0,
    creatorName: '系统',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 6,
    name: '敏捷开发项目模板',
    description: '适用于敏捷开发团队的项目模板，包含Sprint规划、每日站会等',
    type: 'project',
    source: 'system',
    status: 'published',
    category: '敏捷项目',
    tags: ['敏捷', 'Scrum', 'Sprint'],
    content: JSON.stringify({
      name: '敏捷开发项目',
      type: 'agile',
      milestones: [
        { name: 'Sprint 1', daysFromStart: 14 },
        { name: 'Sprint 2', daysFromStart: 28 },
        { name: 'Sprint 3', daysFromStart: 42 },
        { name: '发布', daysFromStart: 56 }
      ],
      roles: [
        { name: '产品负责人', permissions: ['manage_backlog', 'approve_stories'] },
        { name: 'Scrum Master', permissions: ['manage_sprint', 'facilitate_meetings'] },
        { name: '开发人员', permissions: ['update_tasks', 'commit_code'] }
      ],
      workflows: [
        { name: '任务流程', stages: ['待办', '进行中', '评审中', '测试中', '完成'] }
      ]
    }),
    useCount: 567,
    rating: 4.5,
    ratingCount: 45,
    isPublic: true,
    creatorId: 0,
    creatorName: '系统',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 7,
    name: '产品发布项目模板',
    description: '产品发布项目模板，包含开发、测试、发布等阶段',
    type: 'project',
    source: 'system',
    status: 'published',
    category: '产品项目',
    tags: ['产品', '发布'],
    content: JSON.stringify({
      name: '产品发布项目',
      type: 'product',
      milestones: [
        { name: '需求确认', daysFromStart: 7 },
        { name: '设计完成', daysFromStart: 21 },
        { name: '开发完成', daysFromStart: 49 },
        { name: '测试完成', daysFromStart: 63 },
        { name: '正式发布', daysFromStart: 70 }
      ],
      defaultTasks: [
        { title: '需求评审', priority: 'high' },
        { title: 'UI设计', priority: 'high' },
        { title: '技术方案设计', priority: 'high' },
        { title: '功能开发', priority: 'medium' },
        { title: '集成测试', priority: 'medium' },
        { title: '发布准备', priority: 'high' }
      ]
    }),
    useCount: 423,
    rating: 4.6,
    ratingCount: 38,
    isPublic: true,
    creatorId: 0,
    creatorName: '系统',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 8,
    name: '标准审批工作流模板',
    description: '通用审批工作流模板，支持多级审批',
    type: 'workflow',
    source: 'system',
    status: 'published',
    category: '审批流程',
    tags: ['审批', '工作流'],
    content: JSON.stringify({
      name: '标准审批流程',
      stages: [
        { name: '待提交', order: 1, color: '#8c8c8c' },
        { name: '待审批', order: 2, color: '#1890ff' },
        { name: '审批中', order: 3, color: '#faad14' },
        { name: '已通过', order: 4, color: '#52c41a' },
        { name: '已拒绝', order: 5, color: '#ff4d4f' }
      ],
      triggers: [
        { event: 'submit', action: 'notify_approver' },
        { event: 'approve', action: 'notify_submitter' },
        { event: 'reject', action: 'notify_submitter' }
      ]
    }),
    useCount: 789,
    rating: 4.4,
    ratingCount: 52,
    isPublic: true,
    creatorId: 0,
    creatorName: '系统',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const mockCategories: TemplateCategory[] = [
  { id: 1, name: '产品文档', description: '产品相关文档模板', icon: 'file-text', color: '#1890ff', templateCount: 5, order: 1, createdAt: '2024-01-01' },
  { id: 2, name: '技术文档', description: '技术相关文档模板', icon: 'code', color: '#52c41a', templateCount: 8, order: 2, createdAt: '2024-01-01' },
  { id: 3, name: '办公文档', description: '日常办公文档模板', icon: 'file', color: '#faad14', templateCount: 6, order: 3, createdAt: '2024-01-01' },
  { id: 4, name: '开发任务', description: '开发相关任务模板', icon: 'tool', color: '#722ed1', templateCount: 10, order: 4, createdAt: '2024-01-01' },
  { id: 5, name: '测试任务', description: '测试相关任务模板', icon: 'bug', color: '#eb2f96', templateCount: 4, order: 5, createdAt: '2024-01-01' },
  { id: 6, name: '敏捷项目', description: '敏捷开发项目模板', icon: 'thunderbolt', color: '#13c2c2', templateCount: 3, order: 6, createdAt: '2024-01-01' },
  { id: 7, name: '产品项目', description: '产品开发项目模板', icon: 'rocket', color: '#fa541c', templateCount: 4, order: 7, createdAt: '2024-01-01' },
  { id: 8, name: '审批流程', description: '审批工作流模板', icon: 'audit', color: '#2f54eb', templateCount: 5, order: 8, createdAt: '2024-01-01' }
];

const mockStats: TemplateStats = {
  totalTemplates: 45,
  systemTemplates: 20,
  customTemplates: 18,
  sharedTemplates: 7,
  documentTemplates: 15,
  taskTemplates: 12,
  projectTemplates: 10,
  workflowTemplates: 8,
  totalUseCount: 12567,
  averageRating: 4.6,
  topCategories: [
    { name: '开发任务', count: 10 },
    { name: '技术文档', count: 8 },
    { name: '产品文档', count: 5 }
  ],
  recentlyUsed: mockSystemTemplates.slice(0, 5),
  popularTemplates: mockSystemTemplates.slice(0, 5),
  trendingTemplates: mockSystemTemplates.slice(2, 7)
};

const mockUsageRecords: TemplateUsageRecord[] = [
  { id: 1, templateId: 1, templateName: '需求文档模板', templateType: 'document', userId: 1, userName: '张三', createdItemId: 101, createdItemType: 'document', createdAt: '2024-01-15T10:30:00Z' },
  { id: 2, templateId: 4, templateName: '功能开发任务模板', templateType: 'task', userId: 2, userName: '李四', createdItemId: 201, createdItemType: 'task', createdAt: '2024-01-15T09:20:00Z' },
  { id: 3, templateId: 6, templateName: '敏捷开发项目模板', templateType: 'project', userId: 1, userName: '张三', createdItemId: 301, createdItemType: 'project', createdAt: '2024-01-14T16:45:00Z' }
];

const mockReviews: TemplateReview[] = [
  { id: 1, templateId: 1, userId: 1, userName: '张三', rating: 5, comment: '非常实用的模板，节省了很多时间', createdAt: '2024-01-15T10:30:00Z' },
  { id: 2, templateId: 1, userId: 2, userName: '李四', rating: 4, comment: '模板结构清晰，建议增加更多示例', createdAt: '2024-01-14T14:20:00Z' }
];