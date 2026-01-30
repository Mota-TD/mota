/**
 * 智能提醒服务实现
 */

import { get, post, put, del } from '../http/request'
import type {
  Reminder,
  ReminderSettings,
  ReminderCreateRequest,
  ReminderQueryRequest,
  ReminderListResponse
} from './types'

class ReminderService {
  private baseUrl = '/api/reminder'

  /**
   * 获取提醒列表
   */
  async getReminders(params?: ReminderQueryRequest): Promise<ReminderListResponse> {
    return get<ReminderListResponse>(`${this.baseUrl}/reminders`, params)
  }

  /**
   * 获取提醒详情
   */
  async getReminder(reminderId: string): Promise<Reminder> {
    return get<Reminder>(`${this.baseUrl}/reminders/${reminderId}`)
  }

  /**
   * 创建提醒
   */
  async createReminder(data: ReminderCreateRequest): Promise<Reminder> {
    return post<Reminder>(`${this.baseUrl}/reminders`, data)
  }

  /**
   * 标记为已读
   */
  async markAsRead(reminderId: string): Promise<void> {
    return post(`${this.baseUrl}/reminders/${reminderId}/read`)
  }

  /**
   * 忽略提醒
   */
  async dismissReminder(reminderId: string): Promise<void> {
    return post(`${this.baseUrl}/reminders/${reminderId}/dismiss`)
  }

  /**
   * 删除提醒
   */
  async deleteReminder(reminderId: string): Promise<void> {
    return del(`${this.baseUrl}/reminders/${reminderId}`)
  }

  /**
   * 获取未读提醒数
   */
  async getUnreadCount(): Promise<number> {
    const response = await get<{ count: number }>(`${this.baseUrl}/unread-count`)
    return response.count
  }

  /**
   * 获取提醒设置
   */
  async getSettings(): Promise<ReminderSettings> {
    return get<ReminderSettings>(`${this.baseUrl}/settings`)
  }

  /**
   * 更新提醒设置
   */
  async updateSettings(settings: Partial<ReminderSettings>): Promise<ReminderSettings> {
    return put<ReminderSettings>(`${this.baseUrl}/settings`, settings)
  }

  /**
   * 获取今日提醒
   */
  async getTodayReminders(): Promise<Reminder[]> {
    const today = new Date().toISOString().split('T')[0]
    const response = await this.getReminders({
      startDate: today,
      endDate: today
    })
    return response.list
  }
}

export const reminderService = new ReminderService()
export default reminderService