/**
 * 仪表盘 API
 */
import { get } from '../request'

// 仪表盘统计数据
export interface DashboardStats {
  projectCount: number
  activityCount: number
  issueCount: number
  completedIssueCount: number
  inProgressIssueCount: number
  todoIssueCount: number
  memberCount: number
  sprintCount: number
  activeSprintCount: number
  weekStats: {
    newIssues: number
    completedIssues: number
    newProjects: number
  }
  issueTrend: number[]
  completionTrend: number[]
}

// 项目概览数据
export interface ProjectOverview {
  total: number
  active: number
  completed: number
  archived: number
}

// 团队工作量数据
export interface WorkloadItem {
  name: string
  assigned: number
  completed: number
  inProgress: number
}

/**
 * 获取仪表盘统计数据
 */
export function getDashboardStats(): Promise<DashboardStats> {
  return get<DashboardStats>('/api/v1/dashboard/stats')
}

/**
 * 获取项目概览
 */
export function getProjectOverview(): Promise<ProjectOverview> {
  return get<ProjectOverview>('/api/v1/dashboard/project-overview')
}

/**
 * 获取团队工作量
 */
export function getWorkload(): Promise<WorkloadItem[]> {
  return get<WorkloadItem[]>('/api/v1/dashboard/workload')
}