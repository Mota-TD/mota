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
import { getNews, toggleNewsStar, refreshNews, type NewsItem } from '@/services/api/ai'
import styles from './index.module.css'

const { Title, Text, Paragraph } = Typography

/**
 * AI新闻追踪页面
 */
const AINews = () => {
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [newsData, setNewsData] = useState<NewsItem[]>([])
  const [total, setTotal] = useState(0)

  // 加载新闻数据
  useEffect(() => {
    loadNews()
  }, [activeTab])

  const loadNews = async () => {
    setLoading(true)
    try {
      const categoryMap: Record<string, string> = {
        'all': '',
        'ai': 'AI技术',
        'industry': '行业动态',
        'market': '市场分析',
        'case': '案例分析'
      }
      const res = await getNews({
        category: categoryMap[activeTab] || undefined,
        search: searchText || undefined
      })
      // 处理后端返回的数据格式
      const processedList = (res.list || []).map((item: NewsItem & { tags?: string | string[], isStarred?: number | boolean }) => ({
        ...item,
        // tags 可能是 JSON 字符串，需要解析
        tags: typeof item.tags === 'string' ? JSON.parse(item.tags || '[]') : (item.tags || []),
        // isStarred 可能是数字，需要转换为布尔值
        isStarred: typeof item.isStarred === 'number' ? item.isStarred === 1 : Boolean(item.isStarred)
      }))
      setNewsData(processedList)
      setTotal(res.total || 0)
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

  // 分类配置
  const categories = [
    { key: 'all', label: '全部', count: total },
    { key: 'ai', label: 'AI技术', count: newsData.filter(n => n.category === 'AI技术').length },
    { key: 'industry', label: '行业动态', count: newsData.filter(n => n.category === '行业动态').length },
    { key: 'market', label: '市场分析', count: newsData.filter(n => n.category === '市场分析').length },
    { key: 'case', label: '案例分析', count: newsData.filter(n => n.category === '案例分析').length },
  ]

  // 刷新新闻
  const handleRefresh = async () => {
    setLoading(true)
    try {
      const res = await refreshNews()
      // 处理后端返回的数据格式
      const processedList = (res.list || []).map((item: NewsItem & { tags?: string | string[], isStarred?: number | boolean }) => ({
        ...item,
        tags: typeof item.tags === 'string' ? JSON.parse(item.tags || '[]') : (item.tags || []),
        isStarred: typeof item.isStarred === 'number' ? item.isStarred === 1 : Boolean(item.isStarred)
      }))
      setNewsData(processedList)
      setTotal(res.total || 0)
      message.success('新闻已更新')
    } catch (error) {
      message.error('刷新失败')
    } finally {
      setLoading(false)
    }
  }

  // 收藏/取消收藏
  const handleStar = async (id: string) => {
    try {
      await toggleNewsStar(id)
      // 更新本地状态
      setNewsData(newsData.map(item => 
        item.id === id ? { ...item, isStarred: !item.isStarred } : item
      ))
      message.success('操作成功')
    } catch (error) {
      message.error('操作失败')
    }
  }

  // 分享
  const handleShare = (item: NewsItem) => {
    navigator.clipboard.writeText(item.url)
    message.success('链接已复制')
  }

  // 过滤新闻
  const filteredNews = newsData.filter(item => {
    const matchSearch = !searchText || 
      item.title.toLowerCase().includes(searchText.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchText.toLowerCase())
    return matchSearch
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
                onPressEnter={handleSearch}
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