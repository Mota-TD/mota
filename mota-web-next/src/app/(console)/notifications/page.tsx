'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { notificationService, type Notification as ServiceNotification, type NotificationSettings as ServiceNotificationSettings } from '@/services';

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

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);

  // 获取通知列表
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await notificationService.getNotifications({
        type: activeTab === 'unread' ? undefined : activeTab === 'important' ? 'important' : undefined,
        read: activeTab === 'unread' ? false : undefined,
      });
      
      // 转换数据格式 - response.records 是通知数组
      const records = response.records || [];
      const convertedNotifications: Notification[] = records.map((n: ServiceNotification) => ({
        id: n.id,
        type: (n.type as 'task' | 'project' | 'comment' | 'mention' | 'system' | 'calendar' | 'ai') || 'system',
        category: 'normal' as 'important' | 'normal' | 'low', // 默认为普通
        title: n.title,
        content: n.content,
        read: n.read,
        createdAt: n.createdAt,
        sender: n.senderId ? { id: n.senderId, name: n.senderName || '', avatar: n.senderAvatar } : undefined,
        link: n.actionUrl,
      }));
      
      setNotifications(convertedNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  // 获取未读数量
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      setUnreadCount(0);
    }
  }, []);

  // 获取通知设置
  const fetchSettings = useCallback(async () => {
    try {
      const data = await notificationService.getNotificationSettings();
      // 将 service 返回的设置转换为页面使用的格式
      setSettings({
        channels: {
          inApp: data.inApp?.enabled ?? true,
          email: data.email?.enabled ?? true,
          push: data.push?.enabled ?? true,
          wechat: false, // service 中没有 wechat
        },
        categories: {
          task: data.inApp?.taskAssigned ?? true,
          project: data.inApp?.projectUpdated ?? true,
          comment: true, // 默认开启
          mention: data.inApp?.mentioned ?? true,
          system: data.inApp?.systemAnnouncements ?? true,
          calendar: true, // 默认开启
          ai: true, // 默认开启
        },
        doNotDisturb: {
          enabled: data.dnd?.enabled ?? false,
          startTime: data.dnd?.startTime ?? '22:00',
          endTime: data.dnd?.endTime ?? '08:00',
          allowImportant: true, // 默认允许重要通知
        },
        digest: {
          enabled: data.email?.dailyDigest ?? true,
          frequency: 'daily' as 'daily' | 'weekly',
          time: '09:00',
        },
      });
    } catch (error) {
      console.error('Failed to fetch notification settings:', error);
      // 设置默认值而不是 null
      setSettings({
        channels: { inApp: true, email: true, push: true, wechat: false },
        categories: { task: true, project: true, comment: true, mention: true, system: true, calendar: true, ai: true },
        doNotDisturb: { enabled: false, startTime: '22:00', endTime: '08:00', allowImportant: true },
        digest: { enabled: true, frequency: 'daily', time: '09:00' },
      });
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    fetchSettings();
  }, [fetchNotifications, fetchUnreadCount, fetchSettings]);

  // 标记已读
  const markAsReadMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => notificationService.markAsRead(id)));
      return ids;
    },
    onSuccess: () => {
      fetchNotifications();
      fetchUnreadCount();
      message.success('已标记为已读');
    },
    onError: () => {
      message.error('操作失败');
    },
  });

  // 标记全部已读
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await notificationService.markAllAsRead();
    },
    onSuccess: () => {
      fetchNotifications();
      fetchUnreadCount();
      message.success('已全部标记为已读');
    },
    onError: () => {
      message.error('操作失败');
    },
  });

  // 删除通知
  const deleteNotificationMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => notificationService.deleteNotification(id)));
      return ids;
    },
    onSuccess: () => {
      fetchNotifications();
      setSelectedIds([]);
      message.success('已删除');
    },
    onError: () => {
      message.error('删除失败');
    },
  });

  // 保存设置
  const saveSettingsMutation = useMutation({
    mutationFn: async (values: NotificationSettings) => {
      await notificationService.updateNotificationSettings(values as unknown as ServiceNotificationSettings);
      return values;
    },
    onSuccess: () => {
      fetchSettings();
      setIsSettingsOpen(false);
      message.success('设置已保存');
    },
    onError: () => {
      message.error('保存设置失败');
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
                onClick={() => fetchNotifications()}
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
          initialValues={settings || undefined}
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