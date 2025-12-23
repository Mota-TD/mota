/**
 * 项目相关 API
 */

import { get, post, put, del } from '../request'

// 项目信息
export interface Project {
  id: number
  name: string
  key: string
  description?: string
  status: string
  owner: number
  memberCount: number
  issueCount: number
  color?: string
  starred?: boolean
  progress?: number
  createdAt?: string
  updatedAt?: string
}

// 项目列表响应
export interface ProjectListResponse {
  list: Project[]
  total: number
}

// 创建项目请求
export interface CreateProjectRequest {
  name: string
  key: string
  description?: string
  color?: string
}

// 更新项目请求
export interface UpdateProjectRequest {
  name?: string
  description?: string
  status?: string
  color?: string
}

/**
 * 获取项目列表
 */
export function getProjects(params?: {
  status?: string
  search?: string
  page?: number
  pageSize?: number
}): Promise<ProjectListResponse> {
  return get<ProjectListResponse>('/api/v1/projects', params)
}

/**
 * 获取项目详情
 */
export function getProjectById(id: number): Promise<Project> {
  return get<Project>(`/api/v1/projects/${id}`)
}

/**
 * 获取项目详情 (别名)
 */
export const getProject = getProjectById

/**
 * 创建项目
 */
export function createProject(data: CreateProjectRequest): Promise<Project> {
  return post<Project>('/api/v1/projects', data)
}

/**
 * 更新项目
 */
export function updateProject(id: number, data: UpdateProjectRequest): Promise<Project> {
  return put<Project>(`/api/v1/projects/${id}`, data)
}

/**
 * 删除项目
 */
export function deleteProject(id: number): Promise<void> {
  return del<void>(`/api/v1/projects/${id}`)
}

/**
 * 收藏/取消收藏项目
 */
export function toggleProjectStar(id: number): Promise<{ starred: boolean }> {
  return post<{ starred: boolean }>(`/api/v1/projects/${id}/star`)
}

/**
 * 获取最近访问的项目
 */
export function getRecentProjects(limit?: number): Promise<Project[]> {
  return get<Project[]>('/api/v1/projects/recent', { limit })
}