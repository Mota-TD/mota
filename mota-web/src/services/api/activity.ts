/**
 * 活动动态相关 API
 */

import { get } from '../request'

// 活动类型
export type ActivityType = 
  | 'issue_created'
  | 'issue_updated'
  | 'issue_completed'
  | 'comment_added'
  | 'member_joined'
  | 'project_created'
  | 'sprint_started'
  | 'sprint_completed'

// 用户简要信息
export interface ActivityUser {
  id: string
  name: string
  avatar?: string
}

// 活动信息
export interface Activity {
  id: string
  type: ActivityType
  action: string
  target: string
  targetId?: string
  userId: string
  user?: ActivityUser
  projectId?: string
  time: string
  createdAt?: string
}

// 活动列表响应
export interface ActivityListResponse {
  list: Activity[]
  total: number
}

/**
 * 获取活动动态列表
 */
export function getActivities(params?: {
  projectId?: string
  userId?: string
  type?: ActivityType
  page?: number
  pageSize?: number
}): Promise<ActivityListResponse> {
  return get<ActivityListResponse>('/api/v1/activities', params)
}

/**
 * 获取最近活动动态
 */
export function getRecentActivities(limit?: number): Promise<Activity[]> {
  return get<Activity[]>('/api/v1/activities/recent', { limit })
}

/**
 * 获取项目活动动态
 */
export function getProjectActivities(projectId: string | number, params?: {
  page?: number
  pageSize?: number
}): Promise<ActivityListResponse> {
  return get<ActivityListResponse>(`/api/v1/projects/${projectId}/activities`, params)
}

/**
 * 获取用户活动动态
 */
export function getUserActivities(userId: string | number, params?: {
  page?: number
  pageSize?: number
}): Promise<ActivityListResponse> {
  return get<ActivityListResponse>(`/api/v1/users/${userId}/activities`, params)
}