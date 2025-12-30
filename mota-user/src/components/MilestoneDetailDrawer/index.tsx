/**
 * 里程碑详情抽屉组件
 * 支持查看和编辑里程碑详情、负责人管理、任务分解、AI智能分解
 */

import { useState, useEffect, useCallback } from 'react'
import {
  Drawer,
  Button,
  Tag,
  Space,
  Avatar,
  Tooltip,
  Progress,
  Checkbox,
  Input,
  Select,
  DatePicker,
  Form,
  Modal,
  message,
  Spin,
  Empty,
  Popconfirm,
  Divider,
  List,
  Card
} from 'antd'
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseOutlined,
  FlagOutlined,
  CalendarOutlined,
  UnorderedListOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  BulbOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { milestoneApi, userApi, aiApi } from '@/services/api'
import type { TaskDecompositionSuggestion } from '@/services/api/ai'
import type {
  Milestone,
  MilestoneAssignee,
  MilestoneTask,
  TaskStatus,
  TaskPriority
} from '@/services/api/milestone'
import type { User } from '@/services/api/user'
import styles from './index.module.css'

const { TextArea } = Input

interface MilestoneDetailDrawerProps {
  visible: boolean
  milestone: Milestone | null
  editable?: boolean
  onClose: () => void
  onUpdate?: () => void
}

const MilestoneDetailDrawer: React.FC<MilestoneDetailDrawerProps> = ({
  visible,
  milestone,
  editable = false,
  onClose,
  onUpdate
}) => {
  const [loading, setLoading] = useState(false)
  const [tasks, setTasks] = useState<MilestoneTask[]>([])
  const [assignees, setAssignees] = useState<MilestoneAssignee[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [showAddTask, setShowAddTask] = useState(false)
  const [showAssigneeSelector, setShowAssigneeSelector] = useState(false)
  const [taskForm] = Form.useForm()
  const [editingTask, setEditingTask] = useState<MilestoneTask | null>(null)
  const [taskModalVisible, setTaskModalVisible] = useState(false)
  
  // AI 智能分解相关状态
  const [aiModalVisible, setAiModalVisible] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<TaskDecompositionSuggestion[]>([])
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([])

  // 加载任务列表
  const loadTasks = useCallback(async () => {
    if (!milestone) return
    try {
      const data = await milestoneApi.getMilestoneTasks(milestone.id)
      setTasks(data || [])
    } catch (error) {
      console.error('Load tasks error:', error)
    }
  }, [milestone])

  // 加载负责人列表
  const loadAssignees = useCallback(async () => {
    if (!milestone) return
    try {
      const data = await milestoneApi.getMilestoneAssignees(milestone.id)
      setAssignees(data || [])
    } catch (error) {
      console.error('Load assignees error:', error)
    }
  }, [milestone])

  // 加载用户列表（用于选择负责人）
  const loadUsers = useCallback(async () => {
    try {
      const result = await userApi.getUsers({ pageSize: 100 })
      setUsers(result.list || [])
    } catch (error) {
      console.error('Load users error:', error)
    }
  }, [])

  // 初始化加载
  useEffect(() => {
    if (visible && milestone) {
      setLoading(true)
      Promise.all([loadTasks(), loadAssignees(), loadUsers()])
        .finally(() => setLoading(false))
    }
  }, [visible, milestone, loadTasks, loadAssignees, loadUsers])

  // 使用 milestone 中的 assignees（如果有的话）
  useEffect(() => {
    if (milestone?.assignees) {
      setAssignees(milestone.assignees)
    }
  }, [milestone])

  // 添加负责人
  const handleAddAssignee = async (userId: string) => {
    if (!milestone) return
    try {
      await milestoneApi.addMilestoneAssignee(milestone.id, userId, false)
      message.success('负责人已添加')
      loadAssignees()
      setShowAssigneeSelector(false)
      onUpdate?.()
    } catch (error) {
      console.error('Add assignee error:', error)
      message.error('添加负责人失败')
    }
  }

  // 移除负责人
  const handleRemoveAssignee = async (userId: string) => {
    if (!milestone) return
    try {
      await milestoneApi.removeMilestoneAssignee(milestone.id, userId)
      message.success('负责人已移除')
      loadAssignees()
      onUpdate?.()
    } catch (error) {
      console.error('Remove assignee error:', error)
      message.error('移除负责人失败')
    }
  }

  // 创建任务
  const handleCreateTask = async () => {
    if (!milestone) return
    try {
      const values = await taskForm.validateFields()
      const taskData = {
        name: values.name,
        description: values.description,
        priority: values.priority || 'medium',
        dueDate: values.dueDate?.format('YYYY-MM-DD'),
        assigneeId: values.assigneeId
      }
      await milestoneApi.createMilestoneTask(milestone.id, taskData)
      message.success('任务已创建')
      taskForm.resetFields()
      setShowAddTask(false)
      loadTasks()
      onUpdate?.()
    } catch (error) {
      console.error('Create task error:', error)
      message.error('创建任务失败')
    }
  }

  // 更新任务
  const handleUpdateTask = async () => {
    if (!editingTask) return
    try {
      const values = await taskForm.validateFields()
      const taskData = {
        name: values.name,
        description: values.description,
        priority: values.priority,
        dueDate: values.dueDate?.format('YYYY-MM-DD'),
        assigneeId: values.assigneeId
      }
      await milestoneApi.updateTask(editingTask.id, taskData)
      message.success('任务已更新')
      setTaskModalVisible(false)
      setEditingTask(null)
      taskForm.resetFields()
      loadTasks()
      onUpdate?.()
    } catch (error) {
      console.error('Update task error:', error)
      message.error('更新任务失败')
    }
  }

  // 完成/取消完成任务
  const handleToggleTaskComplete = async (task: MilestoneTask) => {
    try {
      if (task.status === 'completed') {
        // 取消完成，设置为进行中
        await milestoneApi.updateTask(task.id, { status: 'in_progress' as TaskStatus })
        message.success('任务已重新打开')
      } else {
        // 完成任务
        await milestoneApi.completeTask(task.id)
        message.success('任务已完成')
      }
      loadTasks()
      onUpdate?.()
    } catch (error) {
      console.error('Toggle task complete error:', error)
      message.error('操作失败')
    }
  }

  // 删除任务
  const handleDeleteTask = async (taskId: string) => {
    try {
      await milestoneApi.deleteTask(taskId)
      message.success('任务已删除')
      loadTasks()
      onUpdate?.()
    } catch (error) {
      console.error('Delete task error:', error)
      message.error('删除任务失败')
    }
  }

  // AI 智能分解任务
  const handleAIDecompose = async () => {
    if (!milestone) return
    
    setAiLoading(true)
    setAiModalVisible(true)
    setAiSuggestions([])
    setSelectedSuggestions([])
    
    try {
      const response = await aiApi.generateTaskDecomposition({
        projectName: milestone.name,
        projectDescription: milestone.description || `里程碑：${milestone.name}，目标日期：${milestone.targetDate}`,
        departments: [],
        startDate: dayjs().format('YYYY-MM-DD'),
        endDate: milestone.targetDate
      })
      
      setAiSuggestions(response.suggestions || [])
      // 默认全选
      setSelectedSuggestions(response.suggestions?.map(s => s.id) || [])
    } catch (error) {
      console.error('AI decompose error:', error)
      message.error('AI分解失败，请稍后重试')
    } finally {
      setAiLoading(false)
    }
  }

  // 应用AI建议的任务
  const handleApplyAISuggestions = async () => {
    if (!milestone || selectedSuggestions.length === 0) {
      message.warning('请至少选择一个任务')
      return
    }
    
    const tasksToCreate = aiSuggestions.filter(s => selectedSuggestions.includes(s.id))
    
    try {
      setAiLoading(true)
      
      for (const suggestion of tasksToCreate) {
        await milestoneApi.createMilestoneTask(milestone.id, {
          name: suggestion.name,
          description: suggestion.description,
          priority: suggestion.suggestedPriority as TaskPriority || 'medium',
          dueDate: milestone.targetDate
        })
      }
      
      message.success(`成功创建 ${tasksToCreate.length} 个任务`)
      setAiModalVisible(false)
      loadTasks()
      onUpdate?.()
    } catch (error) {
      console.error('Apply AI suggestions error:', error)
      message.error('创建任务失败')
    } finally {
      setAiLoading(false)
    }
  }

  // 切换选择AI建议
  const toggleSuggestionSelection = (id: string) => {
    setSelectedSuggestions(prev =>
      prev.includes(id)
        ? prev.filter(s => s !== id)
        : [...prev, id]
    )
  }

  // 全选/取消全选AI建议
  const toggleSelectAll = () => {
    if (selectedSuggestions.length === aiSuggestions.length) {
      setSelectedSuggestions([])
    } else {
      setSelectedSuggestions(aiSuggestions.map(s => s.id))
    }
  }

  // 打开编辑任务弹窗
  const openEditTaskModal = (task: MilestoneTask) => {
    setEditingTask(task)
    taskForm.setFieldsValue({
      name: task.name,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate ? dayjs(task.dueDate) : null,
      assigneeId: task.assigneeId
    })
    setTaskModalVisible(true)
  }

  // 获取状态颜色
  const getStatusColor = (status: string): 'green' | 'red' | 'blue' | 'default' => {
    switch (status) {
      case 'completed':
        return 'green'
      case 'delayed':
        return 'red'
      default:
        return 'blue'
    }
  }

  // 获取优先级颜色
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'urgent':
        return 'red'
      case 'high':
        return 'orange'
      case 'medium':
        return 'blue'
      default:
        return 'default'
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

  // 获取可选的用户（排除已添加的负责人）
  const getAvailableUsers = () => {
    const assigneeUserIds = assignees.map(a => a.userId)
    return users.filter(u => !assigneeUserIds.includes(u.id))
  }

  // 计算任务完成进度
  const completedTaskCount = tasks.filter(t => t.status === 'completed').length
  const taskProgress = tasks.length > 0 ? Math.round((completedTaskCount / tasks.length) * 100) : 0

  if (!milestone) return null

  return (
    <Drawer
      title={
        <Space>
          <FlagOutlined />
          <span>里程碑详情</span>
        </Space>
      }
      placement="right"
      width={560}
      open={visible}
      onClose={onClose}
      className={styles.drawerContent}
    >
      <Spin spinning={loading}>
        {/* 基本信息 */}
        <div className={styles.header}>
          <div className={styles.title}>{milestone.name}</div>
          {milestone.description && (
            <p className={styles.description}>{milestone.description}</p>
          )}
          <div className={styles.metaInfo}>
            <span className={styles.metaItem}>
              <CalendarOutlined />
              目标日期: {dayjs(milestone.targetDate).format('YYYY-MM-DD')}
            </span>
            <Tag color={getStatusColor(milestone.status)}>
              {milestoneApi.getStatusText(milestone.status)}
            </Tag>
            {milestone.completedAt && (
              <span className={styles.metaItem}>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                完成于: {dayjs(milestone.completedAt).format('YYYY-MM-DD')}
              </span>
            )}
          </div>
        </div>

        <Divider />

        {/* 负责人区域 */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>
              <UserOutlined />
              负责人 ({assignees.length})
            </span>
            {editable && (
              <Button
                type="link"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => setShowAssigneeSelector(!showAssigneeSelector)}
              >
                添加
              </Button>
            )}
          </div>

          {assignees.length > 0 ? (
            <div className={styles.assigneeList}>
              {assignees.map((assignee) => (
                <div
                  key={assignee.id}
                  className={`${styles.assigneeItem} ${assignee.isPrimary ? styles.primary : ''}`}
                >
                  <Avatar
                    size="small"
                    src={assignee.userAvatar}
                    style={{ backgroundColor: assignee.isPrimary ? '#1677ff' : '#87d068' }}
                  >
                    {assignee.userName?.charAt(0) || '?'}
                  </Avatar>
                  <span className={styles.assigneeName}>{assignee.userName || '未知用户'}</span>
                  {assignee.isPrimary && (
                    <span className={styles.primaryBadge}>主负责人</span>
                  )}
                  {editable && (
                    <Popconfirm
                      title="确定移除此负责人？"
                      onConfirm={() => handleRemoveAssignee(assignee.userId)}
                    >
                      <CloseOutlined className={styles.removeBtn} />
                    </Popconfirm>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <UserOutlined />
              <p>暂无负责人</p>
            </div>
          )}

          {/* 负责人选择器 */}
          {showAssigneeSelector && (
            <div className={styles.assigneeSelector}>
              <Select
                style={{ width: '100%' }}
                placeholder="选择要添加的负责人"
                showSearch
                optionFilterProp="children"
                onChange={handleAddAssignee}
                value={undefined}
              >
                {getAvailableUsers().map((user) => (
                  <Select.Option key={user.id} value={user.id}>
                    <Space>
                      <Avatar size="small" src={user.avatar}>
                        {user.nickname?.charAt(0) || user.username?.charAt(0)}
                      </Avatar>
                      {user.nickname || user.username}
                    </Space>
                  </Select.Option>
                ))}
              </Select>
            </div>
          )}
        </div>

        <Divider />

        {/* 任务分解区域 */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>
              <UnorderedListOutlined />
              任务分解 ({tasks.length})
              {tasks.length > 0 && (
                <Progress
                  percent={taskProgress}
                  size="small"
                  style={{ width: 80, marginLeft: 8 }}
                  format={() => `${completedTaskCount}/${tasks.length}`}
                />
              )}
            </span>
            <Space>
              {editable && (
                <Button
                  type="link"
                  size="small"
                  icon={<RobotOutlined />}
                  onClick={handleAIDecompose}
                  style={{ color: '#722ed1' }}
                >
                  AI智能分解
                </Button>
              )}
              {editable && (
                <Button
                  type="link"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => setShowAddTask(!showAddTask)}
                >
                  添加任务
                </Button>
              )}
            </Space>
          </div>

          {/* 任务列表 */}
          <div className={styles.taskList}>
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <div key={task.id} className={styles.taskItem}>
                  {editable && (
                    <Checkbox
                      className={styles.taskCheckbox}
                      checked={task.status === 'completed'}
                      onChange={() => handleToggleTaskComplete(task)}
                    />
                  )}
                  <div className={styles.taskContent}>
                    <div className={styles.taskHeader}>
                      <span
                        className={`${styles.taskName} ${task.status === 'completed' ? styles.completed : ''}`}
                      >
                        {task.name}
                      </span>
                      <Tag color={getPriorityColor(task.priority)}>
                        {getPriorityText(task.priority)}
                      </Tag>
                    </div>
                    <div className={styles.taskMeta}>
                      {task.assigneeName && (
                        <span>
                          <UserOutlined />
                          {task.assigneeName}
                        </span>
                      )}
                      {task.dueDate && (
                        <span>
                          <ClockCircleOutlined />
                          {dayjs(task.dueDate).format('MM-DD')}
                        </span>
                      )}
                      {task.progress !== undefined && task.progress > 0 && (
                        <span>进度: {task.progress}%</span>
                      )}
                    </div>
                    {task.progress !== undefined && task.progress > 0 && task.status !== 'completed' && (
                      <Progress
                        percent={task.progress}
                        size="small"
                        className={styles.taskProgress}
                      />
                    )}
                  </div>
                  {editable && (
                    <div className={styles.taskActions}>
                      <Tooltip title="编辑">
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => openEditTaskModal(task)}
                        />
                      </Tooltip>
                      <Popconfirm
                        title="确定删除此任务？"
                        onConfirm={() => handleDeleteTask(task.id)}
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
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <UnorderedListOutlined />
                <p>暂无任务</p>
              </div>
            )}
          </div>

          {/* 添加任务表单 */}
          {showAddTask && (
            <div className={styles.addTaskForm}>
              <Form form={taskForm} layout="vertical" size="small">
                <Form.Item
                  name="name"
                  rules={[{ required: true, message: '请输入任务名称' }]}
                >
                  <Input placeholder="任务名称" />
                </Form.Item>
                <Form.Item name="description">
                  <TextArea rows={2} placeholder="任务描述（可选）" />
                </Form.Item>
                <Space style={{ width: '100%' }} wrap>
                  <Form.Item name="priority" style={{ marginBottom: 0 }}>
                    <Select placeholder="优先级" style={{ width: 100 }}>
                      <Select.Option value="low">低</Select.Option>
                      <Select.Option value="medium">中</Select.Option>
                      <Select.Option value="high">高</Select.Option>
                      <Select.Option value="urgent">紧急</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name="dueDate" style={{ marginBottom: 0 }}>
                    <DatePicker placeholder="截止日期" />
                  </Form.Item>
                  <Form.Item name="assigneeId" style={{ marginBottom: 0 }}>
                    <Select
                      placeholder="负责人"
                      style={{ width: 120 }}
                      allowClear
                      showSearch
                      optionFilterProp="children"
                    >
                      {users.map((user) => (
                        <Select.Option key={user.id} value={user.id}>
                          {user.nickname || user.username}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Space>
                <div className={styles.addTaskActions}>
                  <Button size="small" onClick={() => {
                    setShowAddTask(false)
                    taskForm.resetFields()
                  }}>
                    取消
                  </Button>
                  <Button type="primary" size="small" onClick={handleCreateTask}>
                    添加
                  </Button>
                </div>
              </Form>
            </div>
          )}
        </div>
      </Spin>

      {/* 编辑任务弹窗 */}
      <Modal
        title="编辑任务"
        open={taskModalVisible}
        onCancel={() => {
          setTaskModalVisible(false)
          setEditingTask(null)
          taskForm.resetFields()
        }}
        onOk={handleUpdateTask}
      >
        <Form form={taskForm} layout="vertical">
          <Form.Item
            name="name"
            label="任务名称"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="请输入任务名称" />
          </Form.Item>
          <Form.Item name="description" label="任务描述">
            <TextArea rows={3} placeholder="请输入任务描述" />
          </Form.Item>
          <Form.Item name="priority" label="优先级">
            <Select placeholder="选择优先级">
              <Select.Option value="low">低</Select.Option>
              <Select.Option value="medium">中</Select.Option>
              <Select.Option value="high">高</Select.Option>
              <Select.Option value="urgent">紧急</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="dueDate" label="截止日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="assigneeId" label="负责人">
            <Select
              placeholder="选择负责人"
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {users.map((user) => (
                <Select.Option key={user.id} value={user.id}>
                  <Space>
                    <Avatar size="small" src={user.avatar}>
                      {user.nickname?.charAt(0) || user.username?.charAt(0)}
                    </Avatar>
                    {user.nickname || user.username}
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* AI 智能分解弹窗 */}
      <Modal
        title={
          <Space>
            <RobotOutlined style={{ color: '#722ed1' }} />
            <span>AI 智能分解任务</span>
          </Space>
        }
        open={aiModalVisible}
        onCancel={() => setAiModalVisible(false)}
        width={700}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              {aiSuggestions.length > 0 && (
                <Checkbox
                  checked={selectedSuggestions.length === aiSuggestions.length}
                  indeterminate={selectedSuggestions.length > 0 && selectedSuggestions.length < aiSuggestions.length}
                  onChange={toggleSelectAll}
                >
                  全选 ({selectedSuggestions.length}/{aiSuggestions.length})
                </Checkbox>
              )}
            </div>
            <Space>
              <Button onClick={() => setAiModalVisible(false)}>取消</Button>
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                loading={aiLoading}
                disabled={selectedSuggestions.length === 0}
                onClick={handleApplyAISuggestions}
              >
                应用选中的任务 ({selectedSuggestions.length})
              </Button>
            </Space>
          </div>
        }
      >
        <Spin spinning={aiLoading}>
          {aiSuggestions.length > 0 ? (
            <div className={styles.aiSuggestionList}>
              <div className={styles.aiTip}>
                <BulbOutlined style={{ color: '#faad14', marginRight: 8 }} />
                AI 根据里程碑「{milestone?.name}」智能生成了以下任务建议，请选择需要创建的任务：
              </div>
              <List
                dataSource={aiSuggestions}
                renderItem={(item) => (
                  <Card
                    size="small"
                    className={`${styles.aiSuggestionCard} ${selectedSuggestions.includes(item.id) ? styles.selected : ''}`}
                    onClick={() => toggleSuggestionSelection(item.id)}
                    style={{ marginBottom: 8, cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <Checkbox
                        checked={selectedSuggestions.includes(item.id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleSuggestionSelection(item.id)}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 500 }}>{item.name}</span>
                          <Tag color={getPriorityColor(item.suggestedPriority)}>
                            {getPriorityText(item.suggestedPriority)}
                          </Tag>
                          {item.estimatedDays && (
                            <Tag color="blue">预计 {item.estimatedDays} 天</Tag>
                          )}
                        </div>
                        {item.description && (
                          <div style={{ fontSize: 13, color: '#666' }}>{item.description}</div>
                        )}
                        {item.suggestedDepartment && (
                          <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                            建议部门：{item.suggestedDepartment}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )}
              />
            </div>
          ) : !aiLoading ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无AI建议，请稍后重试"
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <RobotOutlined style={{ fontSize: 48, color: '#722ed1', marginBottom: 16 }} />
              <div style={{ color: '#666' }}>AI 正在分析里程碑内容，智能生成任务建议...</div>
            </div>
          )}
        </Spin>
      </Modal>
    </Drawer>
  )
}

export default MilestoneDetailDrawer