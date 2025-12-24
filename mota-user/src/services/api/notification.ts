/**
 * 通知 API
 */
import { get, put, del } from '../request'

export interface Notification {
  id: string
  type: string
  title: string
  content: string
  userId: string
  isRead: boolean
  relatedId?: string
  relatedType?: string
  createdAt: string
}

export interface NotificationListResult {
  list: Notification[]
  total: number
  unreadCount: number
}

/**
 * 获取通知列表
 */
export function getNotifications(params?: {
  type?: string
  isRead?: boolean
  page?: number
  pageSize?: number
}): Promise<NotificationListResult> {
  return get('/api/v1/notifications', params)
}

/**
 * 获取通知详情
 */
export function getNotification(id: string | number): Promise<Notification> {
  return get(`/api/v1/notifications/${id}`)
}

/**
 * 标记通知为已读
 */
export function markAsRead(id: string | number): Promise<void> {
  return put(`/api/v1/notifications/${id}/read`)
}

/**
 * 标记所有通知为已读
 */
export function markAllAsRead(): Promise<void> {
  return put('/api/v1/notifications/read-all')
}

/**
 * 删除通知
 */
export function deleteNotification(id: string | number): Promise<void> {
  return del(`/api/v1/notifications/${id}`)
}

/**
 * 获取未读通知数量
 */
export function getUnreadCount(): Promise<{ count: number }> {
  return get('/api/v1/notifications/unread-count')
}