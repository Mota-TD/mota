/**
 * 执行任务相关 API
 * 对应后端 TaskController
 */

import { get, post, put, del } from '../request'

// 任务状态枚举
export enum TaskStatus {
  PENDING = 'pending',           // 待开始
  IN_PROGRESS = 'in_progress',   // 进行中
  PAUSED = 'paused',             // 已暂停
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

// 执行任务信息
export interface Task {
  id: string
  departmentTaskId: string
  projectId: string
  name: string
  description?: string
  assigneeId?: string
  status: TaskStatus
  priority: Priority
  startDate?: string
  endDate?: string
  progress: number
  progressNote?: string
  sortOrder: number
  completedAt?: string
  createdAt?: string
  updatedAt?: string
  // 关联信息
  assigneeName?: string
  assigneeAvatar?: string
  departmentTaskName?: string
  projectName?: string
}

// 任务列表响应
export interface TaskListResponse {
  list: Task[]
  total: number
}

// 创建任务请求
export interface CreateTaskRequest {
  departmentTaskId: string
  projectId: string
  name: string
  description?: string
  assigneeId?: string
  priority?: Priority
  startDate?: string
  endDate?: string
}

// 更新任务请求
export interface UpdateTaskRequest {
  name?: string
  description?: string
  assigneeId?: string
  priority?: Priority
  startDate?: string
  endDate?: string
}

// 分页查询参数
export interface TaskQueryParams {
  [key: string]: string | number | boolean | undefined
  departmentTaskId?: string
  projectId?: string
  assigneeId?: string
  status?: TaskStatus
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

// 待办任务
export interface TodoTask extends Task {
  dueInDays?: number
  isOverdue?: boolean
}

/**
 * 获取任务列表（分页）
 */
export async function getTasks(params?: TaskQueryParams): Promise<TaskListResponse> {
  const response = await get<{ records: Task[]; total: number }>('/api/v1/tasks', params)
  return {
    list: response?.records || [],
    total: response?.total || 0
  }
}

/**
 * 根据部门任务ID获取执行任务列表
 */
export function getTasksByDepartmentTaskId(departmentTaskId: string | number): Promise<Task[]> {
  return get<Task[]>(`/api/v1/tasks/department-task/${departmentTaskId}`)
}

/**
 * 根据项目ID获取执行任务列表
 */
export function getTasksByProjectId(projectId: number | string): Promise<Task[]> {
  return get<Task[]>(`/api/v1/tasks/project/${projectId}`)
}

/**
 * 根据执行人ID获取任务列表
 */
export function getTasksByAssigneeId(assigneeId: string | number): Promise<Task[]> {
  return get<Task[]>(`/api/v1/tasks/assignee/${assigneeId}`)
}

/**
 * 获取任务详情
 */
export function getTaskById(id: string | number): Promise<Task> {
  return get<Task>(`/api/v1/tasks/${id}`)
}

/**
 * 创建任务
 */
export function createTask(data: CreateTaskRequest): Promise<Task> {
  return post<Task>('/api/v1/tasks', data)
}

/**
 * 更新任务
 */
export function updateTask(id: string | number, data: UpdateTaskRequest): Promise<Task> {
  return put<Task>(`/api/v1/tasks/${id}`, data)
}

/**
 * 删除任务
 */
export function deleteTask(id: string | number): Promise<void> {
  return del<void>(`/api/v1/tasks/${id}`)
}

/**
 * 更新任务状态
 */
export function updateTaskStatus(id: string | number, status: TaskStatus): Promise<void> {
  return put<void>(`/api/v1/tasks/${id}/status`, { status })
}

/**
 * 更新任务进度
 */
export function updateTaskProgress(id: string | number, progress: number, note?: string): Promise<void> {
  return put<void>(`/api/v1/tasks/${id}/progress`, { progress, note })
}

/**
 * 完成任务
 */
export function completeTask(id: string | number): Promise<void> {
  return put<void>(`/api/v1/tasks/${id}/complete`)
}

/**
 * 分配任务
 */
export function assignTask(id: string | number, assigneeId: string | number): Promise<void> {
  return put<void>(`/api/v1/tasks/${id}/assign`, { assigneeId })
}

/**
 * 获取当前用户的所有任务（我的任务）
 */
export async function getMyTasks(): Promise<TaskListResponse> {
  const response = await get<{ records: Task[]; total: number }>('/api/v1/tasks/my')
  return {
    list: response?.records || [],
    total: response?.total || 0
  }
}

/**
 * 获取用户待办任务列表
 */
export function getTodoList(userId: string | number): Promise<TodoTask[]> {
  return get<TodoTask[]>(`/api/v1/tasks/todo/${userId}`)
}

/**
 * 获取即将到期的任务
 */
export function getUpcomingTasks(userId: string | number, days: number = 7): Promise<Task[]> {
  return get<Task[]>(`/api/v1/tasks/upcoming/${userId}`, { days })
}

/**
 * 获取已逾期的任务
 */
export function getOverdueTasks(userId: string | number): Promise<Task[]> {
  return get<Task[]>(`/api/v1/tasks/overdue/${userId}`)
}

/**
 * 获取部门任务下各状态的执行任务数量统计
 */
export function getTaskStatsByDepartmentTask(departmentTaskId: string | number): Promise<StatusCount[]> {
  return get<StatusCount[]>(`/api/v1/tasks/stats/department-task/${departmentTaskId}`)
}

/**
 * 获取项目下各状态的执行任务数量统计
 */
export function getTaskStatsByProject(projectId: number | string): Promise<StatusCount[]> {
  return get<StatusCount[]>(`/api/v1/tasks/stats/project/${projectId}`)
}

/**
 * 获取状态显示文本
 */
export function getStatusText(status: TaskStatus): string {
  const statusMap: Record<TaskStatus, string> = {
    [TaskStatus.PENDING]: '待开始',
    [TaskStatus.IN_PROGRESS]: '进行中',
    [TaskStatus.PAUSED]: '已暂停',
    [TaskStatus.COMPLETED]: '已完成',
    [TaskStatus.CANCELLED]: '已取消'
  }
  return statusMap[status] || status
}

/**
 * 获取状态颜色
 */
export function getStatusColor(status: TaskStatus): string {
  const colorMap: Record<TaskStatus, string> = {
    [TaskStatus.PENDING]: 'default',
    [TaskStatus.IN_PROGRESS]: 'processing',
    [TaskStatus.PAUSED]: 'warning',
    [TaskStatus.COMPLETED]: 'success',
    [TaskStatus.CANCELLED]: 'error'
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