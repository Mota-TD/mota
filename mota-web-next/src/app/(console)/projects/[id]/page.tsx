'use client';

import { useState } from 'react';
import {
  Card,
  Tabs,
  Button,
  Tag,
  Avatar,
  Progress,
  Descriptions,
  Space,
  Typography,
  Dropdown,
  Breadcrumb,
  Statistic,
  Row,
  Col,
  Timeline,
  List,
  Empty,
} from 'antd';
import {
  EditOutlined,
  SettingOutlined,
  TeamOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MoreOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
  ProjectOutlined,
  FileTextOutlined,
  MessageOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import { PageLoading, ListSkeleton } from '@/components/common';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// 项目详情类型
interface ProjectDetail {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'paused' | 'completed' | 'archived';
  priority: 'high' | 'medium' | 'low';
  progress: number;
  startDate: string;
  endDate: string;
  owner: {
    id: string;
    name: string;
    avatar: string;
    email: string;
  };
  members: Array<{
    id: string;
    name: string;
    avatar: string;
    role: string;
  }>;
  stats: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    pendingTasks: number;
    overdueTasks: number;
  };
  milestones: Array<{
    id: string;
    name: string;
    dueDate: string;
    status: 'pending' | 'completed';
  }>;
  recentActivities: Array<{
    id: string;
    user: { name: string; avatar: string };
    action: string;
    target: string;
    time: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// 状态配置
const statusConfig = {
  planning: { color: 'default', text: '规划中' },
  active: { color: 'processing', text: '进行中' },
  paused: { color: 'warning', text: '已暂停' },
  completed: { color: 'success', text: '已完成' },
  archived: { color: 'default', text: '已归档' },
};

// 优先级配置
const priorityConfig = {
  high: { color: 'red', text: '高' },
  medium: { color: 'orange', text: '中' },
  low: { color: 'green', text: '低' },
};

// 获取项目详情
const fetchProjectDetail = async (id: string): Promise<ProjectDetail> => {
  const response = await apiClient.get(`/api/projects/${id}`);
  return response.data;
};

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const [activeTab, setActiveTab] = useState('overview');

  // 获取项目详情
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => fetchProjectDetail(projectId),
    enabled: !!projectId,
  });

  if (isLoading) {
    return <PageLoading />;
  }

  if (!project) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Empty description="项目不存在" />
      </div>
    );
  }

  return (
    <div className="project-detail-page">
      {/* 面包屑导航 */}
      <Breadcrumb
        className="mb-4"
        items={[
          { title: <Link href="/projects">项目管理</Link> },
          { title: project.name },
        ]}
      />

      {/* 项目头部信息 */}
      <Card className="mb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar
              size={64}
              style={{ backgroundColor: '#1890ff' }}
              icon={<ProjectOutlined />}
            />
            <div>
              <div className="flex items-center gap-3">
                <Title level={3} className="!mb-1">
                  {project.name}
                </Title>
                <Tag color={statusConfig[project.status].color}>
                  {statusConfig[project.status].text}
                </Tag>
                <Tag color={priorityConfig[project.priority].color}>
                  {priorityConfig[project.priority].text}优先级
                </Tag>
              </div>
              <Paragraph type="secondary" className="!mb-2 max-w-2xl">
                {project.description || '暂无项目描述'}
              </Paragraph>
              <Space>
                <Text type="secondary">
                  <TeamOutlined className="mr-1" />
                  {project.members.length} 成员
                </Text>
                <Text type="secondary">
                  <CalendarOutlined className="mr-1" />
                  {project.startDate} ~ {project.endDate}
                </Text>
              </Space>
            </div>
          </div>
          <Space>
            <Button icon={<PlusOutlined />} type="primary">
              添加任务
            </Button>
            <Button icon={<EditOutlined />}>编辑</Button>
            <Dropdown
              menu={{
                items: [
                  { key: 'settings', icon: <SettingOutlined />, label: '项目设置' },
                  { key: 'members', icon: <TeamOutlined />, label: '成员管理' },
                  { type: 'divider' },
                  { key: 'archive', label: '归档项目' },
                ],
              }}
            >
              <Button icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        </div>

        {/* 进度条 */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <Text>项目进度</Text>
            <Text strong>{project.progress}%</Text>
          </div>
          <Progress percent={project.progress} showInfo={false} />
        </div>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="总任务"
              value={project.stats.totalTasks}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="已完成"
              value={project.stats.completedTasks}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="进行中"
              value={project.stats.inProgressTasks}
              prefix={<ClockCircleOutlined className="text-blue-500" />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="已逾期"
              value={project.stats.overdueTasks}
              prefix={<ClockCircleOutlined className="text-red-500" />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 标签页内容 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="概览" key="overview">
            <Row gutter={[24, 24]}>
              {/* 左侧：项目信息 */}
              <Col xs={24} lg={16}>
                <Card title="项目信息" size="small" className="mb-4">
                  <Descriptions column={{ xs: 1, sm: 2 }}>
                    <Descriptions.Item label="项目负责人">
                      <Space>
                        <Avatar src={project.owner.avatar} size="small">
                          {project.owner.name?.[0]}
                        </Avatar>
                        {project.owner.name}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="创建时间">
                      {project.createdAt}
                    </Descriptions.Item>
                    <Descriptions.Item label="开始日期">
                      {project.startDate}
                    </Descriptions.Item>
                    <Descriptions.Item label="截止日期">
                      {project.endDate}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                {/* 里程碑 */}
                <Card title="里程碑" size="small">
                  {project.milestones.length === 0 ? (
                    <Empty description="暂无里程碑" />
                  ) : (
                    <Timeline
                      items={project.milestones.map((milestone) => ({
                        color: milestone.status === 'completed' ? 'green' : 'blue',
                        children: (
                          <div>
                            <Text strong>{milestone.name}</Text>
                            <br />
                            <Text type="secondary" className="text-sm">
                              {milestone.dueDate}
                            </Text>
                          </div>
                        ),
                      }))}
                    />
                  )}
                </Card>
              </Col>

              {/* 右侧：团队成员和活动 */}
              <Col xs={24} lg={8}>
                {/* 团队成员 */}
                <Card
                  title="团队成员"
                  size="small"
                  className="mb-4"
                  extra={<Button type="link" size="small">管理</Button>}
                >
                  <List
                    size="small"
                    dataSource={project.members.slice(0, 5)}
                    renderItem={(member) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar src={member.avatar}>{member.name?.[0]}</Avatar>}
                          title={member.name}
                          description={member.role}
                        />
                      </List.Item>
                    )}
                  />
                  {project.members.length > 5 && (
                    <div className="mt-2 text-center">
                      <Button type="link" size="small">
                        查看全部 {project.members.length} 人
                      </Button>
                    </div>
                  )}
                </Card>

                {/* 最近活动 */}
                <Card
                  title="最近活动"
                  size="small"
                  extra={<Button type="link" size="small">更多</Button>}
                >
                  {project.recentActivities.length === 0 ? (
                    <Empty description="暂无活动" />
                  ) : (
                    <List
                      size="small"
                      dataSource={project.recentActivities.slice(0, 5)}
                      renderItem={(activity) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={
                              <Avatar src={activity.user.avatar} size="small">
                                {activity.user.name?.[0]}
                              </Avatar>
                            }
                            title={
                              <Text className="text-sm">
                                <Text strong>{activity.user.name}</Text>{' '}
                                {activity.action}{' '}
                                <Text type="secondary">{activity.target}</Text>
                              </Text>
                            }
                            description={
                              <Text type="secondary" className="text-xs">
                                {activity.time}
                              </Text>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="任务" key="tasks">
            <div className="py-8 text-center">
              <Empty description="任务列表组件待实现" />
            </div>
          </TabPane>

          <TabPane tab="看板" key="kanban">
            <div className="py-8 text-center">
              <Empty description="看板视图组件待实现" />
            </div>
          </TabPane>

          <TabPane tab="甘特图" key="gantt">
            <div className="py-8 text-center">
              <Empty description="甘特图组件待实现" />
            </div>
          </TabPane>

          <TabPane tab="日历" key="calendar">
            <div className="py-8 text-center">
              <Empty description="日历视图组件待实现" />
            </div>
          </TabPane>

          <TabPane tab="文档" key="documents">
            <div className="py-8 text-center">
              <Empty description="文档列表组件待实现" />
            </div>
          </TabPane>

          <TabPane tab="设置" key="settings">
            <div className="py-8 text-center">
              <Empty description="项目设置组件待实现" />
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
}