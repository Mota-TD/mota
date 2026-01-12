'use client';

import { useState } from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  Progress,
  List,
  Avatar,
  Tag,
  Space,
  Button,
  Tooltip,
  Badge,
  Calendar,
  Dropdown,
} from 'antd';
import {
  ProjectOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  RiseOutlined,
  FallOutlined,
  BellOutlined,
  CalendarOutlined,
  FileTextOutlined,
  RobotOutlined,
  MoreOutlined,
  ArrowRightOutlined,
  ExclamationCircleOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  FireOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Title, Text, Paragraph } = Typography;

// 仪表盘数据类型
interface DashboardData {
  stats: {
    totalProjects: number;
    activeProjects: number;
    completedTasks: number;
    pendingTasks: number;
    teamMembers: number;
    projectGrowth: number;
    taskGrowth: number;
  };
  myTasks: Array<{
    id: string;
    title: string;
    project: string;
    priority: 'high' | 'medium' | 'low';
    dueDate: string;
    status: string;
  }>;
  recentActivities: Array<{
    id: string;
    user: string;
    avatar?: string;
    action: string;
    target: string;
    time: string;
  }>;
  upcomingEvents: Array<{
    id: string;
    title: string;
    type: 'meeting' | 'deadline' | 'reminder';
    time: string;
  }>;
  aiSuggestions: Array<{
    id: string;
    type: string;
    content: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  projectProgress: Array<{
    id: string;
    name: string;
    progress: number;
    status: string;
  }>;
}

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(dayjs());

  // 获取仪表盘数据
  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => ({
      stats: {
        totalProjects: 12,
        activeProjects: 8,
        completedTasks: 156,
        pendingTasks: 45,
        teamMembers: 25,
        projectGrowth: 15.5,
        taskGrowth: 8.3,
      },
      myTasks: [
        {
          id: '1',
          title: '完成用户认证模块开发',
          project: '摩塔项目管理系统',
          priority: 'high',
          dueDate: dayjs().add(1, 'day').toISOString(),
          status: 'in_progress',
        },
        {
          id: '2',
          title: '编写API文档',
          project: '摩塔项目管理系统',
          priority: 'medium',
          dueDate: dayjs().add(3, 'day').toISOString(),
          status: 'todo',
        },
        {
          id: '3',
          title: '代码审查',
          project: '企业门户网站',
          priority: 'high',
          dueDate: dayjs().toISOString(),
          status: 'in_progress',
        },
        {
          id: '4',
          title: '性能优化',
          project: '移动App',
          priority: 'low',
          dueDate: dayjs().add(5, 'day').toISOString(),
          status: 'todo',
        },
      ],
      recentActivities: [
        {
          id: '1',
          user: '张三',
          action: '完成了任务',
          target: '用户登录功能',
          time: dayjs().subtract(30, 'minute').toISOString(),
        },
        {
          id: '2',
          user: '李四',
          action: '创建了项目',
          target: '新项目A',
          time: dayjs().subtract(1, 'hour').toISOString(),
        },
        {
          id: '3',
          user: '王五',
          action: '评论了',
          target: '技术方案文档',
          time: dayjs().subtract(2, 'hour').toISOString(),
        },
        {
          id: '4',
          user: '赵六',
          action: '上传了文件',
          target: '设计稿v2.0',
          time: dayjs().subtract(3, 'hour').toISOString(),
        },
      ],
      upcomingEvents: [
        {
          id: '1',
          title: '项目周会',
          type: 'meeting',
          time: dayjs().add(2, 'hour').toISOString(),
        },
        {
          id: '2',
          title: '用户认证模块截止',
          type: 'deadline',
          time: dayjs().add(1, 'day').toISOString(),
        },
        {
          id: '3',
          title: '代码审查会议',
          type: 'meeting',
          time: dayjs().add(2, 'day').toISOString(),
        },
      ],
      aiSuggestions: [
        {
          id: '1',
          type: 'task',
          content: '建议将"编写API文档"任务安排在上午完成，效率更高',
          priority: 'medium',
        },
        {
          id: '2',
          type: 'risk',
          content: '报表分析模块进度滞后，建议增加资源投入',
          priority: 'high',
        },
        {
          id: '3',
          type: 'optimization',
          content: '发现3个任务可以合并处理，预计节省2天工时',
          priority: 'medium',
        },
      ],
      projectProgress: [
        { id: '1', name: '摩塔项目管理系统', progress: 65, status: 'in_progress' },
        { id: '2', name: '企业门户网站', progress: 100, status: 'completed' },
        { id: '3', name: '移动App开发', progress: 40, status: 'in_progress' },
        { id: '4', name: '数据分析平台', progress: 25, status: 'at_risk' },
      ],
    }),
  });

  // 优先级配置
  const priorityConfig = {
    high: { color: 'red', label: '高' },
    medium: { color: 'orange', label: '中' },
    low: { color: 'blue', label: '低' },
  };

  // 事件类型配置
  const eventTypeConfig = {
    meeting: { color: '#1890ff', icon: <TeamOutlined /> },
    deadline: { color: '#ff4d4f', icon: <ClockCircleOutlined /> },
    reminder: { color: '#faad14', icon: <BellOutlined /> },
  };

  return (
    <div className="dashboard-page">
      {/* 欢迎语 */}
      <div className="mb-6">
        <Title level={3} className="mb-1">
          👋 早上好，张三
        </Title>
        <Text type="secondary">
          今天是 {dayjs().format('YYYY年MM月DD日 dddd')}，你有 {dashboardData?.myTasks.length || 0} 个待办任务
        </Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title="进行中项目"
              value={dashboardData?.stats.activeProjects || 0}
              prefix={<ProjectOutlined className="text-blue-500" />}
              suffix={
                <Text type="secondary" className="text-sm">
                  / {dashboardData?.stats.totalProjects}
                </Text>
              }
            />
            <div className="mt-2 text-xs">
              <RiseOutlined className="text-green-500" />
              <Text type="secondary"> 较上周增长 {dashboardData?.stats.projectGrowth}%</Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title="已完成任务"
              value={dashboardData?.stats.completedTasks || 0}
              prefix={<CheckCircleOutlined className="text-green-500" />}
            />
            <div className="mt-2 text-xs">
              <RiseOutlined className="text-green-500" />
              <Text type="secondary"> 较上周增长 {dashboardData?.stats.taskGrowth}%</Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title="待处理任务"
              value={dashboardData?.stats.pendingTasks || 0}
              prefix={<ClockCircleOutlined className="text-orange-500" />}
            />
            <div className="mt-2 text-xs">
              <ExclamationCircleOutlined className="text-orange-500" />
              <Text type="secondary"> 3个即将到期</Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title="团队成员"
              value={dashboardData?.stats.teamMembers || 0}
              prefix={<TeamOutlined className="text-purple-500" />}
            />
            <div className="mt-2 text-xs">
              <Badge status="success" />
              <Text type="secondary"> 18人在线</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* 左侧内容 */}
        <Col span={16}>
          {/* 我的任务 */}
          <Card
            title={
              <Space>
                <FireOutlined className="text-orange-500" />
                我的任务
              </Space>
            }
            extra={
              <Link href="/tasks">
                查看全部 <ArrowRightOutlined />
              </Link>
            }
            className="mb-4"
          >
            <List
              dataSource={dashboardData?.myTasks}
              renderItem={(task) => (
                <List.Item
                  actions={[
                    <Tag key="priority" color={priorityConfig[task.priority].color}>
                      {priorityConfig[task.priority].label}
                    </Tag>,
                    <Dropdown
                      key="more"
                      menu={{
                        items: [
                          { key: 'view', label: '查看详情' },
                          { key: 'complete', label: '标记完成' },
                          { key: 'postpone', label: '延期' },
                        ],
                      }}
                    >
                      <Button type="text" icon={<MoreOutlined />} />
                    </Dropdown>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Link href={`/tasks/${task.id}`} className="hover:text-blue-500">
                        {task.title}
                      </Link>
                    }
                    description={
                      <Space size="middle" className="text-xs">
                        <span>{task.project}</span>
                        <span>
                          <ClockCircleOutlined className="mr-1" />
                          {dayjs(task.dueDate).format('MM-DD HH:mm')}
                        </span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>

          {/* 项目进度 */}
          <Card
            title={
              <Space>
                <TrophyOutlined className="text-yellow-500" />
                项目进度
              </Space>
            }
            extra={
              <Link href="/projects">
                查看全部 <ArrowRightOutlined />
              </Link>
            }
            className="mb-4"
          >
            <div className="space-y-4">
              {dashboardData?.projectProgress.map((project) => (
                <div key={project.id}>
                  <div className="mb-1 flex items-center justify-between">
                    <Text>{project.name}</Text>
                    <Text type="secondary">{project.progress}%</Text>
                  </div>
                  <Progress
                    percent={project.progress}
                    showInfo={false}
                    strokeColor={
                      project.status === 'completed'
                        ? '#52c41a'
                        : project.status === 'at_risk'
                        ? '#ff4d4f'
                        : '#1890ff'
                    }
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* 最近动态 */}
          <Card
            title={
              <Space>
                <ThunderboltOutlined className="text-blue-500" />
                最近动态
              </Space>
            }
          >
            <List
              dataSource={dashboardData?.recentActivities}
              renderItem={(activity) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={activity.avatar}>{activity.user[0]}</Avatar>}
                    title={
                      <span>
                        <Text strong>{activity.user}</Text>
                        <Text type="secondary"> {activity.action} </Text>
                        <Text>{activity.target}</Text>
                      </span>
                    }
                    description={dayjs(activity.time).fromNow()}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 右侧内容 */}
        <Col span={8}>
          {/* AI 建议 */}
          <Card
            title={
              <Space>
                <RobotOutlined className="text-purple-500" />
                AI 智能建议
              </Space>
            }
            className="mb-4"
          >
            <div className="space-y-3">
              {dashboardData?.aiSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="rounded-lg border border-gray-100 p-3 dark:border-gray-700"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <Tag
                      color={
                        suggestion.priority === 'high'
                          ? 'red'
                          : suggestion.priority === 'medium'
                          ? 'orange'
                          : 'blue'
                      }
                    >
                      {suggestion.type === 'task'
                        ? '任务建议'
                        : suggestion.type === 'risk'
                        ? '风险提醒'
                        : '优化建议'}
                    </Tag>
                  </div>
                  <Text className="text-sm">{suggestion.content}</Text>
                </div>
              ))}
            </div>
            <Button type="link" block className="mt-2">
              查看更多建议
            </Button>
          </Card>

          {/* 即将到来的事件 */}
          <Card
            title={
              <Space>
                <CalendarOutlined className="text-green-500" />
                即将到来
              </Space>
            }
            extra={
              <Link href="/calendar">
                <CalendarOutlined />
              </Link>
            }
            className="mb-4"
          >
            <List
              dataSource={dashboardData?.upcomingEvents}
              renderItem={(event) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: eventTypeConfig[event.type].color + '20' }}
                      >
                        <span style={{ color: eventTypeConfig[event.type].color }}>
                          {eventTypeConfig[event.type].icon}
                        </span>
                      </div>
                    }
                    title={event.title}
                    description={dayjs(event.time).format('MM-DD HH:mm')}
                  />
                </List.Item>
              )}
            />
          </Card>

          {/* 快捷操作 */}
          <Card title="快捷操作">
            <div className="grid grid-cols-2 gap-3">
              <Button icon={<ProjectOutlined />} block>
                新建项目
              </Button>
              <Button icon={<CheckCircleOutlined />} block>
                创建任务
              </Button>
              <Button icon={<FileTextOutlined />} block>
                新建文档
              </Button>
              <Button icon={<CalendarOutlined />} block>
                安排日程
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}