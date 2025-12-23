/**
 * 事项相关 API
 */

import { get, post, put, del } from '../request'

// 事项类型
export type IssueType = 'story' | 'task' | 'bug' | 'epic'

// 事项状态
export type IssueStatus = 'open' | 'in_progress' | 'done' | 'closed'

// 事项优先级
export type IssuePriority = 'highest' | 'high' | 'medium' | 'low' | 'lowest'

// 事项信息
export interface Issue {
  id: number
  key: string
  title: string
  type: IssueType
  status: IssueStatus
  priority: IssuePriority
  assignee?: number
  assigneeName?: string
  reporter?: number
  reporterName?: string
  projectId: number
  projectName?: string
  sprintId?: number
  storyPoints?: number
  description?: string
  dueDate?: string
  createdAt?: string
  updatedAt?: string
}

// 事项列表响应
export interface IssueListResponse {
  list: Issue[]
  total: number
}

// 创建事项请求
export interface CreateIssueRequest {
  title: string
  type: IssueType
  priority: IssuePriority
  projectId: number
  description?: string
  assignee?: number
  sprintId?: number
  storyPoints?: number
  dueDate?: string
}

// 更新事项请求
export interface UpdateIssueRequest {
  title?: string
  type?: IssueType
  status?: IssueStatus
  priority?: IssuePriority
  assignee?: number
  sprintId?: number
  storyPoints?: number
  description?: string
  dueDate?: string
}

/**
 * 获取事项列表
 */
export function getIssues(params?: {
  projectId?: number
  sprintId?: number
  status?: string
  type?: string
  assignee?: number
  search?: string
  page?: number
  pageSize?: number
}): Promise<IssueListResponse> {
  return get<IssueListResponse>('/api/v1/issues', params)
}

/**
 * 获取事项详情
 */
export function getIssueById(id: number): Promise<Issue> {
  return get<Issue>(`/api/v1/issues/${id}`)
}

/**
 * 根据 key 获取事项详情
 */
export function getIssueByKey(key: string): Promise<Issue> {
  return get<Issue>(`/api/v1/issues/key/${key}`)
}

/**
 * 创建事项
 */
export function createIssue(data: CreateIssueRequest): Promise<Issue> {
  return post<Issue>('/api/v1/issues', data)
}

/**
 * 更新事项
 */
export function updateIssue(id: number, data: UpdateIssueRequest): Promise<Issue> {
  return put<Issue>(`/api/v1/issues/${id}`, data)
}

/**
 * 删除事项
 */
export function deleteIssue(id: number): Promise<void> {
  return del<void>(`/api/v1/issues/${id}`)
}

/**
 * 更新事项状态
 */
export function updateIssueStatus(id: number, status: IssueStatus): Promise<Issue> {
  return put<Issue>(`/api/v1/issues/${id}/status`, { status })
}

/**
 * 获取我的事项
 */
export function getMyIssues(params?: {
  status?: string
  page?: number
  pageSize?: number
}): Promise<IssueListResponse> {
  return get<IssueListResponse>('/api/v1/issues/my', params)
}

/**
 * 获取待办事项
 */
export function getTodoIssues(limit?: number): Promise<Issue[]> {
  return get<Issue[]>('/api/v1/issues/todo', { limit })
}