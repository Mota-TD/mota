/**
 * 项目管理类型定义
 */

// 项目状态
export enum ProjectStatus {
  PLANNING = 'planning',       // 规划中
  IN_PROGRESS = 'in_progress', // 进行中
  ON_HOLD = 'on_hold',         // 暂停
  COMPLETED = 'completed',     // 已完成
  CANCELLED = 'cancelled'      // 已取消
}

// 项目优先级
export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// 项目信息
export interface Project {
  id: string
  name: string
  description?: string
  status: ProjectStatus
  priority: ProjectPriority
  startDate?: string
  endDate?: string
  progress: number
  ownerId: string
  ownerName: string
  memberCount: number
  taskCount: number
  completedTaskCount: number
  createdAt: string
  updatedAt: string
}

// 项目成员
export interface ProjectMember {
  id: string
  projectId: string
  userId: string
  userName: string
  userAvatar?: string
  role: 'owner' | 'admin' | 'member'
  joinedAt: string
}

// 项目统计
export interface ProjectStats {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  overdueTasks: number
  totalMembers: number
  progress: number
  estimatedCompletion?: string
}

// 项目创建请求
export interface ProjectCreateRequest {
  name: string
  description?: string
  priority: ProjectPriority
  startDate?: string
  endDate?: string
  memberIds?: string[]
}

// 项目更新请求
export interface ProjectUpdateRequest {
  name?: string
  description?: string
  status?: ProjectStatus
  priority?: ProjectPriority
  startDate?: string
  endDate?: string
}

// 项目查询请求
export interface ProjectQueryRequest {
  keyword?: string
  status?: ProjectStatus
  priority?: ProjectPriority
  ownerId?: string
  page?: number
  pageSize?: number
}

// 项目列表响应
export interface ProjectListResponse {
  list: Project[]
  total: number
  page: number
  pageSize: number
}