/**
 * 里程碑相关 API
 * 对应后端 MilestoneController
 */

import { get, post, put, del } from '../request'

// 里程碑状态枚举
export enum MilestoneStatus {
  PENDING = 'pending',       // 待完成
  COMPLETED = 'completed',   // 已完成
  DELAYED = 'delayed'        // 已延期
}

// 任务状态枚举
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// 任务优先级枚举
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// 里程碑负责人信息
export interface MilestoneAssignee {
  id: string
  milestoneId: string
  userId: string
  userName?: string
  userAvatar?: string
  isPrimary: boolean
  assignedAt?: string
  assignedBy?: string
}

// 里程碑任务信息
export interface MilestoneTask {
  id: string
  milestoneId: string
  projectId?: string
  parentTaskId?: string
  name: string
  description?: string
  assigneeId?: string
  assigneeName?: string
  assigneeAvatar?: string
  assignedBy?: string
  status: TaskStatus
  priority: TaskPriority
  progress: number
  startDate?: string
  dueDate?: string
  completedAt?: string
  sortOrder?: number
  createdAt?: string
  updatedAt?: string
  // 里程碑名称（非数据库字段）
  milestoneName?: string
  // 子任务
  subTasks?: MilestoneTask[]
}

// 里程碑信息
export interface Milestone {
  id: string
  projectId: string
  name: string
  description?: string
  targetDate: string
  status: MilestoneStatus
  completedAt?: string
  sortOrder: number
  createdAt?: string
  updatedAt?: string
  // 关联信息
  projectName?: string
  // 统计信息
  totalTasks?: number
  completedTasks?: number
  progress?: number
  taskCount?: number
  completedTaskCount?: number
  // 负责人信息
  assignees?: MilestoneAssignee[]
  // 任务列表
  tasks?: MilestoneTask[]
}

// 里程碑列表响应
export interface MilestoneListResponse {
  list: Milestone[]
  total: number
}

// 创建里程碑请求
export interface CreateMilestoneRequest {
  projectId: string
  name: string
  description?: string
  targetDate: string
  sortOrder?: number
}

// 更新里程碑请求
export interface UpdateMilestoneRequest {
  name?: string
  description?: string
  targetDate?: string
  sortOrder?: number
}

// 分页查询参数
export interface MilestoneQueryParams {
  [key: string]: string | number | boolean | undefined
  projectId?: string
  status?: MilestoneStatus
  page?: number
  pageSize?: number
}

/**
 * 获取里程碑列表（分页）
 */
export async function getMilestones(params?: MilestoneQueryParams): Promise<MilestoneListResponse> {
  const response = await get<{ records: Milestone[]; total: number }>('/api/v1/milestones', params)
  return {
    list: response?.records || [],
    total: response?.total || 0
  }
}

/**
 * 根据项目ID获取里程碑列表
 * @param projectId 项目ID
 * @param withAssignees 是否包含负责人信息，默认为 true
 */
export function getMilestonesByProjectId(projectId: number | string, withAssignees: boolean = true): Promise<Milestone[]> {
  return get<Milestone[]>(`/api/v1/milestones/project/${projectId}`, { withAssignees })
}

/**
 * 获取里程碑详情
 */
export function getMilestoneById(id: string | number): Promise<Milestone> {
  return get<Milestone>(`/api/v1/milestones/${id}`)
}

/**
 * 创建里程碑
 */
export function createMilestone(data: CreateMilestoneRequest): Promise<Milestone> {
  return post<Milestone>('/api/v1/milestones', data)
}

/**
 * 更新里程碑
 */
export function updateMilestone(id: string | number, data: UpdateMilestoneRequest): Promise<Milestone> {
  return put<Milestone>(`/api/v1/milestones/${id}`, data)
}

/**
 * 删除里程碑
 */
export function deleteMilestone(id: string | number): Promise<void> {
  return del<void>(`/api/v1/milestones/${id}`)
}

/**
 * 完成里程碑
 */
export function completeMilestone(id: string | number): Promise<Milestone> {
  return put<Milestone>(`/api/v1/milestones/${id}/complete`)
}

/**
 * 标记里程碑为延期
 */
export function delayMilestone(id: string | number): Promise<Milestone> {
  return put<Milestone>(`/api/v1/milestones/${id}/delay`)
}

/**
 * 重新排序里程碑
 */
export function reorderMilestones(projectId: number | string, milestoneIds: string[]): Promise<void> {
  return put<void>(`/api/v1/milestones/project/${projectId}/reorder`, { milestoneIds })
}

/**
 * 获取即将到期的里程碑
 */
export function getUpcomingMilestones(projectId: number | string, days: number = 7): Promise<Milestone[]> {
  return get<Milestone[]>(`/api/v1/milestones/project/${projectId}/upcoming`, { days })
}

/**
 * 获取已延期的里程碑
 */
export function getDelayedMilestones(projectId: number | string): Promise<Milestone[]> {
  return get<Milestone[]>(`/api/v1/milestones/project/${projectId}/delayed`)
}

/**
 * 获取状态显示文本
 */
export function getStatusText(status: MilestoneStatus): string {
  const statusMap: Record<MilestoneStatus, string> = {
    [MilestoneStatus.PENDING]: '待完成',
    [MilestoneStatus.COMPLETED]: '已完成',
    [MilestoneStatus.DELAYED]: '已延期'
  }
  return statusMap[status] || status
}

/**
 * 获取状态颜色
 */
export function getStatusColor(status: MilestoneStatus): string {
  const colorMap: Record<MilestoneStatus, string> = {
    [MilestoneStatus.PENDING]: 'processing',
    [MilestoneStatus.COMPLETED]: 'success',
    [MilestoneStatus.DELAYED]: 'error'
  }
  return colorMap[status] || 'default'
}

/**
 * 获取状态图标
 */
export function getStatusIcon(status: MilestoneStatus): string {
  const iconMap: Record<MilestoneStatus, string> = {
    [MilestoneStatus.PENDING]: 'clock-circle',
    [MilestoneStatus.COMPLETED]: 'check-circle',
    [MilestoneStatus.DELAYED]: 'exclamation-circle'
  }
  return iconMap[status] || 'question-circle'
}

/**
 * 检查里程碑是否即将到期（7天内）
 */
export function isUpcoming(milestone: Milestone): boolean {
  if (milestone.status !== MilestoneStatus.PENDING) return false
  const targetDate = new Date(milestone.targetDate)
  const now = new Date()
  const diffDays = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diffDays >= 0 && diffDays <= 7
}

/**
 * 检查里程碑是否已过期
 */
export function isOverdue(milestone: Milestone): boolean {
  if (milestone.status !== MilestoneStatus.PENDING) return false
  const targetDate = new Date(milestone.targetDate)
  const now = new Date()
  return targetDate < now
}

// ==================== 负责人管理 API ====================

/**
 * 获取当前用户负责的里程碑
 */
export function getMyMilestones(): Promise<Milestone[]> {
  return get<Milestone[]>('/api/v1/milestones/my')
}

/**
 * 获取当前用户负责的里程碑任务
 */
export function getMyMilestoneTasks(): Promise<MilestoneTask[]> {
  return get<MilestoneTask[]>('/api/v1/milestones/my-tasks')
}

/**
 * 根据用户ID获取负责的里程碑
 */
export function getMilestonesByAssignee(userId: string | number): Promise<Milestone[]> {
  return get<Milestone[]>(`/api/v1/milestones/assignee/${userId}`)
}

/**
 * 根据用户ID获取负责的里程碑任务
 */
export function getMilestoneTasksByAssignee(userId: string | number): Promise<MilestoneTask[]> {
  return get<MilestoneTask[]>(`/api/v1/milestones/tasks/assignee/${userId}`)
}

/**
 * 获取里程碑负责人列表
 */
export function getMilestoneAssignees(milestoneId: string | number): Promise<MilestoneAssignee[]> {
  return get<MilestoneAssignee[]>(`/api/v1/milestones/${milestoneId}/assignees`)
}

/**
 * 更新里程碑负责人
 */
export function updateMilestoneAssignees(milestoneId: string | number, assigneeIds: string[]): Promise<boolean> {
  return put<boolean>(`/api/v1/milestones/${milestoneId}/assignees`, { assigneeIds })
}

/**
 * 添加里程碑负责人
 */
export function addMilestoneAssignee(milestoneId: string | number, userId: string, isPrimary: boolean = false): Promise<boolean> {
  return post<boolean>(`/api/v1/milestones/${milestoneId}/assignees`, { userId, isPrimary })
}

/**
 * 移除里程碑负责人
 */
export function removeMilestoneAssignee(milestoneId: string | number, userId: string): Promise<boolean> {
  return del<boolean>(`/api/v1/milestones/${milestoneId}/assignees/${userId}`)
}

// ==================== 任务管理 API ====================

/**
 * 获取里程碑任务列表
 */
export function getMilestoneTasks(milestoneId: string | number): Promise<MilestoneTask[]> {
  return get<MilestoneTask[]>(`/api/v1/milestones/${milestoneId}/tasks`)
}

/**
 * 获取任务详情
 */
export function getTaskDetail(taskId: string | number): Promise<MilestoneTask> {
  return get<MilestoneTask>(`/api/v1/milestones/tasks/${taskId}`)
}

/**
 * 创建里程碑任务
 */
export function createMilestoneTask(milestoneId: string | number, task: Partial<MilestoneTask>): Promise<MilestoneTask> {
  return post<MilestoneTask>(`/api/v1/milestones/${milestoneId}/tasks`, task)
}

/**
 * 创建子任务
 */
export function createSubTask(taskId: string | number, task: Partial<MilestoneTask>): Promise<MilestoneTask> {
  return post<MilestoneTask>(`/api/v1/milestones/tasks/${taskId}/subtasks`, task)
}

/**
 * 更新任务
 */
export function updateTask(taskId: string | number, task: Partial<MilestoneTask>): Promise<MilestoneTask> {
  return put<MilestoneTask>(`/api/v1/milestones/tasks/${taskId}`, task)
}

/**
 * 更新任务进度
 */
export function updateTaskProgress(taskId: string | number, progress: number): Promise<boolean> {
  return put<boolean>(`/api/v1/milestones/tasks/${taskId}/progress`, { progress })
}

// ==================== 增强进度更新 API ====================

/**
 * 进度附件信息
 */
export interface ProgressAttachment {
  fileName: string
  fileUrl: string
  fileType: string
  fileSize?: number
}

/**
 * 增强进度更新请求
 */
export interface EnhancedProgressUpdateRequest {
  progress: number
  description?: string
  attachments?: ProgressAttachment[]
}

/**
 * 进度记录
 */
export interface ProgressRecord {
  id: string
  taskId: string
  previousProgress: number
  currentProgress: number
  description?: string
  attachments?: string  // JSON string
  updatedBy?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * AI进度描述请求
 */
export interface AIProgressDescriptionRequest {
  taskName: string
  taskDescription?: string
  currentProgress: number
  previousProgress?: number
  userInput?: string
  actionType: 'polish' | 'generate'
}

/**
 * AI进度描述响应
 */
export interface AIProgressDescriptionResponse {
  description: string
  success: boolean
  errorMessage?: string
}

/**
 * 增强进度更新（带描述和附件）
 */
export function updateTaskProgressEnhanced(taskId: string | number, request: EnhancedProgressUpdateRequest): Promise<ProgressRecord> {
  return post<ProgressRecord>(`/api/v1/milestones/tasks/${taskId}/progress-update`, request)
}

/**
 * 获取任务进度历史
 */
export function getTaskProgressHistory(taskId: string | number): Promise<ProgressRecord[]> {
  return get<ProgressRecord[]>(`/api/v1/milestones/tasks/${taskId}/progress-history`)
}

/**
 * AI生成/润色进度描述
 */
export function generateAIProgressDescription(taskId: string | number, request: AIProgressDescriptionRequest): Promise<AIProgressDescriptionResponse> {
  return post<AIProgressDescriptionResponse>(`/api/v1/milestones/tasks/${taskId}/ai-progress-description`, request)
}

/**
 * 完成任务
 */
export function completeTask(taskId: string | number): Promise<MilestoneTask> {
  return put<MilestoneTask>(`/api/v1/milestones/tasks/${taskId}/complete`)
}

/**
 * 分配任务
 */
export function assignTask(taskId: string | number, userId: string): Promise<boolean> {
  return put<boolean>(`/api/v1/milestones/tasks/${taskId}/assign`, { userId })
}

/**
 * 删除任务
 */
export function deleteTask(taskId: string | number): Promise<boolean> {
  return del<boolean>(`/api/v1/milestones/tasks/${taskId}`)
}

// ==================== 辅助函数 ====================

/**
 * 获取任务状态显示文本
 */
export function getTaskStatusText(status: TaskStatus): string {
  const statusMap: Record<TaskStatus, string> = {
    [TaskStatus.PENDING]: '待处理',
    [TaskStatus.IN_PROGRESS]: '进行中',
    [TaskStatus.COMPLETED]: '已完成',
    [TaskStatus.CANCELLED]: '已取消'
  }
  return statusMap[status] || status
}

/**
 * 获取任务状态颜色
 */
export function getTaskStatusColor(status: TaskStatus): string {
  const colorMap: Record<TaskStatus, string> = {
    [TaskStatus.PENDING]: 'default',
    [TaskStatus.IN_PROGRESS]: 'processing',
    [TaskStatus.COMPLETED]: 'success',
    [TaskStatus.CANCELLED]: 'error'
  }
  return colorMap[status] || 'default'
}

/**
 * 获取任务优先级显示文本
 */
export function getTaskPriorityText(priority: TaskPriority): string {
  const priorityMap: Record<TaskPriority, string> = {
    [TaskPriority.LOW]: '低',
    [TaskPriority.MEDIUM]: '中',
    [TaskPriority.HIGH]: '高',
    [TaskPriority.URGENT]: '紧急'
  }
  return priorityMap[priority] || priority
}

/**
 * 获取任务优先级颜色
 */
export function getTaskPriorityColor(priority: TaskPriority): string {
  const colorMap: Record<TaskPriority, string> = {
    [TaskPriority.LOW]: 'default',
    [TaskPriority.MEDIUM]: 'blue',
    [TaskPriority.HIGH]: 'orange',
    [TaskPriority.URGENT]: 'red'
  }
  return colorMap[priority] || 'default'
}