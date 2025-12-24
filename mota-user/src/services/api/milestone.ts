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
 */
export function getMilestonesByProjectId(projectId: number | string): Promise<Milestone[]> {
  return get<Milestone[]>(`/api/v1/milestones/project/${projectId}`)
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