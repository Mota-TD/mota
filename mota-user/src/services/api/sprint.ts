/**
 * 迭代/Sprint API
 */
import { get, post, put, del } from '../request'

export interface Sprint {
  id: number
  name: string
  goal?: string
  projectId: number
  projectName?: string
  status: string
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
}

export interface SprintListResult {
  list: Sprint[]
  total: number
}

export interface SprintStats {
  totalIssues: number
  completedIssues: number
  inProgressIssues: number
  todoIssues: number
  totalStoryPoints: number
  completedStoryPoints: number
}

/**
 * 获取迭代列表
 */
export function getSprints(params?: {
  projectId?: number
  status?: string
  page?: number
  pageSize?: number
}): Promise<SprintListResult> {
  return get('/api/v1/sprints', params)
}

/**
 * 获取迭代详情
 */
export function getSprint(id: number): Promise<Sprint> {
  return get(`/api/v1/sprints/${id}`)
}

/**
 * 创建迭代
 */
export function createSprint(data: Partial<Sprint>): Promise<Sprint> {
  return post('/api/v1/sprints', data)
}

/**
 * 更新迭代
 */
export function updateSprint(id: number, data: Partial<Sprint>): Promise<Sprint> {
  return put(`/api/v1/sprints/${id}`, data)
}

/**
 * 删除迭代
 */
export function deleteSprint(id: number): Promise<void> {
  return del(`/api/v1/sprints/${id}`)
}

/**
 * 开始迭代
 */
export function startSprint(id: number): Promise<Sprint> {
  return put(`/api/v1/sprints/${id}/start`)
}

/**
 * 完成迭代
 */
export function completeSprint(id: number): Promise<Sprint> {
  return put(`/api/v1/sprints/${id}/complete`)
}

/**
 * 获取迭代统计
 */
export function getSprintStats(id: number): Promise<SprintStats> {
  return get(`/api/v1/sprints/${id}/stats`)
}

/**
 * 获取迭代下的事项
 */
export function getSprintIssues(id: number, params?: {
  status?: string
  type?: string
}): Promise<{ list: any[], total: number }> {
  return get(`/api/v1/sprints/${id}/issues`, params)
}