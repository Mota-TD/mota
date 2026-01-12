'use client';

import { useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Select,
  DatePicker,
  Space,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Tag,
  Avatar,
  Tooltip,
  Tabs,
  Empty,
} from 'antd';
import {
  LineChartOutlined,
  BarChartOutlined,
  RiseOutlined,
  FallOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  ProjectOutlined,
  ReloadOutlined,
  DownloadOutlined,
  FullscreenOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// 进度统计数据类型
interface ProgressStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number;
  avgCompletionTime: number;
  velocityTrend: number;
  predictedCompletion: string;
}

// 燃尽图数据类型
interface BurndownData {
  date: string;
  ideal: number;
  actual: number;
  remaining: number;
}

// 燃起图数据类型
interface BurnupData {
  date: string;
  scope: number;
  completed: number;
}

// 速度趋势数据类型
interface VelocityData {
  sprint: string;
  planned: number;
  completed: number;
  velocity: number;
}

// 项目进度数据类型
interface ProjectProgress {
  id: string;
  name: string;
  progress: number;
  status: 'on_track' | 'at_risk' | 'delayed';
  totalTasks: number;
  completedTasks: number;
  dueDate: string;
  owner: { id: string; name: string; avatar?: string };
}

// 里程碑数据类型
interface Milestone {
  id: string;
  name: string;
  projectName: string;
  progress: number;
  dueDate: string;
  status: 'completed' | 'in_progress' | 'upcoming' | 'overdue';
  tasksCompleted: number;
  totalTasks: number;
}

// 状态配置
const projectStatusConfig = {
  on_track: { label: '正常', color: 'success' },
  at_risk: { label: '有风险', color: 'warning' },
  delayed: { label: '延期', color: 'error' },
};

const milestoneStatusConfig = {
  completed: { label: '已完成', color: 'success' },
  in_progress: { label: '进行中', color: 'processing' },
  upcoming: { label: '即将开始', color: 'default' },
  overdue: { label: '已逾期', color: 'error' },
};

export default function ProgressPage() {
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ]);
  const [activeTab, setActiveTab] = useState('overview');

  // 获取进度统计
  const { data: stats, isLoading: statsLoading } = useQuery<ProgressStats>({
    queryKey: ['progress-stats', selectedProject, dateRange],
    queryFn: async () => {
      return {
        totalTasks: 156,
        completedTasks: 98,
        inProgressTasks: 42,
        overdueTasks: 8,
        completionRate: 62.8,
        avgCompletionTime: 3.5,
        velocityTrend: 12.5,
        predictedCompletion: '2026-02-15',
      };
    },
  });

  // 获取燃尽图数据
  const { data: burndownData } = useQuery<BurndownData[]>({
    queryKey: ['burndown', selectedProject, dateRange],
    queryFn: async () => {
      const data: BurndownData[] = [];
      const startDate = dateRange[0];
      const totalDays = dateRange[1].diff(startDate, 'day');
      const initialTasks = 100;

      for (let i = 0; i <= totalDays; i++) {
        const date = startDate.add(i, 'day').format('MM-DD');
        const ideal = initialTasks - (initialTasks / totalDays) * i;
        const actual = i <= 20 ? initialTasks - Math.random() * 5 * i : null;
        const remaining = actual !== null ? Math.max(0, actual) : null;

        data.push({
          date,
          ideal: Math.round(ideal),
          actual: actual !== null ? Math.round(actual) : 0,
          remaining: remaining !== null ? Math.round(remaining) : 0,
        });
      }
      return data;
    },
  });

  // 获取燃起图数据
  const { data: burnupData } = useQuery<BurnupData[]>({
    queryKey: ['burnup', selectedProject, dateRange],
    queryFn: async () => {
      const data: BurnupData[] = [];
      const startDate = dateRange[0];
      const totalDays = dateRange[1].diff(startDate, 'day');

      for (let i = 0; i <= Math.min(totalDays, 20); i++) {
        const date = startDate.add(i, 'day').format('MM-DD');
        data.push({
          date,
          scope: 100 + Math.floor(i / 5) * 5,
          completed: Math.min(100, Math.floor(i * 4.5)),
        });
      }
      return data;
    },
  });

  // 获取速度趋势数据
  const { data: velocityData } = useQuery<VelocityData[]>({
    queryKey: ['velocity', selectedProject],
    queryFn: async () => {
      return [
        { sprint: 'Sprint 1', planned: 30, completed: 28, velocity: 28 },
        { sprint: 'Sprint 2', planned: 32, completed: 30, velocity: 30 },
        { sprint: 'Sprint 3', planned: 35, completed: 32, velocity: 32 },
        { sprint: 'Sprint 4', planned: 33, completed: 35, velocity: 35 },
        { sprint: 'Sprint 5', planned: 36, completed: 34, velocity: 34 },
        { sprint: 'Sprint 6', planned: 38, completed: 36, velocity: 36 },
      ];
    },
  });

  // 获取项目进度列表
  const { data: projectProgress } = useQuery<ProjectProgress[]>({
    queryKey: ['project-progress'],
    queryFn: async () => {
      return [
        {
          id: '1',
          name: '摩塔项目管理系统',
          progress: 65,
          status: 'on_track',
          totalTasks: 120,
          completedTasks: 78,
          dueDate: '2026-03-01',
          owner: { id: '1', name: '张三' },
        },
        {
          id: '2',
          name: '企业门户网站',
          progress: 45,
          status: 'at_risk',
          totalTasks: 80,
          completedTasks: 36,
          dueDate: '2026-02-15',
          owner: { id: '2', name: '李四' },
        },
        {
          id: '3',
          name: '移动App开发',
          progress: 30,
          status: 'delayed',
          totalTasks: 60,
          completedTasks: 18,
          dueDate: '2026-02-01',
          owner: { id: '3', name: '王五' },
        },
        {
          id: '4',
          name: '数据分析平台',
          progress: 85,
          status: 'on_track',
          totalTasks: 50,
          completedTasks: 42,
          dueDate: '2026-01-20',
          owner: { id: '4', name: '赵六' },
        },
      ];
    },
  });

  // 获取里程碑列表
  const { data: milestones } = useQuery<Milestone[]>({
    queryKey: ['milestones'],
    queryFn: async () => {
      return [
        {
          id: '1',
          name: '需求分析完成',
          projectName: '摩塔项目管理系统',
          progress: 100,
          dueDate: '2026-01-05',
          status: 'completed',
          tasksCompleted: 15,
          totalTasks: 15,
        },
        {
          id: '2',
          name: 'UI设计完成',
          projectName: '摩塔项目管理系统',
          progress: 100,
          dueDate: '2026-01-10',
          status: 'completed',
          tasksCompleted: 20,
          totalTasks: 20,
        },
        {
          id: '3',
          name: '后端服务开发',
          projectName: '摩塔项目管理系统',
          progress: 75,
          dueDate: '2026-01-25',
          status: 'in_progress',
          tasksCompleted: 30,
          totalTasks: 40,
        },
        {
          id: '4',
          name: '前端开发',
          projectName: '摩塔项目管理系统',
          progress: 60,
          dueDate: '2026-02-10',
          status: 'in_progress',
          tasksCompleted: 24,
          totalTasks: 40,
        },
        {
          id: '5',
          name: '集成测试',
          projectName: '摩塔项目管理系统',
          progress: 0,
          dueDate: '2026-02-20',
          status: 'upcoming',
          tasksCompleted: 0,
          totalTasks: 15,
        },
      ];
    },
  });

  // 项目进度表格列
  const projectColumns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: ProjectProgress) => (
        <Space>
          <ProjectOutlined />
          <a href={`/projects/${record.id}`}>{name}</a>
        </Space>
      ),
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 200,
      render: (progress: number, record: ProjectProgress) => (
        <div>
          <Progress
            percent={progress}
            size="small"
            status={record.status === 'delayed' ? 'exception' : undefined}
          />
          <Text type="secondary" className="text-xs">
            {record.completedTasks}/{record.totalTasks} 任务
          </Text>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: keyof typeof projectStatusConfig) => (
        <Tag color={projectStatusConfig[status].color}>{projectStatusConfig[status].label}</Tag>
      ),
    },
    {
      title: '截止日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => {
        const isOverdue = dayjs(date).isBefore(dayjs());
        return (
          <Text type={isOverdue ? 'danger' : undefined}>
            {date}
            {isOverdue && <ExclamationCircleOutlined className="ml-1" />}
          </Text>
        );
      },
    },
    {
      title: '负责人',
      dataIndex: 'owner',
      key: 'owner',
      render: (owner: { name: string }) => (
        <Space>
          <Avatar size="small">{owner.name[0]}</Avatar>
          {owner.name}
        </Space>
      ),
    },
  ];

  // 里程碑表格列
  const milestoneColumns = [
    {
      title: '里程碑',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '所属项目',
      dataIndex: 'projectName',
      key: 'projectName',
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 180,
      render: (progress: number, record: Milestone) => (
        <div>
          <Progress percent={progress} size="small" />
          <Text type="secondary" className="text-xs">
            {record.tasksCompleted}/{record.totalTasks} 任务
          </Text>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: keyof typeof milestoneStatusConfig) => (
        <Tag color={milestoneStatusConfig[status].color}>{milestoneStatusConfig[status].label}</Tag>
      ),
    },
    {
      title: '截止日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
    },
  ];

  // 渲染燃尽图（简化版，实际应使用图表库如ECharts或Recharts）
  const renderBurndownChart = () => (
    <div className="h-64 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <Text strong>燃尽图 (Burndown Chart)</Text>
        <Space>
          <Button size="small" icon={<FullscreenOutlined />} />
          <Button size="small" icon={<DownloadOutlined />} />
        </Space>
      </div>
      <div className="flex h-48 items-end justify-around gap-1">
        {burndownData?.slice(0, 15).map((item, index) => (
          <Tooltip key={index} title={`${item.date}: 理想 ${item.ideal}, 实际 ${item.actual}`}>
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-4 rounded-t bg-blue-500"
                style={{ height: `${(item.ideal / 100) * 150}px` }}
              />
              <div
                className="w-4 rounded-t bg-green-500"
                style={{ height: `${(item.actual / 100) * 150}px` }}
              />
              <Text className="text-xs">{item.date}</Text>
            </div>
          </Tooltip>
        ))}
      </div>
      <div className="mt-2 flex justify-center gap-4">
        <Space>
          <div className="h-3 w-3 rounded bg-blue-500" />
          <Text type="secondary">理想进度</Text>
        </Space>
        <Space>
          <div className="h-3 w-3 rounded bg-green-500" />
          <Text type="secondary">实际进度</Text>
        </Space>
      </div>
    </div>
  );

  // 渲染燃起图
  const renderBurnupChart = () => (
    <div className="h-64 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <Text strong>燃起图 (Burnup Chart)</Text>
        <Space>
          <Button size="small" icon={<FullscreenOutlined />} />
          <Button size="small" icon={<DownloadOutlined />} />
        </Space>
      </div>
      <div className="flex h-48 items-end justify-around gap-1">
        {burnupData?.map((item, index) => (
          <Tooltip key={index} title={`${item.date}: 范围 ${item.scope}, 完成 ${item.completed}`}>
            <div className="flex flex-col items-center gap-1">
              <div className="relative w-6">
                <div
                  className="absolute bottom-0 w-full rounded-t bg-gray-300"
                  style={{ height: `${(item.scope / 120) * 150}px` }}
                />
                <div
                  className="absolute bottom-0 w-full rounded-t bg-green-500"
                  style={{ height: `${(item.completed / 120) * 150}px` }}
                />
              </div>
              <Text className="text-xs">{item.date}</Text>
            </div>
          </Tooltip>
        ))}
      </div>
      <div className="mt-2 flex justify-center gap-4">
        <Space>
          <div className="h-3 w-3 rounded bg-gray-300" />
          <Text type="secondary">总范围</Text>
        </Space>
        <Space>
          <div className="h-3 w-3 rounded bg-green-500" />
          <Text type="secondary">已完成</Text>
        </Space>
      </div>
    </div>
  );

  // 渲染速度趋势图
  const renderVelocityChart = () => (
    <div className="h-64 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <Text strong>速度趋势 (Velocity Trend)</Text>
        <Space>
          <Button size="small" icon={<FullscreenOutlined />} />
          <Button size="small" icon={<DownloadOutlined />} />
        </Space>
      </div>
      <div className="flex h-48 items-end justify-around gap-2">
        {velocityData?.map((item, index) => (
          <Tooltip key={index} title={`${item.sprint}: 计划 ${item.planned}, 完成 ${item.completed}`}>
            <div className="flex flex-col items-center gap-1">
              <div className="flex gap-1">
                <div
                  className="w-4 rounded-t bg-blue-400"
                  style={{ height: `${(item.planned / 40) * 150}px` }}
                />
                <div
                  className="w-4 rounded-t bg-green-500"
                  style={{ height: `${(item.completed / 40) * 150}px` }}
                />
              </div>
              <Text className="text-xs">{item.sprint.replace('Sprint ', 'S')}</Text>
            </div>
          </Tooltip>
        ))}
      </div>
      <div className="mt-2 flex justify-center gap-4">
        <Space>
          <div className="h-3 w-3 rounded bg-blue-400" />
          <Text type="secondary">计划</Text>
        </Space>
        <Space>
          <div className="h-3 w-3 rounded bg-green-500" />
          <Text type="secondary">完成</Text>
        </Space>
      </div>
    </div>
  );

  return (
    <div className="progress-page">
      {/* 页面标题 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Title level={3} className="mb-1">
            进度跟踪
          </Title>
          <Text type="secondary">实时监控项目和任务进度，分析团队效能</Text>
        </div>
        <Space>
          <Select
            value={selectedProject}
            onChange={setSelectedProject}
            style={{ width: 200 }}
            options={[
              { value: 'all', label: '所有项目' },
              { value: '1', label: '摩塔项目管理系统' },
              { value: '2', label: '企业门户网站' },
              { value: '3', label: '移动App开发' },
            ]}
          />
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setDateRange([dates[0], dates[1]]);
              }
            }}
          />
          <Button icon={<ReloadOutlined />}>刷新</Button>
          <Button icon={<DownloadOutlined />}>导出报告</Button>
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="任务完成率"
              value={stats?.completionRate || 0}
              precision={1}
              suffix="%"
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
            <div className="mt-2">
              <Text type="secondary">
                {stats?.completedTasks}/{stats?.totalTasks} 任务已完成
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="进行中任务"
              value={stats?.inProgressTasks || 0}
              prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
            />
            <div className="mt-2">
              <Text type="secondary">占总任务的 {((stats?.inProgressTasks || 0) / (stats?.totalTasks || 1) * 100).toFixed(1)}%</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="逾期任务"
              value={stats?.overdueTasks || 0}
              prefix={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: stats?.overdueTasks ? '#ff4d4f' : undefined }}
            />
            <div className="mt-2">
              <Text type="secondary">需要立即处理</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="速度趋势"
              value={stats?.velocityTrend || 0}
              precision={1}
              suffix="%"
              prefix={
                (stats?.velocityTrend || 0) >= 0 ? (
                  <RiseOutlined style={{ color: '#52c41a' }} />
                ) : (
                  <FallOutlined style={{ color: '#ff4d4f' }} />
                )
              }
              valueStyle={{ color: (stats?.velocityTrend || 0) >= 0 ? '#52c41a' : '#ff4d4f' }}
            />
            <div className="mt-2">
              <Text type="secondary">相比上周期</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* AI预测卡片 */}
      <Card className="mb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
            <RobotOutlined style={{ fontSize: 24, color: '#722ed1' }} />
          </div>
          <div className="flex-1">
            <Text strong>AI进度预测</Text>
            <div className="mt-1">
              <Text>
                基于当前进度和团队速度分析，预计项目将于{' '}
                <Text strong type="success">
                  {stats?.predictedCompletion}
                </Text>{' '}
                完成。平均任务完成时间为{' '}
                <Text strong>{stats?.avgCompletionTime} 天</Text>。
              </Text>
            </div>
          </div>
          <Button type="primary" ghost>
            查看详细分析
          </Button>
        </div>
      </Card>

      {/* 图表区域 */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'overview',
            label: (
              <span>
                <LineChartOutlined />
                概览
              </span>
            ),
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card title="燃尽图">{renderBurndownChart()}</Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title="燃起图">{renderBurnupChart()}</Card>
                </Col>
                <Col xs={24}>
                  <Card title="速度趋势">{renderVelocityChart()}</Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'projects',
            label: (
              <span>
                <ProjectOutlined />
                项目进度
              </span>
            ),
            children: (
              <Card>
                <Table
                  columns={projectColumns}
                  dataSource={projectProgress}
                  rowKey="id"
                  pagination={false}
                />
              </Card>
            ),
          },
          {
            key: 'milestones',
            label: (
              <span>
                <BarChartOutlined />
                里程碑
              </span>
            ),
            children: (
              <Card>
                <Table
                  columns={milestoneColumns}
                  dataSource={milestones}
                  rowKey="id"
                  pagination={false}
                />
              </Card>
            ),
          },
          {
            key: 'team',
            label: (
              <span>
                <TeamOutlined />
                团队效能
              </span>
            ),
            children: (
              <Card>
                <Empty description="团队效能分析功能开发中..." />
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}