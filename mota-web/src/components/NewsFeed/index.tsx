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
import * as aiNewsApi from '../../services/api/aiNews';
import styles from './index.module.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;

interface NewsFeedProps {
  userId: number;
  projectId?: number;
}

const NewsFeed: React.FC<NewsFeedProps> = ({ userId, projectId }) => {
  const [activeTab, setActiveTab] = useState('recommended');
  const [news, setNews] = useState<aiNewsApi.AINews[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [hotTopics, setHotTopics] = useState<aiNewsApi.HotTopic[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [pushSettings, setPushSettings] = useState<aiNewsApi.PushSettings | null>(null);
  const [readingStats, setReadingStats] = useState<aiNewsApi.ReadingStats | null>(null);
  const [selectedNews, setSelectedNews] = useState<aiNewsApi.AINews | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  useEffect(() => {
    loadNews();
    loadHotTopics();
    loadFavorites();
    loadPushSettings();
    loadReadingStats();
  }, [userId]);

  const loadNews = useCallback(async () => {
    setLoading(true);
    try {
      let result: aiNewsApi.AINews[];
      switch (activeTab) {
        case 'recommended':
          result = await aiNewsApi.getRecommendedNews(userId, 20);
          break;
        case 'trending':
          result = await aiNewsApi.getTrendingNews(20);
          break;
        case 'favorites':
          result = await aiNewsApi.getFavoriteNews(userId);
          break;
        case 'project':
          if (projectId) {
            result = await aiNewsApi.getNewsForProject(projectId, 20);
          } else {
            result = [];
          }
          break;
        default:
          result = await aiNewsApi.getRecommendedNews(userId, 20);
      }
      setNews(result || []);
    } catch (error) {
      console.error('Failed to load news:', error);
      message.error('加载新闻失败');
    } finally {
      setLoading(false);
    }
  }, [activeTab, userId, projectId]);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const loadHotTopics = async () => {
    try {
      const topics = await aiNewsApi.getHotTopics(10);
      setHotTopics(topics || []);
    } catch (error) {
      console.error('Failed to load hot topics:', error);
    }
  };

  const loadFavorites = async () => {
    try {
      const favoriteNews = await aiNewsApi.getFavoriteNews(userId);
      const favoriteIds = new Set((favoriteNews || []).map(n => n.id));
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  };

  const loadPushSettings = async () => {
    try {
      const settings = await aiNewsApi.getPushSettings(userId);
      setPushSettings(settings);
    } catch (error) {
      console.error('Failed to load push settings:', error);
    }
  };

  const loadReadingStats = async () => {
    try {
      const stats = await aiNewsApi.getReadingStats(userId, 'month');
      setReadingStats(stats);
    } catch (error) {
      console.error('Failed to load reading stats:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      message.warning('请输入搜索关键词');
      return;
    }
    setLoading(true);
    try {
      const result = await aiNewsApi.searchNews(searchKeyword);
      setNews(result || []);
    } catch (error) {
      message.error('搜索失败');
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async (newsItem: aiNewsApi.AINews) => {
    try {
      if (favorites.has(newsItem.id)) {
        await aiNewsApi.unfavoriteNews(newsItem.id, userId);
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(newsItem.id);
          return newSet;
        });
        message.success('已取消收藏');
      } else {
        await aiNewsApi.favoriteNews(newsItem.id, userId);
        setFavorites(prev => new Set(prev).add(newsItem.id));
        message.success('已收藏');
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleShare = async (newsItem: aiNewsApi.AINews, platform: string) => {
    try {
      await aiNewsApi.shareNews(newsItem.id, userId, platform);
      message.success('分享成功');
    } catch (error) {
      message.error('分享失败');
    }
  };

  const handleNewsClick = async (newsItem: aiNewsApi.AINews) => {
    setSelectedNews(newsItem);
    setDetailVisible(true);
    try {
      await aiNewsApi.recordNewsRead(newsItem.id, userId);
    } catch (error) {
      console.error('Failed to record read:', error);
    }
  };

  const handleUpdatePushSettings = async (updates: Partial<aiNewsApi.PushSettings>) => {
    if (!pushSettings) return;
    try {
      const newSettings = { ...pushSettings, ...updates };
      await aiNewsApi.updatePushSettings(userId, newSettings);
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

  const renderNewsItem = (item: aiNewsApi.AINews) => (
    <List.Item
      key={item.id}
      className={styles.newsItem}
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
              handleShare(item, 'copy');
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
            <Avatar shape="square" size={80} icon={<ReadOutlined />} />
          )
        }
        title={
          <Space>
            <Text strong className={styles.newsTitle}>{item.title}</Text>
            {item.category && <Tag color="blue">{item.category}</Tag>}
          </Space>
        }
        description={
          <div className={styles.newsDescription}>
            <Paragraph ellipsis={{ rows: 2 }} className={styles.summary}>
              {item.summary || item.content?.substring(0, 150)}
            </Paragraph>
            <div className={styles.newsMeta}>
              <Space split={<span>·</span>}>
                <Text type="secondary">{item.source}</Text>
                <Text type="secondary">{aiNewsApi.formatPublishTime(item.publishTime)}</Text>
                <Text type="secondary">
                  <EyeOutlined /> {item.viewCount}
                </Text>
              </Space>
              {item.tags && item.tags.length > 0 && (
                <div className={styles.tags}>
                  {item.tags.slice(0, 3).map(tag => (
                    <Tag key={tag}>{tag}</Tag>
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
    <Card size="small" title={<><FireOutlined /> 热门话题</>} className={styles.hotTopicsCard}>
      <List
        size="small"
        dataSource={hotTopics}
        renderItem={(topic, index) => (
          <List.Item className={styles.topicItem}>
            <Space>
              <Badge count={index + 1} style={{ backgroundColor: index < 3 ? '#f5222d' : '#999' }} />
              <Text>{topic.name}</Text>
            </Space>
            <Space>
              {getTrendIcon(topic.trend)}
              <Text type="secondary">{topic.count}</Text>
            </Space>
          </List.Item>
        )}
      />
    </Card>
  );

  const renderReadingStats = () => {
    if (!readingStats) return null;

    return (
      <Card size="small" title="阅读统计" className={styles.statsCard}>
        <Row gutter={16}>
          <Col span={12}>
            <Statistic title="本月阅读" value={readingStats.totalRead} suffix="篇" />
          </Col>
          <Col span={12}>
            <Statistic title="收藏数" value={readingStats.favoriteCount} />
          </Col>
        </Row>
      </Card>
    );
  };

  const renderSettings = () => (
    <Drawer
      title="推送设置"
      placement="right"
      onClose={() => setSettingsVisible(false)}
      open={settingsVisible}
      width={360}
    >
      {pushSettings && (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div className={styles.settingItem}>
            <Text>启用推送</Text>
            <Switch
              checked={pushSettings.enabled}
              onChange={(checked) => handleUpdatePushSettings({ enabled: checked })}
            />
          </div>

          <div className={styles.settingItem}>
            <Text>推送频率</Text>
            <Select
              value={pushSettings.frequency}
              onChange={(value) => handleUpdatePushSettings({ frequency: value })}
              style={{ width: 120 }}
              options={aiNewsApi.pushFrequencies}
            />
          </div>

          <div className={styles.settingItem}>
            <Text>邮件通知</Text>
            <Switch
              checked={pushSettings.emailEnabled}
              onChange={(checked) => handleUpdatePushSettings({ emailEnabled: checked })}
            />
          </div>

          <div className={styles.settingItem}>
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
              options={aiNewsApi.newsCategories}
              placeholder="选择关注的分类"
            />
          </div>
        </Space>
      )}
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
        <div className={styles.newsDetail}>
          <div className={styles.detailMeta}>
            <Space split={<span>·</span>}>
              <Text type="secondary">{selectedNews.source}</Text>
              {selectedNews.author && <Text type="secondary">{selectedNews.author}</Text>}
              <Text type="secondary">{aiNewsApi.formatPublishTime(selectedNews.publishTime)}</Text>
            </Space>
          </div>

          {selectedNews.imageUrl && (
            <img src={selectedNews.imageUrl} alt={selectedNews.title} className={styles.detailImage} />
          )}

          <Paragraph className={styles.detailContent}>
            {selectedNews.content}
          </Paragraph>

          {selectedNews.tags && selectedNews.tags.length > 0 && (
            <div className={styles.detailTags}>
              {selectedNews.tags.map(tag => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          )}

          <div className={styles.detailActions}>
            <Space>
              <Button
                icon={favorites.has(selectedNews.id) ? <HeartFilled /> : <HeartOutlined />}
                onClick={() => handleFavorite(selectedNews)}
              >
                {favorites.has(selectedNews.id) ? '已收藏' : '收藏'}
              </Button>
              <Button icon={<ShareAltOutlined />} onClick={() => handleShare(selectedNews, 'copy')}>
                分享
              </Button>
            </Space>
          </div>
        </div>
      )}
    </Drawer>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={4}>
          <ReadOutlined /> 智能新闻
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

      <div className={styles.content}>
        <div className={styles.mainContent}>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab={<><StarOutlined />推荐</>} key="recommended" />
            <TabPane tab={<><FireOutlined />热门</>} key="trending" />
            <TabPane tab={<><HeartOutlined />收藏</>} key="favorites" />
            {projectId && <TabPane tab={<><BellOutlined />项目相关</>} key="project" />}
          </Tabs>

          <Spin spinning={loading}>
            <List
              itemLayout="vertical"
              dataSource={news}
              locale={{ emptyText: <Empty description="暂无新闻" /> }}
              renderItem={renderNewsItem}
            />
          </Spin>
        </div>

        <div className={styles.sidebar}>
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