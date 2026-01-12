'use client';

import { useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Select,
  Space,
  Row,
  Col,
  Tag,
  Avatar,
  Tooltip,
  Modal,
  Form,
  Input,
  DatePicker,
  TimePicker,
  Checkbox,
  Radio,
  Badge,
  List,
  Dropdown,
  Popover,
  Switch,
  message,
} from 'antd';
import {
  CalendarOutlined,
  PlusOutlined,
  LeftOutlined,
  RightOutlined,
  SettingOutlined,
  BellOutlined,
  TeamOutlined,
  ProjectOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  LinkOutlined,
  SyncOutlined,
  FilterOutlined,
  FullscreenOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

const { Title, Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// 日历事件类型
interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  type: 'task' | 'meeting' | 'reminder' | 'holiday' | 'personal';
  color: string;
  location?: string;
  meetingUrl?: string;
  attendees?: Array<{ id: string; name: string; avatar?: string; status: 'accepted' | 'declined' | 'pending' }>;
  reminder?: number; // 提前多少分钟提醒
  recurrence?: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string;
  };
  projectId?: string;
  projectName?: string;
  taskId?: string;
  createdBy: { id: string; name: string };
}

// 日历类型
interface CalendarType {
  id: string;
  name: string;
  color: string;
  type: 'personal' | 'team' | 'project' | 'subscribed';
  visible: boolean;
}

// 视图类型
type ViewType = 'day' | 'week' | 'month' | 'agenda';

// 事件类型配置
const eventTypeConfig = {
  task: { label: '任务', color: '#1890ff', icon: <ProjectOutlined /> },
  meeting: { label: '会议', color: '#52c41a', icon: <TeamOutlined /> },
  reminder: { label: '提醒', color: '#faad14', icon: <BellOutlined /> },
  holiday: { label: '假期', color: '#ff4d4f', icon: <CalendarOutlined /> },
  personal: { label: '个人', color: '#722ed1', icon: <ClockCircleOutlined /> },
};

// 参与者状态配置
const attendeeStatusConfig = {
  accepted: { label: '已接受', color: 'success' },
  declined: { label: '已拒绝', color: 'error' },
  pending: { label: '待确认', color: 'warning' },
};

export default function CalendarPage() {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [viewType, setViewType] = useState<ViewType>('week');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [form] = Form.useForm();

  // 获取日历列表
  const { data: calendars } = useQuery<CalendarType[]>({
    queryKey: ['calendars'],
    queryFn: async () => {
      return [
        { id: '1', name: '我的日历', color: '#1890ff', type: 'personal', visible: true },
        { id: '2', name: '团队日历', color: '#52c41a', type: 'team', visible: true },
        { id: '3', name: '摩塔项目', color: '#722ed1', type: 'project', visible: true },
        { id: '4', name: '中国节假日', color: '#ff4d4f', type: 'subscribed', visible: true },
      ];
    },
  });

  // 获取日历事件
  const { data: events } = useQuery<CalendarEvent[]>({
    queryKey: ['calendar-events', currentDate.format('YYYY-MM'), viewType],
    queryFn: async () => {
      return [
        {
          id: '1',
          title: '项目周会',
          description: '讨论本周进度和下周计划',
          startTime: currentDate.day(1).hour(10).minute(0).toISOString(),
          endTime: currentDate.day(1).hour(11).minute(0).toISOString(),
          allDay: false,
          type: 'meeting',
          color: '#52c41a',
          location: '会议室A',
          meetingUrl: 'https://meeting.example.com/123',
          attendees: [
            { id: '1', name: '张三', status: 'accepted' },
            { id: '2', name: '李四', status: 'accepted' },
            { id: '3', name: '王五', status: 'pending' },
          ],
          reminder: 15,
          createdBy: { id: '1', name: '张三' },
        },
        {
          id: '2',
          title: '完成用户认证模块',
          startTime: currentDate.day(2).hour(9).minute(0).toISOString(),
          endTime: currentDate.day(2).hour(18).minute(0).toISOString(),
          allDay: false,
          type: 'task',
          color: '#1890ff',
          projectId: '1',
          projectName: '摩塔项目管理系统',
          taskId: '101',
          createdBy: { id: '1', name: '张三' },
        },
        {
          id: '3',
          title: '产品评审会',
          description: '评审新功能设计方案',
          startTime: currentDate.day(3).hour(14).minute(0).toISOString(),
          endTime: currentDate.day(3).hour(16).minute(0).toISOString(),
          allDay: false,
          type: 'meeting',
          color: '#52c41a',
          location: '大会议室',
          attendees: [
            { id: '1', name: '张三', status: 'accepted' },
            { id: '4', name: '赵六', status: 'accepted' },
          ],
          reminder: 30,
          createdBy: { id: '4', name: '赵六' },
        },
        {
          id: '4',
          title: '提交周报',
          startTime: currentDate.day(5).hour(17).minute(0).toISOString(),
          endTime: currentDate.day(5).hour(17).minute(30).toISOString(),
          allDay: false,
          type: 'reminder',
          color: '#faad14',
          reminder: 60,
          recurrence: { type: 'weekly', interval: 1 },
          createdBy: { id: '1', name: '张三' },
        },
        {
          id: '5',
          title: '元旦假期',
          startTime: currentDate.startOf('month').toISOString(),
          endTime: currentDate.startOf('month').add(1, 'day').toISOString(),
          allDay: true,
          type: 'holiday',
          color: '#ff4d4f',
          createdBy: { id: 'system', name: '系统' },
        },
      ];
    },
  });

  // 创建事件
  const createEventMutation = useMutation({
    mutationFn: async (values: Partial<CalendarEvent>) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return values;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      setIsCreateModalOpen(false);
      form.resetFields();
      message.success('事件已创建');
    },
  });

  // 删除事件
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return eventId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      setIsDetailModalOpen(false);
      setSelectedEvent(null);
      message.success('事件已删除');
    },
  });

  // 获取当前视图的日期范围
  const getDateRange = () => {
    switch (viewType) {
      case 'day':
        return { start: currentDate.startOf('day'), end: currentDate.endOf('day') };
      case 'week':
        return { start: currentDate.startOf('isoWeek'), end: currentDate.endOf('isoWeek') };
      case 'month':
        return { start: currentDate.startOf('month'), end: currentDate.endOf('month') };
      default:
        return { start: currentDate, end: currentDate.add(7, 'day') };
    }
  };

  // 导航到上一个周期
  const goToPrevious = () => {
    switch (viewType) {
      case 'day':
        setCurrentDate(currentDate.subtract(1, 'day'));
        break;
      case 'week':
        setCurrentDate(currentDate.subtract(1, 'week'));
        break;
      case 'month':
        setCurrentDate(currentDate.subtract(1, 'month'));
        break;
    }
  };

  // 导航到下一个周期
  const goToNext = () => {
    switch (viewType) {
      case 'day':
        setCurrentDate(currentDate.add(1, 'day'));
        break;
      case 'week':
        setCurrentDate(currentDate.add(1, 'week'));
        break;
      case 'month':
        setCurrentDate(currentDate.add(1, 'month'));
        break;
    }
  };

  // 获取标题
  const getTitle = () => {
    switch (viewType) {
      case 'day':
        return currentDate.format('YYYY年MM月DD日 dddd');
      case 'week':
        const weekStart = currentDate.startOf('isoWeek');
        const weekEnd = currentDate.endOf('isoWeek');
        return `${weekStart.format('YYYY年MM月DD日')} - ${weekEnd.format('MM月DD日')}`;
      case 'month':
        return currentDate.format('YYYY年MM月');
      case 'agenda':
        return '日程列表';
    }
  };

  // 渲染周视图
  const renderWeekView = () => {
    const weekStart = currentDate.startOf('isoWeek');
    const days = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="overflow-auto">
        {/* 日期头部 */}
        <div className="sticky top-0 z-10 flex border-b bg-white dark:bg-gray-900">
          <div className="w-16 flex-shrink-0 border-r p-2" />
          {days.map((day) => (
            <div
              key={day.format('YYYY-MM-DD')}
              className={`flex-1 border-r p-2 text-center ${
                day.isSame(dayjs(), 'day') ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <div className="text-sm text-gray-500">{day.format('ddd')}</div>
              <div
                className={`text-lg font-medium ${
                  day.isSame(dayjs(), 'day') ? 'text-blue-600' : ''
                }`}
              >
                {day.format('D')}
              </div>
            </div>
          ))}
        </div>

        {/* 时间网格 */}
        <div className="relative">
          {hours.map((hour) => (
            <div key={hour} className="flex border-b" style={{ height: 60 }}>
              <div className="w-16 flex-shrink-0 border-r p-1 text-right text-xs text-gray-400">
                {hour.toString().padStart(2, '0')}:00
              </div>
              {days.map((day) => (
                <div
                  key={`${day.format('YYYY-MM-DD')}-${hour}`}
                  className="flex-1 border-r hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => {
                    form.setFieldsValue({
                      startTime: day.hour(hour),
                      endTime: day.hour(hour + 1),
                    });
                    setIsCreateModalOpen(true);
                  }}
                />
              ))}
            </div>
          ))}

          {/* 事件渲染 */}
          {events?.map((event) => {
            const eventStart = dayjs(event.startTime);
            const eventEnd = dayjs(event.endTime);
            const dayIndex = eventStart.diff(weekStart, 'day');

            if (dayIndex < 0 || dayIndex >= 7) return null;
            if (event.allDay) return null;

            const top = eventStart.hour() * 60 + eventStart.minute();
            const height = eventEnd.diff(eventStart, 'minute');
            const left = `calc(64px + ${dayIndex} * ((100% - 64px) / 7))`;
            const width = `calc((100% - 64px) / 7 - 4px)`;

            return (
              <div
                key={event.id}
                className="absolute cursor-pointer overflow-hidden rounded px-1 text-xs text-white"
                style={{
                  top,
                  left,
                  width,
                  height: Math.max(height, 20),
                  backgroundColor: event.color,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEvent(event);
                  setIsDetailModalOpen(true);
                }}
              >
                <div className="truncate font-medium">{event.title}</div>
                {height > 30 && (
                  <div className="truncate opacity-80">
                    {eventStart.format('HH:mm')} - {eventEnd.format('HH:mm')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 渲染月视图
  const renderMonthView = () => {
    const monthStart = currentDate.startOf('month');
    const monthEnd = currentDate.endOf('month');
    const calendarStart = monthStart.startOf('isoWeek');
    const calendarEnd = monthEnd.endOf('isoWeek');

    const weeks: dayjs.Dayjs[][] = [];
    let current = calendarStart;
    while (current.isBefore(calendarEnd)) {
      const week: dayjs.Dayjs[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(current);
        current = current.add(1, 'day');
      }
      weeks.push(week);
    }

    return (
      <div className="h-full">
        {/* 星期头部 */}
        <div className="grid grid-cols-7 border-b">
          {['一', '二', '三', '四', '五', '六', '日'].map((day) => (
            <div key={day} className="border-r p-2 text-center text-sm font-medium text-gray-500">
              周{day}
            </div>
          ))}
        </div>

        {/* 日期网格 */}
        <div className="grid flex-1 grid-cols-7">
          {weeks.map((week, weekIndex) =>
            week.map((day) => {
              const isCurrentMonth = day.month() === currentDate.month();
              const isToday = day.isSame(dayjs(), 'day');
              const dayEvents = events?.filter((e) =>
                dayjs(e.startTime).isSame(day, 'day')
              );

              return (
                <div
                  key={day.format('YYYY-MM-DD')}
                  className={`min-h-24 border-b border-r p-1 ${
                    !isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                  }`}
                >
                  <div
                    className={`mb-1 text-sm ${
                      isToday
                        ? 'inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white'
                        : isCurrentMonth
                        ? 'text-gray-900 dark:text-gray-100'
                        : 'text-gray-400'
                    }`}
                  >
                    {day.format('D')}
                  </div>
                  <div className="space-y-1">
                    {dayEvents?.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="cursor-pointer truncate rounded px-1 text-xs text-white"
                        style={{ backgroundColor: event.color }}
                        onClick={() => {
                          setSelectedEvent(event);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        {event.allDay ? '' : dayjs(event.startTime).format('HH:mm') + ' '}
                        {event.title}
                      </div>
                    ))}
                    {dayEvents && dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{dayEvents.length - 3} 更多
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // 渲染日程列表视图
  const renderAgendaView = () => {
    const sortedEvents = events?.sort((a, b) =>
      dayjs(a.startTime).diff(dayjs(b.startTime))
    );

    const groupedEvents: Record<string, CalendarEvent[]> = {};
    sortedEvents?.forEach((event) => {
      const date = dayjs(event.startTime).format('YYYY-MM-DD');
      if (!groupedEvents[date]) {
        groupedEvents[date] = [];
      }
      groupedEvents[date].push(event);
    });

    return (
      <div className="space-y-4">
        {Object.entries(groupedEvents).map(([date, dayEvents]) => (
          <Card key={date} size="small">
            <div className="mb-3 flex items-center gap-2">
              <CalendarOutlined />
              <Text strong>{dayjs(date).format('YYYY年MM月DD日 dddd')}</Text>
              {dayjs(date).isSame(dayjs(), 'day') && <Tag color="blue">今天</Tag>}
            </div>
            <List
              size="small"
              dataSource={dayEvents}
              renderItem={(event) => (
                <List.Item
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => {
                    setSelectedEvent(event);
                    setIsDetailModalOpen(true);
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <div
                        className="h-10 w-1 rounded"
                        style={{ backgroundColor: event.color }}
                      />
                    }
                    title={
                      <Space>
                        {eventTypeConfig[event.type].icon}
                        {event.title}
                        {event.recurrence && <SyncOutlined className="text-gray-400" />}
                      </Space>
                    }
                    description={
                      <Space size="large">
                        <span>
                          <ClockCircleOutlined className="mr-1" />
                          {event.allDay
                            ? '全天'
                            : `${dayjs(event.startTime).format('HH:mm')} - ${dayjs(
                                event.endTime
                              ).format('HH:mm')}`}
                        </span>
                        {event.location && (
                          <span>
                            <EnvironmentOutlined className="mr-1" />
                            {event.location}
                          </span>
                        )}
                        {event.attendees && (
                          <span>
                            <TeamOutlined className="mr-1" />
                            {event.attendees.length} 人
                          </span>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="calendar-page flex h-full flex-col">
      {/* 工具栏 */}
      <div className="mb-4 flex items-center justify-between">
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)}>
            新建事件
          </Button>
          <Button onClick={() => setCurrentDate(dayjs())}>今天</Button>
          <Button icon={<LeftOutlined />} onClick={goToPrevious} />
          <Button icon={<RightOutlined />} onClick={goToNext} />
          <Title level={4} className="mb-0 ml-2">
            {getTitle()}
          </Title>
        </Space>
        <Space>
          <Radio.Group
            value={viewType}
            onChange={(e) => setViewType(e.target.value)}
            optionType="button"
          >
            <Radio.Button value="day">日</Radio.Button>
            <Radio.Button value="week">周</Radio.Button>
            <Radio.Button value="month">月</Radio.Button>
            <Radio.Button value="agenda">
              <UnorderedListOutlined />
            </Radio.Button>
          </Radio.Group>
          <Button icon={<FilterOutlined />}>筛选</Button>
          <Button icon={<SettingOutlined />}>设置</Button>
        </Space>
      </div>

      <Row gutter={16} className="flex-1">
        {/* 侧边栏 */}
        <Col xs={0} lg={5}>
          <Card size="small" className="mb-4">
            <DatePicker
              value={currentDate}
              onChange={(date) => date && setCurrentDate(date)}
              style={{ width: '100%' }}
              allowClear={false}
            />
          </Card>

          <Card title="我的日历" size="small" className="mb-4">
            <List
              size="small"
              dataSource={calendars?.filter((c) => c.type !== 'subscribed')}
              renderItem={(calendar) => (
                <List.Item className="px-0">
                  <Checkbox
                    checked={calendar.visible}
                    onChange={() => {}}
                  >
                    <Space>
                      <Badge color={calendar.color} />
                      {calendar.name}
                    </Space>
                  </Checkbox>
                </List.Item>
              )}
            />
          </Card>

          <Card title="订阅日历" size="small">
            <List
              size="small"
              dataSource={calendars?.filter((c) => c.type === 'subscribed')}
              renderItem={(calendar) => (
                <List.Item className="px-0">
                  <Checkbox checked={calendar.visible} onChange={() => {}}>
                    <Space>
                      <Badge color={calendar.color} />
                      {calendar.name}
                    </Space>
                  </Checkbox>
                </List.Item>
              )}
            />
            <Button type="link" icon={<PlusOutlined />} className="mt-2 p-0">
              添加订阅
            </Button>
          </Card>
        </Col>

        {/* 主日历区域 */}
        <Col xs={24} lg={19}>
          <Card className="h-full" bodyStyle={{ height: 'calc(100% - 48px)', padding: 0 }}>
            {viewType === 'week' && renderWeekView()}
            {viewType === 'month' && renderMonthView()}
            {viewType === 'agenda' && <div className="p-4">{renderAgendaView()}</div>}
            {viewType === 'day' && (
              <div className="flex h-full items-center justify-center text-gray-400">
                日视图开发中...
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 创建事件弹窗 */}
      <Modal
        title="新建事件"
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={createEventMutation.isPending}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => createEventMutation.mutate(values)}
        >
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="输入事件标题" />
          </Form.Item>

          <Form.Item name="type" label="类型" initialValue="meeting">
            <Radio.Group>
              {Object.entries(eventTypeConfig).map(([key, config]) => (
                <Radio.Button key={key} value={key}>
                  {config.icon} {config.label}
                </Radio.Button>
              ))}
            </Radio.Group>
          </Form.Item>

          <Form.Item name="allDay" valuePropName="checked">
            <Checkbox>全天事件</Checkbox>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="startTime" label="开始时间">
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endTime" label="结束时间">
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="location" label="地点">
            <Input prefix={<EnvironmentOutlined />} placeholder="输入地点" />
          </Form.Item>

          <Form.Item name="meetingUrl" label="会议链接">
            <Input prefix={<LinkOutlined />} placeholder="输入会议链接" />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="输入事件描述" />
          </Form.Item>

          <Form.Item name="reminder" label="提醒">
            <Select placeholder="选择提醒时间">
              <Select.Option value={0}>不提醒</Select.Option>
              <Select.Option value={5}>5分钟前</Select.Option>
              <Select.Option value={15}>15分钟前</Select.Option>
              <Select.Option value={30}>30分钟前</Select.Option>
              <Select.Option value={60}>1小时前</Select.Option>
              <Select.Option value={1440}>1天前</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 事件详情弹窗 */}
      <Modal
        title={selectedEvent?.title}
        open={isDetailModalOpen}
        onCancel={() => {
          setIsDetailModalOpen(false);
          setSelectedEvent(null);
        }}
        footer={[
          <Button
            key="delete"
            danger
            onClick={() => selectedEvent && deleteEventMutation.mutate(selectedEvent.id)}
            loading={deleteEventMutation.isPending}
          >
            删除
          </Button>,
          <Button key="edit" type="primary">
            编辑
          </Button>,
        ]}
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Tag color={eventTypeConfig[selectedEvent.type].color}>
                {eventTypeConfig[selectedEvent.type].label}
              </Tag>
              {selectedEvent.recurrence && <Tag icon={<SyncOutlined />}>重复</Tag>}
            </div>

            <div>
              <Text type="secondary">时间</Text>
              <div>
                {selectedEvent.allDay
                  ? dayjs(selectedEvent.startTime).format('YYYY年MM月DD日') + ' 全天'
                  : `${dayjs(selectedEvent.startTime).format('YYYY年MM月DD日 HH:mm')} - ${dayjs(
                      selectedEvent.endTime
                    ).format('HH:mm')}`}
              </div>
            </div>

            {selectedEvent.location && (
              <div>
                <Text type="secondary">地点</Text>
                <div>
                  <EnvironmentOutlined className="mr-1" />
                  {selectedEvent.location}
                </div>
              </div>
            )}

            {selectedEvent.meetingUrl && (
              <div>
                <Text type="secondary">会议链接</Text>
                <div>
                  <a href={selectedEvent.meetingUrl} target="_blank" rel="noopener noreferrer">
                    <LinkOutlined className="mr-1" />
                    加入会议
                  </a>
                </div>
              </div>
            )}

            {selectedEvent.description && (
              <div>
                <Text type="secondary">描述</Text>
                <div>{selectedEvent.description}</div>
              </div>
            )}

            {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
              <div>
                <Text type="secondary">参与者</Text>
                <div className="mt-2 space-y-2">
                  {selectedEvent.attendees.map((attendee) => (
                    <div key={attendee.id} className="flex items-center justify-between">
                      <Space>
                        <Avatar size="small">{attendee.name[0]}</Avatar>
                        {attendee.name}
                      </Space>
                      <Tag color={attendeeStatusConfig[attendee.status].color}>
                        {attendeeStatusConfig[attendee.status].label}
                      </Tag>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Text type="secondary">创建者</Text>
              <div>{selectedEvent.createdBy.name}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}