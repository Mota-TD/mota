'use client';

import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  List,
  Tag,
  Button,
  Space,
  Input,
  Select,
  Tabs,
  Avatar,
  Typography,
  Tooltip,
  Badge,
  Drawer,
  Form,
  Switch,
  Checkbox,
  Divider,
  Empty,
  Spin,
  message,
} from 'antd';
import {
  ReadOutlined,
  StarOutlined,
  StarFilled,
  ShareAltOutlined,
  SettingOutlined,
  BellOutlined,
  FilterOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  LikeOutlined,
  MessageOutlined,
  TagOutlined,
  GlobalOutlined,
  FireOutlined,
  RocketOutlined,
  BankOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

// 新闻类型
interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  sourceIcon?: string;
  author?: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  publishedAt: string;
  url: string;
  relevanceScore: number;
  isRead: boolean;
  isFavorite: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

// 新闻分类（本地使用，带图标）
interface NewsCategoryLocal {
  key: string;
  label: string;
  icon: React.ReactNode;
  count: number;
}

// 新闻分类（API返回，不带图标）
interface NewsCategory {
  key: string;
  label: string;
  count: number;
}

// 新闻源
interface NewsSource {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  category: string;
}

// 推送设置
interface PushSettings {
  enabled: boolean;
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  categories: string[];
  keywords: string[];
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

// 分类配置
const categoryConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  industry: { color: 'blue', icon: <GlobalOutlined /> },
  policy: { color: 'red', icon: <BankOutlined /> },
  technology: { color: 'purple', icon: <RocketOutlined /> },
  market: { color: 'green', icon: <FireOutlined /> },
  company: { color: 'orange', icon: <TeamOutlined /> },
};

export default function NewsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [form] = Form.useForm();

  // 获取新闻列表
  const { data: newsData, isLoading } = useQuery({
    queryKey: ['news', activeTab, searchText, selectedCategory],
    queryFn: async () => {
      try {
        const { newsService } = await import('@/services');
        return await newsService.getNews({
          tab: activeTab,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchText || undefined,
        });
      } catch {
        return {
          articles: [],
          categories: [
            { key: 'all', label: '全部', count: 0 },
            { key: 'industry', label: '行业动态', count: 0 },
            { key: 'policy', label: '政策法规', count: 0 },
            { key: 'technology', label: '技术趋势', count: 0 },
            { key: 'market', label: '市场分析', count: 0 },
            { key: 'company', label: '企业动态', count: 0 },
          ],
          total: 0,
          unreadCount: 0,
        };
      }
    },
  });

  // 获取推送设置
  const { data: pushSettings } = useQuery({
    queryKey: ['news-push-settings'],
    queryFn: async (): Promise<PushSettings> => {
      try {
        const { newsService } = await import('@/services');
        return await newsService.getPushSettings();
      } catch {
        return {
          enabled: false,
          frequency: 'daily',
          categories: [],
          keywords: [],
          quietHoursEnabled: false,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
        };
      }
    },
  });

  // 标记已读
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { newsService } = await import('@/services');
      return await newsService.markAsRead(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });

  // 收藏/取消收藏
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      const { newsService } = await import('@/services');
      return await newsService.toggleFavorite(id, isFavorite);
    },
    onSuccess: (_, variables) => {
      message.success(variables.isFavorite ? '已收藏' : '已取消收藏');
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });

  // 保存推送设置
  const savePushSettingsMutation = useMutation({
    mutationFn: async (settings: PushSettings) => {
      const { newsService } = await import('@/services');
      return await newsService.savePushSettings(settings);
    },
    onSuccess: () => {
      message.success('设置已保存');
      setShowSettings(false);
    },
  });

  // 刷新新闻
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['news'] });
    message.success('正在刷新...');
  };

  // 打开文章详情
  const handleOpenArticle = (article: NewsArticle) => {
    setSelectedArticle(article);
    if (!article.isRead) {
      markAsReadMutation.mutate(article.id);
    }
  };

  // 渲染新闻卡片
  const renderNewsCard = (article: NewsArticle) => (
    <Card
      key={article.id}
      hoverable
      className={`news-card ${!article.isRead ? 'unread' : ''}`}
      onClick={() => handleOpenArticle(article)}
      style={{ marginBottom: 16 }}
    >
      <Row gutter={16}>
        {article.imageUrl && (
          <Col xs={24} sm={8} md={6}>
            <div
              style={{
                width: '100%',
                height: 120,
                backgroundImage: `url(${article.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: 8,
              }}
            />
          </Col>
        )}
        <Col xs={24} sm={article.imageUrl ? 16 : 24} md={article.imageUrl ? 18 : 24}>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flex: 1 }}>
              <Space style={{ marginBottom: 8 }}>
                <Tag color={categoryConfig[article.category]?.color}>
                  {categoryConfig[article.category]?.icon}
                  {' '}
                  {newsData?.categories.find((c) => c.key === article.category)?.label}
                </Tag>
                {!article.isRead && <Badge status="processing" text="未读" />}
                <Text type="secondary" style={{ fontSize: 12 }}>
                  相关度 {article.relevanceScore}%
                </Text>
              </Space>
              
              <Title level={5} style={{ marginBottom: 8, marginTop: 0 }}>
                {article.isFavorite && <StarFilled style={{ color: '#faad14', marginRight: 8 }} />}
                {article.title}
              </Title>
              
              <Paragraph
                ellipsis={{ rows: 2 }}
                type="secondary"
                style={{ marginBottom: 8 }}
              >
                {article.summary}
              </Paragraph>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space size="middle">
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {article.sourceIcon} {article.source}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <ClockCircleOutlined /> {dayjs(article.publishedAt).fromNow()}
                </Text>
              </Space>
              
              <Space>
                <Tooltip title="浏览">
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <EyeOutlined /> {article.viewCount}
                  </Text>
                </Tooltip>
                <Tooltip title="点赞">
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <LikeOutlined /> {article.likeCount}
                  </Text>
                </Tooltip>
                <Tooltip title="评论">
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <MessageOutlined /> {article.commentCount}
                  </Text>
                </Tooltip>
                <Tooltip title={article.isFavorite ? '取消收藏' : '收藏'}>
                  <Button
                    type="text"
                    size="small"
                    icon={article.isFavorite ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavoriteMutation.mutate({
                        id: article.id,
                        isFavorite: !article.isFavorite,
                      });
                    }}
                  />
                </Tooltip>
                <Tooltip title="分享">
                  <Button
                    type="text"
                    size="small"
                    icon={<ShareAltOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      message.success('链接已复制');
                    }}
                  />
                </Tooltip>
              </Space>
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );

  return (
    <div className="news-page">
      {/* 页面标题 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ marginBottom: 8 }}>
          <ReadOutlined /> 智能新闻推送
        </Title>
        <Text type="secondary">
          基于您的行业和兴趣，智能推荐相关新闻资讯
        </Text>
      </div>

      {/* 工具栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space size="middle">
              <Search
                placeholder="搜索新闻..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 300 }}
                allowClear
              />
              <Select
                value={selectedCategory}
                onChange={setSelectedCategory}
                style={{ width: 150 }}
                options={newsData?.categories.map((c) => ({
                  value: c.key,
                  label: (
                    <Space>
                      {categoryConfig[c.key]?.icon || <ReadOutlined />}
                      {c.label}
                      <Badge count={c.count} style={{ backgroundColor: '#52c41a' }} />
                    </Space>
                  ),
                }))}
              />
            </Space>
          </Col>
          <Col>
            <Space>
              <Badge count={newsData?.unreadCount} offset={[-5, 5]}>
                <Button icon={<BellOutlined />}>
                  未读
                </Button>
              </Badge>
              <Button icon={<SyncOutlined />} onClick={handleRefresh}>
                刷新
              </Button>
              <Button icon={<SettingOutlined />} onClick={() => setShowSettings(true)}>
                推送设置
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 标签页 */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'all',
            label: (
              <span>
                <ReadOutlined /> 全部新闻
              </span>
            ),
          },
          {
            key: 'unread',
            label: (
              <Badge count={newsData?.unreadCount} offset={[10, 0]}>
                <span>
                  <BellOutlined /> 未读
                </span>
              </Badge>
            ),
          },
          {
            key: 'favorite',
            label: (
              <span>
                <StarOutlined /> 收藏
              </span>
            ),
          },
        ]}
      />

      {/* 新闻列表 */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin size="large" tip="加载中..." />
        </div>
      ) : newsData?.articles.length === 0 ? (
        <Empty description="暂无新闻" />
      ) : (
        <div style={{ marginTop: 16 }}>
          {newsData?.articles.map(renderNewsCard)}
        </div>
      )}

      {/* 文章详情抽屉 */}
      <Drawer
        title={selectedArticle?.title}
        open={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
        width={720}
        extra={
          <Space>
            <Button
              icon={selectedArticle?.isFavorite ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
              onClick={() => {
                if (selectedArticle) {
                  toggleFavoriteMutation.mutate({
                    id: selectedArticle.id,
                    isFavorite: !selectedArticle.isFavorite,
                  });
                }
              }}
            >
              {selectedArticle?.isFavorite ? '已收藏' : '收藏'}
            </Button>
            <Button icon={<ShareAltOutlined />}>分享</Button>
            <Button
              type="primary"
              onClick={() => {
                if (selectedArticle) {
                  window.open(selectedArticle.url, '_blank');
                }
              }}
            >
              查看原文
            </Button>
          </Space>
        }
      >
        {selectedArticle && (
          <div>
            <Space style={{ marginBottom: 16 }}>
              <Tag color={categoryConfig[selectedArticle.category]?.color}>
                {categoryConfig[selectedArticle.category]?.icon}
                {' '}
                {newsData?.categories.find((c) => c.key === selectedArticle.category)?.label}
              </Tag>
              <Text type="secondary">
                {selectedArticle.sourceIcon} {selectedArticle.source}
              </Text>
              {selectedArticle.author && (
                <Text type="secondary">作者: {selectedArticle.author}</Text>
              )}
              <Text type="secondary">
                <ClockCircleOutlined /> {dayjs(selectedArticle.publishedAt).format('YYYY-MM-DD HH:mm')}
              </Text>
            </Space>

            <Divider />

            <Paragraph>{selectedArticle.summary}</Paragraph>
            <Paragraph>{selectedArticle.content}</Paragraph>

            <Divider />

            <div>
              <Text strong>标签：</Text>
              <Space style={{ marginLeft: 8 }}>
                {selectedArticle.tags.map((tag) => (
                  <Tag key={tag} icon={<TagOutlined />}>
                    {tag}
                  </Tag>
                ))}
              </Space>
            </div>

            <Divider />

            <Space size="large">
              <Text type="secondary">
                <EyeOutlined /> {selectedArticle.viewCount} 浏览
              </Text>
              <Text type="secondary">
                <LikeOutlined /> {selectedArticle.likeCount} 点赞
              </Text>
              <Text type="secondary">
                <MessageOutlined /> {selectedArticle.commentCount} 评论
              </Text>
            </Space>
          </div>
        )}
      </Drawer>

      {/* 推送设置抽屉 */}
      <Drawer
        title="推送设置"
        open={showSettings}
        onClose={() => setShowSettings(false)}
        width={480}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setShowSettings(false)}>取消</Button>
              <Button
                type="primary"
                onClick={() => {
                  form.validateFields().then((values) => {
                    savePushSettingsMutation.mutate(values);
                  });
                }}
                loading={savePushSettingsMutation.isPending}
              >
                保存
              </Button>
            </Space>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={pushSettings}
        >
          <Form.Item
            name="enabled"
            label="启用推送"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="frequency"
            label="推送频率"
          >
            <Select
              options={[
                { value: 'realtime', label: '实时推送' },
                { value: 'hourly', label: '每小时' },
                { value: 'daily', label: '每天' },
                { value: 'weekly', label: '每周' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="categories"
            label="关注分类"
          >
            <Checkbox.Group>
              <Row>
                {newsData?.categories
                  .filter((c) => c.key !== 'all')
                  .map((category) => (
                    <Col span={12} key={category.key}>
                      <Checkbox value={category.key}>
                        {categoryConfig[category.key]?.icon || <ReadOutlined />} {category.label}
                      </Checkbox>
                    </Col>
                  ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item
            name="keywords"
            label="关注关键词"
          >
            <Select
              mode="tags"
              placeholder="输入关键词后按回车添加"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Divider />

          <Form.Item
            name="quietHoursEnabled"
            label="免打扰时段"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="quietHoursStart"
                label="开始时间"
              >
                <Input type="time" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="quietHoursEnd"
                label="结束时间"
              >
                <Input type="time" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </div>
  );
}