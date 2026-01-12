package com.mota.ai.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mota.ai.entity.AIUsageStats;
import com.mota.ai.mapper.AIUsageStatsMapper;
import com.mota.ai.service.AIUsageStatsService;
import com.mota.common.core.context.TenantContext;
import com.mota.common.redis.service.RedisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * AI使用统计服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AIUsageStatsServiceImpl implements AIUsageStatsService {

    private final AIUsageStatsMapper usageStatsMapper;
    private final RedisService redisService;

    private static final String QPS_KEY = "ai:qps:";
    private static final String DAILY_STATS_KEY = "ai:daily:stats:";

    @Override
    @Async
    @Transactional
    public void recordApiCall(Long modelConfigId, Long userId, Integer inputTokens, Integer outputTokens,
                              BigDecimal cost, Integer responseTime, boolean success, String errorMessage) {
        Long tenantId = TenantContext.getTenantId();
        LocalDate today = LocalDate.now();
        
        // 获取或创建今日统计记录
        AIUsageStats stats = getOrCreateStats(tenantId, modelConfigId, userId, today);
        
        // 更新统计数据
        stats.setRequestCount(stats.getRequestCount() + 1);
        stats.setTotalInputTokens(stats.getTotalInputTokens() + (inputTokens != null ? inputTokens : 0));
        stats.setTotalOutputTokens(stats.getTotalOutputTokens() + (outputTokens != null ? outputTokens : 0));
        stats.setTotalCost(stats.getTotalCost().add(cost != null ? cost : BigDecimal.ZERO));
        
        if (success) {
            stats.setSuccessCount(stats.getSuccessCount() + 1);
        } else {
            stats.setFailureCount(stats.getFailureCount() + 1);
        }
        
        // 更新响应时间统计
        if (responseTime != null) {
            stats.setTotalResponseTime(stats.getTotalResponseTime() + responseTime);
            if (responseTime < stats.getMinResponseTime() || stats.getMinResponseTime() == 0) {
                stats.setMinResponseTime(responseTime);
            }
            if (responseTime > stats.getMaxResponseTime()) {
                stats.setMaxResponseTime(responseTime);
            }
            // 计算平均响应时间
            int avgResponseTime = stats.getTotalResponseTime() / stats.getRequestCount();
            stats.setAvgResponseTime(avgResponseTime);
        }
        
        usageStatsMapper.updateById(stats);
        
        // 更新Redis中的QPS计数
        updateQpsCounter(tenantId);
        
        // 更新Redis中的日统计缓存
        invalidateDailyStatsCache(tenantId, today);
    }

    @Override
    public AIUsageStats getStats(Long id) {
        return usageStatsMapper.selectById(id);
    }

    @Override
    public AIUsageStats getStatsByDate(Long modelConfigId, LocalDate date) {
        Long tenantId = TenantContext.getTenantId();
        return usageStatsMapper.selectByModelAndDate(tenantId, modelConfigId, date);
    }

    @Override
    public List<AIUsageStats> getStatsByDateRange(LocalDate startDate, LocalDate endDate) {
        Long tenantId = TenantContext.getTenantId();
        return usageStatsMapper.selectByDateRange(tenantId, startDate, endDate);
    }

    @Override
    public List<AIUsageStats> getStatsByModel(Long modelConfigId, LocalDate startDate, LocalDate endDate) {
        Long tenantId = TenantContext.getTenantId();
        return usageStatsMapper.selectByModelAndDateRange(tenantId, modelConfigId, startDate, endDate);
    }

    @Override
    public List<AIUsageStats> getStatsByUser(Long userId, LocalDate startDate, LocalDate endDate) {
        Long tenantId = TenantContext.getTenantId();
        return usageStatsMapper.selectByUserAndDateRange(tenantId, userId, startDate, endDate);
    }

    @Override
    public Long getTotalRequests(LocalDate startDate, LocalDate endDate) {
        Long tenantId = TenantContext.getTenantId();
        Long total = usageStatsMapper.sumRequestCount(tenantId, startDate, endDate);
        return total != null ? total : 0L;
    }

    @Override
    public Long getTotalTokens(LocalDate startDate, LocalDate endDate) {
        Long tenantId = TenantContext.getTenantId();
        Long inputTokens = usageStatsMapper.sumInputTokens(tenantId, startDate, endDate);
        Long outputTokens = usageStatsMapper.sumOutputTokens(tenantId, startDate, endDate);
        return (inputTokens != null ? inputTokens : 0L) + (outputTokens != null ? outputTokens : 0L);
    }

    @Override
    public BigDecimal getTotalCost(LocalDate startDate, LocalDate endDate) {
        Long tenantId = TenantContext.getTenantId();
        BigDecimal total = usageStatsMapper.sumCost(tenantId, startDate, endDate);
        return total != null ? total : BigDecimal.ZERO;
    }

    @Override
    public List<Map<String, Object>> getModelUsageRanking(LocalDate startDate, LocalDate endDate, int limit) {
        Long tenantId = TenantContext.getTenantId();
        List<AIUsageStats> stats = getStatsByDateRange(startDate, endDate);
        
        // 按模型聚合
        Map<Long, Map<String, Object>> modelStats = new HashMap<>();
        for (AIUsageStats stat : stats) {
            Long modelId = stat.getModelConfigId();
            Map<String, Object> modelStat = modelStats.computeIfAbsent(modelId, k -> {
                Map<String, Object> m = new HashMap<>();
                m.put("modelConfigId", modelId);
                m.put("requestCount", 0L);
                m.put("totalTokens", 0L);
                m.put("totalCost", BigDecimal.ZERO);
                return m;
            });
            
            modelStat.put("requestCount", (Long) modelStat.get("requestCount") + stat.getRequestCount());
            modelStat.put("totalTokens", (Long) modelStat.get("totalTokens") + stat.getTotalInputTokens() + stat.getTotalOutputTokens());
            modelStat.put("totalCost", ((BigDecimal) modelStat.get("totalCost")).add(stat.getTotalCost()));
        }
        
        // 排序并限制数量
        return modelStats.values().stream()
            .sorted((a, b) -> Long.compare((Long) b.get("requestCount"), (Long) a.get("requestCount")))
            .limit(limit)
            .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getUserUsageRanking(LocalDate startDate, LocalDate endDate, int limit) {
        Long tenantId = TenantContext.getTenantId();
        List<AIUsageStats> stats = getStatsByDateRange(startDate, endDate);
        
        // 按用户聚合
        Map<Long, Map<String, Object>> userStats = new HashMap<>();
        for (AIUsageStats stat : stats) {
            if (stat.getUserId() == null) continue;
            
            Long userId = stat.getUserId();
            Map<String, Object> userStat = userStats.computeIfAbsent(userId, k -> {
                Map<String, Object> m = new HashMap<>();
                m.put("userId", userId);
                m.put("requestCount", 0L);
                m.put("totalTokens", 0L);
                m.put("totalCost", BigDecimal.ZERO);
                return m;
            });
            
            userStat.put("requestCount", (Long) userStat.get("requestCount") + stat.getRequestCount());
            userStat.put("totalTokens", (Long) userStat.get("totalTokens") + stat.getTotalInputTokens() + stat.getTotalOutputTokens());
            userStat.put("totalCost", ((BigDecimal) userStat.get("totalCost")).add(stat.getTotalCost()));
        }
        
        // 排序并限制数量
        return userStats.values().stream()
            .sorted((a, b) -> Long.compare((Long) b.get("requestCount"), (Long) a.get("requestCount")))
            .limit(limit)
            .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getDailyRequestTrend(LocalDate startDate, LocalDate endDate) {
        Long tenantId = TenantContext.getTenantId();
        List<AIUsageStats> stats = getStatsByDateRange(startDate, endDate);
        
        // 按日期聚合
        Map<LocalDate, Long> dailyRequests = new TreeMap<>();
        for (AIUsageStats stat : stats) {
            dailyRequests.merge(stat.getStatsDate(), (long) stat.getRequestCount(), Long::sum);
        }
        
        return dailyRequests.entrySet().stream()
            .map(e -> {
                Map<String, Object> m = new HashMap<>();
                m.put("date", e.getKey().toString());
                m.put("requestCount", e.getValue());
                return m;
            })
            .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getDailyCostTrend(LocalDate startDate, LocalDate endDate) {
        Long tenantId = TenantContext.getTenantId();
        List<AIUsageStats> stats = getStatsByDateRange(startDate, endDate);
        
        // 按日期聚合
        Map<LocalDate, BigDecimal> dailyCosts = new TreeMap<>();
        for (AIUsageStats stat : stats) {
            dailyCosts.merge(stat.getStatsDate(), stat.getTotalCost(), BigDecimal::add);
        }
        
        return dailyCosts.entrySet().stream()
            .map(e -> {
                Map<String, Object> m = new HashMap<>();
                m.put("date", e.getKey().toString());
                m.put("cost", e.getValue());
                return m;
            })
            .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getDailyTokenTrend(LocalDate startDate, LocalDate endDate) {
        Long tenantId = TenantContext.getTenantId();
        List<AIUsageStats> stats = getStatsByDateRange(startDate, endDate);
        
        // 按日期聚合
        Map<LocalDate, Long> dailyTokens = new TreeMap<>();
        for (AIUsageStats stat : stats) {
            long tokens = stat.getTotalInputTokens() + stat.getTotalOutputTokens();
            dailyTokens.merge(stat.getStatsDate(), tokens, Long::sum);
        }
        
        return dailyTokens.entrySet().stream()
            .map(e -> {
                Map<String, Object> m = new HashMap<>();
                m.put("date", e.getKey().toString());
                m.put("tokens", e.getValue());
                return m;
            })
            .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getTodaySummary() {
        LocalDate today = LocalDate.now();
        Long tenantId = TenantContext.getTenantId();
        
        // 尝试从缓存获取
        String cacheKey = DAILY_STATS_KEY + tenantId + ":" + today;
        Map<String, Object> cached = redisService.getCacheObject(cacheKey);
        if (cached != null) {
            return cached;
        }
        
        // 计算今日统计
        Map<String, Object> summary = new HashMap<>();
        summary.put("date", today.toString());
        summary.put("requestCount", getTotalRequests(today, today));
        summary.put("totalTokens", getTotalTokens(today, today));
        summary.put("totalCost", getTotalCost(today, today));
        
        // 缓存5分钟
        redisService.setCacheObject(cacheKey, summary, 5L, TimeUnit.MINUTES);
        
        return summary;
    }

    @Override
    public Map<String, Object> getMonthSummary() {
        LocalDate today = LocalDate.now();
        LocalDate monthStart = today.withDayOfMonth(1);
        Long tenantId = TenantContext.getTenantId();
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("month", today.getYear() + "-" + String.format("%02d", today.getMonthValue()));
        summary.put("requestCount", getTotalRequests(monthStart, today));
        summary.put("totalTokens", getTotalTokens(monthStart, today));
        summary.put("totalCost", getTotalCost(monthStart, today));
        
        return summary;
    }

    @Override
    public Double getCurrentQps() {
        Long tenantId = TenantContext.getTenantId();
        String key = QPS_KEY + tenantId;
        Long count = redisService.getCacheObject(key);
        return count != null ? count / 60.0 : 0.0;
    }

    @Override
    @Transactional
    public void cleanExpiredStats(int retentionDays) {
        LocalDate cutoffDate = LocalDate.now().minusDays(retentionDays);
        
        LambdaQueryWrapper<AIUsageStats> wrapper = new LambdaQueryWrapper<>();
        wrapper.lt(AIUsageStats::getStatsDate, cutoffDate);
        
        int deleted = usageStatsMapper.delete(wrapper);
        log.info("清理过期统计数据: {} 条", deleted);
    }

    @Override
    @Transactional
    public void aggregateHistoricalData(LocalDate date) {
        // TODO: 实现历史数据聚合逻辑
        // 可以将细粒度数据聚合为日/周/月级别的汇总数据
        log.info("聚合历史数据: {}", date);
    }

    // ==================== 辅助方法 ====================

    /**
     * 获取或创建统计记录
     */
    private AIUsageStats getOrCreateStats(Long tenantId, Long modelConfigId, Long userId, LocalDate date) {
        AIUsageStats stats = usageStatsMapper.selectByModelAndDate(tenantId, modelConfigId, date);
        
        if (stats == null) {
            stats = new AIUsageStats();
            stats.setTenantId(tenantId);
            stats.setModelConfigId(modelConfigId);
            stats.setUserId(userId);
            stats.setStatsDate(date);
            stats.setRequestCount(0);
            stats.setSuccessCount(0);
            stats.setFailureCount(0);
            stats.setTotalInputTokens(0L);
            stats.setTotalOutputTokens(0L);
            stats.setTotalCost(BigDecimal.ZERO);
            stats.setTotalResponseTime(0);
            stats.setAvgResponseTime(0);
            stats.setMinResponseTime(0);
            stats.setMaxResponseTime(0);
            usageStatsMapper.insert(stats);
        }
        
        return stats;
    }

    /**
     * 更新QPS计数器
     */
    private void updateQpsCounter(Long tenantId) {
        String key = QPS_KEY + tenantId;
        redisService.increment(key, 1L);
        redisService.expire(key, 60L, TimeUnit.SECONDS);
    }

    /**
     * 使日统计缓存失效
     */
    private void invalidateDailyStatsCache(Long tenantId, LocalDate date) {
        String cacheKey = DAILY_STATS_KEY + tenantId + ":" + date;
        redisService.deleteObject(cacheKey);
    }
}