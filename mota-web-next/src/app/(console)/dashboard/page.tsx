'use client';

import { useState, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import {
  Card,
  Typography,
  Row,
  Col,
  Progress,
  List,
  Avatar,
  Tag,
  Button,
  Input,
  Tabs,
  message,
  Skeleton,
} from 'antd';
import {
  ProjectOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UnorderedListOutlined,
  RobotOutlined,
  ArrowRightOutlined,
  FireOutlined,
  TrophyOutlined,
  BulbOutlined,
  FilePptOutlined,
  BookOutlined,
  GlobalOutlined,
  SendOutlined,
  CalendarOutlined,
  LineChartOutlined,
  ReadOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

import { useAuth } from '@/components/providers/auth-provider';
import { dashboardService, type DashboardData as ApiDashboardData } from '@/services';

// 动态导入重型组件以提升首屏加载速度
const BurndownChart = dynamic(() => import('@/components/burndown-chart'), {
  loading: () => <Skeleton active paragraph={{ rows: 8 }} />,
  ssr: false,
});

const NewsFeed = dynamic(() => import('@/components/news-feed'), {
  loading: () => <Skeleton active paragraph={{ rows: 6 }} />,
  ssr: false,
});

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Title, Text } = Typography;

// 统一主题色 - 薄荷绿
const THEME_COLOR = '#10B981';

// 问候语库 - 根据时间段分类
const greetingMessages = {
  morning: [
    { greeting: '早上好', quote: '新的一天，新的开始，愿你满怀希望！' },
    { greeting: '早安', quote: '每一个清晨都是一份礼物，好好珍惜今天。' },
    { greeting: '早上好', quote: '阳光正好，微风不燥，愿你今天收获满满。' },
    { greeting: '早安', quote: '美好的一天从现在开始，加油！' },
    { greeting: '早上好', quote: '今天也要元气满满地开始工作哦！' },
  ],
  afternoon: [
    { greeting: '下午好', quote: '午后时光，别忘了给自己一杯咖啡的休息。' },
    { greeting: '下午好', quote: '坚持就是胜利，下午继续保持专注！' },
    { greeting: '下午好', quote: '阳光温暖，愿你的心情也如此明媚。' },
    { greeting: '下午好', quote: '工作之余，记得起身活动一下哦。' },
    { greeting: '下午好', quote: '每一份努力都在为未来铺路，继续加油！' },
  ],
  evening: [
    { greeting: '傍晚好', quote: '夕阳西下，今天的工作即将收尾，辛苦了！' },
    { greeting: '傍晚好', quote: '忙碌了一天，记得给自己一个微笑。' },
    { greeting: '傍晚好', quote: '日落时分，愿你带着满满的收获回家。' },
    { greeting: '傍晚好', quote: '今天的努力，是明天的底气。' },
  ],
  night: [
    { greeting: '晚上好', quote: '夜深了，注意休息，明天又是元气满满的一天。' },
    { greeting: '晚上好', quote: '星光不负赶路人，你的努力终将闪耀。' },
    { greeting: '晚上好', quote: '今天辛苦了，好好休息，晚安！' },
    { greeting: '晚上好', quote: '夜晚是思考的好时光，也别忘了照顾自己。' },
    { greeting: '深夜好', quote: '夜猫子也要注意休息，身体是革命的本钱！' },
  ],
};

// 获取当前时间段
const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 20) return 'evening';
  return 'night';
};

// 获取随机问候语
const getRandomGreeting = () => {
  const timeOfDay = getTimeOfDay();
  const messages = greetingMessages[timeOfDay];
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};

// 本地仪表盘数据类型
interface LocalDashboardData {
  stats: {
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    aiSolutions: number;
    pptGenerated: number;
  };
  myTasks: Array<{
    id: string;
    title: string;
    taskNo: string;
    status: string;
    priority: string;
    type: string;
    projectName?: string;
    milestoneName?: string;
  }>;
  recentProjects: Array<{
    id: string;
    name: string;
    description?: string;
    color?: string;
    progress: number;
  }>;
  activities: Array<{
    id: string;
    user: { name: string };
    action: string;
    target: string;
    time: string;
    type: string;
  }>;
  news: Array<{
    id: string;
    title: string;
    category: string;
    source: string;
    publishTime: string;
  }>;
}

// 将 API 数据转换为本地数据格式
const transformApiData = (apiData: ApiDashboardData): LocalDashboardData => {
  return {
    stats: {
      totalProjects: apiData.projectStats.total,
      totalTasks: apiData.taskStats.total,
      completedTasks: apiData.taskStats.completed,
      inProgressTasks: apiData.taskStats.inProgress,
      aiSolutions: apiData.aiSuggestions?.length || 0,
      pptGenerated: 0,
    },
    myTasks: apiData.todayTasks.map((task) => ({
      id: task.id,
      title: task.title,
      taskNo: `T-${task.id.slice(0, 3).toUpperCase()}`,
      status: task.status,
      priority: task.priority,
      type: 'task',
      projectName: task.projectName,
    })),
    recentProjects: apiData.recentProjects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      color: project.color,
      progress: project.progress,
    })),
    activities: [],
    news: [],
  };
};

// 空数据（当 API 不可用时显示）
const getEmptyData = (): LocalDashboardData => ({
  stats: {
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    aiSolutions: 0,
    pptGenerated: 0,
  },
  myTasks: [],
  recentProjects: [],
  activities: [],
  news: [],
});

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [aiInput, setAiInput] = useState('');
  const [activeOverviewTab, setActiveOverviewTab] = useState('tasks');

  // 使用 useMemo 确保每次页面加载时随机选择一条问候语，但在组件生命周期内保持不变
  const greetingData = useMemo(() => getRandomGreeting(), []);

  // 获取仪表盘数据 - 开发模式下快速失败
  const { data: dashboardData, isLoading, refetch, isError } = useQuery<LocalDashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      try {
        const apiData = await dashboardService.getDashboardData();
        return transformApiData(apiData);
      } catch (error) {
        console.error('获取仪表盘数据失败:', error);
        // API 失败时返回空数据
        return getEmptyData();
      }
    },
    staleTime: 60000, // 1分钟内不重新请求
    retry: false, // 不重试，快速失败
    retryDelay: 0,
    // 初始数据，避免加载状态
    placeholderData: getEmptyData(),
  });

  // 手动刷新数据
  const handleRefresh = async () => {
    await refetch();
    message.success('数据已刷新');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'blue',
      in_progress: 'orange',
      done: 'green',
      closed: 'default',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      open: '待处理',
      in_progress: '进行中',
      done: '已完成',
      closed: '已关闭',
    };
    return texts[status] || status;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      highest: '#ff4d4f',
      high: '#fa8c16',
      medium: '#1677ff',
      low: '#52c41a',
      lowest: '#8c8c8c',
    };
    return colors[priority] || '#8c8c8c';
  };

  const handleAiSubmit = () => {
    if (aiInput.trim()) {
      router.push(`/ai/proposal?query=${encodeURIComponent(aiInput)}`);
    }
  };

  // AI 快捷功能
  const aiFeatures = [
    {
      icon: <BulbOutlined />,
      title: '方案生成',
      desc: '智能生成项目方案',
      path: '/ai/proposal',
      color: THEME_COLOR,
    },
    {
      icon: <FilePptOutlined />,
      title: 'PPT生成',
      desc: '一键生成演示文稿',
      path: '/ai/ppt',
      color: '#3B82F6',
    },
    {
      icon: <BookOutlined />,
      title: '知识库',
      desc: '智能知识管理',
      path: '/ai/knowledge-base',
      color: '#8B5CF6',
    },
    {
      icon: <GlobalOutlined />,
      title: '新闻追踪',
      desc: '行业动态追踪',
      path: '/news',
      color: '#F59E0B',
    },
  ];

  // 使用 placeholderData 后，isLoading 仍可能为 true，但数据已经可用
  // 只有在没有数据时才显示加载状态
  if (isLoading && !dashboardData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  return (
    <div>
      {/* 欢迎区域 */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
        borderRadius: 16,
        padding: '24px 32px',
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
              <Title level={3} style={{ margin: 0 }}>
                {greetingData.greeting}，欢迎回来 👋
              </Title>
              <Text style={{ color: '#64748B' }}>
                💡 {greetingData.quote}
              </Text>
            </div>
            <Text type="secondary">
              今天有 {dashboardData?.stats.inProgressTasks || 0} 个任务进行中，{dashboardData?.stats.completedTasks || 0} 个任务已完成
            </Text>
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <FireOutlined style={{ fontSize: 24, color: '#F59E0B' }} />
              <div>
                <div style={{ fontSize: 24, fontWeight: 600 }}>{dashboardData?.stats.aiSolutions || 0}</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>AI方案</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <TrophyOutlined style={{ fontSize: 24, color: THEME_COLOR }} />
              <div>
                <div style={{ fontSize: 24, fontWeight: 600 }}>{dashboardData?.stats.completedTasks || 0}</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>已完成</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI 助手区域 */}
      <Card style={{ marginBottom: 24, borderRadius: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${THEME_COLOR} 0%, #059669 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <RobotOutlined style={{ fontSize: 24, color: '#fff' }} />
          </div>
          <div>
            <Title level={5} style={{ margin: 0 }}>AI 智能助手</Title>
            <Text type="secondary">描述您的需求，AI 将为您生成专业方案</Text>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <Input.TextArea
            placeholder="例如：帮我制定一个电商平台的技术架构方案..."
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            autoSize={{ minRows: 2, maxRows: 4 }}
            style={{ flex: 1 }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleAiSubmit}
            style={{ height: 'auto', background: THEME_COLOR, borderColor: THEME_COLOR }}
          >
            生成方案
          </Button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {aiFeatures.map((feature, index) => (
            <div
              key={index}
              onClick={() => router.push(feature.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: `${feature.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: feature.color,
                fontSize: 18,
              }}>
                {feature.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{feature.title}</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>{feature.desc}</div>
              </div>
              <ArrowRightOutlined style={{ color: '#94A3B8' }} />
            </div>
          ))}
        </div>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card
            hoverable
            onClick={() => router.push('/projects')}
            style={{ borderRadius: 12, cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(59, 130, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <ProjectOutlined style={{ fontSize: 24, color: '#3B82F6' }} />
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 600 }}>{dashboardData?.stats.totalProjects || 0}</div>
                <div style={{ fontSize: 13, color: '#64748B' }}>项目总数</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            hoverable
            onClick={() => router.push('/tasks')}
            style={{ borderRadius: 12, cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(139, 92, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <UnorderedListOutlined style={{ fontSize: 24, color: '#8B5CF6' }} />
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 600 }}>{dashboardData?.stats.totalTasks || 0}</div>
                <div style={{ fontSize: 13, color: '#64748B' }}>任务总数</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            hoverable
            onClick={() => router.push('/tasks?status=in_progress')}
            style={{ borderRadius: 12, cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(245, 158, 11, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <ClockCircleOutlined style={{ fontSize: 24, color: '#F59E0B' }} />
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 600 }}>{dashboardData?.stats.inProgressTasks || 0}</div>
                <div style={{ fontSize: 13, color: '#64748B' }}>进行中</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            hoverable
            onClick={() => router.push('/tasks?status=completed')}
            style={{ borderRadius: 12, cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <CheckCircleOutlined style={{ fontSize: 24, color: THEME_COLOR }} />
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 600 }}>{dashboardData?.stats.completedTasks || 0}</div>
                <div style={{ fontSize: 13, color: '#64748B' }}>已完成</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 我的任务 */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UnorderedListOutlined style={{ color: THEME_COLOR }} />
                <span>我的任务</span>
              </div>
            }
            extra={<Link href="/tasks">查看全部 <ArrowRightOutlined /></Link>}
            style={{ borderRadius: 12 }}
          >
            <List
              dataSource={dashboardData?.myTasks}
              renderItem={(item) => (
                <List.Item
                  style={{ cursor: 'pointer', padding: '12px 0' }}
                  onClick={() => router.push(`/tasks/${item.id}`)}
                >
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: getPriorityColor(item.priority),
                        }}
                      />
                      <Text strong style={{ flex: 1 }}>{item.title}</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ProjectOutlined style={{ color: THEME_COLOR }} />
                <span>最近项目</span>
              </div>
            }
            extra={<Link href="/projects">查看全部 <ArrowRightOutlined /></Link>}
            style={{ borderRadius: 12 }}
          >
            <List
              dataSource={dashboardData?.recentProjects}
              renderItem={(item) => (
                <List.Item
                  style={{ cursor: 'pointer', padding: '12px 0' }}
                  onClick={() => router.push(`/projects/${item.id}`)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: item.color || THEME_COLOR,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 600,
                      }}
                    >
                      {item.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500 }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: '#64748B' }}>
                        {item.description || '暂无描述'}
                      </div>
                    </div>
                    <div style={{ width: 100 }}>
                      <Progress
                        percent={item.progress || 0}
                        size="small"
                        strokeColor={THEME_COLOR}
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
      <Card style={{ marginTop: 16, borderRadius: 12 }}>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <GlobalOutlined style={{ color: THEME_COLOR }} />
                          <span>新闻追踪</span>
                        </div>
                      }
                      extra={<Link href="/news">更多 <ArrowRightOutlined /></Link>}
                      size="small"
                    >
                      <List
                        dataSource={dashboardData?.news}
                        renderItem={(item) => (
                          <List.Item style={{ padding: '8px 0' }}>
                            <div>
                              <div style={{ fontWeight: 500, marginBottom: 4 }}>{item.title}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <CalendarOutlined style={{ color: THEME_COLOR }} />
                          <span>最近动态</span>
                        </div>
                      }
                      size="small"
                    >
                      <List
                        dataSource={dashboardData?.activities}
                        renderItem={(item) => (
                          <List.Item style={{ padding: '8px 0' }}>
                            <List.Item.Meta
                              avatar={
                                <Avatar style={{ backgroundColor: THEME_COLOR }}>
                                  {item.user?.name?.charAt(0) || 'U'}
                                </Avatar>
                              }
                              title={
                                <span>
                                  <Text strong>{item.user?.name || '用户'}</Text>
                                  <Text type="secondary"> {item.action}</Text>
                                </span>
                              }
                              description={
                                <div>
                                  <Text type="secondary">{item.target}</Text>
                                  <Text type="secondary" style={{ marginLeft: 8 }}>
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
              ),
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
                    totalPoints={dashboardData?.stats.totalTasks || 20}
                    completedByDate={(() => {
                      // 模拟每日完成数据
                      const data: { date: string; completed: number }[] = [];
                      const weekStart = dayjs().startOf('week');
                      const today = dayjs();
                      let current = weekStart;
                      while (current.isBefore(today) || current.isSame(today, 'day')) {
                        data.push({
                          date: current.format('YYYY-MM-DD'),
                          completed: Math.floor(Math.random() * 3) + 1
                        });
                        current = current.add(1, 'day');
                      }
                      return data;
                    })()}
                    height={350}
                    showLegend={true}
                    unit="任务"
                  />
                </div>
              ),
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
                  <NewsFeed userId={1} />
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}