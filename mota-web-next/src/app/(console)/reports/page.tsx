'use client';

import { useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Tabs,
  Select,
  DatePicker,
  Space,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Progress,
  Tooltip,
  Dropdown,
  Empty,
  Spin,
} from 'antd';
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  AreaChartOutlined,
  DownloadOutlined,
  PrinterOutlined,
  ShareAltOutlined,
  FilterOutlined,
  CalendarOutlined,
  TeamOutlined,
  ProjectOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  FallOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  FullscreenOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// 报表数据类型
interface ReportData {
  overview: {
    totalProjects: number;
    completedProjects: number;
    totalTasks: number;
    completedTasks: number;
    totalHours: number;
    teamMembers: number;
    projectGrowth: number;
    taskGrowth: number;
  };
  projectProgress: Array<{
    id: string;
    name: string;
    progress: number;
    status: string;
    tasks: number;
    completedTasks: number;
    dueDate: string;
  }>;
  taskDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  teamPerformance: Array<{
    id: string;
    name: string;
    completedTasks: number;
    totalHours: number;
    efficiency: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  weeklyTrend: Array<{
    week: string;
    created: number;
    completed: number;
  }>;
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ]);
  const [selectedProject, setSelectedProject] = useState<string>('all');

  // 获取报表数据
  const { data: reportData, isLoading } = useQuery<ReportData>({
    queryKey: ['report-data', dateRange, selectedProject],
    queryFn: async () => ({
      overview: {
        totalProjects: 12,
        completedProjects: 5,
        totalTasks: 456,
        completedTasks: 298,
        totalHours: 1280,
        teamMembers: 25,
        projectGrowth: 15.5,
        taskGrowth: 8.3,
      },
      projectProgress: [
        {
          id: '1',
          name: '摩塔项目管理系统',
          progress: 65,
          status: 'in_progress',
          tasks: 120,
          completedTasks: 78,
          dueDate: '2024-03-15',
        },
        {
          id: '2',
          name: '企业门户网站',
          progress: 100,
          status: 'completed',
          tasks: 45,
          completedTasks: 45,
          dueDate: '2024-01-20',
        },
        {
          id: '3',
          name: '移动App开发',
          progress: 40,
          status: 'in_progress',
          tasks: 80,
          completedTasks: 32,
          dueDate: '2024-04-30',
        },
        {
          id: '4',
          name: '数据分析平台',
          progress: 25,
          status: 'at_risk',
          tasks: 60,
          completedTasks: 15,
          dueDate: '2024-02-28',
        },
      ],
      taskDistribution: [
        { status: '待处理', count: 45, percentage: 9.9 },
        { status: '进行中', count: 113, percentage: 24.8 },
        { status: '已完成', count: 298, percentage: 65.3 },
      ],
      teamPerformance: [
        { id: '1', name: '张三', completedTasks: 45, totalHours: 160, efficiency: 92, trend: 'up' },
        { id: '2', name: '李四', completedTasks: 38, totalHours: 152, efficiency: 88, trend: 'stable' },
        { id: '3', name: '王五', completedTasks: 42, totalHours: 168, efficiency: 85, trend: 'up' },
        { id: '4', name: '赵六', completedTasks: 30, totalHours: 140, efficiency: 78, trend: 'down' },
      ],
      weeklyTrend: [
        { week: 'W1', created: 25, completed: 20 },
        { week: 'W2', created: 30, completed: 28 },
        { week: 'W3', created: 22, completed: 25 },
        { week: 'W4', created: 35, completed: 30 },
      ],
    }),
  });

  // 项目进度表格列
  const projectColumns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <Progress
          percent={progress}
          size="small"
          status={progress === 100 ? 'success' : 'active'}
        />
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig: Record<string, { color: string; label: string }> = {
          completed: { color: 'success', label: '已完成' },
          in_progress: { color: 'processing', label: '进行中' },
          at_risk: { color: 'error', label: '有风险' },
        };
        return <Tag color={statusConfig[status]?.color}>{statusConfig[status]?.label}</Tag>;
      },
    },
    {
      title: '任务完成',
      key: 'tasks',
      render: (_: any, record: any) => (
        <Text>
          {record.completedTasks} / {record.tasks}
        </Text>
      ),
    },
    {
      title: '截止日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
  ];

  // 团队绩效表格列
  const teamColumns = [
    {
      title: '成员',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '完成任务',
      dataIndex: 'completedTasks',
      key: 'completedTasks',
    },
    {
      title: '工作时长',
      dataIndex: 'totalHours',
      key: 'totalHours',
      render: (hours: number) => `${hours}h`,
    },
    {
      title: '效率',
      dataIndex: 'efficiency',
      key: 'efficiency',
      render: (efficiency: number) => (
        <Progress
          percent={efficiency}
          size="small"
          strokeColor={efficiency >= 85 ? '#52c41a' : efficiency >= 70 ? '#faad14' : '#ff4d4f'}
        />
      ),
    },
    {
      title: '趋势',
      dataIndex: 'trend',
      key: 'trend',
      render: (trend: string) => {
        if (trend === 'up') return <RiseOutlined className="text-green-500" />;
        if (trend === 'down') return <FallOutlined className="text-red-500" />;
        return <span className="text-gray-400">—</span>;
      },
    },
  ];

  // 渲染概览
  const renderOverview = () => (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="项目总数"
              value={reportData?.overview.totalProjects || 0}
              prefix={<ProjectOutlined />}
              suffix={
                <Text type="secondary" className="text-sm">
                  <RiseOutlined className="text-green-500" /> {reportData?.overview.projectGrowth}%
                </Text>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="任务总数"
              value={reportData?.overview.totalTasks || 0}
              prefix={<CheckCircleOutlined />}
              suffix={
                <Text type="secondary" className="text-sm">
                  <RiseOutlined className="text-green-500" /> {reportData?.overview.taskGrowth}%
                </Text>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="工作时长"
              value={reportData?.overview.totalHours || 0}
              prefix={<ClockCircleOutlined />}
              suffix="小时"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="团队成员"
              value={reportData?.overview.teamMembers || 0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 完成率 */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="项目完成率">
            <div className="flex items-center justify-center py-8">
              <Progress
                type="circle"
                percent={Math.round(
                  ((reportData?.overview.completedProjects || 0) /
                    (reportData?.overview.totalProjects || 1)) *
                    100
                )}
                size={180}
                strokeWidth={10}
                format={(percent) => (
                  <div className="text-center">
                    <div className="text-3xl font-bold">{percent}%</div>
                    <div className="text-sm text-gray-500">
                      {reportData?.overview.completedProjects} / {reportData?.overview.totalProjects}
                    </div>
                  </div>
                )}
              />
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="任务完成率">
            <div className="flex items-center justify-center py-8">
              <Progress
                type="circle"
                percent={Math.round(
                  ((reportData?.overview.completedTasks || 0) /
                    (reportData?.overview.totalTasks || 1)) *
                    100
                )}
                size={180}
                strokeWidth={10}
                strokeColor="#52c41a"
                format={(percent) => (
                  <div className="text-center">
                    <div className="text-3xl font-bold">{percent}%</div>
                    <div className="text-sm text-gray-500">
                      {reportData?.overview.completedTasks} / {reportData?.overview.totalTasks}
                    </div>
                  </div>
                )}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 任务分布 */}
      <Card title="任务状态分布">
        <div className="flex items-center justify-around py-4">
          {reportData?.taskDistribution.map((item) => (
            <div key={item.status} className="text-center">
              <Progress
                type="circle"
                percent={item.percentage}
                size={100}
                format={() => item.count}
              />
              <div className="mt-2 text-sm text-gray-500">{item.status}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* 周趋势图（简化版） */}
      <Card title="周任务趋势">
        <div className="flex h-48 items-end justify-around">
          {reportData?.weeklyTrend.map((item) => (
            <div key={item.week} className="flex flex-col items-center">
              <div className="flex gap-1">
                <Tooltip title={`创建: ${item.created}`}>
                  <div
                    className="w-8 bg-blue-500"
                    style={{ height: item.created * 4 }}
                  />
                </Tooltip>
                <Tooltip title={`完成: ${item.completed}`}>
                  <div
                    className="w-8 bg-green-500"
                    style={{ height: item.completed * 4 }}
                  />
                </Tooltip>
              </div>
              <div className="mt-2 text-sm text-gray-500">{item.week}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center gap-8">
          <Space>
            <div className="h-3 w-3 bg-blue-500" />
            <Text type="secondary">创建</Text>
          </Space>
          <Space>
            <div className="h-3 w-3 bg-green-500" />
            <Text type="secondary">完成</Text>
          </Space>
        </div>
      </Card>
    </div>
  );

  // 渲染项目报表
  const renderProjectReport = () => (
    <div className="space-y-6">
      <Card title="项目进度详情">
        <Table
          columns={projectColumns}
          dataSource={reportData?.projectProgress}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );

  // 渲染团队报表
  const renderTeamReport = () => (
    <div className="space-y-6">
      <Card title="团队绩效">
        <Table
          columns={teamColumns}
          dataSource={reportData?.teamPerformance}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="reports-page">
      {/* 页面标题 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Title level={3} className="mb-1">
            <BarChartOutlined className="mr-2" />
            报表分析
          </Title>
          <Text type="secondary">查看项目和团队的数据分析报表</Text>
        </div>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
          />
          <Select
            value={selectedProject}
            onChange={setSelectedProject}
            style={{ width: 200 }}
            options={[
              { value: 'all', label: '全部项目' },
              { value: '1', label: '摩塔项目管理系统' },
              { value: '2', label: '企业门户网站' },
            ]}
          />
          <Dropdown
            menu={{
              items: [
                { key: 'pdf', label: '导出PDF', icon: <DownloadOutlined /> },
                { key: 'excel', label: '导出Excel', icon: <DownloadOutlined /> },
                { key: 'print', label: '打印', icon: <PrinterOutlined /> },
                { key: 'share', label: '分享', icon: <ShareAltOutlined /> },
              ],
            }}
          >
            <Button icon={<DownloadOutlined />}>导出</Button>
          </Dropdown>
        </Space>
      </div>

      {/* 报表内容 */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'overview',
            label: (
              <span>
                <PieChartOutlined />
                概览
              </span>
            ),
            children: renderOverview(),
          },
          {
            key: 'project',
            label: (
              <span>
                <ProjectOutlined />
                项目报表
              </span>
            ),
            children: renderProjectReport(),
          },
          {
            key: 'team',
            label: (
              <span>
                <TeamOutlined />
                团队报表
              </span>
            ),
            children: renderTeamReport(),
          },
        ]}
      />
    </div>
  );
}