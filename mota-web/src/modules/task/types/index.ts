/**
 * 任务模块类型定义
 * 重新导出现有 API 类型并扩展模块特定类型
 */

// 从现有 API 重新导出类型
export {
  TaskStatus,
  Priority as TaskPriority,
  type Task,
  type TaskListResponse,
  type CreateTaskRequest,
  type UpdateTaskRequest,
  type TaskQueryParams,
  type StatusCount as TaskStatusCount,
  type TodoTask,
} from '@/services/api/task';

export {
  DepartmentTaskStatus,
  Priority as DepartmentTaskPriority,
  type DepartmentTask,
  type DepartmentTaskListResponse,
  type CreateDepartmentTaskRequest,
  type UpdateDepartmentTaskRequest,
  type DepartmentTaskQueryParams,
  type StatusCount as DepartmentTaskStatusCount,
} from '@/services/api/departmentTask';

// ============ 模块扩展类型 ============

/**
 * 子任务类型
 */
export interface Subtask {
  id: string;
  taskId: string;
  name: string;
  description?: string;
  completed: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 任务评论
 */
export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * 任务附件
 */
export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
}

/**
 * 任务依赖关系
 */
export interface TaskDependency {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
  dependencyType: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  lagDays?: number;
}

/**
 * 任务时间日志
 */
export interface TaskTimeLog {
  id: string;
  taskId: string;
  userId: string;
  userName?: string;
  startTime: string;
  endTime?: string;
  duration: number; // 分钟
  description?: string;
  createdAt: string;
}

/**
 * 任务详情（包含关联数据）
 */
export interface TaskDetail {
  task: import('@/services/api/task').Task;
  subtasks: Subtask[];
  comments: TaskComment[];
  attachments: TaskAttachment[];
  dependencies: TaskDependency[];
  timeLogs: TaskTimeLog[];
}

/**
 * 部门任务详情（包含关联数据）
 */
export interface DepartmentTaskDetail {
  departmentTask: import('@/services/api/departmentTask').DepartmentTask;
  executionTasks: import('@/services/api/task').Task[];
  totalProgress: number;
  completedCount: number;
  totalCount: number;
}

// ============ 看板相关类型 ============

/**
 * 看板列
 */
export interface KanbanColumn {
  id: string;
  title: string;
  status: import('@/services/api/task').TaskStatus;
  color: string;
  tasks: import('@/services/api/task').Task[];
  limit?: number; // WIP 限制
}

/**
 * 看板配置
 */
export interface KanbanConfig {
  columns: KanbanColumn[];
  showSubtasks: boolean;
  showAssignee: boolean;
  showDueDate: boolean;
  showPriority: boolean;
  groupBy?: 'status' | 'priority' | 'assignee';
}

/**
 * 拖拽结果
 */
export interface DragResult {
  taskId: string;
  sourceColumnId: string;
  destinationColumnId: string;
  sourceIndex: number;
  destinationIndex: number;
}

// ============ 甘特图相关类型 ============

/**
 * 甘特图任务项
 */
export interface GanttTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  type: 'task' | 'milestone' | 'project';
  dependencies?: string[];
  assignee?: string;
  color?: string;
  isDisabled?: boolean;
  styles?: {
    backgroundColor?: string;
    progressColor?: string;
  };
}

/**
 * 甘特图配置
 */
export interface GanttConfig {
  viewMode: 'day' | 'week' | 'month' | 'quarter' | 'year';
  showDependencies: boolean;
  showProgress: boolean;
  showToday: boolean;
  columnWidth: number;
  rowHeight: number;
}

// ============ 任务统计类型 ============

/**
 * 任务统计数据
 */
export interface TaskStatistics {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  overdue: number;
  completionRate: number;
  averageCompletionTime: number; // 天
}

/**
 * 部门任务统计
 */
export interface DepartmentTaskStatistics {
  total: number;
  pending: number;
  planning: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  completionRate: number;
  onTimeRate: number;
}

/**
 * 用户任务统计
 */
export interface UserTaskStatistics {
  userId: string;
  userName: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number;
  averageCompletionTime: number;
}

// ============ 任务筛选和排序 ============

/**
 * 任务筛选条件
 */
export interface TaskFilter {
  status?: import('@/services/api/task').TaskStatus[];
  priority?: import('@/services/api/task').Priority[];
  assigneeIds?: string[];
  departmentIds?: string[];
  projectIds?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  keyword?: string;
  isOverdue?: boolean;
  hasSubtasks?: boolean;
}

/**
 * 任务排序选项
 */
export interface TaskSortOption {
  field: 'name' | 'priority' | 'status' | 'startDate' | 'endDate' | 'progress' | 'createdAt' | 'updatedAt';
  order: 'asc' | 'desc';
}

// ============ 任务操作类型 ============

/**
 * 批量操作类型
 */
export type TaskBatchAction = 
  | 'delete'
  | 'archive'
  | 'changeStatus'
  | 'changePriority'
  | 'changeAssignee'
  | 'moveToDepartmentTask';

/**
 * 批量操作请求
 */
export interface TaskBatchActionRequest {
  taskIds: string[];
  action: TaskBatchAction;
  payload?: {
    status?: import('@/services/api/task').TaskStatus;
    priority?: import('@/services/api/task').Priority;
    assigneeId?: string;
    departmentTaskId?: string;
  };
}

// ============ 任务模板类型 ============

/**
 * 任务模板
 */
export interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  priority: import('@/services/api/task').Priority;
  estimatedDays: number;
  subtasks: {
    name: string;
    description?: string;
    sortOrder: number;
  }[];
  checklist?: {
    name: string;
    items: string[];
  }[];
  tags?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  isPublic: boolean;
  usageCount: number;
}

/**
 * 从模板创建任务请求
 */
export interface CreateTaskFromTemplateRequest {
  templateId: string;
  departmentTaskId: string;
  projectId: string;
  name?: string; // 覆盖模板名称
  assigneeId?: string;
  startDate: string;
  endDate?: string;
}

// ============ 任务视图配置 ============

/**
 * 任务视图类型
 */
export type TaskViewType = 'list' | 'kanban' | 'gantt' | 'calendar' | 'timeline';

/**
 * 任务视图配置
 */
export interface TaskViewConfig {
  viewType: TaskViewType;
  columns?: string[]; // 列表视图显示的列
  kanbanConfig?: KanbanConfig;
  ganttConfig?: GanttConfig;
  filter?: TaskFilter;
  sort?: TaskSortOption;
  groupBy?: 'status' | 'priority' | 'assignee' | 'departmentTask' | 'none';
}

// ============ 状态配置 ============

import { TaskStatus, Priority } from '@/services/api/task';
import { DepartmentTaskStatus } from '@/services/api/departmentTask';

/**
 * 任务状态配置
 */
export const TASK_STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; icon: string }> = {
  [TaskStatus.PENDING]: { label: '待开始', color: 'default', icon: 'clock-circle' },
  [TaskStatus.IN_PROGRESS]: { label: '进行中', color: 'processing', icon: 'sync' },
  [TaskStatus.PAUSED]: { label: '已暂停', color: 'warning', icon: 'pause-circle' },
  [TaskStatus.COMPLETED]: { label: '已完成', color: 'success', icon: 'check-circle' },
  [TaskStatus.CANCELLED]: { label: '已取消', color: 'error', icon: 'close-circle' },
};

/**
 * 部门任务状态配置
 */
export const DEPARTMENT_TASK_STATUS_CONFIG: Record<DepartmentTaskStatus, { label: string; color: string; icon: string }> = {
  [DepartmentTaskStatus.PENDING]: { label: '待分配', color: 'default', icon: 'clock-circle' },
  [DepartmentTaskStatus.PLANNING]: { label: '计划中', color: 'processing', icon: 'file-text' },
  [DepartmentTaskStatus.IN_PROGRESS]: { label: '进行中', color: 'blue', icon: 'sync' },
  [DepartmentTaskStatus.COMPLETED]: { label: '已完成', color: 'success', icon: 'check-circle' },
  [DepartmentTaskStatus.CANCELLED]: { label: '已取消', color: 'error', icon: 'close-circle' },
};

/**
 * 优先级配置
 */
export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; icon: string }> = {
  [Priority.LOW]: { label: '低', color: 'green', icon: 'arrow-down' },
  [Priority.MEDIUM]: { label: '中', color: 'blue', icon: 'minus' },
  [Priority.HIGH]: { label: '高', color: 'orange', icon: 'arrow-up' },
  [Priority.URGENT]: { label: '紧急', color: 'red', icon: 'exclamation' },
};