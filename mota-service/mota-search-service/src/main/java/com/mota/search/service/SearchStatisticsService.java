package com.mota.search.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 搜索统计服务接口
 * 
 * @author mota
 */
public interface SearchStatisticsService {

    /**
     * 获取搜索概览统计
     *
     * @param tenantId 租户ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 统计数据
     */
    Map<String, Object> getSearchOverview(Long tenantId, LocalDate startDate, LocalDate endDate);

    /**
     * 获取每日搜索趋势
     *
     * @param tenantId 租户ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 每日搜索次数列表
     */
    List<Map<String, Object>> getDailySearchTrend(Long tenantId, LocalDate startDate, LocalDate endDate);

    /**
     * 获取搜索类型分布
     *
     * @param tenantId 租户ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 类型分布数据
     */
    Map<String, Long> getSearchTypeDistribution(Long tenantId, LocalDate startDate, LocalDate endDate);

    /**
     * 获取热门搜索关键词统计
     *
     * @param tenantId 租户ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @param limit 返回数量
     * @return 热门关键词列表
     */
    List<Map<String, Object>> getTopKeywords(Long tenantId, LocalDate startDate, LocalDate endDate, int limit);

    /**
     * 获取零结果搜索统计
     *
     * @param tenantId 租户ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @param limit 返回数量
     * @return 零结果关键词列表
     */
    List<Map<String, Object>> getZeroResultKeywords(Long tenantId, LocalDate startDate, LocalDate endDate, int limit);

    /**
     * 获取搜索点击率统计
     *
     * @param tenantId 租户ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 点击率数据
     */
    Map<String, Object> getClickThroughRate(Long tenantId, LocalDate startDate, LocalDate endDate);

    /**
     * 获取平均搜索响应时间
     *
     * @param tenantId 租户ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 平均响应时间（毫秒）
     */
    Double getAverageResponseTime(Long tenantId, LocalDate startDate, LocalDate endDate);

    /**
     * 获取用户搜索行为分析
     *
     * @param tenantId 租户ID
     * @param userId 用户ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 用户搜索行为数据
     */
    Map<String, Object> getUserSearchBehavior(Long tenantId, Long userId, LocalDate startDate, LocalDate endDate);

    /**
     * 获取搜索模式分布
     *
     * @param tenantId 租户ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 模式分布数据
     */
    Map<String, Long> getSearchModeDistribution(Long tenantId, LocalDate startDate, LocalDate endDate);

    /**
     * 获取索引统计信息
     *
     * @param tenantId 租户ID
     * @return 索引统计数据
     */
    Map<String, Object> getIndexStatistics(Long tenantId);

    /**
     * 导出搜索统计报告
     *
     * @param tenantId 租户ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @param format 导出格式：csv, excel, pdf
     * @return 报告文件路径
     */
    String exportSearchReport(Long tenantId, LocalDate startDate, LocalDate endDate, String format);
}