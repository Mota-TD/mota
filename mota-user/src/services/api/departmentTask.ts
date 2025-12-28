/**
 * 部门任务相关 API
 * 对应后端 DepartmentTaskController
 */

import { get, post, put, del } from '../request'

// 部门任务状态枚举
export enum DepartmentTaskStatus {
  PENDING = 'pending',           // 待分配
  PLANNING = 'planning',         // 计划中
  IN_PROGRESS = 'in_progress',   // 进行中
  COMPLETED = 'completed',       // 已完成
  CANCELLED = 'cancelled'        // 已取消
}

// 优先级枚举
export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// 部门任务信息
export interface DepartmentTask {
  id: string
  projectId: string
  milestoneId?: string
  departmentId: string
  managerId: string
  name: string
  description?: string
  status: DepartmentTaskStatus
  priority: Priority
  startDate?: string
  endDate?: string
  progress: number
  requirePlan: boolean
  requireApproval: boolean
  calendarEventId?: string
  createdAt?: string
  updatedAt?: string
  // 关联信息
  departmentName?: string
  managerName?: string
  projectName?: string
  milestoneName?: string
  taskCount?: number
  completedTaskCount?: number
}

// 部门任务列表响应
export interface DepartmentTaskListResponse {
  list: DepartmentTask[]
  total: number
}

// 创建部门任务请求
export interface CreateDepartmentTaskRequest {
  projectId: string
  milestoneId?: string
  departmentId: string
  managerId: string
  name: string
  description?: string
  priority?: Priority
  startDate?: string
  endDate?: string
  requirePlan?: boolean
  requireApproval?: boolean
}

// 更新部门任务请求
export interface UpdateDepartmentTaskRequest {
  name?: string
  description?: string
  managerId?: string
  priority?: Priority
  startDate?: string
  endDate?: string
  requirePlan?: boolean
  requireApproval?: boolean
}

// 分页查询参数
export interface DepartmentTaskQueryParams {
  [key: string]: string | number | boolean | undefined
  projectId?: string
  departmentId?: string
  managerId?: string
  status?: DepartmentTaskStatus
  priority?: Priority
  keyword?: string
  page?: number
  pageSize?: number
}

// 状态统计
export interface StatusCount {
  status: string
  count: number
}

/**
 * 获取部门任务列表（分页）
 */
export async function getDepartmentTasks(params?: DepartmentTaskQueryParams): Promise<DepartmentTaskListResponse> {
  const response = await get<{ records: DepartmentTask[]; total: number }>('/api/v1/department-tasks', params)
  return {
    list: response?.records || [],
    total: response?.total || 0
  }
}

/**
 * 根据项目ID获取部门任务列表
 */
export function getDepartmentTasksByProjectId(projectId: number | string): Promise<DepartmentTask[]> {
  return get<DepartmentTask[]>(`/api/v1/department-tasks/project/${projectId}`)
}

/**
 * 根据部门ID获取部门任务列表
 */
export function getDepartmentTasksByDepartmentId(departmentId: string | number): Promise<DepartmentTask[]> {
  return get<DepartmentTask[]>(`/api/v1/department-tasks/department/${departmentId}`)
}

/**
 * 根据负责人ID获取部门任务列表
 */
export function getDepartmentTasksByManagerId(managerId: string | number): Promise<DepartmentTask[]> {
  return get<DepartmentTask[]>(`/api/v1/department-tasks/manager/${managerId}`)
}

/**
 * 获取部门任务详情
 */
export function getDepartmentTaskById(id: string | number): Promise<DepartmentTask> {
  return get<DepartmentTask>(`/api/v1/department-tasks/${id}`)
}

/**
 * 创建部门任务
 */
export function createDepartmentTask(data: CreateDepartmentTaskRequest): Promise<DepartmentTask> {
  return post<DepartmentTask>('/api/v1/department-tasks', data)
}

/**
 * 更新部门任务
 */
export function updateDepartmentTask(id: string | number, data: UpdateDepartmentTaskRequest): Promise<DepartmentTask> {
  return put<DepartmentTask>(`/api/v1/department-tasks/${id}`, data)
}

/**
 * 删除部门任务
 */
export function deleteDepartmentTask(id: string | number): Promise<void> {
  return del<void>(`/api/v1/department-tasks/${id}`)
}

/**
 * 更新部门任务状态
 */
export function updateDepartmentTaskStatus(id: string | number, status: DepartmentTaskStatus): Promise<void> {
  return put<void>(`/api/v1/department-tasks/${id}/status`, { status })
}

/**
 * 更新部门任务进度
 */
export function updateDepartmentTaskProgress(id: string | number, progress: number, note?: string): Promise<void> {
  return put<void>(`/api/v1/department-tasks/${id}/progress`, { progress, note })
}

/**
 * 获取项目下各状态的部门任务数量统计
 */
export function getDepartmentTaskStatsByProject(projectId: number | string): Promise<StatusCount[]> {
  return get<StatusCount[]>(`/api/v1/department-tasks/stats/project/${projectId}`)
}

/**
 * 获取当前用户的部门任务（我的部门任务）
 */
export async function getMyDepartmentTasks(): Promise<DepartmentTaskListResponse> {
  const response = await get<{ records: DepartmentTask[]; total: number }>('/api/v1/department-tasks/my')
  return {
    list: response?.records || [],
    total: response?.total || 0
  }
}

/**
 * 获取状态显示文本
 */
export function getStatusText(status: DepartmentTaskStatus): string {
  const statusMap: Record<DepartmentTaskStatus, string> = {
    [DepartmentTaskStatus.PENDING]: '待分配',
    [DepartmentTaskStatus.PLANNING]: '计划中',
    [DepartmentTaskStatus.IN_PROGRESS]: '进行中',
    [DepartmentTaskStatus.COMPLETED]: '已完成',
    [DepartmentTaskStatus.CANCELLED]: '已取消'
  }
  return statusMap[status] || status
}

/**
 * 获取状态颜色
 */
export function getStatusColor(status: DepartmentTaskStatus): string {
  const colorMap: Record<DepartmentTaskStatus, string> = {
    [DepartmentTaskStatus.PENDING]: 'default',
    [DepartmentTaskStatus.PLANNING]: 'processing',
    [DepartmentTaskStatus.IN_PROGRESS]: 'blue',
    [DepartmentTaskStatus.COMPLETED]: 'success',
    [DepartmentTaskStatus.CANCELLED]: 'error'
  }
  return colorMap[status] || 'default'
}

/**
 * 获取优先级显示文本
 */
export function getPriorityText(priority: Priority): string {
  const priorityMap: Record<Priority, string> = {
    [Priority.LOW]: '低',
    [Priority.MEDIUM]: '中',
    [Priority.HIGH]: '高',
    [Priority.URGENT]: '紧急'
  }
  return priorityMap[priority] || priority
}

/**
 * 获取优先级颜色
 */
export function getPriorityColor(priority: Priority): string {
  const colorMap: Record<Priority, string> = {
    [Priority.LOW]: 'green',
    [Priority.MEDIUM]: 'blue',
    [Priority.HIGH]: 'orange',
    [Priority.URGENT]: 'red'
  }
  return colorMap[priority] || 'default'
}