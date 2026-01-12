import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card,
  Input,
  Button,
  Tabs,
  List,
  Tag,
  Space,
  Typography,
  Spin,
  Empty,
  message,
  Tooltip,
  Dropdown,
  Switch,
  Modal,
  Divider,
  Badge,
  AutoComplete,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  SearchOutlined,
  FileTextOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  BookOutlined,
  HistoryOutlined,
  FireOutlined,
  BulbOutlined,
  SettingOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
  RobotOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  StarOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import styles from './index.module.css';
import * as smartSearchApi from '@/services/api/smartSearch';
import type {
  SearchResult,
  SearchResultItem,
  SearchSuggestion,
  SearchHotWord,
  SearchRelatedQuery,
  SearchLog,
  UserSearchPreference,
  SearchIntent,
} from '@/services/api/smartSearch';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { TabPane } = Tabs;

const SmartSearchPage: React.FC = () => {
  // 搜索状态
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'keyword' | 'semantic' | 'hybrid'>('hybrid');
  const [searchType, setSearchType] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  
  // 补全和建议
  const [completions, setCompletions] = useState<SearchSuggestion[]>([]);
  const [showCompletions, setShowCompletions] = useState(false);
  
  // 热词和相关搜索
  const [hotWords, setHotWords] = useState<SearchHotWord[]>([]);
  const [relatedQueries, setRelatedQueries] = useState<SearchRelatedQuery[]>([]);
  
  // 搜索历史
  const [searchHistory, setSearchHistory] = useState<SearchLog[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // 用户偏好
  const [preference, setPreference] = useState<UserSearchPreference | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  // 意图识别
  const [detectedIntent, setDetectedIntent] = useState<SearchIntent | null>(null);
  
  const searchInputRef = useRef<any>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  
  // 防止重复请求的 ref
  const dataLoadedRef = useRef(false);
  const loadingDataRef = useRef(false);

  // 加载热词
  useEffect(() => {
    if (dataLoadedRef.current || loadingDataRef.current) {
      return;
    }
    loadingDataRef.current = true;
    
    const loadInitialData = async () => {
      try {
        await Promise.all([
          loadHotWords(),
          loadSearchHistory(),
          loadUserPreference()
        ]);
        dataLoadedRef.current = true;
      } finally {
        loadingDataRef.current = false;
      }
    };
    
    loadInitialData();
  }, []);

  const loadHotWords = async () => {
    try {
      const data = await smartSearchApi.getHotSearches('daily', 10);
      setHotWords(data || []);
    } catch (error) {
      console.error('加载热词失败:', error);
    }
  };

  const loadSearchHistory = async () => {
    try {
      const data = await smartSearchApi.getSearchHistory(10);
      setSearchHistory(data || []);
    } catch (error) {
      console.error('加载搜索历史失败:', error);
    }
  };

  const loadUserPreference = async () => {
    try {
      const data = await smartSearchApi.getUserPreference();
      setPreference(data);
    } catch (error) {
      console.error('加载用户偏好失败:', error);
    }
  };

  // 智能补全
  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    if (value.length >= 1) {
      debounceTimer.current = setTimeout(async () => {
        try {
          const suggestions = await smartSearchApi.getCompletions(value, 8);
          setCompletions(suggestions || []);
          setShowCompletions(true);
        } catch (error) {
          console.error('获取补全失败:', error);
        }
      }, 300);
    } else {
      setCompletions([]);
      setShowCompletions(false);
    }
  }, []);

  // 执行搜索
  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) {
      message.warning('请输入搜索关键词');
      return;
    }
    
    setLoading(true);
    setShowCompletions(false);
    
    try {
      // 执行搜索
      const result = await smartSearchApi.search(q, searchMode, searchType === 'all' ? undefined : searchType);
      setSearchResult(result);
      
      // 获取相关搜索
      const related = await smartSearchApi.getRelatedQueries(q, 8);
      setRelatedQueries(related || []);
      
      // 更新意图
      if (result.detectedIntent) {
        setDetectedIntent(result.detectedIntent);
      }
      
      // 刷新搜索历史
      loadSearchHistory();
    } catch (error) {
      console.error('搜索失败:', error);
      message.error('搜索失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 清除搜索历史
  const handleClearHistory = async () => {
    Modal.confirm({
      title: '确认清除',
      content: '确定要清除所有搜索历史吗？',
      onOk: async () => {
        try {
          await smartSearchApi.clearSearchHistory();
          setSearchHistory([]);
          message.success('搜索历史已清除');
        } catch (error) {
          message.error('清除失败');
        }
      },
    });
  };

  // 保存用户偏好
  const handleSavePreference = async () => {
    if (!preference) return;
    
    try {
      await smartSearchApi.saveUserPreference(preference);
      message.success('设置已保存');
      setShowSettings(false);
    } catch (error) {
      message.error('保存失败');
    }
  };

  // 渲染搜索结果项
  const renderResultItem = (item: SearchResultItem) => {
    const getIcon = () => {
      switch (item.type) {
        case 'document':
          return <FileTextOutlined className={styles.resultIcon} />;
        case 'task':
          return <CheckSquareOutlined className={styles.resultIcon} />;
        case 'project':
          return <ProjectOutlined className={styles.resultIcon} />;
        case 'knowledge':
          return <BookOutlined className={styles.resultIcon} />;
        default:
          return <FileTextOutlined className={styles.resultIcon} />;
      }
    };

    const getTypeLabel = () => {
      switch (item.type) {
        case 'document':
          return '文档';
        case 'task':
          return '任务';
        case 'project':
          return '项目';
        case 'knowledge':
          return '知识';
        default:
          return '其他';
      }
    };

    return (
      <List.Item className={styles.resultItem}>
        <div className={styles.resultContent}>
          <div className={styles.resultHeader}>
            {getIcon()}
            <Tag color="blue" className={styles.typeTag}>{getTypeLabel()}</Tag>
            <Text className={styles.resultTitle}>{item.title}</Text>
            <Badge 
              count={`${(item.score * 100).toFixed(0)}%`} 
              className={styles.scoreBadge}
              style={{ backgroundColor: item.score > 0.8 ? '#52c41a' : item.score > 0.5 ? '#faad14' : '#ff4d4f' }}
            />
          </div>
          <Paragraph 
            className={styles.resultDescription}
            ellipsis={{ rows: 2 }}
          >
            {item.content}
          </Paragraph>
          {item.highlights && item.highlights.length > 0 && (
            <div className={styles.highlights}>
              {item.highlights.map((h, i) => (
                <span key={i} dangerouslySetInnerHTML={{ __html: h }} className={styles.highlight} />
              ))}
            </div>
          )}
        </div>
      </List.Item>
    );
  };

  // 渲染补全选项
  const completionOptions = completions.map((c) => ({
    value: c.suggestionText,
    label: (
      <div className={styles.completionItem}>
        {c.suggestionType === 'hot' ? (
          <FireOutlined className={styles.hotIcon} />
        ) : (
          <SearchOutlined className={styles.searchIcon} />
        )}
        <span>{c.suggestionText}</span>
        {c.frequency > 0 && (
          <span className={styles.frequency}>{c.frequency}次搜索</span>
        )}
      </div>
    ),
  }));

  return (
    <div className={styles.container}>
      {/* 搜索头部 */}
      <div className={styles.searchHeader}>
        <Title level={2} className={styles.title}>
          <RobotOutlined /> 智能搜索
        </Title>
        <Text type="secondary">
          支持全文检索、语义搜索、混合检索，智能理解您的搜索意图
        </Text>
      </div>

      {/* 搜索框 */}
      <Card className={styles.searchCard}>
        <div className={styles.searchBox}>
          <AutoComplete
            className={styles.searchInput}
            options={showCompletions ? completionOptions : []}
            onSelect={(value) => {
              setQuery(value);
              handleSearch(value);
            }}
            onSearch={handleInputChange}
            value={query}
          >
            <Search
              ref={searchInputRef}
              placeholder="输入关键词搜索文档、任务、项目..."
              enterButton={
                <Button type="primary" icon={<SearchOutlined />} loading={loading}>
                  搜索
                </Button>
              }
              size="large"
              onSearch={() => handleSearch()}
            />
          </AutoComplete>
        </div>

        {/* 搜索模式选择 */}
        <div className={styles.searchOptions}>
          <Space size="large">
            <span>搜索模式：</span>
            <Tabs
              activeKey={searchMode}
              onChange={(key) => setSearchMode(key as any)}
              size="small"
              className={styles.modeTabs}
            >
              <TabPane 
                tab={<span><ThunderboltOutlined /> 混合检索</span>} 
                key="hybrid" 
              />
              <TabPane 
                tab={<span><SearchOutlined /> 关键词</span>} 
                key="keyword" 
              />
              <TabPane 
                tab={<span><BulbOutlined /> 语义搜索</span>} 
                key="semantic" 
              />
            </Tabs>
          </Space>
          
          <Space>
            <Tooltip title="搜索历史">
              <Button 
                icon={<HistoryOutlined />} 
                onClick={() => setShowHistory(!showHistory)}
              />
            </Tooltip>
            <Tooltip title="搜索设置">
              <Button 
                icon={<SettingOutlined />} 
                onClick={() => setShowSettings(true)}
              />
            </Tooltip>
          </Space>
        </div>

        {/* 搜索类型筛选 */}
        <div className={styles.typeFilter}>
          <FilterOutlined /> 筛选：
          <Space>
            {[
              { key: 'all', label: '全部' },
              { key: 'document', label: '文档' },
              { key: 'task', label: '任务' },
              { key: 'project', label: '项目' },
              { key: 'knowledge', label: '知识' },
            ].map((t) => (
              <Tag
                key={t.key}
                color={searchType === t.key ? 'blue' : 'default'}
                className={styles.filterTag}
                onClick={() => setSearchType(t.key)}
              >
                {t.label}
              </Tag>
            ))}
          </Space>
        </div>
      </Card>

      {/* 搜索历史面板 */}
      {showHistory && (
        <Card 
          className={styles.historyCard}
          title={<span><HistoryOutlined /> 搜索历史</span>}
          extra={
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
              onClick={handleClearHistory}
            >
              清除历史
            </Button>
          }
        >
          {searchHistory.length > 0 ? (
            <div className={styles.historyList}>
              {searchHistory.map((h) => (
                <Tag 
                  key={h.id} 
                  className={styles.historyTag}
                  onClick={() => {
                    setQuery(h.queryText);
                    handleSearch(h.queryText);
                  }}
                >
                  <ClockCircleOutlined /> {h.queryText}
                </Tag>
              ))}
            </div>
          ) : (
            <Empty description="暂无搜索历史" />
          )}
        </Card>
      )}

      {/* 热门搜索 */}
      {!searchResult && hotWords.length > 0 && (
        <Card className={styles.hotCard}>
          <div className={styles.hotHeader}>
            <FireOutlined className={styles.fireIcon} />
            <span>热门搜索</span>
          </div>
          <div className={styles.hotList}>
            {hotWords.map((hw, index) => (
              <Tag 
                key={hw.id}
                className={styles.hotTag}
                color={index < 3 ? 'red' : 'default'}
                onClick={() => {
                  setQuery(hw.word);
                  handleSearch(hw.word);
                }}
              >
                <span className={styles.hotRank}>{index + 1}</span>
                {hw.word}
                {hw.isTrending && <FireOutlined className={styles.trendingIcon} />}
              </Tag>
            ))}
          </div>
        </Card>
      )}

      {/* 搜索结果 */}
      {loading ? (
        <Card className={styles.loadingCard}>
          <Spin size="large" tip="正在搜索..." />
        </Card>
      ) : searchResult ? (
        <div className={styles.resultSection}>
          {/* 搜索统计 */}
          <Card className={styles.statsCard}>
            <Row gutter={24}>
              <Col span={6}>
                <Statistic 
                  title="搜索结果" 
                  value={searchResult.totalCount} 
                  suffix="条"
                />
              </Col>
              <Col span={6}>
                <Statistic 
                  title="搜索耗时" 
                  value={searchResult.searchTimeMs} 
                  suffix="ms"
                />
              </Col>
              <Col span={6}>
                <Statistic 
                  title="搜索模式" 
                  value={searchResult.searchType === 'hybrid' ? '混合' : 
                         searchResult.searchType === 'keyword' ? '关键词' : '语义'}
                />
              </Col>
              <Col span={6}>
                {searchResult.detectedIntent && (
                  <Statistic 
                    title="识别意图" 
                    value={searchResult.detectedIntent.intentName}
                    valueStyle={{ fontSize: 16 }}
                  />
                )}
              </Col>
            </Row>
            
            {/* 纠错提示 */}
            {searchResult.wasCorrected && (
              <div className={styles.correctionTip}>
                <BulbOutlined /> 已自动纠正为：
                <Text strong>{searchResult.correctedQuery}</Text>
                <Button 
                  type="link" 
                  size="small"
                  onClick={() => {
                    setQuery(searchResult.query);
                    handleSearch(searchResult.query);
                  }}
                >
                  搜索原词
                </Button>
              </div>
            )}
            
            {/* 同义词扩展 */}
            {searchResult.expandedTerms && searchResult.expandedTerms.length > 1 && (
              <div className={styles.expandedTerms}>
                <SyncOutlined /> 同义词扩展：
                {searchResult.expandedTerms.map((term, i) => (
                  <Tag key={i} color="cyan">{term}</Tag>
                ))}
              </div>
            )}
          </Card>

          {/* 结果列表 */}
          <Card className={styles.resultCard}>
            {searchResult.items.length > 0 ? (
              <List
                dataSource={searchResult.items}
                renderItem={renderResultItem}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `共 ${total} 条结果`,
                }}
              />
            ) : (
              <Empty description="未找到相关结果" />
            )}
          </Card>

          {/* 相关搜索 */}
          {relatedQueries.length > 0 && (
            <Card className={styles.relatedCard}>
              <div className={styles.relatedHeader}>
                <StarOutlined /> 相关搜索
              </div>
              <div className={styles.relatedList}>
                {relatedQueries.map((rq) => (
                  <Tag 
                    key={rq.id}
                    className={styles.relatedTag}
                    onClick={() => {
                      setQuery(rq.relatedQuery);
                      handleSearch(rq.relatedQuery);
                    }}
                  >
                    {rq.relatedQuery}
                  </Tag>
                ))}
              </div>
            </Card>
          )}
        </div>
      ) : null}

      {/* 设置弹窗 */}
      <Modal
        title="搜索设置"
        open={showSettings}
        onOk={handleSavePreference}
        onCancel={() => setShowSettings(false)}
      >
        {preference && (
          <div className={styles.settingsForm}>
            <div className={styles.settingItem}>
              <span>启用自动纠错</span>
              <Switch 
                checked={preference.enableAutoCorrect}
                onChange={(checked) => setPreference({ ...preference, enableAutoCorrect: checked })}
              />
            </div>
            <div className={styles.settingItem}>
              <span>启用搜索建议</span>
              <Switch 
                checked={preference.enableSuggestion}
                onChange={(checked) => setPreference({ ...preference, enableSuggestion: checked })}
              />
            </div>
            <div className={styles.settingItem}>
              <span>保存搜索历史</span>
              <Switch 
                checked={preference.enableHistory}
                onChange={(checked) => setPreference({ ...preference, enableHistory: checked })}
              />
            </div>
            <div className={styles.settingItem}>
              <span>默认搜索类型</span>
              <Tabs
                activeKey={preference.defaultSearchType}
                onChange={(key) => setPreference({ ...preference, defaultSearchType: key })}
                size="small"
              >
                <TabPane tab="全部" key="all" />
                <TabPane tab="文档" key="document" />
                <TabPane tab="任务" key="task" />
                <TabPane tab="项目" key="project" />
              </Tabs>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SmartSearchPage;