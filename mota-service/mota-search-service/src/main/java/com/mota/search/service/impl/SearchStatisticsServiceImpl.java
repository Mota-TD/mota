package com.mota.search.service.impl;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch.cat.IndicesResponse;
import com.mota.search.mapper.SearchHistoryMapper;
import com.mota.search.mapper.SearchHotwordMapper;
import com.mota.search.service.SearchStatisticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * 搜索统计服务实现类
 * 
 * @author mota
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SearchStatisticsServiceImpl implements SearchStatisticsService {

    private final ElasticsearchClient elasticsearchClient;
    private final SearchHistoryMapper searchHistoryMapper;
    private final SearchHotwordMapper searchHotwordMapper;

    @Value("${elasticsearch.index-prefix:mota}")
    private String indexPrefix;

    @Override
    public Map<String, Object> getSearchOverview(Long tenantId, LocalDate startDate, LocalDate endDate) {
        Map<String, Object> overview = new HashMap<>();
        
        try {
            // 总搜索次数
            Long totalSearches = searchHistoryMapper.countByDateRange(tenantId, startDate, endDate);
            overview.put("totalSearches", totalSearches);
            
            // 独立用户数
            Long uniqueUsers = searchHistoryMapper.countUniqueUsers(tenantId, startDate, endDate);
            overview.put("uniqueUsers", uniqueUsers);
            
            // 平均每用户搜索次数
            double avgSearchesPerUser = uniqueUsers > 0 ? (double) totalSearches / uniqueUsers : 0;
            overview.put("avgSearchesPerUser", Math.round(avgSearchesPerUser * 100) / 100.0);
            
            // 零结果搜索次数
            Long zeroResultSearches = searchHistoryMapper.countZeroResultSearches(tenantId, startDate, endDate);
            overview.put("zeroResultSearches", zeroResultSearches);
            
            // 零结果率
            double zeroResultRate = totalSearches > 0 ? (double) zeroResultSearches / totalSearches * 100 : 0;
            overview.put("zeroResultRate", Math.round(zeroResultRate * 100) / 100.0);
            
            // 有点击的搜索次数
            Long clickedSearches = searchHistoryMapper.countClickedSearches(tenantId, startDate, endDate);
            overview.put("clickedSearches", clickedSearches);
            
            // 点击率
            double clickRate = totalSearches > 0 ? (double) clickedSearches / totalSearches * 100 : 0;
            overview.put("clickRate", Math.round(clickRate * 100) / 100.0);
            
            // 平均响应时间
            Double avgResponseTime = searchHistoryMapper.avgResponseTime(tenantId, startDate, endDate);
            overview.put("avgResponseTime", avgResponseTime != null ? Math.round(avgResponseTime) : 0);
            
        } catch (Exception e) {
            log.error("获取搜索概览统计失败: tenantId={}", tenantId, e);
        }
        
        return overview;
    }

    @Override
    public List<Map<String, Object>> getDailySearchTrend(Long tenantId, LocalDate startDate, LocalDate endDate) {
        List<Map<String, Object>> trend = new ArrayList<>();
        
        try {
            List<Map<String, Object>> dailyStats = searchHistoryMapper.getDailyStats(tenantId, startDate, endDate);
            
            // 填充缺失的日期
            Map<String, Map<String, Object>> statsMap = new HashMap<>();
            for (Map<String, Object> stat : dailyStats) {
                String date = stat.get("date").toString();
                statsMap.put(date, stat);
            }
            
            LocalDate current = startDate;
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            while (!current.isAfter(endDate)) {
                String dateStr = current.format(formatter);
                Map<String, Object> dayStat = statsMap.getOrDefault(dateStr, new HashMap<>());
                dayStat.put("date", dateStr);
                dayStat.putIfAbsent("searchCount", 0L);
                dayStat.putIfAbsent("uniqueUsers", 0L);
                dayStat.putIfAbsent("clickCount", 0L);
                trend.add(dayStat);
                current = current.plusDays(1);
            }
            
        } catch (Exception e) {
            log.error("获取每日搜索趋势失败: tenantId={}", tenantId, e);
        }
        
        return trend;
    }

    @Override
    public Map<String, Long> getSearchTypeDistribution(Long tenantId, LocalDate startDate, LocalDate endDate) {
        Map<String, Long> distribution = new HashMap<>();
        
        try {
            List<Map<String, Object>> typeStats = searchHistoryMapper.getTypeDistribution(tenantId, startDate, endDate);
            for (Map<String, Object> stat : typeStats) {
                String type = stat.get("type") != null ? stat.get("type").toString() : "unknown";
                Long count = ((Number) stat.get("count")).longValue();
                distribution.put(type, count);
            }
        } catch (Exception e) {
            log.error("获取搜索类型分布失败: tenantId={}", tenantId, e);
        }
        
        return distribution;
    }

    @Override
    public List<Map<String, Object>> getTopKeywords(Long tenantId, LocalDate startDate, LocalDate endDate, int limit) {
        try {
            return searchHistoryMapper.getTopKeywords(tenantId, startDate, endDate, limit);
        } catch (Exception e) {
            log.error("获取热门关键词统计失败: tenantId={}", tenantId, e);
            return Collections.emptyList();
        }
    }

    @Override
    public List<Map<String, Object>> getZeroResultKeywords(Long tenantId, LocalDate startDate, LocalDate endDate, int limit) {
        try {
            return searchHistoryMapper.getZeroResultKeywords(tenantId, startDate, endDate, limit);
        } catch (Exception e) {
            log.error("获取零结果关键词统计失败: tenantId={}", tenantId, e);
            return Collections.emptyList();
        }
    }

    @Override
    public Map<String, Object> getClickThroughRate(Long tenantId, LocalDate startDate, LocalDate endDate) {
        Map<String, Object> ctrData = new HashMap<>();
        
        try {
            // 总搜索次数
            Long totalSearches = searchHistoryMapper.countByDateRange(tenantId, startDate, endDate);
            ctrData.put("totalSearches", totalSearches);
            
            // 有点击的搜索次数
            Long clickedSearches = searchHistoryMapper.countClickedSearches(tenantId, startDate, endDate);
            ctrData.put("clickedSearches", clickedSearches);
            
            // 总点击率
            double overallCtr = totalSearches > 0 ? (double) clickedSearches / totalSearches * 100 : 0;
            ctrData.put("overallCtr", Math.round(overallCtr * 100) / 100.0);
            
            // 按位置的点击分布
            List<Map<String, Object>> positionStats = searchHistoryMapper.getClickPositionStats(tenantId, startDate, endDate);
            ctrData.put("positionDistribution", positionStats);
            
            // 平均点击位置
            Double avgPosition = searchHistoryMapper.avgClickPosition(tenantId, startDate, endDate);
            ctrData.put("avgClickPosition", avgPosition != null ? Math.round(avgPosition * 100) / 100.0 : 0);
            
        } catch (Exception e) {
            log.error("获取点击率统计失败: tenantId={}", tenantId, e);
        }
        
        return ctrData;
    }

    @Override
    public Double getAverageResponseTime(Long tenantId, LocalDate startDate, LocalDate endDate) {
        try {
            return searchHistoryMapper.avgResponseTime(tenantId, startDate, endDate);
        } catch (Exception e) {
            log.error("获取平均响应时间失败: tenantId={}", tenantId, e);
            return 0.0;
        }
    }

    @Override
    public Map<String, Object> getUserSearchBehavior(Long tenantId, Long userId, LocalDate startDate, LocalDate endDate) {
        Map<String, Object> behavior = new HashMap<>();
        
        try {
            // 用户搜索次数
            Long searchCount = searchHistoryMapper.countByUserAndDateRange(tenantId, userId, startDate, endDate);
            behavior.put("searchCount", searchCount);
            
            // 用户常用关键词
            List<Map<String, Object>> topKeywords = searchHistoryMapper.getUserTopKeywords(tenantId, userId, startDate, endDate, 10);
            behavior.put("topKeywords", topKeywords);
            
            // 用户搜索类型偏好
            List<Map<String, Object>> typePreference = searchHistoryMapper.getUserTypePreference(tenantId, userId, startDate, endDate);
            behavior.put("typePreference", typePreference);
            
            // 用户点击率
            Long clickedCount = searchHistoryMapper.countUserClickedSearches(tenantId, userId, startDate, endDate);
            double userCtr = searchCount > 0 ? (double) clickedCount / searchCount * 100 : 0;
            behavior.put("clickRate", Math.round(userCtr * 100) / 100.0);
            
            // 用户搜索时间分布
            List<Map<String, Object>> hourlyDistribution = searchHistoryMapper.getUserHourlyDistribution(tenantId, userId, startDate, endDate);
            behavior.put("hourlyDistribution", hourlyDistribution);
            
        } catch (Exception e) {
            log.error("获取用户搜索行为分析失败: tenantId={}, userId={}", tenantId, userId, e);
        }
        
        return behavior;
    }

    @Override
    public Map<String, Long> getSearchModeDistribution(Long tenantId, LocalDate startDate, LocalDate endDate) {
        Map<String, Long> distribution = new HashMap<>();
        
        try {
            List<Map<String, Object>> modeStats = searchHistoryMapper.getModeDistribution(tenantId, startDate, endDate);
            for (Map<String, Object> stat : modeStats) {
                String mode = stat.get("mode") != null ? stat.get("mode").toString() : "fulltext";
                Long count = ((Number) stat.get("count")).longValue();
                distribution.put(mode, count);
            }
        } catch (Exception e) {
            log.error("获取搜索模式分布失败: tenantId={}", tenantId, e);
        }
        
        return distribution;
    }

    @Override
    public Map<String, Object> getIndexStatistics(Long tenantId) {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            String indexName = indexPrefix + "_" + tenantId;
            
            // 获取索引信息
            IndicesResponse indicesResponse = elasticsearchClient.cat().indices(i -> i.index(indexName));
            
            if (!indicesResponse.valueBody().isEmpty()) {
                var indexInfo = indicesResponse.valueBody().get(0);
                stats.put("indexName", indexName);
                stats.put("docsCount", indexInfo.docsCount());
                stats.put("storeSize", indexInfo.storeSize());
                stats.put("health", indexInfo.health());
                stats.put("status", indexInfo.status());
            }
            
            // 按类型统计文档数量
            Map<String, Long> typeCount = new HashMap<>();
            // TODO: 实现按类型统计
            stats.put("typeDistribution", typeCount);
            
        } catch (Exception e) {
            log.error("获取索引统计信息失败: tenantId={}", tenantId, e);
        }
        
        return stats;
    }

    @Override
    public String exportSearchReport(Long tenantId, LocalDate startDate, LocalDate endDate, String format) {
        log.info("导出搜索统计报告: tenantId={}, format={}", tenantId, format);
        
        // TODO: 实现报告导出逻辑
        // 1. 收集所有统计数据
        // 2. 根据格式生成报告文件
        // 3. 上传到文件服务
        // 4. 返回下载链接
        
        return "/api/files/download/search-report-" + tenantId + "-" + startDate + "-" + endDate + "." + format;
    }
}