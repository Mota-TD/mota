package com.mota.ai.service;

import java.util.List;
import java.util.Map;

/**
 * 智能搜索服务接口
 */
public interface SmartSearchService {

    /**
     * 智能搜索
     * @param userId 用户ID
     * @param enterpriseId 企业ID
     * @param query 搜索查询
     * @return 搜索结果
     */
    Map<String, Object> search(Long userId, Long enterpriseId, String query);

    /**
     * 语义搜索
     * @param query 搜索查询
     * @param limit 返回数量
     * @return 搜索结果
     */
    List<Map<String, Object>> semanticSearch(String query, int limit);

    /**
     * 获取搜索建议
     * @param query 搜索查询前缀
     * @return 建议列表
     */
    List<String> getSuggestions(String query);

    /**
     * 获取热门搜索
     * @param enterpriseId 企业ID
     * @param limit 返回数量
     * @return 热门搜索列表
     */
    List<String> getHotSearches(Long enterpriseId, int limit);

    /**
     * 记录搜索日志
     */
    void logSearch(Long userId, Long enterpriseId, String query, String intent, int resultsCount, Integer clickPosition, int searchTime);
}