import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Button,
  Tag,
  Progress,
  Avatar,
  Tabs,
  Table,
  Space,
  Spin,
  message,
  Dropdown,
  Modal
} from 'antd'
import {
  SettingOutlined,
  StarOutlined,
  StarFilled,
  MoreOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
  BugOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import * as projectApi from '@/services/api/project'
import * as issueApi from '@/services/api/issue'
import * as sprintApi from '@/services/api/sprint'
import { getUsers } from '@/services/api/user'
import { getRecentActivities } from '@/services/api/activity'
import styles from './index.module.css'

interface Project {
  id: number
  name: string
  key: string
  description: string
  status: string
  ownerId: number
  memberCount: number
  issueCount: number
  color: string
  starred: number  // 0 or 1
  progress: number
  createdAt: string
  updatedAt: string
}

interface Issue {
  id: number
  key: string
  title: string
  type: string
  status: string
  priority: string
  assignee: number | null
}

interface Sprint {
  id: number
  name: string
  status: string
  startDate: string
  endDate: string
  totalPoints: number
  completedPoints: number
}

/**
 * 项目详情页面
 */
const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<Project | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [starred, setStarred] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])

  useEffect(() => {
    if (id) {
      loadProjectData(parseInt(id))
    }
  }, [id])

  const loadProjectData = async (projectId: number) => {
    setLoading(true)
    try {
      const [projectRes, issuesRes, sprintsRes, usersRes, activitiesRes] = await Promise.all([
        projectApi.getProjectById(projectId),
        issueApi.getIssues({ projectId }),
        sprintApi.getSprints({ projectId }),
        getUsers().catch(() => ({ list: [] })),
        getRecentActivities(5).catch(() => [])
      ])
      setProject(projectRes as any)
      setStarred((projectRes as any).starred === 1)
      setIssues((issuesRes as any).list || [])
      setSprints(sprintsRes as any || [])
      setUsers((usersRes as any).list || [])
      setActivities(activitiesRes as any || [])
    } catch (error) {
      console.error('Failed to load project:', error)
      message.error('加载项目失败')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStar = async () => {
    try {
      await projectApi.toggleProjectStar(parseInt(id!))
      setStarred(!starred)
      message.success(starred ? '已取消收藏' : '已收藏')
    } catch {
      message.error('操作失败')
    }
  }

  const handleDeleteProject = () => {
    Modal.confirm({
      title: '确认删除',
      content: '删除项目后，所有相关数据将被清除，此操作不可恢复。',
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await projectApi.deleteProject(parseInt(id!))
          message.success('项目已删除')
          navigate('/projects')
        } catch {
          message.error('删除失败')
        }
      }
    })
  }

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      active: { color: 'green', text: '进行中' },
      completed: { color: 'blue', text: '已完成' },
      archived: { color: 'default', text: '已归档' }
    }
    const s = statusMap[status] || { color: 'default', text: status }
    return <Tag color={s.color}>{s.text}</Tag>
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

  const getPriorityTag = (priority: string) => {
    const config: Record<string, { color: string; text: string }> = {
      high: { color: 'red', text: '高' },
      medium: { color: 'orange', text: '中' },
      low: { color: 'green', text: '低' }
    }
    return <Tag color={config[priority]?.color}>{config[priority]?.text}</Tag>
  }

  const getSprintStatusTag = (status: string) => {
    const config: Record<string, { color: string; text: string }> = {
      active: { color: 'processing', text: '进行中' },
      planning: { color: 'default', text: '规划中' },
      completed: { color: 'success', text: '已完成' }
    }
    return <Tag color={config[status]?.color}>{config[status]?.text}</Tag>
  }

  // 统计数据
  const stats = {
    totalIssues: issues.length,
    openIssues: issues.filter(i => i.status === 'open').length,
    inProgressIssues: issues.filter(i => i.status === 'in_progress').length,
    doneIssues: issues.filter(i => i.status === 'done').length
  }

  // 事项表格列
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
      render: (key: string, record: Issue) => <a onClick={() => navigate(`/issues/${record.id}`)}>{key}</a>
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
      render: (status: string) => {
        const config: Record<string, { color: string; text: string }> = {
          open: { color: 'default', text: '待处理' },
          in_progress: { color: 'processing', text: '进行中' },
          testing: { color: 'warning', text: '测试中' },
          done: { color: 'success', text: '已完成' }
        }
        return <Tag color={config[status]?.color}>{config[status]?.text}</Tag>
      }
    },
    {
      title: '负责人',
      dataIndex: 'assignee',
      key: 'assignee',
      width: 100,
      render: (assigneeId: number | null) => {
        if (!assigneeId) return '-'
        const user = users.find(u => u.id === assigneeId)
        return user ? (
          <Space>
            <Avatar size="small" src={user.avatar}>{user.name?.charAt(0)}</Avatar>
            {user.name}
          </Space>
        ) : '-'
      }
    }
  ]

  // 团队成员
  const teamMembers = users.slice(0, 5)

  // 最近活动
  const recentActivities = activities.slice(0, 5).map((a: any) => ({
    ...a,
    user: users.find(u => u.id === a.userId)
  }))

  if (loading) {
    return (
      <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <h2>项目不存在</h2>
          <Button type="primary" onClick={() => navigate('/projects')}>返回项目列表</Button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* 项目头部 */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/projects')}
            style={{ marginRight: 8 }}
          />
          <div 
            className={styles.projectAvatar}
            style={{ backgroundColor: project.color }}
          >
            {project.name.charAt(0)}
          </div>
          <div className={styles.projectInfo}>
            <div className={styles.projectTitle}>
              <h1 className={styles.projectName}>{project.name}</h1>
              <span className={styles.projectKey}>{project.key}</span>
              {getStatusTag(project.status)}
            </div>
            <p className={styles.projectDesc}>{project.description || '暂无描述'}</p>
            <div className={styles.projectMeta}>
              <span><UserOutlined /> {project.memberCount} 成员</span>
              <span><CalendarOutlined /> 创建于 {project.createdAt}</span>
            </div>
          </div>
        </div>
        <Space>
          <Button
            type="text"
            icon={starred ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
            onClick={handleToggleStar}
          />
          <Button icon={<SettingOutlined />} onClick={() => navigate('/settings')}>
            设置
          </Button>
          <Dropdown
            menu={{
              items: [
                { key: 'archive', label: '归档项目' },
                { type: 'divider' },
                { key: 'delete', label: '删除项目', danger: true, onClick: handleDeleteProject }
              ]
            }}
          >
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      </div>

      {/* 统计卡片 */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.totalIssues}</div>
          <div className={styles.statLabel}>总事项</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#faad14' }}>{stats.openIssues}</div>
          <div className={styles.statLabel}>待处理</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#1677ff' }}>{stats.inProgressIssues}</div>
          <div className={styles.statLabel}>进行中</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#52c41a' }}>{stats.doneIssues}</div>
          <div className={styles.statLabel}>已完成</div>
        </div>
      </div>

      {/* 主内容区 */}
      <Tabs
        defaultActiveKey="overview"
        className={styles.tabs}
        items={[
          {
            key: 'overview',
            label: '概览',
            children: (
              <div className={styles.contentGrid}>
                <div className={styles.mainContent}>
                  {/* 进度 */}
                  <div className={styles.card}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.cardTitle}>项目进度</h3>
                    </div>
                    <div className={styles.progressSection}>
                      <div className={styles.progressLabel}>
                        <span>整体进度</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress percent={project.progress} showInfo={false} strokeColor="#1677ff" />
                    </div>
                  </div>

                  {/* 迭代 */}
                  <div className={styles.card}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.cardTitle}>当前迭代</h3>
                      <Button type="link" size="small" onClick={() => navigate('/iterations')}>查看全部</Button>
                    </div>
                    {sprints.filter(s => s.status === 'active').map(sprint => (
                      <div key={sprint.id} className={styles.sprintCard}>
                        <div className={styles.sprintHeader}>
                          <span className={styles.sprintName}>{sprint.name}</span>
                          {getSprintStatusTag(sprint.status)}
                        </div>
                        <div className={styles.sprintDates}>
                          {sprint.startDate} ~ {sprint.endDate}
                        </div>
                        <Progress 
                          percent={sprint.totalPoints > 0 ? Math.round(sprint.completedPoints / sprint.totalPoints * 100) : 0} 
                          size="small"
                          format={() => `${sprint.completedPoints}/${sprint.totalPoints} 点`}
                        />
                      </div>
                    ))}
                    {sprints.filter(s => s.status === 'active').length === 0 && (
                      <div style={{ textAlign: 'center', padding: '24px', color: '#999' }}>
                        暂无进行中的迭代
                      </div>
                    )}
                  </div>

                  {/* 最近事项 */}
                  <div className={styles.card}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.cardTitle}>最近事项</h3>
                      <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => navigate('/issues')}>
                        新建事项
                      </Button>
                    </div>
                    {issues.slice(0, 5).map(issue => (
                      <div key={issue.id} className={styles.issueItem}>
                        {getIssueTypeIcon(issue.type)}
                        <span className={styles.issueKey}>{issue.key}</span>
                        <span className={styles.issueTitle}>{issue.title}</span>
                        {getPriorityTag(issue.priority)}
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.sideContent}>
                  {/* 团队成员 */}
                  <div className={styles.card}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.cardTitle}>团队成员</h3>
                      <Button type="link" size="small" onClick={() => navigate('/members')}>管理</Button>
                    </div>
                    {teamMembers.map(member => (
                      <div key={member.id} className={styles.memberItem}>
                        <Avatar src={member.avatar}>{member.name.charAt(0)}</Avatar>
                        <div className={styles.memberInfo}>
                          <div className={styles.memberName}>{member.name}</div>
                          <div className={styles.memberRole}>{member.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 最近活动 */}
                  <div className={styles.card}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.cardTitle}>最近活动</h3>
                    </div>
                    {recentActivities.map(activity => (
                      <div key={activity.id} className={styles.activityItem}>
                        <Avatar size="small" src={activity.user?.avatar}>
                          {activity.user?.name.charAt(0)}
                        </Avatar>
                        <div className={styles.activityContent}>
                          <div className={styles.activityText}>
                            <strong>{activity.user?.name}</strong> {activity.action} {activity.target}
                          </div>
                          <div className={styles.activityTime}>{activity.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          },
          {
            key: 'issues',
            label: '事项',
            children: (
              <div style={{ padding: '16px' }}>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                  <Space>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/issues')}>
                      新建事项
                    </Button>
                  </Space>
                  <Button onClick={() => navigate('/kanban')}>看板视图</Button>
                </div>
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
              </div>
            )
          },
          {
            key: 'iterations',
            label: '迭代',
            children: (
              <div style={{ padding: '16px' }}>
                <div style={{ marginBottom: 16 }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/iterations')}>
                    新建迭代
                  </Button>
                </div>
                {sprints.map(sprint => (
                  <div key={sprint.id} className={styles.sprintCard} style={{ marginBottom: 16 }}>
                    <div className={styles.sprintHeader}>
                      <span className={styles.sprintName}>{sprint.name}</span>
                      {getSprintStatusTag(sprint.status)}
                    </div>
                    <div className={styles.sprintDates}>
                      {sprint.startDate} ~ {sprint.endDate}
                    </div>
                    <Progress 
                      percent={sprint.totalPoints > 0 ? Math.round(sprint.completedPoints / sprint.totalPoints * 100) : 0} 
                      size="small"
                      format={() => `${sprint.completedPoints}/${sprint.totalPoints} 故事点`}
                    />
                  </div>
                ))}
              </div>
            )
          },
          {
            key: 'wiki',
            label: '文档',
            children: (
              <div style={{ padding: '16px', textAlign: 'center' }}>
                <Button type="primary" onClick={() => navigate('/wiki')}>
                  进入知识库
                </Button>
              </div>
            )
          }
        ]}
      />
    </div>
  )
}

export default ProjectDetail