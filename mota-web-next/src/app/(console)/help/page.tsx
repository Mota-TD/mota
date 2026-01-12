'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Typography,
  Input,
  Button,
  Space,
  Row,
  Col,
  Collapse,
  List,
  Tag,
  Avatar,
  Tabs,
  Spin,
  Empty,
} from 'antd';
import {
  QuestionCircleOutlined,
  SearchOutlined,
  BookOutlined,
  VideoCameraOutlined,
  CustomerServiceOutlined,
  FileTextOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  SettingOutlined,
  BulbOutlined,
  RightOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { helpService, type HelpCategory, type FAQ, type VideoTutorial, type PopularArticle } from '@/services';

const { Title, Text, Paragraph } = Typography;

// 统一主题色 - 薄荷绿
const THEME_COLOR = '#10B981';

// 图标映射
const iconMap: Record<string, React.ReactNode> = {
  'getting-started': <RocketOutlined />,
  'projects': <BookOutlined />,
  'tasks': <FileTextOutlined />,
  'team': <TeamOutlined />,
  'ai': <BulbOutlined />,
  'settings': <SettingOutlined />,
};

// 颜色映射
const colorMap: Record<string, string> = {
  'getting-started': '#10B981',
  'projects': '#3B82F6',
  'tasks': '#8B5CF6',
  'team': '#F59E0B',
  'ai': '#EF4444',
  'settings': '#06B6D4',
};

export default function HelpPage() {
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [videos, setVideos] = useState<VideoTutorial[]>([]);
  const [popularArticles, setPopularArticles] = useState<PopularArticle[]>([]);

  // 获取帮助分类
  const fetchCategories = useCallback(async () => {
    try {
      const data = await helpService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    }
  }, []);

  // 获取常见问题
  const fetchFAQs = useCallback(async () => {
    try {
      const data = await helpService.getFAQs();
      setFaqs(data);
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
      setFaqs([]);
    }
  }, []);

  // 获取视频教程
  const fetchVideos = useCallback(async () => {
    try {
      const data = await helpService.getVideoTutorials(5);
      setVideos(data);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
      setVideos([]);
    }
  }, []);

  // 获取热门文章
  const fetchPopularArticles = useCallback(async () => {
    try {
      const data = await helpService.getPopularArticles(5);
      setPopularArticles(data);
    } catch (error) {
      console.error('Failed to fetch popular articles:', error);
      setPopularArticles([]);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchCategories(),
        fetchFAQs(),
        fetchVideos(),
        fetchPopularArticles(),
      ]);
      setLoading(false);
    };
    fetchData();
  }, [fetchCategories, fetchFAQs, fetchVideos, fetchPopularArticles]);

  // 搜索帮助
  const handleSearch = async () => {
    if (!searchText.trim()) return;
    try {
      const result = await helpService.searchHelp(searchText);
      setFaqs(result.faqs);
      setPopularArticles(result.articles);
    } catch (error) {
      console.error('Failed to search help:', error);
    }
  };

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
        background: `linear-gradient(135deg, ${THEME_COLOR} 0%, #059669 100%)`,
        borderRadius: 16,
        padding: '32px',
        marginBottom: 24,
        textAlign: 'center',
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: 'rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <QuestionCircleOutlined style={{ fontSize: 32, color: '#fff' }} />
        </div>
        <Title level={2} style={{ color: '#fff', margin: '0 0 8px' }}>帮助中心</Title>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>
          有问题？我们来帮您解答
        </Text>
        <div style={{ maxWidth: 500, margin: '24px auto 0' }}>
          <Input
            size="large"
            placeholder="搜索帮助文档..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            style={{ borderRadius: 8 }}
          />
        </div>
      </div>

      {/* 帮助分类 */}
      {categories.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {categories.map((category) => (
            <Col key={category.key} xs={12} sm={8} lg={4}>
              <Card
                hoverable
                style={{ borderRadius: 12, textAlign: 'center', height: '100%' }}
              >
                <Avatar
                  size={48}
                  style={{ backgroundColor: category.color || colorMap[category.key] || '#999', marginBottom: 12 }}
                  icon={iconMap[category.key] || <BookOutlined />}
                />
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{category.title}</div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {category.articles} 篇文章
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Row gutter={24}>
        {/* 左侧内容 */}
        <Col xs={24} lg={16}>
          <Tabs
            defaultActiveKey="faq"
            items={[
              {
                key: 'faq',
                label: (
                  <span>
                    <QuestionCircleOutlined /> 常见问题
                  </span>
                ),
                children: (
                  <Card style={{ borderRadius: 12 }}>
                    {faqs.length > 0 ? (
                      <Collapse
                        items={faqs.map(faq => ({
                          key: faq.key,
                          label: faq.question,
                          children: faq.answer,
                        }))}
                        defaultActiveKey={faqs[0]?.key ? [faqs[0].key] : []}
                        expandIconPosition="end"
                        style={{ background: 'transparent', border: 'none' }}
                      />
                    ) : (
                      <Empty description="暂无常见问题" />
                    )}
                  </Card>
                ),
              },
              {
                key: 'videos',
                label: (
                  <span>
                    <VideoCameraOutlined /> 视频教程
                  </span>
                ),
                children: (
                  <Card style={{ borderRadius: 12 }}>
                    {videos.length > 0 ? (
                      <List
                        dataSource={videos}
                        renderItem={(item) => (
                          <List.Item
                            actions={[
                              <Button key="play" type="primary" icon={<PlayCircleOutlined />} style={{ background: THEME_COLOR, borderColor: THEME_COLOR }}>
                                播放
                              </Button>,
                            ]}
                          >
                            <List.Item.Meta
                              avatar={
                                <div style={{
                                  width: 80,
                                  height: 50,
                                  borderRadius: 8,
                                  background: '#f0f0f0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}>
                                  <PlayCircleOutlined style={{ fontSize: 24, color: '#999' }} />
                                </div>
                              }
                              title={item.title}
                              description={
                                <Space>
                                  <Text type="secondary">{item.duration}</Text>
                                  <Text type="secondary">·</Text>
                                  <Text type="secondary">{item.views} 次观看</Text>
                                </Space>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Empty description="暂无视频教程" />
                    )}
                  </Card>
                ),
              },
              {
                key: 'docs',
                label: (
                  <span>
                    <BookOutlined /> 文档中心
                  </span>
                ),
                children: (
                  <Card style={{ borderRadius: 12 }}>
                    {categories.length > 0 ? (
                      <List
                        dataSource={categories}
                        renderItem={(item) => (
                          <List.Item
                            actions={[<RightOutlined key="arrow" />]}
                            style={{ cursor: 'pointer' }}
                          >
                            <List.Item.Meta
                              avatar={
                                <Avatar style={{ backgroundColor: item.color || colorMap[item.key] || '#999' }} icon={iconMap[item.key] || <BookOutlined />} />
                              }
                              title={item.title}
                              description={item.description}
                            />
                            <Tag>{item.articles} 篇</Tag>
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Empty description="暂无文档分类" />
                    )}
                  </Card>
                ),
              },
            ]}
          />
        </Col>

        {/* 右侧内容 */}
        <Col xs={24} lg={8}>
          {/* 热门文章 */}
          <Card
            title={
              <Space>
                <FileTextOutlined style={{ color: THEME_COLOR }} />
                热门文章
              </Space>
            }
            style={{ borderRadius: 12, marginBottom: 16 }}
          >
            {popularArticles.length > 0 ? (
              <List
                dataSource={popularArticles}
                renderItem={(item, index) => (
                  <List.Item style={{ cursor: 'pointer' }}>
                    <Space>
                      <Avatar
                        size="small"
                        style={{
                          backgroundColor: index < 3 ? THEME_COLOR : '#E2E8F0',
                          color: index < 3 ? '#fff' : '#64748B',
                        }}
                      >
                        {index + 1}
                      </Avatar>
                      <div>
                        <div style={{ fontWeight: 500 }}>{item.title}</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {item.category} · {item.views} 次阅读
                        </Text>
                      </div>
                    </Space>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无热门文章" />
            )}
          </Card>

          {/* 联系支持 */}
          <Card
            title={
              <Space>
                <CustomerServiceOutlined style={{ color: THEME_COLOR }} />
                联系支持
              </Space>
            }
            style={{ borderRadius: 12 }}
          >
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <Avatar
                size={64}
                style={{ backgroundColor: THEME_COLOR, marginBottom: 16 }}
                icon={<CustomerServiceOutlined />}
              />
              <div style={{ fontWeight: 600, marginBottom: 8 }}>需要更多帮助？</div>
              <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                我们的客服团队随时为您提供支持
              </Paragraph>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button type="primary" block style={{ background: THEME_COLOR, borderColor: THEME_COLOR }}>
                  在线客服
                </Button>
                <Button block>提交工单</Button>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}