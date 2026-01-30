/**
 * 任务管理类型定义
 */

// 任务状态
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  DONE = 'done',
  CANCELLED = 'cancelled'
}

// 任务优先级
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// 任务信息
export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  projectId: string
  projectName: string
  assigneeId?: string
  assigneeName?: string
  assigneeAvatar?: string
  creatorId: string
  creatorName: string
  startDate?: string
  dueDate?: string
  estimatedHours?: number
  actualHours?: number
  progress: number
  tags?: string[]
  attachmentCount: number
  commentCount: number
  subtaskCount: number
  completedSubtaskCount: number
  createdAt: string
  updatedAt: string
}

// 任务创建请求
export interface TaskCreateRequest {
  title: string
  description?: string
  projectId: string
  priority: TaskPriority
  assigneeId?: string
  startDate?: string
  dueDate?: string
  estimatedHours?: number
  tags?: string[]
}

// 任务更新请求
export interface TaskUpdateRequest {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  assigneeId?: string
  startDate?: string
  dueDate?: string
  estimatedHours?: number
  actualHours?: number
  progress?: number
  tags?: string[]
}

// 任务查询请求
export interface TaskQueryRequest {
  keyword?: string
  projectId?: string
  status?: TaskStatus
  priority?: TaskPriority
  assigneeId?: string
  creatorId?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

// 任务列表响应
export interface TaskListResponse {
  list: Task[]
  total: number
  page: number
  pageSize: number
}

// 任务统计
export interface TaskStats {
  total: number
  todo: number
  inProgress: number
  inReview: number
  done: number
  overdue: number
}

// 子任务
export interface Subtask {
  id: string
  taskId: string
  title: string
  completed: boolean
  createdAt: string
}

// 任务评论
export interface TaskComment {
  id: string
  taskId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  createdAt: string
}