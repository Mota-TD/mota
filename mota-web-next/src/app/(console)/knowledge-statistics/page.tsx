'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Tag,
  Space,
  DatePicker,
  Select,
  Button,
  Spin,
  Empty,
} from 'antd';
import {
  FileTextOutlined,
  TeamOutlined,
  EyeOutlined,
  DownloadOutlined,
  RiseOutlined,
  FallOutlined,
  PieChartOutlined,
  BarChartOutlined,
  LineChartOutlined,
  CloudDownloadOutlined,
} from '@ant-design/icons';
import { knowledgeService, type KnowledgeOverviewStats, type CategoryStats, type HotDocument, type Contributor, type MonthlyTrend } from '@/services';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// 统一主题色 - 薄荷绿
const THEME_COLOR = '#10B981';

export default function KnowledgeStatisticsPage() {
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [overviewStats, setOverviewStats] = useState<KnowledgeOverviewStats | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [hotDocuments, setHotDocuments] = useState<HotDocument[]>([]);
  const [topContributors, setTopContributors] = useState<Contributor[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([]);

  // 获取概览统计
  const fetchOverviewStats = useCallback(async () => {
    try {
      const data = await knowledgeService.getOverviewStats();
      setOverviewStats(data);
    } catch (error) {
      console.error('Failed to fetch overview stats:', error);
    }
  }, []);

  // 获取分类统计
  const fetchCategoryStats = useCallback(async () => {
    try {
      const data = await knowledgeService.getCategoryStats();
      setCategoryStats(data);
    } catch (error) {
      console.error('Failed to fetch category stats:', error);
    }
  }, []);

  // 获取热门文档
  const fetchHotDocuments = useCallback(async () => {
    try {
      const data = await knowledgeService.getHotDocuments(5);
      setHotDocuments(data);
    } catch (error) {
      console.error('Failed to fetch hot documents:', error);
    }
  }, []);

  // 获取贡献者排行
  const fetchTopContributors = useCallback(async () => {
    try {
      const data = await knowledgeService.getTopContributors(5);
      setTopContributors(data);
    } catch (error) {
      console.error('Failed to fetch top contributors:', error);
    }
  }, []);

  // 获取月度趋势
  const fetchMonthlyTrend = useCallback(async () => {
    try {
      const data = await knowledgeService.getMonthlyTrend(6);
      setMonthlyTrend(data);
    } catch (error) {
      console.error('Failed to fetch monthly trend:', error);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchOverviewStats(),
        fetchCategoryStats(),
        fetchHotDocuments(),
        fetchTopContributors(),
        fetchMonthlyTrend(),
      ]);
      setLoading(false);
    };
    fetchData();
  }, [fetchOverviewStats, fetchCategoryStats, fetchHotDocuments, fetchTopContributors, fetchMonthlyTrend]);

  const handleExportReport = async () => {
    try {
      const blob = await knowledgeService.exportReport(timeRange);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `knowledge-report-${timeRange}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  const documentColumns = [
    {
      title: '排名',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      render: (_: any, __: any, index: number) => (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: index < 3 ? THEME_COLOR : '#E2E8F0',
          color: index < 3 ? '#fff' : '#64748B',
          fontSize: 12,
          fontWeight: 600,
        }}>
          {index + 1}
        </span>
      ),
    },
    {
      title: '文档名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (text: string) => <Tag>{text}</Tag>,
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      render: (value: number) => (
        <Space>
          <EyeOutlined style={{ color: '#9CA3AF' }} />
          {value.toLocaleString()}
        </Space>
      ),
    },
    {
      title: '下载量',
      dataIndex: 'downloads',
      key: 'downloads',
      render: (value: number) => (
        <Space>
          <DownloadOutlined style={{ color: '#9CA3AF' }} />
          {value.toLocaleString()}
        </Space>
      ),
    },
  ];

  const contributorColumns = [
    {
      title: '排名',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      render: (_: any, __: any, index: number) => (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: index < 3 ? '#F59E0B' : '#E2E8F0',
          color: index < 3 ? '#fff' : '#64748B',
          fontSize: 12,
          fontWeight: 600,
        }}>
          {index + 1}
        </span>
      ),
    },
    {
      title: '贡献者',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Contributor) => (
        <Space>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: THEME_COLOR,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 600,
          }}>
            {record.avatar || text.charAt(0)}
          </div>
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: '文档数',
      dataIndex: 'documents',
      key: 'documents',
      render: (value: number) => (
        <Space>
          <FileTextOutlined style={{ color: '#9CA3AF' }} />
          {value}
        </Space>
      ),
    },
    {
      title: '总浏览量',
      dataIndex: 'views',
      key: 'views',
      render: (value: number) => (
        <Space>
          <EyeOutlined style={{ color: '#9CA3AF' }} />
          {value.toLocaleString()}
        </Space>
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
            <BarChartOutlined style={{ fontSize: 24, color: '#fff' }} />
          </div>
          <div>
            <Title level={4} style={{ color: '#fff', margin: 0 }}>知识统计</Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)' }}>知识库使用情况分析和统计</Text>
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
          <Button icon={<CloudDownloadOutlined />} onClick={handleExportReport} style={{ background: 'rgba(255,255,255,0.2)', borderColor: 'transparent', color: '#fff' }}>
            导出报告
          </Button>
        </Space>
      </div>

      {/* 概览统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Text type="secondary">文档总数</Text>
                <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>
                  {(overviewStats?.totalDocuments || 0).toLocaleString()}
                </div>
                <div style={{ marginTop: 8 }}>
                  {(overviewStats?.documentsTrend || 0) >= 0 ? (
                    <Text style={{ color: '#10B981' }}>
                      <RiseOutlined /> +{overviewStats?.documentsTrend || 0}%
                    </Text>
                  ) : (
                    <Text style={{ color: '#EF4444' }}>
                      <FallOutlined /> {overviewStats?.documentsTrend || 0}%
                    </Text>
                  )}
                  <Text type="secondary" style={{ marginLeft: 8 }}>较上月</Text>
                </div>
              </div>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: '#3B82F615',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3B82F6',
                fontSize: 24,
              }}>
                <FileTextOutlined />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Text type="secondary">知识库数量</Text>
                <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>
                  {(overviewStats?.totalKnowledgeBases || 0).toLocaleString()}
                </div>
                <div style={{ marginTop: 8 }}>
                  {(overviewStats?.knowledgeBasesTrend || 0) >= 0 ? (
                    <Text style={{ color: '#10B981' }}>
                      <RiseOutlined /> +{overviewStats?.knowledgeBasesTrend || 0}%
                    </Text>
                  ) : (
                    <Text style={{ color: '#EF4444' }}>
                      <FallOutlined /> {overviewStats?.knowledgeBasesTrend || 0}%
                    </Text>
                  )}
                  <Text type="secondary" style={{ marginLeft: 8 }}>较上月</Text>
                </div>
              </div>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: '#10B98115',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10B981',
                fontSize: 24,
              }}>
                <PieChartOutlined />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Text type="secondary">总浏览量</Text>
                <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>
                  {(overviewStats?.totalViews || 0).toLocaleString()}
                </div>
                <div style={{ marginTop: 8 }}>
                  {(overviewStats?.viewsTrend || 0) >= 0 ? (
                    <Text style={{ color: '#10B981' }}>
                      <RiseOutlined /> +{overviewStats?.viewsTrend || 0}%
                    </Text>
                  ) : (
                    <Text style={{ color: '#EF4444' }}>
                      <FallOutlined /> {overviewStats?.viewsTrend || 0}%
                    </Text>
                  )}
                  <Text type="secondary" style={{ marginLeft: 8 }}>较上月</Text>
                </div>
              </div>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: '#8B5CF615',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8B5CF6',
                fontSize: 24,
              }}>
                <EyeOutlined />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Text type="secondary">下载次数</Text>
                <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>
                  {(overviewStats?.totalDownloads || 0).toLocaleString()}
                </div>
                <div style={{ marginTop: 8 }}>
                  {(overviewStats?.downloadsTrend || 0) >= 0 ? (
                    <Text style={{ color: '#10B981' }}>
                      <RiseOutlined /> +{overviewStats?.downloadsTrend || 0}%
                    </Text>
                  ) : (
                    <Text style={{ color: '#EF4444' }}>
                      <FallOutlined /> {overviewStats?.downloadsTrend || 0}%
                    </Text>
                  )}
                  <Text type="secondary" style={{ marginLeft: 8 }}>较上月</Text>
                </div>
              </div>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: '#F59E0B15',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F59E0B',
                fontSize: 24,
              }}>
                <DownloadOutlined />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* 分类统计 */}
        <Col xs={24} lg={8}>
          <Card title="文档分类统计" style={{ borderRadius: 12, height: '100%' }}>
            {categoryStats.length > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }} size={16}>
                {categoryStats.map((cat, index) => (
                  <div key={index}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text>{cat.name}</Text>
                      <Text type="secondary">{cat.count} 篇 ({cat.percentage}%)</Text>
                    </div>
                    <Progress
                      percent={cat.percentage}
                      showInfo={false}
                      strokeColor={[THEME_COLOR, '#3B82F6', '#8B5CF6', '#F59E0B', '#64748B'][index % 5]}
                      trailColor="#E2E8F0"
                    />
                  </div>
                ))}
              </Space>
            ) : (
              <Empty description="暂无分类数据" />
            )}
          </Card>
        </Col>

        {/* 月度趋势 */}
        <Col xs={24} lg={16}>
          <Card title="月度趋势" style={{ borderRadius: 12, height: '100%' }}>
            {monthlyTrend.length > 0 ? (
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {monthlyTrend.map((item, index) => (
                  <div key={index} style={{ textAlign: 'center', flex: 1, minWidth: 80 }}>
                    <div style={{
                      height: 120,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      gap: 8,
                    }}>
                      <div style={{
                        width: 40,
                        height: `${Math.max((item.documents / Math.max(...monthlyTrend.map(t => t.documents), 1)) * 100, 10)}%`,
                        background: `linear-gradient(180deg, ${THEME_COLOR} 0%, ${THEME_COLOR}80 100%)`,
                        borderRadius: 4,
                        minHeight: 20,
                      }} />
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{item.month}</Text>
                    <div>
                      <Text strong style={{ fontSize: 14 }}>{item.documents}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}> 篇</Text>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="暂无趋势数据" />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 热门文档 */}
        <Col xs={24} lg={14}>
          <Card title="热门文档 TOP 5" style={{ borderRadius: 12 }}>
            {hotDocuments.length > 0 ? (
              <Table
                dataSource={hotDocuments}
                columns={documentColumns}
                pagination={false}
                rowKey="id"
                size="small"
              />
            ) : (
              <Empty description="暂无热门文档" />
            )}
          </Card>
        </Col>

        {/* 贡献者排行 */}
        <Col xs={24} lg={10}>
          <Card title="贡献者排行 TOP 5" style={{ borderRadius: 12 }}>
            {topContributors.length > 0 ? (
              <Table
                dataSource={topContributors}
                columns={contributorColumns}
                pagination={false}
                rowKey="id"
                size="small"
              />
            ) : (
              <Empty description="暂无贡献者数据" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}