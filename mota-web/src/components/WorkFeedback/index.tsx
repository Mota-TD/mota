/**
 * 工作反馈组件
 * 用于提交和查看工作反馈（指导、评价、问题、协作、汇报）
 */

import { useState, useEffect } from 'react'
import {
  Card,
  List,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Rate,
  Tag,
  Space,
  Avatar,
  message,
  Empty,
  Spin,
  Badge,
  Tabs,
  Tooltip
} from 'antd'
import {
  PlusOutlined,
  MessageOutlined,
  StarOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
  FileTextOutlined,
  UserOutlined,
  ClockCircleOutlined,
  SendOutlined
} from '@ant-design/icons'
import { workFeedbackApi } from '@/services/api'
import type { WorkFeedback, FeedbackType, FeedbackStatus } from '@/services/api/workFeedback'
import styles from './index.module.css'

const { TextArea } = Input

interface WorkFeedbackProps {
  taskId: number
  currentUserId?: number
  onFeedbackChange?: () => void
}

const WorkFeedbackComponent: React.FC<WorkFeedbackProps> = ({
  taskId,
  currentUserId,
  onFeedbackChange
}) => {
  const [loading, setLoading] = useState(false)
  const [feedbacks, setFeedbacks] = useState<WorkFeedback[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [replyModalVisible, setReplyModalVisible] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<WorkFeedback | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('all')
  const [form] = Form.useForm()
  const [replyForm] = Form.useForm()

  useEffect(() => {
    loadFeedbacks()
  }, [taskId])

  const loadFeedbacks = async () => {
    setLoading(true)
    try {
      const data = await workFeedbackApi.getFeedbacksByTaskId(taskId)
      setFeedbacks(data || [])
    } catch (error) {
      console.error('Load feedbacks error:', error)
      message.error('加载反馈失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      await workFeedbackApi.createWorkFeedback({
        taskId,
        feedbackType: values.type,
        content: values.content,
        rating: values.rating,
        toUserId: values.receiverId || currentUserId || 0
      })

      message.success('反馈已提交')
      setModalVisible(false)
      form.resetFields()
      loadFeedbacks()
      onFeedbackChange?.()
    } catch (error) {
      console.error('Submit feedback error:', error)
      message.error('提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  // 打开回复弹窗
  const handleOpenReply = (feedback: WorkFeedback) => {
    setSelectedFeedback(feedback)
    replyForm.resetFields()
    setReplyModalVisible(true)
  }

  // 提交回复
  const handleSubmitReply = async () => {
    if (!selectedFeedback) return
    
    try {
      const values = await replyForm.validateFields()
      setSubmitting(true)

      await workFeedbackApi.replyWorkFeedback(selectedFeedback.id, {
        replyContent: values.replyContent
      })

      message.success('回复已发送')
      setReplyModalVisible(false)
      replyForm.resetFields()
      setSelectedFeedback(null)
      loadFeedbacks()
      onFeedbackChange?.()
    } catch (error) {
      console.error('Reply feedback error:', error)
      message.error('回复失败')
    } finally {
      setSubmitting(false)
    }
  }

  // 标记为已读
  const handleMarkAsRead = async (feedback: WorkFeedback) => {
    if (feedback.status !== 'pending') return
    
    try {
      await workFeedbackApi.markFeedbackAsRead(feedback.id)
      loadFeedbacks()
    } catch (error) {
      console.error('Mark as read error:', error)
    }
  }

  const getTypeIcon = (type: FeedbackType) => {
    const iconMap: Record<FeedbackType, React.ReactNode> = {
      guidance: <MessageOutlined style={{ color: '#1677ff' }} />,
      evaluation: <StarOutlined style={{ color: '#faad14' }} />,
      problem: <QuestionCircleOutlined style={{ color: '#ff4d4f' }} />,
      collaboration: <TeamOutlined style={{ color: '#52c41a' }} />,
      report: <FileTextOutlined style={{ color: '#722ed1' }} />
    }
    return iconMap[type] || <MessageOutlined />
  }

  const getStatusBadge = (status: FeedbackStatus) => {
    const statusConfig: Record<FeedbackStatus, { status: 'default' | 'processing' | 'success'; text: string }> = {
      pending: { status: 'processing', text: '待处理' },
      read: { status: 'default', text: '已读' },
      replied: { status: 'success', text: '已回复' }
    }
    const config = statusConfig[status] || { status: 'default', text: status }
    return <Badge status={config.status} text={config.text} />
  }

  const formatTime = (time: string): string => {
    const date = new Date(time)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    
    return date.toLocaleDateString('zh-CN')
  }

  // 按类型过滤
  const filteredFeedbacks = activeTab === 'all'
    ? feedbacks
    : feedbacks.filter(f => f.feedbackType === activeTab)

  // 统计各类型数量
  const typeCounts = feedbacks.reduce((acc, f) => {
    acc[f.feedbackType] = (acc[f.feedbackType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const tabItems = [
    { key: 'all', label: `全部 (${feedbacks.length})` },
    { key: 'guidance', label: `指导 (${typeCounts.guidance || 0})` },
    { key: 'evaluation', label: `评价 (${typeCounts.evaluation || 0})` },
    { key: 'problem', label: `问题 (${typeCounts.problem || 0})` },
    { key: 'collaboration', label: `协作 (${typeCounts.collaboration || 0})` },
    { key: 'report', label: `汇报 (${typeCounts.report || 0})` }
  ]

  return (
    <div className={styles.container}>
      <Card
        title={
          <Space>
            <MessageOutlined />
            <span>工作反馈</span>
            <Tag>{feedbacks.length}</Tag>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            提交反馈
          </Button>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="small"
        />

        {loading ? (
          <div className={styles.loading}>
            <Spin />
          </div>
        ) : filteredFeedbacks.length > 0 ? (
          <List
            className={styles.feedbackList}
            dataSource={filteredFeedbacks}
            renderItem={(item) => (
              <List.Item className={styles.feedbackItem}>
                <div className={styles.feedbackHeader}>
                  <Space>
                    <Avatar
                      size={36}
                      src={item.fromUserAvatar}
                      icon={<UserOutlined />}
                    />
                    <div className={styles.feedbackInfo}>
                      <span className={styles.senderName}>{item.fromUserName}</span>
                      <span className={styles.feedbackTime}>
                        <ClockCircleOutlined /> {formatTime(item.createdAt || '')}
                      </span>
                    </div>
                  </Space>
                  <Space>
                    {getTypeIcon(item.feedbackType)}
                    <Tag color={workFeedbackApi.getFeedbackTypeColor(item.feedbackType)}>
                      {workFeedbackApi.getFeedbackTypeText(item.feedbackType)}
                    </Tag>
                    {getStatusBadge(item.status)}
                  </Space>
                </div>

                <div className={styles.feedbackContent}>
                  {item.content}
                </div>

                {item.rating && (
                  <div className={styles.feedbackRating}>
                    <Rate disabled value={item.rating} />
                    <span className={styles.ratingText}>
                      {workFeedbackApi.getRatingText(item.rating)}
                    </span>
                  </div>
                )}

                {item.toUserName && (
                  <div className={styles.feedbackReceiver}>
                    <span>接收人：</span>
                    <Tag icon={<UserOutlined />}>{item.toUserName}</Tag>
                  </div>
                )}

                {item.replyContent && (
                  <div className={styles.feedbackReply}>
                    <div className={styles.replyHeader}>
                      <Avatar size={24} src={item.toUserAvatar} icon={<UserOutlined />} />
                      <span>{item.toUserName} 回复：</span>
                    </div>
                    <div className={styles.replyContent}>{item.replyContent}</div>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className={styles.feedbackActions}>
                  {/* 如果当前用户是接收者且未回复，显示回复按钮 */}
                  {currentUserId === item.toUserId && item.status !== 'replied' && (
                    <Tooltip title="回复反馈">
                      <Button
                        type="primary"
                        size="small"
                        icon={<SendOutlined />}
                        onClick={() => handleOpenReply(item)}
                      >
                        回复
                      </Button>
                    </Tooltip>
                  )}
                  {/* 如果当前用户是接收者且状态为待处理，显示标记已读按钮 */}
                  {currentUserId === item.toUserId && item.status === 'pending' && (
                    <Button
                      type="text"
                      size="small"
                      onClick={() => handleMarkAsRead(item)}
                    >
                      标记已读
                    </Button>
                  )}
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无反馈" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>

      {/* 提交反馈弹窗 */}
      <Modal
        title="提交工作反馈"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
        }}
        onOk={handleSubmit}
        confirmLoading={submitting}
        okText="提交"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="type"
            label="反馈类型"
            rules={[{ required: true, message: '请选择反馈类型' }]}
          >
            <Select placeholder="请选择反馈类型">
              <Select.Option value="guidance">
                <Space><MessageOutlined /> 工作指导</Space>
              </Select.Option>
              <Select.Option value="evaluation">
                <Space><StarOutlined /> 工作评价</Space>
              </Select.Option>
              <Select.Option value="problem">
                <Space><QuestionCircleOutlined /> 问题反馈</Space>
              </Select.Option>
              <Select.Option value="collaboration">
                <Space><TeamOutlined /> 协作沟通</Space>
              </Select.Option>
              <Select.Option value="report">
                <Space><FileTextOutlined /> 工作汇报</Space>
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="content"
            label="反馈内容"
            rules={[{ required: true, message: '请输入反馈内容' }]}
          >
            <TextArea
              rows={4}
              placeholder="请输入反馈内容..."
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) => prev.type !== curr.type}
          >
            {({ getFieldValue }) => 
              getFieldValue('type') === 'evaluation' && (
                <Form.Item
                  name="rating"
                  label="评分"
                  rules={[{ required: true, message: '请选择评分' }]}
                >
                  <Rate />
                </Form.Item>
              )
            }
          </Form.Item>
        </Form>
      </Modal>

      {/* 回复反馈弹窗 */}
      <Modal
        title="回复工作反馈"
        open={replyModalVisible}
        onCancel={() => {
          setReplyModalVisible(false)
          replyForm.resetFields()
          setSelectedFeedback(null)
        }}
        onOk={handleSubmitReply}
        confirmLoading={submitting}
        okText="发送回复"
        okButtonProps={{ icon: <SendOutlined /> }}
      >
        {selectedFeedback && (
          <div className={styles.replyContext}>
            <div className={styles.originalFeedback}>
              <div className={styles.originalHeader}>
                <Avatar size={24} src={selectedFeedback.fromUserAvatar} icon={<UserOutlined />} />
                <span className={styles.originalSender}>{selectedFeedback.fromUserName}</span>
                <Tag color={workFeedbackApi.getFeedbackTypeColor(selectedFeedback.feedbackType)}>
                  {workFeedbackApi.getFeedbackTypeText(selectedFeedback.feedbackType)}
                </Tag>
              </div>
              <div className={styles.originalContent}>
                {selectedFeedback.content}
              </div>
            </div>
          </div>
        )}
        <Form form={replyForm} layout="vertical">
          <Form.Item
            name="replyContent"
            label="回复内容"
            rules={[{ required: true, message: '请输入回复内容' }]}
          >
            <TextArea
              rows={4}
              placeholder="请输入回复内容..."
              maxLength={1000}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default WorkFeedbackComponent