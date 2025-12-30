import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Tag,
  Progress,
  Space,
  Spin,
  Tabs,
  Input,
  Select,
  DatePicker,
  Card,
  Statistic,
  Row,
  Col,
  Empty,
  Tooltip,
  Badge,
  Typography,
  message,
  Segmented
} from 'antd'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  CalendarOutlined,
  ProjectOutlined,
  RiseOutlined,
  FireOutlined,
  ThunderboltOutlined,
  PauseCircleOutlined,
  PlusOutlined,
  UnorderedListOutlined,
  TeamOutlined,
  UserOutlined,
  FlagOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { taskApi } from '@/services/api'
import { getMyDepartmentTasks, getStatusText as getDeptStatusText, getStatusColor as getDeptStatusColor } from '@/services/api/departmentTask'
import { getMyMilestoneTasks, getTaskStatusText as getMilestoneStatusText, getTaskStatusColor as getMilestoneStatusColor } from '@/services/api/milestone'
import type { Task, TaskStatus } from '@/services/api/task'
import type { DepartmentTask, DepartmentTaskStatus } from '@/services/api/departmentTask'
import type { MilestoneTask, TaskStatus as MilestoneTaskStatus } from '@/services/api/milestone'
import styles from './index.module.css'

const { RangePicker } = DatePicker
const { Title, Text } = Typography

/**
 * 我的任务页面
 * 展示当前用户的所有任务，支持多种视图和筛选
 */
// 统一的任务类型，用于合并显示
interface UnifiedTask {
  id: string
  name: string
  description?: string
  status: string
  priority: string
  startDate?: string
  endDate?: string
  progress: number
  type: 'task' | 'department_task' | 'milestone_task'  // 区分任务类型
  projectName?: string
  milestoneName?: string
  departmentName?: string
  milestoneId?: string
}

const MyTasks = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [departmentTasks, setDepartmentTasks] = useState<DepartmentTask[]>([])
  const [milestoneTasks, setMilestoneTasks] = useState<MilestoneTask[]>([])
  const [taskType, setTaskType] = useState<'all' | 'department' | 'execution' | 'milestone'>('all')
  const [activeTab, setActiveTab] = useState('all')
  const [searchText, setSearchText] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>()
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)

  useEffect(() => {
    loadAllTasks()
  }, [])

  const loadAllTasks = async () => {
    setLoading(true)
    try {
      // 同时加载执行任务、部门任务和里程碑任务
      const [taskRes, deptTaskRes, milestoneTaskRes] = await Promise.all([
        taskApi.getMyTasks(),
        getMyDepartmentTasks(),
        getMyMilestoneTasks()
      ])
      setTasks(taskRes.list || [])
      setDepartmentTasks(deptTaskRes.list || [])
      setMilestoneTasks(milestoneTaskRes || [])
    } catch (error) {
      console.error('Failed to load tasks:', error)
      message.error('加载任务失败，请稍后重试')
      setTasks([])
      setDepartmentTasks([])
      setMilestoneTasks([])
    } finally {
      setLoading(false)
    }
  }

  // 将部门任务转换为统一格式
  const convertDepartmentTask = (dt: DepartmentTask): UnifiedTask => ({
    id: dt.id,
    name: dt.name,
    description: dt.description,
    status: dt.status,
    priority: dt.priority,
    startDate: dt.startDate,
    endDate: dt.endDate,
    progress: dt.progress,
    type: 'department_task',
    projectName: dt.projectName,
    milestoneName: dt.milestoneName,
    departmentName: dt.departmentName
  })

  // 将执行任务转换为统一格式
  const convertTask = (t: Task): UnifiedTask => ({
    id: t.id,
    name: t.name,
    description: t.description,
    status: t.status,
    priority: t.priority,
    startDate: t.startDate,
    endDate: t.endDate,
    progress: t.progress,
    type: 'task',
    projectName: t.projectName
  })

  // 将里程碑任务转换为统一格式
  const convertMilestoneTask = (mt: MilestoneTask): UnifiedTask => ({
    id: mt.id,
    name: mt.name,
    description: mt.description,
    status: mt.status,
    priority: mt.priority,
    startDate: mt.startDate,
    endDate: mt.dueDate,
    progress: mt.progress,
    type: 'milestone_task',
    milestoneId: mt.milestoneId,
    milestoneName: mt.milestoneName
  })

  // 获取统一的任务列表
  const getUnifiedTasks = (): UnifiedTask[] => {
    let unified: UnifiedTask[] = []
    
    if (taskType === 'all' || taskType === 'department') {
      unified = [...unified, ...departmentTasks.map(convertDepartmentTask)]
    }
    if (taskType === 'all' || taskType === 'execution') {
      unified = [...unified, ...tasks.map(convertTask)]
    }
    if (taskType === 'all' || taskType === 'milestone') {
      unified = [...unified, ...milestoneTasks.map(convertMilestoneTask)]
    }
    
    return unified
  }

  // 根据状态筛选任务
  const getFilteredTasks = (): UnifiedTask[] => {
    let filtered = getUnifiedTasks()

    // 按状态筛选
    if (activeTab !== 'all') {
      if (activeTab === 'overdue') {
        filtered = filtered.filter(t =>
          t.status !== 'completed' &&
          t.endDate &&
          dayjs(t.endDate).isBefore(dayjs(), 'day')
        )
      } else {
        filtered = filtered.filter(t => t.status === activeTab)
      }
    }

    // 按搜索文本筛选
    if (searchText) {
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(searchText.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchText.toLowerCase())
      )
    }

    // 按优先级筛选
    if (priorityFilter) {
      filtered = filtered.filter(t => t.priority === priorityFilter)
    }

    // 按日期范围筛选
    if (dateRange) {
      filtered = filtered.filter(t => {
        const taskStart = dayjs(t.startDate)
        const taskEnd = dayjs(t.endDate)
        return taskStart.isAfter(dateRange[0]) && taskEnd.isBefore(dateRange[1])
      })
    }

    return filtered
  }

  // 统计数据
  const getStatistics = () => {
    const allTasks = getUnifiedTasks()
    const total = allTasks.length
    const completed = allTasks.filter(t => t.status === 'completed').length
    const inProgress = allTasks.filter(t => t.status === 'in_progress').length
    const overdue = allTasks.filter(t =>
      t.status !== 'completed' &&
      t.endDate &&
      dayjs(t.endDate).isBefore(dayjs(), 'day')
    ).length
    const deptTaskCount = departmentTasks.length
    const execTaskCount = tasks.length
    const milestoneTaskCount = milestoneTasks.length

    return { total, completed, inProgress, overdue, deptTaskCount, execTaskCount, milestoneTaskCount }
  }

  const stats = getStatistics()
  const filteredTasks = getFilteredTasks()

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      pending: <ClockCircleOutlined style={{ color: '#8c8c8c' }} />,
      planning: <ClockCircleOutlined style={{ color: '#722ed1' }} />,
      in_progress: <RiseOutlined style={{ color: '#1890ff' }} />,
      completed: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      paused: <PauseCircleOutlined style={{ color: '#faad14' }} />,
      cancelled: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
    }
    return icons[status] || <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
  }

  const getPriorityIcon = (priority: string) => {
    const icons: Record<string, React.ReactNode> = {
      low: <span style={{ color: '#52c41a' }}>●</span>,
      medium: <span style={{ color: '#1890ff' }}>●</span>,
      high: <FireOutlined style={{ color: '#fa8c16' }} />,
      urgent: <ThunderboltOutlined style={{ color: '#ff4d4f' }} />
    }
    return icons[priority]
  }

  const getPriorityText = (priority: string) => {
    const texts: Record<string, string> = {
      low: '低',
      medium: '中',
      high: '高',
      urgent: '紧急'
    }
    return texts[priority]
  }

  const isOverdue = (task: UnifiedTask) => {
    return task.status !== 'completed' &&
           task.endDate &&
           dayjs(task.endDate).isBefore(dayjs(), 'day')
  }

  // 获取任务状态文本
  const getTaskStatusText = (task: UnifiedTask) => {
    if (task.type === 'department_task') {
      return getDeptStatusText(task.status as DepartmentTaskStatus)
    }
    if (task.type === 'milestone_task') {
      return getMilestoneStatusText(task.status as MilestoneTaskStatus)
    }
    return taskApi.getStatusText(task.status as TaskStatus)
  }

  // 获取任务状态颜色
  const getTaskStatusColor = (task: UnifiedTask) => {
    if (task.type === 'department_task') {
      return getDeptStatusColor(task.status as DepartmentTaskStatus)
    }
    if (task.type === 'milestone_task') {
      return getMilestoneStatusColor(task.status as MilestoneTaskStatus)
    }
    return taskApi.getStatusColor(task.status as TaskStatus)
  }

  // 处理任务点击
  const handleTaskClick = (task: UnifiedTask) => {
    if (task.type === 'department_task') {
      navigate(`/department-tasks/${task.id}`)
    } else if (task.type === 'milestone_task') {
      // 里程碑任务跳转到里程碑详情页
      navigate(`/milestones/tasks/${task.id}`)
    } else {
      navigate(`/tasks/${task.id}`)
    }
  }

  const getDaysRemaining = (endDate: string) => {
    const days = dayjs(endDate).diff(dayjs(), 'day')
    if (days < 0) return `已逾期 ${Math.abs(days)} 天`
    if (days === 0) return '今天截止'
    if (days === 1) return '明天截止'
    return `剩余 ${days} 天`
  }

  if (loading) {
    return (
      <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* 页面头部 - 紫色渐变 */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerIcon}>
            <UnorderedListOutlined />
          </div>
          <div className={styles.headerInfo}>
            <Title level={4} className={styles.headerTitle}>我的任务</Title>
            <Text type="secondary">查看和管理您负责的所有任务</Text>
          </div>
        </div>
        <Button
          icon={<PlusOutlined />}
          className={styles.createBtn}
          onClick={() => navigate('/projects')}
        >
          新建任务
        </Button>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} className={styles.statsRow}>
        <Col xs={12} sm={4}>
          <Card className={styles.statCard}>
            <Statistic
              title="全部任务"
              value={stats.total}
              prefix={<ProjectOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card className={styles.statCard}>
            <Statistic
              title="部门任务"
              value={stats.deptTaskCount}
              valueStyle={{ color: '#722ed1' }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card className={styles.statCard}>
            <Statistic
              title="执行任务"
              value={stats.execTaskCount}
              valueStyle={{ color: '#13c2c2' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card className={styles.statCard}>
            <Statistic
              title="进行中"
              value={stats.inProgress}
              valueStyle={{ color: '#1890ff' }}
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card className={styles.statCard}>
            <Statistic
              title="已完成"
              value={stats.completed}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card className={styles.statCard}>
            <Statistic
              title="已逾期"
              value={stats.overdue}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 任务类型切换 */}
      <div className={styles.taskTypeSwitch}>
        <Segmented
          value={taskType}
          onChange={(value) => setTaskType(value as 'all' | 'department' | 'execution' | 'milestone')}
          options={[
            { value: 'all', label: '全部', icon: <ProjectOutlined /> },
            { value: 'department', label: `部门任务 (${stats.deptTaskCount})`, icon: <TeamOutlined /> },
            { value: 'execution', label: `执行任务 (${stats.execTaskCount})`, icon: <UserOutlined /> },
            { value: 'milestone', label: `里程碑任务 (${stats.milestoneTaskCount})`, icon: <FlagOutlined /> }
          ]}
        />
      </div>

      {/* 筛选栏 */}
      <div className={styles.filterBar}>
        <div className={styles.filterLeft}>
          <Input
            placeholder="搜索任务..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 240 }}
            allowClear
          />
          <Select
            placeholder="优先级"
            value={priorityFilter}
            onChange={setPriorityFilter}
            style={{ width: 120 }}
            allowClear
            options={[
              { value: 'urgent', label: '紧急' },
              { value: 'high', label: '高' },
              { value: 'medium', label: '中' },
              { value: 'low', label: '低' }
            ]}
          />
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
            placeholder={['开始日期', '结束日期']}
          />
        </div>
        <Button icon={<FilterOutlined />}>
          更多筛选
        </Button>
      </div>

      {/* 任务列表 */}
      <div className={styles.taskSection}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: 'all', label: `全部 (${getUnifiedTasks().length})` },
            { key: 'in_progress', label: `进行中 (${getUnifiedTasks().filter(t => t.status === 'in_progress').length})` },
            { key: 'pending', label: `待开始 (${getUnifiedTasks().filter(t => t.status === 'pending' || t.status === 'planning').length})` },
            { key: 'completed', label: `已完成 (${getUnifiedTasks().filter(t => t.status === 'completed').length})` },
            { key: 'overdue', label: (
              <Badge count={stats.overdue} size="small" offset={[8, 0]}>
                <span>已逾期</span>
              </Badge>
            )}
          ]}
        />

        {filteredTasks.length === 0 ? (
          <Empty description="暂无任务" />
        ) : (
          <div className={styles.taskList}>
            {filteredTasks.map(task => (
              <div
                key={`${task.type}-${task.id}`}
                className={`${styles.taskCard} ${isOverdue(task) ? styles.overdueCard : ''}`}
                onClick={() => handleTaskClick(task)}
              >
                <div className={styles.taskCardLeft}>
                  <div className={styles.taskStatus}>
                    {getStatusIcon(task.status)}
                  </div>
                  <div className={styles.taskContent}>
                    <div className={styles.taskHeader}>
                      <h3 className={styles.taskName}>
                        {task.name}
                        {task.type === 'department_task' && (
                          <Tag color="purple" style={{ marginLeft: 8, fontSize: 10 }}>部门任务</Tag>
                        )}
                        {task.type === 'task' && (
                          <Tag color="cyan" style={{ marginLeft: 8, fontSize: 10 }}>执行任务</Tag>
                        )}
                        {task.type === 'milestone_task' && (
                          <Tag color="orange" style={{ marginLeft: 8, fontSize: 10 }}>里程碑任务</Tag>
                        )}
                      </h3>
                      <Space size={8}>
                        <Tooltip title={getPriorityText(task.priority)}>
                          {getPriorityIcon(task.priority)}
                        </Tooltip>
                        <Tag color={getTaskStatusColor(task)}>
                          {getTaskStatusText(task)}
                        </Tag>
                      </Space>
                    </div>
                    {task.description && (
                      <p className={styles.taskDesc}>{task.description}</p>
                    )}
                    <div className={styles.taskMeta}>
                      {task.projectName && (
                        <span className={styles.taskProject}>
                          <ProjectOutlined />
                          {task.projectName}
                        </span>
                      )}
                      {task.milestoneName && (
                        <span className={styles.taskMilestone}>
                          → {task.milestoneName}
                        </span>
                      )}
                      {task.departmentName && (
                        <span className={styles.taskDepartment}>
                          <TeamOutlined />
                          {task.departmentName}
                        </span>
                      )}
                    </div>
                    <div className={styles.taskMeta}>
                      <span className={styles.taskDate}>
                        <CalendarOutlined />
                        {task.startDate} ~ {task.endDate}
                      </span>
                      {task.endDate && (
                        <span className={`${styles.taskDeadline} ${isOverdue(task) ? styles.overdue : ''}`}>
                          {getDaysRemaining(task.endDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.taskCardRight}>
                  <div className={styles.progressWrapper}>
                    <Progress
                      type="circle"
                      percent={task.progress}
                      size={56}
                      strokeColor={isOverdue(task) ? '#ff4d4f' : undefined}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyTasks