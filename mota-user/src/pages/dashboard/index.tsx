import { useEffect, useState, useMemo } from 'react'
import { Card, Row, Col, List, Avatar, Tag, Progress, Typography, Spin, Button, Input, Tabs } from 'antd'
import {
  ProjectOutlined,
  UnorderedListOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  FileTextOutlined,
  CalendarOutlined,
  RobotOutlined,
  BulbOutlined,
  FilePptOutlined,
  BookOutlined,
  GlobalOutlined,
  SendOutlined,
  ArrowRightOutlined,
  FireOutlined,
  TrophyOutlined,
  LineChartOutlined,
  ReadOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import * as projectApi from '@/services/api/project'
import * as taskApi from '@/services/api/task'
import * as milestoneApi from '@/services/api/milestone'
import * as activityApi from '@/services/api/activity'
import * as aiApi from '@/services/api/ai'
import { useAuthStore } from '@/store/auth'
import NewsFeed from '@/components/NewsFeed'
import BurndownChart from '@/components/BurndownChart'
import dayjs from 'dayjs'
import styles from './index.module.css'

const { Title, Text } = Typography

// 问候语库 - 根据时间段分类
const greetingMessages = {
  morning: [
    { greeting: '早上好', quote: '新的一天，新的开始，愿你满怀希望！' },
    { greeting: '早安', quote: '每一个清晨都是一份礼物，好好珍惜今天。' },
    { greeting: '早上好', quote: '阳光正好，微风不燥，愿你今天收获满满。' },
    { greeting: '早安', quote: '美好的一天从现在开始，加油！' },
    { greeting: '早上好', quote: '今天也要元气满满地开始工作哦！' },
    { greeting: '早安', quote: '愿你的努力都不被辜负，梦想都能实现。' },
    { greeting: '早上好', quote: '新的一天，愿所有美好如期而至。' },
    { greeting: '早安', quote: '保持热爱，奔赴山海，今天继续加油！' },
    // 新增早晨问候语
    { greeting: '早上好', quote: '晨起有粥温，日常有陪伴，愿你晨起温暖，日日安然。' },
    { greeting: '早安', quote: '轻轻道一声早安，愿你卸下疲惫，带着温柔开启新一天。' },
    { greeting: '早上好', quote: '晨光为你铺路，清风为你祝福，今天只管大步向前～' },
    { greeting: '早安', quote: '哪怕生活偶尔有小烦恼，清晨的阳光也会帮你扫掉呀。' },
    { greeting: '早上好', quote: '记得吃早餐哦，好好吃饭，好好生活，就是最棒的日常。' },
  ],
  afternoon: [
    { greeting: '下午好', quote: '午后时光，别忘了给自己一杯咖啡的休息。' },
    { greeting: '下午好', quote: '坚持就是胜利，下午继续保持专注！' },
    { greeting: '下午好', quote: '阳光温暖，愿你的心情也如此明媚。' },
    { greeting: '下午好', quote: '工作之余，记得起身活动一下哦。' },
    { greeting: '下午好', quote: '每一份努力都在为未来铺路，继续加油！' },
    { greeting: '下午好', quote: '保持节奏，稳步前进，你做得很好！' },
    { greeting: '下午好', quote: '困了就休息一下，效率比时长更重要。' },
    { greeting: '下午好', quote: '相信自己，你比想象中更优秀！' },
    // 新增下午问候语
    { greeting: '下午好', quote: '午后的阳光慢慢晃，愿你的烦恼慢慢散，轻松过下午～' },
    { greeting: '下午好', quote: '忙了半天啦，喝口水歇一歇，你已经很棒了。' },
    { greeting: '下午好', quote: '不必事事追求完美，尽力就好，下午也要温柔待自己。' },
    { greeting: '下午好', quote: '风遇山止，船到岸停，你的努力，自有归处。' },
    { greeting: '下午好', quote: '把烦恼暂时放下，哪怕只是十分钟，享受此刻的温柔呀。' },
  ],
  evening: [
    { greeting: '傍晚好', quote: '夕阳西下，今天的工作即将收尾，辛苦了！' },
    { greeting: '傍晚好', quote: '忙碌了一天，记得给自己一个微笑。' },
    { greeting: '傍晚好', quote: '日落时分，愿你带着满满的收获回家。' },
    { greeting: '傍晚好', quote: '今天的努力，是明天的底气。' },
    { greeting: '傍晚好', quote: '工作告一段落，生活同样精彩。' },
    { greeting: '傍晚好', quote: '感谢今天努力的自己，明天继续加油！' },
    // 新增傍晚问候语
    { greeting: '傍晚好', quote: '落日余晖温柔，晚风轻拂肩头，愿你卸下疲惫，拥抱轻松。' },
    { greeting: '傍晚好', quote: '傍晚的风会吹散一天的疲惫，回家的路要走得慢悠悠～' },
    { greeting: '傍晚好', quote: '不管今天过得怎么样，日落都在告诉你：该歇歇啦。' },
    { greeting: '傍晚好', quote: '愿晚餐有暖胃的汤，身边有暖心的人，傍晚安～' },
    { greeting: '傍晚好', quote: '把今天的不开心都留给落日，明天又是崭新的呀。' },
  ],
  night: [
    { greeting: '晚上好', quote: '夜深了，注意休息，明天又是元气满满的一天。' },
    { greeting: '晚上好', quote: '星光不负赶路人，你的努力终将闪耀。' },
    { greeting: '晚上好', quote: '今天辛苦了，好好休息，晚安！' },
    { greeting: '晚上好', quote: '夜晚是思考的好时光，也别忘了照顾自己。' },
    { greeting: '晚上好', quote: '愿你今夜好梦，明日好运。' },
    { greeting: '晚上好', quote: '加班的你最棒，但也要注意身体哦！' },
    { greeting: '晚上好', quote: '月光温柔，愿你的梦想也如此美好。' },
    { greeting: '深夜好', quote: '夜猫子也要注意休息，身体是革命的本钱！' },
    // 新增夜晚问候语
    { greeting: '晚上好', quote: '夜色温柔，别再想白天的忙碌啦，好好和自己相处吧。' },
    { greeting: '晚上好', quote: '关掉烦恼，打开轻松，愿今夜的梦都是甜的～' },
    { greeting: '深夜好', quote: '如果还没睡，记得泡杯热饮，别让深夜的凉冲淡你的温柔。' },
    { greeting: '晚上好', quote: '今天所有的奔波，都是为了明天更好的生活，晚安啦。' },
    { greeting: '深夜好', quote: '哪怕熬夜赶路，也要记得抬头看看星星，它们都在为你亮着。' },
    { greeting: '晚上好', quote: '卸下所有防备，好好睡一觉，醒来又是元气满满的你。' },
  ],
};

// 获取当前时间段
const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 20) return 'evening'
  return 'night'
}

// 获取随机问候语
const getRandomGreeting = () => {
  const timeOfDay = getTimeOfDay()
  const messages = greetingMessages[timeOfDay]
  const randomIndex = Math.floor(Math.random() * messages.length)
  return messages[randomIndex]
}

/**
 * 仪表盘页面 - 工作台
 */
const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [aiInput, setAiInput] = useState('')
  const [activeOverviewTab, setActiveOverviewTab] = useState('tasks')
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    aiSolutions: 0,
    pptGenerated: 0
  })
  const [recentProjects, setRecentProjects] = useState<any[]>([])
  const [myTasks, setMyTasks] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [news, setNews] = useState<any[]>([])

  // 使用 useMemo 确保每次页面加载时随机选择一条问候语，但在组件生命周期内保持不变
  const greetingData = useMemo(() => getRandomGreeting(), [])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    
    let projects: any[] = []
    let tasks: any[] = []
    
    // 加载项目列表
    try {
      const projectsRes = await projectApi.getProjects()
      projects = projectsRes.list || []
      setRecentProjects(projects.slice(0, 4))
    } catch (e) {
      console.warn('Failed to load projects:', e)
    }
    
    // 加载我的任务（包括执行任务和里程碑任务）
    try {
      // 同时加载执行任务和里程碑任务
      const [tasksRes, milestoneTasksRes] = await Promise.all([
        taskApi.getMyTasks().catch(() => ({ list: [] })),
        milestoneApi.getMyMilestoneTasks().catch(() => [])
      ])
      
      const executionTasks = tasksRes.list || []
      const milestoneTasks = milestoneTasksRes || []
      
      // 将里程碑任务转换为统一格式
      const convertedMilestoneTasks = milestoneTasks.map((mt: any) => ({
        id: mt.id,
        title: mt.name,
        taskNo: `MT-${mt.id}`,
        status: mt.status,
        priority: mt.priority,
        type: 'milestone_task',
        milestoneName: mt.milestoneName
      }))
      
      // 将执行任务转换为统一格式
      const convertedExecutionTasks = executionTasks.map((t: any) => ({
        id: t.id,
        title: t.name,
        taskNo: t.taskNo || `T-${t.id}`,
        status: t.status,
        priority: t.priority,
        type: 'task',
        projectName: t.projectName
      }))
      
      // 合并所有任务
      tasks = [...convertedExecutionTasks, ...convertedMilestoneTasks]
      setMyTasks(tasks.slice(0, 5))
    } catch (e) {
      console.warn('Failed to load tasks:', e)
      tasks = []
      setMyTasks([])
    }
    
    // 计算统计数据
    setStats({
      totalProjects: projects.length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t: any) => t.status === 'completed').length,
      inProgressTasks: tasks.filter((t: any) => t.status === 'in_progress').length,
      aiSolutions: 0,
      pptGenerated: 0
    })
    
    // 加载活动记录
    try {
      const activitiesRes = await activityApi.getRecentActivities(6)
      setActivities(activitiesRes || [])
    } catch (e) {
      console.warn('Failed to load activities:', e)
    }
    
    // 加载新闻
    try {
      const newsRes = await aiApi.getNews({ pageSize: 5 })
      // 处理后端返回的数据格式
      const processedNews = (newsRes.list || []).map((item: any) => ({
        ...item,
        // tags 可能是 JSON 字符串，需要解析
        tags: typeof item.tags === 'string' ? JSON.parse(item.tags || '[]') : (item.tags || []),
        // isStarred 可能是数字，需要转换为布尔值
        isStarred: typeof item.isStarred === 'number' ? item.isStarred === 1 : Boolean(item.isStarred)
      }))
      setNews(processedNews)
    } catch (e) {
      console.warn('Failed to load news:', e)
    }
    
    setLoading(false)
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
      task_created: <UnorderedListOutlined />,
      task_updated: <UnorderedListOutlined />,
      task_completed: <CheckCircleOutlined />,
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
      color: '#002FA7'
    },
    {
      icon: <FilePptOutlined />,
      title: 'PPT生成',
      desc: '一键生成演示文稿',
      path: '/ai/ppt',
      color: '#0052cc'
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
            <div className={styles.welcomeTitleRow}>
              <Title level={3} className={styles.welcomeTitle}>
                {greetingData.greeting}，欢迎回来 👋
              </Title>
              <Text className={styles.welcomeQuote}>
                💡 {greetingData.quote}
              </Text>
            </div>
            <Text type="secondary" className={styles.welcomeDesc}>
              今天有 {stats.inProgressTasks} 个任务进行中，{stats.completedTasks} 个任务已完成
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
                <div className={styles.welcomeStatValue}>{stats.completedTasks}</div>
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
          <Card className={styles.statCard} onClick={() => navigate('/my-tasks')}>
            <div className={`${styles.statIcon} ${styles.purple}`}>
              <UnorderedListOutlined />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.totalTasks}</div>
              <div className={styles.statLabel}>任务总数</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className={styles.statCard} onClick={() => navigate('/my-tasks?status=in_progress')}>
            <div className={`${styles.statIcon} ${styles.orange}`}>
              <ClockCircleOutlined />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.inProgressTasks}</div>
              <div className={styles.statLabel}>进行中</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className={styles.statCard} onClick={() => navigate('/my-tasks?status=completed')}>
            <div className={`${styles.statIcon} ${styles.green}`}>
              <CheckCircleOutlined />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.completedTasks}</div>
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
                <UnorderedListOutlined className={styles.cardTitleIcon} />
                <span>我的任务</span>
              </div>
            }
            extra={<a onClick={() => navigate('/my-tasks')}>查看全部 <ArrowRightOutlined /></a>}
            className={styles.listCard}
          >
            <List
              dataSource={myTasks}
              renderItem={(item: any) => (
                <List.Item
                  className={styles.issueItem}
                  onClick={() => navigate(`/tasks/${item.id}`)}
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
                      <Text type="secondary" style={{ fontSize: 12 }}>{item.taskNo}</Text>
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
                        strokeColor="#002FA7"
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

      {/* 数据概览标签页 */}
      <Card className={styles.overviewCard} style={{ marginTop: 16 }}>
        <Tabs
          activeKey={activeOverviewTab}
          onChange={setActiveOverviewTab}
          items={[
            {
              key: 'tasks',
              label: (
                <span>
                  <UnorderedListOutlined /> 任务动态
                </span>
              ),
              children: (
                <Row gutter={[16, 16]}>
                  {/* 新闻追踪 */}
                  <Col xs={24} lg={12}>
                    <Card
                      title={
                        <div className={styles.cardTitle}>
                          <GlobalOutlined className={styles.cardTitleIcon} />
                          <span>新闻追踪</span>
                        </div>
                      }
                      extra={<a onClick={() => navigate('/ai/news')}>更多 <ArrowRightOutlined /></a>}
                      className={styles.newsCard}
                    >
                      <List
                        dataSource={news}
                        renderItem={(item: any) => (
                          <List.Item className={styles.newsItem}>
                            <div className={styles.newsContent}>
                              <div className={styles.newsTitle}>{item.title}</div>
                              <div className={styles.newsMeta}>
                                <Tag color="blue">{item.category}</Tag>
                                <Text type="secondary" style={{ fontSize: 12 }}>{item.source} · {item.publishTime}</Text>
                              </div>
                            </div>
                          </List.Item>
                        )}
                        locale={{ emptyText: '暂无新闻' }}
                      />
                    </Card>
                  </Col>

                  {/* 动态 */}
                  <Col xs={24} lg={12}>
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
                                <Avatar style={{ backgroundColor: '#002FA7' }}>
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
                </Row>
              )
            },
            {
              key: 'burndown',
              label: (
                <span>
                  <LineChartOutlined /> 燃尽图
                </span>
              ),
              children: (
                <div style={{ padding: '16px 0' }}>
                  <BurndownChart
                    title="本周任务燃尽图"
                    startDate={dayjs().startOf('week').format('YYYY-MM-DD')}
                    endDate={dayjs().endOf('week').format('YYYY-MM-DD')}
                    totalPoints={stats.totalTasks}
                    completedByDate={(() => {
                      // 模拟每日完成数据
                      const data: { date: string; completed: number }[] = []
                      const weekStart = dayjs().startOf('week')
                      const today = dayjs()
                      let current = weekStart
                      while (current.isBefore(today) || current.isSame(today, 'day')) {
                        data.push({
                          date: current.format('YYYY-MM-DD'),
                          completed: Math.floor(Math.random() * 3) + 1
                        })
                        current = current.add(1, 'day')
                      }
                      return data
                    })()}
                    height={350}
                    showLegend={true}
                    unit="tasks"
                  />
                </div>
              )
            },
            {
              key: 'news',
              label: (
                <span>
                  <ReadOutlined /> 新闻推送
                </span>
              ),
              children: (
                <div style={{ padding: '16px 0' }}>
                  <NewsFeed userId={user?.id || 1} />
                </div>
              )
            }
          ]}
        />
      </Card>
    </div>
  )
}

export default Dashboard