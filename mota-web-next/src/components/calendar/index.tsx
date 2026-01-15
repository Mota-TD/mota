'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Modal, Form, Input, DatePicker, Select, Switch, Button, message, Spin, Popover, Checkbox, Tag, Badge, List, Empty } from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  PlusOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  ProjectOutlined,
  UserOutlined,
  CheckSquareOutlined,
  BellOutlined,
  SyncOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { calendarService, type CalendarEvent as ServiceCalendarEvent } from '@/services';

dayjs.locale('zh-cn');

const { TextArea } = Input;
const { RangePicker } = DatePicker;

type ViewType = 'month' | 'week' | 'day' | 'agenda';
type CalendarType = 'personal' | 'team' | 'project' | 'task';
type EventType = 'meeting' | 'task' | 'milestone' | 'reminder' | 'other';

// 日历事件接口
export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  eventType: EventType;
  calendarType: CalendarType;
  startTime: string;
  endTime: string;
  allDay?: boolean;
  location?: string;
  color?: string;
  creatorId: number;
  visibility: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  reminderMinutes?: number;
  recurrenceRule?: string;
}

interface CalendarProps {
  userId?: number;
  projectId?: number;
  teamId?: number;
  onEventClick?: (event: CalendarEvent) => void;
  onDateSelect?: (date: Date) => void;
  defaultView?: ViewType;
  defaultCalendarTypes?: CalendarType[];
  height?: string | number;
  showCalendarTypeFilter?: boolean;
  showAgendaView?: boolean;
}

// 星期名称
const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];
const WEEK_DAYS_FULL = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

// 日历类型颜色
const CALENDAR_TYPE_COLORS: Record<CalendarType, string> = {
  personal: '#10B981',
  team: '#3B82F6',
  project: '#8B5CF6',
  task: '#F59E0B',
};

// 日历类型标签
const CALENDAR_TYPE_LABELS: Record<CalendarType, string> = {
  personal: '个人',
  team: '团队',
  project: '项目',
  task: '任务',
};

// 事件类型标签
const EVENT_TYPE_LABELS: Record<EventType, string> = {
  meeting: '会议',
  task: '任务',
  milestone: '里程碑',
  reminder: '提醒',
  other: '其他',
};

// 重复规则标签
const RECURRENCE_LABELS: Record<string, string> = {
  none: '不重复',
  daily: '每天',
  weekly: '每周',
  monthly: '每月',
  yearly: '每年',
};

// 提醒选项
const REMINDER_OPTIONS = [
  { value: 0, label: '不提醒' },
  { value: 5, label: '5分钟前' },
  { value: 15, label: '15分钟前' },
  { value: 30, label: '30分钟前' },
  { value: 60, label: '1小时前' },
  { value: 1440, label: '1天前' },
];

// 颜色预设
const COLOR_PRESETS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16'];

// 获取月份的所有日期
const getMonthDays = (year: number, month: number): Date[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];
  
  const firstDayOfWeek = firstDay.getDay();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }
  
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }
  
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i));
  }
  
  return days;
};

// 获取周的日期
const getWeekDays = (date: Date): Date[] => {
  const days: Date[] = [];
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    days.push(day);
  }
  
  return days;
};

// 判断是否是同一天
const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
};

// 判断是否是今天
const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

// 判断是否是周末
const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

// 格式化时间
const formatTime = (date: Date): string => {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// 生成时间槽
const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let i = 0; i < 24; i++) {
    slots.push(`${i.toString().padStart(2, '0')}:00`);
  }
  return slots;
};

// 获取日历类型图标
const getCalendarTypeIcon = (type: CalendarType) => {
  switch (type) {
    case 'personal': return <UserOutlined />;
    case 'team': return <TeamOutlined />;
    case 'project': return <ProjectOutlined />;
    case 'task': return <CheckSquareOutlined />;
    default: return <CalendarOutlined />;
  }
};

const Calendar: React.FC<CalendarProps> = ({
  userId = 1,
  projectId,
  teamId,
  onEventClick,
  onDateSelect,
  defaultView = 'month',
  defaultCalendarTypes = ['personal', 'team', 'project', 'task'],
  height = '100%',
  showCalendarTypeFilter = true,
  showAgendaView = true
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewType, setViewType] = useState<ViewType>(defaultView);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [form] = Form.useForm();
  const [selectedCalendarTypes, setSelectedCalendarTypes] = useState<CalendarType[]>(defaultCalendarTypes);
  const [filterVisible, setFilterVisible] = useState(false);

  const timeSlots = useMemo(() => generateTimeSlots(), []);

  // 将 API 返回的事件转换为组件使用的格式
  const transformServiceEvent = useCallback((event: ServiceCalendarEvent): CalendarEvent => ({
    id: parseInt(event.id) || Date.now(),
    title: event.title,
    description: event.description,
    eventType: (event.eventType as EventType) || 'other',
    calendarType: (event.calendarType as CalendarType) || 'personal',
    startTime: event.startTime,
    endTime: event.endTime,
    allDay: event.allDay,
    location: event.location,
    color: event.color || CALENDAR_TYPE_COLORS[(event.calendarType as CalendarType) || 'personal'],
    creatorId: parseInt(event.creatorId) || userId,
    visibility: event.visibility || 'project',
    status: event.status || 'active',
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
    reminderMinutes: event.reminderMinutes,
    recurrenceRule: event.recurrence?.frequency || 'none'
  }), [userId]);

  // 加载事件
  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const startDate = dayjs(currentDate).startOf('month').subtract(7, 'day').format('YYYY-MM-DD');
      const endDate = dayjs(currentDate).endOf('month').add(7, 'day').format('YYYY-MM-DD');
      
      const serviceEvents = await calendarService.getEvents({
        startDate,
        endDate,
        userId: userId?.toString(),
        projectId: projectId?.toString(),
        teamId: teamId?.toString(),
      });
      
      setEvents(serviceEvents.map(transformServiceEvent));
    } catch (error) {
      console.error('Failed to load calendar events:', error);
      // API 失败时显示空列表
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [currentDate, userId, projectId, teamId, transformServiceEvent]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // 导航
  const navigate = (direction: 'prev' | 'next' | 'today') => {
    const newDate = new Date(currentDate);
    
    switch (direction) {
      case 'prev':
        if (viewType === 'month') {
          newDate.setMonth(newDate.getMonth() - 1);
        } else if (viewType === 'week') {
          newDate.setDate(newDate.getDate() - 7);
        } else if (viewType === 'day') {
          newDate.setDate(newDate.getDate() - 1);
        }
        break;
      case 'next':
        if (viewType === 'month') {
          newDate.setMonth(newDate.getMonth() + 1);
        } else if (viewType === 'week') {
          newDate.setDate(newDate.getDate() + 7);
        } else if (viewType === 'day') {
          newDate.setDate(newDate.getDate() + 1);
        }
        break;
      case 'today':
        setCurrentDate(new Date());
        return;
    }
    
    setCurrentDate(newDate);
  };

  // 获取日期的事件
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => {
      if (!selectedCalendarTypes.includes(event.calendarType)) {
        return false;
      }
      
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      return eventStart <= dayEnd && eventEnd >= dayStart;
    });
  };

  // 处理日期点击
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  // 处理事件点击
  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEventClick) {
      onEventClick(event);
    } else {
      setEditingEvent(event);
      form.setFieldsValue({
        title: event.title,
        description: event.description,
        eventType: event.eventType,
        calendarType: event.calendarType,
        timeRange: [dayjs(event.startTime), dayjs(event.endTime)],
        allDay: event.allDay,
        location: event.location,
        color: event.color,
        visibility: event.visibility,
        recurrenceRule: event.recurrenceRule,
        reminderMinutes: event.reminderMinutes
      });
      setModalVisible(true);
    }
  };

  // 打开新建事件弹窗
  const openCreateModal = () => {
    setEditingEvent(null);
    form.resetFields();
    form.setFieldsValue({
      eventType: 'meeting',
      calendarType: 'personal',
      visibility: 'project',
      recurrenceRule: 'none',
      allDay: false,
      reminderMinutes: 15,
      color: CALENDAR_TYPE_COLORS.personal,
      timeRange: selectedDate 
        ? [dayjs(selectedDate).hour(9), dayjs(selectedDate).hour(10)]
        : [dayjs().hour(9), dayjs().hour(10)]
    });
    setModalVisible(true);
  };

  // 保存事件
  const handleSaveEvent = async () => {
    try {
      const values = await form.validateFields();
      const [startTime, endTime] = values.timeRange;
      
      if (editingEvent) {
        // 更新事件
        setEvents(events.map(e => 
          e.id === editingEvent.id 
            ? { ...e, ...values, startTime: startTime.toISOString(), endTime: endTime.toISOString() }
            : e
        ));
        message.success('事件已更新');
      } else {
        // 创建事件
        const newEvent: CalendarEvent = {
          id: Date.now(),
          ...values,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          creatorId: userId,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setEvents([...events, newEvent]);
        message.success('事件已创建');
      }
      
      setModalVisible(false);
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  // 删除事件
  const handleDeleteEvent = async () => {
    if (!editingEvent) return;
    
    setEvents(events.filter(e => e.id !== editingEvent.id));
    message.success('事件已删除');
    setModalVisible(false);
  };

  // 格式化当前日期显示
  const formatCurrentDate = (): string => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    
    switch (viewType) {
      case 'month':
        return `${year}年${month}月`;
      case 'week': {
        const weekDays = getWeekDays(currentDate);
        const startMonth = weekDays[0].getMonth() + 1;
        const endMonth = weekDays[6].getMonth() + 1;
        if (startMonth === endMonth) {
          return `${year}年${startMonth}月 第${Math.ceil(weekDays[0].getDate() / 7)}周`;
        }
        return `${year}年${startMonth}月-${endMonth}月`;
      }
      case 'day':
        return `${year}年${month}月${currentDate.getDate()}日 ${WEEK_DAYS_FULL[currentDate.getDay()]}`;
      case 'agenda':
        return '日程安排';
    }
  };

  // 获取事件颜色
  const getEventColor = (event: CalendarEvent): string => {
    return event.color || CALENDAR_TYPE_COLORS[event.calendarType] || '#10B981';
  };

  // 渲染事件项
  const renderEventItem = (event: CalendarEvent, compact: boolean = false) => {
    const color = getEventColor(event);
    
    return (
      <Popover
        key={event.id}
        content={
          <div style={{ maxWidth: 300 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Tag color={color}>{CALENDAR_TYPE_LABELS[event.calendarType]}</Tag>
              <Tag>{EVENT_TYPE_LABELS[event.eventType]}</Tag>
            </div>
            <h4 style={{ margin: '0 0 8px 0' }}>{event.title}</h4>
            <p style={{ margin: '4px 0', color: '#666' }}>
              <ClockCircleOutlined style={{ marginRight: 8 }} />
              {dayjs(event.startTime).format('MM-DD HH:mm')} - {dayjs(event.endTime).format('HH:mm')}
            </p>
            {event.location && (
              <p style={{ margin: '4px 0', color: '#666' }}>
                <EnvironmentOutlined style={{ marginRight: 8 }} />
                {event.location}
              </p>
            )}
            {event.reminderMinutes && event.reminderMinutes > 0 && (
              <p style={{ margin: '4px 0', color: '#666' }}>
                <BellOutlined style={{ marginRight: 8 }} />
                {REMINDER_OPTIONS.find(o => o.value === event.reminderMinutes)?.label || `${event.reminderMinutes}分钟前`}
              </p>
            )}
            {event.recurrenceRule && event.recurrenceRule !== 'none' && (
              <p style={{ margin: '4px 0', color: '#666' }}>
                <SyncOutlined style={{ marginRight: 8 }} />
                {RECURRENCE_LABELS[event.recurrenceRule]}
              </p>
            )}
            {event.description && (
              <p style={{ margin: '8px 0 0 0', color: '#888' }}>{event.description}</p>
            )}
          </div>
        }
        title={null}
        trigger="hover"
      >
        <div
          style={{
            padding: '2px 6px',
            marginBottom: 2,
            borderRadius: 4,
            fontSize: 11,
            cursor: 'pointer',
            backgroundColor: `${color}20`,
            color: color,
            borderLeft: `2px solid ${color}`,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
          onClick={(e) => handleEventClick(event, e)}
        >
          {event.title}
        </div>
      </Popover>
    );
  };

  // 渲染月视图
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = getMonthDays(year, month);
    
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #f0f0f0' }}>
          {WEEK_DAYS.map((day, index) => (
            <div 
              key={day} 
              style={{
                padding: '8px',
                textAlign: 'center',
                fontWeight: 500,
                color: index === 0 || index === 6 ? '#ff4d4f' : '#333'
              }}
            >
              {day}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: 'repeat(6, 1fr)' }}>
          {days.map((date, index) => {
            const dayEvents = getEventsForDate(date);
            const isCurrentMonth = date.getMonth() === month;
            const maxVisibleEvents = 3;
            
            return (
              <div
                key={index}
                style={{
                  padding: 4,
                  borderRight: '1px solid #f0f0f0',
                  borderBottom: '1px solid #f0f0f0',
                  background: isToday(date) ? '#e6f7ff' : isWeekend(date) ? '#fafafa' : '#fff',
                  opacity: isCurrentMonth ? 1 : 0.5,
                  cursor: 'pointer',
                  overflow: 'hidden'
                }}
                onClick={() => handleDateClick(date)}
              >
                <div style={{ 
                  fontWeight: isToday(date) ? 600 : 400,
                  color: isToday(date) ? '#10B981' : selectedDate && isSameDay(date, selectedDate) ? '#1890ff' : '#333',
                  marginBottom: 4
                }}>
                  {date.getDate()}
                </div>
                <div style={{ fontSize: 11 }}>
                  {dayEvents.slice(0, maxVisibleEvents).map(event => renderEventItem(event, true))}
                  {dayEvents.length > maxVisibleEvents && (
                    <div style={{ fontSize: 10, color: '#999', padding: '2px 0' }}>
                      +{dayEvents.length - maxVisibleEvents} 更多
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 渲染周视图
  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);
    
    const getEventPosition = (event: CalendarEvent) => {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);
      const top = (start.getHours() + start.getMinutes() / 60) * 48;
      const height = Math.max(((end.getTime() - start.getTime()) / (1000 * 60 * 60)) * 48, 24);
      return { top, height };
    };
    
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ width: 60 }} />
          {weekDays.map((date, index) => (
            <div 
              key={index}
              style={{
                flex: 1,
                padding: '8px',
                textAlign: 'center',
                background: isToday(date) ? '#e6f7ff' : '#fff'
              }}
            >
              <div style={{ fontSize: 12, color: '#666' }}>{WEEK_DAYS[date.getDay()]}</div>
              <div style={{ 
                fontSize: 20, 
                fontWeight: isToday(date) ? 600 : 400,
                color: isToday(date) ? '#10B981' : '#333'
              }}>
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>
        <div style={{ flex: 1, display: 'flex', overflow: 'auto' }}>
          <div style={{ width: 60 }}>
            {timeSlots.map((time, index) => (
              <div key={index} style={{ height: 48, padding: '0 8px', fontSize: 11, color: '#999', textAlign: 'right' }}>
                {time}
              </div>
            ))}
          </div>
          {weekDays.map((date, dayIndex) => {
            const dayEvents = getEventsForDate(date).filter(e => !e.allDay);
            
            return (
              <div key={dayIndex} style={{ flex: 1, position: 'relative', borderLeft: '1px solid #f0f0f0' }}>
                {timeSlots.map((_, hourIndex) => (
                  <div 
                    key={hourIndex} 
                    style={{ height: 48, borderBottom: '1px solid #f5f5f5' }}
                    onClick={() => {
                      const clickedDate = new Date(date);
                      clickedDate.setHours(hourIndex);
                      handleDateClick(clickedDate);
                    }}
                  />
                ))}
                {isToday(date) && (
                  <div 
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: (new Date().getHours() + new Date().getMinutes() / 60) * 48,
                      height: 2,
                      background: '#10B981',
                      zIndex: 10
                    }}
                  />
                )}
                {dayEvents.map(event => {
                  const { top, height } = getEventPosition(event);
                  const color = getEventColor(event);
                  
                  return (
                    <div
                      key={event.id}
                      style={{
                        position: 'absolute',
                        left: 2,
                        right: 2,
                        top,
                        height,
                        padding: '2px 4px',
                        borderRadius: 4,
                        fontSize: 11,
                        cursor: 'pointer',
                        backgroundColor: `${color}20`,
                        borderLeft: `3px solid ${color}`,
                        color: color,
                        overflow: 'hidden'
                      }}
                      onClick={(e) => handleEventClick(event, e)}
                    >
                      <div style={{ fontWeight: 500 }}>{event.title}</div>
                      <div style={{ fontSize: 10 }}>
                        {formatTime(new Date(event.startTime))} - {formatTime(new Date(event.endTime))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 渲染日视图
  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const allDayEvents = dayEvents.filter(e => e.allDay);
    const timedEvents = dayEvents.filter(e => !e.allDay);
    
    const getEventPosition = (event: CalendarEvent) => {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);
      const top = (start.getHours() + start.getMinutes() / 60) * 48;
      const height = Math.max(((end.getTime() - start.getTime()) / (1000 * 60 * 60)) * 48, 24);
      return { top, height };
    };
    
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ 
          padding: '16px', 
          textAlign: 'center', 
          borderBottom: '1px solid #f0f0f0',
          background: isToday(currentDate) ? '#e6f7ff' : '#fff'
        }}>
          <div style={{ fontSize: 14, color: '#666' }}>{WEEK_DAYS_FULL[currentDate.getDay()]}</div>
          <div style={{ 
            fontSize: 32, 
            fontWeight: isToday(currentDate) ? 600 : 400,
            color: isToday(currentDate) ? '#10B981' : '#333'
          }}>
            {currentDate.getDate()}
          </div>
        </div>
        {allDayEvents.length > 0 && (
          <div style={{ padding: '8px 16px', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>全天</div>
            {allDayEvents.map(event => {
              const color = getEventColor(event);
              return (
                <div
                  key={event.id}
                  style={{
                    padding: '4px 8px',
                    marginBottom: 4,
                    borderRadius: 4,
                    backgroundColor: `${color}20`,
                    borderLeft: `3px solid ${color}`,
                    color: color,
                    cursor: 'pointer'
                  }}
                  onClick={(e) => handleEventClick(event, e)}
                >
                  {event.title}
                </div>
              );
            })}
          </div>
        )}
        <div style={{ flex: 1, display: 'flex', overflow: 'auto' }}>
          <div style={{ width: 60 }}>
            {timeSlots.map((time, index) => (
              <div key={index} style={{ height: 48, padding: '0 8px', fontSize: 11, color: '#999', textAlign: 'right' }}>
                {time}
              </div>
            ))}
          </div>
          <div style={{ flex: 1, position: 'relative', borderLeft: '1px solid #f0f0f0' }}>
            {timeSlots.map((_, hourIndex) => (
              <div 
                key={hourIndex} 
                style={{ height: 48, borderBottom: '1px solid #f5f5f5' }}
                onClick={() => {
                  const clickedDate = new Date(currentDate);
                  clickedDate.setHours(hourIndex);
                  handleDateClick(clickedDate);
                }}
              />
            ))}
            {isToday(currentDate) && (
              <div 
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: (new Date().getHours() + new Date().getMinutes() / 60) * 48,
                  height: 2,
                  background: '#10B981',
                  zIndex: 10
                }}
              />
            )}
            {timedEvents.map(event => {
              const { top, height } = getEventPosition(event);
              const color = getEventColor(event);
              
              return (
                <div
                  key={event.id}
                  style={{
                    position: 'absolute',
                    left: 8,
                    right: 8,
                    top,
                    height,
                    padding: '4px 8px',
                    borderRadius: 4,
                    backgroundColor: `${color}20`,
                    borderLeft: `3px solid ${color}`,
                    color: color,
                    cursor: 'pointer'
                  }}
                  onClick={(e) => handleEventClick(event, e)}
                >
                  <div style={{ fontWeight: 500 }}>{event.title}</div>
                  <div style={{ fontSize: 11 }}>
                    {formatTime(new Date(event.startTime))} - {formatTime(new Date(event.endTime))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // 渲染议程视图
  const renderAgendaView = () => {
    const groupedEvents: { [key: string]: CalendarEvent[] } = {};
    const filteredEvents = events.filter(e => selectedCalendarTypes.includes(e.calendarType));
    
    filteredEvents.forEach(event => {
      const dateKey = dayjs(event.startTime).format('YYYY-MM-DD');
      if (!groupedEvents[dateKey]) {
        groupedEvents[dateKey] = [];
      }
      groupedEvents[dateKey].push(event);
    });
    
    const sortedDates = Object.keys(groupedEvents).sort();
    
    if (sortedDates.length === 0) {
      return (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Empty description="暂无日程安排" />
        </div>
      );
    }
    
    return (
      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        {sortedDates.map(dateKey => {
          const date = new Date(dateKey);
          const dateEvents = groupedEvents[dateKey].sort((a, b) => 
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          );
          
          return (
            <div key={dateKey} style={{ marginBottom: 24 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12, 
                marginBottom: 12,
                padding: '8px 12px',
                background: isToday(date) ? '#e6f7ff' : '#fafafa',
                borderRadius: 8
              }}>
                <div style={{ 
                  fontSize: 24, 
                  fontWeight: 600,
                  color: isToday(date) ? '#10B981' : '#333'
                }}>
                  {date.getDate()}
                </div>
                <div>
                  <div style={{ fontWeight: 500 }}>{WEEK_DAYS_FULL[date.getDay()]}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{date.getMonth() + 1}月</div>
                </div>
                <Badge count={dateEvents.length} style={{ backgroundColor: '#10B981' }} />
              </div>
              <List
                dataSource={dateEvents}
                renderItem={event => {
                  const color = getEventColor(event);
                  return (
                    <List.Item
                      style={{ 
                        padding: '12px 16px', 
                        marginBottom: 8, 
                        background: '#fff', 
                        borderRadius: 8,
                        border: '1px solid #f0f0f0',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => handleEventClick(event, e as any)}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%' }}>
                        <div style={{ width: 4, height: 40, borderRadius: 2, backgroundColor: color }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, marginBottom: 4 }}>
                            {event.title}
                            {event.recurrenceRule && event.recurrenceRule !== 'none' && (
                              <SyncOutlined style={{ marginLeft: 8, fontSize: 12, color: '#999' }} />
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: '#666', display: 'flex', gap: 16 }}>
                            <span>
                              <ClockCircleOutlined style={{ marginRight: 4 }} />
                              {event.allDay ? '全天' : `${dayjs(event.startTime).format('HH:mm')} - ${dayjs(event.endTime).format('HH:mm')}`}
                            </span>
                            {event.location && (
                              <span>
                                <EnvironmentOutlined style={{ marginRight: 4 }} />
                                {event.location}
                              </span>
                            )}
                          </div>
                          <div style={{ marginTop: 8 }}>
                            <Tag color={color} style={{ marginRight: 4 }}>
                              {getCalendarTypeIcon(event.calendarType)}
                              <span style={{ marginLeft: 4 }}>{CALENDAR_TYPE_LABELS[event.calendarType]}</span>
                            </Tag>
                            <Tag>{EVENT_TYPE_LABELS[event.eventType]}</Tag>
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  );
                }}
              />
            </div>
          );
        })}
      </div>
    );
  };

  // 渲染日历类型过滤器
  const renderCalendarTypeFilter = () => {
    return (
      <div style={{ padding: 16 }}>
        <div style={{ fontWeight: 500, marginBottom: 12 }}>日历类型</div>
        <Checkbox.Group
          value={selectedCalendarTypes}
          onChange={(values) => setSelectedCalendarTypes(values as CalendarType[])}
          style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
        >
          {(Object.entries(CALENDAR_TYPE_LABELS) as [CalendarType, string][]).map(([type, label]) => (
            <Checkbox key={type} value={type}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span 
                  style={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    backgroundColor: CALENDAR_TYPE_COLORS[type] 
                  }}
                />
                {getCalendarTypeIcon(type)}
                <span>{label}</span>
              </span>
            </Checkbox>
          ))}
        </Checkbox.Group>
      </div>
    );
  };

  // 处理日历类型变化时更新颜色
  const handleCalendarTypeChange = (type: CalendarType) => {
    form.setFieldsValue({
      color: CALENDAR_TYPE_COLORS[type]
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height, background: '#fff', borderRadius: 8 }}>
      {/* 头部 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '12px 16px',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <Button icon={<LeftOutlined />} onClick={() => navigate('prev')} />
            <Button icon={<RightOutlined />} onClick={() => navigate('next')} />
          </div>
          <Button onClick={() => navigate('today')}>今天</Button>
          <span style={{ fontSize: 16, fontWeight: 500 }}>{formatCurrentDate()}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {showCalendarTypeFilter && (
            <Popover
              content={renderCalendarTypeFilter()}
              trigger="click"
              open={filterVisible}
              onOpenChange={setFilterVisible}
              placement="bottomRight"
            >
              <Button icon={<FilterOutlined />}>筛选</Button>
            </Popover>
          )}
          <div style={{ display: 'flex', border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden' }}>
            {(['month', 'week', 'day', ...(showAgendaView ? ['agenda'] : [])] as ViewType[]).map(view => (
              <button
                key={view}
                onClick={() => setViewType(view)}
                style={{
                  padding: '4px 12px',
                  border: 'none',
                  background: viewType === view ? '#10B981' : '#fff',
                  color: viewType === view ? '#fff' : '#333',
                  cursor: 'pointer',
                  fontSize: 13
                }}
              >
                {view === 'month' ? '月' : view === 'week' ? '周' : view === 'day' ? '日' : '议程'}
              </button>
            ))}
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal} style={{ background: '#10B981', borderColor: '#10B981' }}>
            新建事件
          </Button>
        </div>
      </div>

      {/* 主体 */}
      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {viewType === 'month' && renderMonthView()}
          {viewType === 'week' && renderWeekView()}
          {viewType === 'day' && renderDayView()}
          {viewType === 'agenda' && renderAgendaView()}
        </>
      )}

      {/* 事件编辑弹窗 */}
      <Modal
        title={editingEvent ? '编辑事件' : '新建事件'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          editingEvent && (
            <Button key="delete" danger onClick={handleDeleteEvent}>
              删除
            </Button>
          ),
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handleSaveEvent} style={{ background: '#10B981', borderColor: '#10B981' }}>
            保存
          </Button>
        ]}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入事件标题' }]}
          >
            <Input placeholder="请输入事件标题" prefix={<CalendarOutlined />} />
          </Form.Item>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="calendarType"
              label="日历类型"
              rules={[{ required: true }]}
            >
              <Select onChange={handleCalendarTypeChange}>
                {(Object.entries(CALENDAR_TYPE_LABELS) as [CalendarType, string][]).map(([value, label]) => (
                  <Select.Option key={value} value={value}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span 
                        style={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          backgroundColor: CALENDAR_TYPE_COLORS[value] 
                        }} 
                      />
                      {getCalendarTypeIcon(value)}
                      {label}
                    </span>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="eventType"
              label="事件类型"
              rules={[{ required: true }]}
            >
              <Select>
                {(Object.entries(EVENT_TYPE_LABELS) as [EventType, string][]).map(([value, label]) => (
                  <Select.Option key={value} value={value}>{label}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          
          <Form.Item
            name="timeRange"
            label="时间"
            rules={[{ required: true, message: '请选择时间' }]}
          >
            <RangePicker 
              showTime 
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item name="allDay" valuePropName="checked">
            <Switch checkedChildren="全天" unCheckedChildren="非全天" />
          </Form.Item>
          
          <Form.Item name="location" label="地点">
            <Input placeholder="请输入地点" prefix={<EnvironmentOutlined />} />
          </Form.Item>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="recurrenceRule" label="重复">
              <Select>
                {Object.entries(RECURRENCE_LABELS).map(([value, label]) => (
                  <Select.Option key={value} value={value}>{label}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item name="reminderMinutes" label="提醒">
              <Select>
                {REMINDER_OPTIONS.map(option => (
                  <Select.Option key={option.value} value={option.value}>{option.label}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          
          <Form.Item name="color" label="颜色">
            <Select>
              {COLOR_PRESETS.map(color => (
                <Select.Option key={color} value={color}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span 
                      style={{ 
                        width: 16, 
                        height: 16, 
                        borderRadius: 4, 
                        backgroundColor: color 
                      }} 
                    />
                    {color}
                  </span>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="请输入事件描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Calendar;