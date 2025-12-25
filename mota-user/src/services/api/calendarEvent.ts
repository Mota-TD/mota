import request from '../request';

// 日历类型
export type CalendarType = 'personal' | 'team' | 'project' | 'task';

// 日历事件类型
export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  eventType: 'meeting' | 'task' | 'milestone' | 'reminder' | 'other';
  calendarType: CalendarType;
  startTime: string;
  endTime: string;
  allDay: boolean;
  location?: string;
  color?: string;
  creatorId: number;
  projectId?: number;
  taskId?: number;
  milestoneId?: number;
  teamId?: number;
  recurrenceRule?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurrenceEndDate?: string;
  recurrenceCount?: number;
  reminderMinutes?: number;
  visibility: 'private' | 'project' | 'team' | 'public';
  status: 'active' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  attendees?: CalendarEventAttendee[];
  // 关联信息
  projectName?: string;
  taskName?: string;
  teamName?: string;
  creatorName?: string;
  creatorAvatar?: string;
}

// 日历配置
export interface CalendarConfig {
  id: number;
  userId: number;
  calendarType: CalendarType;
  name: string;
  color: string;
  visible: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// 日历事件参与者类型
export interface CalendarEventAttendee {
  id: number;
  eventId: number;
  userId: number;
  responseStatus: 'pending' | 'accepted' | 'declined' | 'tentative';
  required: boolean;
  respondedAt?: string;
  createdAt: string;
  userName?: string;
  userAvatar?: string;
}

// 创建事件请求
export interface CreateEventRequest {
  title: string;
  description?: string;
  eventType: string;
  calendarType?: CalendarType;
  startTime: string;
  endTime: string;
  allDay?: boolean;
  location?: string;
  color?: string;
  creatorId: number;
  projectId?: number;
  taskId?: number;
  milestoneId?: number;
  teamId?: number;
  recurrenceRule?: string;
  recurrenceEndDate?: string;
  recurrenceCount?: number;
  reminderMinutes?: number;
  visibility?: string;
  attendeeIds?: number[];
}

// 更新事件请求
export interface UpdateEventRequest {
  title?: string;
  description?: string;
  eventType?: string;
  calendarType?: CalendarType;
  startTime?: string;
  endTime?: string;
  allDay?: boolean;
  location?: string;
  color?: string;
  recurrenceRule?: string;
  recurrenceEndDate?: string;
  recurrenceCount?: number;
  reminderMinutes?: number;
  visibility?: string;
  attendeeIds?: number[];
}

// 日历订阅
export interface CalendarSubscription {
  id: number;
  userId: number;
  name: string;
  url: string;
  color: string;
  syncInterval: number; // 同步间隔（分钟）
  lastSyncAt?: string;
  status: 'active' | 'error' | 'paused';
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

// 创建订阅请求
export interface CreateSubscriptionRequest {
  name: string;
  url: string;
  color?: string;
  syncInterval?: number;
}

// 日历查询参数
export interface CalendarQueryParams {
  startTime?: string;
  endTime?: string;
  calendarTypes?: CalendarType[];
  eventTypes?: string[];
  projectIds?: number[];
  teamIds?: number[];
  includeSubscribed?: boolean;
}

// 创建事件
export const createCalendarEvent = (data: CreateEventRequest) => {
  return request.post<CalendarEvent>('/api/v1/calendar-events', data);
};

// 更新事件
export const updateCalendarEvent = (id: number, data: UpdateEventRequest) => {
  return request.put<CalendarEvent>(`/api/v1/calendar-events/${id}`, data);
};

// 删除事件
export const deleteCalendarEvent = (id: number) => {
  return request.del<boolean>(`/api/v1/calendar-events/${id}`);
};

// 取消事件
export const cancelCalendarEvent = (id: number) => {
  return request.post<boolean>(`/api/v1/calendar-events/${id}/cancel`);
};

// 获取事件详情
export const getCalendarEvent = (id: number) => {
  return request.get<CalendarEvent>(`/api/v1/calendar-events/${id}`);
};

// 获取事件详情(包含参与者)
export const getCalendarEventWithAttendees = (id: number) => {
  return request.get<CalendarEvent>(`/api/v1/calendar-events/${id}/detail`);
};

// 获取用户的事件列表
export const getUserCalendarEvents = (
  userId: number,
  startTime?: string,
  endTime?: string,
  calendarTypes?: CalendarType[]
) => {
  return request.get<CalendarEvent[]>(`/api/v1/calendar-events/user/${userId}`, {
    startTime,
    endTime,
    calendarTypes: calendarTypes?.join(',')
  });
};

// 获取项目的事件列表
export const getProjectCalendarEvents = (
  projectId: number,
  startTime?: string,
  endTime?: string
) => {
  return request.get<CalendarEvent[]>(`/api/v1/calendar-events/project/${projectId}`, {
    startTime,
    endTime
  });
};

// 获取团队的事件列表
export const getTeamCalendarEvents = (
  teamId: number,
  startTime?: string,
  endTime?: string
) => {
  return request.get<CalendarEvent[]>(`/api/v1/calendar-events/team/${teamId}`, {
    startTime,
    endTime
  });
};

// 获取任务关联的日历事件（任务截止日期自动同步）
export const getTaskCalendarEvents = (
  userId: number,
  startTime?: string,
  endTime?: string
) => {
  return request.get<CalendarEvent[]>(`/api/v1/calendar-events/user/${userId}/tasks`, {
    startTime,
    endTime
  });
};

// 综合查询日历事件
export const queryCalendarEvents = (
  userId: number,
  params: CalendarQueryParams
) => {
  return request.post<CalendarEvent[]>(`/api/v1/calendar-events/user/${userId}/query`, params);
};

// 获取用户在指定时间范围内的所有事件
export const getUserEventsInRange = (
  userId: number,
  startTime: string,
  endTime: string
) => {
  return request.get<CalendarEvent[]>(`/api/v1/calendar-events/user/${userId}/range`, {
    startTime,
    endTime
  });
};

// 获取即将到来的事件
export const getUpcomingEvents = (userId: number, minutes: number = 60) => {
  return request.get<CalendarEvent[]>(`/api/v1/calendar-events/user/${userId}/upcoming`, {
    minutes
  });
};

// 获取任务关联的事件
export const getEventsByTaskId = (taskId: number) => {
  return request.get<CalendarEvent[]>(`/api/v1/calendar-events/task/${taskId}`);
};

// 获取里程碑关联的事件
export const getEventsByMilestoneId = (milestoneId: number) => {
  return request.get<CalendarEvent[]>(`/api/v1/calendar-events/milestone/${milestoneId}`);
};

// 添加参与者
export const addEventAttendees = (eventId: number, userIds: number[]) => {
  return request.post<boolean>(`/api/v1/calendar-events/${eventId}/attendees`, userIds);
};

// 移除参与者
export const removeEventAttendee = (eventId: number, userId: number) => {
  return request.del<boolean>(`/api/v1/calendar-events/${eventId}/attendees/${userId}`);
};

// 更新参与者响应状态
export const updateAttendeeResponse = (
  eventId: number,
  userId: number,
  responseStatus: 'pending' | 'accepted' | 'declined' | 'tentative'
) => {
  return request.put<boolean>(
    `/api/v1/calendar-events/${eventId}/attendees/${userId}/response`,
    { responseStatus }
  );
};

// 获取事件参与者列表
export const getEventAttendees = (eventId: number) => {
  return request.get<CalendarEventAttendee[]>(`/api/v1/calendar-events/${eventId}/attendees`);
};

// 从任务创建事件
export const createEventFromTask = (taskId: number, creatorId: number) => {
  return request.post<CalendarEvent>(`/api/v1/calendar-events/from-task/${taskId}?creatorId=${creatorId}`);
};

// 从里程碑创建事件
export const createEventFromMilestone = (milestoneId: number, creatorId: number) => {
  return request.post<CalendarEvent>(`/api/v1/calendar-events/from-milestone/${milestoneId}?creatorId=${creatorId}`);
};

// 批量删除事件
export const deleteCalendarEvents = (ids: number[]) => {
  return request.post<boolean>('/api/v1/calendar-events/batch-delete', ids);
};

// ==================== 日历配置 API ====================

// 获取用户的日历配置列表
export const getUserCalendarConfigs = (userId: number) => {
  return request.get<CalendarConfig[]>(`/api/v1/calendar-configs/user/${userId}`);
};

// 创建日历配置
export const createCalendarConfig = (data: Partial<CalendarConfig>) => {
  return request.post<CalendarConfig>('/api/v1/calendar-configs', data);
};

// 更新日历配置
export const updateCalendarConfig = (id: number, data: Partial<CalendarConfig>) => {
  return request.put<CalendarConfig>(`/api/v1/calendar-configs/${id}`, data);
};

// 删除日历配置
export const deleteCalendarConfig = (id: number) => {
  return request.del<boolean>(`/api/v1/calendar-configs/${id}`);
};

// ==================== 日历订阅 API ====================

// 获取用户的订阅列表
export const getUserSubscriptions = (userId: number) => {
  return request.get<CalendarSubscription[]>(`/api/v1/calendar-subscriptions/user/${userId}`);
};

// 创建订阅
export const createSubscription = (userId: number, data: CreateSubscriptionRequest) => {
  return request.post<CalendarSubscription>(`/api/v1/calendar-subscriptions/user/${userId}`, data);
};

// 更新订阅
export const updateSubscription = (id: number, data: Partial<CalendarSubscription>) => {
  return request.put<CalendarSubscription>(`/api/v1/calendar-subscriptions/${id}`, data);
};

// 删除订阅
export const deleteSubscription = (id: number) => {
  return request.del<boolean>(`/api/v1/calendar-subscriptions/${id}`);
};

// 同步订阅
export const syncSubscription = (id: number) => {
  return request.post<boolean>(`/api/v1/calendar-subscriptions/${id}/sync`);
};

// 获取订阅的事件
export const getSubscriptionEvents = (
  subscriptionId: number,
  startTime?: string,
  endTime?: string
) => {
  return request.get<CalendarEvent[]>(`/api/v1/calendar-subscriptions/${subscriptionId}/events`, {
    startTime,
    endTime
  });
};

// 导出日历为iCal格式
export const exportCalendarAsICal = (userId: number, calendarTypes?: CalendarType[]) => {
  return request.get<string>(`/api/v1/calendar-events/user/${userId}/export/ical`, {
    calendarTypes: calendarTypes?.join(',')
  });
};

// 获取日历订阅URL
export const getCalendarSubscriptionUrl = (userId: number) => {
  return request.get<{ url: string }>(`/api/v1/calendar-events/user/${userId}/subscription-url`);
};

// ==================== 提醒 API ====================

// 获取即将到来的提醒
export const getUpcomingReminders = (userId: number, minutes: number = 60) => {
  return request.get<CalendarEvent[]>(`/api/v1/calendar-events/user/${userId}/reminders`, {
    minutes
  });
};

// 标记提醒已读
export const markReminderAsRead = (eventId: number, userId: number) => {
  return request.post<boolean>(`/api/v1/calendar-events/${eventId}/reminder-read`, { userId });
};

// 延迟提醒
export const snoozeReminder = (eventId: number, userId: number, minutes: number) => {
  return request.post<boolean>(`/api/v1/calendar-events/${eventId}/snooze`, { userId, minutes });
};

// 日历视图辅助函数

// 获取月视图事件
export const getMonthEvents = (userId: number, year: number, month: number) => {
  const startTime = new Date(year, month - 1, 1).toISOString();
  const endTime = new Date(year, month, 0, 23, 59, 59).toISOString();
  return getUserEventsInRange(userId, startTime, endTime);
};

// 获取周视图事件
export const getWeekEvents = (userId: number, date: Date) => {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return getUserEventsInRange(userId, startOfWeek.toISOString(), endOfWeek.toISOString());
};

// 获取日视图事件
export const getDayEvents = (userId: number, date: Date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return getUserEventsInRange(userId, startOfDay.toISOString(), endOfDay.toISOString());
};

// 事件颜色预设
export const EVENT_COLORS = {
  meeting: '#1890ff',    // 蓝色 - 会议
  task: '#52c41a',       // 绿色 - 任务
  milestone: '#722ed1',  // 紫色 - 里程碑
  reminder: '#faad14',   // 黄色 - 提醒
  other: '#8c8c8c'       // 灰色 - 其他
};

// 日历类型颜色
export const CALENDAR_TYPE_COLORS = {
  personal: '#10b981',   // 绿色 - 个人日历
  team: '#3b82f6',       // 蓝色 - 团队日历
  project: '#8b5cf6',    // 紫色 - 项目日历
  task: '#f59e0b'        // 橙色 - 任务日历
};

// 日历类型标签
export const CALENDAR_TYPE_LABELS = {
  personal: '个人日历',
  team: '团队日历',
  project: '项目日历',
  task: '任务日历'
};

// 事件类型标签
export const EVENT_TYPE_LABELS = {
  meeting: '会议',
  task: '任务',
  milestone: '里程碑',
  reminder: '提醒',
  other: '其他'
};

// 响应状态标签
export const RESPONSE_STATUS_LABELS = {
  pending: '待回复',
  accepted: '已接受',
  declined: '已拒绝',
  tentative: '暂定'
};

// 可见性标签
export const VISIBILITY_LABELS = {
  private: '仅自己可见',
  project: '项目成员可见',
  team: '团队成员可见',
  public: '所有人可见'
};

// 重复规则标签
export const RECURRENCE_LABELS = {
  none: '不重复',
  daily: '每天',
  weekly: '每周',
  monthly: '每月',
  yearly: '每年'
};

// 提醒时间选项
export const REMINDER_OPTIONS = [
  { value: 0, label: '不提醒' },
  { value: 5, label: '5分钟前' },
  { value: 10, label: '10分钟前' },
  { value: 15, label: '15分钟前' },
  { value: 30, label: '30分钟前' },
  { value: 60, label: '1小时前' },
  { value: 120, label: '2小时前' },
  { value: 1440, label: '1天前' },
  { value: 2880, label: '2天前' },
  { value: 10080, label: '1周前' }
];

// 颜色预设选项
export const COLOR_PRESETS = [
  '#10b981', // 绿色
  '#3b82f6', // 蓝色
  '#8b5cf6', // 紫色
  '#f59e0b', // 橙色
  '#ef4444', // 红色
  '#ec4899', // 粉色
  '#06b6d4', // 青色
  '#84cc16', // 黄绿色
  '#6366f1', // 靛蓝色
  '#14b8a6'  // 蓝绿色
];