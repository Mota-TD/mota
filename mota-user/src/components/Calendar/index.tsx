import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Modal, Form, Input, DatePicker, Select, Switch, Button, message, Spin, Popover, Checkbox, Tag, Tooltip, Badge, Tabs, List, Avatar, Empty } from 'antd';
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
  SettingOutlined,
  FilterOutlined,
  ExportOutlined,
  LinkOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import styles from './index.module.css';
import {
  CalendarEvent,
  CalendarType,
  CalendarConfig,
  CreateEventRequest,
  getUserEventsInRange,
  getProjectCalendarEvents,
  getTeamCalendarEvents,
  getTaskCalendarEvents,
  queryCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getUserCalendarConfigs,
  EVENT_COLORS,
  EVENT_TYPE_LABELS,
  VISIBILITY_LABELS,
  RECURRENCE_LABELS,
  CALENDAR_TYPE_COLORS,
  CALENDAR_TYPE_LABELS,
  REMINDER_OPTIONS,
  COLOR_PRESETS
} from '@/services/api/calendarEvent';

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

type ViewType = 'month' | 'week' | 'day' | 'agenda';

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

// 获取月份的所有日期（包括前后月份的补充日期）
const getMonthDays = (year: number, month: number): Date[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];
  
  // 添加上月的日期
  const firstDayOfWeek = firstDay.getDay();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }
  
  // 添加本月的日期
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }
  
  // 添加下月的日期（补齐6行）
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

// 生成时间槽（24小时）
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
    case 'personal':
      return <UserOutlined />;
    case 'team':
      return <TeamOutlined />;
    case 'project':
      return <ProjectOutlined />;
    case 'task':
      return <CheckSquareOutlined />;
    default:
      return <CalendarOutlined />;
  }
};

const Calendar: React.FC<CalendarProps> = ({
  userId,
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
  const [calendarConfigs, setCalendarConfigs] = useState<CalendarConfig[]>([]);
  const [filterVisible, setFilterVisible] = useState(false);

  const timeSlots = useMemo(() => generateTimeSlots(), []);

  // 获取当前视图的日期范围
  const getDateRange = useCallback((): { start: Date; end: Date } => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    switch (viewType) {
      case 'month': {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        // 扩展到完整的周
        const start = new Date(firstDay);
        start.setDate(firstDay.getDate() - firstDay.getDay());
        const end = new Date(lastDay);
        end.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
        end.setHours(23, 59, 59, 999);
        return { start, end };
      }
      case 'week': {
        const weekDays = getWeekDays(currentDate);
        const start = weekDays[0];
        const end = new Date(weekDays[6]);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      }
      case 'day': {
        const start = new Date(currentDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(currentDate);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      }
      case 'agenda': {
        // 议程视图显示未来30天
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setDate(end.getDate() + 30);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      }
    }
  }, [currentDate, viewType]);

  // 加载事件
  const loadEvents = useCallback(async () => {
    if (!userId && !projectId && !teamId) return;
    
    setLoading(true);
    try {
      const { start, end } = getDateRange();
      let allEvents: CalendarEvent[] = [];
      
      // 根据选中的日历类型加载事件
      if (userId) {
        // 使用综合查询
        const data = await queryCalendarEvents(userId, {
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          calendarTypes: selectedCalendarTypes
        });
        allEvents = data;
      } else if (projectId) {
        const data = await getProjectCalendarEvents(projectId, start.toISOString(), end.toISOString());
        allEvents = data;
      } else if (teamId) {
        const data = await getTeamCalendarEvents(teamId, start.toISOString(), end.toISOString());
        allEvents = data;
      }
      
      setEvents(allEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
      // 使用模拟数据
      setEvents(generateMockEvents());
    } finally {
      setLoading(false);
    }
  }, [userId, projectId, teamId, getDateRange, selectedCalendarTypes]);

  // 生成模拟数据
  const generateMockEvents = (): CalendarEvent[] => {
    const mockEvents: CalendarEvent[] = [];
    const now = new Date();
    const calendarTypes: CalendarType[] = ['personal', 'team', 'project', 'task'];
    const eventTypes = ['meeting', 'task', 'milestone', 'reminder', 'other'] as const;
    
    for (let i = 0; i < 20; i++) {
      const startDate = new Date(now);
      startDate.setDate(now.getDate() + Math.floor(Math.random() * 30) - 15);
      startDate.setHours(Math.floor(Math.random() * 12) + 8, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + Math.floor(Math.random() * 3) + 1);
      
      const calendarType = calendarTypes[Math.floor(Math.random() * calendarTypes.length)];
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      
      mockEvents.push({
        id: i + 1,
        title: `${EVENT_TYPE_LABELS[eventType]} ${i + 1}`,
        description: `这是一个${CALENDAR_TYPE_LABELS[calendarType]}中的${EVENT_TYPE_LABELS[eventType]}事件`,
        eventType,
        calendarType,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        allDay: Math.random() > 0.8,
        location: Math.random() > 0.5 ? '会议室A' : undefined,
        color: CALENDAR_TYPE_COLORS[calendarType],
        creatorId: userId || 1,
        visibility: 'project',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reminderMinutes: REMINDER_OPTIONS[Math.floor(Math.random() * REMINDER_OPTIONS.length)].value,
        recurrenceRule: Math.random() > 0.8 ? 'weekly' : 'none'
      });
    }
    
    return mockEvents;
  };

  // 加载日历配置
  const loadCalendarConfigs = useCallback(async () => {
    if (!userId) return;
    try {
      const configs = await getUserCalendarConfigs(userId);
      setCalendarConfigs(configs);
    } catch (error) {
      console.error('Failed to load calendar configs:', error);
    }
  }, [userId]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    loadCalendarConfigs();
  }, [loadCalendarConfigs]);

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
      // 根据日历类型过滤
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
      
      const eventData: CreateEventRequest = {
        title: values.title,
        description: values.description,
        eventType: values.eventType,
        calendarType: values.calendarType,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        allDay: values.allDay,
        location: values.location,
        color: values.color,
        visibility: values.visibility,
        recurrenceRule: values.recurrenceRule,
        reminderMinutes: values.reminderMinutes,
        creatorId: userId || 0,
        projectId: projectId,
        teamId: teamId
      };
      
      if (editingEvent) {
        await updateCalendarEvent(editingEvent.id, eventData);
        message.success('事件已更新');
      } else {
        await createCalendarEvent(eventData);
        message.success('事件已创建');
      }
      
      setModalVisible(false);
      loadEvents();
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  // 删除事件
  const handleDeleteEvent = async () => {
    if (!editingEvent) return;
    
    try {
      await deleteCalendarEvent(editingEvent.id);
      message.success('事件已删除');
      setModalVisible(false);
      loadEvents();
    } catch (error) {
      console.error('Failed to delete event:', error);
      message.error('删除失败');
    }
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
    return event.color || CALENDAR_TYPE_COLORS[event.calendarType] || EVENT_COLORS[event.eventType as keyof typeof EVENT_COLORS] || EVENT_COLORS.other;
  };

  // 渲染事件项
  const renderEventItem = (event: CalendarEvent, compact: boolean = false) => {
    const color = getEventColor(event);
    
    if (compact) {
      return (
        <div
          key={event.id}
          className={styles.eventItem}
          style={{
            backgroundColor: `${color}20`,
            color: color,
            borderLeft: `2px solid ${color}`
          }}
          onClick={(e) => handleEventClick(event, e)}
          title={event.title}
        >
          {event.title}
        </div>
      );
    }
    
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
          className={styles.eventItem}
          style={{
            backgroundColor: `${color}20`,
            color: color,
            borderLeft: `2px solid ${color}`
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
      <div className={styles.monthView}>
        <div className={styles.weekHeader}>
          {WEEK_DAYS.map((day, index) => (
            <div 
              key={day} 
              className={`${styles.weekDay} ${index === 0 || index === 6 ? styles.weekend : ''}`}
            >
              {day}
            </div>
          ))}
        </div>
        <div className={styles.monthGrid}>
          {days.map((date, index) => {
            const dayEvents = getEventsForDate(date);
            const isCurrentMonth = date.getMonth() === month;
            const maxVisibleEvents = 3;
            
            return (
              <div
                key={index}
                className={`
                  ${styles.dayCell}
                  ${!isCurrentMonth ? styles.otherMonth : ''}
                  ${isToday(date) ? styles.today : ''}
                  ${selectedDate && isSameDay(date, selectedDate) ? styles.selected : ''}
                  ${isWeekend(date) ? styles.weekend : ''}
                `}
                onClick={() => handleDateClick(date)}
              >
                <div className={styles.dayNumber}>{date.getDate()}</div>
                <div className={styles.dayEvents}>
                  {dayEvents.slice(0, maxVisibleEvents).map(event => renderEventItem(event, true))}
                  {dayEvents.length > maxVisibleEvents && (
                    <div className={styles.moreEvents}>
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
    
    // 计算事件在时间轴上的位置
    const getEventPosition = (event: CalendarEvent) => {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);
      const top = (start.getHours() + start.getMinutes() / 60) * 48;
      const height = Math.max(((end.getTime() - start.getTime()) / (1000 * 60 * 60)) * 48, 24);
      return { top, height };
    };
    
    return (
      <div className={styles.weekView}>
        <div className={styles.weekViewHeader}>
          <div className={styles.timeGutter}></div>
          {weekDays.map((date, index) => (
            <div 
              key={index}
              className={`${styles.weekDayHeader} ${isToday(date) ? styles.today : ''}`}
            >
              <div className={styles.weekDayName}>{WEEK_DAYS[date.getDay()]}</div>
              <div className={styles.weekDayNumber}>{date.getDate()}</div>
            </div>
          ))}
        </div>
        <div className={styles.weekViewBody}>
          <div className={styles.timeColumn}>
            {timeSlots.map((time, index) => (
              <div key={index} className={styles.timeSlot}>
                {time}
              </div>
            ))}
          </div>
          {weekDays.map((date, dayIndex) => {
            const dayEvents = getEventsForDate(date).filter(e => !e.allDay);
            
            return (
              <div key={dayIndex} className={styles.dayColumn}>
                {timeSlots.map((_, hourIndex) => (
                  <div 
                    key={hourIndex} 
                    className={styles.hourSlot}
                    onClick={() => {
                      const clickedDate = new Date(date);
                      clickedDate.setHours(hourIndex);
                      handleDateClick(clickedDate);
                    }}
                  />
                ))}
                {/* 当前时间线 */}
                {isToday(date) && (
                  <div 
                    className={styles.currentTimeLine}
                    style={{
                      top: (new Date().getHours() + new Date().getMinutes() / 60) * 48
                    }}
                  />
                )}
                {/* 事件 */}
                {dayEvents.map(event => {
                  const { top, height } = getEventPosition(event);
                  const color = getEventColor(event);
                  
                  return (
                    <div
                      key={event.id}
                      className={styles.weekEventItem}
                      style={{
                        top,
                        height,
                        backgroundColor: `${color}20`,
                        borderLeft: `3px solid ${color}`,
                        color: color
                      }}
                      onClick={(e) => handleEventClick(event, e)}
                    >
                      <div className={styles.eventTitle}>{event.title}</div>
                      <div className={styles.eventTime}>
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
      <div className={styles.dayView}>
        <div className={`${styles.dayViewHeader} ${isToday(currentDate) ? styles.today : ''}`}>
          <div className={styles.dayViewDate}>
            {WEEK_DAYS_FULL[currentDate.getDay()]}
          </div>
          <div className={styles.dayViewNumber}>
            {currentDate.getDate()}
          </div>
        </div>
        {allDayEvents.length > 0 && (
          <div className={styles.allDaySection}>
            <div className={styles.allDayLabel}>全天</div>
            <div className={styles.allDayEvents}>
              {allDayEvents.map(event => {
                const color = getEventColor(event);
                return (
                  <div
                    key={event.id}
                    className={styles.allDayEvent}
                    style={{
                      backgroundColor: `${color}20`,
                      color: color,
                      borderLeft: `3px solid ${color}`
                    }}
                    onClick={(e) => handleEventClick(event, e)}
                  >
                    {event.title}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div className={styles.dayViewBody}>
          <div className={styles.timeColumn}>
            {timeSlots.map((time, index) => (
              <div key={index} className={styles.timeSlot}>
                {time}
              </div>
            ))}
          </div>
          <div className={styles.dayColumn}>
            {timeSlots.map((_, hourIndex) => (
              <div 
                key={hourIndex} 
                className={styles.hourSlot}
                onClick={() => {
                  const clickedDate = new Date(currentDate);
                  clickedDate.setHours(hourIndex);
                  handleDateClick(clickedDate);
                }}
              />
            ))}
            {/* 当前时间线 */}
            {isToday(currentDate) && (
              <div 
                className={styles.currentTimeLine}
                style={{
                  top: (new Date().getHours() + new Date().getMinutes() / 60) * 48
                }}
              />
            )}
            {/* 事件 */}
            {timedEvents.map(event => {
              const { top, height } = getEventPosition(event);
              const color = getEventColor(event);
              
              return (
                <div
                  key={event.id}
                  className={styles.weekEventItem}
                  style={{
                    top,
                    height,
                    backgroundColor: `${color}20`,
                    borderLeft: `3px solid ${color}`,
                    color: color
                  }}
                  onClick={(e) => handleEventClick(event, e)}
                >
                  <div className={styles.eventTitle}>{event.title}</div>
                  <div className={styles.eventTime}>
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
    // 按日期分组事件
    const groupedEvents: { [key: string]: CalendarEvent[] } = {};
    const filteredEvents = events.filter(e => selectedCalendarTypes.includes(e.calendarType));
    
    filteredEvents.forEach(event => {
      const dateKey = dayjs(event.startTime).format('YYYY-MM-DD');
      if (!groupedEvents[dateKey]) {
        groupedEvents[dateKey] = [];
      }
      groupedEvents[dateKey].push(event);
    });
    
    // 排序日期
    const sortedDates = Object.keys(groupedEvents).sort();
    
    if (sortedDates.length === 0) {
      return (
        <div className={styles.agendaView}>
          <Empty description="暂无日程安排" />
        </div>
      );
    }
    
    return (
      <div className={styles.agendaView}>
        {sortedDates.map(dateKey => {
          const date = new Date(dateKey);
          const dateEvents = groupedEvents[dateKey].sort((a, b) => 
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          );
          
          return (
            <div key={dateKey} className={styles.agendaDateGroup}>
              <div className={`${styles.agendaDateHeader} ${isToday(date) ? styles.today : ''}`}>
                <div className={styles.agendaDateNumber}>{date.getDate()}</div>
                <div className={styles.agendaDateInfo}>
                  <div className={styles.agendaWeekDay}>{WEEK_DAYS_FULL[date.getDay()]}</div>
                  <div className={styles.agendaMonth}>{date.getMonth() + 1}月</div>
                </div>
                <Badge count={dateEvents.length} style={{ backgroundColor: '#10b981' }} />
              </div>
              <List
                className={styles.agendaEventList}
                dataSource={dateEvents}
                renderItem={event => {
                  const color = getEventColor(event);
                  return (
                    <List.Item
                      className={styles.agendaEventItem}
                      onClick={(e) => handleEventClick(event, e as any)}
                    >
                      <div 
                        className={styles.agendaEventColor}
                        style={{ backgroundColor: color }}
                      />
                      <div className={styles.agendaEventContent}>
                        <div className={styles.agendaEventTitle}>
                          {event.title}
                          {event.recurrenceRule && event.recurrenceRule !== 'none' && (
                            <SyncOutlined style={{ marginLeft: 8, fontSize: 12 }} />
                          )}
                        </div>
                        <div className={styles.agendaEventMeta}>
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
                        <div className={styles.agendaEventTags}>
                          <Tag color={color} style={{ marginRight: 4 }}>
                            {getCalendarTypeIcon(event.calendarType)}
                            <span style={{ marginLeft: 4 }}>{CALENDAR_TYPE_LABELS[event.calendarType]}</span>
                          </Tag>
                          <Tag>{EVENT_TYPE_LABELS[event.eventType]}</Tag>
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
      <div className={styles.calendarTypeFilter}>
        <div className={styles.filterTitle}>日历类型</div>
        <Checkbox.Group
          value={selectedCalendarTypes}
          onChange={(values) => setSelectedCalendarTypes(values as CalendarType[])}
        >
          {Object.entries(CALENDAR_TYPE_LABELS).map(([type, label]) => (
            <div key={type} className={styles.filterItem}>
              <Checkbox value={type}>
                <span 
                  className={styles.filterColor}
                  style={{ backgroundColor: CALENDAR_TYPE_COLORS[type as CalendarType] }}
                />
                {getCalendarTypeIcon(type as CalendarType)}
                <span style={{ marginLeft: 8 }}>{label}</span>
              </Checkbox>
            </div>
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
    <div className={styles.calendarContainer} style={{ height }}>
      {/* 头部 */}
      <div className={styles.calendarHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.navButtons}>
            <button className={styles.navButton} onClick={() => navigate('prev')}>
              <LeftOutlined />
            </button>
            <button className={styles.navButton} onClick={() => navigate('next')}>
              <RightOutlined />
            </button>
          </div>
          <button className={styles.todayButton} onClick={() => navigate('today')}>
            今天
          </button>
          <div className={styles.currentDate}>{formatCurrentDate()}</div>
        </div>
        <div className={styles.headerRight}>
          {showCalendarTypeFilter && (
            <Popover
              content={renderCalendarTypeFilter()}
              trigger="click"
              open={filterVisible}
              onOpenChange={setFilterVisible}
              placement="bottomRight"
            >
              <button className={styles.filterButton}>
                <FilterOutlined />
                筛选
              </button>
            </Popover>
          )}
          <div className={styles.viewSwitch}>
            <button
              className={`${styles.viewButton} ${viewType === 'month' ? styles.active : ''}`}
              onClick={() => setViewType('month')}
            >
              月
            </button>
            <button
              className={`${styles.viewButton} ${viewType === 'week' ? styles.active : ''}`}
              onClick={() => setViewType('week')}
            >
              周
            </button>
            <button
              className={`${styles.viewButton} ${viewType === 'day' ? styles.active : ''}`}
              onClick={() => setViewType('day')}
            >
              日
            </button>
            {showAgendaView && (
              <button
                className={`${styles.viewButton} ${viewType === 'agenda' ? styles.active : ''}`}
                onClick={() => setViewType('agenda')}
              >
                议程
              </button>
            )}
          </div>
          <button className={styles.addButton} onClick={openCreateModal}>
            <PlusOutlined />
            新建事件
          </button>
        </div>
      </div>

      {/* 主体 */}
      <div className={styles.calendarBody}>
        {loading ? (
          <div className={styles.loading}>
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
      </div>

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
          <Button key="submit" type="primary" onClick={handleSaveEvent}>
            保存
          </Button>
        ]}
        width={600}
      >
        <Form form={form} layout="vertical" className={styles.eventForm}>
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入事件标题' }]}
          >
            <Input placeholder="请输入事件标题" prefix={<CalendarOutlined />} />
          </Form.Item>
          
          <div className={styles.formRow}>
            <Form.Item
              name="calendarType"
              label="日历类型"
              rules={[{ required: true }]}
            >
              <Select onChange={handleCalendarTypeChange}>
                {Object.entries(CALENDAR_TYPE_LABELS).map(([value, label]) => (
                  <Option key={value} value={value}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span 
                        style={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          backgroundColor: CALENDAR_TYPE_COLORS[value as CalendarType] 
                        }} 
                      />
                      {getCalendarTypeIcon(value as CalendarType)}
                      {label}
                    </span>
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="eventType"
              label="事件类型"
              rules={[{ required: true }]}
            >
              <Select>
                {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                  <Option key={value} value={value}>{label}</Option>
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
          
          <div className={styles.formRow}>
            <Form.Item name="recurrenceRule" label="重复">
              <Select>
                {Object.entries(RECURRENCE_LABELS).map(([value, label]) => (
                  <Option key={value} value={value}>{label}</Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item name="reminderMinutes" label="提醒">
              <Select>
                {REMINDER_OPTIONS.map(option => (
                  <Option key={option.value} value={option.value}>{option.label}</Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          
          <div className={styles.formRow}>
            <Form.Item name="visibility" label="可见性">
              <Select>
                {Object.entries(VISIBILITY_LABELS).map(([value, label]) => (
                  <Option key={value} value={value}>{label}</Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item name="color" label="颜色">
              <Select>
                {COLOR_PRESETS.map(color => (
                  <Option key={color} value={color}>
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
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="请输入事件描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Calendar;