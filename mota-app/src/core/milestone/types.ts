/**
 * 里程碑管理类型定义
 */

// 里程碑状态
export enum MilestoneStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DELAYED = 'delayed'
}

// 里程碑负责人
export interface MilestoneAssignee {
  id: string
  milestoneId: string
  userId: string
  isPrimary: boolean
  assignedAt: string
  assignedBy: string
}

// 里程碑信息
export interface Milestone {
  id: string
  projectId: string
  name: string
  description?: string
  targetDate?: string
  status: MilestoneStatus
  progress: number
  taskCount: number
  completedTaskCount: number
  departmentTaskCount: number
  completedDepartmentTaskCount: number
  sortOrder: number
  completedAt?: string
  createdAt: string
  updatedAt: string
  assignees?: MilestoneAssignee[]
  // 用于任务列表展示
  projectName?: string
}

// 里程碑任务
export interface MilestoneTask {
  id: string
  milestoneId: string
  parentId?: string
  name: string
  description?: string
  assigneeId?: string
  assigneeName?: string
  status: string
  priority: string
  progress: number
  startDate?: string
  dueDate?: string
  completedAt?: string
  sortOrder: number
  createdAt: string
  updatedAt: string
  // 用于任务列表展示
  projectName?: string
  milestoneName?: string
}

// 里程碑统计
export interface MilestoneStats {
  total: number
  pending: number
  inProgress: number
  completed: number
  delayed: number
}