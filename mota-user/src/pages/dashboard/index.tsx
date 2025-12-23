import { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, List, Avatar, Tag, Progress, Typography, Spin, Button, Input, Space, Tooltip, message } from 'antd'
import {
  ProjectOutlined,
  BugOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  RiseOutlined,
  FileTextOutlined,
  CalendarOutlined,
  PlusCircleOutlined,
  FolderAddOutlined,
  SyncOutlined,
  FileAddOutlined,
  UserAddOutlined,
  RobotOutlined,
  BulbOutlined,
  FilePptOutlined,
  BookOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
  SendOutlined,
  ArrowRightOutlined,
  FireOutlined,
  TrophyOutlined,
  StarOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import * as projectApi from '@/services/api/project'
import * as issueApi from '@/services/api/issue'
import * as activityApi from '@/services/api/activity'
import * as metricsApi from '@/services/api/metrics'
import styles from './index.module.css'

const { Title, Text, Paragraph } = Typography

/**
 * 仪表盘页面 - 工作台
 */
const Dashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [aiInput, setAiInput] = useState('')
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalIssues: 0,
    completedIssues: 0,
    inProgressIssues: 0,
    aiSolutions: 12,
    pptGenerated: 8
  })
  const [recentProjects, setRecentProjects] = useState<any[]>([])
  const [myIssues, setMyIssues] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [metrics, setMetrics] = useState<any>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // 加载项目列表
      const projectsRes = await projectApi.getProjects()
      const projects = projectsRes.list || []
      setRecentProjects(projects.slice(0, 4))
      
      // 加载我的事项
      const issuesRes = await issueApi.getIssues()
      const issues = issuesRes.list || []
      setMyIssues(issues.slice(0, 5))
      
      // 计算统计数据
      setStats({
        totalProjects: projects.length,
        totalIssues: issues.length,
        completedIssues: issues.filter((i: any) => i.status === 'done').length,
        inProgressIssues: issues.filter((i: any) => i.status === 'in_progress').length,
        aiSolutions: 12,
        pptGenerated: 8
      })
      
      // 加载活动记录
      const activitiesRes = await activityApi.getRecentActivities(6)
      setActivities(activitiesRes || [])
      
      // 加载效能指标
      const metricsData = await metricsApi.getMetrics()
      setMetrics(metricsData)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      message.error('加载数据失败，请检查后端服务是否启动')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'blue',
      in_progress: 'orange',
      done: 'green',
      closed: 'default'
    }
    return colors[status] || 'default'
  }

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      open: '待处理',
      in_progress: '进行中',
      done: '已完成',
      closed: '已关闭'
    }
    return texts[status] || status
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      highest: '#ff4d4f',
      high: '#fa8c16',
      medium: '#1677ff',
      low: '#52c41a',
      lowest: '#8c8c8c'
    }
    return colors[priority] || '#8c8c8c'
  }

  const getActivityIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      issue_created: <BugOutlined />,
      issue_updated: <BugOutlined />,
      issue_completed: <CheckCircleOutlined />,
      comment_added: <FileTextOutlined />,
      member_joined: <TeamOutlined />
    }
    return icons[type] || <FileTextOutlined />
  }

  const handleAiSubmit = () => {
    if (aiInput.trim()) {
      navigate('/ai/solution', { state: { query: aiInput } })
    }
  }

  // AI 快捷功能
  const aiFeatures = [
    {
      icon: <BulbOutlined />,
      title: '方案生成',
      desc: '智能生成项目方案',
      path: '/ai/solution',
      color: '#2b7de9'
    },
    {
      icon: <FilePptOutlined />,
      title: 'PPT生成',
      desc: '一键生成演示文稿',
      path: '/ai/ppt',
      color: '#667eea'
    },
    {
      icon: <BookOutlined />,
      title: '知识库',
      desc: '智能知识管理',
      path: '/ai/training',
      color: '#10b981'
    },
    {
      icon: <GlobalOutlined />,
      title: '新闻追踪',
      desc: '行业动态追踪',
      path: '/ai/news',
      color: '#f59e0b'
    }
  ]

  // 快捷操作
  const quickActions = [
    { icon: <PlusCircleOutlined />, label: '创建任务', path: '/issues', color: 'blue' },
    { icon: <FolderAddOutlined />, label: '新建项目', path: '/projects', color: 'green' },
    { icon: <SyncOutlined />, label: '新建迭代', path: '/iterations', color: 'orange' },
    { icon: <FileAddOutlined />, label: '新建文档', path: '/wiki', color: 'pink' },
    { icon: <UserAddOutlined />, label: '邀请成员', path: '/members', color: 'teal' }
  ]

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>
      {/* 欢迎区域 */}
      <div className={styles.welcomeSection}>
        <div className={styles.welcomeContent}>
          <div className={styles.welcomeText}>
            <Title level={3} className={styles.welcomeTitle}>
              早上好，欢迎回来 👋
            </Title>
            <Text type="secondary" className={styles.welcomeDesc}>
              今天有 {stats.inProgressIssues} 个任务进行中，{stats.completedIssues} 个任务已完成
            </Text>
          </div>
          <div className={styles.welcomeStats}>
            <div className={styles.welcomeStat}>
              <FireOutlined className={styles.welcomeStatIcon} />
              <div>
                <div className={styles.welcomeStatValue}>{stats.aiSolutions}</div>
                <div className={styles.welcomeStatLabel}>AI方案</div>
              </div>
            </div>
            <div className={styles.welcomeStat}>
              <TrophyOutlined className={styles.welcomeStatIcon} />
              <div>
                <div className={styles.welcomeStatValue}>{stats.completedIssues}</div>
                <div className={styles.welcomeStatLabel}>已完成</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI 助手区域 */}
      <Card className={styles.aiCard}>
        <div className={styles.aiHeader}>
          <div className={styles.aiIcon}>
            <RobotOutlined />
          </div>
          <div className={styles.aiInfo}>
            <Title level={5} className={styles.aiTitle}>AI 智能助手</Title>
            <Text type="secondary">描述您的需求，AI 将为您生成专业方案</Text>
          </div>
        </div>
        <div className={styles.aiInputWrapper}>
          <Input.TextArea
            placeholder="例如：帮我制定一个电商平台的技术架构方案..."
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            autoSize={{ minRows: 2, maxRows: 4 }}
            className={styles.aiInput}
          />
          <Button 
            type="primary" 
            icon={<SendOutlined />}
            onClick={handleAiSubmit}
            className={styles.aiSubmitBtn}
          >
            生成方案
          </Button>
        </div>
        <div className={styles.aiFeatures}>
          {aiFeatures.map((feature, index) => (
            <div 
              key={index}
              className={styles.aiFeatureItem}
              onClick={() => navigate(feature.path)}
            >
              <div 
                className={styles.aiFeatureIcon}
                style={{ backgroundColor: `${feature.color}15`, color: feature.color }}
              >
                {feature.icon}
              </div>
              <div className={styles.aiFeatureInfo}>
                <span className={styles.aiFeatureTitle}>{feature.title}</span>
                <span className={styles.aiFeatureDesc}>{feature.desc}</span>
              </div>
              <ArrowRightOutlined className={styles.aiFeatureArrow} />
            </div>
          ))}
        </div>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={12} sm={6}>
          <Card className={styles.statCard} onClick={() => navigate('/projects')}>
            <div className={`${styles.statIcon} ${styles.blue}`}>
              <ProjectOutlined />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.totalProjects}</div>
              <div className={styles.statLabel}>项目总数</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className={styles.statCard} onClick={() => navigate('/issues')}>
            <div className={`${styles.statIcon} ${styles.purple}`}>
              <BugOutlined />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.totalIssues}</div>
              <div className={styles.statLabel}>事项总数</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className={styles.statCard} onClick={() => navigate('/issues?status=in_progress')}>
            <div className={`${styles.statIcon} ${styles.orange}`}>
              <ClockCircleOutlined />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.inProgressIssues}</div>
              <div className={styles.statLabel}>进行中</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className={styles.statCard} onClick={() => navigate('/issues?status=done')}>
            <div className={`${styles.statIcon} ${styles.green}`}>
              <CheckCircleOutlined />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.completedIssues}</div>
              <div className={styles.statLabel}>已完成</div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 我的任务 */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className={styles.cardTitle}>
                <BugOutlined className={styles.cardTitleIcon} />
                <span>我的任务</span>
              </div>
            }
            extra={<a onClick={() => navigate('/issues')}>查看全部 <ArrowRightOutlined /></a>}
            className={styles.listCard}
          >
            <List
              dataSource={myIssues}
              renderItem={(item: any) => (
                <List.Item
                  className={styles.issueItem}
                  onClick={() => navigate(`/issues/${item.id}`)}
                >
                  <div className={styles.issueContent}>
                    <div className={styles.issueHeader}>
                      <span
                        className={styles.priorityDot}
                        style={{ backgroundColor: getPriorityColor(item.priority) }}
                      />
                      <Text strong className={styles.issueTitle}>{item.title}</Text>
                    </div>
                    <div className={styles.issueMeta}>
                      <Tag color={getStatusColor(item.status)}>{getStatusText(item.status)}</Tag>
                      <Text type="secondary" style={{ fontSize: 12 }}>{item.key}</Text>
                    </div>
                  </div>
                </List.Item>
              )}
              locale={{ emptyText: '暂无任务' }}
            />
          </Card>
        </Col>

        {/* 最近项目 */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className={styles.cardTitle}>
                <ProjectOutlined className={styles.cardTitleIcon} />
                <span>最近项目</span>
              </div>
            }
            extra={<a onClick={() => navigate('/projects')}>查看全部 <ArrowRightOutlined /></a>}
            className={styles.listCard}
          >
            <List
              dataSource={recentProjects}
              renderItem={(item: any) => (
                <List.Item
                  className={styles.projectItem}
                  onClick={() => navigate(`/projects/${item.id}`)}
                >
                  <div className={styles.projectContent}>
                    <div
                      className={styles.projectAvatar}
                      style={{ backgroundColor: item.color || '#2b7de9' }}
                    >
                      {item.name.charAt(0)}
                    </div>
                    <div className={styles.projectInfo}>
                      <span className={styles.projectName}>{item.name}</span>
                      <span className={styles.projectDesc}>
                        {item.description || '暂无描述'}
                      </span>
                    </div>
                    <div className={styles.projectProgress}>
                      <Progress
                        percent={item.progress || 0}
                        size="small"
                        strokeColor="#2b7de9"
                        showInfo={true}
                      />
                    </div>
                  </div>
                </List.Item>
              )}
              locale={{ emptyText: '暂无项目' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* 动态 */}
        <Col xs={24} lg={16}>
          <Card 
            title={
              <div className={styles.cardTitle}>
                <CalendarOutlined className={styles.cardTitleIcon} />
                <span>最近动态</span>
              </div>
            }
            className={styles.activityCard}
          >
            <List
              dataSource={activities}
              renderItem={(item: any) => (
                <List.Item className={styles.activityItem}>
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ backgroundColor: '#2b7de9' }}>
                        {getActivityIcon(item.type)}
                      </Avatar>
                    }
                    title={
                      <span>
                        <Text strong>{item.user?.name || '用户'}</Text>
                        <Text type="secondary"> {item.action}</Text>
                      </span>
                    }
                    description={
                      <div className={styles.activityMeta}>
                        <Text type="secondary">{item.target}</Text>
                        <Text type="secondary" className={styles.activityTime}>
                          <CalendarOutlined /> {item.time}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: '暂无动态' }}
            />
          </Card>
        </Col>

        {/* 效能概览 */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <div className={styles.cardTitle}>
                <RiseOutlined className={styles.cardTitleIcon} />
                <span>效能概览</span>
              </div>
            }
            className={styles.metricsCard}
          >
            {metrics && (
              <div className={styles.metricsContent}>
                <div className={styles.metricItem}>
                  <div className={styles.metricIcon}>
                    <ThunderboltOutlined />
                  </div>
                  <div className={styles.metricInfo}>
                    <div className={styles.metricLabel}>部署频率</div>
                    <div className={styles.metricValue}>
                      {metrics.dora?.deploymentFrequency?.value || 0} 
                      <span className={styles.metricUnit}>{metrics.dora?.deploymentFrequency?.unit || '次/周'}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.metricItem}>
                  <div className={styles.metricIcon}>
                    <ClockCircleOutlined />
                  </div>
                  <div className={styles.metricInfo}>
                    <div className={styles.metricLabel}>变更前置时间</div>
                    <div className={styles.metricValue}>
                      {metrics.dora?.leadTime?.value || 0}
                      <span className={styles.metricUnit}>{metrics.dora?.leadTime?.unit || '天'}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.metricItem}>
                  <div className={styles.metricIcon}>
                    <BugOutlined />
                  </div>
                  <div className={styles.metricInfo}>
                    <div className={styles.metricLabel}>变更失败率</div>
                    <div className={styles.metricValue}>
                      {metrics.dora?.changeFailureRate?.value || 0}
                      <span className={styles.metricUnit}>{metrics.dora?.changeFailureRate?.unit || '%'}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.metricItem}>
                  <div className={styles.metricIcon}>
                    <SyncOutlined />
                  </div>
                  <div className={styles.metricInfo}>
                    <div className={styles.metricLabel}>平均恢复时间</div>
                    <div className={styles.metricValue}>
                      {metrics.dora?.mttr?.value || 0}
                      <span className={styles.metricUnit}>{metrics.dora?.mttr?.unit || '小时'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 快捷入口 */}
      <Card 
        title={
          <div className={styles.cardTitle}>
            <StarOutlined className={styles.cardTitleIcon} />
            <span>快捷入口</span>
          </div>
        }
        className={styles.quickActionsCard}
      >
        <div className={styles.quickActions}>
          {quickActions.map((action, index) => (
            <div 
              key={index}
              className={styles.quickAction} 
              onClick={() => navigate(action.path)}
            >
              <div className={`${styles.quickActionIcon} ${styles[action.color]}`}>
                {action.icon}
              </div>
              <span className={styles.quickActionLabel}>{action.label}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default Dashboard