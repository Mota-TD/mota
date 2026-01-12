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
  Alert,
  Badge,
  Calendar,
  List,
  Empty,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  TeamOutlined,
  UserOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CalendarOutlined,
  BarChartOutlined,
  ProjectOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  DownloadOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// 资源统计数据类型
interface ResourceStats {
  totalMembers: number;
  activeMembers: number;
  avgUtilization: number;
  overloadedMembers: number;
  underutilizedMembers: number;
  totalHoursPlanned: number;
  totalHoursActual: number;
}

// 成员工作量数据类型
interface MemberWorkload {
  id: string;
  name: string;
  avatar?: string;
  department: string;
  role: string;
  plannedHours: number;
  actualHours: number;
  utilization: number;
  taskCount: number;
  overdueTaskCount: number;
  status: 'normal' | 'overloaded' | 'underutilized';
}

// 团队分布数据类型
interface TeamDistribution {
  department: string;
  memberCount: number;
  avgUtilization: number;
  totalTasks: number;
  completedTasks: number;
}

// 工作量预警数据类型
interface WorkloadAlert {
  id: string;
  type: 'overload' | 'underutilized' | 'conflict';
  severity: 'high' | 'medium' | 'low';
  member: { id: string; name: string; avatar?: string };
  message: string;
  details: string;
  createdAt: string;
}

// 资源日历事件类型
interface ResourceEvent {
  id: string;
  title: string;
  memberId: string;
  memberName: string;
  type: 'task' | 'meeting' | 'leave' | 'holiday';
  startDate: string;
  endDate: string;
  hours: number;
}

// 项目冲突数据类型
interface ProjectConflict {
  id: string;
  member: { id: string; name: string };
  projects: Array<{ id: string; name: string; hours: number }>;
  conflictDate: string;
  totalHours: number;
  severity: 'high' | 'medium' | 'low';
}

// 状态配置
const workloadStatusConfig = {
  normal: { label: '正常', color: 'success' },
  overloaded: { label: '超负荷', color: 'error' },
  underutilized: { label: '低利用', color: 'warning' },
};

const alertSeverityConfig = {
  high: { label: '高', color: 'red' },
  medium: { label: '中', color: 'orange' },
  low: { label: '低', color: 'blue' },
};

export default function ResourcesPage() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('week'),
    dayjs().endOf('week'),
  ]);
  const [activeTab, setActiveTab] = useState('workload');

  // 获取资源统计
  const { data: stats } = useQuery<ResourceStats>({
    queryKey: ['resource-stats', selectedDepartment, dateRange],
    queryFn: async () => {
      return {
        totalMembers: 45,
        activeMembers: 42,
        avgUtilization: 78.5,
        overloadedMembers: 5,
        underutilizedMembers: 3,
        totalHoursPlanned: 1680,
        totalHoursActual: 1520,
      };
    },
  });

  // 获取成员工作量
  const { data: memberWorkloads } = useQuery<MemberWorkload[]>({
    queryKey: ['member-workloads', selectedDepartment, dateRange],
    queryFn: async () => {
      return [
        {
          id: '1',
          name: '张三',
          department: '研发部',
          role: '前端开发',
          plannedHours: 45,
          actualHours: 42,
          utilization: 93,
          taskCount: 8,
          overdueTaskCount: 0,
          status: 'normal',
        },
        {
          id: '2',
          name: '李四',
          department: '研发部',
          role: '后端开发',
          plannedHours: 50,
          actualHours: 48,
          utilization: 125,
          taskCount: 12,
          overdueTaskCount: 2,
          status: 'overloaded',
        },
        {
          id: '3',
          name: '王五',
          department: '设计部',
          role: 'UI设计师',
          plannedHours: 30,
          actualHours: 28,
          utilization: 70,
          taskCount: 5,
          overdueTaskCount: 0,
          status: 'normal',
        },
        {
          id: '4',
          name: '赵六',
          department: '测试部',
          role: '测试工程师',
          plannedHours: 20,
          actualHours: 15,
          utilization: 50,
          taskCount: 3,
          overdueTaskCount: 0,
          status: 'underutilized',
        },
        {
          id: '5',
          name: '钱七',
          department: '研发部',
          role: '全栈开发',
          plannedHours: 48,
          actualHours: 52,
          utilization: 130,
          taskCount: 10,
          overdueTaskCount: 1,
          status: 'overloaded',
        },
      ];
    },
  });

  // 获取团队分布
  const { data: teamDistribution } = useQuery<TeamDistribution[]>({
    queryKey: ['team-distribution'],
    queryFn: async () => {
      return [
        { department: '研发部', memberCount: 25, avgUtilization: 85, totalTasks: 120, completedTasks: 95 },
        { department: '设计部', memberCount: 8, avgUtilization: 72, totalTasks: 45, completedTasks: 38 },
        { department: '测试部', memberCount: 6, avgUtilization: 68, totalTasks: 35, completedTasks: 30 },
        { department: '产品部', memberCount: 4, avgUtilization: 80, totalTasks: 25, completedTasks: 20 },
        { department: '运维部', memberCount: 2, avgUtilization: 75, totalTasks: 15, completedTasks: 12 },
      ];
    },
  });

  // 获取工作量预警
  const { data: alerts } = useQuery<WorkloadAlert[]>({
    queryKey: ['workload-alerts'],
    queryFn: async () => {
      return [
        {
          id: '1',
          type: 'overload',
          severity: 'high',
          member: { id: '2', name: '李四' },
          message: '工作量超负荷',
          details: '本周计划工时50小时，超出标准工时25%',
          createdAt: '2026-01-08T08:00:00Z',
        },
        {
          id: '2',
          type: 'overload',
          severity: 'high',
          member: { id: '5', name: '钱七' },
          message: '工作量超负荷',
          details: '本周计划工时48小时，超出标准工时20%',
          createdAt: '2026-01-08T08:00:00Z',
        },
        {
          id: '3',
          type: 'underutilized',
          severity: 'medium',
          member: { id: '4', name: '赵六' },
          message: '资源利用率偏低',
          details: '本周计划工时20小时，利用率仅50%',
          createdAt: '2026-01-08T08:00:00Z',
        },
        {
          id: '4',
          type: 'conflict',
          severity: 'medium',
          member: { id: '1', name: '张三' },
          message: '跨项目时间冲突',
          details: '1月10日在两个项目中有重叠任务',
          createdAt: '2026-01-08T08:00:00Z',
        },
      ];
    },
  });

  // 获取项目冲突
  const { data: conflicts } = useQuery<ProjectConflict[]>({
    queryKey: ['project-conflicts'],
    queryFn: async () => {
      return [
        {
          id: '1',
          member: { id: '1', name: '张三' },
          projects: [
            { id: '1', name: '摩塔项目管理系统', hours: 6 },
            { id: '2', name: '企业门户网站', hours: 4 },
          ],
          conflictDate: '2026-01-10',
          totalHours: 10,
          severity: 'medium',
        },
        {
          id: '2',
          member: { id: '2', name: '李四' },
          projects: [
            { id: '1', name: '摩塔项目管理系统', hours: 8 },
            { id: '3', name: '移动App开发', hours: 6 },
          ],
          conflictDate: '2026-01-12',
          totalHours: 14,
          severity: 'high',
        },
      ];
    },
  });

  // 成员工作量表格列
  const workloadColumns: ColumnsType<MemberWorkload> = [
    {
      title: '成员',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />}>
            {name[0]}
          </Avatar>
          <div>
            <div>{name}</div>
            <Text type="secondary" className="text-xs">
              {record.role}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '计划工时',
      dataIndex: 'plannedHours',
      key: 'plannedHours',
      render: (hours: number) => `${hours}h`,
      sorter: (a, b) => a.plannedHours - b.plannedHours,
    },
    {
      title: '实际工时',
      dataIndex: 'actualHours',
      key: 'actualHours',
      render: (hours: number) => `${hours}h`,
      sorter: (a, b) => a.actualHours - b.actualHours,
    },
    {
      title: '利用率',
      dataIndex: 'utilization',
      key: 'utilization',
      render: (utilization: number, record) => (
        <div style={{ width: 120 }}>
          <Progress
            percent={Math.min(utilization, 100)}
            size="small"
            status={record.status === 'overloaded' ? 'exception' : undefined}
            format={() => `${utilization}%`}
          />
        </div>
      ),
      sorter: (a, b) => a.utilization - b.utilization,
    },
    {
      title: '任务数',
      dataIndex: 'taskCount',
      key: 'taskCount',
      render: (count: number, record) => (
        <Space>
          <span>{count}</span>
          {record.overdueTaskCount > 0 && (
            <Tag color="red">{record.overdueTaskCount} 逾期</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: keyof typeof workloadStatusConfig) => (
        <Tag color={workloadStatusConfig[status].color}>
          {workloadStatusConfig[status].label}
        </Tag>
      ),
      filters: [
        { text: '正常', value: 'normal' },
        { text: '超负荷', value: 'overloaded' },
        { text: '低利用', value: 'underutilized' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small">
            查看详情
          </Button>
          <Button type="link" size="small">
            调整任务
          </Button>
        </Space>
      ),
    },
  ];

  // 团队分布表格列
  const teamColumns: ColumnsType<TeamDistribution> = [
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      render: (dept: string) => (
        <Space>
          <TeamOutlined />
          {dept}
        </Space>
      ),
    },
    {
      title: '成员数',
      dataIndex: 'memberCount',
      key: 'memberCount',
      render: (count: number) => `${count} 人`,
    },
    {
      title: '平均利用率',
      dataIndex: 'avgUtilization',
      key: 'avgUtilization',
      render: (util: number) => (
        <Progress percent={util} size="small" style={{ width: 100 }} />
      ),
    },
    {
      title: '任务完成情况',
      key: 'tasks',
      render: (_, record) => (
        <Space>
          <Text>
            {record.completedTasks}/{record.totalTasks}
          </Text>
          <Progress
            percent={Math.round((record.completedTasks / record.totalTasks) * 100)}
            size="small"
            style={{ width: 80 }}
            showInfo={false}
          />
        </Space>
      ),
    },
  ];

  // 项目冲突表格列
  const conflictColumns: ColumnsType<ProjectConflict> = [
    {
      title: '成员',
      key: 'member',
      render: (_, record) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />}>
            {record.member.name[0]}
          </Avatar>
          {record.member.name}
        </Space>
      ),
    },
    {
      title: '冲突日期',
      dataIndex: 'conflictDate',
      key: 'conflictDate',
    },
    {
      title: '涉及项目',
      key: 'projects',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.projects.map((p) => (
            <div key={p.id}>
              <ProjectOutlined className="mr-1" />
              {p.name} ({p.hours}h)
            </div>
          ))}
        </Space>
      ),
    },
    {
      title: '总工时',
      dataIndex: 'totalHours',
      key: 'totalHours',
      render: (hours: number) => (
        <Text type={hours > 8 ? 'danger' : undefined}>{hours}h</Text>
      ),
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: keyof typeof alertSeverityConfig) => (
        <Tag color={alertSeverityConfig[severity].color}>
          {alertSeverityConfig[severity].label}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Button type="link" size="small">
          解决冲突
        </Button>
      ),
    },
  ];

  // 渲染工作量统计图
  const renderWorkloadChart = () => (
    <div className="h-64 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <Text strong>工作量分布</Text>
      </div>
      <div className="flex h-48 items-end justify-around gap-2">
        {memberWorkloads?.slice(0, 8).map((member) => (
          <Tooltip
            key={member.id}
            title={`${member.name}: ${member.utilization}% 利用率`}
          >
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 rounded-t ${
                  member.status === 'overloaded'
                    ? 'bg-red-500'
                    : member.status === 'underutilized'
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ height: `${Math.min(member.utilization, 150) * 1.2}px` }}
              />
              <Avatar size="small">{member.name[0]}</Avatar>
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );

  return (
    <div className="resources-page">
      {/* 页面标题 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Title level={3} className="mb-1">
            资源管理
          </Title>
          <Text type="secondary">管理团队资源分配，优化工作负载</Text>
        </div>
        <Space>
          <Select
            value={selectedDepartment}
            onChange={setSelectedDepartment}
            style={{ width: 150 }}
            options={[
              { value: 'all', label: '所有部门' },
              { value: 'dev', label: '研发部' },
              { value: 'design', label: '设计部' },
              { value: 'test', label: '测试部' },
              { value: 'product', label: '产品部' },
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
          <Button icon={<DownloadOutlined />}>导出</Button>
        </Space>
      </div>

      {/* 预警提示 */}
      {alerts && alerts.length > 0 && (
        <Alert
          className="mb-6"
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          message={`发现 ${alerts.length} 个资源预警`}
          description={
            <Space wrap className="mt-2">
              {alerts.slice(0, 3).map((alert) => (
                <Tag key={alert.id} color={alertSeverityConfig[alert.severity].color}>
                  {alert.member.name}: {alert.message}
                </Tag>
              ))}
              {alerts.length > 3 && <Tag>+{alerts.length - 3} 更多</Tag>}
            </Space>
          }
          action={
            <Button size="small" type="primary" ghost>
              查看全部
            </Button>
          }
        />
      )}

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="团队成员"
              value={stats?.totalMembers || 0}
              prefix={<TeamOutlined />}
              suffix={
                <Text type="secondary" className="text-sm">
                  / {stats?.activeMembers} 活跃
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="平均利用率"
              value={stats?.avgUtilization || 0}
              precision={1}
              suffix="%"
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="超负荷成员"
              value={stats?.overloadedMembers || 0}
              prefix={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="低利用成员"
              value={stats?.underutilizedMembers || 0}
              prefix={<WarningOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="计划工时"
              value={stats?.totalHoursPlanned || 0}
              suffix="h"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="实际工时"
              value={stats?.totalHoursActual || 0}
              suffix="h"
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* 主内容区 */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'workload',
            label: (
              <span>
                <BarChartOutlined />
                工作量统计
              </span>
            ),
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                  <Card title="成员工作量">
                    <Table
                      columns={workloadColumns}
                      dataSource={memberWorkloads}
                      rowKey="id"
                      pagination={{ pageSize: 10 }}
                    />
                  </Card>
                </Col>
                <Col xs={24} lg={8}>
                  <Card title="工作量分布" className="mb-4">
                    {renderWorkloadChart()}
                  </Card>
                  <Card title="工作量预警">
                    <List
                      size="small"
                      dataSource={alerts}
                      renderItem={(alert) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={
                              <Badge
                                color={alertSeverityConfig[alert.severity].color}
                              />
                            }
                            title={
                              <Space>
                                <Avatar size="small">
                                  {alert.member.name[0]}
                                </Avatar>
                                {alert.member.name}
                              </Space>
                            }
                            description={alert.message}
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'team',
            label: (
              <span>
                <TeamOutlined />
                团队分布
              </span>
            ),
            children: (
              <Card>
                <Table
                  columns={teamColumns}
                  dataSource={teamDistribution}
                  rowKey="department"
                  pagination={false}
                />
              </Card>
            ),
          },
          {
            key: 'calendar',
            label: (
              <span>
                <CalendarOutlined />
                资源日历
              </span>
            ),
            children: (
              <Card>
                <Calendar
                  fullscreen={false}
                  headerRender={({ value, onChange }) => (
                    <div className="mb-4 flex items-center justify-between">
                      <Space>
                        <Button onClick={() => onChange(value.subtract(1, 'month'))}>
                          上月
                        </Button>
                        <Text strong>{value.format('YYYY年MM月')}</Text>
                        <Button onClick={() => onChange(value.add(1, 'month'))}>
                          下月
                        </Button>
                      </Space>
                      <Space>
                        <Badge color="blue" text="任务" />
                        <Badge color="green" text="会议" />
                        <Badge color="orange" text="请假" />
                      </Space>
                    </div>
                  )}
                />
              </Card>
            ),
          },
          {
            key: 'conflicts',
            label: (
              <span>
                <ExclamationCircleOutlined />
                项目冲突
              </span>
            ),
            children: (
              <Card>
                <Table
                  columns={conflictColumns}
                  dataSource={conflicts}
                  rowKey="id"
                  pagination={false}
                />
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}