/**
 * 消息通知类型定义
 */

// 消息类型
export enum MessageType {
  SYSTEM = 'system',           // 系统消息
  TASK_ASSIGNED = 'task_assigned',     // 任务分配
  TASK_UPDATED = 'task_updated',       // 任务更新
  TASK_COMMENT = 'task_comment',       // 任务评论
  PROJECT_INVITE = 'project_invite',   // 项目邀请
  PROJECT_UPDATED = 'project_updated', // 项目更新
  MENTION = 'mention',                 // @提醒
  APPROVAL = 'approval'                // 审批通知
}

// 消息状态
export enum MessageStatus {
  UNREAD = 'unread',
  READ = 'read'
}

// 消息信息
export interface Message {
  id: string
  type: MessageType
  title: string
  content: string
  status: MessageStatus
  senderId?: string
  senderName?: string
  senderAvatar?: string
  relatedId?: string
  relatedType?: 'task' | 'project' | 'comment'
  createdAt: string
}

// 消息查询请求
export interface MessageQueryRequest {
  type?: MessageType
  status?: MessageStatus
  page?: number
  pageSize?: number
}

// 消息列表响应
export interface MessageListResponse {
  list: Message[]
  total: number
  unreadCount: number
  page: number
  pageSize: number
}

// 消息统计
export interface MessageStats {
  total: number
  unread: number
  byType: Record<MessageType, number>
}