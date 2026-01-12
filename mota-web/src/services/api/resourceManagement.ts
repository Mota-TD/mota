/**
 * 资源管理 API 服务
 * 提供资源管理相关功能：工作量统计、团队分布、工作量预警、资源日历、资源利用率、跨项目冲突检测
 */

import request from '../request'

// ==================== 类型定义 ====================

/** 每日工作量 */
export interface DailyWorkload {
  date: string
  plannedHours: number
  actualHours: number
  taskCount: number
}

/** 项目工作量 */
export interface ProjectWorkload {
  projectId: number
  projectName: string
  taskCount: number
  hoursPercentage: number
  totalHours: number
}

/** 工作量统计数据 */
export interface WorkloadStatsData {
  userId: number
  userName: string
  avatar: string
  totalTasks: number
  inProgressTasks: number
  completedTasks: number
  overdueTasks: number
  totalHours: number
  usedHours: number
  remainingHours: number
  workloadPercentage: number
  workloadStatus: 'LIGHT' | 'NORMAL' | 'HEAVY' | 'OVERLOAD'
  dailyWorkloads: DailyWorkload[]
  projectWorkloads: ProjectWorkload[]
}

/** 成员工作量 */
export interface MemberWorkload {
  userId: number
  userName: string
  avatar: string
  taskCount: number
  hours: number
  workloadPercentage: number
  workloadStatus: string
  completionRate: number
}

/** 状态分布 */
export interface StatusDistribution {
  pending: number
  inProgress: number
  completed: number
  cancelled: number
  overdue: number
}

/** 优先级分布 */
export interface PriorityDistribution {
  urgent: number
  high: number
  medium: number
  low: number
}

/** 团队分布数据 */
export interface TeamDistributionData {
  teamId: number
  teamName: string
  totalMembers: number
  activeMembers: number
  totalTasks: number
  totalHours: number
  averageWorkload: number
  memberWorkloads: MemberWorkload[]
  statusDistribution: StatusDistribution
  priorityDistribution: PriorityDistribution
}

/** 预警详情 */
export interface Alert {
  alertId: number
  userId: number
  userName: string
  avatar: string
  alertType: 'OVERLOAD' | 'IDLE' | 'NEAR_OVERLOAD' | 'DEADLINE_RISK'
  alertLevel: 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  description: string
  currentWorkload: number
  suggestedWorkload: number
  affectedTasks: number
  affectedProjects: string[]
  suggestions: string[]
  alertTime: string
  resolved: boolean
  resolvedTime?: string
}

/** 预警统计 */
export interface AlertSummary {
  date: string
  overloadCount: number
  idleCount: number
  normalCount: number
}

/** 工作量预警数据 */
export interface WorkloadAlertData {
  totalAlerts: number
  overloadAlerts: number
  idleAlerts: number
  nearOverloadAlerts: number
  alerts: Alert[]
  alertTrend: AlertSummary[]
}

/** 日期列 */
export interface DateColumn {
  date: string
  dayOfWeek: string
  isWorkday: boolean
  isHoliday: boolean
  holidayName?: string
}

/** 任务分配 */
export interface TaskAllocation {
  taskId: number
  taskName: string
  projectId: number
  projectName: string
  hours: number
  priority: string
  startTime?: string
  endTime?: string
}

/** 每日分配 */
export interface DayAllocation {
  date: string
  availableHours: number
  allocatedHours: number
  utilizationPercentage: number
  status: 'AVAILABLE' | 'PARTIAL' | 'FULL' | 'OVERLOAD' | 'OFF'
  tasks: TaskAllocation[]
}

/** 资源行 */
export interface ResourceRow {
  userId: number
  userName: string
  avatar: string
  department: string
  position: string
  allocations: DayAllocation[]
}

/** 资源日历数据 */
export interface ResourceCalendarData {
  startDate: string
  endDate: string
  resources: ResourceRow[]
  dates: DateColumn[]
}

/** 利用率趋势 */
export interface UtilizationTrend {
  period: string
  availableHours: number
  actualHours: number
  utilizationPercentage: number
  billableHours: number
  billableRate: number
}

/** 成员利用率 */
export interface MemberUtilization {
  userId: number
  userName: string
  avatar: string
  department: string
  availableHours: number
  allocatedHours: number
  actualHours: number
  utilizationPercentage: number
  efficiencyIndex: number
  utilizationStatus: 'LOW' | 'OPTIMAL' | 'HIGH' | 'OVERUTILIZED'
  trend: 'UP' | 'DOWN' | 'STABLE'
}

/** 项目利用率 */
export interface ProjectUtilization {
  projectId: number
  projectName: string
  allocatedHours: number
  actualHours: number
  hoursPercentage: number
  memberCount: number
}

/** 利用率分布 */
export interface UtilizationDistribution {
  lowCount: number
  optimalCount: number
  highCount: number
  overutilizedCount: number
}

/** 资源利用率数据 */
export interface ResourceUtilizationData {
  period: string
  startDate: string
  endDate: string
  teamAverageUtilization: number
  targetUtilization: number
  utilizationTrends: UtilizationTrend[]
  memberUtilizations: MemberUtilization[]
  projectUtilizations: ProjectUtilization[]
  distribution: UtilizationDistribution
}

/** 冲突用户 */
export interface ConflictUser {
  userId: number
  userName: string
  avatar: string
  department: string
}

/** 冲突项目 */
export interface ConflictProject {
  projectId: number
  projectName: string
  priority: string
  allocatedHours: number
}

/** 冲突任务 */
export interface ConflictTask {
  taskId: number
  taskName: string
  projectId: number
  projectName: string
  startDate: string
  endDate: string
  estimatedHours: number
  priority: string
}

/** 解决建议 */
export interface ResolutionSuggestion {
  suggestionType: 'REASSIGN' | 'RESCHEDULE' | 'SPLIT' | 'PRIORITIZE'
  description: string
  impactAssessment: string
  recommendationScore: number
}

/** 冲突详情 */
export interface Conflict {
  conflictId: number
  conflictType: 'TIME_OVERLAP' | 'RESOURCE_OVERLOAD' | 'SKILL_MISMATCH' | 'DEADLINE_CONFLICT'
  conflictLevel: 'HIGH' | 'MEDIUM' | 'LOW'
  description: string
  user: ConflictUser
  projects: ConflictProject[]
  tasks: ConflictTask[]
  conflictStartDate: string
  conflictEndDate: string
  conflictHours: number
  availableHours: number
  excessHours: number
  suggestions: ResolutionSuggestion[]
  resolved: boolean
  resolution?: string
  detectedTime: string
  resolvedTime?: string
}

/** 受影响的用户 */
export interface AffectedUser {
  userId: number
  userName: string
  avatar: string
  conflictCount: number
  projectCount: number
  excessHours: number
}

/** 跨项目冲突数据 */
export interface ProjectConflictData {
  totalConflicts: number
  highPriorityConflicts: number
  mediumPriorityConflicts: number
  lowPriorityConflicts: number
  resolvedConflicts: number
  conflicts: Conflict[]
  affectedUsers: AffectedUser[]
}

// ==================== API 方法 ====================

/**
 * 获取个人工作量统计
 * RM-001: 个人任务负载可视化
 */
export function getWorkloadStats(
  userId: number,
  startDate: string,
  endDate: string
): Promise<WorkloadStatsData> {
  return request.get(`/api/resource-management/workload-stats/${userId}`, { startDate, endDate })
}

/**
 * 获取团队工作量统计
 * RM-001: 团队成员任务负载可视化
 */
export function getTeamWorkloadStats(params: {
  teamId?: string | number
  startDate: string
  endDate: string
}): Promise<WorkloadStatsData[]> {
  return request.get('/api/resource-management/workload-stats/team', params)
}

/**
 * 获取团队工作量分布
 * RM-002: 团队工作量分布图
 */
export function getTeamDistribution(
  teamId: string | number,
  startDate: string,
  endDate: string
): Promise<TeamDistributionData> {
  return request.get(`/api/resource-management/team-distribution/${teamId}`, { startDate, endDate })
}

/**
 * 获取工作量预警
 * RM-003: 过载/空闲预警提示
 */
export function getWorkloadAlerts(params?: {
  teamId?: string | number
}): Promise<WorkloadAlertData> {
  return request.get('/api/resource-management/workload-alerts', params)
}

/**
 * 标记预警为已处理
 */
export function resolveAlert(alertId: number): Promise<{ success: boolean; message: string }> {
  return request.post(`/api/resource-management/workload-alerts/${alertId}/resolve`)
}

/**
 * 获取资源日历
 * RM-004: 资源日历视图
 */
export function getResourceCalendar(params: {
  teamId?: string | number
  startDate: string
  endDate: string
}): Promise<ResourceCalendarData> {
  return request.get('/api/resource-management/resource-calendar', params)
}

/**
 * 获取资源利用率
 * RM-005: 资源利用率图表
 */
export function getResourceUtilization(params: {
  teamId?: string | number
  period?: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  startDate: string
  endDate: string
}): Promise<ResourceUtilizationData> {
  return request.get('/api/resource-management/resource-utilization', params)
}

/**
 * 获取跨项目资源冲突
 * RM-006: 跨项目资源冲突检测
 */
export function getProjectConflicts(params: {
  teamId?: string | number
  userId?: string | number
  startDate: string
  endDate: string
}): Promise<ProjectConflictData> {
  return request.get('/api/resource-management/project-conflicts', params)
}

/**
 * 解决资源冲突
 */
export function resolveConflict(
  conflictId: number,
  resolution: string
): Promise<{ success: boolean; message: string }> {
  return request.post(`/api/resource-management/project-conflicts/${conflictId}/resolve`, {
    resolution
  })
}

export default {
  getWorkloadStats,
  getTeamWorkloadStats,
  getTeamDistribution,
  getWorkloadAlerts,
  resolveAlert,
  getResourceCalendar,
  getResourceUtilization,
  getProjectConflicts,
  resolveConflict
}