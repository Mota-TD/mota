import { useState, useEffect } from 'react'
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
  Modal
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
  SyncOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import * as notificationApi from '@/services/api/notification'
import styles from './index.module.css'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

// 通知类型定义
type NotificationType = 
  | 'task_assigned'      // 任务分配
  | 'task_completed'     // 任务完成
  | 'task_overdue'       // 任务逾期
  | 'task_comment'       // 任务评论
  | 'task_progress'      // 进度更新
  | 'plan_submitted'     // 工作计划提交
  | 'plan_approved'      // 工作计划审批通过
  | 'plan_rejected'      // 工作计划驳回
  | 'feedback_received'  // 收到反馈
  | 'milestone_reached'  // 里程碑达成
  | 'milestone_due'      // 里程碑即将到期
  | 'deliverable_uploaded' // 交付物上传
  | 'project_update'     // 项目更新
  | 'member_joined'      // 成员加入
  | 'mention'            // @提及
  | 'system'             // 系统通知
  | 'issue'              // 事项通知
  | 'comment'            // 评论通知
  | 'merge'              // 合并通知

interface Notification {
  id: number
  type: NotificationType
  title: string
  content?: string
  time: string
  read: boolean
  link: string
  sender?: {
    id: number
    name: string
    avatar?: string
  }
  project?: {
    id: number
    name: string
  }
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}

const NotificationsPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const res = await notificationApi.getNotifications()
      const notificationsList = (res as any).list || res || []
      setNotifications(notificationsList.length > 0 ? notificationsList : getMockNotifications())
    } catch (error) {
      console.error('Failed to load notifications:', error)
      // 使用模拟数据
      setNotifications(getMockNotifications())
    } finally {
      setLoading(false)
    }
  }

  // 模拟通知数据
  const getMockNotifications = (): Notification[] => [
    {
      id: 1,
      type: 'task_assigned',
      title: '您有新的任务分配',
      content: '张经理将任务"市场调研报告撰写"分配给您',
      time: dayjs().subtract(10, 'minute').toISOString(),
      read: false,
      link: '/tasks/1',
      sender: { id: 1, name: '张经理' },
      project: { id: 1, name: '2024年度市场推广项目' },
      priority: 'high'
    },
    {
      id: 2,
      type: 'plan_approved',
      title: '工作计划已审批通过',
      content: '您提交的"Q1市场推广计划"已通过审批',
      time: dayjs().subtract(30, 'minute').toISOString(),
      read: false,
      link: '/department-tasks/1',
      sender: { id: 2, name: '李总监' },
      project: { id: 1, name: '2024年度市场推广项目' }
    },
    {
      id: 3,
      type: 'task_comment',
      title: '有人在任务中@了您',
      content: '@您 请帮忙审核一下这份报告的数据部分',
      time: dayjs().subtract(1, 'hour').toISOString(),
      read: false,
      link: '/tasks/2',
      sender: { id: 3, name: '王小明' },
      project: { id: 1, name: '2024年度市场推广项目' }
    },
    {
      id: 4,
      type: 'milestone_due',
      title: '里程碑即将到期',
      content: '里程碑"需求分析完成"将于明天到期',
      time: dayjs().subtract(2, 'hour').toISOString(),
      read: true,
      link: '/projects/1',
      project: { id: 1, name: '2024年度市场推广项目' },
      priority: 'urgent'
    },
    {
      id: 5,
      type: 'feedback_received',
      title: '收到工作反馈',
      content: '张经理对您的工作进行了反馈评价',
      time: dayjs().subtract(3, 'hour').toISOString(),
      read: true,
      link: '/department-tasks/1',
      sender: { id: 1, name: '张经理' }
    },
    {
      id: 6,
      type: 'task_overdue',
      title: '任务已逾期',
      content: '任务"竞品分析文档"已逾期2天',
      time: dayjs().subtract(1, 'day').toISOString(),
      read: true,
      link: '/tasks/3',
      project: { id: 1, name: '2024年度市场推广项目' },
      priority: 'urgent'
    },
    {
      id: 7,
      type: 'deliverable_uploaded',
      title: '新交付物已上传',
      content: '王小明上传了交付物"市场调研报告V1.0.docx"',
      time: dayjs().subtract(1, 'day').toISOString(),
      read: true,
      link: '/tasks/1',
      sender: { id: 3, name: '王小明' }
    },
    {
      id: 8,
      type: 'task_progress',
      title: '任务进度更新',
      content: '任务"用户访谈记录整理"进度已更新至80%',
      time: dayjs().subtract(2, 'day').toISOString(),
      read: true,
      link: '/tasks/4',
      sender: { id: 4, name: '赵小红' }
    },
    {
      id: 9,
      type: 'member_joined',
      title: '新成员加入项目',
      content: '刘工程师已加入项目"2024年度市场推广项目"',
      time: dayjs().subtract(3, 'day').toISOString(),
      read: true,
      link: '/projects/1',
      sender: { id: 5, name: '刘工程师' },
      project: { id: 1, name: '2024年度市场推广项目' }
    },
    {
      id: 10,
      type: 'system',
      title: '系统维护通知',
      content: '系统将于本周六凌晨2:00-4:00进行维护升级',
      time: dayjs().subtract(5, 'day').toISOString(),
      read: true,
      link: '#'
    }
  ]

  const getTypeIcon = (type: NotificationType) => {
    const iconMap: Record<NotificationType, React.ReactNode> = {
      task_assigned: <TeamOutlined style={{ color: '#2b7de9' }} />,
      task_completed: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      task_overdue: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      task_comment: <CommentOutlined style={{ color: '#10b981' }} />,
      task_progress: <RiseOutlined style={{ color: '#1890ff' }} />,
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
      system: <AlertOutlined style={{ color: '#f59e0b' }} />,
      issue: <IssuesCloseOutlined style={{ color: '#2b7de9' }} />,
      comment: <CommentOutlined style={{ color: '#10b981' }} />,
      merge: <MergeCellsOutlined style={{ color: '#8b5cf6' }} />
    }
    return iconMap[type] || <BellOutlined style={{ color: '#999' }} />
  }

  const getTypeLabel = (type: NotificationType) => {
    const labelMap: Record<NotificationType, string> = {
      task_assigned: '任务分配',
      task_completed: '任务完成',
      task_overdue: '任务逾期',
      task_comment: '任务评论',
      task_progress: '进度更新',
      plan_submitted: '计划提交',
      plan_approved: '计划审批',
      plan_rejected: '计划驳回',
      feedback_received: '工作反馈',
      milestone_reached: '里程碑达成',
      milestone_due: '里程碑到期',
      deliverable_uploaded: '交付物上传',
      project_update: '项目更新',
      member_joined: '成员加入',
      mention: '@提及',
      system: '系统通知',
      issue: '事项通知',
      comment: '评论通知',
      merge: '合并通知'
    }
    return labelMap[type] || '通知'
  }

  const getPriorityTag = (priority?: string) => {
    if (!priority) return null
    const config: Record<string, { color: string; text: string }> = {
      low: { color: 'green', text: '低' },
      medium: { color: 'blue', text: '中' },
      high: { color: 'orange', text: '高' },
      urgent: { color: 'red', text: '紧急' }
    }
    return <Tag color={config[priority]?.color}>{config[priority]?.text}</Tag>
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

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id)
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ))
      message.success('已标记为已读')
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead()
      setNotifications(notifications.map(n => ({ ...n, read: true })))
      message.success('已全部标记为已读')
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
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
      onOk: () => {
        setNotifications([])
        message.success('已清空所有通知')
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
    if (!notification.read) {
      handleMarkAsRead(notification.id)
    }
    if (notification.link && notification.link !== '#') {
      navigate(notification.link)
    }
  }

  // 根据类型分组筛选
  const getFilteredNotifications = () => {
    if (activeTab === 'all') return notifications
    if (activeTab === 'unread') return notifications.filter(n => !n.read)
    
    // 按类型分组
    const typeGroups: Record<string, NotificationType[]> = {
      task: ['task_assigned', 'task_completed', 'task_overdue', 'task_comment', 'task_progress'],
      plan: ['plan_submitted', 'plan_approved', 'plan_rejected'],
      project: ['project_update', 'milestone_reached', 'milestone_due', 'member_joined', 'deliverable_uploaded'],
      feedback: ['feedback_received', 'mention'],
      system: ['system']
    }
    
    const types = typeGroups[activeTab] || [activeTab as NotificationType]
    return notifications.filter(n => types.includes(n.type))
  }

  const filteredNotifications = getFilteredNotifications()
  const unreadCount = notifications.filter(n => !n.read).length

  const tabItems = [
    { key: 'all', label: `全部 (${notifications.length})` },
    { key: 'unread', label: <Badge count={unreadCount} size="small" offset={[8, 0]}>未读</Badge> },
    { key: 'task', label: '任务' },
    { key: 'plan', label: '计划审批' },
    { key: 'project', label: '项目' },
    { key: 'feedback', label: '反馈' },
    { key: 'system', label: '系统' },
  ]

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
            <Button 
              icon={<DeleteOutlined />} 
              onClick={handleClearAll}
              disabled={notifications.length === 0}
            >
              清空
            </Button>
            <Button icon={<SettingOutlined />}>
              设置
            </Button>
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
            renderItem={(item) => (
              <List.Item
                className={`${styles.notificationItem} ${!item.read ? styles.unread : ''}`}
                onClick={() => handleNotificationClick(item)}
              >
                <div className={styles.notificationContent}>
                  <div className={styles.iconWrapper}>
                    {getTypeIcon(item.type)}
                  </div>
                  <div className={styles.mainContent}>
                    <div className={styles.notificationHeader}>
                      <span className={styles.notificationTitle}>
                        {!item.read && <Badge status="processing" />}
                        {item.title}
                      </span>
                      <Space size={8}>
                        {getPriorityTag(item.priority)}
                        <Tag>{getTypeLabel(item.type)}</Tag>
                      </Space>
                    </div>
                    {item.content && (
                      <p className={styles.notificationDesc}>{item.content}</p>
                    )}
                    <div className={styles.notificationMeta}>
                      {item.sender && (
                        <span className={styles.sender}>
                          <Avatar size="small" src={item.sender.avatar}>
                            {item.sender.name.charAt(0)}
                          </Avatar>
                          {item.sender.name}
                        </span>
                      )}
                      {item.project && (
                        <span className={styles.project}>
                          <ProjectOutlined /> {item.project.name}
                        </span>
                      )}
                      <span className={styles.time}>
                        <ClockCircleOutlined /> {formatTime(item.time)}
                      </span>
                    </div>
                  </div>
                  <div className={styles.actions}>
                    <Dropdown
                      menu={{
                        items: [
                          !item.read && {
                            key: 'read',
                            label: '标为已读',
                            onClick: (info: MenuInfo) => {
                              info.domEvent.stopPropagation()
                              handleMarkAsRead(item.id)
                            }
                          },
                          {
                            key: 'delete',
                            label: '删除',
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
            )}
          />
        )}
      </Card>
    </div>
  )
}

export default NotificationsPage