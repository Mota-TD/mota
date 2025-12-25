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
  message
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
  UnorderedListOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { taskApi } from '@/services/api'
import type { Task, TaskStatus } from '@/services/api/task'
import styles from './index.module.css'

const { RangePicker } = DatePicker
const { Title, Text } = Typography

/**
 * 我的任务页面
 * 展示当前用户的所有任务，支持多种视图和筛选
 */
const MyTasks = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [searchText, setSearchText] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>()
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    setLoading(true)
    try {
      const res = await taskApi.getMyTasks()
      setTasks(res.list || [])
    } catch (error) {
      console.error('Failed to load tasks:', error)
      message.error('加载任务失败，请稍后重试')
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  // 根据状态筛选任务
  const getFilteredTasks = () => {
    let filtered = [...tasks]

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
    const total = tasks.length
    const completed = tasks.filter(t => t.status === 'completed').length
    const inProgress = tasks.filter(t => t.status === 'in_progress').length
    const overdue = tasks.filter(t => 
      t.status !== 'completed' && 
      t.endDate && 
      dayjs(t.endDate).isBefore(dayjs(), 'day')
    ).length

    return { total, completed, inProgress, overdue }
  }

  const stats = getStatistics()
  const filteredTasks = getFilteredTasks()

  const getStatusIcon = (status: TaskStatus) => {
    const icons: Record<TaskStatus, React.ReactNode> = {
      pending: <ClockCircleOutlined style={{ color: '#8c8c8c' }} />,
      in_progress: <RiseOutlined style={{ color: '#1890ff' }} />,
      completed: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      paused: <PauseCircleOutlined style={{ color: '#faad14' }} />,
      cancelled: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
    }
    return icons[status]
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

  const isOverdue = (task: Task) => {
    return task.status !== 'completed' && 
           task.endDate && 
           dayjs(task.endDate).isBefore(dayjs(), 'day')
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
        <Col xs={12} sm={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="全部任务"
              value={stats.total}
              prefix={<ProjectOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="进行中"
              value={stats.inProgress}
              valueStyle={{ color: '#1890ff' }}
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="已完成"
              value={stats.completed}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
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
            { key: 'all', label: `全部 (${tasks.length})` },
            { key: 'in_progress', label: `进行中 (${tasks.filter(t => t.status === 'in_progress').length})` },
            { key: 'pending', label: `待开始 (${tasks.filter(t => t.status === 'pending').length})` },
            { key: 'completed', label: `已完成 (${tasks.filter(t => t.status === 'completed').length})` },
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
                key={task.id} 
                className={`${styles.taskCard} ${isOverdue(task) ? styles.overdueCard : ''}`}
                onClick={() => navigate(`/tasks/${task.id}`)}
              >
                <div className={styles.taskCardLeft}>
                  <div className={styles.taskStatus}>
                    {getStatusIcon(task.status)}
                  </div>
                  <div className={styles.taskContent}>
                    <div className={styles.taskHeader}>
                      <h3 className={styles.taskName}>{task.name}</h3>
                      <Space size={8}>
                        <Tooltip title={getPriorityText(task.priority)}>
                          {getPriorityIcon(task.priority)}
                        </Tooltip>
                        <Tag color={taskApi.getStatusColor(task.status)}>
                          {taskApi.getStatusText(task.status)}
                        </Tag>
                      </Space>
                    </div>
                    {task.description && (
                      <p className={styles.taskDesc}>{task.description}</p>
                    )}
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