import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { MenuInfo } from 'rc-menu/lib/interface'
import {
  Card,
  List,
  Button,
  Badge,
  Empty,
  Spin,
  Tabs,
  Space,
  message,
  Avatar,
  Tag,
  Dropdown,
  Modal,
  Switch,
  Tooltip,
  Collapse,
  Form,
  TimePicker,
  Checkbox,
  Select,
  Slider,
  Divider,
  Popover,
  Input
} from 'antd'
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  IssuesCloseOutlined,
  CommentOutlined,
  AlertOutlined,
  SettingOutlined,
  MergeCellsOutlined,
  ProjectOutlined,
  TeamOutlined,
  FileTextOutlined,
  FlagOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  RiseOutlined,
  MoreOutlined,
  SyncOutlined,
  PushpinOutlined,
  PushpinFilled,
  DownOutlined,
  UpOutlined,
  RobotOutlined,
  FilterOutlined,
  EyeInvisibleOutlined,
  MailOutlined,
  MobileOutlined,
  StarOutlined,
  StarFilled,
  ThunderboltOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  CaretDownOutlined,
  CaretRightOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import * as notificationApi from '@/services/api/notification'
import type { 
  Notification, 
  NotificationType, 
  NotificationCategory,
  NotificationPriority,
  AIClassification,
  DoNotDisturbSettings,
  NotificationPreferences,
  NotificationSubscription
} from '@/services/api/notification'
import styles from './index.module.css'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const { Panel } = Collapse
const { Option } = Select

const NotificationsPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [refreshing, setRefreshing] = useState(false)
  const [settingsVisible, setSettingsVisible] = useState(false)
  const [dndVisible, setDndVisible] = useState(false)
  const [subscriptionVisible, setSubscriptionVisible] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [showLowPriority, setShowLowPriority] = useState(false)
  
  // 设置状态
  const [dndSettings, setDndSettings] = useState<DoNotDisturbSettings | null>(null)
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [subscriptions, setSubscriptions] = useState<NotificationSubscription[]>([])
  const [dndActive, setDndActive] = useState(false)
  
  const [form] = Form.useForm()
  const [dndForm] = Form.useForm()

  // 用户ID（实际应从用户状态获取）
  const userId = 1

  // 防止重复请求的 ref
  const dataLoadedRef = useRef(false)
  const loadingRef = useRef(false)

  useEffect(() => {
    if (dataLoadedRef.current || loadingRef.current) {
      return
    }
    loadingRef.current = true
    Promise.all([loadNotifications(), loadSettings()]).finally(() => {
      loadingRef.current = false
      dataLoadedRef.current = true
    })
  }, [])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const res = await notificationApi.getNotifications({ userId, aggregated: true })
      const notificationsList = (res as any).list || res || []
      setNotifications(notificationsList)
    } catch (error) {
      console.error('Failed to load notifications:', error)
      message.error('加载通知失败')
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const loadSettings = async () => {
    try {
      // 加载免打扰设置
      const dnd = await notificationApi.getDoNotDisturbSettings(userId)
      setDndSettings(dnd)
      
      // 检查免打扰状态
      const status = await notificationApi.checkDoNotDisturbStatus(userId)
      setDndActive(status.isActive)
      
      // 加载偏好设置
      const prefs = await notificationApi.getNotificationPreferences(userId)
      setPreferences(prefs)
      
      // 加载订阅规则
      const subs = await notificationApi.getSubscriptions(userId)
      setSubscriptions(subs)
    } catch (error) {
      console.error('Failed to load settings:', error)
      // 使用默认设置
      setDndSettings(notificationApi.DEFAULT_DND_SETTINGS as DoNotDisturbSettings)
      setPreferences(notificationApi.DEFAULT_NOTIFICATION_PREFERENCES as NotificationPreferences)
      setSubscriptions([])
    }
  }

  const getTypeIcon = (type: NotificationType) => {
    const iconMap: Record<NotificationType, React.ReactNode> = {
      task_assigned: <TeamOutlined style={{ color: '#2b7de9' }} />,
      task_completed: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      task_overdue: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      task_comment: <CommentOutlined style={{ color: '#10b981' }} />,
      task_progress: <RiseOutlined style={{ color: '#1890ff' }} />,
      comment_added: <CommentOutlined style={{ color: '#10b981' }} />,
      plan_submitted: <FileTextOutlined style={{ color: '#722ed1' }} />,
      plan_approved: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      plan_rejected: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      feedback_received: <CommentOutlined style={{ color: '#fa8c16' }} />,
      milestone_reached: <FlagOutlined style={{ color: '#52c41a' }} />,
      milestone_due: <ClockCircleOutlined style={{ color: '#fa8c16' }} />,
      deliverable_uploaded: <FileTextOutlined style={{ color: '#13c2c2' }} />,
      project_update: <ProjectOutlined style={{ color: '#2b7de9' }} />,
      member_joined: <TeamOutlined style={{ color: '#722ed1' }} />,
      mention: <CommentOutlined style={{ color: '#eb2f96' }} />,
      deadline_reminder: <ClockCircleOutlined style={{ color: '#fa8c16' }} />,
      system: <AlertOutlined style={{ color: '#f59e0b' }} />
    }
    return iconMap[type] || <BellOutlined style={{ color: '#999' }} />
  }

  const getPriorityTag = (priority?: NotificationPriority) => {
    if (!priority) return null
    const config: Record<NotificationPriority, { color: string; text: string }> = {
      low: { color: 'default', text: '低' },
      normal: { color: 'blue', text: '普通' },
      high: { color: 'orange', text: '高' },
      urgent: { color: 'red', text: '紧急' }
    }
    return <Tag color={config[priority]?.color}>{config[priority]?.text}</Tag>
  }

  const getAIClassificationTag = (classification?: AIClassification, score?: number) => {
    if (!classification) return null
    const config: Record<AIClassification, { color: string; icon: React.ReactNode }> = {
      important: { color: '#f5222d', icon: <StarFilled /> },
      normal: { color: '#1890ff', icon: <StarOutlined /> },
      low_priority: { color: '#8c8c8c', icon: <MinusCircleOutlined /> },
      spam: { color: '#d9d9d9', icon: <EyeInvisibleOutlined /> }
    }
    return (
      <Tooltip title={`AI评分: ${score || 0}`}>
        <Tag 
          icon={<RobotOutlined />} 
          color={config[classification]?.color}
          style={{ marginLeft: 4 }}
        >
          {notificationApi.AI_CLASSIFICATION_LABELS[classification]}
        </Tag>
      </Tooltip>
    )
  }

  const formatTime = (time: string) => {
    const date = dayjs(time)
    const now = dayjs()
    
    if (now.diff(date, 'day') < 1) {
      return date.fromNow()
    } else if (now.diff(date, 'day') < 7) {
      return date.format('dddd HH:mm')
    } else {
      return date.format('MM-DD HH:mm')
    }
  }

  // 置顶/取消置顶
  const handleTogglePin = async (notification: Notification) => {
    try {
      if (notification.isPinned) {
        await notificationApi.unpinNotification(notification.id)
      } else {
        await notificationApi.pinNotification(notification.id)
      }
      setNotifications(notifications.map(n =>
        n.id === notification.id ? { ...n, isPinned: !n.isPinned } : n
      ))
      message.success(notification.isPinned ? '已取消置顶' : '已置顶')
    } catch (error) {
      console.error('Failed to toggle pin:', error)
    }
  }

  // 折叠/展开
  const handleToggleCollapse = async (notification: Notification) => {
    try {
      if (notification.isCollapsed) {
        await notificationApi.expandNotification(notification.id)
      } else {
        await notificationApi.collapseNotification(notification.id)
      }
      setNotifications(notifications.map(n =>
        n.id === notification.id ? { ...n, isCollapsed: !n.isCollapsed } : n
      ))
    } catch (error) {
      console.error('Failed to toggle collapse:', error)
    }
  }

  // 展开/折叠聚合组
  const handleToggleGroup = (groupKey: string) => {
    const newCollapsed = new Set(collapsedGroups)
    if (newCollapsed.has(groupKey)) {
      newCollapsed.delete(groupKey)
    } else {
      newCollapsed.add(groupKey)
    }
    setCollapsedGroups(newCollapsed)
  }

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id)
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, isRead: 1 } : n
      ))
      message.success('已标记为已读')
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead(userId)
      setNotifications(notifications.map(n => ({ ...n, isRead: 1 })))
      message.success('已全部标记为已读')
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await notificationApi.deleteNotification(id)
      setNotifications(notifications.filter(n => n.id !== id))
      message.success('通知已删除')
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const handleClearAll = () => {
    Modal.confirm({
      title: '确认清空',
      content: '确定要清空所有通知吗？此操作不可恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await notificationApi.batchDeleteNotifications(notifications.map(n => n.id))
          setNotifications([])
          message.success('已清空所有通知')
        } catch (error) {
          console.error('Failed to clear all:', error)
        }
      }
    })
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadNotifications()
    setRefreshing(false)
    message.success('刷新成功')
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id)
    }
    if (notification.actionUrl && notification.actionUrl !== '#') {
      navigate(notification.actionUrl)
    }
  }

  // 快速开启免打扰
  const handleQuickDnd = async (duration: number) => {
    try {
      await notificationApi.enableDoNotDisturb(userId, duration)
      setDndActive(true)
      message.success(duration === -1 ? '已开启免打扰模式' : `已开启免打扰模式 ${notificationApi.DND_DURATION_OPTIONS.find(o => o.value === duration)?.label}`)
    } catch (error) {
      console.error('Failed to enable DND:', error)
    }
  }

  // 关闭免打扰
  const handleDisableDnd = async () => {
    try {
      await notificationApi.disableDoNotDisturb(userId)
      setDndActive(false)
      message.success('已关闭免打扰模式')
    } catch (error) {
      console.error('Failed to disable DND:', error)
    }
  }

  // 保存免打扰设置
  const handleSaveDndSettings = async () => {
    try {
      const values = await dndForm.validateFields()
      await notificationApi.updateDoNotDisturbSettings(userId, {
        enabled: values.enabled,
        startTime: values.timeRange?.[0]?.format('HH:mm') || '22:00',
        endTime: values.timeRange?.[1]?.format('HH:mm') || '08:00',
        weekdays: values.weekdays || [0, 1, 2, 3, 4, 5, 6],
        allowUrgent: values.allowUrgent,
        allowMentions: values.allowMentions
      })
      message.success('免打扰设置已保存')
      setDndVisible(false)
      loadSettings()
    } catch (error) {
      console.error('Failed to save DND settings:', error)
    }
  }

  // 保存偏好设置
  const handleSavePreferences = async () => {
    try {
      const values = await form.validateFields()
      await notificationApi.updateNotificationPreferences(userId, values)
      message.success('设置已保存')
      setSettingsVisible(false)
      loadSettings()
    } catch (error) {
      console.error('Failed to save preferences:', error)
    }
  }

  // 更新订阅
  const handleUpdateSubscription = async (sub: NotificationSubscription, field: string, value: boolean) => {
    try {
      await notificationApi.updateSubscription(sub.id, { [field]: value })
      setSubscriptions(subscriptions.map(s =>
        s.id === sub.id ? { ...s, [field]: value } : s
      ))
    } catch (error) {
      console.error('Failed to update subscription:', error)
    }
  }

  // 批量折叠低优先级
  const handleCollapseLowPriority = async () => {
    try {
      await notificationApi.collapseLowPriorityNotifications(userId)
      setNotifications(notifications.map(n =>
        n.aiClassification === 'low_priority' ? { ...n, isCollapsed: true } : n
      ))
      message.success('已折叠低优先级通知')
    } catch (error) {
      console.error('Failed to collapse low priority:', error)
    }
  }

  // 根据类型分组筛选
  const getFilteredNotifications = () => {
    let filtered = notifications

    // 按标签筛选
    if (activeTab === 'unread') {
      filtered = filtered.filter(n => !n.isRead)
    } else if (activeTab === 'pinned') {
      filtered = filtered.filter(n => n.isPinned)
    } else if (activeTab === 'important') {
      filtered = filtered.filter(n => n.aiClassification === 'important' || n.priority === 'urgent' || n.priority === 'high')
    } else if (activeTab !== 'all') {
      // 按分类筛选
      const categoryMap: Record<string, NotificationCategory[]> = {
        task: ['task'],
        plan: ['plan'],
        project: ['project'],
        feedback: ['feedback', 'comment'],
        system: ['system', 'reminder']
      }
      const categories = categoryMap[activeTab] || [activeTab as NotificationCategory]
      filtered = filtered.filter(n => categories.includes(n.category))
    }

    // 是否显示低优先级
    if (!showLowPriority) {
      filtered = filtered.filter(n => !n.isCollapsed)
    }

    // 排序：置顶优先，然后按时间
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return filtered
  }

  const filteredNotifications = getFilteredNotifications()
  const unreadCount = notifications.filter(n => !n.isRead).length
  const pinnedCount = notifications.filter(n => n.isPinned).length
  const importantCount = notifications.filter(n => n.aiClassification === 'important' || n.priority === 'urgent').length
  const collapsedCount = notifications.filter(n => n.isCollapsed).length

  const tabItems = [
    { key: 'all', label: `全部 (${notifications.length})` },
    { key: 'unread', label: <Badge count={unreadCount} size="small" offset={[8, 0]}>未读</Badge> },
    { key: 'pinned', label: <><PushpinOutlined /> 置顶 ({pinnedCount})</> },
    { key: 'important', label: <><StarOutlined /> 重要 ({importantCount})</> },
    { key: 'task', label: '任务' },
    { key: 'plan', label: '计划' },
    { key: 'project', label: '项目' },
    { key: 'feedback', label: '反馈' },
    { key: 'system', label: '系统' },
  ]

  // 渲染通知项
  const renderNotificationItem = (item: Notification) => {
    const isGroupExpanded = item.groupKey && !collapsedGroups.has(item.groupKey)

    return (
      <List.Item
        key={item.id}
        className={`${styles.notificationItem} ${!item.isRead ? styles.unread : ''} ${item.isPinned ? styles.pinned : ''} ${item.isCollapsed ? styles.collapsed : ''}`}
        onClick={() => handleNotificationClick(item)}
      >
        <div className={styles.notificationContent}>
          {/* 置顶标记 */}
          {item.isPinned && (
            <div className={styles.pinnedBadge}>
              <PushpinFilled />
            </div>
          )}
          
          <div className={styles.iconWrapper}>
            {getTypeIcon(item.type)}
          </div>
          
          <div className={styles.mainContent}>
            <div className={styles.notificationHeader}>
              <span className={styles.notificationTitle}>
                {!item.isRead && <Badge status="processing" />}
                {item.title}
                {item.aggregatedCount && item.aggregatedCount > 1 && (
                  <Tag color="blue" style={{ marginLeft: 8 }}>
                    <MergeCellsOutlined /> {item.aggregatedCount}条
                  </Tag>
                )}
              </span>
              <Space size={4}>
                {getPriorityTag(item.priority)}
                {getAIClassificationTag(item.aiClassification, item.aiScore)}
              </Space>
            </div>
            
            {item.content && (
              <p className={styles.notificationDesc}>{item.content}</p>
            )}
            
            {/* 聚合通知展开 */}
            {item.aggregatedNotifications && item.aggregatedNotifications.length > 0 && (
              <div className={styles.aggregatedSection}>
                <Button 
                  type="link" 
                  size="small"
                  icon={isGroupExpanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleGroup(item.groupKey!)
                  }}
                >
                  {isGroupExpanded ? '收起' : '展开'} {item.aggregatedNotifications.length} 条通知
                </Button>
                {isGroupExpanded && (
                  <div className={styles.aggregatedList}>
                    {item.aggregatedNotifications.map(sub => (
                      <div key={sub.id} className={styles.aggregatedItem}>
                        <span className={styles.aggregatedContent}>{sub.content}</span>
                        <span className={styles.aggregatedTime}>{formatTime(sub.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div className={styles.notificationMeta}>
              {item.senderName && (
                <span className={styles.sender}>
                  <Avatar size="small">{item.senderName.charAt(0)}</Avatar>
                  {item.senderName}
                </span>
              )}
              {item.projectName && (
                <span className={styles.project}>
                  <ProjectOutlined /> {item.projectName}
                </span>
              )}
              <span className={styles.time}>
                <ClockCircleOutlined /> {formatTime(item.createdAt)}
              </span>
            </div>
          </div>
          
          <div className={styles.actions}>
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'pin',
                    label: item.isPinned ? '取消置顶' : '置顶',
                    icon: item.isPinned ? <PushpinOutlined /> : <PushpinFilled />,
                    onClick: (info: MenuInfo) => {
                      info.domEvent.stopPropagation()
                      handleTogglePin(item)
                    }
                  },
                  !item.isRead && {
                    key: 'read',
                    label: '标为已读',
                    icon: <CheckOutlined />,
                    onClick: (info: MenuInfo) => {
                      info.domEvent.stopPropagation()
                      handleMarkAsRead(item.id)
                    }
                  },
                  {
                    key: 'collapse',
                    label: item.isCollapsed ? '展开' : '折叠',
                    icon: item.isCollapsed ? <UpOutlined /> : <DownOutlined />,
                    onClick: (info: MenuInfo) => {
                      info.domEvent.stopPropagation()
                      handleToggleCollapse(item)
                    }
                  },
                  { type: 'divider' },
                  {
                    key: 'delete',
                    label: '删除',
                    icon: <DeleteOutlined />,
                    danger: true,
                    onClick: (info: MenuInfo) => {
                      info.domEvent.stopPropagation()
                      handleDelete(item.id)
                    }
                  }
                ].filter(Boolean) as any
              }}
              trigger={['click']}
            >
              <Button 
                type="text" 
                icon={<MoreOutlined />} 
                onClick={(e) => e.stopPropagation()}
              />
            </Dropdown>
          </div>
        </div>
      </List.Item>
    )
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <div className={styles.title}>
            <h2>
              <BellOutlined /> 通知中心
            </h2>
            {unreadCount > 0 && (
              <Badge count={unreadCount} style={{ marginLeft: 8 }} />
            )}
            {dndActive && (
              <Tag icon={<EyeInvisibleOutlined />} color="warning" style={{ marginLeft: 8 }}>
                免打扰
              </Tag>
            )}
          </div>
          <Space>
            <Button 
              icon={<SyncOutlined spin={refreshing} />} 
              onClick={handleRefresh}
            >
              刷新
            </Button>
            <Button 
              icon={<CheckOutlined />} 
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              全部已读
            </Button>
            <Popover
              content={
                <div className={styles.dndQuickMenu}>
                  <div className={styles.dndQuickTitle}>快速免打扰</div>
                  {notificationApi.DND_DURATION_OPTIONS.map(option => (
                    <Button 
                      key={option.value}
                      type="text" 
                      block
                      onClick={() => handleQuickDnd(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                  {dndActive && (
                    <>
                      <Divider style={{ margin: '8px 0' }} />
                      <Button type="text" block danger onClick={handleDisableDnd}>
                        关闭免打扰
                      </Button>
                    </>
                  )}
                  <Divider style={{ margin: '8px 0' }} />
                  <Button type="link" block onClick={() => setDndVisible(true)}>
                    免打扰设置
                  </Button>
                </div>
              }
              trigger="click"
              placement="bottomRight"
            >
              <Button icon={<EyeInvisibleOutlined />}>
                免打扰
              </Button>
            </Popover>
            <Button 
              icon={<DeleteOutlined />} 
              onClick={handleClearAll}
              disabled={notifications.length === 0}
            >
              清空
            </Button>
            <Button icon={<SettingOutlined />} onClick={() => setSettingsVisible(true)}>
              设置
            </Button>
          </Space>
        </div>

        {/* 工具栏 */}
        <div className={styles.toolbar}>
          <Space>
            <Button 
              size="small"
              icon={<DownOutlined />}
              onClick={handleCollapseLowPriority}
            >
              折叠低优先级
            </Button>
            <Switch
              size="small"
              checked={showLowPriority}
              onChange={setShowLowPriority}
              checkedChildren="显示已折叠"
              unCheckedChildren="隐藏已折叠"
            />
            {collapsedCount > 0 && (
              <Tag>{collapsedCount} 条已折叠</Tag>
            )}
          </Space>
        </div>

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={tabItems}
        />

        {filteredNotifications.length === 0 ? (
          <Empty 
            description="暂无通知"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={filteredNotifications}
            renderItem={renderNotificationItem}
          />
        )}
      </Card>

      {/* 设置弹窗 */}
      <Modal
        title="通知设置"
        open={settingsVisible}
        onCancel={() => setSettingsVisible(false)}
        onOk={handleSavePreferences}
        width={600}
      >
        <Tabs defaultActiveKey="preferences">
          <Tabs.TabPane tab="偏好设置" key="preferences">
            <Form
              form={form}
              layout="vertical"
              initialValues={preferences || notificationApi.DEFAULT_NOTIFICATION_PREFERENCES}
            >
              <Divider orientation="left">聚合设置</Divider>
              <Form.Item name="enableAggregation" valuePropName="checked" label="启用通知聚合">
                <Switch />
              </Form.Item>
              <Form.Item name="aggregationInterval" label="聚合间隔（分钟）">
                <Slider min={5} max={120} step={5} marks={{ 5: '5', 30: '30', 60: '60', 120: '120' }} />
              </Form.Item>

              <Divider orientation="left">智能分类</Divider>
              <Form.Item name="enableAIClassification" valuePropName="checked" label="启用AI智能分类">
                <Switch />
              </Form.Item>
              <Form.Item name="autoCollapseThreshold" label="自动折叠阈值（AI评分低于此值自动折叠）">
                <Slider min={0} max={100} step={5} marks={{ 0: '0', 30: '30', 50: '50', 100: '100' }} />
              </Form.Item>

              <Divider orientation="left">置顶设置</Divider>
              <Form.Item name="autoPinUrgent" valuePropName="checked" label="自动置顶紧急通知">
                <Switch />
              </Form.Item>
              <Form.Item name="autoPinMentions" valuePropName="checked" label="自动置顶@提及">
                <Switch />
              </Form.Item>

              <Divider orientation="left">显示设置</Divider>
              <Form.Item name="showLowPriorityCollapsed" valuePropName="checked" label="低优先级默认折叠">
                <Switch />
              </Form.Item>
              <Form.Item name="maxVisibleNotifications" label="最大显示数量">
                <Slider min={10} max={200} step={10} marks={{ 10: '10', 50: '50', 100: '100', 200: '200' }} />
              </Form.Item>
            </Form>
          </Tabs.TabPane>

          <Tabs.TabPane tab="订阅管理" key="subscriptions">
            <List
              dataSource={subscriptions}
              renderItem={sub => (
                <List.Item>
                  <div className={styles.subscriptionItem}>
                    <div className={styles.subscriptionInfo}>
                      <span className={styles.subscriptionCategory}>
                        {notificationApi.NOTIFICATION_CATEGORY_LABELS[sub.category]}
                      </span>
                    </div>
                    <Space>
                      <Tooltip title="启用通知">
                        <Switch
                          size="small"
                          checked={sub.enabled}
                          onChange={(checked) => handleUpdateSubscription(sub, 'enabled', checked)}
                        />
                      </Tooltip>
                      <Tooltip title="邮件通知">
                        <Button
                          type={sub.emailEnabled ? 'primary' : 'default'}
                          size="small"
                          icon={<MailOutlined />}
                          onClick={() => handleUpdateSubscription(sub, 'emailEnabled', !sub.emailEnabled)}
                        />
                      </Tooltip>
                      <Tooltip title="推送通知">
                        <Button
                          type={sub.pushEnabled ? 'primary' : 'default'}
                          size="small"
                          icon={<MobileOutlined />}
                          onClick={() => handleUpdateSubscription(sub, 'pushEnabled', !sub.pushEnabled)}
                        />
                      </Tooltip>
                    </Space>
                  </div>
                </List.Item>
              )}
            />
          </Tabs.TabPane>
        </Tabs>
      </Modal>

      {/* 免打扰设置弹窗 */}
      <Modal
        title="免打扰设置"
        open={dndVisible}
        onCancel={() => setDndVisible(false)}
        onOk={handleSaveDndSettings}
      >
        <Form
          form={dndForm}
          layout="vertical"
          initialValues={{
            enabled: dndSettings?.enabled,
            timeRange: dndSettings ? [
              dayjs(dndSettings.startTime, 'HH:mm'),
              dayjs(dndSettings.endTime, 'HH:mm')
            ] : undefined,
            weekdays: dndSettings?.weekdays || [0, 1, 2, 3, 4, 5, 6],
            allowUrgent: dndSettings?.allowUrgent ?? true,
            allowMentions: dndSettings?.allowMentions ?? true
          }}
        >
          <Form.Item name="enabled" valuePropName="checked" label="启用定时免打扰">
            <Switch />
          </Form.Item>
          <Form.Item name="timeRange" label="免打扰时段">
            <TimePicker.RangePicker format="HH:mm" />
          </Form.Item>
          <Form.Item name="weekdays" label="生效日期">
            <Checkbox.Group>
              <Checkbox value={1}>周一</Checkbox>
              <Checkbox value={2}>周二</Checkbox>
              <Checkbox value={3}>周三</Checkbox>
              <Checkbox value={4}>周四</Checkbox>
              <Checkbox value={5}>周五</Checkbox>
              <Checkbox value={6}>周六</Checkbox>
              <Checkbox value={0}>周日</Checkbox>
            </Checkbox.Group>
          </Form.Item>
          <Divider orientation="left">例外设置</Divider>
          <Form.Item name="allowUrgent" valuePropName="checked" label="允许紧急通知">
            <Switch />
          </Form.Item>
          <Form.Item name="allowMentions" valuePropName="checked" label="允许@提及通知">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default NotificationsPage