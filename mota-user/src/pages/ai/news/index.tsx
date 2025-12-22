import { useState } from 'react'
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
  Spin
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
  SettingOutlined
} from '@ant-design/icons'
import styles from './index.module.css'

const { Title, Text, Paragraph } = Typography

interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  sourceIcon?: string
  publishTime: string
  category: string
  tags: string[]
  url: string
  isStarred?: boolean
  relevance: number
}

/**
 * AI新闻追踪页面
 */
const AINews = () => {
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')

  // 模拟新闻数据
  const mockNews: NewsItem[] = [
    {
      id: '1',
      title: 'OpenAI发布GPT-5，性能大幅提升',
      summary: 'OpenAI今日正式发布GPT-5模型，在推理能力、多模态理解等方面取得重大突破，将为企业AI应用带来新的可能性...',
      source: '36氪',
      publishTime: '2小时前',
      category: 'AI技术',
      tags: ['GPT-5', 'OpenAI', '大模型'],
      url: '#',
      isStarred: true,
      relevance: 95
    },
    {
      id: '2',
      title: '企业数字化转型报告：AI成为核心驱动力',
      summary: '最新调研报告显示，超过80%的企业将AI视为数字化转型的核心驱动力，预计未来三年AI投资将增长300%...',
      source: '亿欧网',
      publishTime: '4小时前',
      category: '行业动态',
      tags: ['数字化转型', '企业服务', 'AI应用'],
      url: '#',
      isStarred: false,
      relevance: 88
    },
    {
      id: '3',
      title: 'SaaS行业迎来AI革命，智能化成新趋势',
      summary: '随着AI技术的成熟，SaaS行业正在经历一场深刻的变革，智能化、自动化成为产品升级的主要方向...',
      source: '虎嗅',
      publishTime: '6小时前',
      category: '行业动态',
      tags: ['SaaS', '智能化', '产品升级'],
      url: '#',
      isStarred: true,
      relevance: 92
    },
    {
      id: '4',
      title: '国内AI大模型竞争加剧，百度、阿里、腾讯纷纷发力',
      summary: '国内科技巨头在AI大模型领域的竞争日趋激烈，各家纷纷推出自研大模型，并在企业服务领域展开布局...',
      source: '钛媒体',
      publishTime: '8小时前',
      category: 'AI技术',
      tags: ['大模型', '百度', '阿里', '腾讯'],
      url: '#',
      isStarred: false,
      relevance: 85
    },
    {
      id: '5',
      title: 'AI营销工具市场规模突破百亿，增长势头强劲',
      summary: '据市场研究机构数据，AI营销工具市场规模已突破百亿元，预计未来五年将保持30%以上的年增长率...',
      source: '艾瑞咨询',
      publishTime: '1天前',
      category: '市场分析',
      tags: ['AI营销', '市场规模', '增长趋势'],
      url: '#',
      isStarred: false,
      relevance: 90
    },
    {
      id: '6',
      title: '企业级AI应用落地加速，效率提升显著',
      summary: '越来越多的企业开始将AI技术应用于实际业务场景，在客服、营销、运营等领域取得了显著的效率提升...',
      source: '界面新闻',
      publishTime: '1天前',
      category: '案例分析',
      tags: ['AI应用', '企业效率', '落地实践'],
      url: '#',
      isStarred: false,
      relevance: 87
    },
  ]

  // 分类配置
  const categories = [
    { key: 'all', label: '全部', count: mockNews.length },
    { key: 'ai', label: 'AI技术', count: 2 },
    { key: 'industry', label: '行业动态', count: 2 },
    { key: 'market', label: '市场分析', count: 1 },
    { key: 'case', label: '案例分析', count: 1 },
  ]

  // 刷新新闻
  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      message.success('新闻已更新')
    }, 1500)
  }

  // 收藏/取消收藏
  const handleStar = (_id: string) => {
    message.success('操作成功')
  }

  // 分享
  const handleShare = (item: NewsItem) => {
    navigator.clipboard.writeText(item.url)
    message.success('链接已复制')
  }

  // 过滤新闻
  const filteredNews = mockNews.filter(item => {
    const matchSearch = !searchText || 
      item.title.toLowerCase().includes(searchText.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchText.toLowerCase())
    const matchCategory = activeTab === 'all' || 
      (activeTab === 'ai' && item.category === 'AI技术') ||
      (activeTab === 'industry' && item.category === '行业动态') ||
      (activeTab === 'market' && item.category === '市场分析') ||
      (activeTab === 'case' && item.category === '案例分析')
    return matchSearch && matchCategory
  })

  // 新闻卡片
  const NewsCard = ({ item }: { item: NewsItem }) => (
    <Card className={styles.newsCard} hoverable>
      <div className={styles.newsHeader}>
        <Space>
          <Avatar size="small" style={{ background: '#1890ff' }}>
            {item.source.charAt(0)}
          </Avatar>
          <Text type="secondary">{item.source}</Text>
          <Text type="secondary">·</Text>
          <Text type="secondary">
            <ClockCircleOutlined /> {item.publishTime}
          </Text>
        </Space>
        <Space>
          <Tooltip title="相关度">
            <Tag color={item.relevance >= 90 ? 'red' : item.relevance >= 80 ? 'orange' : 'blue'}>
              <FireOutlined /> {item.relevance}%
            </Tag>
          </Tooltip>
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <GlobalOutlined className={styles.headerIcon} />
          <div>
            <Title level={4} style={{ margin: 0 }}>新闻追踪</Title>
            <Text type="secondary">AI自动追踪与您业务相关的行业新闻</Text>
          </div>
        </div>
        <Space>
          <Button icon={<BellOutlined />}>订阅设置</Button>
          <Button icon={<SyncOutlined spin={loading} />} onClick={handleRefresh}>
            刷新
          </Button>
        </Space>
      </div>

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
                style={{ width: 300 }}
                allowClear
              />
              <Space>
                <Select defaultValue="relevance" style={{ width: 120 }}>
                  <Select.Option value="relevance">按相关度</Select.Option>
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
                  <Badge count={cat.count} size="small" offset={[10, 0]}>
                    {cat.label}
                  </Badge>
                ),
              }))}
            />

            {/* 新闻列表 */}
            <Spin spinning={loading}>
              {filteredNews.length > 0 ? (
                <div className={styles.newsList}>
                  {filteredNews.map(item => (
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
          {/* 热门标签 */}
          <Card title="热门标签" className={styles.sideCard}>
            <div className={styles.tagCloud}>
              <Tag color="red">AI大模型</Tag>
              <Tag color="orange">数字化转型</Tag>
              <Tag color="blue">企业服务</Tag>
              <Tag color="green">SaaS</Tag>
              <Tag color="purple">智能营销</Tag>
              <Tag color="cyan">自动化</Tag>
              <Tag color="magenta">GPT</Tag>
              <Tag>效率提升</Tag>
              <Tag>落地实践</Tag>
            </div>
          </Card>

          {/* 订阅来源 */}
          <Card 
            title="订阅来源" 
            className={styles.sideCard}
            extra={<Button type="link" size="small" icon={<SettingOutlined />}>管理</Button>}
          >
            <List
              size="small"
              dataSource={['36氪', '虎嗅', '钛媒体', '亿欧网', '艾瑞咨询', '界面新闻']}
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

          {/* 关键词设置 */}
          <Card 
            title="追踪关键词" 
            className={styles.sideCard}
            extra={<Button type="link" size="small">编辑</Button>}
          >
            <div className={styles.keywordList}>
              <Tag closable>AI</Tag>
              <Tag closable>企业服务</Tag>
              <Tag closable>SaaS</Tag>
              <Tag closable>数字化</Tag>
              <Tag closable>智能化</Tag>
              <Button type="dashed" size="small">+ 添加</Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AINews