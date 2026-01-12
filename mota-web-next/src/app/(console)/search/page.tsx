'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Input,
  Button,
  Space,
  Tag,
  Typography,
  List,
  Avatar,
  Tabs,
  Tooltip,
  Dropdown,
  Checkbox,
  Slider,
  Collapse,
  Empty,
  Spin,
  Divider,
  Badge,
  message,
} from 'antd';
import {
  SearchOutlined,
  FileTextOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  TeamOutlined,
  CalendarOutlined,
  BulbOutlined,
  HistoryOutlined,
  StarOutlined,
  StarFilled,
  FilterOutlined,
  SortAscendingOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  FileOutlined,
  FolderOutlined,
  UserOutlined,
  TagOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Panel } = Collapse;

// 搜索结果类型
interface SearchResult {
  id: string;
  type: 'project' | 'task' | 'document' | 'knowledge' | 'user' | 'event';
  title: string;
  content: string;
  highlights: string[];
  url: string;
  score: number;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}

// 搜索建议
interface SearchSuggestion {
  text: string;
  type: 'history' | 'hot' | 'related';
  count?: number;
}

// 搜索过滤器
interface SearchFilters {
  types: string[];
  dateRange: [string, string] | null;
  relevanceThreshold: number;
  sortBy: 'relevance' | 'date' | 'popularity';
}

// 搜索结果类型配置
const resultTypeConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  project: { icon: <ProjectOutlined />, color: 'blue', label: '项目' },
  task: { icon: <CheckSquareOutlined />, color: 'green', label: '任务' },
  document: { icon: <FileTextOutlined />, color: 'purple', label: '文档' },
  knowledge: { icon: <FolderOutlined />, color: 'orange', label: '知识库' },
  user: { icon: <UserOutlined />, color: 'cyan', label: '用户' },
  event: { icon: <CalendarOutlined />, color: 'magenta', label: '日程' },
};

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  
  const [searchText, setSearchText] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    types: [],
    dateRange: null,
    relevanceThreshold: 0,
    sortBy: 'relevance',
  });
  const [searchMode, setSearchMode] = useState<'keyword' | 'semantic' | 'hybrid'>('hybrid');

  // 获取搜索建议
  const { data: suggestions } = useQuery({
    queryKey: ['search-suggestions', searchText],
    queryFn: async (): Promise<SearchSuggestion[]> => {
      if (!searchText || searchText.length < 2) return [];
      try {
        const { searchService } = await import('@/services');
        return await searchService.getSuggestions(searchText);
      } catch {
        return [];
      }
    },
    enabled: searchText.length >= 2,
  });

  // 获取搜索历史
  const { data: searchHistory } = useQuery({
    queryKey: ['search-history'],
    queryFn: async (): Promise<string[]> => {
      try {
        const { searchService } = await import('@/services');
        return await searchService.getHistory();
      } catch {
        return [];
      }
    },
  });

  // 获取热门搜索
  const { data: hotSearches } = useQuery({
    queryKey: ['hot-searches'],
    queryFn: async (): Promise<{ text: string; count: number }[]> => {
      try {
        const { searchService } = await import('@/services');
        return await searchService.getHotSearches();
      } catch {
        return [];
      }
    },
  });

  // 执行搜索
  const { data: searchResults, isLoading: isSearching, refetch: doSearch } = useQuery({
    queryKey: ['search-results', searchText, activeTab, filters, searchMode],
    queryFn: async () => {
      if (!searchText) return null;
      try {
        const { searchService } = await import('@/services');
        return await searchService.search({
          query: searchText,
          type: activeTab !== 'all' ? activeTab : undefined,
          mode: searchMode,
          relevanceThreshold: filters.relevanceThreshold,
          sortBy: filters.sortBy,
        });
      } catch {
        return { results: [], total: 0, took: 0, mode: searchMode };
      }
    },
    enabled: !!searchText,
  });

  // 处理搜索
  const handleSearch = useCallback((value: string) => {
    setSearchText(value);
    if (value) {
      router.push(`/search?q=${encodeURIComponent(value)}`);
    }
  }, [router]);

  // 渲染搜索结果项
  const renderResultItem = (result: SearchResult) => {
    const config = resultTypeConfig[result.type];
    
    return (
      <List.Item
        key={result.id}
        className="search-result-item"
        style={{ cursor: 'pointer' }}
        onClick={() => router.push(result.url)}
      >
        <List.Item.Meta
          avatar={
            <Avatar
              style={{ backgroundColor: config.color === 'blue' ? '#1890ff' : undefined }}
              icon={config.icon}
            />
          }
          title={
            <Space>
              <Text strong>{result.title}</Text>
              <Tag color={config.color}>{config.label}</Tag>
              <Text type="secondary" style={{ fontSize: 12 }}>
                相关度 {Math.round(result.score * 100)}%
              </Text>
            </Space>
          }
          description={
            <div>
              <Paragraph
                ellipsis={{ rows: 2 }}
                style={{ marginBottom: 8 }}
              >
                {result.content}
              </Paragraph>
              <Space size="middle">
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <ClockCircleOutlined /> {dayjs(result.updatedAt).fromNow()}更新
                </Text>
                {result.highlights.map((h, i) => (
                  <Tag key={i} color="default" style={{ fontSize: 11 }}>
                    {h}
                  </Tag>
                ))}
              </Space>
            </div>
          }
        />
      </List.Item>
    );
  };

  return (
    <div className="search-page">
      {/* 搜索头部 */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={3}>
              <RobotOutlined /> 智能搜索
            </Title>
            <Text type="secondary">
              支持关键词搜索、语义搜索和混合搜索，快速找到您需要的内容
            </Text>
          </div>

          <Search
            placeholder="搜索项目、任务、文档、知识库..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
            size="large"
            enterButton={
              <Space>
                <SearchOutlined />
                搜索
              </Space>
            }
            style={{ marginBottom: 16 }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <Text type="secondary">搜索模式：</Text>
              <Button
                type={searchMode === 'keyword' ? 'primary' : 'default'}
                size="small"
                onClick={() => setSearchMode('keyword')}
              >
                关键词
              </Button>
              <Button
                type={searchMode === 'semantic' ? 'primary' : 'default'}
                size="small"
                onClick={() => setSearchMode('semantic')}
                icon={<BulbOutlined />}
              >
                语义
              </Button>
              <Button
                type={searchMode === 'hybrid' ? 'primary' : 'default'}
                size="small"
                onClick={() => setSearchMode('hybrid')}
                icon={<ThunderboltOutlined />}
              >
                混合
              </Button>
            </Space>
            <Button
              icon={<FilterOutlined />}
              onClick={() => setShowFilters(!showFilters)}
            >
              高级筛选
            </Button>
          </div>

          {/* 高级筛选 */}
          {showFilters && (
            <Card size="small" style={{ marginTop: 16 }}>
              <Row gutter={24}>
                <Col span={8}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>内容类型</Text>
                  </div>
                  <Checkbox.Group
                    value={filters.types}
                    onChange={(values) => setFilters({ ...filters, types: values as string[] })}
                  >
                    <Space direction="vertical">
                      {Object.entries(resultTypeConfig).map(([key, config]) => (
                        <Checkbox key={key} value={key}>
                          {config.icon} {config.label}
                        </Checkbox>
                      ))}
                    </Space>
                  </Checkbox.Group>
                </Col>
                <Col span={8}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>相关度阈值: {filters.relevanceThreshold}%</Text>
                  </div>
                  <Slider
                    value={filters.relevanceThreshold}
                    onChange={(value) => setFilters({ ...filters, relevanceThreshold: value })}
                    marks={{ 0: '0%', 50: '50%', 100: '100%' }}
                  />
                </Col>
                <Col span={8}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>排序方式</Text>
                  </div>
                  <Space direction="vertical">
                    <Button
                      type={filters.sortBy === 'relevance' ? 'primary' : 'default'}
                      size="small"
                      block
                      onClick={() => setFilters({ ...filters, sortBy: 'relevance' })}
                    >
                      按相关度
                    </Button>
                    <Button
                      type={filters.sortBy === 'date' ? 'primary' : 'default'}
                      size="small"
                      block
                      onClick={() => setFilters({ ...filters, sortBy: 'date' })}
                    >
                      按时间
                    </Button>
                    <Button
                      type={filters.sortBy === 'popularity' ? 'primary' : 'default'}
                      size="small"
                      block
                      onClick={() => setFilters({ ...filters, sortBy: 'popularity' })}
                    >
                      按热度
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>
          )}
        </div>
      </Card>

      {/* 搜索结果或推荐 */}
      {searchText ? (
        <Row gutter={24}>
          <Col xs={24} lg={18}>
            {/* 搜索结果 */}
            <Card
              title={
                <Space>
                  <SearchOutlined />
                  搜索结果
                  {searchResults && (
                    <Text type="secondary" style={{ fontWeight: 'normal' }}>
                      共 {searchResults.total} 条结果，耗时 {searchResults.took}ms
                      {searchResults.mode === 'semantic' && (
                        <Tag color="purple" style={{ marginLeft: 8 }}>语义搜索</Tag>
                      )}
                      {searchResults.mode === 'hybrid' && (
                        <Tag color="blue" style={{ marginLeft: 8 }}>混合搜索</Tag>
                      )}
                    </Text>
                  )}
                </Space>
              }
            >
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                  { key: 'all', label: '全部' },
                  ...Object.entries(resultTypeConfig).map(([key, config]) => ({
                    key,
                    label: (
                      <Space>
                        {config.icon}
                        {config.label}
                      </Space>
                    ),
                  })),
                ]}
              />

              {isSearching ? (
                <div style={{ textAlign: 'center', padding: 48 }}>
                  <Spin size="large" tip="搜索中..." />
                </div>
              ) : searchResults?.results.length === 0 ? (
                <Empty description="未找到相关结果" />
              ) : (
                <List
                  dataSource={searchResults?.results}
                  renderItem={renderResultItem}
                />
              )}
            </Card>
          </Col>

          <Col xs={24} lg={6}>
            {/* AI搜索建议 */}
            <Card
              title={
                <Space>
                  <BulbOutlined />
                  AI搜索建议
                </Space>
              }
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  根据您的搜索，AI推荐以下相关内容：
                </Text>
                {suggestions?.filter((s) => s.type === 'related').map((s, i) => (
                  <Button
                    key={i}
                    type="link"
                    size="small"
                    style={{ padding: 0 }}
                    onClick={() => handleSearch(s.text)}
                  >
                    {s.text}
                  </Button>
                ))}
              </Space>
            </Card>

            {/* 搜索历史 */}
            <Card
              title={
                <Space>
                  <HistoryOutlined />
                  搜索历史
                </Space>
              }
              size="small"
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {searchHistory?.map((text, i) => (
                  <Button
                    key={i}
                    type="text"
                    size="small"
                    style={{ width: '100%', textAlign: 'left' }}
                    onClick={() => handleSearch(text)}
                  >
                    <ClockCircleOutlined style={{ marginRight: 8 }} />
                    {text}
                  </Button>
                ))}
              </Space>
            </Card>
          </Col>
        </Row>
      ) : (
        <Row gutter={24}>
          <Col xs={24} md={12}>
            {/* 搜索历史 */}
            <Card
              title={
                <Space>
                  <HistoryOutlined />
                  搜索历史
                </Space>
              }
            >
              {searchHistory?.length === 0 ? (
                <Empty description="暂无搜索历史" />
              ) : (
                <Space wrap>
                  {searchHistory?.map((text, i) => (
                    <Tag
                      key={i}
                      style={{ cursor: 'pointer', padding: '4px 12px' }}
                      onClick={() => handleSearch(text)}
                    >
                      {text}
                    </Tag>
                  ))}
                </Space>
              )}
            </Card>
          </Col>

          <Col xs={24} md={12}>
            {/* 热门搜索 */}
            <Card
              title={
                <Space>
                  <ThunderboltOutlined />
                  热门搜索
                </Space>
              }
            >
              <List
                size="small"
                dataSource={hotSearches}
                renderItem={(item, index) => (
                  <List.Item
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSearch(item.text)}
                  >
                    <Space>
                      <Badge
                        count={index + 1}
                        style={{
                          backgroundColor: index < 3 ? '#ff4d4f' : '#d9d9d9',
                        }}
                      />
                      <Text>{item.text}</Text>
                    </Space>
                    <Text type="secondary">{item.count} 次搜索</Text>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}