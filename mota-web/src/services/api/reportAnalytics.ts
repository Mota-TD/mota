/**
 * 报表分析 API 服务
 * 提供报表分析相关功能：团队效能指标、平均完成时间、逾期率统计、成员贡献度
 */

import request from '../request'

// ==================== 类型定义 ====================

/** 效能指标趋势 */
export interface EfficiencyTrend {
  period: string
  completionRate: number
  onTimeRate: number
  avgCompletionDays: number
  velocity: number
}

/** 团队效能KPI */
export interface TeamEfficiencyKPI {
  teamId: number
  teamName: string
  period: string
  // 核心指标
  totalTasks: number
  completedTasks: number
  completionRate: number
  onTimeCompletionRate: number
  avgCompletionDays: number
  velocity: number // 速度（每周完成任务数）
  // 质量指标
  bugRate: number
  reworkRate: number
  firstTimePassRate: number
  // 效率指标
  utilizationRate: number
  focusTime: number // 专注时间（小时）
  meetingTime: number // 会议时间（小时）
  // 趋势数据
  trends: EfficiencyTrend[]
  // 与上期对比
  completionRateChange: number
  onTimeRateChange: number
  velocityChange: number
}

/** 任务完成时间分布 */
export interface CompletionTimeDistribution {
  range: string // 如 "0-1天", "1-3天", "3-7天", "7-14天", ">14天"
  count: number
  percentage: number
}

/** 按优先级的完成时间 */
export interface CompletionTimeByPriority {
  priority: string
  avgDays: number
  minDays: number
  maxDays: number
  taskCount: number
}

/** 按类型的完成时间 */
export interface CompletionTimeByType {
  taskType: string
  avgDays: number
  taskCount: number
}

/** 完成时间趋势 */
export interface CompletionTimeTrend {
  period: string
  avgDays: number
  medianDays: number
  taskCount: number
}

/** 平均完成时间数据 */
export interface AvgCompletionTimeData {
  teamId: number
  teamName: string
  period: string
  // 总体统计
  totalCompletedTasks: number
  avgCompletionDays: number
  medianCompletionDays: number
  minCompletionDays: number
  maxCompletionDays: number
  // 分布数据
  distribution: CompletionTimeDistribution[]
  // 按优先级
  byPriority: CompletionTimeByPriority[]
  // 按类型
  byType: CompletionTimeByType[]
  // 趋势
  trends: CompletionTimeTrend[]
  // 与上期对比
  avgDaysChange: number
}

/** 逾期任务详情 */
export interface OverdueTask {
  taskId: number
  taskName: string
  projectId: number
  projectName: string
  assigneeId: number
  assigneeName: string
  assigneeAvatar: string
  dueDate: string
  overdueDays: number
  priority: string
  status: string
}

/** 逾期原因分析 */
export interface OverdueReason {
  reason: string
  count: number
  percentage: number
}

/** 逾期趋势 */
export interface OverdueTrend {
  period: string
  totalTasks: number
  overdueTasks: number
  overdueRate: number
}

/** 按成员的逾期统计 */
export interface OverdueByMember {
  userId: number
  userName: string
  avatar: string
  totalTasks: number
  overdueTasks: number
  overdueRate: number
}

/** 逾期率统计数据 */
export interface OverdueRateData {
  teamId: number
  teamName: string
  period: string
  // 总体统计
  totalTasks: number
  overdueTasks: number
  overdueRate: number
  avgOverdueDays: number
  // 严重程度分布
  slightlyOverdue: number // 1-3天
  moderatelyOverdue: number // 3-7天
  severelyOverdue: number // >7天
  // 逾期任务列表
  overdueTasks_list: OverdueTask[]
  // 原因分析
  reasons: OverdueReason[]
  // 趋势
  trends: OverdueTrend[]
  // 按成员
  byMember: OverdueByMember[]
  // 与上期对比
  overdueRateChange: number
}

/** 成员贡献详情 */
export interface MemberContribution {
  userId: number
  userName: string
  avatar: string
  department: string
  position: string
  // 任务贡献
  totalTasks: number
  completedTasks: number
  completionRate: number
  // 工时贡献
  totalHours: number
  hoursPercentage: number
  // 质量指标
  onTimeRate: number
  avgCompletionDays: number
  // 协作指标
  commentsCount: number
  reviewsCount: number
  helpedOthers: number
  // 综合得分
  contributionScore: number
  rank: number
  // 趋势
  trend: 'UP' | 'DOWN' | 'STABLE'
  scoreChange: number
}

/** 贡献度分布 */
export interface ContributionDistribution {
  level: string // 如 "核心贡献者", "活跃贡献者", "一般贡献者", "待提升"
  count: number
  percentage: number
}

/** 贡献趋势 */
export interface ContributionTrend {
  period: string
  avgScore: number
  topContributorScore: number
  bottomContributorScore: number
}

/** 成员贡献度数据 */
export interface MemberContributionData {
  teamId: number
  teamName: string
  period: string
  // 总体统计
  totalMembers: number
  avgContributionScore: number
  // 成员列表
  members: MemberContribution[]
  // 分布
  distribution: ContributionDistribution[]
  // 趋势
  trends: ContributionTrend[]
  // Top贡献者
  topContributors: MemberContribution[]
}

// ==================== API 方法 ====================

/**
 * 获取团队效能指标
 * RP-004: 团队效能KPI展示
 */
export function getTeamEfficiency(params: {
  teamId?: number
  period?: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY'
  startDate: string
  endDate: string
}): Promise<TeamEfficiencyKPI> {
  return request.get('/api/report-analytics/team-efficiency', params)
}

/**
 * 获取平均完成时间
 * RP-006: 任务平均完成时间
 */
export function getAvgCompletionTime(params: {
  teamId?: number
  projectId?: number
  startDate: string
  endDate: string
}): Promise<AvgCompletionTimeData> {
  return request.get('/api/report-analytics/avg-completion-time', params)
}

/**
 * 获取逾期率统计
 * RP-007: 任务逾期率分析
 */
export function getOverdueRate(params: {
  teamId?: number
  projectId?: number
  startDate: string
  endDate: string
}): Promise<OverdueRateData> {
  return request.get('/api/report-analytics/overdue-rate', params)
}

/**
 * 获取成员贡献度
 * RP-008: 成员贡献度排行
 */
export function getMemberContribution(params: {
  teamId?: number
  period?: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY'
  startDate: string
  endDate: string
}): Promise<MemberContributionData> {
  return request.get('/api/report-analytics/member-contribution', params)
}

/**
 * 导出报表
 */
export function exportReport(params: {
  reportType: 'EFFICIENCY' | 'COMPLETION_TIME' | 'OVERDUE' | 'CONTRIBUTION'
  teamId?: number
  startDate: string
  endDate: string
  format: 'PDF' | 'EXCEL'
}): Promise<Blob> {
  return request.get('/api/report-analytics/export', params)
}

export default {
  getTeamEfficiency,
  getAvgCompletionTime,
  getOverdueRate,
  getMemberContribution,
  exportReport
}