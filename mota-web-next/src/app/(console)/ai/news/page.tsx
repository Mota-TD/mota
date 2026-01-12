'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Slider,
  Progress,
  Statistic,
  Drawer,
  Divider,
  Pagination,
} from 'antd';
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
  SettingOutlined,
  RobotOutlined,
  FileTextOutlined,
  PlusOutlined,
  TagsOutlined,
  AimOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  RiseOutlined,
  FallOutlined,
  MinusOutlined,
  TeamOutlined,
  BankOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import {
  newsService,
  formatPublishTime,
  transformNewsArticle,
  type NewsArticle,
  type SmartNewsItem,
  type NewsStatistics,
  type NewsPushConfig,
  type PolicyMonitor,
  type EnterpriseIndustry,
  type BusinessDomain,
  type NewsHotTopic,
} from '@/services';

const { Title, Text, Paragraph } = Typography;

// 统一主题色 - 薄荷绿
const THEME_COLOR = '#10B981';

// 新闻项类型（前端使用）
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

// 行业配置类型
interface IndustryConfig {
  id: number;
  code: string;
  name: string;
  confidence: number;
  isPrimary: boolean;
}

// 业务领域类型
interface BusinessDomainConfig {
  id: number;
  name: string;
  type: string;
  importance: number;
  isCore: boolean;
}

// 政策监控类型
interface PolicyMonitorConfig {
  id: number;
  name: string;
  keywords: string[];
  matchedCount: number;
  isEnabled: boolean;
}

// 热门话题类型
interface HotTopic {
  name: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  change: string;
}

// 统计数据类型
interface NewsStats {
  todayNews: number;
  matchedNews: number;
  policyNews: number;
  favoriteNews: number;
}

/**
 * AI智能新闻推送页面
 */
const AINewsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('recommended');
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<'relevance' | 'time' | 'source'>('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 统计数据
  const [statistics, setStatistics] = useState<NewsStats>({
    todayNews: 0,
    matchedNews: 0,
    policyNews: 0,
    favoriteNews: 0,
  });

  // 设置相关状态
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [industryDrawerVisible, setIndustryDrawerVisible] = useState(false);
  const [policyDrawerVisible, setPolicyDrawerVisible] = useState(false);
  const [newsDetailVisible, setNewsDetailVisible] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  // 配置数据
  const [industries, setIndustries] = useState<IndustryConfig[]>([]);
  const [businessDomains, setBusinessDomains] = useState<BusinessDomainConfig[]>([]);
  const [policyMonitors, setPolicyMonitors] = useState<PolicyMonitorConfig[]>([]);
  const [hotTopics, setHotTopics] = useState<HotTopic[]>([]);

  // 推送配置
  const [pushConfig, setPushConfig] = useState({
    enabled: true,
    frequency: 'daily',
    time: '09:00',
    channels: ['email', 'app'],
    minMatchScore: 70,
  });

  // 防止重复请求的 ref
  const loadingNewsRef = useRef(false);
  const initializedRef = useRef(false);
  const favoritesCache = useRef<Set<string>>(new Set());

  // 获取当前用户ID
  const getCurrentUserId = () => 1;

  // 获取当前团队ID
  const getCurrentTeamId = () => 1;

  // 加载统计数据
  const loadStatistics = useCallback(async () => {
    try {
      const teamId = getCurrentTeamId();
      const stats = await newsService.getStatistics(teamId);
      setStatistics({
        todayNews: stats.todayArticles || 0,
        matchedNews: stats.matchedCount || 0,
        policyNews: stats.policyCount || 0,
        favoriteNews: stats.favoriteCount || 0,
      });
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  }, []);

  // 加载热门话题
  const loadHotTopics = useCallback(async () => {
    try {
      const topics = await newsService.getHotTopics(5);
      setHotTopics(topics);
    } catch (error) {
      console.error('加载热门话题失败:', error);
      setHotTopics([]);
    }
  }, []);

  // 加载行业配置
  const loadIndustries = useCallback(async () => {
    try {
      const teamId = getCurrentTeamId();
      const data = await newsService.getTeamIndustries(teamId);
      setIndustries(
        data.map((item) => ({
          id: item.id,
          code: item.industryCode,
          name: item.industryName,
          confidence: item.confidence,
          isPrimary: item.isPrimary,
        }))
      );
    } catch (error) {
      console.error('加载行业配置失败:', error);
      setIndustries([]);
    }
  }, []);

  // 加载业务领域
  const loadBusinessDomains = useCallback(async () => {
    try {
      const teamId = getCurrentTeamId();
      const data = await newsService.getTeamBusinessDomains(teamId);
      setBusinessDomains(
        data.map((item) => ({
          id: item.id,
          name: item.domainName,
          type: item.domainType,
          importance: item.importance,
          isCore: item.isCore,
        }))
      );
    } catch (error) {
      console.error('加载业务领域失败:', error);
      setBusinessDomains([]);
    }
  }, []);

  // 加载政策监控
  const loadPolicyMonitors = useCallback(async () => {
    try {
      const teamId = getCurrentTeamId();
      const data = await newsService.getPolicyMonitors(teamId);
      setPolicyMonitors(
        data.map((item) => ({
          id: item.id,
          name: item.monitorName,
          keywords: item.keywords || [],
          matchedCount: item.matchedCount,
          isEnabled: item.isEnabled,
        }))
      );
    } catch (error) {
      console.error('加载政策监控失败:', error);
      setPolicyMonitors([]);
    }
  }, []);

  // 加载推送配置
  const loadPushConfig = useCallback(async () => {
    try {
      const userId = getCurrentUserId();
      const config = await newsService.getPushConfig(userId);
      setPushConfig({
        enabled: config.pushEnabled,
        frequency: config.pushFrequency,
        time: config.pushTime || '09:00',
        channels: config.pushChannels || ['email', 'app'],
        minMatchScore: config.minMatchScore,
      });
    } catch (error) {
      console.error('加载推送配置失败:', error);
    }
  }, []);

  // 加载收藏列表
  const loadFavorites = useCallback(async () => {
    try {
      const userId = getCurrentUserId();
      const favorites = await newsService.getFavorites(userId);
      favoritesCache.current = new Set(favorites.map((f) => String(f.articleId)));
    } catch (e) {
      console.warn('获取收藏状态失败:', e);
    }
  }, []);

  // 加载新闻数据
  const loadNews = useCallback(
    async (tab?: string, page?: number, size?: number) => {
      const currentTab = tab || activeTab;
      const currentPageNum = page || currentPage;
      const currentPageSize = size || pageSize;

      if (loadingNewsRef.current) {
        return;
      }
      loadingNewsRef.current = true;
      setLoading(true);

      try {
        let result: { list: NewsArticle[]; total: number };

        switch (currentTab) {
          case 'recommended':
            result = await newsService.searchNews({
              keyword: '',
              page: currentPageNum,
              pageSize: currentPageSize,
            });
            break;
          case 'policy':
            result = await newsService.searchNews({
              keyword: '',
              category: 'policy',
              page: currentPageNum,
              pageSize: currentPageSize,
            });
            break;
          case 'industry':
            result = await newsService.searchNews({
              keyword: '',
              category: 'industry',
              page: currentPageNum,
              pageSize: currentPageSize,
            });
            break;
          case 'technology':
            result = await newsService.searchNews({
              keyword: '',
              category: 'technology',
              page: currentPageNum,
              pageSize: currentPageSize,
            });
            break;
          case 'favorites':
            const userId = getCurrentUserId();
            const favorites = await newsService.getFavorites(userId);
            const articles = favorites.filter((f) => f.article).map((f) => f.article!);
            favoritesCache.current = new Set(favorites.map((f) => String(f.articleId)));
            const startIndex = (currentPageNum - 1) * currentPageSize;
            result = {
              list: articles.slice(startIndex, startIndex + currentPageSize),
              total: articles.length,
            };
            break;
          default:
            result = await newsService.searchNews({
              keyword: '',
              page: currentPageNum,
              pageSize: currentPageSize,
            });
        }

        // 转换数据格式
        const newsItems: NewsItem[] = result.list.map((article) => {
          const transformed = transformNewsArticle(article);
          return {
            ...transformed,
            isStarred: currentTab === 'favorites' || favoritesCache.current.has(transformed.id),
          };
        });

        setNewsData(newsItems);
        setTotal(result.total);
      } catch (error) {
        console.error('加载新闻失败:', error);
        message.error('加载新闻失败，请稍后重试');
        setNewsData([]);
        setTotal(0);
      } finally {
        setLoading(false);
        loadingNewsRef.current = false;
      }
    },
    [activeTab, currentPage, pageSize]
  );

  // 初始化加载
  useEffect(() => {
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;

    const initData = async () => {
      await loadFavorites();
      await Promise.all([
        loadStatistics(),
        loadHotTopics(),
        loadIndustries(),
        loadBusinessDomains(),
        loadPolicyMonitors(),
        loadPushConfig(),
        loadNews('recommended'),
      ]);
    };

    initData();
  }, []);

  // 切换标签时加载新闻
  useEffect(() => {
    if (!initializedRef.current) {
      return;
    }
    setCurrentPage(1);
    loadNews(activeTab, 1, pageSize);
  }, [activeTab]);

  // 分页变化
  const handlePageChange = (page: number, size?: number) => {
    const newPageSize = size || pageSize;
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
    }
    loadNews(activeTab, page, newPageSize);
  };

  // 搜索新闻
  const handleSearch = async (page = 1) => {
    if (!searchText.trim()) {
      setCurrentPage(1);
      loadNews(activeTab, 1, pageSize);
      return;
    }

    setLoading(true);
    try {
      const result = await newsService.searchNews({
        keyword: searchText,
        page: page,
        pageSize: pageSize,
      });

      const newsItems: NewsItem[] = result.list.map((article) => {
        const transformed = transformNewsArticle(article);
        return {
          ...transformed,
          isStarred: favoritesCache.current.has(transformed.id),
        };
      });

      setNewsData(newsItems);
      setTotal(result.total);
      setCurrentPage(page);
    } catch (error) {
      console.error('搜索新闻失败:', error);
      message.error('搜索失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 刷新新闻
  const handleRefresh = async () => {
    setSearchText('');
    setCurrentPage(1);
    await loadFavorites();
    await Promise.all([loadNews(activeTab, 1, pageSize), loadStatistics(), loadHotTopics()]);
    message.success('新闻已更新');
  };

  // 收藏/取消收藏
  const handleStar = async (id: string) => {
    const userId = getCurrentUserId();
    const item = newsData.find((n) => n.id === id);
    if (!item) return;

    try {
      if (item.isStarred) {
        await newsService.unfavoriteNews(userId, parseInt(id));
        message.success('已取消收藏');
      } else {
        await newsService.favoriteNews(userId, parseInt(id));
        message.success('已收藏');
      }

      const newStarred = !item.isStarred;
      if (newStarred) {
        favoritesCache.current.add(id);
      } else {
        favoritesCache.current.delete(id);
      }

      setNewsData(newsData.map((n) => (n.id === id ? { ...n, isStarred: newStarred } : n)));
      loadStatistics().catch(console.error);
    } catch (error) {
      console.error('收藏操作失败:', error);
      message.error('操作失败，请稍后重试');
    }
  };

  // 保存推送配置
  const handleSavePushConfig = async () => {
    try {
      const userId = getCurrentUserId();
      await newsService.updatePushConfig(userId, {
        pushEnabled: pushConfig.enabled,
        pushFrequency: pushConfig.frequency as 'realtime' | 'hourly' | 'daily' | 'weekly',
        pushTime: pushConfig.time,
        pushChannels: pushConfig.channels,
        minMatchScore: pushConfig.minMatchScore,
      });
      message.success('设置已保存');
      setSettingsVisible(false);
    } catch (error) {
      console.error('保存推送配置失败:', error);
      message.error('保存失败，请稍后重试');
    }
  };

  // 切换政策监控状态
  const handleTogglePolicyMonitor = async (id: number, enabled: boolean) => {
    try {
      await newsService.updatePolicyMonitor(id, { isEnabled: enabled });
      setPolicyMonitors(policyMonitors.map((m) => (m.id === id ? { ...m, isEnabled: enabled } : m)));
      message.success(enabled ? '已启用监控' : '已禁用监控');
    } catch (error) {
      console.error('更新政策监控失败:', error);
      message.error('操作失败，请稍后重试');
    }
  };

  // AI自动识别行业
  const handleAutoDetectIndustry = async () => {
    try {
      const teamId = getCurrentTeamId();
      const description = '企业级SaaS软件开发，专注于AI技术应用';
      const detected = await newsService.detectIndustry(teamId, description);

      setIndustries(
        detected.map((item) => ({
          id: item.id,
          code: item.industryCode,
          name: item.industryName,
          confidence: item.confidence,
          isPrimary: item.isPrimary,
        }))
      );

      message.success('行业识别完成');
    } catch (error) {
      console.error('行业识别失败:', error);
      message.error('行业识别失败，请稍后重试');
    }
  };

  // 分享
  const handleShare = (item: NewsItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(item.url);
    message.success('链接已复制');
  };

  // 查看新闻详情
  const handleViewDetail = (item: NewsItem) => {
    setSelectedNews(item);
    setNewsDetailVisible(true);
  };

  // 关闭详情抽屉
  const handleCloseDetail = () => {
    setNewsDetailVisible(false);
    setSelectedNews(null);
  };

  // 获取趋势图标
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <RiseOutlined style={{ color: '#52c41a' }} />;
      case 'down':
        return <FallOutlined style={{ color: '#f5222d' }} />;
      default:
        return <MinusOutlined style={{ color: '#faad14' }} />;
    }
  };

  // 分类配置
  const categories = [
    { key: 'recommended', label: '智能推荐', icon: <ThunderboltOutlined /> },
    { key: 'policy', label: '政策监控', icon: <SafetyCertificateOutlined /> },
    { key: 'industry', label: '行业动态', icon: <GlobalOutlined /> },
    { key: 'technology', label: '科技资讯', icon: <RobotOutlined /> },
    { key: 'favorites', label: '我的收藏', icon: <StarOutlined /> },
  ];

  // 新闻卡片
  const NewsCard = ({ item }: { item: NewsItem }) => (
    <Card
      hoverable
      onClick={() => handleViewDetail(item)}
      style={{ marginBottom: 16, borderRadius: 12, cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <Space>
          <Avatar size="small" style={{ background: item.isPolicy ? '#faad14' : THEME_COLOR }}>
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
        <Space onClick={(e) => e.stopPropagation()}>
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
                e.stopPropagation();
                handleStar(item.id);
              }}
            />
          </Tooltip>
        </Space>
      </div>
      <Title level={5} style={{ marginBottom: 8 }}>
        {item.title}
      </Title>
      <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ marginBottom: 12 }}>
        {item.summary || '暂无摘要'}
      </Paragraph>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #f0f0f0', flexWrap: 'wrap', gap: 8 }}>
        <Space wrap>
          {item.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </Space>
        <Space onClick={(e) => e.stopPropagation()}>
          <Tooltip title="分享">
            <Button type="text" size="small" icon={<ShareAltOutlined />} onClick={(e) => handleShare(item, e)} />
          </Tooltip>
          <Tooltip title="打开原文">
            <Button
              type="text"
              size="small"
              icon={<LinkOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                window.open(item.url, '_blank');
              }}
            />
          </Tooltip>
        </Space>
      </div>
    </Card>
  );

  // 统计卡片
  const StatCard = ({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) => (
    <Card style={{ borderRadius: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            color: 'white',
            background: color,
          }}
        >
          {icon}
        </div>
        <Statistic title={title} value={value} />
      </div>
    </Card>
  );

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      {/* 页面头部 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          padding: '20px 24px',
          background: '#fff',
          borderRadius: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <GlobalOutlined style={{ fontSize: 32, color: THEME_COLOR }} />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              智能新闻推送
            </Title>
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
      <Row gutter={16} style={{ marginBottom: 24 }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
              <Input
                placeholder="搜索新闻..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onPressEnter={() => handleSearch()}
                style={{ width: 300 }}
                allowClear
              />
              <Space>
                <Select value={sortBy} onChange={(value) => setSortBy(value)} style={{ width: 120 }}>
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
              items={categories.map((cat) => ({
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
                  <div>
                    {newsData.map((item) => (
                      <NewsCard key={item.id} item={item} />
                    ))}
                  </div>
                  {/* 分页 */}
                  <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 24, marginTop: 16, borderTop: '1px solid #f0f0f0' }}>
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
                      <Text type="secondary">{activeTab === 'favorites' ? '您还没有收藏任何新闻' : '系统正在采集新闻，请稍后刷新页面'}</Text>
                    </div>
                  }
                >
                  <Button type="primary" onClick={handleRefresh} icon={<SyncOutlined />} style={{ background: THEME_COLOR, borderColor: THEME_COLOR }}>
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
          <Card title={<><FireOutlined /> 热门话题</>} style={{ marginBottom: 16, borderRadius: 12 }}>
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
                      <Text type={item.trend === 'up' ? 'success' : item.trend === 'down' ? 'danger' : 'secondary'}>{item.change}</Text>
                    </Space>
                  </Space>
                </List.Item>
              )}
            />
          </Card>

          {/* 行业配置 */}
          <Card
            title={<><BankOutlined /> 关注行业</>}
            style={{ marginBottom: 16, borderRadius: 12 }}
            extra={
              <Button type="link" size="small" onClick={() => setIndustryDrawerVisible(true)}>
                管理
              </Button>
            }
          >
            <List
              size="small"
              dataSource={industries}
              renderItem={(item) => (
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
          <Card title={<><AppstoreOutlined /> 业务领域</>} style={{ marginBottom: 16, borderRadius: 12 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {businessDomains.map((domain) => (
                <Tag key={domain.id} color={domain.isCore ? 'blue' : 'default'} style={{ marginBottom: 8 }}>
                  {domain.name}
                </Tag>
              ))}
              <Button type="dashed" size="small" icon={<PlusOutlined />}>
                添加
              </Button>
            </div>
          </Card>

          {/* 政策监控 */}
          <Card
            title={<><SafetyCertificateOutlined /> 政策监控</>}
            style={{ marginBottom: 16, borderRadius: 12 }}
            extra={
              <Button type="link" size="small" onClick={() => setPolicyDrawerVisible(true)}>
                管理
              </Button>
            }
          >
            <List
              size="small"
              dataSource={policyMonitors}
              renderItem={(item) => (
                <List.Item>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Text>{item.name}</Text>
                    <Space>
                      <Badge count={item.matchedCount} style={{ backgroundColor: '#52c41a' }} />
                      <Switch size="small" checked={item.isEnabled} onChange={(checked) => handleTogglePolicyMonitor(item.id, checked)} />
                    </Space>
                  </Space>
                </List.Item>
              )}
            />
          </Card>

          {/* 订阅来源 */}
          <Card title={<><GlobalOutlined /> 订阅来源</>} style={{ borderRadius: 12 }}>
            <List
              size="small"
              dataSource={['36氪', '虎嗅', '钛媒体', '亿欧网', '艾瑞咨询', '中国政府网']}
              renderItem={(item) => (
                <List.Item>
                  <Space>
                    <Avatar size="small" style={{ background: THEME_COLOR }}>
                      {item.charAt(0)}
                    </Avatar>
                    <Text>{item}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 推送设置弹窗 */}
      <Modal title="推送设置" open={settingsVisible} onCancel={() => setSettingsVisible(false)} onOk={handleSavePushConfig} width={600}>
        <Form layout="vertical">
          <Form.Item label="开启推送">
            <Switch checked={pushConfig.enabled} onChange={(v) => setPushConfig({ ...pushConfig, enabled: v })} />
          </Form.Item>
          <Form.Item label="推送频率">
            <Select value={pushConfig.frequency} onChange={(v) => setPushConfig({ ...pushConfig, frequency: v })} style={{ width: '100%' }}>
              <Select.Option value="realtime">实时推送</Select.Option>
              <Select.Option value="hourly">每小时</Select.Option>
              <Select.Option value="daily">每日</Select.Option>
              <Select.Option value="weekly">每周</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="推送渠道">
            <Checkbox.Group value={pushConfig.channels} onChange={(v) => setPushConfig({ ...pushConfig, channels: v as string[] })}>
              <Checkbox value="email">邮件</Checkbox>
              <Checkbox value="app">App推送</Checkbox>
              <Checkbox value="wechat">微信</Checkbox>
              <Checkbox value="dingtalk">钉钉</Checkbox>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item label={`最低匹配度: ${pushConfig.minMatchScore}%`}>
            <Slider value={pushConfig.minMatchScore} onChange={(v) => setPushConfig({ ...pushConfig, minMatchScore: v })} min={50} max={100} marks={{ 50: '50%', 70: '70%', 90: '90%', 100: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 行业配置抽屉 */}
      <Drawer title="行业配置" placement="right" width={500} open={industryDrawerVisible} onClose={() => setIndustryDrawerVisible(false)}>
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">配置您的企业所属行业，AI将根据行业特征推荐相关新闻</Text>
        </div>
        <Button type="primary" icon={<RobotOutlined />} style={{ marginBottom: 16, background: THEME_COLOR, borderColor: THEME_COLOR }} onClick={handleAutoDetectIndustry}>
          AI自动识别行业
        </Button>
        <Divider />
        <List
          dataSource={industries}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button type="link" size="small" key="edit">
                  编辑
                </Button>,
                <Button type="link" size="small" danger key="delete">
                  删除
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar style={{ background: item.isPrimary ? THEME_COLOR : '#999' }}>{item.name.charAt(0)}</Avatar>}
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
      <Drawer title="政策监控配置" placement="right" width={500} open={policyDrawerVisible} onClose={() => setPolicyDrawerVisible(false)}>
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">配置政策监控规则，及时获取相关政策动态</Text>
        </div>
        <List
          dataSource={policyMonitors}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Switch key="switch" checked={item.isEnabled} onChange={(checked) => handleTogglePolicyMonitor(item.id, checked)} />,
                <Button type="link" size="small" key="edit">
                  编辑
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar style={{ background: '#faad14' }} icon={<SafetyCertificateOutlined />} />}
                title={item.name}
                description={
                  <Space wrap>
                    {item.keywords.map((k) => (
                      <Tag key={k}>{k}</Tag>
                    ))}
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
        width={800}
        open={newsDetailVisible}
        onClose={handleCloseDetail}
        extra={
          <Button type="text" icon={<LinkOutlined />} onClick={() => selectedNews && window.open(selectedNews.url, '_blank')}>
            查看原文
          </Button>
        }
      >
        {selectedNews && (
          <div>
            {/* 详情头部 */}
            <div style={{ paddingBottom: 16 }}>
              <Title level={3} style={{ marginBottom: 16 }}>
                {selectedNews.title}
              </Title>
              <Space wrap style={{ marginBottom: 16 }}>
                <Space>
                  <Avatar size="small" style={{ background: selectedNews.isPolicy ? '#faad14' : THEME_COLOR }}>
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
            <div style={{ padding: '16px 0', minHeight: 300 }}>
              {selectedNews.content ? (
                <div style={{ fontSize: 16, lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: selectedNews.content }} />
              ) : (
                <div style={{ padding: '40px 20px', background: '#f5f5f5', borderRadius: 12, textAlign: 'center' }}>
                  <Text type="secondary">
                    <LinkOutlined /> 完整内容请访问原文链接查看
                  </Text>
                </div>
              )}
            </div>

            <Divider />

            {/* 标签 */}
            {selectedNews.tags.length > 0 && (
              <div style={{ padding: '16px 0' }}>
                <Text type="secondary" style={{ marginRight: 8 }}>
                  <TagsOutlined /> 相关标签：
                </Text>
                <Space wrap>
                  {selectedNews.tags.map((tag) => (
                    <Tag key={tag} color="blue">
                      {tag}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}

            {/* 操作按钮 */}
            <div style={{ padding: '24px 0', display: 'flex', justifyContent: 'center', borderTop: '1px solid #f0f0f0', marginTop: 16 }}>
              <Space size="middle">
                <Button
                  type={selectedNews.isStarred ? 'default' : 'primary'}
                  icon={selectedNews.isStarred ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                  onClick={() => {
                    handleStar(selectedNews.id);
                    setSelectedNews({ ...selectedNews, isStarred: !selectedNews.isStarred });
                  }}
                  style={!selectedNews.isStarred ? { background: THEME_COLOR, borderColor: THEME_COLOR } : {}}
                >
                  {selectedNews.isStarred ? '已收藏' : '收藏'}
                </Button>
                <Button icon={<ShareAltOutlined />} onClick={() => handleShare(selectedNews)}>
                  分享
                </Button>
                <Button type="primary" icon={<LinkOutlined />} onClick={() => window.open(selectedNews.url, '_blank')} style={{ background: THEME_COLOR, borderColor: THEME_COLOR }}>
                  查看原文
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default AINewsPage;