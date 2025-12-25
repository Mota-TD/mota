import { useState, useEffect } from 'react'
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Tag, 
  Space, 
  Button, 
  Input,
  Select,
  List,
  Avatar,
  Tabs,
  Badge,
  Tooltip,
  message,
  Empty,
  Spin,
  Modal,
  Form,
  Switch,
  Checkbox,
  TimePicker,
  Slider,
  Progress,
  Statistic,
  Drawer,
  Tree,
  Divider
} from 'antd'
import { 
  GlobalOutlined, 
  SearchOutlined, 
  StarOutlined,
  StarFilled,
  ShareAltOutlined,
  LinkOutlined,
  ClockCircleOutlined,
  FireOutlined,
  SyncOutlined,
  FilterOutlined,
  BellOutlined,
  SettingOutlined,
  RobotOutlined,
  FileTextOutlined,
  PlusOutlined,
  FolderOutlined,
  TagsOutlined,
  AimOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  RiseOutlined,
  FallOutlined,
  MinusOutlined,
  TeamOutlined,
  BankOutlined,
  AppstoreOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import styles from './index.module.css'

const { Title, Text, Paragraph } = Typography

// 模拟数据类型
interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishTime: string;
  category: string;
  tags: string[];
  url: string;
  isStarred: boolean;
  relevance: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
  isPolicy?: boolean;
  policyLevel?: string;
}

interface HotTopic {
  name: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  change: string;
}

interface IndustryConfig {
  id: number;
  code: string;
  name: string;
  confidence: number;
  isPrimary: boolean;
}

interface BusinessDomain {
  id: number;
  name: string;
  type: string;
  importance: number;
  isCore: boolean;
}

interface PolicyMonitor {
  id: number;
  name: string;
  keywords: string[];
  matchedCount: number;
  isEnabled: boolean;
}

/**
 * AI智能新闻推送页面
 * 实现 NW-001 到 NW-009 功能
 */
const AINews = () => {
  const [activeTab, setActiveTab] = useState('recommended')
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [newsData, setNewsData] = useState<NewsItem[]>([])
  const [total, setTotal] = useState(0)
  
  // 设置相关状态
  const [settingsVisible, setSettingsVisible] = useState(false)
  const [industryDrawerVisible, setIndustryDrawerVisible] = useState(false)
  const [policyDrawerVisible, setPolicyDrawerVisible] = useState(false)
  const [favoriteDrawerVisible, setFavoriteDrawerVisible] = useState(false)
  
  // 配置数据
  const [industries, setIndustries] = useState<IndustryConfig[]>([
    { id: 1, code: 'IT', name: '信息技术', confidence: 95, isPrimary: true },
    { id: 2, code: 'FINANCE', name: '金融服务', confidence: 75, isPrimary: false }
  ])
  const [businessDomains, setBusinessDomains] = useState<BusinessDomain[]>([
    { id: 1, name: '企业级SaaS产品', type: 'product', importance: 10, isCore: true },
    { id: 2, name: 'AI技术研发', type: 'technology', importance: 8, isCore: true }
  ])
  const [policyMonitors, setPolicyMonitors] = useState<PolicyMonitor[]>([
    { id: 1, name: '数字经济政策', keywords: ['数字经济', '数字化转型'], matchedCount: 15, isEnabled: true },
    { id: 2, name: 'AI行业监管', keywords: ['人工智能', '算法监管'], matchedCount: 8, isEnabled: true }
  ])
  const [hotTopics, setHotTopics] = useState<HotTopic[]>([
    { name: 'AI大模型', count: 1256, trend: 'up', change: '+15%' },
    { name: '数字化转型', count: 892, trend: 'up', change: '+8%' },
    { name: '企业服务', count: 756, trend: 'stable', change: '+2%' },
    { name: '云计算', count: 623, trend: 'up', change: '+12%' },
    { name: '数据安全', count: 512, trend: 'up', change: '+20%' }
  ])
  
  // 推送配置
  const [pushConfig, setPushConfig] = useState({
    enabled: true,
    frequency: 'daily',
    time: '09:00',
    channels: ['email', 'app'],
    minMatchScore: 70
  })

  // 加载新闻数据
  useEffect(() => {
    loadNews()
  }, [activeTab])

  const loadNews = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockNews: NewsItem[] = [
        {
          id: '1',
          title: 'AI大模型在企业服务领域的最新应用进展',
          summary: '随着人工智能技术的快速发展，大模型在各行业的应用场景不断拓展，本文介绍了AI大模型在企业服务、医疗健康、金融科技等领域的最新应用进展。',
          source: '36氪',
          publishTime: '2小时前',
          category: '科技',
          tags: ['AI', '大模型', '企业服务'],
          url: 'https://36kr.com/article/1',
          isStarred: false,
          relevance: 95,
          sentiment: 'positive'
        },
        {
          id: '2',
          title: '国务院发布关于促进数字经济发展的指导意见',
          summary: '为加快数字经济发展，推动数字技术与实体经济深度融合，国务院发布最新指导意见，明确了未来五年数字经济发展的主要目标和重点任务。',
          source: '中国政府网',
          publishTime: '3小时前',
          category: '政策',
          tags: ['数字经济', '政策', '产业发展'],
          url: 'http://www.gov.cn/policy/1',
          isStarred: true,
          relevance: 92,
          isPolicy: true,
          policyLevel: 'national'
        },
        {
          id: '3',
          title: 'SaaS企业如何实现数字化转型升级',
          summary: '本文深入分析了SaaS企业在数字化转型过程中面临的挑战和机遇，并提供了可行的解决方案和最佳实践案例。',
          source: '虎嗅',
          publishTime: '5小时前',
          category: '行业动态',
          tags: ['SaaS', '数字化转型', '企业管理'],
          url: 'https://huxiu.com/article/1',
          isStarred: false,
          relevance: 88,
          sentiment: 'neutral'
        },
        {
          id: '4',
          title: '2024年企业级AI应用市场分析报告',
          summary: '艾瑞咨询发布最新报告，详细分析了企业级AI应用市场的发展现状、竞争格局和未来趋势，预计市场规模将在未来三年内翻倍。',
          source: '艾瑞咨询',
          publishTime: '1天前',
          category: '市场分析',
          tags: ['AI', '市场分析', '企业服务'],
          url: 'https://iresearch.cn/report/1',
          isStarred: false,
          relevance: 85,
          sentiment: 'positive'
        },
        {
          id: '5',
          title: '工信部发布人工智能行业规范指南',
          summary: '工信部正式发布人工智能行业规范指南，对AI算法、数据安全、伦理规范等方面提出了明确要求，将对行业发展产生深远影响。',
          source: '工信部',
          publishTime: '1天前',
          category: '政策',
          tags: ['AI', '监管', '行业规范'],
          url: 'https://miit.gov.cn/policy/1',
          isStarred: true,
          relevance: 90,
          isPolicy: true,
          policyLevel: 'national'
        }
      ]
      
      setNewsData(mockNews)
      setTotal(mockNews.length)
    } catch (error) {
      console.error('Failed to load news:', error)
      message.error('加载新闻失败')
    } finally {
      setLoading(false)
    }
  }

  // 搜索
  const handleSearch = () => {
    loadNews()
  }

  // 刷新新闻
  const handleRefresh = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await loadNews()
      message.success('新闻已更新')
    } catch (error) {
      message.error('刷新失败')
    } finally {
      setLoading(false)
    }
  }

  // 收藏/取消收藏
  const handleStar = async (id: string) => {
    setNewsData(newsData.map(item => 
      item.id === id ? { ...item, isStarred: !item.isStarred } : item
    ))
    message.success('操作成功')
  }

  // 分享
  const handleShare = (item: NewsItem) => {
    navigator.clipboard.writeText(item.url)
    message.success('链接已复制')
  }

  // 获取趋势图标
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <RiseOutlined style={{ color: '#52c41a' }} />
      case 'down':
        return <FallOutlined style={{ color: '#f5222d' }} />
      default:
        return <MinusOutlined style={{ color: '#faad14' }} />
    }
  }

  // 分类配置
  const categories = [
    { key: 'recommended', label: '智能推荐', icon: <ThunderboltOutlined /> },
    { key: 'policy', label: '政策监控', icon: <SafetyCertificateOutlined /> },
    { key: 'industry', label: '行业动态', icon: <GlobalOutlined /> },
    { key: 'technology', label: '科技资讯', icon: <RobotOutlined /> },
    { key: 'favorites', label: '我的收藏', icon: <StarOutlined /> }
  ]

  // 新闻卡片
  const NewsCard = ({ item }: { item: NewsItem }) => (
    <Card className={styles.newsCard} hoverable>
      <div className={styles.newsHeader}>
        <Space>
          <Avatar size="small" style={{ background: item.isPolicy ? '#faad14' : '#1890ff' }}>
            {item.isPolicy ? <FileTextOutlined /> : item.source.charAt(0)}
          </Avatar>
          <Text type="secondary">{item.source}</Text>
          <Text type="secondary">·</Text>
          <Text type="secondary">
            <ClockCircleOutlined /> {item.publishTime}
          </Text>
          {item.isPolicy && (
            <Tag color="gold" icon={<SafetyCertificateOutlined />}>
              {item.policyLevel === 'national' ? '国家级' : '地方级'}政策
            </Tag>
          )}
        </Space>
        <Space>
          <Tooltip title="匹配度">
            <Tag color={item.relevance >= 90 ? 'red' : item.relevance >= 80 ? 'orange' : 'blue'}>
              <AimOutlined /> {item.relevance}%
            </Tag>
          </Tooltip>
          {item.sentiment && (
            <Tag color={item.sentiment === 'positive' ? 'green' : item.sentiment === 'negative' ? 'red' : 'default'}>
              {item.sentiment === 'positive' ? '正面' : item.sentiment === 'negative' ? '负面' : '中性'}
            </Tag>
          )}
          <Tooltip title={item.isStarred ? '取消收藏' : '收藏'}>
            <Button 
              type="text" 
              icon={item.isStarred ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
              onClick={() => handleStar(item.id)}
            />
          </Tooltip>
        </Space>
      </div>
      <Title level={5} className={styles.newsTitle}>
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          {item.title}
        </a>
      </Title>
      <Paragraph type="secondary" ellipsis={{ rows: 2 }} className={styles.newsSummary}>
        {item.summary}
      </Paragraph>
      <div className={styles.newsFooter}>
        <Space wrap>
          {item.tags.map(tag => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </Space>
        <Space>
          <Tooltip title="分享">
            <Button type="text" size="small" icon={<ShareAltOutlined />} onClick={() => handleShare(item)} />
          </Tooltip>
          <Tooltip title="打开链接">
            <Button type="text" size="small" icon={<LinkOutlined />} href={item.url} target="_blank" />
          </Tooltip>
        </Space>
      </div>
    </Card>
  )

  // 统计卡片
  const StatCard = ({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) => (
    <Card className={styles.statCard}>
      <div className={styles.statIcon} style={{ background: color }}>
        {icon}
      </div>
      <Statistic title={title} value={value} />
    </Card>
  )

  return (
    <div className={styles.container}>
      {/* 页面头部 */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <GlobalOutlined className={styles.headerIcon} />
          <div>
            <Title level={4} style={{ margin: 0 }}>智能新闻推送</Title>
            <Text type="secondary">AI自动追踪与您业务相关的行业新闻和政策动态</Text>
          </div>
        </div>
        <Space>
          <Button icon={<BankOutlined />} onClick={() => setIndustryDrawerVisible(true)}>
            行业配置
          </Button>
          <Button icon={<SafetyCertificateOutlined />} onClick={() => setPolicyDrawerVisible(true)}>
            政策监控
          </Button>
          <Button icon={<SettingOutlined />} onClick={() => setSettingsVisible(true)}>
            推送设置
          </Button>
          <Button icon={<SyncOutlined spin={loading} />} onClick={handleRefresh}>
            刷新
          </Button>
        </Space>
      </div>

      {/* 统计概览 */}
      <Row gutter={16} className={styles.statsRow}>
        <Col xs={12} sm={6}>
          <StatCard title="今日新闻" value={128} icon={<FileTextOutlined />} color="#1890ff" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="匹配推荐" value={45} icon={<AimOutlined />} color="#52c41a" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="政策动态" value={12} icon={<SafetyCertificateOutlined />} color="#faad14" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="我的收藏" value={23} icon={<StarOutlined />} color="#722ed1" />
        </Col>
      </Row>

      <Row gutter={24}>
        {/* 左侧：新闻列表 */}
        <Col xs={24} lg={18}>
          <Card>
            {/* 搜索和筛选 */}
            <div className={styles.filterBar}>
              <Input
                placeholder="搜索新闻..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                onPressEnter={handleSearch}
                style={{ width: 300 }}
                allowClear
              />
              <Space>
                <Select defaultValue="relevance" style={{ width: 120 }}>
                  <Select.Option value="relevance">按匹配度</Select.Option>
                  <Select.Option value="time">按时间</Select.Option>
                  <Select.Option value="source">按来源</Select.Option>
                </Select>
                <Button icon={<FilterOutlined />}>筛选</Button>
              </Space>
            </div>

            {/* 分类标签 */}
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={categories.map(cat => ({
                key: cat.key,
                label: (
                  <Space>
                    {cat.icon}
                    {cat.label}
                  </Space>
                ),
              }))}
            />

            {/* 新闻列表 */}
            <Spin spinning={loading}>
              {newsData.length > 0 ? (
                <div className={styles.newsList}>
                  {newsData.map(item => (
                    <NewsCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <Empty description="暂无相关新闻" />
              )}
            </Spin>
          </Card>
        </Col>

        {/* 右侧：侧边栏 */}
        <Col xs={24} lg={6}>
          {/* 热门话题 */}
          <Card 
            title={<><FireOutlined /> 热门话题</>} 
            className={styles.sideCard}
          >
            <List
              size="small"
              dataSource={hotTopics}
              renderItem={(item, index) => (
                <List.Item>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space>
                      <Badge count={index + 1} style={{ backgroundColor: index < 3 ? '#f5222d' : '#999' }} />
                      <Text>{item.name}</Text>
                    </Space>
                    <Space>
                      <Text type="secondary">{item.count}</Text>
                      {getTrendIcon(item.trend)}
                      <Text type={item.trend === 'up' ? 'success' : item.trend === 'down' ? 'danger' : 'secondary'}>
                        {item.change}
                      </Text>
                    </Space>
                  </Space>
                </List.Item>
              )}
            />
          </Card>

          {/* 行业配置 */}
          <Card 
            title={<><BankOutlined /> 关注行业</>}
            className={styles.sideCard}
            extra={<Button type="link" size="small" onClick={() => setIndustryDrawerVisible(true)}>管理</Button>}
          >
            <List
              size="small"
              dataSource={industries}
              renderItem={item => (
                <List.Item>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space>
                      {item.isPrimary && <Tag color="blue">主</Tag>}
                      <Text>{item.name}</Text>
                    </Space>
                    <Progress percent={item.confidence} size="small" style={{ width: 80 }} />
                  </Space>
                </List.Item>
              )}
            />
          </Card>

          {/* 业务领域 */}
          <Card 
            title={<><AppstoreOutlined /> 业务领域</>}
            className={styles.sideCard}
          >
            <div className={styles.tagCloud}>
              {businessDomains.map(domain => (
                <Tag 
                  key={domain.id} 
                  color={domain.isCore ? 'blue' : 'default'}
                  style={{ marginBottom: 8 }}
                >
                  {domain.name}
                </Tag>
              ))}
              <Button type="dashed" size="small" icon={<PlusOutlined />}>添加</Button>
            </div>
          </Card>

          {/* 政策监控 */}
          <Card 
            title={<><SafetyCertificateOutlined /> 政策监控</>}
            className={styles.sideCard}
            extra={<Button type="link" size="small" onClick={() => setPolicyDrawerVisible(true)}>管理</Button>}
          >
            <List
              size="small"
              dataSource={policyMonitors}
              renderItem={item => (
                <List.Item>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Text>{item.name}</Text>
                    <Space>
                      <Badge count={item.matchedCount} style={{ backgroundColor: '#52c41a' }} />
                      <Switch size="small" checked={item.isEnabled} />
                    </Space>
                  </Space>
                </List.Item>
              )}
            />
          </Card>

          {/* 订阅来源 */}
          <Card 
            title={<><GlobalOutlined /> 订阅来源</>}
            className={styles.sideCard}
          >
            <List
              size="small"
              dataSource={['36氪', '虎嗅', '钛媒体', '亿欧网', '艾瑞咨询', '中国政府网']}
              renderItem={item => (
                <List.Item>
                  <Space>
                    <Avatar size="small" style={{ background: '#1890ff' }}>{item.charAt(0)}</Avatar>
                    <Text>{item}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 推送设置弹窗 */}
      <Modal
        title="推送设置"
        open={settingsVisible}
        onCancel={() => setSettingsVisible(false)}
        onOk={() => {
          message.success('设置已保存')
          setSettingsVisible(false)
        }}
        width={600}
      >
        <Form layout="vertical">
          <Form.Item label="开启推送">
            <Switch checked={pushConfig.enabled} onChange={v => setPushConfig({...pushConfig, enabled: v})} />
          </Form.Item>
          <Form.Item label="推送频率">
            <Select 
              value={pushConfig.frequency} 
              onChange={v => setPushConfig({...pushConfig, frequency: v})}
              style={{ width: '100%' }}
            >
              <Select.Option value="realtime">实时推送</Select.Option>
              <Select.Option value="hourly">每小时</Select.Option>
              <Select.Option value="daily">每日</Select.Option>
              <Select.Option value="weekly">每周</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="推送渠道">
            <Checkbox.Group 
              value={pushConfig.channels}
              onChange={v => setPushConfig({...pushConfig, channels: v as string[]})}
            >
              <Checkbox value="email">邮件</Checkbox>
              <Checkbox value="app">App推送</Checkbox>
              <Checkbox value="wechat">微信</Checkbox>
              <Checkbox value="dingtalk">钉钉</Checkbox>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item label={`最低匹配度: ${pushConfig.minMatchScore}%`}>
            <Slider 
              value={pushConfig.minMatchScore}
              onChange={v => setPushConfig({...pushConfig, minMatchScore: v})}
              min={50}
              max={100}
              marks={{ 50: '50%', 70: '70%', 90: '90%', 100: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 行业配置抽屉 */}
      <Drawer
        title="行业配置"
        placement="right"
        width={500}
        open={industryDrawerVisible}
        onClose={() => setIndustryDrawerVisible(false)}
      >
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">配置您的企业所属行业，AI将根据行业特征推荐相关新闻</Text>
        </div>
        <Button type="primary" icon={<RobotOutlined />} style={{ marginBottom: 16 }}>
          AI自动识别行业
        </Button>
        <Divider />
        <List
          dataSource={industries}
          renderItem={item => (
            <List.Item
              actions={[
                <Button type="link" size="small">编辑</Button>,
                <Button type="link" size="small" danger>删除</Button>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar style={{ background: item.isPrimary ? '#1890ff' : '#999' }}>{item.name.charAt(0)}</Avatar>}
                title={
                  <Space>
                    {item.name}
                    {item.isPrimary && <Tag color="blue">主行业</Tag>}
                  </Space>
                }
                description={`置信度: ${item.confidence}%`}
              />
            </List.Item>
          )}
        />
        <Button type="dashed" block icon={<PlusOutlined />} style={{ marginTop: 16 }}>
          添加行业
        </Button>
      </Drawer>

      {/* 政策监控抽屉 */}
      <Drawer
        title="政策监控配置"
        placement="right"
        width={500}
        open={policyDrawerVisible}
        onClose={() => setPolicyDrawerVisible(false)}
      >
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">配置政策监控规则，及时获取相关政策动态</Text>
        </div>
        <List
          dataSource={policyMonitors}
          renderItem={item => (
            <List.Item
              actions={[
                <Switch checked={item.isEnabled} />,
                <Button type="link" size="small">编辑</Button>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar style={{ background: '#faad14' }} icon={<SafetyCertificateOutlined />} />}
                title={item.name}
                description={
                  <Space wrap>
                    {item.keywords.map(k => <Tag key={k}>{k}</Tag>)}
                  </Space>
                }
              />
              <Badge count={item.matchedCount} style={{ backgroundColor: '#52c41a' }} />
            </List.Item>
          )}
        />
        <Button type="dashed" block icon={<PlusOutlined />} style={{ marginTop: 16 }}>
          添加监控规则
        </Button>
      </Drawer>
    </div>
  )
}

export default AINews