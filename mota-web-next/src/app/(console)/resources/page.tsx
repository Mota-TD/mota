'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Table,
  Tag,
  Space,
  Select,
  Button,
  Avatar,
  Tooltip,
  Progress,
  Tabs,
  Calendar,
  Badge,
  Statistic,
  Spin,
  Empty,
} from 'antd';
import type { Dayjs } from 'dayjs';
import {
  TeamOutlined,
  UserOutlined,
  ProjectOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  PlusOutlined,
  FilterOutlined,
  DownloadOutlined,
  CalendarOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { resourceService, type TeamMember, type ResourceAllocation, type ResourceStats } from '@/services';

const { Title, Text } = Typography;

// 统一主题色 - 薄荷绿
const THEME_COLOR = '#10B981';

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState('members');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [resourceAllocation, setResourceAllocation] = useState<ResourceAllocation[]>([]);
  const [stats, setStats] = useState<ResourceStats | null>(null);

  // 获取团队成员
  const fetchTeamMembers = useCallback(async () => {
    try {
      const data = await resourceService.getTeamMembers({
        department: selectedDepartment === 'all' ? undefined : selectedDepartment,
      });
      setTeamMembers(data);
    } catch (error) {
      console.error('Failed to fetch team members:', error);
      setTeamMembers([]);
    }
  }, [selectedDepartment]);

  // 获取资源分配
  const fetchResourceAllocation = useCallback(async () => {
    try {
      const data = await resourceService.getResourceAllocations();
      setResourceAllocation(data);
    } catch (error) {
      console.error('Failed to fetch resource allocation:', error);
      setResourceAllocation([]);
    }
  }, []);

  // 获取资源统计
  const fetchStats = useCallback(async () => {
    try {
      const data = await resourceService.getResourceStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch resource stats:', error);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchTeamMembers(),
        fetchResourceAllocation(),
        fetchStats(),
      ]);
      setLoading(false);
    };
    fetchData();
  }, [fetchTeamMembers, fetchResourceAllocation, fetchStats]);

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'available':
        return <Tag color="success">空闲</Tag>;
      case 'busy':
        return <Tag color="processing">忙碌</Tag>;
      case 'overloaded':
        return <Tag color="error">超负荷</Tag>;
      default:
        return <Tag>未知</Tag>;
    }
  };

  const getWorkloadColor = (workload: number) => {
    if (workload >= 90) return '#EF4444';
    if (workload >= 70) return '#F59E0B';
    return THEME_COLOR;
  };

  const memberColumns = [
    {
      title: '成员',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: TeamMember) => (
        <Space>
          <Avatar style={{ backgroundColor: THEME_COLOR }}>{record.avatar || text.charAt(0)}</Avatar>
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{record.role}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: '工作负载',
      dataIndex: 'workload',
      key: 'workload',
      width: 180,
      render: (value: number) => (
        <div>
          <Progress
            percent={value}
            size="small"
            strokeColor={getWorkloadColor(value)}
            format={(percent) => `${percent}%`}
          />
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '参与项目',
      dataIndex: 'projects',
      key: 'projects',
      render: (projects: string[]) => (
        <Space wrap>
          {projects.map((project, index) => (
            <Tag key={index}>{project}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '技能',
      dataIndex: 'skills',
      key: 'skills',
      render: (skills: string[]) => (
        <Space wrap>
          {skills.slice(0, 2).map((skill, index) => (
            <Tag key={index} color="blue">{skill}</Tag>
          ))}
          {skills.length > 2 && <Tag>+{skills.length - 2}</Tag>}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space>
          <Button type="link" size="small">查看详情</Button>
          <Button type="link" size="small">分配任务</Button>
        </Space>
      ),
    },
  ];

  const allocationColumns = [
    {
      title: '项目',
      dataIndex: 'project',
      key: 'project',
      render: (text: string) => (
        <Space>
          <ProjectOutlined style={{ color: THEME_COLOR }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: '成员数',
      dataIndex: 'members',
      key: 'members',
      render: (value: number) => (
        <Space>
          <TeamOutlined style={{ color: '#3B82F6' }} />
          {value} 人
        </Space>
      ),
    },
    {
      title: '工时',
      dataIndex: 'hours',
      key: 'hours',
      render: (value: number) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#8B5CF6' }} />
          {value} 小时
        </Space>
      ),
    },
    {
      title: '预算',
      dataIndex: 'budget',
      key: 'budget',
      render: (value: number) => `¥${value.toLocaleString()}`,
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 150,
      render: (value: number) => (
        <Progress percent={value} size="small" strokeColor={THEME_COLOR} />
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* 页面头部 */}
      <div style={{
        background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`,
        borderRadius: 16,
        padding: '20px 24px',
        marginBottom: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <TeamOutlined style={{ fontSize: 24, color: '#fff' }} />
          </div>
          <div>
            <Title level={4} style={{ color: '#fff', margin: 0 }}>资源管理</Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)' }}>团队成员和项目资源分配</Text>
          </div>
        </div>
        <Space>
          <Select
            value={selectedDepartment}
            onChange={setSelectedDepartment}
            style={{ width: 140 }}
            options={[
              { value: 'all', label: '全部部门' },
              { value: 'dev', label: '研发部' },
              { value: 'design', label: '设计部' },
              { value: 'product', label: '产品部' },
            ]}
          />
          <Button icon={<PlusOutlined />} type="primary" style={{ background: 'rgba(255,255,255,0.2)', borderColor: 'transparent' }}>
            添加成员
          </Button>
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="团队成员"
              value={stats?.totalMembers || 0}
              prefix={<TeamOutlined style={{ color: '#3B82F6' }} />}
              suffix="人"
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="空闲成员"
              value={stats?.available || 0}
              valueStyle={{ color: '#10B981' }}
              prefix={<CheckCircleOutlined />}
              suffix="人"
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="超负荷"
              value={stats?.overloaded || 0}
              valueStyle={{ color: '#EF4444' }}
              prefix={<WarningOutlined />}
              suffix="人"
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="平均负载"
              value={stats?.avgWorkload || 0}
              prefix={<BarChartOutlined style={{ color: '#F59E0B' }} />}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      {/* 主内容区 */}
      <Card style={{ borderRadius: 12 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'members',
              label: (
                <span>
                  <UserOutlined /> 成员列表
                </span>
              ),
              children: teamMembers.length > 0 ? (
                <Table
                  dataSource={teamMembers}
                  columns={memberColumns}
                  pagination={false}
                  rowKey="id"
                />
              ) : (
                <Empty description="暂无成员数据" />
              ),
            },
            {
              key: 'allocation',
              label: (
                <span>
                  <ProjectOutlined /> 资源分配
                </span>
              ),
              children: resourceAllocation.length > 0 ? (
                <Table
                  dataSource={resourceAllocation}
                  columns={allocationColumns}
                  pagination={false}
                  rowKey="project"
                />
              ) : (
                <Empty description="暂无资源分配数据" />
              ),
            },
            {
              key: 'calendar',
              label: (
                <span>
                  <CalendarOutlined /> 排期日历
                </span>
              ),
              children: (
                <div style={{ padding: '0 20px' }}>
                  <Calendar
                    fullscreen={false}
                    cellRender={(date: Dayjs) => {
                      // 日历数据应该从API获取，这里暂时显示空
                      return null;
                    }}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}