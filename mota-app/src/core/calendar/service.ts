/**
 * 日程管理服务实现
 */

import { get, post, put, del } from '../http/request'
import type {
  CalendarEvent,
  EventCreateRequest,
  EventUpdateRequest,
  EventQueryRequest,
  EventListResponse
} from './types'

class CalendarService {
  private baseUrl = '/api/calendar'

  /**
   * 获取日程列表
   */
  async getEvents(params?: EventQueryRequest): Promise<EventListResponse> {
    return get<EventListResponse>(`${this.baseUrl}/events`, params)
  }

  /**
   * 获取日程详情
   */
  async getEvent(eventId: string): Promise<CalendarEvent> {
    return get<CalendarEvent>(`${this.baseUrl}/events/${eventId}`)
  }

  /**
   * 创建日程
   */
  async createEvent(data: EventCreateRequest): Promise<CalendarEvent> {
    return post<CalendarEvent>(`${this.baseUrl}/events`, data)
  }

  /**
   * 更新日程
   */
  async updateEvent(eventId: string, data: EventUpdateRequest): Promise<CalendarEvent> {
    return put<CalendarEvent>(`${this.baseUrl}/events/${eventId}`, data)
  }

  /**
   * 删除日程
   */
  async deleteEvent(eventId: string): Promise<void> {
    return del(`${this.baseUrl}/events/${eventId}`)
  }

  /**
   * 获取今日日程
   */
  async getTodayEvents(): Promise<CalendarEvent[]> {
    const today = new Date().toISOString().split('T')[0]
    const response = await this.getEvents({
      startDate: today,
      endDate: today
    })
    return response.list
  }

  /**
   * 获取本周日程
   */
  async getWeekEvents(): Promise<CalendarEvent[]> {
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6))
    
    const response = await this.getEvents({
      startDate: startOfWeek.toISOString().split('T')[0],
      endDate: endOfWeek.toISOString().split('T')[0]
    })
    return response.list
  }

  /**
   * 获取本月日程
   */
  async getMonthEvents(year: number, month: number): Promise<CalendarEvent[]> {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)
    
    const response = await this.getEvents({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    })
    return response.list
  }
}

export const calendarService = new CalendarService()
export default calendarService