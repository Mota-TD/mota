/**
 * 智能提醒类型定义
 */

// 提醒类型
export enum ReminderType {
  TASK_DUE = 'task_due',           // 任务到期
  PROJECT_MILESTONE = 'project_milestone', // 项目里程碑
  MEETING = 'meeting',             // 会议提醒
  AI_SUGGESTION = 'ai_suggestion', // AI建议
  CUSTOM = 'custom'                // 自定义
}

// 提醒优先级
export enum ReminderPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// 提醒状态
export enum ReminderStatus {
  PENDING = 'pending',
  SENT = 'sent',
  READ = 'read',
  DISMISSED = 'dismissed'
}

// 提醒信息
export interface Reminder {
  id: string
  type: ReminderType
  priority: ReminderPriority
  status: ReminderStatus
  title: string
  content: string
  relatedId?: string
  relatedType?: 'task' | 'project' | 'event'
  remindAt: string
  createdAt: string
  readAt?: string
}

// 提醒设置
export interface ReminderSettings {
  taskDueReminder: boolean
  taskDueBefore: number  // 提前多少分钟
  projectMilestoneReminder: boolean
  meetingReminder: boolean
  meetingBefore: number
  aiSuggestionReminder: boolean
  quietHoursEnabled: boolean
  quietHoursStart?: string
  quietHoursEnd?: string
}

// 提醒创建请求
export interface ReminderCreateRequest {
  type: ReminderType
  priority: ReminderPriority
  title: string
  content: string
  relatedId?: string
  relatedType?: 'task' | 'project' | 'event'
  remindAt: string
}

// 提醒查询请求
export interface ReminderQueryRequest {
  type?: ReminderType
  status?: ReminderStatus
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

// 提醒列表响应
export interface ReminderListResponse {
  list: Reminder[]
  total: number
  unreadCount: number
  page: number
  pageSize: number
}