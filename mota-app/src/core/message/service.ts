/**
 * 消息通知服务实现
 */

import { get, post, put, del } from '../http/request'
import type {
  Message,
  MessageStats,
  MessageQueryRequest,
  MessageListResponse
} from './types'

class MessageService {
  private baseUrl = '/api/message'

  /**
   * 获取消息列表
   */
  async getMessages(params?: MessageQueryRequest): Promise<MessageListResponse> {
    return get<MessageListResponse>(`${this.baseUrl}/messages`, params)
  }

  /**
   * 获取消息详情
   */
  async getMessage(messageId: string): Promise<Message> {
    return get<Message>(`${this.baseUrl}/messages/${messageId}`)
  }

  /**
   * 标记消息为已读
   */
  async markAsRead(messageId: string): Promise<void> {
    return post(`${this.baseUrl}/messages/${messageId}/read`)
  }

  /**
   * 批量标记为已读
   */
  async markAllAsRead(): Promise<void> {
    return post(`${this.baseUrl}/messages/read-all`)
  }

  /**
   * 删除消息
   */
  async deleteMessage(messageId: string): Promise<void> {
    return del(`${this.baseUrl}/messages/${messageId}`)
  }

  /**
   * 批量删除消息
   */
  async deleteMessages(messageIds: string[]): Promise<void> {
    return post(`${this.baseUrl}/messages/batch-delete`, { messageIds })
  }

  /**
   * 获取未读消息数
   */
  async getUnreadCount(): Promise<number> {
    const response = await get<{ count: number }>(`${this.baseUrl}/unread-count`)
    return response.count
  }

  /**
   * 获取消息统计
   */
  async getMessageStats(): Promise<MessageStats> {
    return get<MessageStats>(`${this.baseUrl}/stats`)
  }

  /**
   * 清空所有消息
   */
  async clearAll(): Promise<void> {
    return post(`${this.baseUrl}/clear-all`)
  }
}

export const messageService = new MessageService()
export default messageService