/**
 * 实时协作组件
 * 支持在线状态显示、实时评论、@提及等功能
 */
import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Card,
  Avatar,
  Badge,
  Input,
  Button,
  List,
  Tag,
  Space,
  Tooltip,
  Dropdown,
  message,
  Popover,
  Divider,
  Empty,
  Spin,
  notification
} from 'antd'
import {
  MessageOutlined,
  SendOutlined,
  UserOutlined,
  EyeOutlined,
  EditOutlined,
  BellOutlined,
  TeamOutlined,
  VideoCameraOutlined,
  PhoneOutlined,
  MoreOutlined,
  CloseOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import styles from './index.module.css'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const { TextArea } = Input

// 在线状态枚举
export type OnlineStatus = 'online' | 'away' | 'busy' | 'offline'

// 用户在线信息
export interface OnlineUser {
  id: number
  name: string
  avatar?: string
  status: OnlineStatus
  lastActiveTime: string
  currentPage?: string
  isTyping?: boolean
}

// 实时评论
export interface RealtimeComment {
  id: number
  content: string
  userId: number
  userName: string
  userAvatar?: string
  createdAt: string
  mentions?: number[] // 提及的用户ID
  reactions?: {
    type: string
    users: number[]
  }[]
  isEditing?: boolean
}

// 活动记录
export interface ActivityRecord {
  id: number
  userId: number
  userName: string
  userAvatar?: string
  action: string
  target: string
  timestamp: string
  details?: any
}

interface RealTimeCollaborationProps {
  projectId?: number
  taskId?: number
  visible: boolean
  onClose: () => void
  currentUserId: number
}

const RealTimeCollaboration: React.FC<RealTimeCollaborationProps> = ({
  projectId,
  taskId,
  visible,
  onClose,
  currentUserId
}) => {
  const navigate = useNavigate()
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [comments, setComments] = useState<RealtimeComment[]>([])
  const [activities, setActivities] = useState<ActivityRecord[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'activity'>('chat')
  const [mentioning, setMentioning] = useState<OnlineUser[]>([])
  const [showMentionList, setShowMentionList] = useState(false)
  const [typingUsers, setTypingUsers] = useState<number[]>([])
  
  const commentInputRef = useRef<any>(null)
  const commentsEndRef = useRef<HTMLDivElement>(null)

  // 模拟WebSocket连接
  useEffect(() => {
    if (!visible) return

    // 模拟获取在线用户
    setOnlineUsers([
      {
        id: 1,
        name: '张三',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
        status: 'online',
        lastActiveTime: new Date().toISOString(),
        currentPage: '/projects/1'
      },
      {
        id: 2,
        name: '李四',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
        status: 'away',
        lastActiveTime: dayjs().subtract(10, 'minute').toISOString(),
        currentPage: '/tasks/5'
      },
      {
        id: 3,
        name: '王五',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
        status: 'busy',
        lastActiveTime: dayjs().subtract(2, 'hour').toISOString()
      }
    ])

    // 模拟获取评论
    setComments([
      {
        id: 1,
        content: '项目进度看起来不错，@张三 请确认一下里程碑时间',
        userId: 2,
        userName: '李四',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
        createdAt: dayjs().subtract(1, 'hour').toISOString(),
        mentions: [1]
      },
      {
        id: 2,
        content: '好的，我来确认一下时间安排',
        userId: 1,
        userName: '张三',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
        createdAt: dayjs().subtract(30, 'minute').toISOString()
      }
    ])

    // 模拟活动记录
    setActivities([
      {
        id: 1,
        userId: 1,
        userName: '张三',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
        action: '更新了任务状态',
        target: '用户界面设计',
        timestamp: dayjs().subtract(15, 'minute').toISOString()
      },
      {
        id: 2,
        userId: 3,
        userName: '王五',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
        action: '上传了文件',
        target: '设计稿v2.0.sketch',
        timestamp: dayjs().subtract(1, 'hour').toISOString()
      }
    ])

    return () => {
      // 清理WebSocket连接
    }
  }, [visible, projectId, taskId])

  // 自动滚动到底部
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments])

  const getStatusColor = (status: OnlineStatus) => {
    const colors = {
      online: '#52c41a',
      away: '#faad14',
      busy: '#ff4d4f',
      offline: '#d9d9d9'
    }
    return colors[status]
  }

  const getStatusText = (status: OnlineStatus) => {
    const texts = {
      online: '在线',
      away: '离开',
      busy: '忙碌',
      offline: '离线'
    }
    return texts[status]
  }

  const handleSendComment = useCallback(async () => {
    if (!newComment.trim()) return

    const comment: RealtimeComment = {
      id: Date.now(),
      content: newComment,
      userId: currentUserId,
      userName: '当前用户',
      createdAt: new Date().toISOString(),
      mentions: extractMentions(newComment)
    }

    setComments(prev => [...prev, comment])
    setNewComment('')
    
    // 发送提及通知
    if (comment.mentions && comment.mentions.length > 0) {
      comment.mentions.forEach(userId => {
        notification.info({
          message: '您被提及了',
          description: `${comment.userName} 在评论中提及了您`,
          placement: 'topRight'
        })
      })
    }

    message.success('评论已发送')
  }, [newComment, currentUserId])

  const extractMentions = (content: string): number[] => {
    const mentionPattern = /@(\w+)/g
    const mentions: number[] = []
    let match: RegExpExecArray | null
    
    while ((match = mentionPattern.exec(content)) !== null) {
      const user = onlineUsers.find(u => u.name === match![1])
      if (user) {
        mentions.push(user.id)
      }
    }
    
    return mentions
  }

  const handleMention = (user: OnlineUser) => {
    const cursorPosition = commentInputRef.current?.resizableTextArea?.textArea?.selectionStart || 0
    const beforeCursor = newComment.substring(0, cursorPosition)
    const afterCursor = newComment.substring(cursorPosition)
    const newText = `${beforeCursor}@${user.name} ${afterCursor}`
    
    setNewComment(newText)
    setShowMentionList(false)
    
    // 重新聚焦输入框
    setTimeout(() => {
      commentInputRef.current?.focus()
    }, 100)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setNewComment(value)
    
    // 检测@符号，显示提及列表
    const lastAtIndex = value.lastIndexOf('@')
    if (lastAtIndex !== -1 && lastAtIndex === value.length - 1) {
      setShowMentionList(true)
      setMentioning(onlineUsers.filter(u => u.id !== currentUserId))
    } else {
      setShowMentionList(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSendComment()
    }
  }

  const getUserMenuItems = (user: OnlineUser) => [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '查看资料',
      onClick: () => navigate(`/members/${user.id}`)
    },
    {
      key: 'mention',
      icon: <MessageOutlined />,
      label: '提及',
      onClick: () => handleMention(user)
    },
    {
      key: 'video',
      icon: <VideoCameraOutlined />,
      label: '视频通话',
      onClick: () => message.info('视频通话功能开发中')
    },
    {
      key: 'call',
      icon: <PhoneOutlined />,
      label: '语音通话',
      onClick: () => message.info('语音通话功能开发中')
    }
  ]

  if (!visible) return null

  return (
    <Card 
      className={styles.collaborationCard}
      title={
        <Space>
          <TeamOutlined />
          实时协作
          <Badge count={onlineUsers.filter(u => u.status === 'online').length} />
        </Space>
      }
      extra={
        <Button type="text" icon={<CloseOutlined />} onClick={onClose} />
      }
      size="small"
    >
      {/* 在线用户列表 */}
      <div className={styles.onlineUsers}>
        <div className={styles.sectionTitle}>
          <UserOutlined /> 在线成员 ({onlineUsers.length})
        </div>
        <div className={styles.userList}>
          {onlineUsers.map(user => (
            <Dropdown 
              key={user.id}
              menu={{ items: getUserMenuItems(user) }}
              trigger={['contextMenu']}
            >
              <div className={styles.userItem}>
                <Badge 
                  dot 
                  color={getStatusColor(user.status)}
                  offset={[-2, 2]}
                >
                  <Avatar 
                    size="small" 
                    src={user.avatar}
                    icon={<UserOutlined />}
                  />
                </Badge>
                <Tooltip 
                  title={
                    <div>
                      <div>{user.name}</div>
                      <div>状态: {getStatusText(user.status)}</div>
                      <div>最后活动: {dayjs(user.lastActiveTime).fromNow()}</div>
                      {user.currentPage && <div>当前页面: {user.currentPage}</div>}
                    </div>
                  }
                >
                  <span className={styles.userName}>{user.name}</span>
                </Tooltip>
                {user.isTyping && <Tag color="blue">正在输入...</Tag>}
              </div>
            </Dropdown>
          ))}
        </div>
      </div>

      <Divider style={{ margin: '12px 0' }} />

      {/* 标签切换 */}
      <div className={styles.tabContainer}>
        <Space>
          <Button 
            type={activeTab === 'chat' ? 'primary' : 'default'}
            size="small"
            icon={<MessageOutlined />}
            onClick={() => setActiveTab('chat')}
          >
            讨论 ({comments.length})
          </Button>
          <Button 
            type={activeTab === 'activity' ? 'primary' : 'default'}
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setActiveTab('activity')}
          >
            动态 ({activities.length})
          </Button>
        </Space>
      </div>

      {/* 内容区域 */}
      <div className={styles.contentArea}>
        {activeTab === 'chat' && (
          <div className={styles.chatContainer}>
            {/* 评论列表 */}
            <div className={styles.commentsList}>
              {comments.length === 0 ? (
                <Empty 
                  description="还没有讨论，开始第一条评论吧"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className={styles.commentItem}>
                    <Avatar 
                      size="small" 
                      src={comment.userAvatar}
                      icon={<UserOutlined />}
                    />
                    <div className={styles.commentContent}>
                      <div className={styles.commentHeader}>
                        <span className={styles.commentUser}>{comment.userName}</span>
                        <span className={styles.commentTime}>
                          {dayjs(comment.createdAt).fromNow()}
                        </span>
                      </div>
                      <div className={styles.commentText}>
                        {comment.content}
                        {comment.mentions && comment.mentions.includes(currentUserId) && (
                          <Tag color="blue" style={{ marginLeft: 8 }}>
                            <BellOutlined /> 提及了您
                          </Tag>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={commentsEndRef} />
            </div>

            {/* 正在输入提示 */}
            {typingUsers.length > 0 && (
              <div className={styles.typingIndicator}>
                <Space>
                  <Spin size="small" />
                  {typingUsers.map(userId => {
                    const user = onlineUsers.find(u => u.id === userId)
                    return user?.name
                  }).join(', ')} 正在输入...
                </Space>
              </div>
            )}

            {/* 评论输入框 */}
            <div className={styles.commentInput}>
              <Popover
                content={
                  <div className={styles.mentionList}>
                    {mentioning.map(user => (
                      <div 
                        key={user.id}
                        className={styles.mentionItem}
                        onClick={() => handleMention(user)}
                      >
                        <Avatar size="small" src={user.avatar} icon={<UserOutlined />} />
                        <span>{user.name}</span>
                        <Tag color={getStatusColor(user.status)}>
                          {getStatusText(user.status)}
                        </Tag>
                      </div>
                    ))}
                  </div>
                }
                open={showMentionList}
                placement="topLeft"
              >
                <TextArea
                  ref={commentInputRef}
                  placeholder="输入评论... (Ctrl+Enter 发送，@ 提及成员)"
                  value={newComment}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  style={{ marginBottom: 8 }}
                />
              </Popover>
              <div className={styles.inputActions}>
                <Space>
                  <Button
                    type="primary"
                    size="small"
                    icon={<SendOutlined />}
                    onClick={handleSendComment}
                    disabled={!newComment.trim()}
                  >
                    发送
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setShowMentionList(true)}
                  >
                    @提及
                  </Button>
                </Space>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className={styles.activityContainer}>
            {activities.length === 0 ? (
              <Empty 
                description="暂无活动记录"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <List
                size="small"
                dataSource={activities}
                renderItem={activity => (
                  <List.Item className={styles.activityItem}>
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          size="small" 
                          src={activity.userAvatar}
                          icon={<UserOutlined />}
                        />
                      }
                      title={
                        <Space>
                          <span className={styles.activityUser}>{activity.userName}</span>
                          <span className={styles.activityAction}>{activity.action}</span>
                          <span className={styles.activityTarget}>{activity.target}</span>
                        </Space>
                      }
                      description={dayjs(activity.timestamp).fromNow()}
                    />
                  </List.Item>
                )}
              />
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

export default RealTimeCollaboration