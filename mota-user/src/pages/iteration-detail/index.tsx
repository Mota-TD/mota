import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Button,
  Tag,
  Progress,
  Avatar,
  Space,
  Spin,
  message,
  Card,
  Table,
  Statistic,
  Row,
  Col,
  Dropdown,
  Modal
} from 'antd'
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  PlusOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BugOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { sprintApi, issueApi, projectApi } from '@/services/mock/api'
import { mockUsers } from '@/services/mock/data'
import styles from './index.module.css'

interface Sprint {
  id: number
  name: string
  projectId: number
  status: string
  startDate: string
  endDate: string
  goal: string
  totalPoints: number
  completedPoints: number
}

interface Issue {
  id: number
  key: string
  title: string
  type: string
  status: string
  priority: string
  assignee: number | null
  storyPoints: number
}

/**
 * 迭代详情页面
 */
const IterationDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [sprint, setSprint] = useState<Sprint | null>(null)
  const [project, setProject] = useState<any>(null)
  const [issues, setIssues] = useState<Issue[]>([])

  useEffect(() => {
    if (id) {
      loadSprintData(parseInt(id))
    }
  }, [id])

  const loadSprintData = async (sprintId: number) => {
    setLoading(true)
    try {
      const sprintRes = await sprintApi.getSprintById(sprintId)
      setSprint(sprintRes.data)
      
      if (sprintRes.data.projectId) {
        const [projectRes, issuesRes] = await Promise.all([
          projectApi.getProjectById(sprintRes.data.projectId),
          issueApi.getIssues({ sprintId })
        ])
        setProject(projectRes.data)
        setIssues(issuesRes.data.list || [])
      }
    } catch (error) {
      console.error('Failed to load sprint:', error)
      message.error('加载迭代失败')
    } finally {
      setLoading(false)
    }
  }

  const handleStartSprint = async () => {
    if (!sprint) return
    try {
      message.success('迭代已开始')
      setSprint({ ...sprint, status: 'active' })
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleCompleteSprint = async () => {
    if (!sprint) return
    Modal.confirm({
      title: '完成迭代',
      content: '确定要完成这个迭代吗？未完成的事项将移回需求池。',
      okText: '确认完成',
      cancelText: '取消',
      onOk: async () => {
        try {
          message.success('迭代已完成')
          setSprint({ ...sprint, status: 'completed' })
        } catch (error) {
          message.error('操作失败')
        }
      }
    })
  }

  const handleDelete = () => {
    Modal.confirm({
      title: '确认删除',
      content: '删除迭代后，相关事项将移回需求池，此操作不可恢复。',
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          message.success('迭代已删除')
          navigate('/iterations')
        } catch (error) {
          message.error('删除失败')
        }
      }
    })
  }

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      planning: { color: 'default', text: '规划中', icon: <ClockCircleOutlined /> },
      active: { color: 'processing', text: '进行中', icon: <PlayCircleOutlined /> },
      completed: { color: 'success', text: '已完成', icon: <CheckCircleOutlined /> }
    }
    const s = statusMap[status] || { color: 'default', text: status, icon: null }
    return <Tag color={s.color} icon={s.icon}>{s.text}</Tag>
  }

  const getIssueTypeIcon = (type: string) => {
    switch (type) {
      case 'bug':
        return <BugOutlined style={{ color: '#ff4d4f' }} />
      case 'story':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />
      default:
        return <ClockCircleOutlined style={{ color: '#1677ff' }} />
    }
  }

  const getIssueStatusTag = (status: string) => {
    const config: Record<string, { color: string; text: string }> = {
      open: { color: 'default', text: '待处理' },
      in_progress: { color: 'processing', text: '进行中' },
      testing: { color: 'warning', text: '测试中' },
      review: { color: 'cyan', text: '待评审' },
      done: { color: 'success', text: '已完成' }
    }
    return <Tag color={config[status]?.color}>{config[status]?.text}</Tag>
  }

  const getPriorityTag = (priority: string) => {
    const config: Record<string, { color: string; text: string }> = {
      highest: { color: 'red', text: '最高' },
      high: { color: 'orange', text: '高' },
      medium: { color: 'blue', text: '中' },
      low: { color: 'green', text: '低' },
      lowest: { color: 'default', text: '最低' }
    }
    return <Tag color={config[priority]?.color}>{config[priority]?.text}</Tag>
  }

  const getDaysRemaining = () => {
    if (!sprint) return 0
    const end = dayjs(sprint.endDate)
    const now = dayjs()
    const days = end.diff(now, 'day')
    return days > 0 ? days : 0
  }

  const getProgressPercent = () => {
    if (!sprint || sprint.totalPoints === 0) return 0
    return Math.round((sprint.completedPoints / sprint.totalPoints) * 100)
  }

  // 统计数据
  const stats = {
    totalIssues: issues.length,
    openIssues: issues.filter(i => i.status === 'open').length,
    inProgressIssues: issues.filter(i => i.status === 'in_progress').length,
    doneIssues: issues.filter(i => i.status === 'done').length,
    totalPoints: issues.reduce((sum, i) => sum + (i.storyPoints || 0), 0),
    completedPoints: issues.filter(i => i.status === 'done').reduce((sum, i) => sum + (i.storyPoints || 0), 0)
  }

  const issueColumns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 60,
      render: (type: string) => getIssueTypeIcon(type)
    },
    {
      title: '标识',
      dataIndex: 'key',
      key: 'key',
      width: 100,
      render: (key: string, record: Issue) => (
        <a onClick={() => navigate(`/issues/${record.id}`)}>{key}</a>
      )
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority: string) => getPriorityTag(priority)
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getIssueStatusTag(status)
    },
    {
      title: '故事点',
      dataIndex: 'storyPoints',
      key: 'storyPoints',
      width: 80,
      align: 'center' as const
    },
    {
      title: '负责人',
      dataIndex: 'assignee',
      key: 'assignee',
      width: 100,
      render: (assigneeId: number | null) => {
        if (!assigneeId) return '-'
        const user = mockUsers.find(u => u.id === assigneeId)
        return user ? (
          <Space>
            <Avatar size="small" src={user.avatar}>{user.name.charAt(0)}</Avatar>
            {user.name}
          </Space>
        ) : '-'
      }
    }
  ]

  if (loading) {
    return (
      <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!sprint) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <h2>迭代不存在</h2>
          <Button type="primary" onClick={() => navigate('/iterations')}>返回迭代列表</Button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* 头部 */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/iterations')}
          />
          <div className={styles.sprintInfo}>
            <div className={styles.sprintTitle}>
              <h1 className={styles.sprintName}>{sprint.name}</h1>
              {getStatusTag(sprint.status)}
            </div>
            {project && (
              <Tag 
                className={styles.projectTag}
                onClick={() => navigate(`/projects/${project.id}`)}
                style={{ cursor: 'pointer' }}
              >
                {project.name}
              </Tag>
            )}
          </div>
        </div>
        <Space>
          {sprint.status === 'planning' && (
            <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleStartSprint}>
              开始迭代
            </Button>
          )}
          {sprint.status === 'active' && (
            <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleCompleteSprint}>
              完成迭代
            </Button>
          )}
          <Button icon={<EditOutlined />}>编辑</Button>
          <Dropdown
            menu={{
              items: [
                { key: 'delete', icon: <DeleteOutlined />, label: '删除迭代', danger: true, onClick: handleDelete }
              ]
            }}
          >
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      </div>

      {/* 迭代信息 */}
      <Card className={styles.infoCard}>
        <Row gutter={24}>
          <Col span={6}>
            <div className={styles.dateInfo}>
              <CalendarOutlined />
              <div>
                <div className={styles.dateLabel}>迭代周期</div>
                <div className={styles.dateValue}>{sprint.startDate} ~ {sprint.endDate}</div>
              </div>
            </div>
          </Col>
          <Col span={6}>
            <Statistic 
              title="剩余天数" 
              value={getDaysRemaining()} 
              suffix="天"
              valueStyle={{ color: getDaysRemaining() < 3 ? '#ff4d4f' : '#1677ff' }}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="故事点进度" 
              value={stats.completedPoints} 
              suffix={`/ ${stats.totalPoints}`}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="完成率" 
              value={getProgressPercent()} 
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
        </Row>
        {sprint.goal && (
          <div className={styles.goal}>
            <strong>迭代目标：</strong>{sprint.goal}
          </div>
        )}
        <div className={styles.progressBar}>
          <Progress percent={getProgressPercent()} strokeColor="#1677ff" />
        </div>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={16} className={styles.statsRow}>
        <Col span={6}>
          <Card className={styles.statCard}>
            <Statistic title="总事项" value={stats.totalIssues} />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={styles.statCard}>
            <Statistic title="待处理" value={stats.openIssues} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={styles.statCard}>
            <Statistic title="进行中" value={stats.inProgressIssues} valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={styles.statCard}>
            <Statistic title="已完成" value={stats.doneIssues} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
      </Row>

      {/* 事项列表 */}
      <Card 
        title="迭代事项" 
        className={styles.issuesCard}
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/backlog')}>
              添加事项
            </Button>
            <Button onClick={() => navigate('/kanban')}>看板视图</Button>
          </Space>
        }
      >
        <Table
          columns={issueColumns}
          dataSource={issues}
          rowKey="id"
          pagination={{
            total: issues.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`
          }}
        />
      </Card>
    </div>
  )
}

export default IterationDetail