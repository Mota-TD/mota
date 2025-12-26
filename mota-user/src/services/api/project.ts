/**
 * 项目相关 API
 */

import { get, post, put, del } from '../request'

// ==================== 类型定义 ====================

// 项目信息
export interface Project {
  id: string
  name: string
  key: string
  description?: string
  status: string
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
  priority?: string
  visibility?: string
  archivedAt?: string
  archivedBy?: string
}

// 项目列表响应
export interface ProjectListResponse {
  list: Project[]
  total: number
  page?: number
  pageSize?: number
}

// 项目查询请求
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

// 里程碑请求
export interface MilestoneRequest {
  name: string
  targetDate: string
  description?: string
}

// 里程碑信息
export interface Milestone {
  id: string
  projectId: string
  name: string
  description?: string
  targetDate: string
  status: string
  completedAt?: string
  sortOrder?: number
  createdAt?: string
  updatedAt?: string
}

// 创建项目请求
export interface CreateProjectRequest {
  name: string
  /** 项目标识（系统自动生成，格式：AF-0000，前端无需传递） */
  key?: string
  description?: string
  color?: string
  startDate?: string
  endDate?: string
  ownerId?: string
  priority?: string
  visibility?: string
  departmentIds?: string[]
  memberIds?: string[]
  milestones?: MilestoneRequest[]
}

// 更新项目请求
export interface UpdateProjectRequest {
  name?: string
  description?: string
  status?: string
  color?: string
  startDate?: string
  endDate?: string
  ownerId?: string
  priority?: string
  visibility?: string
  progress?: number
}

// 项目成员信息
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

// 项目统计信息
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

// 项目详情响应
export interface ProjectDetailResponse extends Project {
  members?: ProjectMember[]
  milestones?: Milestone[]
  departments?: DepartmentInfo[]
  statistics?: ProjectStatistics
}

// 部门信息
export interface DepartmentInfo {
  id: string
  name: string
  managerId?: string
  managerName?: string
  memberCount?: number
}

// ==================== 项目基础操作 ====================

/**
 * 获取下一个项目标识
 * 系统自动生成，格式：AF-0000
 */
export function getNextProjectKey(): Promise<string> {
  return get<string>('/api/v1/projects/key/next')
}

/**
 * 获取项目列表（简单查询）
 */
export async function getProjects(params?: {
  status?: string
  search?: string
  page?: number
  pageSize?: number
}): Promise<ProjectListResponse> {
  const list = await get<Project[]>('/api/v1/projects', {
    keyword: params?.search,
    status: params?.status === 'all' ? undefined : params?.status
  })
  return {
    list: list || [],
    total: list?.length || 0
  }
}

/**
 * 获取项目列表（高级查询）
 */
export function queryProjects(query: ProjectQueryRequest): Promise<ProjectListResponse> {
  return post<ProjectListResponse>('/api/v1/projects/query', query)
}

/**
 * 获取项目详情（简单）
 */
export function getProjectById(id: number | string): Promise<Project> {
  return get<Project>(`/api/v1/projects/${id}`)
}

/**
 * 获取项目详情 (别名)
 */
export const getProject = getProjectById

/**
 * 获取项目详情（完整信息）
 */
export function getProjectDetailFull(id: number | string): Promise<ProjectDetailResponse> {
  return get<ProjectDetailResponse>(`/api/v1/projects/${id}/full`)
}

/**
 * 创建项目（简单）
 */
export function createProjectSimple(data: CreateProjectRequest): Promise<Project> {
  return post<Project>('/api/v1/projects', data)
}

/**
 * 创建项目（默认使用完整流程，支持里程碑和成员）
 */
export function createProject(data: CreateProjectRequest): Promise<Project> {
  return post<Project>('/api/v1/projects/create', data)
}

/**
 * 创建项目（完整流程）
 */
export function createProjectFull(data: CreateProjectRequest): Promise<Project> {
  return post<Project>('/api/v1/projects/create', data)
}

/**
 * 更新项目（简单）
 */
export function updateProject(id: number | string, data: UpdateProjectRequest): Promise<Project> {
  return put<Project>(`/api/v1/projects/${id}`, data)
}

/**
 * 更新项目（完整）
 */
export function updateProjectFull(id: number | string, data: UpdateProjectRequest): Promise<Project> {
  return put<Project>(`/api/v1/projects/${id}/update`, data)
}

/**
 * 删除项目
 */
export function deleteProject(id: number | string): Promise<void> {
  return del<void>(`/api/v1/projects/${id}`)
}

/**
 * 收藏/取消收藏项目
 */
export function toggleProjectStar(id: number | string): Promise<void> {
  return post<void>(`/api/v1/projects/${id}/star`)
}

// ==================== 项目生命周期管理 ====================

/**
 * 归档项目
 */
export function archiveProject(id: number | string): Promise<void> {
  return post<void>(`/api/v1/projects/${id}/archive`)
}

/**
 * 恢复归档项目
 */
export function restoreProject(id: number | string): Promise<void> {
  return post<void>(`/api/v1/projects/${id}/restore`)
}

/**
 * 更新项目状态
 */
export function updateProjectStatus(id: number | string, status: string): Promise<void> {
  return put<void>(`/api/v1/projects/${id}/status?status=${encodeURIComponent(status)}`, null)
}

/**
 * 更新项目进度
 */
export function updateProjectProgress(id: number | string, progress: number): Promise<void> {
  return put<void>(`/api/v1/projects/${id}/progress?progress=${progress}`, null)
}

/**
 * 获取归档项目列表
 */
export function getArchivedProjects(): Promise<Project[]> {
  return get<Project[]>('/api/v1/projects/archived')
}

/**
 * 获取收藏的项目列表
 */
export function getStarredProjects(): Promise<Project[]> {
  return get<Project[]>('/api/v1/projects/starred')
}

/**
 * 获取最近访问的项目
 */
export function getRecentProjects(limit?: number): Promise<Project[]> {
  return get<Project[]>('/api/v1/projects/recent', { limit })
}

// ==================== 项目成员管理 ====================

/**
 * 获取项目成员列表
 */
export function getProjectMembers(projectId: number | string): Promise<ProjectMember[]> {
  return get<ProjectMember[]>(`/api/v1/projects/${projectId}/members`)
}

/**
 * 添加项目成员
 */
export function addProjectMember(projectId: number | string, userId: string, role?: string): Promise<void> {
  let url = `/api/v1/projects/${projectId}/members?userId=${encodeURIComponent(userId)}`
  if (role) {
    url += `&role=${encodeURIComponent(role)}`
  }
  return post<void>(url, null)
}

/**
 * 批量添加项目成员
 */
export function addProjectMembers(projectId: number | string, userIds: string[], role?: string): Promise<void> {
  let url = `/api/v1/projects/${projectId}/members/batch`
  if (role) {
    url += `?role=${encodeURIComponent(role)}`
  }
  return post<void>(url, userIds)
}

/**
 * 移除项目成员
 */
export function removeProjectMember(projectId: number | string, userId: string): Promise<void> {
  return del<void>(`/api/v1/projects/${projectId}/members/${userId}`)
}

/**
 * 更新成员角色
 */
export function updateMemberRole(projectId: number | string, userId: string, role: string): Promise<void> {
  return put<void>(`/api/v1/projects/${projectId}/members/${userId}/role?role=${encodeURIComponent(role)}`, null)
}

// ==================== 项目里程碑管理 ====================

/**
 * 获取项目里程碑列表
 */
export function getProjectMilestones(projectId: number | string): Promise<Milestone[]> {
  return get<Milestone[]>(`/api/v1/projects/${projectId}/milestones`)
}

/**
 * 添加里程碑
 */
export function addMilestone(projectId: number | string, milestone: Partial<Milestone>): Promise<Milestone> {
  return post<Milestone>(`/api/v1/projects/${projectId}/milestones`, milestone)
}

/**
 * 更新里程碑
 */
export function updateMilestone(milestoneId: number | string, milestone: Partial<Milestone>): Promise<Milestone> {
  return put<Milestone>(`/api/v1/projects/milestones/${milestoneId}`, milestone)
}

/**
 * 删除里程碑
 */
export function deleteMilestone(milestoneId: number | string): Promise<void> {
  return del<void>(`/api/v1/projects/milestones/${milestoneId}`)
}

/**
 * 完成里程碑
 */
export function completeMilestone(milestoneId: number | string): Promise<void> {
  return post<void>(`/api/v1/projects/milestones/${milestoneId}/complete`)
}

// ==================== 项目统计 ====================

/**
 * 获取项目统计信息
 */
export function getProjectStatistics(projectId: number | string): Promise<ProjectStatistics> {
  return get<ProjectStatistics>(`/api/v1/projects/${projectId}/statistics`)
}