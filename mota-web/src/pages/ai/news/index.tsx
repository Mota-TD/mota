import { useState, useEffect, useRef, useCallback } from 'react'
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
  Divider,
  Pagination
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
import styles from './index.module.css'
import * as smartNewsPushApi from '@/services/api/smartNewsPush'
import * as aiNewsApi from '@/services/api/aiNews'

const { Title, Text, Paragraph } = Typography

// 新闻项类型（与API返回类型对齐）
interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content?: string;
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
  author?: string;
}

// 热门话题类型
interface HotTopic {
  name: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  change: string;
}

// 行业配置类型
interface IndustryConfig {
  id: number;
  code: string;
  name: string;
  confidence: number;
  isPrimary: boolean;
}

// 业务领域类型
interface BusinessDomain {
  id: number;
  name: string;
  type: string;
  importance: number;
  isCore: boolean;
}

// 政策监控类型
interface PolicyMonitor {
  id: number;
  name: string;
  keywords: string[];
  matchedCount: number;
  isEnabled: boolean;
}

// 统计数据类型
interface NewsStatistics {
  todayNews: number;
  matchedNews: number;
  policyNews: number;
  favoriteNews: number;
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
  const [sortBy, setSortBy] = useState<'relevance' | 'time' | 'source'>('relevance')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  
  // 统计数据
  const [statistics, setStatistics] = useState<NewsStatistics>({
    todayNews: 0,
    matchedNews: 0,
    policyNews: 0,
    favoriteNews: 0
  })
  
  // 设置相关状态
  const [settingsVisible, setSettingsVisible] = useState(false)
  const [industryDrawerVisible, setIndustryDrawerVisible] = useState(false)
  const [policyDrawerVisible, setPolicyDrawerVisible] = useState(false)
  const [favoriteDrawerVisible, setFavoriteDrawerVisible] = useState(false)
  const [newsDetailVisible, setNewsDetailVisible] = useState(false)
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  
  // 配置数据
  const [industries, setIndustries] = useState<IndustryConfig[]>([])
  const [businessDomains, setBusinessDomains] = useState<BusinessDomain[]>([])
  const [policyMonitors, setPolicyMonitors] = useState<PolicyMonitor[]>([])
  const [hotTopics, setHotTopics] = useState<HotTopic[]>([])
  
  // 推送配置
  const [pushConfig, setPushConfig] = useState({
    enabled: true,
    frequency: 'daily',
    time: '09:00',
    channels: ['email', 'app'],
    minMatchScore: 70
  })

  // 防止重复请求的 ref
  const loadingNewsRef = useRef(false);
  const lastTabRef = useRef<string>('');
  const initializedRef = useRef(false);
  const favoritesCache = useRef<Set<string>>(new Set());
  
  // 获取当前用户ID（实际项目中应从认证状态获取）
  const getCurrentUserId = () => {
    // TODO: 从认证状态获取真实用户ID
    return 1;
  }
  
  // 获取当前团队ID（实际项目中应从认证状态获取）
  const getCurrentTeamId = () => {
    // TODO: 从认证状态获取真实团队ID
    return 1;
  }

  // 转换API返回的新闻数据为组件使用的格式
  const transformNewsArticle = (article: smartNewsPushApi.NewsArticle): NewsItem => {
    // 格式化匹配度为整数（0-100）
    const relevanceScore = article.importanceScore
      ? Math.round(Number(article.importanceScore))
      : 80;
    
    return {
      id: String(article.id),
      title: article.title,
      summary: article.summary || article.content?.substring(0, 200) || '',
      content: article.content,
      source: article.sourceName || '未知来源',
      publishTime: smartNewsPushApi.formatPublishTime(article.publishTime),
      category: article.category || 'general',
      tags: article.tags || [],
      url: article.sourceUrl || '#',
      isStarred: false, // 需要单独查询收藏状态
      relevance: Math.min(100, Math.max(0, relevanceScore)), // 确保在0-100范围内
      sentiment: article.sentiment,
      isPolicy: article.isPolicy,
      policyLevel: article.policyLevel,
      author: article.author
    }
  }

  // 加载统计数据
  const loadStatistics = useCallback(async () => {
    try {
      const teamId = getCurrentTeamId()
      const stats = await smartNewsPushApi.getStatistics(teamId)
      setStatistics({
        todayNews: stats.todayArticles || 0,
        matchedNews: stats.matchedCount || 0,
        policyNews: stats.policyCount || 0,
        favoriteNews: stats.favoriteCount || 0
      })
    } catch (error) {
      console.error('加载统计数据失败:', error)
      // 使用默认值
      setStatistics({
        todayNews: 0,
        matchedNews: 0,
        policyNews: 0,
        favoriteNews: 0
      })
    }
  }, [])

  // 加载热门话题
  const loadHotTopics = useCallback(async () => {
    try {
      const topics = await smartNewsPushApi.getHotTopics(5)
      setHotTopics(topics)
    } catch (error) {
      console.error('加载热门话题失败:', error)
      // 不使用模拟数据，显示空列表
      setHotTopics([])
    }
  }, [])

  // 加载行业配置
  const loadIndustries = useCallback(async () => {
    try {
      const teamId = getCurrentTeamId()
      const data = await smartNewsPushApi.getTeamIndustries(teamId)
      setIndustries(data.map(item => ({
        id: item.id,
        code: item.industryCode,
        name: item.industryName,
        confidence: item.confidence,
        isPrimary: item.isPrimary
      })))
    } catch (error) {
      console.error('加载行业配置失败:', error)
      setIndustries([])
    }
  }, [])

  // 加载业务领域
  const loadBusinessDomains = useCallback(async () => {
    try {
      const teamId = getCurrentTeamId()
      const data = await smartNewsPushApi.getTeamBusinessDomains(teamId)
      setBusinessDomains(data.map(item => ({
        id: item.id,
        name: item.domainName,
        type: item.domainType,
        importance: item.importance,
        isCore: item.isCore
      })))
    } catch (error) {
      console.error('加载业务领域失败:', error)
      setBusinessDomains([])
    }
  }, [])

  // 加载政策监控
  const loadPolicyMonitors = useCallback(async () => {
    try {
      const teamId = getCurrentTeamId()
      const data = await smartNewsPushApi.getPolicyMonitors(teamId)
      setPolicyMonitors(data.map(item => ({
        id: item.id,
        name: item.monitorName,
        keywords: item.keywords || [],
        matchedCount: item.matchedCount,
        isEnabled: item.isEnabled
      })))
    } catch (error) {
      console.error('加载政策监控失败:', error)
      setPolicyMonitors([])
    }
  }, [])

  // 加载推送配置
  const loadPushConfig = useCallback(async () => {
    try {
      const userId = getCurrentUserId()
      const config = await smartNewsPushApi.getPushConfig(userId)
      setPushConfig({
        enabled: config.pushEnabled,
        frequency: config.pushFrequency,
        time: config.pushTime || '09:00',
        channels: config.pushChannels || ['email', 'app'],
        minMatchScore: config.minMatchScore
      })
    } catch (error) {
      console.error('加载推送配置失败:', error)
    }
  }, [])

  // 加载收藏列表（用于缓存收藏状态）
  const loadFavorites = useCallback(async () => {
    try {
      const userId = getCurrentUserId()
      const favorites = await smartNewsPushApi.getFavorites(userId)
      favoritesCache.current = new Set(favorites.map(f => String(f.articleId)))
    } catch (e) {
      console.warn('获取收藏状态失败:', e)
    }
  }, [])

  // 加载新闻数据
  const loadNews = useCallback(async (tab?: string, page?: number, size?: number) => {
    const currentTab = tab || activeTab
    const currentPageNum = page || currentPage
    const currentPageSize = size || pageSize
    
    if (loadingNewsRef.current) {
      return;
    }
    loadingNewsRef.current = true;
    setLoading(true)
    
    try {
      const userId = getCurrentUserId()
      const teamId = getCurrentTeamId()
      let articles: smartNewsPushApi.NewsArticle[] = []
      let totalCount = 0
      
      switch (currentTab) {
        case 'recommended':
          // 智能推荐新闻 - 使用搜索接口支持分页
          const recommendedResult = await smartNewsPushApi.searchNews({
            keyword: '',
            page: currentPageNum,
            pageSize: currentPageSize
          })
          articles = recommendedResult.list
          totalCount = recommendedResult.total
          break
        case 'policy':
          // 政策新闻 - 使用搜索接口支持分页
          const policyResult = await smartNewsPushApi.searchNews({
            keyword: '',
            category: 'policy',
            page: currentPageNum,
            pageSize: currentPageSize
          })
          articles = policyResult.list
          totalCount = policyResult.total
          break
        case 'industry':
          // 行业动态 - 搜索行业相关新闻
          const industryResult = await smartNewsPushApi.searchNews({
            keyword: '',
            category: 'industry',
            page: currentPageNum,
            pageSize: currentPageSize
          })
          articles = industryResult.list
          totalCount = industryResult.total
          break
        case 'technology':
          // 科技资讯
          const techResult = await smartNewsPushApi.searchNews({
            keyword: '',
            category: 'technology',
            page: currentPageNum,
            pageSize: currentPageSize
          })
          articles = techResult.list
          totalCount = techResult.total
          break
        case 'favorites':
          // 我的收藏
          const favorites = await smartNewsPushApi.getFavorites(userId)
          articles = favorites.map(f => f.article).filter((a): a is smartNewsPushApi.NewsArticle => !!a)
          // 更新收藏缓存
          favoritesCache.current = new Set(favorites.map(f => String(f.articleId)))
          // 收藏列表前端分页
          totalCount = articles.length
          const startIndex = (currentPageNum - 1) * currentPageSize
          articles = articles.slice(startIndex, startIndex + currentPageSize)
          break
        default:
          const defaultResult = await smartNewsPushApi.searchNews({
            keyword: '',
            page: currentPageNum,
            pageSize: currentPageSize
          })
          articles = defaultResult.list
          totalCount = defaultResult.total
      }
      
      // 转换数据格式
      const newsItems = articles.map(transformNewsArticle)
      
      // 如果是收藏页面，标记所有为已收藏
      if (currentTab === 'favorites') {
        newsItems.forEach(item => item.isStarred = true)
      } else {
        // 使用缓存的收藏状态
        newsItems.forEach(item => {
          item.isStarred = favoritesCache.current.has(item.id)
        })
      }
      
      setNewsData(newsItems)
      setTotal(totalCount)
    } catch (error) {
      console.error('加载新闻失败:', error)
      message.error('加载新闻失败，请稍后重试')
      setNewsData([])
      setTotal(0)
    } finally {
      setLoading(false)
      loadingNewsRef.current = false;
    }
  }, [activeTab, currentPage, pageSize])

  // 初始化加载 - 只执行一次
  useEffect(() => {
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;
    
    // 并行加载所有初始数据
    const initData = async () => {
      // 先加载收藏列表用于缓存
      await loadFavorites()
      
      // 并行加载其他数据
      await Promise.all([
        loadStatistics(),
        loadHotTopics(),
        loadIndustries(),
        loadBusinessDomains(),
        loadPolicyMonitors(),
        loadPushConfig(),
        loadNews('recommended')
      ])
    }
    
    initData()
  }, []) // 空依赖数组，只执行一次

  // 切换标签时加载新闻
  useEffect(() => {
    // 跳过初始化时的调用
    if (!initializedRef.current) {
      return;
    }
    // 如果正在加载且是同一个tab，跳过
    if (loadingNewsRef.current && lastTabRef.current === activeTab) {
      return;
    }
    lastTabRef.current = activeTab;
    // 切换标签时重置到第一页
    setCurrentPage(1);
    loadNews(activeTab, 1, pageSize);
  }, [activeTab])

  // 分页变化时加载新闻
  const handlePageChange = (page: number, size?: number) => {
    const newPageSize = size || pageSize
    setCurrentPage(page)
    if (size && size !== pageSize) {
      setPageSize(size)
    }
    loadNews(activeTab, page, newPageSize)
  }

  // 搜索新闻
  const handleSearch = async (page = 1) => {
    if (!searchText.trim()) {
      setCurrentPage(1)
      loadNews(activeTab, 1, pageSize)
      return
    }
    
    setLoading(true)
    try {
      const result = await smartNewsPushApi.searchNews({
        keyword: searchText,
        page: page,
        pageSize: pageSize
      })
      
      const newsItems = result.list.map(transformNewsArticle)
      
      // 使用缓存的收藏状态
      newsItems.forEach(item => {
        item.isStarred = favoritesCache.current.has(item.id)
      })
      
      setNewsData(newsItems)
      setTotal(result.total)
      setCurrentPage(page)
    } catch (error) {
      console.error('搜索新闻失败:', error)
      message.error('搜索失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 刷新新闻
  const handleRefresh = async () => {
    setSearchText('')
    setCurrentPage(1)
    // 先刷新收藏缓存
    await loadFavorites()
    // 并行刷新数据
    await Promise.all([
      loadNews(activeTab, 1, pageSize),
      loadStatistics(),
      loadHotTopics()
    ])
    message.success('新闻已更新')
  }

  // 收藏/取消收藏
  const handleStar = async (id: string) => {
    const userId = getCurrentUserId()
    const item = newsData.find(n => n.id === id)
    if (!item) return
    
    try {
      if (item.isStarred) {
        // 取消收藏
        await smartNewsPushApi.unfavoriteNews(userId, parseInt(id))
        message.success('已取消收藏')
      } else {
        // 添加收藏
        await smartNewsPushApi.favoriteNews(userId, parseInt(id))
        message.success('已收藏')
      }
      
      // 更新本地状态和缓存
      const newStarred = !item.isStarred
      if (newStarred) {
        favoritesCache.current.add(id)
      } else {
        favoritesCache.current.delete(id)
      }
      
      setNewsData(newsData.map(n =>
        n.id === id ? { ...n, isStarred: newStarred } : n
      ))
      
      // 更新统计（不等待）
      loadStatistics().catch(console.error)
    } catch (error) {
      console.error('收藏操作失败:', error)
      message.error('操作失败，请稍后重试')
    }
  }

  // 保存推送配置
  const handleSavePushConfig = async () => {
    try {
      const userId = getCurrentUserId()
      await smartNewsPushApi.updatePushConfig(userId, {
        pushEnabled: pushConfig.enabled,
        pushFrequency: pushConfig.frequency as 'realtime' | 'hourly' | 'daily' | 'weekly',
        pushTime: pushConfig.time,
        pushChannels: pushConfig.channels,
        minMatchScore: pushConfig.minMatchScore
      })
      message.success('设置已保存')
      setSettingsVisible(false)
    } catch (error) {
      console.error('保存推送配置失败:', error)
      message.error('保存失败，请稍后重试')
    }
  }

  // 切换政策监控状态
  const handleTogglePolicyMonitor = async (id: number, enabled: boolean) => {
    try {
      await smartNewsPushApi.updatePolicyMonitor(id, { isEnabled: enabled })
      setPolicyMonitors(policyMonitors.map(m =>
        m.id === id ? { ...m, isEnabled: enabled } : m
      ))
      message.success(enabled ? '已启用监控' : '已禁用监控')
    } catch (error) {
      console.error('更新政策监控失败:', error)
      message.error('操作失败，请稍后重试')
    }
  }

  // AI自动识别行业
  const handleAutoDetectIndustry = async () => {
    try {
      const teamId = getCurrentTeamId()
      // 这里需要企业描述，实际项目中应从企业配置获取
      const description = '企业级SaaS软件开发，专注于AI技术应用'
      const detected = await smartNewsPushApi.detectIndustry(teamId, description)
      
      setIndustries(detected.map(item => ({
        id: item.id,
        code: item.industryCode,
        name: item.industryName,
        confidence: item.confidence,
        isPrimary: item.isPrimary
      })))
      
      message.success('行业识别完成')
    } catch (error) {
      console.error('行业识别失败:', error)
      message.error('行业识别失败，请稍后重试')
    }
  }

  // 分享
  const handleShare = (item: NewsItem, e?: React.MouseEvent) => {
    e?.stopPropagation()
    navigator.clipboard.writeText(item.url)
    message.success('链接已复制')
  }

  // 查看新闻详情
  const handleViewDetail = async (item: NewsItem) => {
    setSelectedNews(item)
    setNewsDetailVisible(true)
    
    // 暂时不调用后端API,直接使用列表中的数据
    // 后续可以在后端实现完整后再启用API调用
    
    /*
    // 如果已经有内容,不需要再次加载
    if (item.content && item.content.length > 100) {
      return
    }
    
    // 尝试获取完整内容
    setLoadingDetail(true)
    try {
      // 首先尝试从基本详情API获取
      const detail = await smartNewsPushApi.getArticle(parseInt(item.id))
      if (detail && detail.content && detail.content.length > 100) {
        const fullNews = transformNewsArticle(detail)
        fullNews.isStarred = item.isStarred
        setSelectedNews(fullNews)
        setLoadingDetail(false)
        return
      }
      
      // 如果基本API没有完整内容,尝试完整内容API(可能未实现)
      try {
        const fullContentResult = await smartNewsPushApi.getArticleFullContent(parseInt(item.id))
        if (fullContentResult && fullContentResult.content) {
          setSelectedNews({
            ...item,
            content: fullContentResult.content
          })
        }
      } catch (apiError) {
        // 完整内容API失败是正常的,因为可能还未实现
        console.log('完整内容API未实现或失败,使用现有数据')
      }
      
    } catch (error) {
      console.error('获取新闻详情失败:', error)
      // 不显示错误提示,静默失败,使用现有的摘要数据
    } finally {
      setLoadingDetail(false)
    }
    */
  }

  // 关闭详情抽屉
  const handleCloseDetail = () => {
    setNewsDetailVisible(false)
    setSelectedNews(null)
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
    <Card
      className={styles.newsCard}
      hoverable
      onClick={() => handleViewDetail(item)}
    >
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
        <Space onClick={e => e.stopPropagation()}>
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
              onClick={(e) => {
                e.stopPropagation()
                handleStar(item.id)
              }}
            />
          </Tooltip>
        </Space>
      </div>
      <Title level={5} className={styles.newsTitle}>
        {item.title}
      </Title>
      <Paragraph type="secondary" ellipsis={{ rows: 2 }} className={styles.newsSummary}>
        {item.summary || '暂无摘要'}
      </Paragraph>
      <div className={styles.newsFooter}>
        <Space wrap>
          {item.tags.map(tag => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </Space>
        <Space onClick={e => e.stopPropagation()}>
          <Tooltip title="分享">
            <Button type="text" size="small" icon={<ShareAltOutlined />} onClick={(e) => handleShare(item, e)} />
          </Tooltip>
          <Tooltip title="打开原文">
            <Button
              type="text"
              size="small"
              icon={<LinkOutlined />}
              onClick={(e) => {
                e.stopPropagation()
                window.open(item.url, '_blank')
              }}
            />
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
          <StatCard title="今日新闻" value={statistics.todayNews} icon={<FileTextOutlined />} color="#1890ff" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="匹配推荐" value={statistics.matchedNews} icon={<AimOutlined />} color="#52c41a" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="政策动态" value={statistics.policyNews} icon={<SafetyCertificateOutlined />} color="#faad14" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="我的收藏" value={statistics.favoriteNews} icon={<StarOutlined />} color="#722ed1" />
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
                onPressEnter={() => handleSearch()}
                style={{ width: 300 }}
                allowClear
              />
              <Space>
                <Select
                  value={sortBy}
                  onChange={(value) => setSortBy(value)}
                  style={{ width: 120 }}
                >
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
                <>
                  <div className={styles.newsList}>
                    {newsData.map(item => (
                      <NewsCard key={item.id} item={item} />
                    ))}
                  </div>
                  {/* 分页 */}
                  <div className={styles.pagination}>
                    <Pagination
                      current={currentPage}
                      pageSize={pageSize}
                      total={total}
                      onChange={handlePageChange}
                      showSizeChanger
                      showQuickJumper
                      showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`}
                      pageSizeOptions={['10', '20', '50']}
                    />
                  </div>
                </>
              ) : (
                <Empty
                  description={
                    <div>
                      <p>暂无新闻数据</p>
                      <Text type="secondary">
                        {activeTab === 'favorites'
                          ? '您还没有收藏任何新闻'
                          : '系统正在采集新闻，请稍后刷新页面'}
                      </Text>
                    </div>
                  }
                >
                  <Button type="primary" onClick={handleRefresh} icon={<SyncOutlined />}>
                    刷新数据
                  </Button>
                </Empty>
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
                      <Switch
                        size="small"
                        checked={item.isEnabled}
                        onChange={(checked) => handleTogglePolicyMonitor(item.id, checked)}
                      />
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
        onOk={handleSavePushConfig}
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
        <Button
          type="primary"
          icon={<RobotOutlined />}
          style={{ marginBottom: 16 }}
          onClick={handleAutoDetectIndustry}
        >
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
                <Switch
                  checked={item.isEnabled}
                  onChange={(checked) => handleTogglePolicyMonitor(item.id, checked)}
                />,
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

      {/* 新闻详情抽屉 */}
      <Drawer
        title="新闻详情"
        placement="right"
        width={1200}
        open={newsDetailVisible}
        onClose={handleCloseDetail}
        bodyStyle={{ padding: 0 }}
        extra={
          <Button
            type="text"
            icon={<LinkOutlined />}
            onClick={() => selectedNews && window.open(selectedNews.url, '_blank')}
          >
            查看原文
          </Button>
        }
      >
        {selectedNews && (
          <div className={styles.newsDetail}>
            {/* 详情头部 */}
            <div className={styles.detailHeader}>
              <Title level={3} style={{ marginBottom: 16 }}>
                {selectedNews.title}
              </Title>
              <Space wrap style={{ marginBottom: 16 }}>
                <Space>
                  <Avatar size="small" style={{ background: selectedNews.isPolicy ? '#faad14' : '#1890ff' }}>
                    {selectedNews.isPolicy ? <FileTextOutlined /> : selectedNews.source.charAt(0)}
                  </Avatar>
                  <Text>{selectedNews.source}</Text>
                </Space>
                <Divider type="vertical" />
                <Text type="secondary">
                  <ClockCircleOutlined /> {selectedNews.publishTime}
                </Text>
                {selectedNews.author && (
                  <>
                    <Divider type="vertical" />
                    <Text type="secondary">
                      <TeamOutlined /> {selectedNews.author}
                    </Text>
                  </>
                )}
              </Space>
              <Space wrap>
                {selectedNews.isPolicy && (
                  <Tag color="gold" icon={<SafetyCertificateOutlined />}>
                    {selectedNews.policyLevel === 'national' ? '国家级' : '地方级'}政策
                  </Tag>
                )}
                <Tag color={selectedNews.relevance >= 90 ? 'red' : selectedNews.relevance >= 80 ? 'orange' : 'blue'}>
                  <AimOutlined /> 匹配度 {selectedNews.relevance}%
                </Tag>
                {selectedNews.sentiment && (
                  <Tag color={selectedNews.sentiment === 'positive' ? 'green' : selectedNews.sentiment === 'negative' ? 'red' : 'default'}>
                    {selectedNews.sentiment === 'positive' ? '正面' : selectedNews.sentiment === 'negative' ? '负面' : '中性'}
                  </Tag>
                )}
                <Tag>{selectedNews.category}</Tag>
              </Space>
            </div>

            <Divider />

            {/* 详情内容 */}
            <div className={styles.detailContent}>
              <Spin spinning={loadingDetail} tip="正在加载完整内容...">
                {selectedNews.content && selectedNews.content.length > 100 ? (
                  // 有完整内容时显示
                  <>
                    <div
                      className={styles.articleContent}
                      dangerouslySetInnerHTML={{ __html: selectedNews.content }}
                    />
                    {/* 原文链接提示 */}
                    <div style={{
                      padding: '16px',
                      background: 'var(--bg-secondary)',
                      borderRadius: '8px',
                      marginTop: '24px',
                      textAlign: 'center'
                    }}>
                      <Text type="secondary">
                        <LinkOutlined /> 以上内容来自原文,
                      </Text>
                      <Button
                        type="link"
                        onClick={() => window.open(selectedNews.url, '_blank')}
                      >
                        点击访问原始链接
                      </Button>
                    </div>
                  </>
                ) : selectedNews.summary ? (
                  // 只有摘要时,显示提示文案
                  <div className={styles.articleContent}>
                    <div style={{
                      padding: '40px 20px',
                      background: 'var(--bg-secondary)',
                      borderRadius: '12px',
                      textAlign: 'center'
                    }}>
                      <Text type="secondary">
                        <LinkOutlined /> 完整内容加载失败,请访问原文链接查看
                      </Text>
                    </div>
                  </div>
                ) : (
                  // 既没有内容也没有摘要
                  <div className={styles.articleContent}>
                    <Empty
                      description={
                        <div>
                          <p>暂无详细内容</p>
                          <Text type="secondary">无法获取文章内容</Text>
                        </div>
                      }
                      style={{ padding: '40px 0' }}
                    >
                      <Button
                        type="primary"
                        size="large"
                        icon={<LinkOutlined />}
                        onClick={() => window.open(selectedNews.url, '_blank')}
                      >
                        访问原文链接
                      </Button>
                    </Empty>
                  </div>
                )}
              </Spin>
            </div>

            <Divider />

            {/* 标签 */}
            {selectedNews.tags.length > 0 && (
              <div className={styles.detailTags}>
                <Text type="secondary" style={{ marginRight: 8 }}>
                  <TagsOutlined /> 相关标签：
                </Text>
                <Space wrap>
                  {selectedNews.tags.map(tag => (
                    <Tag key={tag} color="blue">{tag}</Tag>
                  ))}
                </Space>
              </div>
            )}

            {/* 操作按钮 */}
            <div className={styles.detailActions}>
              <Space size="middle">
                <Button
                  type={selectedNews.isStarred ? 'default' : 'primary'}
                  icon={selectedNews.isStarred ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                  onClick={() => {
                    handleStar(selectedNews.id)
                    setSelectedNews({ ...selectedNews, isStarred: !selectedNews.isStarred })
                  }}
                >
                  {selectedNews.isStarred ? '已收藏' : '收藏'}
                </Button>
                <Button icon={<ShareAltOutlined />} onClick={() => handleShare(selectedNews)}>
                  分享
                </Button>
                <Button
                  type="primary"
                  icon={<LinkOutlined />}
                  onClick={() => window.open(selectedNews.url, '_blank')}
                >
                  查看原文
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default AINews