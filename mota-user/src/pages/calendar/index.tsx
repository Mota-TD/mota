import { useEffect, useState, useCallback } from 'react'
import { Card, Typography, Spin, Button, Modal, Form, Input, Select, message, Tabs, List, Tag, Tooltip, Popconfirm, Badge, Switch, Empty, Progress, Divider, Statistic, Row, Col } from 'antd'
import {
  CalendarOutlined,
  PlusOutlined,
  SettingOutlined,
  SyncOutlined,
  LinkOutlined,
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  BellOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PauseCircleOutlined,
  CopyOutlined,
  UserOutlined,
  TeamOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  FlagOutlined,
  RightOutlined,
  TrophyOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { useAuthStore } from '@/store/auth'
import Calendar from '@/components/Calendar'
import styles from './index.module.css'
import {
  CalendarType,
  CalendarConfig,
  CalendarEvent,
  CalendarSubscription,
  CreateSubscriptionRequest,
  getUserCalendarConfigs,
  createCalendarConfig,
  updateCalendarConfig,
  deleteCalendarConfig,
  getUserSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  syncSubscription,
  exportCalendarAsICal,
  getCalendarSubscriptionUrl,
  getTaskCalendarEvents,
  getMilestoneCalendarEvents,
  getAllWorkItemEvents,
  syncUserTasksToCalendar,
  CALENDAR_TYPE_COLORS,
  CALENDAR_TYPE_LABELS,
  COLOR_PRESETS,
  EVENT_TYPE_LABELS
} from '@/services/api/calendarEvent'

const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs
const { Option } = Select

/**
 * 日程管理页面
 * 使用 Calendar 组件显示用户日程
 * 支持多种日历类型、视图切换、日历订阅等功能
 */
const CalendarPage = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [settingsVisible, setSettingsVisible] = useState(false)
  const [subscriptionModalVisible, setSubscriptionModalVisible] = useState(false)
  const [calendarConfigs, setCalendarConfigs] = useState<CalendarConfig[]>([])
  const [subscriptions, setSubscriptions] = useState<CalendarSubscription[]>([])
  const [editingSubscription, setEditingSubscription] = useState<CalendarSubscription | null>(null)
  const [subscriptionUrl, setSubscriptionUrl] = useState<string>('')
  const [upcomingTasks, setUpcomingTasks] = useState<CalendarEvent[]>([])
  const [upcomingMilestones, setUpcomingMilestones] = useState<CalendarEvent[]>([])
  const [workItemStats, setWorkItemStats] = useState({ taskCount: 0, milestoneCount: 0, meetingCount: 0, otherCount: 0 })
  const [syncing, setSyncing] = useState(false)
  const [form] = Form.useForm()

  // 加载日历配置
  const loadCalendarConfigs = useCallback(async () => {
    if (!user?.id) return
    try {
      const configs = await getUserCalendarConfigs(user.id)
      setCalendarConfigs(configs)
    } catch (error) {
      console.error('Failed to load calendar configs:', error)
      message.error('加载日历配置失败')
      setCalendarConfigs([])
    }
  }, [user?.id])

  // 加载订阅列表
  const loadSubscriptions = useCallback(async () => {
    if (!user?.id) return
    try {
      const subs = await getUserSubscriptions(user.id)
      setSubscriptions(subs)
    } catch (error) {
      console.error('Failed to load subscriptions:', error)
      message.error('加载订阅列表失败')
      setSubscriptions([])
    }
  }, [user?.id])

  // 获取订阅URL
  const loadSubscriptionUrl = useCallback(async () => {
    if (!user?.id) return
    try {
      const result = await getCalendarSubscriptionUrl(user.id)
      setSubscriptionUrl(result.url)
    } catch (error) {
      console.error('Failed to get subscription URL:', error)
      setSubscriptionUrl('')
    }
  }, [user?.id])

  // 加载即将到来的任务
  const loadUpcomingTasks = useCallback(async () => {
    if (!user?.id) return
    try {
      const now = new Date()
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + 7) // 获取未来7天的任务
      const tasks = await getTaskCalendarEvents(user.id, now.toISOString(), endDate.toISOString())
      // 按截止日期排序
      const sortedTasks = tasks.sort((a, b) =>
        new Date(a.endTime).getTime() - new Date(b.endTime).getTime()
      )
      setUpcomingTasks(sortedTasks.slice(0, 5)) // 只显示前5个
    } catch (error) {
      console.error('Failed to load upcoming tasks:', error)
      setUpcomingTasks([])
    }
  }, [user?.id])

  // 加载即将到来的里程碑
  const loadUpcomingMilestones = useCallback(async () => {
    if (!user?.id) return
    try {
      const now = new Date()
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + 30) // 获取未来30天的里程碑
      const milestones = await getMilestoneCalendarEvents(user.id, now.toISOString(), endDate.toISOString())
      // 按目标日期排序
      const sortedMilestones = milestones.sort((a, b) =>
        new Date(a.endTime).getTime() - new Date(b.endTime).getTime()
      )
      setUpcomingMilestones(sortedMilestones.slice(0, 5)) // 只显示前5个
    } catch (error) {
      console.error('Failed to load upcoming milestones:', error)
      setUpcomingMilestones([])
    }
  }, [user?.id])

  // 加载工作项统计
  const loadWorkItemStats = useCallback(async () => {
    if (!user?.id) return
    try {
      const now = new Date()
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 1) // 获取未来1个月的统计
      const result = await getAllWorkItemEvents(user.id, now.toISOString(), endDate.toISOString())
      setWorkItemStats(result.stats)
    } catch (error) {
      console.error('Failed to load work item stats:', error)
    }
  }, [user?.id])

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    loadCalendarConfigs()
    loadSubscriptions()
    loadSubscriptionUrl()
    loadUpcomingTasks()
    loadUpcomingMilestones()
    loadWorkItemStats()
    return () => clearTimeout(timer)
  }, [loadCalendarConfigs, loadSubscriptions, loadSubscriptionUrl, loadUpcomingTasks, loadUpcomingMilestones, loadWorkItemStats])

  // 切换日历可见性
  const handleToggleCalendarVisibility = async (config: CalendarConfig) => {
    try {
      await updateCalendarConfig(config.id, { visible: !config.visible })
      setCalendarConfigs(prev => 
        prev.map(c => c.id === config.id ? { ...c, visible: !c.visible } : c)
      )
    } catch (error) {
      console.error('Failed to update calendar config:', error)
    }
  }

  // 更新日历颜色
  const handleUpdateCalendarColor = async (config: CalendarConfig, color: string) => {
    try {
      await updateCalendarConfig(config.id, { color })
      setCalendarConfigs(prev => 
        prev.map(c => c.id === config.id ? { ...c, color } : c)
      )
      message.success('颜色已更新')
    } catch (error) {
      console.error('Failed to update calendar color:', error)
    }
  }

  // 打开订阅弹窗
  const openSubscriptionModal = (subscription?: CalendarSubscription) => {
    setEditingSubscription(subscription || null)
    if (subscription) {
      form.setFieldsValue({
        name: subscription.name,
        url: subscription.url,
        color: subscription.color,
        syncInterval: subscription.syncInterval
      })
    } else {
      form.resetFields()
      form.setFieldsValue({
        color: COLOR_PRESETS[0],
        syncInterval: 60
      })
    }
    setSubscriptionModalVisible(true)
  }

  // 保存订阅
  const handleSaveSubscription = async () => {
    try {
      const values = await form.validateFields()
      if (editingSubscription) {
        await updateSubscription(editingSubscription.id, values)
        message.success('订阅已更新')
      } else {
        await createSubscription(user?.id || 0, values as CreateSubscriptionRequest)
        message.success('订阅已添加')
      }
      setSubscriptionModalVisible(false)
      loadSubscriptions()
    } catch (error) {
      console.error('Failed to save subscription:', error)
    }
  }

  // 删除订阅
  const handleDeleteSubscription = async (id: number) => {
    try {
      await deleteSubscription(id)
      message.success('订阅已删除')
      loadSubscriptions()
    } catch (error) {
      console.error('Failed to delete subscription:', error)
      message.error('删除失败')
    }
  }

  // 同步订阅
  const handleSyncSubscription = async (id: number) => {
    try {
      await syncSubscription(id)
      message.success('同步成功')
      loadSubscriptions()
    } catch (error) {
      console.error('Failed to sync subscription:', error)
      message.error('同步失败')
    }
  }

  // 导出日历
  const handleExportCalendar = async () => {
    try {
      const icalData = await exportCalendarAsICal(user?.id || 0)
      const blob = new Blob([icalData], { type: 'text/calendar' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'calendar.ics'
      a.click()
      window.URL.revokeObjectURL(url)
      message.success('日历已导出')
    } catch (error) {
      console.error('Failed to export calendar:', error)
      message.error('导出失败')
    }
  }

  // 复制订阅URL
  const handleCopySubscriptionUrl = () => {
    navigator.clipboard.writeText(subscriptionUrl)
    message.success('订阅链接已复制')
  }

  // 获取日历类型图标
  const getCalendarTypeIcon = (type: CalendarType) => {
    switch (type) {
      case 'personal':
        return <UserOutlined />
      case 'team':
        return <TeamOutlined />
      case 'project':
        return <ProjectOutlined />
      case 'task':
        return <CheckSquareOutlined />
      default:
        return <CalendarOutlined />
    }
  }

  // 获取任务优先级颜色
  const getPriorityColor = (event: CalendarEvent) => {
    // 根据事件类型或颜色判断优先级
    if (event.color === '#ef4444') return 'red' // 高优先级
    if (event.color === '#f59e0b') return 'orange' // 中优先级
    return 'blue' // 低优先级
  }

  // 计算剩余天数
  const getDaysRemaining = (endTime: string) => {
    const end = dayjs(endTime)
    const now = dayjs()
    const days = end.diff(now, 'day')
    if (days < 0) return { text: '已逾期', color: 'red' }
    if (days === 0) return { text: '今天截止', color: 'orange' }
    if (days === 1) return { text: '明天截止', color: 'gold' }
    return { text: `${days}天后`, color: 'blue' }
  }

  // 处理任务点击
  const handleTaskClick = (event: CalendarEvent) => {
    if (event.taskId) {
      navigate(`/task/${event.taskId}`)
    } else if (event.milestoneId) {
      navigate(`/projects/${event.projectId}?milestone=${event.milestoneId}`)
    } else if (event.projectId) {
      navigate(`/projects/${event.projectId}`)
    }
  }

  // 同步任务到日历
  const handleSyncTasks = async () => {
    if (!user?.id) return
    setSyncing(true)
    try {
      const result = await syncUserTasksToCalendar(user.id)
      message.success(`同步完成：${result.synced} 个任务已同步到日历`)
      // 重新加载数据
      loadUpcomingTasks()
      loadWorkItemStats()
    } catch (error) {
      console.error('Failed to sync tasks:', error)
      message.error('同步失败')
    } finally {
      setSyncing(false)
    }
  }

  // 获取订阅状态标签
  const getSubscriptionStatusTag = (status: string) => {
    switch (status) {
      case 'active':
        return <Tag icon={<CheckCircleOutlined />} color="success">正常</Tag>
      case 'error':
        return <Tag icon={<CloseCircleOutlined />} color="error">错误</Tag>
      case 'paused':
        return <Tag icon={<PauseCircleOutlined />} color="warning">已暂停</Tag>
      default:
        return <Tag>{status}</Tag>
    }
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
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <div className={styles.headerIcon}>
            <CalendarOutlined />
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>日程管理</Title>
            <Text className={styles.description}>
              管理您的日程安排，查看会议、任务截止日期和其他重要事件
            </Text>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Tooltip title="导出日历">
            <Button icon={<ExportOutlined />} onClick={handleExportCalendar}>导出</Button>
          </Tooltip>
          <Tooltip title="日历设置">
            <Button icon={<SettingOutlined />} onClick={() => setSettingsVisible(true)}>设置</Button>
          </Tooltip>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* 侧边栏 - 日历列表 */}
        <div className={styles.sidebar}>
          <Card className={styles.sidebarCard} size="small">
            <div className={styles.sidebarSection}>
              <div className={styles.sectionTitle}>我的日历</div>
              <List
                size="small"
                dataSource={calendarConfigs}
                renderItem={config => (
                  <List.Item className={styles.calendarItem}>
                    <div className={styles.calendarItemContent}>
                      <Switch
                        size="small"
                        checked={config.visible}
                        onChange={() => handleToggleCalendarVisibility(config)}
                      />
                      <span 
                        className={styles.calendarColor}
                        style={{ backgroundColor: config.color }}
                      />
                      {getCalendarTypeIcon(config.calendarType)}
                      <span className={styles.calendarName}>{config.name}</span>
                    </div>
                  </List.Item>
                )}
              />
            </div>

            <div className={styles.sidebarSection}>
              <div className={styles.sectionTitle}>
                订阅日历
                <Button 
                  type="link" 
                  size="small" 
                  icon={<PlusOutlined />}
                  onClick={() => openSubscriptionModal()}
                >
                  添加
                </Button>
              </div>
              {subscriptions.length > 0 ? (
                <List
                  size="small"
                  dataSource={subscriptions}
                  renderItem={sub => (
                    <List.Item className={styles.calendarItem}>
                      <div className={styles.calendarItemContent}>
                        <span 
                          className={styles.calendarColor}
                          style={{ backgroundColor: sub.color }}
                        />
                        <LinkOutlined />
                        <span className={styles.calendarName}>{sub.name}</span>
                        <Tooltip title="同步">
                          <Button 
                            type="text" 
                            size="small" 
                            icon={<SyncOutlined />}
                            onClick={() => handleSyncSubscription(sub.id)}
                          />
                        </Tooltip>
                      </div>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty 
                  image={Empty.PRESENTED_IMAGE_SIMPLE} 
                  description="暂无订阅"
                  className={styles.emptySubscription}
                />
              )}
            </div>

            {/* 工作项统计 */}
            <div className={styles.sidebarSection}>
              <div className={styles.sectionTitle}>
                <span>📊 本月工作项</span>
                <Tooltip title="同步任务到日历">
                  <Button
                    type="link"
                    size="small"
                    icon={<ReloadOutlined spin={syncing} />}
                    onClick={handleSyncTasks}
                    loading={syncing}
                  >
                    同步
                  </Button>
                </Tooltip>
              </div>
              <Row gutter={8} style={{ marginBottom: 8 }}>
                <Col span={12}>
                  <div style={{ textAlign: 'center', padding: '8px', background: '#f0f9ff', borderRadius: 8 }}>
                    <div style={{ fontSize: 20, fontWeight: 'bold', color: '#52c41a' }}>{workItemStats.taskCount}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>任务</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ textAlign: 'center', padding: '8px', background: '#f9f0ff', borderRadius: 8 }}>
                    <div style={{ fontSize: 20, fontWeight: 'bold', color: '#722ed1' }}>{workItemStats.milestoneCount}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>里程碑</div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* 即将到来的任务截止日期 */}
            <div className={styles.sidebarSection}>
              <div className={styles.sectionTitle}>
                <span><CheckSquareOutlined style={{ marginRight: 4 }} />任务截止日期</span>
              </div>
              {upcomingTasks.length > 0 ? (
                <List
                  size="small"
                  dataSource={upcomingTasks}
                  renderItem={task => {
                    const remaining = getDaysRemaining(task.endTime)
                    return (
                      <List.Item
                        className={styles.taskItem}
                        onClick={() => handleTaskClick(task)}
                      >
                        <div className={styles.taskItemContent}>
                          <div className={styles.taskInfo}>
                            <div className={styles.taskTitle}>
                              <FlagOutlined style={{ color: CALENDAR_TYPE_COLORS.task, marginRight: 4 }} />
                              {task.title}
                            </div>
                            <div className={styles.taskMeta}>
                              {task.projectName && (
                                <span className={styles.projectTag}>
                                  <ProjectOutlined style={{ marginRight: 2 }} />
                                  {task.projectName}
                                </span>
                              )}
                              <Tag color={remaining.color} style={{ marginLeft: 4 }}>
                                {remaining.text}
                              </Tag>
                            </div>
                          </div>
                          <RightOutlined className={styles.taskArrow} />
                        </div>
                      </List.Item>
                    )
                  }}
                />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="暂无即将到期的任务"
                  className={styles.emptyTasks}
                />
              )}
            </div>

            {/* 即将到来的里程碑 */}
            <div className={styles.sidebarSection}>
              <div className={styles.sectionTitle}>
                <span><TrophyOutlined style={{ marginRight: 4, color: '#722ed1' }} />里程碑</span>
              </div>
              {upcomingMilestones.length > 0 ? (
                <List
                  size="small"
                  dataSource={upcomingMilestones}
                  renderItem={milestone => {
                    const remaining = getDaysRemaining(milestone.endTime)
                    return (
                      <List.Item
                        className={styles.taskItem}
                        onClick={() => handleTaskClick(milestone)}
                      >
                        <div className={styles.taskItemContent}>
                          <div className={styles.taskInfo}>
                            <div className={styles.taskTitle}>
                              <TrophyOutlined style={{ color: '#722ed1', marginRight: 4 }} />
                              {milestone.title.replace('🎯 里程碑: ', '')}
                            </div>
                            <div className={styles.taskMeta}>
                              {milestone.projectName && (
                                <span className={styles.projectTag}>
                                  <ProjectOutlined style={{ marginRight: 2 }} />
                                  {milestone.projectName}
                                </span>
                              )}
                              <Tag color={remaining.color} style={{ marginLeft: 4 }}>
                                {remaining.text}
                              </Tag>
                            </div>
                          </div>
                          <RightOutlined className={styles.taskArrow} />
                        </div>
                      </List.Item>
                    )
                  }}
                />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="暂无即将到来的里程碑"
                  className={styles.emptyTasks}
                />
              )}
            </div>

            <div className={styles.sidebarSection}>
              <div className={styles.sectionTitle}>订阅我的日历</div>
              <div className={styles.subscriptionUrlBox}>
                <Input
                  value={subscriptionUrl}
                  readOnly
                  size="small"
                  suffix={
                    <Tooltip title="复制链接">
                      <CopyOutlined
                        className={styles.copyIcon}
                        onClick={handleCopySubscriptionUrl}
                      />
                    </Tooltip>
                  }
                />
                <Text type="secondary" className={styles.subscriptionHint}>
                  使用此链接在其他日历应用中订阅您的日程
                </Text>
              </div>
            </div>
          </Card>
        </div>

        {/* 主日历区域 */}
        <Card className={styles.calendarCard}>
          <Calendar
            userId={user?.id || 1}
            defaultView="month"
            height="calc(100vh - 250px)"
            showCalendarTypeFilter={true}
            showAgendaView={true}
          />
        </Card>
      </div>

      {/* 设置弹窗 */}
      <Modal
        title="日历设置"
        open={settingsVisible}
        onCancel={() => setSettingsVisible(false)}
        footer={null}
        width={600}
      >
        <Tabs defaultActiveKey="calendars">
          <TabPane tab="日历管理" key="calendars">
            <List
              dataSource={calendarConfigs}
              renderItem={config => (
                <List.Item
                  actions={[
                    <Select
                      key="color"
                      value={config.color}
                      onChange={(color) => handleUpdateCalendarColor(config, color)}
                      style={{ width: 120 }}
                      size="small"
                    >
                      {COLOR_PRESETS.map(color => (
                        <Option key={color} value={color}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span 
                              style={{ 
                                width: 14, 
                                height: 14, 
                                borderRadius: 3, 
                                backgroundColor: color 
                              }} 
                            />
                          </span>
                        </Option>
                      ))}
                    </Select>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <span 
                        style={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: 8, 
                          backgroundColor: config.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}
                      >
                        {getCalendarTypeIcon(config.calendarType)}
                      </span>
                    }
                    title={config.name}
                    description={CALENDAR_TYPE_LABELS[config.calendarType]}
                  />
                </List.Item>
              )}
            />
          </TabPane>
          <TabPane tab="订阅管理" key="subscriptions">
            <div style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => openSubscriptionModal()}
              >
                添加订阅
              </Button>
            </div>
            <List
              dataSource={subscriptions}
              renderItem={sub => (
                <List.Item
                  actions={[
                    getSubscriptionStatusTag(sub.status),
                    <Tooltip key="sync" title="同步">
                      <Button 
                        type="text" 
                        icon={<SyncOutlined />}
                        onClick={() => handleSyncSubscription(sub.id)}
                      />
                    </Tooltip>,
                    <Tooltip key="edit" title="编辑">
                      <Button 
                        type="text" 
                        icon={<EditOutlined />}
                        onClick={() => openSubscriptionModal(sub)}
                      />
                    </Tooltip>,
                    <Popconfirm
                      key="delete"
                      title="确定要删除此订阅吗？"
                      onConfirm={() => handleDeleteSubscription(sub.id)}
                    >
                      <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <span 
                        style={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: 8, 
                          backgroundColor: sub.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}
                      >
                        <LinkOutlined />
                      </span>
                    }
                    title={sub.name}
                    description={
                      <div>
                        <div style={{ fontSize: 12, color: '#999' }}>{sub.url}</div>
                        {sub.lastSyncAt && (
                          <div style={{ fontSize: 12, color: '#999' }}>
                            上次同步: {new Date(sub.lastSyncAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: '暂无订阅' }}
            />
          </TabPane>
          <TabPane tab="提醒设置" key="reminders">
            <div className={styles.reminderSettings}>
              <div className={styles.settingItem}>
                <div className={styles.settingLabel}>
                  <BellOutlined style={{ marginRight: 8 }} />
                  默认提醒时间
                </div>
                <Select defaultValue={15} style={{ width: 200 }}>
                  <Option value={0}>不提醒</Option>
                  <Option value={5}>5分钟前</Option>
                  <Option value={10}>10分钟前</Option>
                  <Option value={15}>15分钟前</Option>
                  <Option value={30}>30分钟前</Option>
                  <Option value={60}>1小时前</Option>
                  <Option value={1440}>1天前</Option>
                </Select>
              </div>
              <div className={styles.settingItem}>
                <div className={styles.settingLabel}>
                  <BellOutlined style={{ marginRight: 8 }} />
                  全天事件提醒
                </div>
                <Select defaultValue={540} style={{ width: 200 }}>
                  <Option value={0}>不提醒</Option>
                  <Option value={540}>当天上午9点</Option>
                  <Option value={1440}>前一天</Option>
                  <Option value={2880}>前两天</Option>
                </Select>
              </div>
              <div className={styles.settingItem}>
                <div className={styles.settingLabel}>
                  浏览器通知
                </div>
                <Switch defaultChecked />
              </div>
              <div className={styles.settingItem}>
                <div className={styles.settingLabel}>
                  邮件通知
                </div>
                <Switch />
              </div>
            </div>
          </TabPane>
        </Tabs>
      </Modal>

      {/* 订阅编辑弹窗 */}
      <Modal
        title={editingSubscription ? '编辑订阅' : '添加订阅'}
        open={subscriptionModalVisible}
        onCancel={() => setSubscriptionModalVisible(false)}
        onOk={handleSaveSubscription}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入订阅名称' }]}
          >
            <Input placeholder="例如：中国节假日" />
          </Form.Item>
          <Form.Item
            name="url"
            label="iCal URL"
            rules={[
              { required: true, message: '请输入iCal URL' },
              { type: 'url', message: '请输入有效的URL' }
            ]}
          >
            <Input placeholder="https://example.com/calendar.ics" />
          </Form.Item>
          <Form.Item
            name="color"
            label="颜色"
          >
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
          <Form.Item
            name="syncInterval"
            label="同步间隔"
          >
            <Select>
              <Option value={15}>每15分钟</Option>
              <Option value={30}>每30分钟</Option>
              <Option value={60}>每小时</Option>
              <Option value={360}>每6小时</Option>
              <Option value={720}>每12小时</Option>
              <Option value={1440}>每天</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default CalendarPage