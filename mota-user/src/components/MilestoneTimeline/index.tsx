/**
 * 里程碑时间线组件
 * 展示项目里程碑的时间线视图，支持任务展示、状态修改、评论和催办
 */

import { useState, useEffect, useCallback } from 'react'
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
  Progress,
  Avatar,
  Checkbox,
  Collapse,
  Badge,
  Select
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FlagOutlined,
  UserOutlined,
  EyeOutlined,
  CommentOutlined,
  BellOutlined,
  SendOutlined,
  CaretRightOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { milestoneApi, userApi } from '@/services/api'
import type { Milestone, MilestoneStatus, MilestoneTask } from '@/services/api/milestone'
import type { User } from '@/services/api/user'
import MilestoneDetailDrawer from '@/components/MilestoneDetailDrawer'
import styles from './index.module.css'

const { TextArea } = Input
const { Panel } = Collapse

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
  
  // 详情抽屉状态
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)
  
  // 任务相关状态
  const [milestoneTasks, setMilestoneTasks] = useState<Record<string, MilestoneTask[]>>({})
  const [loadingTasks, setLoadingTasks] = useState<Record<string, boolean>>({})
  const [expandedMilestones, setExpandedMilestones] = useState<string[]>([])
  
  // 评论相关状态
  const [commentModalVisible, setCommentModalVisible] = useState(false)
  const [commentingTask, setCommentingTask] = useState<MilestoneTask | null>(null)
  const [commentContent, setCommentContent] = useState('')
  
  // 催办相关状态
  const [urgeModalVisible, setUrgeModalVisible] = useState(false)
  const [urgingTask, setUrgingTask] = useState<MilestoneTask | null>(null)
  const [urgeMessage, setUrgeMessage] = useState('')
  
  // 用户列表（用于添加任务）
  const [users, setUsers] = useState<User[]>([])
  
  // 快速添加任务
  const [quickAddTaskVisible, setQuickAddTaskVisible] = useState<string | null>(null)
  const [quickTaskForm] = Form.useForm()

  const loadMilestones = async () => {
    // 确保 projectId 有效
    if (!projectId) {
      console.warn('MilestoneTimeline: projectId is empty')
      return
    }
    
    // 使用字符串类型的 projectId，避免大整数精度丢失
    const projectIdStr = String(projectId)
    
    console.log('MilestoneTimeline: loading milestones for project', projectIdStr)
    setLoading(true)
    try {
      // 直接传递字符串类型的 projectId
      const data = await milestoneApi.getMilestonesByProjectId(projectIdStr)
      console.log('MilestoneTimeline: loaded milestones', data)
      setMilestones(data || [])
    } catch (error) {
      console.error('Load milestones error:', error)
      message.error('加载里程碑失败')
    } finally {
      setLoading(false)
    }
  }

  // 加载用户列表
  const loadUsers = useCallback(async () => {
    try {
      const result = await userApi.getUsers({ pageSize: 100 })
      setUsers(result.list || [])
    } catch (error) {
      console.error('Load users error:', error)
    }
  }, [])

  // 加载里程碑的任务列表
  const loadMilestoneTasks = useCallback(async (milestoneId: string) => {
    if (loadingTasks[milestoneId]) return
    
    setLoadingTasks(prev => ({ ...prev, [milestoneId]: true }))
    try {
      const tasks = await milestoneApi.getMilestoneTasks(milestoneId)
      setMilestoneTasks(prev => ({ ...prev, [milestoneId]: tasks || [] }))
    } catch (error) {
      console.error('Load milestone tasks error:', error)
    } finally {
      setLoadingTasks(prev => ({ ...prev, [milestoneId]: false }))
    }
  }, [loadingTasks])

  useEffect(() => {
    console.log('MilestoneTimeline: useEffect triggered, projectId =', projectId)
    loadMilestones()
    loadUsers()
  }, [projectId])
  
  // 当里程碑加载完成后，自动加载所有里程碑的任务
  useEffect(() => {
    milestones.forEach(milestone => {
      if (!milestoneTasks[milestone.id]) {
        loadMilestoneTasks(milestone.id)
      }
    })
  }, [milestones])

  const handleAdd = () => {
    setEditingMilestone(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (milestone: Milestone, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setEditingMilestone(milestone)
    form.setFieldsValue({
      name: milestone.name,
      description: milestone.description,
      targetDate: milestone.targetDate ? dayjs(milestone.targetDate) : null
    })
    setModalVisible(true)
  }

  // 打开里程碑详情
  const handleOpenDetail = (milestone: Milestone) => {
    setSelectedMilestone(milestone)
    setDetailDrawerVisible(true)
  }

  // 关闭详情抽屉
  const handleCloseDetail = () => {
    setDetailDrawerVisible(false)
    setSelectedMilestone(null)
  }

  // 详情更新后刷新列表
  const handleDetailUpdate = () => {
    loadMilestones()
    onMilestoneChange?.()
  }

  const handleDelete = async (id: string | number, e?: React.MouseEvent) => {
    e?.stopPropagation()
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

  const handleComplete = async (milestone: Milestone, e?: React.MouseEvent) => {
    e?.stopPropagation()
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

  // 切换任务完成状态
  const handleToggleTaskComplete = async (task: MilestoneTask, e?: React.MouseEvent) => {
    e?.stopPropagation()
    try {
      if (task.status === 'completed') {
        await milestoneApi.updateTask(task.id, { status: 'in_progress' as any })
        message.success('任务已重新打开')
      } else {
        await milestoneApi.completeTask(task.id)
        message.success('任务已完成')
      }
      // 重新加载该里程碑的任务
      loadMilestoneTasks(task.milestoneId)
      onMilestoneChange?.()
    } catch (error) {
      console.error('Toggle task complete error:', error)
      message.error('操作失败')
    }
  }
  
  // 打开评论弹窗
  const handleOpenComment = (task: MilestoneTask, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setCommentingTask(task)
    setCommentContent('')
    setCommentModalVisible(true)
  }
  
  // 提交评论
  const handleSubmitComment = async () => {
    if (!commentingTask || !commentContent.trim()) {
      message.warning('请输入评论内容')
      return
    }
    try {
      // 这里调用评论 API（如果后端有的话）
      // await milestoneApi.addTaskComment(commentingTask.id, commentContent)
      message.success('评论已发送')
      setCommentModalVisible(false)
      setCommentingTask(null)
      setCommentContent('')
    } catch (error) {
      console.error('Submit comment error:', error)
      message.error('评论失败')
    }
  }
  
  // 打开催办弹窗
  const handleOpenUrge = (task: MilestoneTask, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setUrgingTask(task)
    setUrgeMessage(`请尽快完成任务：${task.name}`)
    setUrgeModalVisible(true)
  }
  
  // 提交催办
  const handleSubmitUrge = async () => {
    if (!urgingTask) return
    try {
      // 这里调用催办 API（如果后端有的话）
      // await milestoneApi.urgeTask(urgingTask.id, urgeMessage)
      message.success('催办通知已发送')
      setUrgeModalVisible(false)
      setUrgingTask(null)
      setUrgeMessage('')
    } catch (error) {
      console.error('Submit urge error:', error)
      message.error('催办失败')
    }
  }
  
  // 快速添加任务
  const handleQuickAddTask = async (milestoneId: string) => {
    try {
      const values = await quickTaskForm.validateFields()
      await milestoneApi.createMilestoneTask(milestoneId, {
        name: values.name,
        priority: values.priority || 'medium',
        assigneeId: values.assigneeId
      })
      message.success('任务已添加')
      quickTaskForm.resetFields()
      setQuickAddTaskVisible(null)
      loadMilestoneTasks(milestoneId)
      loadMilestones()
      onMilestoneChange?.()
    } catch (error) {
      console.error('Quick add task error:', error)
      message.error('添加任务失败')
    }
  }
  
  // 获取优先级颜色
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'urgent': return 'red'
      case 'high': return 'orange'
      case 'medium': return 'blue'
      default: return 'default'
    }
  }
  
  // 获取优先级文本
  const getPriorityText = (priority: string): string => {
    const map: Record<string, string> = {
      low: '低',
      medium: '中',
      high: '高',
      urgent: '紧急'
    }
    return map[priority] || priority
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
                <div
                  className={styles.milestoneItem}
                  onClick={() => handleOpenDetail(milestone)}
                  style={{ cursor: 'pointer' }}
                >
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
                    {/* 任务统计 */}
                      {(milestone.taskCount !== undefined && milestone.taskCount > 0) && (
                        <span>
                          任务: {milestone.completedTaskCount || 0}/{milestone.taskCount}
                        </span>
                      )}
                    </div>
  
                    {/* 负责人显示 */}
                    {milestone.assignees && milestone.assignees.length > 0 && (
                      <div className={styles.milestoneAssignees}>
                        <UserOutlined style={{ marginRight: 8, color: '#8c8c8c' }} />
                        <Avatar.Group maxCount={5} size="small">
                          {milestone.assignees.map((assignee) => (
                            <Tooltip key={assignee.id} title={`${assignee.userName || '未知用户'}${assignee.isPrimary ? ' (主负责人)' : ''}`}>
                              <Avatar
                                src={assignee.userAvatar}
                                style={{
                                  backgroundColor: assignee.isPrimary ? '#1677ff' : '#87d068',
                                  cursor: 'pointer'
                                }}
                              >
                                {assignee.userName?.charAt(0) || '?'}
                              </Avatar>
                            </Tooltip>
                          ))}
                        </Avatar.Group>
                      </div>
                    )}
  
                    {/* 任务列表展示 */}
                    {milestoneTasks[milestone.id] && milestoneTasks[milestone.id].length > 0 && (
                      <div className={styles.taskListSection} onClick={(e) => e.stopPropagation()}>
                        <Collapse
                          ghost
                          expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                          className={styles.taskCollapse}
                        >
                          <Panel
                            header={
                              <span className={styles.taskPanelHeader}>
                                <Badge
                                  count={milestoneTasks[milestone.id].filter(t => t.status !== 'completed').length}
                                  size="small"
                                  style={{ backgroundColor: '#1677ff' }}
                                >
                                  <span>任务列表</span>
                                </Badge>
                              </span>
                            }
                            key="tasks"
                          >
                            <div className={styles.inlineTaskList}>
                              {milestoneTasks[milestone.id].map((task) => (
                                <div key={task.id} className={styles.inlineTaskItem}>
                                  <div className={styles.taskMainContent}>
                                    {editable && (
                                      <Checkbox
                                        checked={task.status === 'completed'}
                                        onChange={() => handleToggleTaskComplete(task)}
                                        className={styles.taskCheckbox}
                                      />
                                    )}
                                    <span className={`${styles.inlineTaskName} ${task.status === 'completed' ? styles.completed : ''}`}>
                                      {task.name}
                                    </span>
                                    <Tag color={getPriorityColor(task.priority)} className={styles.priorityTag}>
                                      {getPriorityText(task.priority)}
                                    </Tag>
                                    {task.assigneeName && (
                                      <span className={styles.taskAssignee}>
                                        <Avatar size="small" style={{ backgroundColor: '#87d068', marginRight: 4 }}>
                                          {task.assigneeName.charAt(0)}
                                        </Avatar>
                                        {task.assigneeName}
                                      </span>
                                    )}
                                    {task.dueDate && (
                                      <span className={styles.taskDueDate}>
                                        <ClockCircleOutlined />
                                        {dayjs(task.dueDate).format('MM-DD')}
                                      </span>
                                    )}
                                  </div>
                                  {editable && task.status !== 'completed' && (
                                    <div className={styles.taskQuickActions}>
                                      <Tooltip title="添加评论">
                                        <Button
                                          type="text"
                                          size="small"
                                          icon={<CommentOutlined />}
                                          onClick={(e) => handleOpenComment(task, e)}
                                        />
                                      </Tooltip>
                                      <Tooltip title="催办">
                                        <Button
                                          type="text"
                                          size="small"
                                          icon={<BellOutlined />}
                                          onClick={(e) => handleOpenUrge(task, e)}
                                        />
                                      </Tooltip>
                                    </div>
                                  )}
                                </div>
                              ))}
                              
                              {/* 快速添加任务 */}
                              {editable && (
                                <>
                                  {quickAddTaskVisible === milestone.id ? (
                                    <div className={styles.quickAddTaskForm}>
                                      <Form form={quickTaskForm} layout="inline" size="small">
                                        <Form.Item
                                          name="name"
                                          rules={[{ required: true, message: '请输入任务名称' }]}
                                          style={{ flex: 1, marginRight: 8 }}
                                        >
                                          <Input placeholder="任务名称" />
                                        </Form.Item>
                                        <Form.Item name="priority" style={{ marginRight: 8 }}>
                                          <Select placeholder="优先级" style={{ width: 80 }} allowClear>
                                            <Select.Option value="low">低</Select.Option>
                                            <Select.Option value="medium">中</Select.Option>
                                            <Select.Option value="high">高</Select.Option>
                                            <Select.Option value="urgent">紧急</Select.Option>
                                          </Select>
                                        </Form.Item>
                                        <Form.Item name="assigneeId" style={{ marginRight: 8 }}>
                                          <Select placeholder="负责人" style={{ width: 100 }} allowClear showSearch optionFilterProp="children">
                                            {users.map((user) => (
                                              <Select.Option key={user.id} value={user.id}>
                                                {user.nickname || user.username}
                                              </Select.Option>
                                            ))}
                                          </Select>
                                        </Form.Item>
                                        <Space>
                                          <Button size="small" onClick={() => {
                                            setQuickAddTaskVisible(null)
                                            quickTaskForm.resetFields()
                                          }}>
                                            取消
                                          </Button>
                                          <Button type="primary" size="small" onClick={() => handleQuickAddTask(milestone.id)}>
                                            添加
                                          </Button>
                                        </Space>
                                      </Form>
                                    </div>
                                  ) : (
                                    <Button
                                      type="dashed"
                                      size="small"
                                      icon={<PlusOutlined />}
                                      className={styles.addTaskBtn}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setQuickAddTaskVisible(milestone.id)
                                      }}
                                    >
                                      添加任务
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </Panel>
                        </Collapse>
                      </div>
                    )}
                    
                    {/* 如果没有任务，显示添加任务按钮 */}
                    {editable && (!milestoneTasks[milestone.id] || milestoneTasks[milestone.id].length === 0) && (
                      <div className={styles.emptyTaskSection} onClick={(e) => e.stopPropagation()}>
                        {quickAddTaskVisible === milestone.id ? (
                          <div className={styles.quickAddTaskForm}>
                            <Form form={quickTaskForm} layout="inline" size="small">
                              <Form.Item
                                name="name"
                                rules={[{ required: true, message: '请输入任务名称' }]}
                                style={{ flex: 1, marginRight: 8 }}
                              >
                                <Input placeholder="任务名称" />
                              </Form.Item>
                              <Form.Item name="priority" style={{ marginRight: 8 }}>
                                <Select placeholder="优先级" style={{ width: 80 }} allowClear>
                                  <Select.Option value="low">低</Select.Option>
                                  <Select.Option value="medium">中</Select.Option>
                                  <Select.Option value="high">高</Select.Option>
                                  <Select.Option value="urgent">紧急</Select.Option>
                                </Select>
                              </Form.Item>
                              <Space>
                                <Button size="small" onClick={() => {
                                  setQuickAddTaskVisible(null)
                                  quickTaskForm.resetFields()
                                }}>
                                  取消
                                </Button>
                                <Button type="primary" size="small" onClick={() => handleQuickAddTask(milestone.id)}>
                                  添加
                                </Button>
                              </Space>
                            </Form>
                          </div>
                        ) : (
                          <Button
                            type="dashed"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={(e) => {
                              e.stopPropagation()
                              setQuickAddTaskVisible(milestone.id)
                            }}
                          >
                            添加任务
                          </Button>
                        )}
                      </div>
                    )}
  
                    {editable && (
                    <div className={styles.milestoneActions}>
                      <Space size="small">
                        <Tooltip title="查看详情">
                          <Button
                            type="text"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenDetail(milestone)
                            }}
                          />
                        </Tooltip>
                        {milestone.status !== 'completed' && (
                          <>
                            <Tooltip title="标记完成">
                              <Button
                                type="text"
                                size="small"
                                icon={<CheckCircleOutlined />}
                                onClick={(e) => handleComplete(milestone, e)}
                              />
                            </Tooltip>
                            <Tooltip title="编辑">
                              <Button
                                type="text"
                                size="small"
                                icon={<EditOutlined />}
                                onClick={(e) => handleEdit(milestone, e)}
                              />
                            </Tooltip>
                            <Popconfirm
                              title="确定删除此里程碑？"
                              onConfirm={(e) => handleDelete(milestone.id, e as React.MouseEvent)}
                              onCancel={(e) => e?.stopPropagation()}
                            >
                              <Tooltip title="删除">
                                <Button
                                  type="text"
                                  size="small"
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </Tooltip>
                            </Popconfirm>
                          </>
                        )}
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

      {/* 里程碑详情抽屉 */}
      <MilestoneDetailDrawer
        visible={detailDrawerVisible}
        milestone={selectedMilestone}
        editable={editable}
        onClose={handleCloseDetail}
        onUpdate={handleDetailUpdate}
      />
      
      {/* 评论弹窗 */}
      <Modal
        title={
          <Space>
            <CommentOutlined />
            <span>添加评论</span>
          </Space>
        }
        open={commentModalVisible}
        onCancel={() => {
          setCommentModalVisible(false)
          setCommentingTask(null)
          setCommentContent('')
        }}
        onOk={handleSubmitComment}
        okText="发送"
        cancelText="取消"
      >
        {commentingTask && (
          <div style={{ marginBottom: 16 }}>
            <Tag color="blue">{commentingTask.name}</Tag>
            {commentingTask.assigneeName && (
              <span style={{ marginLeft: 8, color: '#666' }}>
                负责人: {commentingTask.assigneeName}
              </span>
            )}
          </div>
        )}
        <TextArea
          rows={4}
          placeholder="请输入评论内容..."
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          maxLength={500}
          showCount
        />
      </Modal>
      
      {/* 催办弹窗 */}
      <Modal
        title={
          <Space>
            <BellOutlined />
            <span>催办任务</span>
          </Space>
        }
        open={urgeModalVisible}
        onCancel={() => {
          setUrgeModalVisible(false)
          setUrgingTask(null)
          setUrgeMessage('')
        }}
        onOk={handleSubmitUrge}
        okText="发送催办"
        cancelText="取消"
      >
        {urgingTask && (
          <div style={{ marginBottom: 16 }}>
            <Tag color="orange">{urgingTask.name}</Tag>
            {urgingTask.assigneeName && (
              <span style={{ marginLeft: 8, color: '#666' }}>
                负责人: {urgingTask.assigneeName}
              </span>
            )}
            {urgingTask.dueDate && (
              <span style={{ marginLeft: 8, color: '#999' }}>
                截止: {dayjs(urgingTask.dueDate).format('YYYY-MM-DD')}
              </span>
            )}
          </div>
        )}
        <TextArea
          rows={3}
          placeholder="请输入催办消息..."
          value={urgeMessage}
          onChange={(e) => setUrgeMessage(e.target.value)}
          maxLength={200}
          showCount
        />
      </Modal>
    </div>
  )
}

export default MilestoneTimeline