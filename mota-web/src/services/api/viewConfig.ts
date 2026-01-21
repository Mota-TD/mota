import request from '../request';

// 视图配置类型定义
export interface ViewConfig {
  id: number;
  userId: number;
  viewType: ViewType;
  name: string;
  description?: string;
  config: ViewConfigData;
  isDefault: boolean;
  isShared: boolean;
  projectId?: number;
  createdAt: string;
  updatedAt: string;
}

// 视图类型
export type ViewType = 'project' | 'task' | 'calendar' | 'kanban' | 'gantt';

// 视图配置数据结构
export interface ViewConfigData {
  filters?: Record<string, unknown>;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  columns?: string[];
  groupBy?: string;
  showCompleted?: boolean;
  dateRange?: {
    start?: string;
    end?: string;
  };
  [key: string]: unknown;
}

// ========== 视图配置CRUD ==========

export const createViewConfig = (config: Partial<ViewConfig>) => {
  return request.post<ViewConfig>('/api/v1/view-configs', config);
};

export const updateViewConfig = (id: number, config: Partial<ViewConfig>) => {
  return request.put<ViewConfig>(`/api/v1/view-configs/${id}`, config);
};

export const deleteViewConfig = (id: number) => {
  return request.del<boolean>(`/api/v1/view-configs/${id}`);
};

export const getViewConfig = (id: number) => {
  return request.get<ViewConfig>(`/api/v1/view-configs/${id}`);
};

// ========== 视图配置查询 ==========

export const getUserViewConfigs = (userId: number) => {
  return request.get<ViewConfig[]>(`/api/v1/view-configs/user/${userId}`);
};

export const getUserViewConfigsByType = (userId: number, viewType: ViewType) => {
  return request.get<ViewConfig[]>(`/api/v1/view-configs/user/${userId}/type/${viewType}`);
};

export const getDefaultViewConfig = (userId: number, viewType: ViewType) => {
  return request.get<ViewConfig>(`/api/v1/view-configs/user/${userId}/type/${viewType}/default`);
};

export const getProjectViewConfigs = (projectId: number) => {
  return request.get<ViewConfig[]>(`/api/v1/view-configs/project/${projectId}`);
};

export const getSharedViewConfigs = (viewType?: ViewType) => {
  let url = '/api/v1/view-configs/shared';
  if (viewType) url += `?viewType=${viewType}`;
  return request.get<ViewConfig[]>(url);
};

// ========== 视图配置管理 ==========

export const setDefaultViewConfig = (id: number, userId: number, viewType: ViewType) => {
  return request.put<void>(`/api/v1/view-configs/${id}/default?userId=${userId}&viewType=${viewType}`);
};

export const unsetDefaultViewConfig = (userId: number, viewType: ViewType) => {
  return request.del<void>(`/api/v1/view-configs/user/${userId}/type/${viewType}/default`);
};

export const setViewConfigShared = (id: number, isShared: boolean) => {
  return request.put<void>(`/api/v1/view-configs/${id}/shared?isShared=${isShared}`);
};

export const isViewNameExists = (userId: number, name: string) => {
  return request.get<boolean>(`/api/v1/view-configs/check-name?userId=${userId}&name=${encodeURIComponent(name)}`);
};

// ========== 视图配置快捷操作 ==========

export const saveCurrentView = (userId: number, viewType: ViewType, name: string, config: ViewConfigData) => {
  return request.post<ViewConfig>(`/api/v1/view-configs/save-current?userId=${userId}&viewType=${viewType}&name=${encodeURIComponent(name)}`, config);
};

export const applyViewConfig = (id: number) => {
  return request.get<ViewConfigData>(`/api/v1/view-configs/${id}/apply`);
};

export const duplicateViewConfig = (id: number, newName?: string) => {
  let url = `/api/v1/view-configs/${id}/duplicate`;
  if (newName) url += `?newName=${encodeURIComponent(newName)}`;
  return request.post<ViewConfig>(url);
};

export const resetToDefault = (userId: number, viewType: ViewType) => {
  return request.del<void>(`/api/v1/view-configs/user/${userId}/type/${viewType}/reset`);
};

// ========== 辅助函数 ==========

/**
 * 获取视图类型的显示名称
 */
export const getViewTypeLabel = (viewType: ViewType): string => {
  const labels: Record<ViewType, string> = {
    project: '项目视图',
    task: '任务视图',
    calendar: '日历视图',
    kanban: '看板视图',
    gantt: '甘特图视图'
  };
  return labels[viewType] || viewType;
};

/**
 * 获取视图类型的图标
 */
export const getViewTypeIcon = (viewType: ViewType): string => {
  const icons: Record<ViewType, string> = {
    project: 'ProjectOutlined',
    task: 'UnorderedListOutlined',
    calendar: 'CalendarOutlined',
    kanban: 'AppstoreOutlined',
    gantt: 'BarChartOutlined'
  };
  return icons[viewType] || 'FileOutlined';
};

/**
 * 创建默认视图配置
 */
export const createDefaultViewConfigData = (viewType: ViewType): ViewConfigData => {
  const defaults: Record<ViewType, ViewConfigData> = {
    project: {
      filters: {},
      sort: { field: 'updatedAt', order: 'desc' },
      columns: ['name', 'status', 'progress', 'owner', 'dueDate']
    },
    task: {
      filters: {},
      sort: { field: 'priority', order: 'desc' },
      columns: ['name', 'status', 'priority', 'assignee', 'dueDate'],
      showCompleted: false
    },
    calendar: {
      filters: {},
      dateRange: {}
    },
    kanban: {
      filters: {},
      groupBy: 'status'
    },
    gantt: {
      filters: {},
      dateRange: {}
    }
  };
  return defaults[viewType] || { filters: {} };
};

/**
 * 合并视图配置
 */
export const mergeViewConfig = (base: ViewConfigData, override: Partial<ViewConfigData>): ViewConfigData => {
  return {
    ...base,
    ...override,
    filters: {
      ...base.filters,
      ...override.filters
    }
  };
};

/**
 * 视图配置是否有变化
 */
export const hasViewConfigChanged = (original: ViewConfigData, current: ViewConfigData): boolean => {
  return JSON.stringify(original) !== JSON.stringify(current);
};