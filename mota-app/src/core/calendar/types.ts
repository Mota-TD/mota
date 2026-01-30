/**
 * 日程管理类型定义
 */

// 日程类型
export enum EventType {
  MEETING = 'meeting',
  TASK = 'task',
  REMINDER = 'reminder',
  OTHER = 'other'
}

// 日程优先级
export enum EventPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// 日程信息
export interface CalendarEvent {
  id: string
  title: string
  description?: string
  type: EventType
  priority: EventPriority
  startTime: string
  endTime: string
  location?: string
  attendees?: string[]
  projectId?: string
  taskId?: string
  remindBefore?: number  // 提前提醒分钟数
  isAllDay: boolean
  createdAt: string
  updatedAt: string
}

// 日程创建请求
export interface EventCreateRequest {
  title: string
  description?: string
  type: EventType
  priority: EventPriority
  startTime: string
  endTime: string
  location?: string
  attendees?: string[]
  projectId?: string
  taskId?: string
  remindBefore?: number
  isAllDay?: boolean
}

// 日程更新请求
export interface EventUpdateRequest {
  title?: string
  description?: string
  type?: EventType
  priority?: EventPriority
  startTime?: string
  endTime?: string
  location?: string
  attendees?: string[]
  remindBefore?: number
  isAllDay?: boolean
}

// 日程查询请求
export interface EventQueryRequest {
  startDate?: string
  endDate?: string
  type?: EventType
  projectId?: string
  taskId?: string
  page?: number
  pageSize?: number
}

// 日程列表响应
export interface EventListResponse {
  list: CalendarEvent[]
  total: number
  page: number
  pageSize: number
}