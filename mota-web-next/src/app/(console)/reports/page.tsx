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
  DatePicker,
  Statistic,
  Progress,
  Tabs,
  Spin,
  Empty,
} from 'antd';
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  DownloadOutlined,
  PrinterOutlined,
  FilterOutlined,
  RiseOutlined,
  FallOutlined,
  ProjectOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CalendarOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { reportService, type ReportSummary, type MemberReport } from '@/services';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// 统一主题色 - 薄荷绿
const THEME_COLOR = '#10B981';

// 本地类型定义
interface ProjectStatItem {
  name: string;
  tasks: number;
  completed: number;
  hours: number;
  members: number;
  status: string;
}

interface MemberPerformanceItem {
  name: string;
  tasks: number;
  completed: number;
  hours: number;
  efficiency: number;
  rating: number;
}

interface WeeklyDataItem {
  week: string;
  tasks: number;
  completed: number;
  hours: number;
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState('project');
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [projectStats, setProjectStats] = useState<ProjectStatItem[]>([]);
  const [memberPerformance, setMemberPerformance] = useState<MemberPerformanceItem[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyDataItem[]>([]);

  // 获取报表数据
  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      const summary = await reportService.getReportSummary({
        startDate: timeRange === 'week' ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() :
                   timeRange === 'month' ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() :
                   timeRange === 'quarter' ? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() :
                   new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      });
      
      // 转换数据格式
      setProjectStats([]);
      setMemberPerformance(
        summary.memberStats?.topPerformers?.map(p => ({
          name: p.username,
          tasks: p.completedTasks,
          completed: p.completedTasks,
          hours: 0,
          efficiency: 0,
          rating: 0,
        })) || []
      );
      setWeeklyData(
        summary.trendData?.map((t, i) => ({
          week: `第${i + 1}周`,
          tasks: t.tasksCreated,
          completed: t.tasksCompleted,
          hours: 0,
        })) || []
      );
    } catch (error) {
      console.error('Failed to fetch report data:', error);
      setProjectStats([]);
      setMemberPerformance([]);
      setWeeklyData([]);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'on_track':
        return <Tag color="success">正常</Tag>;
      case 'at_risk':
        return <Tag color="warning">风险</Tag>;
      case 'delayed':
        return <Tag color="error">延期</Tag>;
      default:
        return <Tag>未知</Tag>;
    }
  };

  const projectColumns = [
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
      title: '任务数',
      dataIndex: 'tasks',
      key: 'tasks',
    },
    {
      title: '完成数',
      dataIndex: 'completed',
      key: 'completed',
    },
    {
      title: '完成率',
      key: 'rate',
      render: (_: any, record: any) => {
        const rate = Math.round((record.completed / record.tasks) * 100);
        return <Progress percent={rate} size="small" strokeColor={THEME_COLOR} />;
      },
    },
    {
      title: '工时',
      dataIndex: 'hours',
      key: 'hours',
      render: (value: number) => `${value}h`,
    },
    {
      title: '成员数',
      dataIndex: 'members',
      key: 'members',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
  ];

  const memberColumns = [
    {
      title: '成员',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <TeamOutlined style={{ color: THEME_COLOR }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: '任务数',
      dataIndex: 'tasks',
      key: 'tasks',
    },
    {
      title: '完成数',
      dataIndex: 'completed',
      key: 'completed',
    },
    {
      title: '工时',
      dataIndex: 'hours',
      key: 'hours',
      render: (value: number) => `${value}h`,
    },
    {
      title: '效率',
      dataIndex: 'efficiency',
      key: 'efficiency',
      render: (value: number) => (
        <Space>
          {value >= 85 ? (
            <RiseOutlined style={{ color: '#10B981' }} />
          ) : (
            <FallOutlined style={{ color: '#EF4444' }} />
          )}
          {value}%
        </Space>
      ),
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      render: (value: number) => (
        <Tag color={value >= 4.5 ? 'success' : value >= 4 ? 'processing' : 'warning'}>
          {value.toFixed(1)}
        </Tag>
      ),
    },
  ];

  // 汇总统计
  const summary = {
    totalTasks: projectStats.reduce((sum, p) => sum + (p.tasks || 0), 0),
    completedTasks: projectStats.reduce((sum, p) => sum + (p.completed || 0), 0),
    totalHours: projectStats.reduce((sum, p) => sum + (p.hours || 0), 0),
    totalMembers: memberPerformance.length,
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </div>
    );
  }

  return (
    <div>
      {/* 页面头部 */}
      <div style={{
        background: `linear-gradient(135deg, #F59E0B 0%, #D97706 100%)`,
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
            <BarChartOutlined style={{ fontSize: 24, color: '#fff' }} />
          </div>
          <div>
            <Title level={4} style={{ color: '#fff', margin: 0 }}>报表分析</Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)' }}>项目和团队数据分析报告</Text>
          </div>
        </div>
        <Space>
          <Select
            value={timeRange}
            onChange={setTimeRange}
            style={{ width: 120 }}
            options={[
              { value: 'week', label: '本周' },
              { value: 'month', label: '本月' },
              { value: 'quarter', label: '本季度' },
              { value: 'year', label: '本年' },
            ]}
          />
          <Button icon={<DownloadOutlined />} style={{ background: 'rgba(255,255,255,0.2)', borderColor: 'transparent', color: '#fff' }}>
            导出报表
          </Button>
          <Button icon={<PrinterOutlined />} style={{ background: 'rgba(255,255,255,0.2)', borderColor: 'transparent', color: '#fff' }}>
            打印
          </Button>
        </Space>
      </div>

      {/* 汇总统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="总任务数"
              value={summary.totalTasks}
              prefix={<FileTextOutlined style={{ color: '#3B82F6' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="已完成"
              value={summary.completedTasks}
              valueStyle={{ color: '#10B981' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="总工时"
              value={summary.totalHours}
              prefix={<ClockCircleOutlined style={{ color: '#8B5CF6' }} />}
              suffix="h"
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="完成率"
              value={Math.round((summary.completedTasks / summary.totalTasks) * 100)}
              prefix={<RiseOutlined style={{ color: '#F59E0B' }} />}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      {/* 报表内容 */}
      <Card style={{ borderRadius: 12 }}>
        <Tabs
          activeKey={reportType}
          onChange={setReportType}
          items={[
            {
              key: 'project',
              label: (
                <span>
                  <ProjectOutlined /> 项目报表
                </span>
              ),
              children: (
                <div>
                  {projectStats.length === 0 ? (
                    <Empty description="暂无项目报表数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  ) : (
                    <Table
                      dataSource={projectStats}
                      columns={projectColumns}
                      pagination={false}
                      rowKey="name"
                      summary={() => (
                        <Table.Summary fixed>
                          <Table.Summary.Row>
                            <Table.Summary.Cell index={0}>
                              <Text strong>合计</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={1}>
                              <Text strong>{summary.totalTasks}</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={2}>
                              <Text strong>{summary.completedTasks}</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={3}>
                              <Progress
                                percent={summary.totalTasks > 0 ? Math.round((summary.completedTasks / summary.totalTasks) * 100) : 0}
                                size="small"
                                strokeColor={THEME_COLOR}
                              />
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={4}>
                              <Text strong>{summary.totalHours}h</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={5}>-</Table.Summary.Cell>
                            <Table.Summary.Cell index={6}>-</Table.Summary.Cell>
                          </Table.Summary.Row>
                        </Table.Summary>
                      )}
                    />
                  )}
                </div>
              ),
            },
            {
              key: 'member',
              label: (
                <span>
                  <TeamOutlined /> 成员绩效
                </span>
              ),
              children: (
                memberPerformance.length === 0 ? (
                  <Empty description="暂无成员绩效数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  <Table
                    dataSource={memberPerformance}
                    columns={memberColumns}
                    pagination={false}
                    rowKey="name"
                  />
                )
              ),
            },
            {
              key: 'weekly',
              label: (
                <span>
                  <CalendarOutlined /> 周报统计
                </span>
              ),
              children: (
                <div>
                  {weeklyData.length === 0 ? (
                    <Empty description="暂无周报数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  ) : (
                    <Row gutter={[16, 16]}>
                      {weeklyData.map((week, index) => (
                        <Col xs={24} sm={12} md={6} key={index}>
                          <Card style={{ borderRadius: 12, background: '#F8FAFC' }}>
                            <div style={{ textAlign: 'center' }}>
                              <Text type="secondary">{week.week}</Text>
                              <div style={{ marginTop: 16 }}>
                                <Statistic
                                  title="任务完成"
                                  value={week.completed || 0}
                                  suffix={`/ ${week.tasks || 0}`}
                                  valueStyle={{ fontSize: 24 }}
                                />
                              </div>
                              <Progress
                                percent={week.tasks > 0 ? Math.round(((week.completed || 0) / week.tasks) * 100) : 0}
                                strokeColor={THEME_COLOR}
                                style={{ marginTop: 12 }}
                              />
                              <div style={{ marginTop: 12 }}>
                                <Text type="secondary">工时: {week.hours || 0}h</Text>
                              </div>
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </div>
              ),
            },
            {
              key: 'trend',
              label: (
                <span>
                  <LineChartOutlined /> 趋势分析
                </span>
              ),
              children: (
                <div style={{ padding: 24, textAlign: 'center' }}>
                  {weeklyData.length === 0 ? (
                    <Empty description="暂无趋势数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  ) : (
                    <>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-end',
                        gap: 24,
                        height: 200,
                        marginBottom: 24,
                      }}>
                        {weeklyData.map((week, index) => {
                          const maxCompleted = Math.max(...weeklyData.map(w => w.completed || 0), 1);
                          return (
                            <div key={index} style={{ textAlign: 'center' }}>
                              <div style={{
                                width: 60,
                                height: `${((week.completed || 0) / maxCompleted) * 150}px`,
                                background: `linear-gradient(180deg, ${THEME_COLOR} 0%, ${THEME_COLOR}80 100%)`,
                                borderRadius: 8,
                                marginBottom: 8,
                                minHeight: 10,
                              }} />
                              <Text type="secondary">{week.week}</Text>
                              <br />
                              <Text strong>{week.completed || 0}</Text>
                            </div>
                          );
                        })}
                      </div>
                      <Text type="secondary">任务完成趋势图</Text>
                    </>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}