/**
 * 里程碑模块类型定义
 * 重新导出现有 API 类型并扩展模块特定类型
 */

// 从现有 API 重新导出类型
export {
  MilestoneStatus,
  TaskStatus as MilestoneTaskStatus,
  TaskPriority as MilestoneTaskPriority,
  type Milestone,
  type MilestoneAssignee,
  type MilestoneTask,
  type MilestoneListResponse,
  type CreateMilestoneRequest,
  type UpdateMilestoneRequest,
  type MilestoneQueryParams,
} from '@/services/api/milestone';

// ============ 模块扩展类型 ============

/**
 * 里程碑详情（包含完整关联数据）
 */
export interface MilestoneDetail {
  milestone: import('@/services/api/milestone').Milestone;
  assignees: import('@/services/api/milestone').MilestoneAssignee[];
  tasks: import('@/services/api/milestone').MilestoneTask[];
  statistics: MilestoneStatistics;
}

/**
 * 里程碑统计数据
 */
export interface MilestoneStatistics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  cancelledTasks: number;
  progress: number;
  isOnTrack: boolean;
  daysRemaining: number;
  isOverdue: boolean;
}

/**
 * 里程碑时间线项
 */
export interface MilestoneTimelineItem {
  id: string;
  milestoneId: string;
  milestoneName: string;
  targetDate: string;
  status: import('@/services/api/milestone').MilestoneStatus;
  progress: number;
  isUpcoming: boolean;
  isOverdue: boolean;
  daysRemaining: number;
}

/**
 * 里程碑筛选条件
 */
export interface MilestoneFilter {
  projectId?: string;
  status?: import('@/services/api/milestone').MilestoneStatus[];
  dateRange?: {
    start: string;
    end: string;
  };
  assigneeIds?: string[];
  isOverdue?: boolean;
  isUpcoming?: boolean;
}

/**
 * 里程碑排序选项
 */
export interface MilestoneSortOption {
  field: 'name' | 'targetDate' | 'status' | 'progress' | 'createdAt' | 'sortOrder';
  order: 'asc' | 'desc';
}

/**
 * 里程碑视图类型
 */
export type MilestoneViewType = 'list' | 'timeline' | 'calendar' | 'kanban';

/**
 * 里程碑视图配置
 */
export interface MilestoneViewConfig {
  viewType: MilestoneViewType;
  showTasks: boolean;
  showAssignees: boolean;
  showProgress: boolean;
  groupBy?: 'status' | 'month' | 'none';
  filter?: MilestoneFilter;
  sort?: MilestoneSortOption;
}

/**
 * 里程碑拖拽结果
 */
export interface MilestoneDragResult {
  milestoneId: string;
  sourceIndex: number;
  destinationIndex: number;
}

/**
 * 任务拖拽结果（在里程碑内）
 */
export interface MilestoneTaskDragResult {
  taskId: string;
  sourceMilestoneId: string;
  destinationMilestoneId: string;
  sourceIndex: number;
  destinationIndex: number;
}

/**
 * 批量操作类型
 */
export type MilestoneBatchAction = 
  | 'delete'
  | 'complete'
  | 'delay'
  | 'changeAssignees';

/**
 * 批量操作请求
 */
export interface MilestoneBatchActionRequest {
  milestoneIds: string[];
  action: MilestoneBatchAction;
  payload?: {
    assigneeIds?: string[];
  };
}

// ============ 状态配置 ============

import { MilestoneStatus } from '@/services/api/milestone';

/**
 * 里程碑状态配置
 */
export const MILESTONE_STATUS_CONFIG: Record<MilestoneStatus, { label: string; color: string; icon: string }> = {
  [MilestoneStatus.PENDING]: { label: '待完成', color: 'processing', icon: 'clock-circle' },
  [MilestoneStatus.COMPLETED]: { label: '已完成', color: 'success', icon: 'check-circle' },
  [MilestoneStatus.DELAYED]: { label: '已延期', color: 'error', icon: 'exclamation-circle' },
};