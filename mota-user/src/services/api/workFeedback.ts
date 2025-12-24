/**
 * 工作反馈相关 API
 * 对应后端 WorkFeedbackController
 */

import { get, post, put, del } from '../request'

// 反馈类型枚举
export enum FeedbackType {
  GUIDANCE = 'guidance',         // 工作指导
  EVALUATION = 'evaluation',     // 工作评价
  PROBLEM = 'problem',           // 问题反馈
  COLLABORATION = 'collaboration', // 协作请求
  REPORT = 'report'              // 进度汇报
}

// 反馈状态枚举
export enum FeedbackStatus {
  PENDING = 'pending',   // 待处理
  READ = 'read',         // 已读
  REPLIED = 'replied'    // 已回复
}

// 工作反馈信息
export interface WorkFeedback {
  id: number
  projectId?: number
  taskId?: number
  feedbackType: FeedbackType
  fromUserId: number
  toUserId: number
  title?: string
  content: string
  rating?: number
  requireReply: boolean
  status: FeedbackStatus
  replyContent?: string
  repliedAt?: string
  createdAt?: string
  updatedAt?: string
  // 关联信息
  fromUserName?: string
  fromUserAvatar?: string
  toUserName?: string
  toUserAvatar?: string
  projectName?: string
  taskName?: string
}

// 工作反馈列表响应
export interface WorkFeedbackListResponse {
  list: WorkFeedback[]
  total: number
}

// 创建工作反馈请求
export interface CreateWorkFeedbackRequest {
  projectId?: number
  taskId?: number
  feedbackType: FeedbackType
  toUserId: number
  title?: string
  content: string
  rating?: number
  requireReply?: boolean
}

// 回复工作反馈请求
export interface ReplyWorkFeedbackRequest {
  replyContent: string
}

// 分页查询参数
export interface WorkFeedbackQueryParams {
  [key: string]: string | number | boolean | undefined
  projectId?: number
  taskId?: number
  feedbackType?: FeedbackType
  fromUserId?: number
  toUserId?: number
  status?: FeedbackStatus
  page?: number
  pageSize?: number
}

/**
 * 获取工作反馈列表（分页）
 */
export async function getWorkFeedbacks(params?: WorkFeedbackQueryParams): Promise<WorkFeedbackListResponse> {
  const response = await get<{ records: WorkFeedback[]; total: number }>('/api/v1/work-feedbacks', params)
  return {
    list: response?.records || [],
    total: response?.total || 0
  }
}

/**
 * 获取收到的反馈列表
 */
export function getReceivedFeedbacks(userId: number): Promise<WorkFeedback[]> {
  return get<WorkFeedback[]>(`/api/v1/work-feedbacks/received/${userId}`)
}

/**
 * 获取发出的反馈列表
 */
export function getSentFeedbacks(userId: number): Promise<WorkFeedback[]> {
  return get<WorkFeedback[]>(`/api/v1/work-feedbacks/sent/${userId}`)
}

/**
 * 根据任务ID获取反馈列表
 */
export function getFeedbacksByTaskId(taskId: number): Promise<WorkFeedback[]> {
  return get<WorkFeedback[]>(`/api/v1/work-feedbacks/task/${taskId}`)
}

/**
 * 获取工作反馈详情
 */
export function getWorkFeedbackById(id: number): Promise<WorkFeedback> {
  return get<WorkFeedback>(`/api/v1/work-feedbacks/${id}`)
}

/**
 * 创建工作反馈
 */
export function createWorkFeedback(data: CreateWorkFeedbackRequest): Promise<WorkFeedback> {
  return post<WorkFeedback>('/api/v1/work-feedbacks', data)
}

/**
 * 回复工作反馈
 */
export function replyWorkFeedback(id: number, data: ReplyWorkFeedbackRequest): Promise<WorkFeedback> {
  return post<WorkFeedback>(`/api/v1/work-feedbacks/${id}/reply`, data)
}

/**
 * 标记反馈为已读
 */
export function markFeedbackAsRead(id: number): Promise<void> {
  return put<void>(`/api/v1/work-feedbacks/${id}/read`)
}

/**
 * 删除工作反馈
 */
export function deleteWorkFeedback(id: number): Promise<void> {
  return del<void>(`/api/v1/work-feedbacks/${id}`)
}

/**
 * 获取未读反馈数量
 */
export function getUnreadFeedbackCount(userId: number): Promise<number> {
  return get<number>(`/api/v1/work-feedbacks/received/${userId}/unread-count`)
}

/**
 * 批量标记为已读
 */
export function markAllFeedbacksAsRead(userId: number): Promise<void> {
  return put<void>(`/api/v1/work-feedbacks/received/${userId}/read-all`)
}

/**
 * 获取反馈类型显示文本
 */
export function getFeedbackTypeText(type: FeedbackType): string {
  const typeMap: Record<FeedbackType, string> = {
    [FeedbackType.GUIDANCE]: '工作指导',
    [FeedbackType.EVALUATION]: '工作评价',
    [FeedbackType.PROBLEM]: '问题反馈',
    [FeedbackType.COLLABORATION]: '协作请求',
    [FeedbackType.REPORT]: '进度汇报'
  }
  return typeMap[type] || type
}

/**
 * 获取反馈类型颜色
 */
export function getFeedbackTypeColor(type: FeedbackType): string {
  const colorMap: Record<FeedbackType, string> = {
    [FeedbackType.GUIDANCE]: 'blue',
    [FeedbackType.EVALUATION]: 'gold',
    [FeedbackType.PROBLEM]: 'red',
    [FeedbackType.COLLABORATION]: 'purple',
    [FeedbackType.REPORT]: 'green'
  }
  return colorMap[type] || 'default'
}

/**
 * 获取反馈类型图标
 */
export function getFeedbackTypeIcon(type: FeedbackType): string {
  const iconMap: Record<FeedbackType, string> = {
    [FeedbackType.GUIDANCE]: 'bulb',
    [FeedbackType.EVALUATION]: 'star',
    [FeedbackType.PROBLEM]: 'question-circle',
    [FeedbackType.COLLABORATION]: 'team',
    [FeedbackType.REPORT]: 'file-text'
  }
  return iconMap[type] || 'message'
}

/**
 * 获取状态显示文本
 */
export function getStatusText(status: FeedbackStatus): string {
  const statusMap: Record<FeedbackStatus, string> = {
    [FeedbackStatus.PENDING]: '待处理',
    [FeedbackStatus.READ]: '已读',
    [FeedbackStatus.REPLIED]: '已回复'
  }
  return statusMap[status] || status
}

/**
 * 获取状态颜色
 */
export function getStatusColor(status: FeedbackStatus): string {
  const colorMap: Record<FeedbackStatus, string> = {
    [FeedbackStatus.PENDING]: 'default',
    [FeedbackStatus.READ]: 'processing',
    [FeedbackStatus.REPLIED]: 'success'
  }
  return colorMap[status] || 'default'
}

/**
 * 格式化评分显示
 */
export function formatRating(rating?: number): string {
  if (!rating) return '未评分'
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating)
  const labels = ['', '较差', '一般', '良好', '优秀', '卓越']
  return `${stars} ${labels[rating] || ''}`
}

/**
 * 获取评分等级文本
 */
export function getRatingText(rating?: number): string {
  if (!rating) return '未评分'
  const labels: Record<number, string> = {
    1: '较差',
    2: '一般',
    3: '良好',
    4: '优秀',
    5: '卓越'
  }
  return labels[rating] || '未知'
}

/**
 * 获取评分等级颜色
 */
export function getRatingColor(rating?: number): string {
  if (!rating) return 'default'
  const colors: Record<number, string> = {
    1: 'red',
    2: 'orange',
    3: 'blue',
    4: 'green',
    5: 'gold'
  }
  return colors[rating] || 'default'
}