import { api } from '@/lib/api-client';

// 日历类型定义
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: 'meeting' | 'task' | 'reminder' | 'holiday' | 'other';
  startTime: string;
  endTime: string;
  allDay: boolean;
  location?: string;
  color?: string;
  recurrence?: EventRecurrence;
  reminders?: EventReminder[];
  attendees?: EventAttendee[];
  creatorId: string;
  creatorName?: string;
  projectId?: string;
  projectName?: string;
  taskId?: string;
  taskTitle?: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface EventRecurrence {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: string;
  count?: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
}

export interface EventReminder {
  type: 'email' | 'push' | 'popup';
  minutes: number;
}

export interface EventAttendee {
  userId: string;
  username: string;
  nickname: string;
  avatar?: string;
  status: 'pending' | 'accepted' | 'declined' | 'tentative';
  responseTime?: string;
}

export interface CalendarEventListParams {
  startDate: string;
  endDate: string;
  type?: string;
  projectId?: string;
  includeTaskEvents?: boolean;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  type?: string;
  startTime: string;
  endTime: string;
  allDay?: boolean;
  location?: string;
  color?: string;
  recurrence?: EventRecurrence;
  reminders?: EventReminder[];
  attendeeIds?: string[];
  projectId?: string;
  taskId?: string;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  type?: string;
  startTime?: string;
  endTime?: string;
  allDay?: boolean;
  location?: string;
  color?: string;
  recurrence?: EventRecurrence;
  reminders?: EventReminder[];
  attendeeIds?: string[];
  status?: string;
}

// 日历视图数据
export interface CalendarViewData {
  events: CalendarEvent[];
  tasks: CalendarTask[];
  holidays: CalendarHoliday[];
}

export interface CalendarTask {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  priority: string;
  projectId?: string;
  projectName?: string;
}

export interface CalendarHoliday {
  date: string;
  name: string;
  type: 'public' | 'company';
}

// 日程统计
export interface CalendarStats {
  totalEvents: number;
  upcomingEvents: number;
  todayEvents: number;
  thisWeekEvents: number;
  byType: { type: string; count: number }[];
}

// 日历服务
export const calendarService = {
  // 获取日历事件列表
  getEvents: async (params: CalendarEventListParams): Promise<CalendarEvent[]> => {
    const response = await api.get<CalendarEvent[]>('/api/v1/calendar/events', { params });
    return response.data;
  },

  // 获取日历视图数据
  getCalendarView: async (params: CalendarEventListParams): Promise<CalendarViewData> => {
    const response = await api.get<CalendarViewData>('/api/v1/calendar/view', { params });
    return response.data;
  },

  // 获取事件详情
  getEventDetail: async (id: string): Promise<CalendarEvent> => {
    const response = await api.get<CalendarEvent>(`/api/v1/calendar/events/${id}`);
    return response.data;
  },

  // 创建事件
  createEvent: async (data: CreateEventRequest): Promise<CalendarEvent> => {
    const response = await api.post<CalendarEvent>('/api/v1/calendar/events', data);
    return response.data;
  },

  // 更新事件
  updateEvent: async (id: string, data: UpdateEventRequest): Promise<CalendarEvent> => {
    const response = await api.put<CalendarEvent>(`/api/v1/calendar/events/${id}`, data);
    return response.data;
  },

  // 删除事件
  deleteEvent: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/calendar/events/${id}`);
  },

  // 获取今日事件
  getTodayEvents: async (): Promise<CalendarEvent[]> => {
    const response = await api.get<CalendarEvent[]>('/api/v1/calendar/events/today');
    return response.data;
  },

  // 获取即将到来的事件
  getUpcomingEvents: async (limit?: number): Promise<CalendarEvent[]> => {
    const response = await api.get<CalendarEvent[]>('/api/v1/calendar/events/upcoming', { params: { limit } });
    return response.data;
  },

  // 获取日历统计
  getCalendarStats: async (): Promise<CalendarStats> => {
    const response = await api.get<CalendarStats>('/api/v1/calendar/stats');
    return response.data;
  },

  // 响应事件邀请
  respondToEvent: async (id: string, status: 'accepted' | 'declined' | 'tentative'): Promise<void> => {
    await api.patch(`/api/v1/calendar/events/${id}/respond`, { status });
  },

  // 获取节假日
  getHolidays: async (year: number): Promise<CalendarHoliday[]> => {
    const response = await api.get<CalendarHoliday[]>('/api/v1/calendar/holidays', { params: { year } });
    return response.data;
  },

  // 同步外部日历
  syncExternalCalendar: async (provider: 'google' | 'outlook' | 'apple'): Promise<void> => {
    await api.post('/api/v1/calendar/sync', { provider });
  },

  // 导出日历
  exportCalendar: async (format: 'ics' | 'csv', params?: CalendarEventListParams): Promise<Blob> => {
    const response = await api.get<Blob>('/api/v1/calendar/export', {
      params: { format, ...params },
      responseType: 'blob',
    });
    return response.data;
  },

  // 导入日历
  importCalendar: async (file: File): Promise<{ imported: number; failed: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ imported: number; failed: number }>(
      '/api/v1/calendar/import',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },
};

export default calendarService;