/**
 * 进度汇报相关 API
 * 对应后端 ProgressReportController
 */

import { get, post, put, del } from '../request'

// 汇报类型枚举
export enum ReportType {
  DAILY = 'daily',         // 日报
  WEEKLY = 'weekly',       // 周报
  MILESTONE = 'milestone', // 里程碑汇报
  ADHOC = 'adhoc'          // 临时汇报
}

// 汇报状态枚举
export enum ReportStatus {
  DRAFT = 'draft',       // 草稿
  SUBMITTED = 'submitted', // 已提交
  READ = 'read'          // 已读
}

// 任务进度快照
export interface TaskProgressSnapshot {
  taskId: number
  taskName: string
  progress: number
  status: string
}

// 进度汇报信息
export interface ProgressReport {
  id: number
  projectId: number
  departmentTaskId?: number
  reportType: ReportType
  reporterId: number
  reportPeriodStart?: string
  reportPeriodEnd?: string
  completedWork?: string
  plannedWork?: string
  issuesRisks?: string
  supportNeeded?: string
  taskProgress?: TaskProgressSnapshot[]
  recipients?: number[]
  status: ReportStatus
  submittedAt?: string
  createdAt?: string
  updatedAt?: string
  // 关联信息
  reporterName?: string
  reporterAvatar?: string
  projectName?: string
  departmentTaskName?: string
  recipientNames?: string[]
}

// 进度汇报列表响应
export interface ProgressReportListResponse {
  list: ProgressReport[]
  total: number
}

// 创建进度汇报请求
export interface CreateProgressReportRequest {
  projectId: number
  departmentTaskId?: number
  reportType: ReportType
  reportPeriodStart?: string
  reportPeriodEnd?: string
  completedWork?: string
  plannedWork?: string
  issuesRisks?: string
  supportNeeded?: string
  taskProgress?: TaskProgressSnapshot[]
  recipients?: number[]
}

// 更新进度汇报请求
export interface UpdateProgressReportRequest {
  completedWork?: string
  plannedWork?: string
  issuesRisks?: string
  supportNeeded?: string
  taskProgress?: TaskProgressSnapshot[]
  recipients?: number[]
}

// 分页查询参数
export interface ProgressReportQueryParams {
  [key: string]: string | number | boolean | undefined
  projectId?: number
  departmentTaskId?: number
  reportType?: ReportType
  reporterId?: number
  status?: ReportStatus
  page?: number
  pageSize?: number
}

/**
 * 获取进度汇报列表（分页）
 */
export async function getProgressReports(params?: ProgressReportQueryParams): Promise<ProgressReportListResponse> {
  const response = await get<{ records: ProgressReport[]; total: number }>('/api/v1/progress-reports', params)
  return {
    list: response?.records || [],
    total: response?.total || 0
  }
}

/**
 * 根据项目ID获取进度汇报列表
 */
export function getReportsByProjectId(projectId: number): Promise<ProgressReport[]> {
  return get<ProgressReport[]>(`/api/v1/progress-reports/project/${projectId}`)
}

/**
 * 根据部门任务ID获取进度汇报列表
 */
export function getReportsByDepartmentTaskId(departmentTaskId: number): Promise<ProgressReport[]> {
  return get<ProgressReport[]>(`/api/v1/progress-reports/department-task/${departmentTaskId}`)
}

/**
 * 获取用户提交的汇报列表
 */
export function getReportsByReporter(reporterId: number): Promise<ProgressReport[]> {
  return get<ProgressReport[]>(`/api/v1/progress-reports/reporter/${reporterId}`)
}

/**
 * 获取用户收到的汇报列表
 */
export function getReceivedReports(userId: number): Promise<ProgressReport[]> {
  return get<ProgressReport[]>(`/api/v1/progress-reports/received/${userId}`)
}

/**
 * 获取进度汇报详情
 */
export function getProgressReportById(id: number): Promise<ProgressReport> {
  return get<ProgressReport>(`/api/v1/progress-reports/${id}`)
}

/**
 * 创建进度汇报（草稿）
 */
export function createProgressReport(data: CreateProgressReportRequest): Promise<ProgressReport> {
  return post<ProgressReport>('/api/v1/progress-reports', data)
}

/**
 * 更新进度汇报
 */
export function updateProgressReport(id: number, data: UpdateProgressReportRequest): Promise<ProgressReport> {
  return put<ProgressReport>(`/api/v1/progress-reports/${id}`, data)
}

/**
 * 删除进度汇报
 */
export function deleteProgressReport(id: number): Promise<void> {
  return del<void>(`/api/v1/progress-reports/${id}`)
}

/**
 * 提交进度汇报
 */
export function submitProgressReport(id: number): Promise<ProgressReport> {
  return post<ProgressReport>(`/api/v1/progress-reports/${id}/submit`)
}

/**
 * 标记汇报为已读
 */
export function markReportAsRead(id: number): Promise<void> {
  return put<void>(`/api/v1/progress-reports/${id}/read`)
}

/**
 * 获取本周周报
 */
export function getCurrentWeekReport(projectId: number, reporterId: number): Promise<ProgressReport | null> {
  return get<ProgressReport | null>(`/api/v1/progress-reports/project/${projectId}/weekly/current`, { reporterId })
}

/**
 * 获取今日日报
 */
export function getTodayReport(projectId: number, reporterId: number): Promise<ProgressReport | null> {
  return get<ProgressReport | null>(`/api/v1/progress-reports/project/${projectId}/daily/today`, { reporterId })
}

/**
 * 获取汇报类型显示文本
 */
export function getReportTypeText(type: ReportType): string {
  const typeMap: Record<ReportType, string> = {
    [ReportType.DAILY]: '日报',
    [ReportType.WEEKLY]: '周报',
    [ReportType.MILESTONE]: '里程碑汇报',
    [ReportType.ADHOC]: '临时汇报'
  }
  return typeMap[type] || type
}

/**
 * 获取汇报类型颜色
 */
export function getReportTypeColor(type: ReportType): string {
  const colorMap: Record<ReportType, string> = {
    [ReportType.DAILY]: 'blue',
    [ReportType.WEEKLY]: 'green',
    [ReportType.MILESTONE]: 'gold',
    [ReportType.ADHOC]: 'purple'
  }
  return colorMap[type] || 'default'
}

/**
 * 获取状态显示文本
 */
export function getStatusText(status: ReportStatus): string {
  const statusMap: Record<ReportStatus, string> = {
    [ReportStatus.DRAFT]: '草稿',
    [ReportStatus.SUBMITTED]: '已提交',
    [ReportStatus.READ]: '已读'
  }
  return statusMap[status] || status
}

/**
 * 获取状态颜色
 */
export function getStatusColor(status: ReportStatus): string {
  const colorMap: Record<ReportStatus, string> = {
    [ReportStatus.DRAFT]: 'default',
    [ReportStatus.SUBMITTED]: 'processing',
    [ReportStatus.READ]: 'success'
  }
  return colorMap[status] || 'default'
}

/**
 * 获取当前周的日期范围
 */
export function getCurrentWeekRange(): { start: string; end: string } {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)) // 周一开始
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6) // 周日结束
  
  return {
    start: startOfWeek.toISOString().split('T')[0],
    end: endOfWeek.toISOString().split('T')[0]
  }
}

/**
 * 获取今天的日期
 */
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * 格式化汇报周期
 */
export function formatReportPeriod(start?: string, end?: string): string {
  if (!start && !end) return '未设置'
  if (start === end) return start || ''
  return `${start || '?'} ~ ${end || '?'}`
}

/**
 * 检查是否可以提交日报（今天是否已提交）
 */
export async function canSubmitDailyReport(projectId: number, reporterId: number): Promise<boolean> {
  const report = await getTodayReport(projectId, reporterId)
  return !report || report.status === ReportStatus.DRAFT
}

/**
 * 检查是否可以提交周报（本周是否已提交）
 */
export async function canSubmitWeeklyReport(projectId: number, reporterId: number): Promise<boolean> {
  const report = await getCurrentWeekReport(projectId, reporterId)
  return !report || report.status === ReportStatus.DRAFT
}