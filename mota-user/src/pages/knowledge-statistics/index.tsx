import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Tabs,
  DatePicker,
  Select,
  Button,
  Space,
  Progress,
  List,
  Typography,
  Badge,
  Tooltip,
  Modal,
  Form,
  Input,
  message,
  Empty,
  Spin
} from 'antd';
import {
  EyeOutlined,
  FireOutlined,
  RiseOutlined,
  SearchOutlined,
  ShareAltOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  FileTextOutlined,
  UserOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  CloudOutlined,
  ExclamationCircleOutlined,
  PlusOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import styles from './index.module.css';
import * as knowledgeStatisticsApi from '@/services/api/knowledgeStatistics';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

const KnowledgeStatisticsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs()
  ]);
  const [projectId, setProjectId] = useState<number | undefined>(undefined);
  
  // 数据状态
  const [overview, setOverview] = useState<knowledgeStatisticsApi.KnowledgeStatsOverview | null>(null);
  const [hotDocuments, setHotDocuments] = useState<knowledgeStatisticsApi.DocumentRanking[]>([]);
  const [accessTrend, setAccessTrend] = useState<Array<{ date: string; viewCount: number; uniqueVisitors: number }>>([]);
  const [hotKeywords, setHotKeywords] = useState<knowledgeStatisticsApi.SearchKeywordStats[]>([]);
  const [knowledgeGaps, setKnowledgeGaps] = useState<knowledgeStatisticsApi.KnowledgeGap[]>([]);
  const [gapStats, setGapStats] = useState<Record<string, number>>({});
  const [reuseStats, setReuseStats] = useState<Record<string, number>>({});
  const [reuseDistribution, setReuseDistribution] = useState<Array<{ reuseType: string; count: number }>>([]);
  
  // 模态框状态
  const [gapModalVisible, setGapModalVisible] = useState(false);
  const [gapForm] = Form.useForm();

  // 防止重复请求的 ref
  const loadingDataRef = useRef(false);
  const lastParamsRef = useRef<string>('');

  // 加载数据
  useEffect(() => {
    const paramsKey = `${dateRange[0].format('YYYY-MM-DD')}-${dateRange[1].format('YYYY-MM-DD')}-${projectId}`;
    if (loadingDataRef.current && lastParamsRef.current === paramsKey) {
      return;
    }
    lastParamsRef.current = paramsKey;
    loadData();
  }, [dateRange, projectId]);

  const loadData = async () => {
    if (loadingDataRef.current) {
      return;
    }
    loadingDataRef.current = true;
    setLoading(true);
    try {
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');

      // 加载概览数据
      const overviewData = await knowledgeStatisticsApi.getKnowledgeStatsOverview(projectId, startDate, endDate);
      setOverview(overviewData);

      // 加载热门文档
      const hotDocsData = await knowledgeStatisticsApi.getHotDocuments(projectId, 'daily', 10);
      setHotDocuments(hotDocsData);

      // 加载访问趋势
      const trendData = await knowledgeStatisticsApi.getAccessTrend(projectId, startDate, endDate, 'day');
      setAccessTrend(trendData);

      // 加载热门搜索词
      const keywordsData = await knowledgeStatisticsApi.getHotKeywords(projectId, startDate, endDate, 20);
      setHotKeywords(keywordsData);

      // 加载知识缺口
      const gapsData = await knowledgeStatisticsApi.getKnowledgeGaps({ projectId, page: 1, pageSize: 10 });
      setKnowledgeGaps(gapsData.records || []);

      // 加载缺口统计
      const gapStatsData = await knowledgeStatisticsApi.getGapStats(projectId);
      setGapStats(gapStatsData);

      // 加载复用统计
      const reuseStatsData = await knowledgeStatisticsApi.getReuseStats(projectId, startDate, endDate);
      setReuseStats(reuseStatsData);

      // 加载复用分布
      const reuseDistData = await knowledgeStatisticsApi.getReuseTypeDistribution(projectId, startDate, endDate);
      setReuseDistribution(reuseDistData);

    } catch (error) {
      console.error('加载数据失败:', error);
      message.error('加载数据失败');
    } finally {
      setLoading(false);
      loadingDataRef.current = false;
    }
  };

  // 创建知识缺口
  const handleCreateGap = async (values: Record<string, unknown>) => {
    try {
      await knowledgeStatisticsApi.createKnowledgeGap({
        ...values,
        projectId
      } as Partial<knowledgeStatisticsApi.KnowledgeGap>);
      message.success('知识缺口已创建');
      setGapModalVisible(false);
      gapForm.resetFields();
      loadData();
    } catch (error) {
      message.error('创建失败');
    }
  };

  // 更新缺口状态
  const handleUpdateGapStatus = async (gapId: number, status: string) => {
    try {
      await knowledgeStatisticsApi.updateGapStatus(gapId, { status });
      message.success('状态已更新');
      loadData();
    } catch (error) {
      message.error('更新失败');
    }
  };

  // 热门文档表格列
  const hotDocumentsColumns = [
    {
      title: '排名',
      dataIndex: 'rankPosition',
      key: 'rankPosition',
      width: 60,
      render: (rank: number) => (
        <span className={styles.rank}>
          {rank <= 3 ? <TrophyOutlined style={{ color: rank === 1 ? '#ffd700' : rank === 2 ? '#c0c0c0' : '#cd7f32' }} /> : rank}
        </span>
      )
    },
    {
      title: '文档',
      dataIndex: 'documentTitle',
      key: 'documentTitle',
      ellipsis: true,
      render: (title: string, record: knowledgeStatisticsApi.DocumentRanking) => (
        <Space>
          <FileTextOutlined />
          <Text>{title || `文档 #${record.documentId}`}</Text>
        </Space>
      )
    },
    {
      title: '浏览量',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 100,
      render: (count: number) => <Statistic value={count} valueStyle={{ fontSize: 14 }} />
    },
    {
      title: '访客数',
      dataIndex: 'uniqueVisitors',
      key: 'uniqueVisitors',
      width: 100,
      render: (count: number) => <Statistic value={count} valueStyle={{ fontSize: 14 }} />
    },
    {
      title: '变化',
      dataIndex: 'rankChange',
      key: 'rankChange',
      width: 80,
      render: (change: number) => (
        <span style={{ color: change > 0 ? '#52c41a' : change < 0 ? '#ff4d4f' : '#8c8c8c' }}>
          {change > 0 ? `↑${change}` : change < 0 ? `↓${Math.abs(change)}` : '-'}
        </span>
      )
    }
  ];

  // 热门搜索词表格列
  const hotKeywordsColumns = [
    {
      title: '关键词',
      dataIndex: 'keyword',
      key: 'keyword',
      render: (keyword: string) => <Tag color="blue">{keyword}</Tag>
    },
    {
      title: '搜索次数',
      dataIndex: 'searchCount',
      key: 'searchCount',
      width: 100
    },
    {
      title: '点击次数',
      dataIndex: 'clickCount',
      key: 'clickCount',
      width: 100
    },
    {
      title: '点击率',
      dataIndex: 'clickRate',
      key: 'clickRate',
      width: 120,
      render: (rate: number) => (
        <Progress 
          percent={Math.round(rate * 100)} 
          size="small" 
          status={rate < 0.1 ? 'exception' : 'normal'}
        />
      )
    }
  ];

  // 知识缺口表格列
  const knowledgeGapsColumns = [
    {
      title: '类型',
      dataIndex: 'gapType',
      key: 'gapType',
      width: 120,
      render: (type: string) => (
        <Tag color={type === 'search_no_result' ? 'red' : type === 'frequent_question' ? 'orange' : 'blue'}>
          {knowledgeStatisticsApi.formatGapType(type)}
        </Tag>
      )
    },
    {
      title: '关键词/描述',
      dataIndex: 'keyword',
      key: 'keyword',
      ellipsis: true,
      render: (keyword: string, record: knowledgeStatisticsApi.KnowledgeGap) => (
        <Tooltip title={record.description}>
          <Text>{keyword || record.description}</Text>
        </Tooltip>
      )
    },
    {
      title: '出现次数',
      dataIndex: 'occurrenceCount',
      key: 'occurrenceCount',
      width: 100
    },
    {
      title: '影响用户',
      dataIndex: 'affectedUsers',
      key: 'affectedUsers',
      width: 100
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority: string) => (
        <Tag color={knowledgeStatisticsApi.getPriorityColor(priority)}>
          {knowledgeStatisticsApi.formatPriority(priority)}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Badge 
          status={status === 'open' ? 'error' : status === 'in_progress' ? 'processing' : status === 'resolved' ? 'success' : 'default'}
          text={knowledgeStatisticsApi.formatGapStatus(status)}
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: knowledgeStatisticsApi.KnowledgeGap) => (
        <Space size="small">
          {record.status === 'open' && (
            <Button size="small" type="link" onClick={() => handleUpdateGapStatus(record.id, 'in_progress')}>
              处理
            </Button>
          )}
          {record.status === 'in_progress' && (
            <Button size="small" type="link" onClick={() => handleUpdateGapStatus(record.id, 'resolved')}>
              解决
            </Button>
          )}
          {record.status !== 'ignored' && record.status !== 'resolved' && (
            <Button size="small" type="link" danger onClick={() => handleUpdateGapStatus(record.id, 'ignored')}>
              忽略
            </Button>
          )}
        </Space>
      )
    }
  ];

  // 渲染概览卡片
  const renderOverviewCards = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={6}>
        <Card className={styles.statCard}>
          <Statistic
            title="总浏览量"
            value={overview?.access?.trend?.reduce((sum, item) => sum + item.viewCount, 0) || 0}
            prefix={<EyeOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card className={styles.statCard}>
          <Statistic
            title="独立访客"
            value={overview?.access?.trend?.reduce((sum, item) => sum + item.uniqueVisitors, 0) || 0}
            prefix={<UserOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card className={styles.statCard}>
          <Statistic
            title="搜索次数"
            value={overview?.search?.totalSearches || 0}
            prefix={<SearchOutlined />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card className={styles.statCard}>
          <Statistic
            title="知识复用"
            value={overview?.reuse?.totalReuses || 0}
            prefix={<ShareAltOutlined />}
            valueStyle={{ color: '#fa8c16' }}
          />
        </Card>
      </Col>
    </Row>
  );

  // 渲染访问趋势图表（简化版，使用进度条模拟）
  const renderAccessTrend = () => (
    <Card title={<><LineChartOutlined /> 访问趋势</>} className={styles.chartCard}>
      {accessTrend.length > 0 ? (
        <div className={styles.trendChart}>
          {accessTrend.slice(-14).map((item, index) => (
            <div key={index} className={styles.trendItem}>
              <div className={styles.trendBar}>
                <div 
                  className={styles.trendBarFill} 
                  style={{ 
                    height: `${Math.min(100, (item.viewCount / Math.max(...accessTrend.map(t => t.viewCount))) * 100)}%` 
                  }}
                />
              </div>
              <Text type="secondary" className={styles.trendDate}>
                {dayjs(item.date).format('MM/DD')}
              </Text>
            </div>
          ))}
        </div>
      ) : (
        <Empty description="暂无数据" />
      )}
    </Card>
  );

  // 渲染搜索热词云（简化版）
  const renderKeywordCloud = () => (
    <Card title={<><CloudOutlined /> 搜索热词</>} className={styles.chartCard}>
      {hotKeywords.length > 0 ? (
        <div className={styles.keywordCloud}>
          {hotKeywords.slice(0, 20).map((item, index) => (
            <Tag 
              key={index} 
              color={index < 3 ? 'red' : index < 6 ? 'orange' : index < 10 ? 'blue' : 'default'}
              className={styles.keywordTag}
              style={{ fontSize: Math.max(12, 20 - index) }}
            >
              {item.keyword}
            </Tag>
          ))}
        </div>
      ) : (
        <Empty description="暂无数据" />
      )}
    </Card>
  );

  // 渲染复用统计
  const renderReuseStats = () => (
    <Card title={<><PieChartOutlined /> 复用统计</>} className={styles.chartCard}>
      <Row gutter={16}>
        <Col span={12}>
          <Statistic
            title="总复用次数"
            value={reuseStats.totalReuses || 0}
            prefix={<ShareAltOutlined />}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="复用率"
            value={(reuseStats.reuseRate || 0) * 100}
            suffix="%"
            precision={1}
          />
        </Col>
      </Row>
      <div className={styles.reuseDistribution}>
        {reuseDistribution.map((item, index) => (
          <div key={index} className={styles.reuseItem}>
            <Text>{knowledgeStatisticsApi.formatReuseType(item.reuseType)}</Text>
            <Progress 
              percent={Math.round((item.count / (reuseStats.totalReuses || 1)) * 100)} 
              size="small"
              strokeColor={['#1890ff', '#52c41a', '#faad14', '#722ed1'][index % 4]}
            />
          </div>
        ))}
      </div>
    </Card>
  );

  // 渲染知识缺口统计
  const renderGapStats = () => (
    <Card 
      title={<><WarningOutlined /> 知识缺口</>} 
      className={styles.chartCard}
      extra={
        <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setGapModalVisible(true)}>
          新增缺口
        </Button>
      }
    >
      <Row gutter={16}>
        <Col span={6}>
          <Statistic
            title="待处理"
            value={gapStats.openGaps || 0}
            valueStyle={{ color: '#ff4d4f' }}
            prefix={<ExclamationCircleOutlined />}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="处理中"
            value={gapStats.inProgressGaps || 0}
            valueStyle={{ color: '#1890ff' }}
            prefix={<ClockCircleOutlined />}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="已解决"
            value={gapStats.resolvedGaps || 0}
            valueStyle={{ color: '#52c41a' }}
            prefix={<CheckCircleOutlined />}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="紧急"
            value={gapStats.criticalGaps || 0}
            valueStyle={{ color: '#ff4d4f' }}
            prefix={<FireOutlined />}
          />
        </Col>
      </Row>
    </Card>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={4}>
          <BarChartOutlined /> 知识使用统计
        </Title>
        <Space>
          <Select
            placeholder="选择项目"
            allowClear
            style={{ width: 200 }}
            value={projectId}
            onChange={setProjectId}
          >
            <Select.Option value={1}>项目一</Select.Option>
            <Select.Option value={2}>项目二</Select.Option>
          </Select>
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setDateRange([dates[0], dates[1]]);
              }
            }}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={loadData}>
            查询
          </Button>
        </Space>
      </div>

      <Spin spinning={loading}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={<><BarChartOutlined /> 概览</>} key="overview">
            {renderOverviewCards()}
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col xs={24} lg={16}>
                {renderAccessTrend()}
              </Col>
              <Col xs={24} lg={8}>
                {renderGapStats()}
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col xs={24} lg={12}>
                {renderKeywordCloud()}
              </Col>
              <Col xs={24} lg={12}>
                {renderReuseStats()}
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={<><FireOutlined /> 热门排行</>} key="ranking">
            <Card title="热门文档排行榜">
              <Table
                columns={hotDocumentsColumns}
                dataSource={hotDocuments}
                rowKey="id"
                pagination={false}
              />
            </Card>
          </TabPane>

          <TabPane tab={<><LineChartOutlined /> 访问趋势</>} key="trend">
            <Card title="访问趋势分析">
              {renderAccessTrend()}
              <Table
                columns={[
                  { title: '日期', dataIndex: 'date', key: 'date' },
                  { title: '浏览量', dataIndex: 'viewCount', key: 'viewCount' },
                  { title: '访客数', dataIndex: 'uniqueVisitors', key: 'uniqueVisitors' },
                  { title: '平均时长(秒)', dataIndex: 'avgDuration', key: 'avgDuration' }
                ]}
                dataSource={accessTrend}
                rowKey="date"
                pagination={{ pageSize: 10 }}
                style={{ marginTop: 16 }}
              />
            </Card>
          </TabPane>

          <TabPane tab={<><ShareAltOutlined /> 复用率</>} key="reuse">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                {renderReuseStats()}
              </Col>
              <Col xs={24} lg={12}>
                <Card title="高复用文档">
                  <List
                    dataSource={overview?.reuse?.topDocuments || []}
                    renderItem={(item: { documentId: number; reuseCount: number }) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<FileTextOutlined />}
                          title={`文档 #${item.documentId}`}
                          description={`复用次数: ${item.reuseCount}`}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={<><SearchOutlined /> 搜索热词</>} key="search">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                {renderKeywordCloud()}
              </Col>
              <Col xs={24} lg={12}>
                <Card title="热门搜索词详情">
                  <Table
                    columns={hotKeywordsColumns}
                    dataSource={hotKeywords}
                    rowKey="keyword"
                    pagination={{ pageSize: 10 }}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={<><WarningOutlined /> 知识缺口</>} key="gaps">
            {renderGapStats()}
            <Card title="知识缺口列表" style={{ marginTop: 16 }}>
              <Table
                columns={knowledgeGapsColumns}
                dataSource={knowledgeGaps}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </TabPane>
        </Tabs>
      </Spin>

      {/* 新增知识缺口模态框 */}
      <Modal
        title="新增知识缺口"
        open={gapModalVisible}
        onCancel={() => setGapModalVisible(false)}
        onOk={() => gapForm.submit()}
      >
        <Form form={gapForm} layout="vertical" onFinish={handleCreateGap}>
          <Form.Item
            name="gapType"
            label="缺口类型"
            rules={[{ required: true, message: '请选择缺口类型' }]}
          >
            <Select>
              <Select.Option value="search_no_result">搜索无结果</Select.Option>
              <Select.Option value="frequent_question">频繁问题</Select.Option>
              <Select.Option value="missing_topic">缺失主题</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="keyword"
            label="关键词"
          >
            <Input placeholder="相关关键词" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <TextArea rows={3} placeholder="详细描述知识缺口" />
          </Form.Item>
          <Form.Item
            name="priority"
            label="优先级"
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Select>
              <Select.Option value="low">低</Select.Option>
              <Select.Option value="medium">中</Select.Option>
              <Select.Option value="high">高</Select.Option>
              <Select.Option value="critical">紧急</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default KnowledgeStatisticsPage;