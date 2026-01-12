package com.mota.ai.service;

import com.mota.ai.entity.AIUsageStats;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * AI使用统计服务接口
 */
public interface AIUsageStatsService {

    // ==================== 统计记录 ====================

    /**
     * 记录API调用
     */
    void recordApiCall(Long modelConfigId, Long userId, Integer inputTokens, Integer outputTokens,
                       BigDecimal cost, Integer responseTime, boolean success, String errorMessage);

    /**
     * 获取统计记录
     */
    AIUsageStats getStats(Long id);

    /**
     * 获取指定日期的统计
     */
    AIUsageStats getStatsByDate(Long modelConfigId, LocalDate date);

    // ==================== 统计查询 ====================

    /**
     * 获取日期范围内的统计列表
     */
    List<AIUsageStats> getStatsByDateRange(LocalDate startDate, LocalDate endDate);

    /**
     * 获取模型的统计列表
     */
    List<AIUsageStats> getStatsByModel(Long modelConfigId, LocalDate startDate, LocalDate endDate);

    /**
     * 获取用户的统计列表
     */
    List<AIUsageStats> getStatsByUser(Long userId, LocalDate startDate, LocalDate endDate);

    // ==================== 聚合统计 ====================

    /**
     * 获取租户总请求数
     */
    Long getTotalRequests(LocalDate startDate, LocalDate endDate);

    /**
     * 获取租户总Token数
     */
    Long getTotalTokens(LocalDate startDate, LocalDate endDate);

    /**
     * 获取租户总费用
     */
    BigDecimal getTotalCost(LocalDate startDate, LocalDate endDate);

    /**
     * 获取模型使用排行
     */
    List<Map<String, Object>> getModelUsageRanking(LocalDate startDate, LocalDate endDate, int limit);

    /**
     * 获取用户使用排行
     */
    List<Map<String, Object>> getUserUsageRanking(LocalDate startDate, LocalDate endDate, int limit);

    // ==================== 趋势分析 ====================

    /**
     * 获取每日请求趋势
     */
    List<Map<String, Object>> getDailyRequestTrend(LocalDate startDate, LocalDate endDate);

    /**
     * 获取每日费用趋势
     */
    List<Map<String, Object>> getDailyCostTrend(LocalDate startDate, LocalDate endDate);

    /**
     * 获取每日Token使用趋势
     */
    List<Map<String, Object>> getDailyTokenTrend(LocalDate startDate, LocalDate endDate);

    // ==================== 实时统计 ====================

    /**
     * 获取今日统计摘要
     */
    Map<String, Object> getTodaySummary();

    /**
     * 获取本月统计摘要
     */
    Map<String, Object> getMonthSummary();

    /**
     * 获取实时QPS
     */
    Double getCurrentQps();

    // ==================== 数据清理 ====================

    /**
     * 清理过期统计数据
     */
    void cleanExpiredStats(int retentionDays);

    /**
     * 聚合历史数据
     */
    void aggregateHistoricalData(LocalDate date);
}