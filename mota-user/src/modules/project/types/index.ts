/**
 * 项目模块类型定义
 */

// ==================== 项目状态 ====================

export type ProjectStatus = 'planning' | 'active' | 'completed' | 'suspended' | 'cancelled' | 'archived'

export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent'

export type ProjectVisibility = 'private' | 'internal' | 'public'

// ==================== 项目信息 ====================

export interface Project {
  id: string
  name: string
  key: string
  description?: string
  status: ProjectStatus
  ownerId: string
  ownerName?: string
  ownerAvatar?: string
  memberCount: number
  issueCount: number
  color?: string
  starred?: number  // 0 or 1
  progress?: number
  createdAt?: string
  updatedAt?: string
  orgId?: string
  startDate?: string
  endDate?: string
  priority?: ProjectPriority
  visibility?: ProjectVisibility
  archivedAt?: string
  archivedBy?: string
}

// ==================== 项目成员 ====================

export interface ProjectMember {
  id: string
  projectId: string
  userId: string
  userName?: string
  userAvatar?: string
  role?: string
  departmentId?: string
  departmentName?: string
  joinedAt?: string
}

// ==================== 里程碑 ====================

export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'overdue'

export interface Milestone {
  id: string
  projectId: string
  name: string
  description?: string
  targetDate: string
  status: MilestoneStatus
  completedAt?: string
  sortOrder?: number
  createdAt?: string
  updatedAt?: string
  assigneeIds?: string[]
}

// ==================== 项目统计 ====================

export interface ProjectStatistics {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  pendingTasks: number
  overdueTasks: number
  departmentTaskCount: number
  completedMilestones: number
  totalMilestones: number
  completionRate: number
}

// ==================== 部门信息 ====================

export interface DepartmentInfo {
  id: string
  name: string
  managerId?: string
  managerName?: string
  memberCount?: number
}

// ==================== 请求/响应类型 ====================

export interface ProjectListResponse {
  list: Project[]
  total: number
  page?: number
  pageSize?: number
}

export interface ProjectQueryRequest {
  keyword?: string
  status?: string
  priority?: string
  ownerId?: string
  starred?: boolean
  includeArchived?: boolean
  departmentId?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface CreateProjectRequest {
  name: string
  key?: string
  description?: string
  color?: string
  startDate?: string
  endDate?: string
  ownerId?: string
  priority?: ProjectPriority
  visibility?: ProjectVisibility
  departmentIds?: string[]
  memberIds?: string[]
  milestones?: MilestoneRequest[]
}

export interface UpdateProjectRequest {
  name?: string
  description?: string
  status?: ProjectStatus
  color?: string
  startDate?: string
  endDate?: string
  ownerId?: string
  priority?: ProjectPriority
  visibility?: ProjectVisibility
  progress?: number
}

export interface MilestoneRequest {
  name: string
  targetDate: string
  description?: string
  assigneeIds?: string[]
}

export interface ProjectDetailResponse extends Project {
  members?: ProjectMember[]
  milestones?: Milestone[]
  departments?: DepartmentInfo[]
  statistics?: ProjectStatistics
}

// ==================== 视图配置 ====================

export type ProjectViewMode = 'grid' | 'list' | 'gantt' | 'calendar' | 'kanban'

export interface ProjectFilters {
  status: string
  search: string
  starred: boolean
  priority?: string
  ownerId?: string
}

// ==================== 状态配置 ====================

export interface StatusConfig {
  color: string
  text: string
  icon?: React.ReactNode
}

export const PROJECT_STATUS_CONFIG: Record<ProjectStatus, StatusConfig> = {
  planning: { color: 'orange', text: '规划中' },
  active: { color: 'green', text: '进行中' },
  completed: { color: 'blue', text: '已完成' },
  suspended: { color: 'gold', text: '已暂停' },
  cancelled: { color: 'red', text: '已取消' },
  archived: { color: 'default', text: '已归档' }
}

export const PRIORITY_CONFIG: Record<ProjectPriority, StatusConfig> = {
  low: { color: 'green', text: '低' },
  medium: { color: 'blue', text: '中' },
  high: { color: 'orange', text: '高' },
  urgent: { color: 'red', text: '紧急' }
}

// ==================== 项目颜色 ====================

export const PROJECT_COLORS = [
  '#2b7de9', '#52c41a', '#722ed1', '#fa8c16',
  '#13c2c2', '#eb2f96', '#f5222d', '#faad14'
]