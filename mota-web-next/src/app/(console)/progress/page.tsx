'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Progress,
  Table,
  Tag,
  Space,
  Select,
  Button,
  Avatar,
  Tooltip,
  Tabs,
  Timeline,
  Statistic,
  Spin,
  Empty,
} from 'antd';
import {
  LineChartOutlined,
  ProjectOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  CalendarOutlined,
  RiseOutlined,
  FallOutlined,
  FilterOutlined,
  DownloadOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { progressService, type ProjectProgress, type Milestone, type Activity, type ProgressStats } from '@/services';

const { Title, Text } = Typography;

// 统一主题色 - 薄荷绿
const THEME_COLOR = '#10B981';

export default function ProgressPage() {
  const [selectedProject, setSelectedProject] = useState('all');
  const [loading, setLoading] = useState(true);
  const [projectProgress, setProjectProgress] = useState<ProjectProgress[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<ProgressStats | null>(null);

  // 获取项目进度
  const fetchProjectProgress = useCallback(async () => {
    try {
      const data = await progressService.getProjectProgress(selectedProject === 'all' ? undefined : selectedProject);
      setProjectProgress(data);
    } catch (error) {
      console.error('Failed to fetch project progress:', error);
      setProjectProgress([]);
    }
  }, [selectedProject]);

  // 获取进度统计
  const fetchStats = useCallback(async () => {
    try {
      const data = await progressService.getProgressStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch progress stats:', error);
    }
  }, []);

  // 获取里程碑
  const fetchMilestones = useCallback(async () => {
    try {
      const data = await progressService.getMilestones(undefined, 5);
      setMilestones(data);
    } catch (error) {
      console.error('Failed to fetch milestones:', error);
      setMilestones([]);
    }
  }, []);

  // 获取最近活动
  const fetchRecentActivities = useCallback(async () => {
    try {
      const data = await progressService.getRecentActivities(5);
      setRecentActivities(data);
    } catch (error) {
      console.error('Failed to fetch recent activities:', error);
      setRecentActivities([]);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchProjectProgress(),
        fetchStats(),
        fetchMilestones(),
        fetchRecentActivities(),
      ]);
      setLoading(false);
    };
    fetchData();
  }, [fetchProjectProgress, fetchStats, fetchMilestones, fetchRecentActivities]);

  const handleRefresh = () => {
    fetchProjectProgress();
    fetchStats();
    fetchMilestones();
    fetchRecentActivities();
  };

  const handleExport = async () => {
    try {
      const blob = await progressService.exportProgressReport(selectedProject === 'all' ? undefined : selectedProject);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'progress-report.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'on_track':
        return <Tag color="success" icon={<CheckCircleOutlined />}>正常</Tag>;
      case 'at_risk':
        return <Tag color="warning" icon={<ExclamationCircleOutlined />}>风险</Tag>;
      case 'delayed':
        return <Tag color="error" icon={<ClockCircleOutlined />}>延期</Tag>;
      default:
        return <Tag>未知</Tag>;
    }
  };

  const getMilestoneStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: 'green', text: '已完成' };
      case 'in_progress':
        return { color: 'blue', text: '进行中' };
      default:
        return { color: 'gray', text: '待开始' };
    }
  };

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <ProjectOutlined style={{ color: THEME_COLOR }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 200,
      render: (value: number, record: ProjectProgress) => (
        <div>
          <Progress
            percent={value}
            size="small"
            strokeColor={
              record.status === 'delayed' ? '#EF4444' :
              record.status === 'at_risk' ? '#F59E0B' : THEME_COLOR
            }
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
      title: '任务完成',
      dataIndex: 'tasks',
      key: 'tasks',
      render: (tasks: { total: number; completed: number }) => (
        <Text>{tasks.completed}/{tasks.total}</Text>
      ),
    },
    {
      title: '时间范围',
      key: 'dateRange',
      render: (_: any, record: ProjectProgress) => (
        <Text type="secondary">
          {record.startDate} ~ {record.endDate}
        </Text>
      ),
    },
    {
      title: '团队',
      dataIndex: 'team',
      key: 'team',
      render: (team: string[]) => (
        <Avatar.Group maxCount={3} size="small">
          {team.map((member, index) => (
            <Tooltip key={index} title={member}>
              <Avatar style={{ backgroundColor: THEME_COLOR }} size="small">
                {member.charAt(0)}
              </Avatar>
            </Tooltip>
          ))}
        </Avatar.Group>
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
        background: `linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)`,
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
            <LineChartOutlined style={{ fontSize: 24, color: '#fff' }} />
          </div>
          <div>
            <Title level={4} style={{ color: '#fff', margin: 0 }}>进度跟踪</Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)' }}>实时监控项目进度和里程碑</Text>
          </div>
        </div>
        <Space>
          <Select
            value={selectedProject}
            onChange={setSelectedProject}
            style={{ width: 160 }}
            options={[
              { value: 'all', label: '全部项目' },
              ...projectProgress.map(p => ({ value: p.id, label: p.name })),
            ]}
          />
          <Button icon={<SyncOutlined />} onClick={handleRefresh} style={{ background: 'rgba(255,255,255,0.2)', borderColor: 'transparent', color: '#fff' }}>
            刷新
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport} style={{ background: 'rgba(255,255,255,0.2)', borderColor: 'transparent', color: '#fff' }}>
            导出
          </Button>
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="项目总数"
              value={stats?.total || 0}
              prefix={<ProjectOutlined style={{ color: '#3B82F6' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="正常进行"
              value={stats?.onTrack || 0}
              valueStyle={{ color: '#10B981' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="存在风险"
              value={stats?.atRisk || 0}
              valueStyle={{ color: '#F59E0B' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="平均进度"
              value={stats?.avgProgress || 0}
              suffix="%"
              prefix={<RiseOutlined style={{ color: THEME_COLOR }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 项目进度表 */}
        <Col xs={24} lg={16}>
          <Card title="项目进度概览" style={{ borderRadius: 12 }}>
            {projectProgress.length > 0 ? (
              <Table
                dataSource={projectProgress}
                columns={columns}
                pagination={false}
                rowKey="id"
              />
            ) : (
              <Empty description="暂无项目进度数据" />
            )}
          </Card>
        </Col>

        {/* 右侧面板 */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: '100%' }} size={16}>
            {/* 里程碑 */}
            <Card title="近期里程碑" style={{ borderRadius: 12 }}>
              {milestones.length > 0 ? (
                <Timeline
                  items={milestones.map(m => {
                    const status = getMilestoneStatus(m.status);
                    return {
                      color: status.color,
                      children: (
                        <div>
                          <Text strong>{m.name}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {m.project} · {m.date}
                          </Text>
                          <br />
                          <Tag color={status.color} style={{ marginTop: 4 }}>{status.text}</Tag>
                        </div>
                      ),
                    };
                  })}
                />
              ) : (
                <Empty description="暂无里程碑" />
              )}
            </Card>

            {/* 最近活动 */}
            <Card title="最近活动" style={{ borderRadius: 12 }}>
              {recentActivities.length > 0 ? (
                <Space direction="vertical" style={{ width: '100%' }} size={12}>
                  {recentActivities.map(activity => (
                    <div key={activity.id} style={{ display: 'flex', gap: 12 }}>
                      <Avatar style={{ backgroundColor: THEME_COLOR, flexShrink: 0 }} size="small">
                        {activity.user.charAt(0)}
                      </Avatar>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div>
                          <Text strong>{activity.user}</Text>
                          <Text type="secondary"> {activity.action} </Text>
                          <Text>{activity.target}</Text>
                        </div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {activity.project} · {activity.time}
                        </Text>
                      </div>
                    </div>
                  ))}
                </Space>
              ) : (
                <Empty description="暂无活动记录" />
              )}
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
}