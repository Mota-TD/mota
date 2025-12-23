/**
 * 效能指标相关 API
 */

import { get } from '../request'

// DORA 指标项
export interface DoraMetricItem {
  value: number
  unit: string
  trend?: 'up' | 'down' | 'stable'
  trendValue?: number
}

// DORA 指标
export interface DoraMetrics {
  deploymentFrequency: DoraMetricItem
  leadTime: DoraMetricItem
  changeFailureRate: DoraMetricItem
  mttr: DoraMetricItem
}

// 速度指标
export interface VelocityMetrics {
  current: number
  average: number
  trend: 'up' | 'down' | 'stable'
  history: Array<{
    sprint: string
    value: number
  }>
}

// 燃尽图数据
export interface BurndownData {
  ideal: Array<{ date: string; value: number }>
  actual: Array<{ date: string; value: number }>
}

// 事项统计
export interface IssueStats {
  total: number
  open: number
  inProgress: number
  done: number
  closed: number
  byType: {
    story: number
    task: number
    bug: number
    epic: number
  }
  byPriority: {
    highest: number
    high: number
    medium: number
    low: number
    lowest: number
  }
}

// 团队效能指标
export interface TeamMetrics {
  memberCount: number
  avgVelocity: number
  completionRate: number
  bugRate: number
}

// 完整指标数据
export interface Metrics {
  dora: DoraMetrics
  velocity?: VelocityMetrics
  burndown?: BurndownData
  issueStats?: IssueStats
  team?: TeamMetrics
}

// 仪表盘统计数据
export interface DashboardStats {
  totalProjects: number
  totalIssues: number
  completedIssues: number
  inProgressIssues: number
  aiSolutions?: number
  pptGenerated?: number
}

/**
 * 获取所有效能指标
 */
export function getMetrics(params?: {
  projectId?: number
  sprintId?: number
  startDate?: string
  endDate?: string
}): Promise<Metrics> {
  return get<Metrics>('/api/v1/metrics', params)
}

/**
 * 获取 DORA 指标
 */
export function getDoraMetrics(params?: {
  projectId?: number
  startDate?: string
  endDate?: string
}): Promise<DoraMetrics> {
  return get<DoraMetrics>('/api/v1/metrics/dora', params)
}

/**
 * 获取速度指标
 */
export function getVelocityMetrics(params?: {
  projectId?: number
  sprintCount?: number
}): Promise<VelocityMetrics> {
  return get<VelocityMetrics>('/api/v1/metrics/velocity', params)
}

/**
 * 获取燃尽图数据
 */
export function getBurndownData(sprintId: number): Promise<BurndownData> {
  return get<BurndownData>(`/api/v1/sprints/${sprintId}/burndown`)
}

/**
 * 获取事项统计
 */
export function getIssueStats(params?: {
  projectId?: number
  sprintId?: number
}): Promise<IssueStats> {
  return get<IssueStats>('/api/v1/metrics/issues', params)
}

/**
 * 获取团队效能指标
 */
export function getTeamMetrics(teamId?: number): Promise<TeamMetrics> {
  return get<TeamMetrics>('/api/v1/metrics/team', { teamId })
}

/**
 * 获取仪表盘统计数据
 */
export function getDashboardStats(): Promise<DashboardStats> {
  return get<DashboardStats>('/api/v1/dashboard/stats')
}