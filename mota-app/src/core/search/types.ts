/**
 * 搜索服务类型定义
 */

/**
 * 搜索类型
 */
export enum SearchType {
  /** 全部 */
  ALL = 'all',
  /** 项目 */
  PROJECT = 'project',
  /** 任务 */
  TASK = 'task',
  /** 文档 */
  DOCUMENT = 'document',
  /** 人员 */
  PERSON = 'person',
  /** 消息 */
  MESSAGE = 'message',
  /** 知识 */
  KNOWLEDGE = 'knowledge'
}

/**
 * 搜索模式
 */
export enum SearchMode {
  /** 关键词搜索 */
  KEYWORD = 'keyword',
  /** 语义搜索 */
  SEMANTIC = 'semantic',
  /** 模糊搜索 */
  FUZZY = 'fuzzy',
  /** 精确搜索 */
  EXACT = 'exact'
}

/**
 * 排序方式
 */
export enum SortBy {
  /** 相关度 */
  RELEVANCE = 'relevance',
  /** 时间（最新） */
  TIME_DESC = 'time_desc',
  /** 时间（最早） */
  TIME_ASC = 'time_asc',
  /** 热度 */
  POPULARITY = 'popularity',
  /** 评分 */
  SCORE = 'score'
}

/**
 * 搜索请求
 */
export interface SearchRequest {
  /** 搜索关键词 */
  keyword: string;
  /** 搜索类型 */
  type?: SearchType;
  /** 搜索模式 */
  mode?: SearchMode;
  /** 排序方式 */
  sortBy?: SortBy;
  /** 页码 */
  page?: number;
  /** 每页数量 */
  pageSize?: number;
  /** 筛选条件 */
  filters?: SearchFilters;
}

/**
 * 搜索筛选条件
 */
export interface SearchFilters {
  /** 时间范围 */
  timeRange?: {
    start?: string;
    end?: string;
  };
  /** 状态 */
  status?: string[];
  /** 标签 */
  tags?: string[];
  /** 创建人 */
  creatorIds?: string[];
  /** 负责人 */
  ownerIds?: string[];
  /** 优先级 */
  priorities?: string[];
}

/**
 * 搜索结果项
 */
export interface SearchResultItem {
  /** 结果ID */
  id: string;
  /** 结果类型 */
  type: SearchType;
  /** 标题 */
  title: string;
  /** 描述/摘要 */
  description?: string;
  /** 高亮内容 */
  highlights?: string[];
  /** 相关度分数 */
  score: number;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
  /** 额外数据 */
  extra?: Record<string, any>;
}

/**
 * 搜索结果
 */
export interface SearchResult {
  /** 结果列表 */
  items: SearchResultItem[];
  /** 总数 */
  total: number;
  /** 当前页 */
  page: number;
  /** 每页数量 */
  pageSize: number;
  /** 搜索耗时(ms) */
  duration?: number;
  /** 搜索建议 */
  suggestions?: string[];
}

/**
 * 搜索建议
 */
export interface SearchSuggestion {
  /** 建议文本 */
  text: string;
  /** 建议类型 */
  type: 'keyword' | 'history' | 'hot' | 'related';
  /** 权重 */
  weight?: number;
}

/**
 * 搜索历史
 */
export interface SearchHistory {
  /** 历史ID */
  id: string;
  /** 搜索关键词 */
  keyword: string;
  /** 搜索类型 */
  type: SearchType;
  /** 搜索时间 */
  searchTime: string;
  /** 结果数量 */
  resultCount?: number;
}

/**
 * 热门搜索
 */
export interface HotSearch {
  /** 关键词 */
  keyword: string;
  /** 搜索次数 */
  count: number;
  /** 排名 */
  rank: number;
  /** 趋势（上升/下降/持平） */
  trend?: 'up' | 'down' | 'stable';
}

/**
 * 搜索统计
 */
export interface SearchStatistics {
  /** 总搜索次数 */
  totalSearches: number;
  /** 今日搜索次数 */
  todaySearches: number;
  /** 平均结果数 */
  avgResults: number;
  /** 热门关键词 */
  hotKeywords: string[];
  /** 类型分布 */
  typeDistribution: Record<SearchType, number>;
}

/**
 * 高级搜索选项
 */
export interface AdvancedSearchOptions {
  /** 是否包含已删除 */
  includeDeleted?: boolean;
  /** 是否包含归档 */
  includeArchived?: boolean;
  /** 最小相关度 */
  minScore?: number;
  /** 最大结果数 */
  maxResults?: number;
  /** 高亮标签 */
  highlightTag?: string;
  /** 是否返回摘要 */
  returnSummary?: boolean;
}

/**
 * 语义搜索请求
 */
export interface SemanticSearchRequest {
  /** 查询文本 */
  query: string;
  /** 搜索类型 */
  type?: SearchType;
  /** 返回数量 */
  topK?: number;
  /** 相似度阈值 */
  threshold?: number;
}

/**
 * 搜索索引状态
 */
export interface SearchIndexStatus {
  /** 索引名称 */
  name: string;
  /** 文档总数 */
  docCount: number;
  /** 索引大小(bytes) */
  size: number;
  /** 最后更新时间 */
  lastUpdate: string;
  /** 是否正在更新 */
  isUpdating: boolean;
}

/**
 * 搜索配置
 */
export interface SearchConfig {
  /** 是否启用语义搜索 */
  enableSemantic: boolean;
  /** 是否启用模糊搜索 */
  enableFuzzy: boolean;
  /** 是否启用搜索建议 */
  enableSuggestion: boolean;
  /** 是否保存搜索历史 */
  saveHistory: boolean;
  /** 历史记录最大数量 */
  maxHistorySize: number;
  /** 默认每页数量 */
  defaultPageSize: number;
}