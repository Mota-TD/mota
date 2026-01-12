'use client';

import { useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Tabs,
  List,
  Avatar,
  Tag,
  Space,
  Badge,
  Dropdown,
  Switch,
  Empty,
  Spin,
  message,
  Tooltip,
  Checkbox,
  Modal,
  Form,
  TimePicker,
  Select,
} from 'antd';
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  SettingOutlined,
  FilterOutlined,
  MoreOutlined,
  MessageOutlined,
  ProjectOutlined,
  TeamOutlined,
  CalendarOutlined,
  FileOutlined,
  RobotOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  ReloadOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Title, Text, Paragraph } = Typography;

// 通知类型
interface Notification {
  id: string;
  type: 'task' | 'project' | 'comment' | 'mention' | 'system' | 'calendar' | 'ai';
  category: 'important' | 'normal' | 'low';
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
  link?: string;
  actions?: Array<{
    key: string;
    label: string;
    type?: 'primary' | 'default' | 'danger';
  }>;
  aggregation?: {
    count: number;
    items: string[];
  };
}

// 通知设置类型
interface NotificationSettings {
  channels: {
    inApp: boolean;
    email: boolean;
    push: boolean;
    wechat: boolean;
  };
  categories: {
    task: boolean;
    project: boolean;
    comment: boolean;
    mention: boolean;
    system: boolean;
    calendar: boolean;
    ai: boolean;
  };
  doNotDisturb: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    allowImportant: boolean;
  };
  digest: {
    enabled: boolean;
    frequency: 'daily' | 'weekly';
    time: string;
  };
}

// 通知类型配置
const notificationTypeConfig = {
  task: { label: '任务', icon: <ProjectOutlined />, color: '#1890ff' },
  project: { label: '项目', icon: <TeamOutlined />, color: '#52c41a' },
  comment: { label: '评论', icon: <MessageOutlined />, color: '#722ed1' },
  mention: { label: '提及', icon: <ExclamationCircleOutlined />, color: '#fa8c16' },
  system: { label: '系统', icon: <InfoCircleOutlined />, color: '#8c8c8c' },
  calendar: { label: '日程', icon: <CalendarOutlined />, color: '#13c2c2' },
  ai: { label: 'AI', icon: <RobotOutlined />, color: '#eb2f96' },
};

// 分类配置
const categoryConfig = {
  important: { label: '重要', color: 'red' },
  normal: { label: '普通', color: 'blue' },
  low: { label: '低优先级', color: 'default' },
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsForm] = Form.useForm();

  // 获取通知列表
  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ['notifications', activeTab],
    queryFn: async () => {
      // 模拟API调用
      const allNotifications: Notification[] = [
        {
          id: '1',
          type: 'mention',
          category: 'important',
          title: '张三 在任务中提到了你',
          content: '@你 请帮忙审核一下这个功能的实现方案',
          read: false,
          createdAt: dayjs().subtract(5, 'minute').toISOString(),
          sender: { id: '1', name: '张三' },
          link: '/tasks/101',
          actions: [
            { key: 'view', label: '查看', type: 'primary' },
            { key: 'reply', label: '回复' },
          ],
        },
        {
          id: '2',
          type: 'task',
          category: 'important',
          title: '任务即将到期',
          content: '任务"实现用户认证模块"将在2小时后到期',
          read: false,
          createdAt: dayjs().subtract(30, 'minute').toISOString(),
          link: '/tasks/102',
          actions: [
            { key: 'view', label: '查看任务', type: 'primary' },
            { key: 'extend', label: '延期' },
          ],
        },
        {
          id: '3',
          type: 'comment',
          category: 'normal',
          title: '李四 评论了你的任务',
          content: '这个方案看起来不错，有几个小建议...',
          read: false,
          createdAt: dayjs().subtract(1, 'hour').toISOString(),
          sender: { id: '2', name: '李四' },
          link: '/tasks/103#comments',
        },
        {
          id: '4',
          type: 'project',
          category: 'normal',
          title: '项目进度更新',
          content: '摩塔项目管理系统 进度已更新至 65%',
          read: true,
          createdAt: dayjs().subtract(2, 'hour').toISOString(),
          link: '/projects/1',
        },
        {
          id: '5',
          type: 'calendar',
          category: 'normal',
          title: '会议提醒',
          content: '项目周会将在15分钟后开始',
          read: true,
          createdAt: dayjs().subtract(3, 'hour').toISOString(),
          link: '/calendar',
          actions: [
            { key: 'join', label: '加入会议', type: 'primary' },
          ],
        },
        {
          id: '6',
          type: 'ai',
          category: 'low',
          title: 'AI 智能推荐',
          content: '根据您的工作习惯，建议将"编写单元测试"任务安排在上午完成',
          read: true,
          createdAt: dayjs().subtract(4, 'hour').toISOString(),
          actions: [
            { key: 'apply', label: '采纳建议', type: 'primary' },
            { key: 'dismiss', label: '忽略' },
          ],
        },
        {
          id: '7',
          type: 'system',
          category: 'low',
          title: '系统更新通知',
          content: '系统将于今晚22:00进行维护升级，预计持续30分钟',
          read: true,
          createdAt: dayjs().subtract(1, 'day').toISOString(),
        },
        {
          id: '8',
          type: 'task',
          category: 'normal',
          title: '任务状态变更',
          content: '5个任务的状态已更新',
          read: true,
          createdAt: dayjs().subtract(1, 'day').toISOString(),
          aggregation: {
            count: 5,
            items: ['任务A已完成', '任务B进行中', '任务C待审核', '任务D已完成', '任务E进行中'],
          },
        },
      ];

      if (activeTab === 'unread') {
        return allNotifications.filter((n) => !n.read);
      }
      if (activeTab === 'important') {
        return allNotifications.filter((n) => n.category === 'important');
      }
      return allNotifications;
    },
  });

  // 获取未读数量
  const { data: unreadCount } = useQuery<number>({
    queryKey: ['notifications-unread-count'],
    queryFn: async () => 3,
  });

  // 获取通知设置
  const { data: settings } = useQuery<NotificationSettings>({
    queryKey: ['notification-settings'],
    queryFn: async () => ({
      channels: {
        inApp: true,
        email: true,
        push: true,
        wechat: false,
      },
      categories: {
        task: true,
        project: true,
        comment: true,
        mention: true,
        system: true,
        calendar: true,
        ai: true,
      },
      doNotDisturb: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00',
        allowImportant: true,
      },
      digest: {
        enabled: true,
        frequency: 'daily',
        time: '09:00',
      },
    }),
  });

  // 标记已读
  const markAsReadMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return ids;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      message.success('已标记为已读');
    },
  });

  // 标记全部已读
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      message.success('已全部标记为已读');
    },
  });

  // 删除通知
  const deleteNotificationMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return ids;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setSelectedIds([]);
      message.success('已删除');
    },
  });

  // 保存设置
  const saveSettingsMutation = useMutation({
    mutationFn: async (values: NotificationSettings) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return values;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      setIsSettingsOpen(false);
      message.success('设置已保存');
    },
  });

  // 处理通知操作
  const handleAction = (notification: Notification, actionKey: string) => {
    switch (actionKey) {
      case 'view':
        if (notification.link) {
          window.location.href = notification.link;
        }
        break;
      case 'reply':
        message.info('回复功能开发中');
        break;
      case 'extend':
        message.info('延期功能开发中');
        break;
      case 'join':
        message.info('正在加入会议...');
        break;
      case 'apply':
        message.success('已采纳建议');
        break;
      case 'dismiss':
        deleteNotificationMutation.mutate([notification.id]);
        break;
      default:
        break;
    }
  };

  // 渲染通知项
  const renderNotificationItem = (notification: Notification) => {
    const typeConfig = notificationTypeConfig[notification.type];

    return (
      <List.Item
        className={`cursor-pointer transition-colors ${
          !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
        } hover:bg-gray-50 dark:hover:bg-gray-800`}
        onClick={() => {
          if (!notification.read) {
            markAsReadMutation.mutate([notification.id]);
          }
          if (notification.link) {
            window.location.href = notification.link;
          }
        }}
      >
        <List.Item.Meta
          avatar={
            <div className="relative">
              {notification.sender ? (
                <Avatar src={notification.sender.avatar}>
                  {notification.sender.name[0]}
                </Avatar>
              ) : (
                <Avatar
                  style={{ backgroundColor: typeConfig.color }}
                  icon={typeConfig.icon}
                />
              )}
              {!notification.read && (
                <Badge
                  status="processing"
                  className="absolute -right-1 -top-1"
                />
              )}
            </div>
          }
          title={
            <div className="flex items-center justify-between">
              <Space>
                <Text strong={!notification.read}>{notification.title}</Text>
                {notification.category === 'important' && (
                  <Tag color="red" className="text-xs">
                    重要
                  </Tag>
                )}
              </Space>
              <Text type="secondary" className="text-xs">
                {dayjs(notification.createdAt).fromNow()}
              </Text>
            </div>
          }
          description={
            <div>
              <Paragraph
                className="mb-2 text-gray-600 dark:text-gray-400"
                ellipsis={{ rows: 2 }}
              >
                {notification.content}
              </Paragraph>
              {notification.aggregation && (
                <div className="mb-2">
                  <Text type="secondary" className="text-xs">
                    包含 {notification.aggregation.count} 条更新
                  </Text>
                </div>
              )}
              {notification.actions && (
                <Space size="small" onClick={(e) => e.stopPropagation()}>
                  {notification.actions.map((action) => (
                    <Button
                      key={action.key}
                      size="small"
                      type={action.type === 'primary' ? 'primary' : 'default'}
                      danger={action.type === 'danger'}
                      onClick={() => handleAction(notification, action.key)}
                    >
                      {action.label}
                    </Button>
                  ))}
                </Space>
              )}
            </div>
          }
        />
        <div onClick={(e) => e.stopPropagation()}>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'read',
                  label: notification.read ? '标记为未读' : '标记为已读',
                  icon: notification.read ? <EyeInvisibleOutlined /> : <EyeOutlined />,
                },
                { type: 'divider' },
                {
                  key: 'delete',
                  label: '删除',
                  icon: <DeleteOutlined />,
                  danger: true,
                },
              ],
              onClick: ({ key }) => {
                if (key === 'read') {
                  markAsReadMutation.mutate([notification.id]);
                } else if (key === 'delete') {
                  deleteNotificationMutation.mutate([notification.id]);
                }
              },
            }}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </div>
      </List.Item>
    );
  };

  return (
    <div className="notifications-page">
      {/* 页面标题 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Title level={3} className="mb-1">
            <BellOutlined className="mr-2" />
            通知中心
            {unreadCount && unreadCount > 0 && (
              <Badge count={unreadCount} className="ml-2" />
            )}
          </Title>
          <Text type="secondary">管理您的所有通知和提醒</Text>
        </div>
        <Space>
          <Button
            icon={<CheckOutlined />}
            onClick={() => markAllAsReadMutation.mutate()}
            loading={markAllAsReadMutation.isPending}
          >
            全部已读
          </Button>
          <Button icon={<SettingOutlined />} onClick={() => setIsSettingsOpen(true)}>
            通知设置
          </Button>
        </Space>
      </div>

      {/* 批量操作栏 */}
      {selectedIds.length > 0 && (
        <Card className="mb-4" size="small">
          <div className="flex items-center justify-between">
            <Space>
              <Checkbox
                checked={selectedIds.length === notifications?.length}
                indeterminate={
                  selectedIds.length > 0 && selectedIds.length < (notifications?.length || 0)
                }
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedIds(notifications?.map((n) => n.id) || []);
                  } else {
                    setSelectedIds([]);
                  }
                }}
              >
                已选择 {selectedIds.length} 项
              </Checkbox>
            </Space>
            <Space>
              <Button
                icon={<CheckOutlined />}
                onClick={() => markAsReadMutation.mutate(selectedIds)}
              >
                标记已读
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => deleteNotificationMutation.mutate(selectedIds)}
              >
                删除
              </Button>
            </Space>
          </div>
        </Card>
      )}

      {/* 通知列表 */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'all',
              label: '全部',
            },
            {
              key: 'unread',
              label: (
                <Badge count={unreadCount} size="small" offset={[10, 0]}>
                  未读
                </Badge>
              ),
            },
            {
              key: 'important',
              label: (
                <span>
                  <ExclamationCircleOutlined className="mr-1" />
                  重要
                </span>
              ),
            },
          ]}
          tabBarExtraContent={
            <Space>
              <Button icon={<FilterOutlined />} size="small">
                筛选
              </Button>
              <Button
                icon={<ReloadOutlined />}
                size="small"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['notifications'] })}
              >
                刷新
              </Button>
            </Space>
          }
        />

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Spin />
          </div>
        ) : notifications && notifications.length > 0 ? (
          <List
            dataSource={notifications}
            renderItem={renderNotificationItem}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `共 ${total} 条通知`,
            }}
          />
        ) : (
          <Empty description="暂无通知" className="py-16" />
        )}
      </Card>

      {/* 通知设置弹窗 */}
      <Modal
        title="通知设置"
        open={isSettingsOpen}
        onCancel={() => setIsSettingsOpen(false)}
        onOk={() => settingsForm.submit()}
        confirmLoading={saveSettingsMutation.isPending}
        width={600}
      >
        <Form
          form={settingsForm}
          layout="vertical"
          initialValues={settings}
          onFinish={(values) => saveSettingsMutation.mutate(values)}
        >
          <Title level={5}>通知渠道</Title>
          <div className="mb-6 grid grid-cols-2 gap-4">
            <Form.Item name={['channels', 'inApp']} valuePropName="checked" className="mb-0">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Space>
                  <BellOutlined />
                  <span>站内通知</span>
                </Space>
                <Switch defaultChecked={settings?.channels.inApp} />
              </div>
            </Form.Item>
            <Form.Item name={['channels', 'email']} valuePropName="checked" className="mb-0">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Space>
                  <MessageOutlined />
                  <span>邮件通知</span>
                </Space>
                <Switch defaultChecked={settings?.channels.email} />
              </div>
            </Form.Item>
            <Form.Item name={['channels', 'push']} valuePropName="checked" className="mb-0">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Space>
                  <BellOutlined />
                  <span>推送通知</span>
                </Space>
                <Switch defaultChecked={settings?.channels.push} />
              </div>
            </Form.Item>
            <Form.Item name={['channels', 'wechat']} valuePropName="checked" className="mb-0">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Space>
                  <MessageOutlined />
                  <span>企业微信</span>
                </Space>
                <Switch defaultChecked={settings?.channels.wechat} />
              </div>
            </Form.Item>
          </div>

          <Title level={5}>通知类型</Title>
          <div className="mb-6 space-y-2">
            {Object.entries(notificationTypeConfig).map(([key, config]) => (
              <Form.Item
                key={key}
                name={['categories', key]}
                valuePropName="checked"
                className="mb-0"
              >
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Space>
                    <span style={{ color: config.color }}>{config.icon}</span>
                    <span>{config.label}通知</span>
                  </Space>
                  <Switch defaultChecked />
                </div>
              </Form.Item>
            ))}
          </div>

          <Title level={5}>免打扰模式</Title>
          <div className="mb-6 rounded-lg border p-4">
            <Form.Item
              name={['doNotDisturb', 'enabled']}
              valuePropName="checked"
              className="mb-4"
            >
              <div className="flex items-center justify-between">
                <Space>
                  <ClockCircleOutlined />
                  <span>开启免打扰</span>
                </Space>
                <Switch />
              </div>
            </Form.Item>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item name={['doNotDisturb', 'startTime']} label="开始时间">
                <TimePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name={['doNotDisturb', 'endTime']} label="结束时间">
                <TimePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </div>
            <Form.Item
              name={['doNotDisturb', 'allowImportant']}
              valuePropName="checked"
              className="mb-0"
            >
              <Checkbox>允许重要通知</Checkbox>
            </Form.Item>
          </div>

          <Title level={5}>通知摘要</Title>
          <div className="rounded-lg border p-4">
            <Form.Item name={['digest', 'enabled']} valuePropName="checked" className="mb-4">
              <div className="flex items-center justify-between">
                <Space>
                  <FileOutlined />
                  <span>发送通知摘要</span>
                </Space>
                <Switch />
              </div>
            </Form.Item>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item name={['digest', 'frequency']} label="发送频率">
                <Select>
                  <Select.Option value="daily">每天</Select.Option>
                  <Select.Option value="weekly">每周</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name={['digest', 'time']} label="发送时间">
                <TimePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
}