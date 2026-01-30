/**
 * 搜索服务实现
 */

import http from '../http/request';
import {
  SearchType,
  SearchMode,
  SortBy,
  type SearchRequest,
  type SearchResult,
  type SearchSuggestion,
  type SearchHistory,
  type HotSearch,
  type SearchStatistics,
  type SemanticSearchRequest,
  type SearchIndexStatus,
  type SearchConfig
} from './types';

/**
 * 搜索服务类
 */
class SearchService {
  private readonly baseUrl = '/api/search';
  private readonly storageKey = 'search_history';
  private readonly maxHistorySize = 20;

  /**
   * 搜索
   */
  async search(request: SearchRequest): Promise<SearchResult> {
    const result = await http.post<SearchResult>(`${this.baseUrl}/query`, request);
    
    // 保存搜索历史
    if (request.keyword) {
      this.saveHistory(request.keyword, request.type || SearchType.ALL);
    }
    
    return result;
  }

  /**
   * 语义搜索
   */
  async semanticSearch(request: SemanticSearchRequest): Promise<SearchResult> {
    return await http.post<SearchResult>(`${this.baseUrl}/semantic`, request);
  }

  /**
   * 获取搜索建议
   */
  async getSuggestions(keyword: string, type?: SearchType): Promise<SearchSuggestion[]> {
    if (!keyword || keyword.length < 2) {
      return this.getLocalSuggestions(keyword);
    }
    
    try {
      return await http.get<SearchSuggestion[]>(`${this.baseUrl}/suggestions`, {
        keyword,
        type
      });
    } catch (error) {
      return this.getLocalSuggestions(keyword);
    }
  }

  /**
   * 获取本地搜索建议
   */
  private getLocalSuggestions(keyword: string): SearchSuggestion[] {
    const history = this.getHistory();
    const suggestions: SearchSuggestion[] = [];
    
    // 从历史记录中筛选
    if (keyword) {
      const filtered = history.filter(h => 
        h.keyword.toLowerCase().includes(keyword.toLowerCase())
      );
      
      filtered.slice(0, 5).forEach(h => {
        suggestions.push({
          text: h.keyword,
          type: 'history'
        });
      });
    } else {
      // 返回最近的搜索历史
      history.slice(0, 5).forEach(h => {
        suggestions.push({
          text: h.keyword,
          type: 'history'
        });
      });
    }
    
    return suggestions;
  }

  /**
   * 获取热门搜索
   */
  async getHotSearches(limit: number = 10): Promise<HotSearch[]> {
    return await http.get<HotSearch[]>(`${this.baseUrl}/hot`, { limit });
  }

  /**
   * 获取搜索历史
   */
  getHistory(): SearchHistory[] {
    try {
      const data = uni.getStorageSync(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * 保存搜索历史
   */
  private saveHistory(keyword: string, type: SearchType): void {
    try {
      const history = this.getHistory();
      
      // 移除重复项
      const filtered = history.filter(h => h.keyword !== keyword);
      
      // 添加新记录
      const newItem: SearchHistory = {
        id: Date.now().toString(),
        keyword,
        type,
        searchTime: new Date().toISOString()
      };
      
      filtered.unshift(newItem);
      
      // 限制数量
      const limited = filtered.slice(0, this.maxHistorySize);
      
      uni.setStorageSync(this.storageKey, JSON.stringify(limited));
    } catch (error) {
      console.error('保存搜索历史失败:', error);
    }
  }

  /**
   * 删除搜索历史
   */
  deleteHistory(id: string): void {
    try {
      const history = this.getHistory();
      const filtered = history.filter(h => h.id !== id);
      uni.setStorageSync(this.storageKey, JSON.stringify(filtered));
    } catch (error) {
      console.error('删除搜索历史失败:', error);
    }
  }

  /**
   * 清空搜索历史
   */
  clearHistory(): void {
    try {
      uni.removeStorageSync(this.storageKey);
    } catch (error) {
      console.error('清空搜索历史失败:', error);
    }
  }

  /**
   * 获取搜索统计
   */
  async getStatistics(): Promise<SearchStatistics> {
    return await http.get<SearchStatistics>(`${this.baseUrl}/statistics`);
  }

  /**
   * 获取索引状态
   */
  async getIndexStatus(): Promise<SearchIndexStatus[]> {
    return await http.get<SearchIndexStatus[]>(`${this.baseUrl}/index/status`);
  }

  /**
   * 重建索引
   */
  async rebuildIndex(type?: SearchType): Promise<void> {
    await http.post(`${this.baseUrl}/index/rebuild`, { type });
  }

  /**
   * 获取搜索配置
   */
  async getConfig(): Promise<SearchConfig> {
    return await http.get<SearchConfig>(`${this.baseUrl}/config`);
  }

  /**
   * 更新搜索配置
   */
  async updateConfig(config: Partial<SearchConfig>): Promise<SearchConfig> {
    return await http.put<SearchConfig>(`${this.baseUrl}/config`, config);
  }

  /**
   * 高亮关键词
   */
  highlightKeyword(text: string, keyword: string, tag: string = 'em'): string {
    if (!keyword || !text) return text;
    
    const regex = new RegExp(`(${this.escapeRegex(keyword)})`, 'gi');
    return text.replace(regex, `<${tag}>$1</${tag}>`);
  }

  /**
   * 转义正则表达式特殊字符
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * 获取搜索类型列表
   */
  getSearchTypes(): Array<{ value: SearchType; label: string; icon: string }> {
    return [
      { value: SearchType.ALL, label: '全部', icon: '🔍' },
      { value: SearchType.PROJECT, label: '项目', icon: '📁' },
      { value: SearchType.TASK, label: '任务', icon: '✅' },
      { value: SearchType.DOCUMENT, label: '文档', icon: '📄' },
      { value: SearchType.PERSON, label: '人员', icon: '👤' },
      { value: SearchType.MESSAGE, label: '消息', icon: '💬' },
      { value: SearchType.KNOWLEDGE, label: '知识', icon: '💡' }
    ];
  }

  /**
   * 获取排序方式列表
   */
  getSortOptions(): Array<{ value: SortBy; label: string }> {
    return [
      { value: SortBy.RELEVANCE, label: '相关度' },
      { value: SortBy.TIME_DESC, label: '最新' },
      { value: SortBy.TIME_ASC, label: '最早' },
      { value: SortBy.POPULARITY, label: '热度' },
      { value: SortBy.SCORE, label: '评分' }
    ];
  }

  /**
   * 格式化搜索结果数量
   */
  formatResultCount(count: number): string {
    if (count === 0) return '无结果';
    if (count === 1) return '1个结果';
    if (count < 1000) return `${count}个结果`;
    if (count < 10000) return `${(count / 1000).toFixed(1)}k个结果`;
    return `${(count / 10000).toFixed(1)}w个结果`;
  }

  /**
   * 获取类型图标
   */
  getTypeIcon(type: SearchType): string {
    const types = this.getSearchTypes();
    const found = types.find(t => t.value === type);
    return found?.icon || '📄';
  }

  /**
   * 获取类型名称
   */
  getTypeName(type: SearchType): string {
    const types = this.getSearchTypes();
    const found = types.find(t => t.value === type);
    return found?.label || '未知';
  }
}

// 导出单例
export const searchService = new SearchService();