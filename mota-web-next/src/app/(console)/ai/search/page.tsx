'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Card, 
  Input, 
  Button, 
  Radio, 
  Tag, 
  List, 
  Typography, 
  Space, 
  Tooltip, 
  message, 
  Spin, 
  Empty, 
  Drawer, 
  Form, 
  Switch, 
  InputNumber, 
  Select, 
  Popconfirm,
  Badge,
  Divider,
  AutoComplete
} from 'antd';
import { 
  SearchOutlined, 
  FireOutlined, 
  HistoryOutlined, 
  SettingOutlined, 
  DeleteOutlined, 
  ThunderboltOutlined,
  BulbOutlined,
  FileTextOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  BookOutlined,
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  SwapOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  StarOutlined
} from '@ant-design/icons';
import { searchService } from '@/services';
import type { 
  SmartSearchResult, 
  SearchResultItem, 
  SearchHotWord, 
  SearchLog, 
  SearchSuggestion,
  SearchRelatedQuery,
  UserSearchPreference,
  SearchIntent
} from '@/services';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

// 搜索模式配置
const SEARCH_MODES = [
  { key: 'keyword', label: '关键词搜索', icon: <SearchOutlined />, description: '基于关键词的精确匹配' },
  { key: 'semantic', label: '语义搜索', icon: <BulbOutlined />, description: '理解语义的智能搜索' },
  { key: 'hybrid', label: '混合搜索', icon: <ThunderboltOutlined />, description: '关键词+语义的综合搜索' },
];

// 结果类型图标映射
const TYPE_ICONS: Record<string, React.ReactNode> = {
  project: <ProjectOutlined style={{ color: '#10B981' }} />,
  task: <CheckSquareOutlined style={{ color: '#3B82F6' }} />,
  document: <FileTextOutlined style={{ color: '#F59E0B' }} />,
  knowledge: <BookOutlined style={{ color: '#8B5CF6' }} />,
  event: <CalendarOutlined style={{ color: '#EC4899' }} />,
  user: <UserOutlined style={{ color: '#6366F1' }} />,
};

// 结果类型标签颜色
const TYPE_COLORS: Record<string, string> = {
  project: 'green',
  task: 'blue',
  document: 'orange',
  knowledge: 'purple',
  event: 'pink',
  user: 'cyan',
};

// 结果类型名称
const TYPE_NAMES: Record<string, string> = {
  project: '项目',
  task: '任务',
  document: '文档',
  knowledge: '知识库',
  event: '日程',
  user: '用户',
};

export default function AISearchPage() {
  // 搜索状态
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'keyword' | 'semantic' | 'hybrid'>('hybrid');
  const [searchResult, setSearchResult] = useState<SmartSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  
  // 补全建议
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // 热门搜索和历史
  const [hotSearches, setHotSearches] = useState<SearchHotWord[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchLog[]>([]);
  const [relatedQueries, setRelatedQueries] = useState<SearchRelatedQuery[]>([]);
  
  // 用户偏好
  const [preference, setPreference] = useState<UserSearchPreference | null>(null);
  const [settingsVisible, setSettingsVisible] = useState(false);
  
  // 意图识别
  const [detectedIntent, setDetectedIntent] = useState<SearchIntent | null>(null);
  
  // 表单
  const [form] = Form.useForm();
  
  // 搜索输入框引用
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 加载初始数据
  useEffect(() => {
    loadInitialData();
  }, []);

  // 加载初始数据
  const loadInitialData = async () => {
    try {
      const [hotData, historyData, prefData] = await Promise.all([
        searchService.getHotSearches('daily', 10),
        searchService.getSearchHistory(10),
        searchService.getUserPreference()
      ]);
      
      setHotSearches(hotData);
      setSearchHistory(historyData);
      setPreference(prefData);
      
      // 设置默认搜索模式
      if (prefData?.defaultSearchType) {
        setSearchMode(prefData.defaultSearchType as 'keyword' | 'semantic' | 'hybrid');
      }
    } catch (error) {
      console.error('加载初始数据失败:', error);
    }
  };

  // 获取补全建议
  const fetchSuggestions = useCallback(async (prefix: string) => {
    if (!prefix || prefix.length < 1 || !preference?.enableSuggestion) {
      setSuggestions([]);
      return;
    }
    
    try {
      const data = await searchService.getCompletions(prefix, 8);
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch (error) {
      console.error('获取补全建议失败:', error);
    }
  }, [preference?.enableSuggestion]);

  // 防抖处理输入
  const debounceRef = useRef<NodeJS.Timeout>();
  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  // 执行搜索
  const handleSearch = async (query?: string) => {
    const searchText = query || searchQuery;
    if (!searchText.trim()) {
      message.warning('请输入搜索内容');
      return;
    }
    
    setLoading(true);
    setShowSuggestions(false);
    
    try {
      // 先进行意图识别
      const intentResult = await searchService.detectIntent(searchText);
      setDetectedIntent(intentResult);
      
      // 执行搜索
      const result = await searchService.search(searchText, searchMode);
      setSearchResult(result);
      
      // 获取相关搜索
      const related = await searchService.getRelatedQueries(searchText, 5);
      setRelatedQueries(related);
      
      // 刷新搜索历史
      const historyData = await searchService.getSearchHistory(10);
      setSearchHistory(historyData);
      
    } catch (error) {
      console.error('搜索失败:', error);
      message.error('搜索失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 清除搜索历史
  const handleClearHistory = async () => {
    try {
      await searchService.clearSearchHistory();
      setSearchHistory([]);
      message.success('搜索历史已清除');
    } catch (error) {
      console.error('清除历史失败:', error);
      message.error('清除失败');
    }
  };

  // 保存用户偏好
  const handleSavePreference = async (values: Partial<UserSearchPreference>) => {
    try {
      await searchService.saveUserPreference(values);
      setPreference(prev => prev ? { ...prev, ...values } : null);
      message.success('设置已保存');
      setSettingsVisible(false);
    } catch (error) {
      console.error('保存设置失败:', error);
      message.error('保存失败');
    }
  };

  // 点击热门搜索
  const handleHotSearchClick = (word: string) => {
    setSearchQuery(word);
    handleSearch(word);
  };

  // 点击历史记录
  const handleHistoryClick = (query: string) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  // 点击相关搜索
  const handleRelatedClick = (query: string) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  // 选择补全建议
  const handleSelectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  // 渲染搜索结果项
  const renderResultItem = (item: SearchResultItem) => (
    <List.Item
      key={item.id}
      className="hover:bg-gray-50 cursor-pointer rounded-lg transition-colors"
      style={{ padding: '16px' }}
    >
      <div className="w-full">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {TYPE_ICONS[item.type] || <FileTextOutlined />}
            <Tag color={TYPE_COLORS[item.type] || 'default'}>
              {TYPE_NAMES[item.type] || item.type}
            </Tag>
            <Text strong className="text-base">
              <span dangerouslySetInnerHTML={{ __html: item.title }} />
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip title="相关度评分">
              <Tag color="blue">
                <StarOutlined /> {(item.score * 100).toFixed(0)}%
              </Tag>
            </Tooltip>
          </div>
        </div>
        
        <Paragraph 
          className="text-gray-600 mb-2" 
          ellipsis={{ rows: 2 }}
        >
          <span dangerouslySetInnerHTML={{ __html: item.content }} />
        </Paragraph>
        
        {item.highlights && item.highlights.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.highlights.slice(0, 3).map((highlight, index) => (
              <Tag key={index} className="text-xs">
                <span dangerouslySetInnerHTML={{ __html: highlight }} />
              </Tag>
            ))}
          </div>
        )}
        
        {item.metadata && (
          <div className="mt-2 text-xs text-gray-400">
            {Object.entries(item.metadata).slice(0, 3).map(([key, value]) => (
              <span key={key} className="mr-3">
                {key}: {String(value)}
              </span>
            ))}
          </div>
        )}
      </div>
    </List.Item>
  );

  // 渲染搜索结果统计
  const renderSearchStats = () => {
    if (!searchResult) return null;
    
    return (
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <Text>
              找到 <Text strong style={{ color: '#10B981' }}>{searchResult.totalCount}</Text> 条结果
            </Text>
            <Text type="secondary">
              用时 {searchResult.searchTimeMs}ms
            </Text>
            <Tag color="blue">{searchResult.searchType}</Tag>
          </div>
          
          {searchResult.wasCorrected && searchResult.correctedQuery && (
            <div className="flex items-center gap-2">
              <Text type="secondary">已自动纠正为：</Text>
              <Tag color="orange">{searchResult.correctedQuery}</Tag>
            </div>
          )}
        </div>
        
        {searchResult.expandedTerms && searchResult.expandedTerms.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <Text type="secondary" className="text-xs">同义词扩展：</Text>
            {searchResult.expandedTerms.map((term, index) => (
              <Tag key={index} className="text-xs">{term}</Tag>
            ))}
          </div>
        )}
        
        {detectedIntent && (
          <div className="mt-2 flex items-center gap-2">
            <Text type="secondary" className="text-xs">识别意图：</Text>
            <Tag color="purple">{detectedIntent.intentName}</Tag>
            <Text type="secondary" className="text-xs">
              置信度: {(detectedIntent.confidence * 100).toFixed(0)}%
            </Text>
          </div>
        )}
      </div>
    );
  };

  // 补全选项
  const autoCompleteOptions = suggestions.map(s => ({
    value: s.suggestionText,
    label: (
      <div className="flex items-center justify-between">
        <span>{s.suggestionText}</span>
        <Text type="secondary" className="text-xs">
          {s.frequency} 次搜索
        </Text>
      </div>
    )
  }));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-6">
        <Title level={2} className="mb-2 flex items-center gap-2">
          <ThunderboltOutlined style={{ color: '#10B981' }} />
          AI 智能搜索
        </Title>
        <Text type="secondary">
          支持关键词、语义和混合搜索，智能理解您的搜索意图
        </Text>
      </div>

      {/* 搜索区域 */}
      <Card className="mb-6 shadow-sm">
        <div className="space-y-4">
          {/* 搜索模式选择 */}
          <div className="flex items-center justify-between">
            <Radio.Group 
              value={searchMode} 
              onChange={e => setSearchMode(e.target.value)}
              optionType="button"
              buttonStyle="solid"
            >
              {SEARCH_MODES.map(mode => (
                <Tooltip key={mode.key} title={mode.description}>
                  <Radio.Button value={mode.key}>
                    {mode.icon} {mode.label}
                  </Radio.Button>
                </Tooltip>
              ))}
            </Radio.Group>
            
            <Button 
              icon={<SettingOutlined />} 
              onClick={() => {
                form.setFieldsValue(preference);
                setSettingsVisible(true);
              }}
            >
              搜索设置
            </Button>
          </div>
          
          {/* 搜索输入框 */}
          <AutoComplete
            className="w-full"
            options={autoCompleteOptions}
            onSelect={handleSelectSuggestion}
            onSearch={handleInputChange}
            value={searchQuery}
            open={showSuggestions && suggestions.length > 0}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          >
            <Search
              placeholder="输入搜索内容，支持自然语言查询..."
              enterButton={
                <Button type="primary" icon={<SearchOutlined />} style={{ backgroundColor: '#10B981', borderColor: '#10B981' }}>
                  搜索
                </Button>
              }
              size="large"
              loading={loading}
              onSearch={() => handleSearch()}
              allowClear
            />
          </AutoComplete>
        </div>
      </Card>

      {/* 搜索前的提示区域 */}
      {!searchResult && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 热门搜索 */}
          <Card 
            title={
              <span className="flex items-center gap-2">
                <FireOutlined style={{ color: '#F59E0B' }} />
                热门搜索
              </span>
            }
            className="shadow-sm"
            extra={
              <Select 
                defaultValue="daily" 
                size="small"
                style={{ width: 100 }}
                onChange={async (value) => {
                  const data = await searchService.getHotSearches(value, 10);
                  setHotSearches(data);
                }}
              >
                <Select.Option value="daily">今日</Select.Option>
                <Select.Option value="weekly">本周</Select.Option>
                <Select.Option value="monthly">本月</Select.Option>
              </Select>
            }
          >
            <div className="flex flex-wrap gap-2">
              {hotSearches.map((item, index) => (
                <Tag 
                  key={item.id}
                  className="cursor-pointer hover:opacity-80 transition-opacity py-1 px-3"
                  color={index < 3 ? 'red' : 'default'}
                  onClick={() => handleHotSearchClick(item.word)}
                >
                  <span className="mr-1">{index + 1}.</span>
                  {item.word}
                  {item.isTrending && (
                    <RiseOutlined className="ml-1" style={{ color: '#F59E0B' }} />
                  )}
                </Tag>
              ))}
            </div>
            
            {hotSearches.length === 0 && (
              <Empty description="暂无热门搜索" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>

          {/* 搜索历史 */}
          <Card 
            title={
              <span className="flex items-center gap-2">
                <HistoryOutlined style={{ color: '#6366F1' }} />
                搜索历史
              </span>
            }
            className="shadow-sm"
            extra={
              preference?.enableHistory && searchHistory.length > 0 && (
                <Popconfirm
                  title="确定要清除所有搜索历史吗？"
                  onConfirm={handleClearHistory}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                    清除
                  </Button>
                </Popconfirm>
              )
            }
          >
            {preference?.enableHistory ? (
              <List
                size="small"
                dataSource={searchHistory}
                renderItem={item => (
                  <List.Item 
                    className="cursor-pointer hover:bg-gray-50 rounded px-2"
                    onClick={() => handleHistoryClick(item.queryText)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <ClockCircleOutlined className="text-gray-400" />
                        <Text>{item.queryText}</Text>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag className="text-xs">{item.queryType}</Tag>
                        <Text type="secondary" className="text-xs">
                          {item.resultCount} 条结果
                        </Text>
                      </div>
                    </div>
                  </List.Item>
                )}
                locale={{ emptyText: <Empty description="暂无搜索历史" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
              />
            ) : (
              <div className="text-center py-4">
                <Text type="secondary">搜索历史已关闭</Text>
                <br />
                <Button 
                  type="link" 
                  size="small"
                  onClick={() => {
                    form.setFieldsValue({ ...preference, enableHistory: true });
                    setSettingsVisible(true);
                  }}
                >
                  开启搜索历史
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* 搜索结果区域 */}
      {loading && (
        <div className="text-center py-12">
          <Spin size="large" tip="正在搜索..." />
        </div>
      )}

      {searchResult && !loading && (
        <div className="space-y-4">
          {/* 搜索统计 */}
          {renderSearchStats()}
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 搜索结果列表 */}
            <div className="lg:col-span-3">
              <Card 
                title={
                  <span className="flex items-center gap-2">
                    <FileTextOutlined />
                    搜索结果
                  </span>
                }
                className="shadow-sm"
                extra={
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={() => handleSearch()}
                  >
                    刷新
                  </Button>
                }
              >
                {searchResult.items.length > 0 ? (
                  <List
                    dataSource={searchResult.items}
                    renderItem={renderResultItem}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total) => `共 ${total} 条结果`
                    }}
                  />
                ) : (
                  <Empty 
                    description={
                      <span>
                        未找到与 "<Text strong>{searchResult.query}</Text>" 相关的结果
                      </span>
                    }
                  >
                    <Button type="primary" onClick={() => setSearchResult(null)}>
                      重新搜索
                    </Button>
                  </Empty>
                )}
              </Card>
            </div>
            
            {/* 侧边栏 */}
            <div className="space-y-4">
              {/* 相关搜索 */}
              <Card 
                title={
                  <span className="flex items-center gap-2">
                    <SwapOutlined />
                    相关搜索
                  </span>
                }
                size="small"
                className="shadow-sm"
              >
                {relatedQueries.length > 0 ? (
                  <div className="space-y-2">
                    {relatedQueries.map(item => (
                      <div 
                        key={item.id}
                        className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded"
                        onClick={() => handleRelatedClick(item.relatedQuery)}
                      >
                        <Text className="text-sm">{item.relatedQuery}</Text>
                        <Text type="secondary" className="text-xs">
                          {item.clickCount} 次
                        </Text>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty description="暂无相关搜索" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>
              
              {/* 搜索提示 */}
              <Card 
                title={
                  <span className="flex items-center gap-2">
                    <QuestionCircleOutlined />
                    搜索技巧
                  </span>
                }
                size="small"
                className="shadow-sm"
              >
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• 使用引号 "精确匹配" 搜索完整短语</p>
                  <p>• 使用 - 排除特定词汇</p>
                  <p>• 语义搜索支持自然语言提问</p>
                  <p>• 混合搜索综合两种方式的优势</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* 设置抽屉 */}
      <Drawer
        title="搜索设置"
        placement="right"
        width={400}
        open={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setSettingsVisible(false)}>取消</Button>
            <Button 
              type="primary" 
              onClick={() => form.submit()}
              style={{ backgroundColor: '#10B981', borderColor: '#10B981' }}
            >
              保存设置
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSavePreference}
          initialValues={preference || {}}
        >
          <Form.Item
            name="defaultSearchType"
            label="默认搜索模式"
          >
            <Select>
              <Select.Option value="keyword">关键词搜索</Select.Option>
              <Select.Option value="semantic">语义搜索</Select.Option>
              <Select.Option value="hybrid">混合搜索</Select.Option>
            </Select>
          </Form.Item>
          
          <Divider />
          
          <Form.Item
            name="enableAutoCorrect"
            label="自动纠错"
            valuePropName="checked"
          >
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item>
          
          <Form.Item
            name="enableSuggestion"
            label="搜索建议"
            valuePropName="checked"
          >
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item>
          
          <Form.Item
            name="enableHistory"
            label="搜索历史"
            valuePropName="checked"
          >
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item>
          
          <Divider />
          
          <Form.Item
            name="historyRetentionDays"
            label="历史保留天数"
          >
            <InputNumber min={1} max={365} addonAfter="天" style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="preferredResultCount"
            label="每页结果数"
          >
            <Select>
              <Select.Option value={10}>10 条</Select.Option>
              <Select.Option value={20}>20 条</Select.Option>
              <Select.Option value={50}>50 条</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}