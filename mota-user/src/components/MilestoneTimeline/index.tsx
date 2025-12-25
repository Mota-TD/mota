/**
 * 里程碑时间线组件
 * 展示项目里程碑的时间线视图
 */

import { useState, useEffect } from 'react'
import {
  Timeline,
  Card,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Empty,
  Spin,
  Tooltip,
  Popconfirm,
  Progress
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FlagOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { milestoneApi } from '@/services/api'
import type { Milestone, MilestoneStatus } from '@/services/api/milestone'
import styles from './index.module.css'

const { TextArea } = Input

interface MilestoneTimelineProps {
  projectId: number | string
  editable?: boolean
  onMilestoneChange?: () => void
}

const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({
  projectId,
  editable = false,
  onMilestoneChange
}) => {
  const [loading, setLoading] = useState(false)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadMilestones()
  }, [projectId])

  const loadMilestones = async () => {
    setLoading(true)
    try {
      const numericProjectId = typeof projectId === 'string' ? parseInt(projectId, 10) : projectId
      const data = await milestoneApi.getMilestonesByProjectId(numericProjectId)
      setMilestones(data || [])
    } catch (error) {
      console.error('Load milestones error:', error)
      message.error('加载里程碑失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingMilestone(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (milestone: Milestone) => {
    setEditingMilestone(milestone)
    form.setFieldsValue({
      name: milestone.name,
      description: milestone.description,
      targetDate: milestone.targetDate ? dayjs(milestone.targetDate) : null
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: string | number) => {
    try {
      await milestoneApi.deleteMilestone(id)
      message.success('里程碑已删除')
      loadMilestones()
      onMilestoneChange?.()
    } catch (error) {
      console.error('Delete milestone error:', error)
      message.error('删除失败')
    }
  }

  const handleComplete = async (milestone: Milestone) => {
    try {
      await milestoneApi.completeMilestone(milestone.id)
      message.success('里程碑已完成')
      loadMilestones()
      onMilestoneChange?.()
    } catch (error) {
      console.error('Complete milestone error:', error)
      message.error('操作失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      const data = {
        projectId,
        name: values.name,
        description: values.description,
        targetDate: values.targetDate?.format('YYYY-MM-DD')
      }

      if (editingMilestone) {
        await milestoneApi.updateMilestone(editingMilestone.id, data)
        message.success('里程碑已更新')
      } else {
        await milestoneApi.createMilestone(data as milestoneApi.CreateMilestoneRequest)
        message.success('里程碑已创建')
      }

      setModalVisible(false)
      loadMilestones()
      onMilestoneChange?.()
    } catch (error) {
      console.error('Submit milestone error:', error)
      message.error('操作失败')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusIcon = (status: MilestoneStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />
      case 'delayed':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
      default:
        return <ClockCircleOutlined style={{ color: '#1677ff' }} />
    }
  }

  const getStatusColor = (status: MilestoneStatus): 'green' | 'red' | 'blue' | 'gray' => {
    switch (status) {
      case 'completed':
        return 'green'
      case 'delayed':
        return 'red'
      default:
        return 'blue'
    }
  }

  const getTimelineColor = (milestone: Milestone): string => {
    if (milestone.status === 'completed') return '#52c41a'
    if (milestone.status === 'delayed') return '#ff4d4f'
    
    // 检查是否即将到期（7天内）
    if (milestone.targetDate) {
      const targetDate = dayjs(milestone.targetDate)
      const daysUntilDue = targetDate.diff(dayjs(), 'day')
      if (daysUntilDue <= 7 && daysUntilDue >= 0) return '#faad14'
    }
    
    return '#1677ff'
  }

  const getDaysRemaining = (targetDate: string): string => {
    const due = dayjs(targetDate)
    const today = dayjs()
    const days = due.diff(today, 'day')
    
    if (days < 0) return `已逾期 ${Math.abs(days)} 天`
    if (days === 0) return '今天到期'
    if (days === 1) return '明天到期'
    return `还剩 ${days} 天`
  }

  // 计算完成进度
  const completedCount = milestones.filter(m => m.status === 'completed').length
  const progressPercent = milestones.length > 0 
    ? Math.round((completedCount / milestones.length) * 100) 
    : 0

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Card
        title={
          <Space>
            <FlagOutlined />
            <span>项目里程碑</span>
            <Tag>{milestones.length} 个</Tag>
          </Space>
        }
        extra={
          <Space>
            <Progress 
              percent={progressPercent} 
              size="small" 
              style={{ width: 100 }}
              format={() => `${completedCount}/${milestones.length}`}
            />
            {editable && (
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                添加里程碑
              </Button>
            )}
          </Space>
        }
      >
        {milestones.length > 0 ? (
          <Timeline
            mode="left"
            items={milestones.map((milestone) => ({
              color: getTimelineColor(milestone),
              dot: getStatusIcon(milestone.status),
              children: (
                <div className={styles.milestoneItem}>
                  <div className={styles.milestoneHeader}>
                    <span className={styles.milestoneName}>{milestone.name}</span>
                    <Tag color={getStatusColor(milestone.status)}>
                      {milestoneApi.getStatusText(milestone.status)}
                    </Tag>
                  </div>
                  
                  {milestone.description && (
                    <p className={styles.milestoneDesc}>{milestone.description}</p>
                  )}
                  
                  <div className={styles.milestoneMeta}>
                    {milestone.targetDate && (
                      <span className={styles.dueDate}>
                        <ClockCircleOutlined />
                        {dayjs(milestone.targetDate).format('YYYY-MM-DD')}
                        {milestone.status !== 'completed' && (
                          <span className={styles.daysRemaining}>
                            ({getDaysRemaining(milestone.targetDate)})
                          </span>
                        )}
                      </span>
                    )}
                    {milestone.completedAt && (
                      <span className={styles.completedAt}>
                        <CheckCircleOutlined />
                        完成于 {dayjs(milestone.completedAt).format('YYYY-MM-DD')}
                      </span>
                    )}
                  </div>

                  {editable && milestone.status !== 'completed' && (
                    <div className={styles.milestoneActions}>
                      <Space size="small">
                        <Tooltip title="标记完成">
                          <Button
                            type="text"
                            size="small"
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleComplete(milestone)}
                          />
                        </Tooltip>
                        <Tooltip title="编辑">
                          <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(milestone)}
                          />
                        </Tooltip>
                        <Popconfirm
                          title="确定删除此里程碑？"
                          onConfirm={() => handleDelete(milestone.id)}
                        >
                          <Tooltip title="删除">
                            <Button
                              type="text"
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                            />
                          </Tooltip>
                        </Popconfirm>
                      </Space>
                    </div>
                  )}
                </div>
              )
            }))}
          />
        ) : (
          <Empty description="暂无里程碑" />
        )}
      </Card>

      {/* 编辑/新增弹窗 */}
      <Modal
        title={editingMilestone ? '编辑里程碑' : '新增里程碑'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        confirmLoading={submitting}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="里程碑名称"
            rules={[{ required: true, message: '请输入里程碑名称' }]}
          >
            <Input placeholder="请输入里程碑名称" maxLength={100} />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea 
              rows={3} 
              placeholder="请输入里程碑描述" 
              maxLength={500}
              showCount
            />
          </Form.Item>
          
          <Form.Item
            name="targetDate"
            label="目标日期"
            rules={[{ required: true, message: '请选择目标日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default MilestoneTimeline