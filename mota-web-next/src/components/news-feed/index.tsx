'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  List,
  Typography,
  Tag,
  Space,
  Button,
  Input,
  Tabs,
  Empty,
  Spin,
  message,
  Avatar,
  Tooltip,
  Badge,
  Drawer,
  Switch,
  Select,
  Statistic,
  Row,
  Col
} from 'antd';
import {
  FireOutlined,
  StarOutlined,
  ShareAltOutlined,
  EyeOutlined,
  SettingOutlined,
  BellOutlined,
  ReadOutlined,
  RiseOutlined,
  FallOutlined,
  MinusOutlined,
  ReloadOutlined,
  HeartOutlined,
  HeartFilled
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

// 统一主题色
const THEME_COLOR = '#10B981';

// 新闻分类
const newsCategories = [
  { value: 'tech', label: '科技' },
  { value: 'finance', label: '财经' },
  { value: 'policy', label: '政策' },
  { value: 'industry', label: '行业' },
  { value: 'market', label: '市场' },
];

// 推送频率
const pushFrequencies = [
  { value: 'realtime', label: '实时' },
  { value: 'daily', label: '每日' },
  { value: 'weekly', label: '每周' },
];

// 新闻接口
interface AINews {
  id: number;
  title: string;
  summary?: string;
  content?: string;
  source: string;
  author?: string;
  category: string;
  tags?: string[];
  imageUrl?: string;
  publishTime: string;
  viewCount: number;
  isStarred?: boolean;
}

// 热门话题接口
interface HotTopic {
  id: number;
  name: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
}

// 推送设置接口
interface PushSettings {
  enabled: boolean;
  frequency: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  categories: string[];
}

// 阅读统计接口
interface ReadingStats {
  totalRead: number;
  favoriteCount: number;
  shareCount: number;
  avgReadTime: number;
}

interface NewsFeedProps {
  userId: number;
  projectId?: number;
}

// 格式化发布时间
const formatPublishTime = (time: string) => {
  return dayjs(time).fromNow();
};

// 模拟新闻数据
const generateMockNews = (count: number): AINews[] => {
  const categories = ['科技', '财经', '政策', '行业', '市场'];
  const sources = ['新华网', '人民日报', '经济日报', '科技日报', '中国证券报'];
  const tags = ['人工智能', '大数据', '云计算', '区块链', '5G', '新能源', '半导体'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `${categories[i % categories.length]}领域重大突破：${['新技术发布', '政策出台', '市场分析', '行业报告', '专家解读'][i % 5]}`,
    summary: '这是一段新闻摘要，描述了新闻的主要内容和关键信息，帮助读者快速了解新闻要点...',
    content: '这是新闻的详细内容，包含了完整的报道信息...',
    source: sources[i % sources.length],
    author: `记者${i + 1}`,
    category: categories[i % categories.length],
    tags: [tags[i % tags.length], tags[(i + 1) % tags.length]],
    imageUrl: i % 3 === 0 ? `https://picsum.photos/200/150?random=${i}` : undefined,
    publishTime: dayjs().subtract(i * 2, 'hour').toISOString(),
    viewCount: Math.floor(Math.random() * 10000) + 100,
    isStarred: i % 4 === 0,
  }));
};

// 模拟热门话题
const generateMockHotTopics = (): HotTopic[] => [
  { id: 1, name: '人工智能', count: 12580, trend: 'up' },
  { id: 2, name: '新能源汽车', count: 9876, trend: 'up' },
  { id: 3, name: '半导体产业', count: 8654, trend: 'stable' },
  { id: 4, name: '数字经济', count: 7432, trend: 'up' },
  { id: 5, name: '碳中和', count: 6543, trend: 'down' },
  { id: 6, name: '元宇宙', count: 5432, trend: 'down' },
  { id: 7, name: '量子计算', count: 4321, trend: 'stable' },
  { id: 8, name: '生物医药', count: 3210, trend: 'up' },
];

const NewsFeed: React.FC<NewsFeedProps> = ({ userId, projectId }) => {
  const [activeTab, setActiveTab] = useState('recommended');
  const [news, setNews] = useState<AINews[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [hotTopics, setHotTopics] = useState<HotTopic[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [pushSettings, setPushSettings] = useState<PushSettings>({
    enabled: true,
    frequency: 'daily',
    emailEnabled: true,
    pushEnabled: true,
    categories: ['tech', 'finance'],
  });
  const [readingStats, setReadingStats] = useState<ReadingStats>({
    totalRead: 128,
    favoriteCount: 23,
    shareCount: 15,
    avgReadTime: 5.2,
  });
  const [selectedNews, setSelectedNews] = useState<AINews | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  useEffect(() => {
    loadNews();
    loadHotTopics();
  }, [userId, activeTab]);

  const loadNews = useCallback(async () => {
    setLoading(true);
    try {
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let result: AINews[];
      switch (activeTab) {
        case 'recommended':
          result = generateMockNews(15);
          break;
        case 'trending':
          result = generateMockNews(10).sort((a, b) => b.viewCount - a.viewCount);
          break;
        case 'favorites':
          result = generateMockNews(20).filter(n => n.isStarred);
          break;
        case 'project':
          result = projectId ? generateMockNews(8) : [];
          break;
        default:
          result = generateMockNews(15);
      }
      setNews(result);
      
      // 设置收藏状态
      const favoriteIds = new Set(result.filter(n => n.isStarred).map(n => n.id));
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Failed to load news:', error);
      message.error('加载新闻失败');
    } finally {
      setLoading(false);
    }
  }, [activeTab, projectId]);

  const loadHotTopics = async () => {
    try {
      setHotTopics(generateMockHotTopics());
    } catch (error) {
      console.error('Failed to load hot topics:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      message.warning('请输入搜索关键词');
      return;
    }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = generateMockNews(10).filter(n => 
        n.title.includes(searchKeyword) || n.summary?.includes(searchKeyword)
      );
      setNews(result.length > 0 ? result : generateMockNews(5));
    } catch (error) {
      message.error('搜索失败');
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async (newsItem: AINews) => {
    try {
      if (favorites.has(newsItem.id)) {
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(newsItem.id);
          return newSet;
        });
        message.success('已取消收藏');
      } else {
        setFavorites(prev => new Set(prev).add(newsItem.id));
        message.success('已收藏');
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleShare = async (newsItem: AINews) => {
    try {
      await navigator.clipboard.writeText(`${newsItem.title} - ${window.location.origin}/news/${newsItem.id}`);
      message.success('链接已复制到剪贴板');
    } catch (error) {
      message.error('分享失败');
    }
  };

  const handleNewsClick = async (newsItem: AINews) => {
    setSelectedNews(newsItem);
    setDetailVisible(true);
  };

  const handleUpdatePushSettings = async (updates: Partial<PushSettings>) => {
    try {
      const newSettings = { ...pushSettings, ...updates };
      setPushSettings(newSettings);
      message.success('设置已更新');
    } catch (error) {
      message.error('更新设置失败');
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <RiseOutlined style={{ color: '#f5222d' }} />;
      case 'down':
        return <FallOutlined style={{ color: '#52c41a' }} />;
      default:
        return <MinusOutlined style={{ color: '#faad14' }} />;
    }
  };

  const renderNewsItem = (item: AINews) => (
    <List.Item
      key={item.id}
      style={{ 
        padding: '16px', 
        cursor: 'pointer',
        borderRadius: 8,
        marginBottom: 8,
        background: '#fff',
        border: '1px solid #f0f0f0',
        transition: 'all 0.3s'
      }}
      onClick={() => handleNewsClick(item)}
      actions={[
        <Tooltip title={favorites.has(item.id) ? '取消收藏' : '收藏'} key="favorite">
          <Button
            type="text"
            icon={favorites.has(item.id) ? <HeartFilled style={{ color: '#f5222d' }} /> : <HeartOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleFavorite(item);
            }}
          />
        </Tooltip>,
        <Tooltip title="分享" key="share">
          <Button
            type="text"
            icon={<ShareAltOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleShare(item);
            }}
          />
        </Tooltip>
      ]}
    >
      <List.Item.Meta
        avatar={
          item.imageUrl ? (
            <Avatar shape="square" size={80} src={item.imageUrl} />
          ) : (
            <Avatar shape="square" size={80} icon={<ReadOutlined />} style={{ backgroundColor: THEME_COLOR }} />
          )
        }
        title={
          <Space>
            <Text strong style={{ fontSize: 15 }}>{item.title}</Text>
            {item.category && <Tag color="blue">{item.category}</Tag>}
          </Space>
        }
        description={
          <div>
            <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 8, color: '#666' }}>
              {item.summary || item.content?.substring(0, 150)}
            </Paragraph>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space split={<span style={{ color: '#d9d9d9' }}>·</span>}>
                <Text type="secondary" style={{ fontSize: 12 }}>{item.source}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>{formatPublishTime(item.publishTime)}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <EyeOutlined /> {item.viewCount}
                </Text>
              </Space>
              {item.tags && item.tags.length > 0 && (
                <div>
                  {item.tags.slice(0, 3).map(tag => (
                    <Tag key={tag} style={{ marginRight: 4 }}>{tag}</Tag>
                  ))}
                </div>
              )}
            </div>
          </div>
        }
      />
    </List.Item>
  );

  const renderHotTopics = () => (
    <Card 
      size="small" 
      title={<><FireOutlined style={{ color: '#f5222d' }} /> 热门话题</>} 
      style={{ borderRadius: 12, marginBottom: 16 }}
    >
      <List
        size="small"
        dataSource={hotTopics}
        renderItem={(topic, index) => (
          <List.Item style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
            <Space>
              <Badge 
                count={index + 1} 
                style={{ backgroundColor: index < 3 ? '#f5222d' : '#999' }} 
              />
              <Text>{topic.name}</Text>
            </Space>
            <Space>
              {getTrendIcon(topic.trend)}
              <Text type="secondary">{topic.count.toLocaleString()}</Text>
            </Space>
          </List.Item>
        )}
      />
    </Card>
  );

  const renderReadingStats = () => (
    <Card size="small" title="阅读统计" style={{ borderRadius: 12 }}>
      <Row gutter={16}>
        <Col span={12}>
          <Statistic 
            title="本月阅读" 
            value={readingStats.totalRead} 
            suffix="篇" 
            valueStyle={{ color: THEME_COLOR }}
          />
        </Col>
        <Col span={12}>
          <Statistic 
            title="收藏数" 
            value={readingStats.favoriteCount} 
            valueStyle={{ color: '#faad14' }}
          />
        </Col>
      </Row>
    </Card>
  );

  const renderSettings = () => (
    <Drawer
      title="推送设置"
      placement="right"
      onClose={() => setSettingsVisible(false)}
      open={settingsVisible}
      width={360}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text>启用推送</Text>
          <Switch
            checked={pushSettings.enabled}
            onChange={(checked) => handleUpdatePushSettings({ enabled: checked })}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text>推送频率</Text>
          <Select
            value={pushSettings.frequency}
            onChange={(value) => handleUpdatePushSettings({ frequency: value })}
            style={{ width: 120 }}
            options={pushFrequencies}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text>邮件通知</Text>
          <Switch
            checked={pushSettings.emailEnabled}
            onChange={(checked) => handleUpdatePushSettings({ emailEnabled: checked })}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text>站内推送</Text>
          <Switch
            checked={pushSettings.pushEnabled}
            onChange={(checked) => handleUpdatePushSettings({ pushEnabled: checked })}
          />
        </div>

        <div>
          <Text strong>关注分类</Text>
          <Select
            mode="multiple"
            value={pushSettings.categories}
            onChange={(value) => handleUpdatePushSettings({ categories: value })}
            style={{ width: '100%', marginTop: 8 }}
            options={newsCategories}
            placeholder="选择关注的分类"
          />
        </div>
      </Space>
    </Drawer>
  );

  const renderNewsDetail = () => (
    <Drawer
      title={selectedNews?.title}
      placement="right"
      onClose={() => setDetailVisible(false)}
      open={detailVisible}
      width={600}
    >
      {selectedNews && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Space split={<span style={{ color: '#d9d9d9' }}>·</span>}>
              <Text type="secondary">{selectedNews.source}</Text>
              {selectedNews.author && <Text type="secondary">{selectedNews.author}</Text>}
              <Text type="secondary">{formatPublishTime(selectedNews.publishTime)}</Text>
            </Space>
          </div>

          {selectedNews.imageUrl && (
            <img 
              src={selectedNews.imageUrl} 
              alt={selectedNews.title} 
              style={{ width: '100%', borderRadius: 8, marginBottom: 16 }} 
            />
          )}

          <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
            {selectedNews.content || selectedNews.summary}
          </Paragraph>

          {selectedNews.tags && selectedNews.tags.length > 0 && (
            <div style={{ marginTop: 16 }}>
              {selectedNews.tags.map(tag => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          )}

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
            <Space>
              <Button
                icon={favorites.has(selectedNews.id) ? <HeartFilled style={{ color: '#f5222d' }} /> : <HeartOutlined />}
                onClick={() => handleFavorite(selectedNews)}
              >
                {favorites.has(selectedNews.id) ? '已收藏' : '收藏'}
              </Button>
              <Button icon={<ShareAltOutlined />} onClick={() => handleShare(selectedNews)}>
                分享
              </Button>
            </Space>
          </div>
        </div>
      )}
    </Drawer>
  );

  const tabItems = [
    { key: 'recommended', label: <><StarOutlined />推荐</> },
    { key: 'trending', label: <><FireOutlined />热门</> },
    { key: 'favorites', label: <><HeartOutlined />收藏</> },
    ...(projectId ? [{ key: 'project', label: <><BellOutlined />项目相关</> }] : []),
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <ReadOutlined style={{ marginRight: 8, color: THEME_COLOR }} /> 智能新闻
        </Title>
        <Space>
          <Search
            placeholder="搜索新闻"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 200 }}
          />
          <Button icon={<ReloadOutlined />} onClick={loadNews} loading={loading}>
            刷新
          </Button>
          <Button icon={<SettingOutlined />} onClick={() => setSettingsVisible(true)}>
            设置
          </Button>
        </Space>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            items={tabItems}
          />

          <Spin spinning={loading}>
            <List
              itemLayout="vertical"
              dataSource={news}
              locale={{ emptyText: <Empty description="暂无新闻" /> }}
              renderItem={renderNewsItem}
            />
          </Spin>
        </div>

        <div style={{ width: 280 }}>
          {renderHotTopics()}
          {renderReadingStats()}
        </div>
      </div>

      {renderSettings()}
      {renderNewsDetail()}
    </div>
  );
};

export default NewsFeed;