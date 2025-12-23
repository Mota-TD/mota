import { useState, useEffect } from 'react'
import { Card, List, Button, Badge, Empty, Spin, Tabs, Space, Typography, message } from 'antd'
import { 
  BellOutlined, 
  CheckOutlined,
  DeleteOutlined,
  IssuesCloseOutlined,
  CommentOutlined,
  AlertOutlined,
  SettingOutlined,
  MergeCellsOutlined
} from '@ant-design/icons'
import * as notificationApi from '@/services/api/notification'
import styles from './index.module.css'

const { Text } = Typography

interface Notification {
  id: number
  type: string
  title: string
  time: string
  read: boolean
  link: string
}

const NotificationsPage = () => {
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const res = await notificationApi.getNotifications()
      const notificationsList = (res as any).list || res || []
      setNotifications(notificationsList)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'issue':
        return <IssuesCloseOutlined style={{ color: '#2b7de9' }} />
      case 'comment':
        return <CommentOutlined style={{ color: '#10b981' }} />
      case 'merge':
        return <MergeCellsOutlined style={{ color: '#8b5cf6' }} />
      case 'system':
        return <AlertOutlined style={{ color: '#f59e0b' }} />
      default:
        return <BellOutlined style={{ color: '#999' }} />
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

  const handleDelete = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id))
    message.success('通知已删除')
  }

  const handleClearAll = () => {
    setNotifications([])
    message.success('已清空所有通知')
  }

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true
    if (activeTab === 'unread') return !n.read
    return n.type === activeTab
  })

  const unreadCount = notifications.filter(n => !n.read).length

  const tabItems = [
    { key: 'all', label: '全部' },
    { key: 'unread', label: <Badge count={unreadCount} size="small" offset={[8, 0]}>未读</Badge> },
    { key: 'issue', label: '事项' },
    { key: 'comment', label: '评论' },
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
      <Card>
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
                actions={[
                  !item.read && (
                    <Button 
                      type="text" 
                      size="small"
                      onClick={() => handleMarkAsRead(item.id)}
                    >
                      标为已读
                    </Button>
                  ),
                  <Button 
                    type="text" 
                    size="small" 
                    danger
                    onClick={() => handleDelete(item.id)}
                  >
                    删除
                  </Button>
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={
                    <div className={styles.iconWrapper}>
                      {getTypeIcon(item.type)}
                    </div>
                  }
                  title={
                    <a href={item.link} className={styles.notificationTitle}>
                      {!item.read && <Badge status="processing" />}
                      {item.title}
                    </a>
                  }
                  description={
                    <Text type="secondary" className={styles.time}>
                      {item.time}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  )
}

export default NotificationsPage