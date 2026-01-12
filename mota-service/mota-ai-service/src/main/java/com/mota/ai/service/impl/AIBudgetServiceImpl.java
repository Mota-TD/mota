package com.mota.ai.service.impl;

import com.mota.ai.entity.AIBudgetConfig;
import com.mota.ai.mapper.AIBudgetConfigMapper;
import com.mota.ai.service.AIBudgetService;
import com.mota.ai.service.AIUsageStatsService;
import com.mota.common.core.context.TenantContext;
import com.mota.common.core.exception.BusinessException;
import com.mota.common.redis.service.RedisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.concurrent.TimeUnit;

/**
 * AI预算服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AIBudgetServiceImpl implements AIBudgetService {

    private final AIBudgetConfigMapper budgetConfigMapper;
    private final AIUsageStatsService usageStatsService;
    private final RedisService redisService;

    private static final String BUDGET_USAGE_KEY = "ai:budget:usage:";
    private static final String ALERT_SENT_KEY = "ai:budget:alert:";

    @Override
    @Transactional
    public AIBudgetConfig createBudgetConfig(AIBudgetConfig config) {
        config.setTenantId(TenantContext.getTenantId());
        config.setCurrentUsage(BigDecimal.ZERO);
        config.setPeriodStartDate(calculatePeriodStartDate(config.getBudgetType()));
        budgetConfigMapper.insert(config);
        return config;
    }

    @Override
    @Transactional
    public AIBudgetConfig updateBudgetConfig(AIBudgetConfig config) {
        budgetConfigMapper.updateById(config);
        return budgetConfigMapper.selectById(config.getId());
    }

    @Override
    @Transactional
    public void deleteBudgetConfig(Long configId) {
        budgetConfigMapper.deleteById(configId);
    }

    @Override
    public AIBudgetConfig getBudgetConfig(Long configId) {
        return budgetConfigMapper.selectById(configId);
    }

    @Override
    public List<AIBudgetConfig> listBudgetConfigs() {
        Long tenantId = TenantContext.getTenantId();
        return budgetConfigMapper.selectByTenant(tenantId);
    }

    @Override
    public AIBudgetConfig getBudgetConfigByType(String budgetType) {
        Long tenantId = TenantContext.getTenantId();
        return budgetConfigMapper.selectByType(tenantId, budgetType);
    }

    @Override
    public boolean isOverBudget(String budgetType) {
        AIBudgetConfig config = getBudgetConfigByType(budgetType);
        if (config == null || !config.getIsEnabled()) {
            return false;
        }
        
        BigDecimal currentUsage = getCurrentPeriodUsage(budgetType);
        return currentUsage.compareTo(config.getBudgetAmount()) >= 0;
    }

    @Override
    public boolean isNearThreshold(String budgetType) {
        AIBudgetConfig config = getBudgetConfigByType(budgetType);
        if (config == null || !config.getIsEnabled()) {
            return false;
        }
        
        Double usagePercentage = getBudgetUsagePercentage(budgetType);
        return usagePercentage >= config.getAlertThreshold();
    }

    @Override
    public boolean checkRequestAllowed(BigDecimal estimatedCost) {
        Long tenantId = TenantContext.getTenantId();
        
        // 检查所有启用的预算配置
        List<AIBudgetConfig> configs = budgetConfigMapper.selectEnabledByTenant(tenantId);
        
        for (AIBudgetConfig config : configs) {
            BigDecimal currentUsage = getCurrentPeriodUsage(config.getBudgetType());
            BigDecimal projectedUsage = currentUsage.add(estimatedCost);
            
            if (projectedUsage.compareTo(config.getBudgetAmount()) > 0) {
                // 检查超限策略
                if ("block".equals(config.getOverLimitPolicy())) {
                    return false;
                }
            }
        }
        
        return true;
    }

    @Override
    public BigDecimal getRemainingBudget(String budgetType) {
        AIBudgetConfig config = getBudgetConfigByType(budgetType);
        if (config == null) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal currentUsage = getCurrentPeriodUsage(budgetType);
        BigDecimal remaining = config.getBudgetAmount().subtract(currentUsage);
        return remaining.compareTo(BigDecimal.ZERO) > 0 ? remaining : BigDecimal.ZERO;
    }

    @Override
    public Double getBudgetUsagePercentage(String budgetType) {
        AIBudgetConfig config = getBudgetConfigByType(budgetType);
        if (config == null || config.getBudgetAmount().compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }
        
        BigDecimal currentUsage = getCurrentPeriodUsage(budgetType);
        return currentUsage.divide(config.getBudgetAmount(), 4, RoundingMode.HALF_UP)
            .multiply(BigDecimal.valueOf(100))
            .doubleValue();
    }

    @Override
    @Transactional
    public void recordBudgetUsage(BigDecimal cost) {
        Long tenantId = TenantContext.getTenantId();
        
        // 更新所有启用的预算配置
        List<AIBudgetConfig> configs = budgetConfigMapper.selectEnabledByTenant(tenantId);
        
        for (AIBudgetConfig config : configs) {
            config.setCurrentUsage(config.getCurrentUsage().add(cost));
            budgetConfigMapper.updateById(config);
            
            // 更新Redis缓存
            String cacheKey = BUDGET_USAGE_KEY + tenantId + ":" + config.getBudgetType();
            redisService.increment(cacheKey, cost.longValue());
        }
    }

    @Override
    public BigDecimal getCurrentPeriodUsage(String budgetType) {
        AIBudgetConfig config = getBudgetConfigByType(budgetType);
        if (config == null) {
            return BigDecimal.ZERO;
        }
        
        // 计算周期的开始和结束日期
        LocalDate[] period = calculatePeriodDates(budgetType);
        LocalDate startDate = period[0];
        LocalDate endDate = period[1];
        
        // 从统计服务获取实际使用量
        return usageStatsService.getTotalCost(startDate, endDate);
    }

    @Override
    @Transactional
    public void resetBudgetPeriod(String budgetType) {
        AIBudgetConfig config = getBudgetConfigByType(budgetType);
        if (config != null) {
            config.setCurrentUsage(BigDecimal.ZERO);
            config.setPeriodStartDate(calculatePeriodStartDate(budgetType));
            budgetConfigMapper.updateById(config);
            
            // 清除Redis缓存
            Long tenantId = TenantContext.getTenantId();
            String cacheKey = BUDGET_USAGE_KEY + tenantId + ":" + budgetType;
            redisService.deleteObject(cacheKey);
        }
    }

    @Override
    @Scheduled(fixedRate = 300000) // 每5分钟检查一次
    public void checkAndSendAlerts() {
        log.debug("检查预算告警...");
        
        List<AIBudgetConfig> configs = getBudgetsNeedingAlert();
        
        for (AIBudgetConfig config : configs) {
            try {
                sendBudgetAlert(config);
                markAlertSent(config.getId());
            } catch (Exception e) {
                log.error("发送预算告警失败: {}", e.getMessage());
            }
        }
    }

    @Override
    public List<AIBudgetConfig> getBudgetsNeedingAlert() {
        Long tenantId = TenantContext.getTenantId();
        List<AIBudgetConfig> configs = budgetConfigMapper.selectNeedingAlert(tenantId);
        
        // 过滤已发送告警的配置
        return configs.stream()
            .filter(config -> {
                String alertKey = ALERT_SENT_KEY + config.getId();
                return redisService.getCacheObject(alertKey) == null;
            })
            .toList();
    }

    @Override
    public void markAlertSent(Long configId) {
        String alertKey = ALERT_SENT_KEY + configId;
        // 告警发送后24小时内不再重复发送
        redisService.setCacheObject(alertKey, true, 24L, TimeUnit.HOURS);
    }

    @Override
    public Map<String, Object> getBudgetSummary() {
        Long tenantId = TenantContext.getTenantId();
        List<AIBudgetConfig> configs = budgetConfigMapper.selectByTenant(tenantId);
        
        Map<String, Object> summary = new HashMap<>();
        List<Map<String, Object>> budgets = new ArrayList<>();
        
        for (AIBudgetConfig config : configs) {
            Map<String, Object> budget = new HashMap<>();
            budget.put("budgetType", config.getBudgetType());
            budget.put("budgetAmount", config.getBudgetAmount());
            budget.put("currentUsage", getCurrentPeriodUsage(config.getBudgetType()));
            budget.put("remaining", getRemainingBudget(config.getBudgetType()));
            budget.put("usagePercentage", getBudgetUsagePercentage(config.getBudgetType()));
            budget.put("isOverBudget", isOverBudget(config.getBudgetType()));
            budget.put("isNearThreshold", isNearThreshold(config.getBudgetType()));
            budgets.add(budget);
        }
        
        summary.put("budgets", budgets);
        summary.put("totalBudget", configs.stream()
            .map(AIBudgetConfig::getBudgetAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add));
        summary.put("totalUsage", configs.stream()
            .map(c -> getCurrentPeriodUsage(c.getBudgetType()))
            .reduce(BigDecimal.ZERO, BigDecimal::add));
        
        return summary;
    }

    @Override
    public List<Map<String, Object>> getBudgetUsageTrend(String budgetType, int days) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days);
        
        return usageStatsService.getDailyCostTrend(startDate, endDate);
    }

    @Override
    public Map<String, Object> predictBudgetUsage(String budgetType) {
        AIBudgetConfig config = getBudgetConfigByType(budgetType);
        if (config == null) {
            return Collections.emptyMap();
        }
        
        // 获取过去7天的使用数据
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(7);
        BigDecimal weekUsage = usageStatsService.getTotalCost(startDate, endDate);
        
        // 计算日均使用量
        BigDecimal dailyAverage = weekUsage.divide(BigDecimal.valueOf(7), 2, RoundingMode.HALF_UP);
        
        // 计算周期剩余天数
        LocalDate[] period = calculatePeriodDates(budgetType);
        long remainingDays = java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), period[1]);
        
        // 预测周期结束时的使用量
        BigDecimal currentUsage = getCurrentPeriodUsage(budgetType);
        BigDecimal predictedUsage = currentUsage.add(dailyAverage.multiply(BigDecimal.valueOf(remainingDays)));
        
        Map<String, Object> prediction = new HashMap<>();
        prediction.put("budgetType", budgetType);
        prediction.put("budgetAmount", config.getBudgetAmount());
        prediction.put("currentUsage", currentUsage);
        prediction.put("dailyAverage", dailyAverage);
        prediction.put("remainingDays", remainingDays);
        prediction.put("predictedUsage", predictedUsage);
        prediction.put("willExceed", predictedUsage.compareTo(config.getBudgetAmount()) > 0);
        
        return prediction;
    }

    @Override
    @Transactional
    public void setOverLimitPolicy(Long configId, String policy) {
        AIBudgetConfig config = budgetConfigMapper.selectById(configId);
        if (config != null) {
            config.setOverLimitPolicy(policy);
            budgetConfigMapper.updateById(config);
        }
    }

    @Override
    public String getOverLimitPolicy(String budgetType) {
        AIBudgetConfig config = getBudgetConfigByType(budgetType);
        return config != null ? config.getOverLimitPolicy() : "warn";
    }

    @Override
    public boolean executeOverLimitPolicy(String budgetType) {
        String policy = getOverLimitPolicy(budgetType);
        
        switch (policy) {
            case "block":
                throw new BusinessException("已超出预算限制，请求被拒绝");
            case "warn":
                log.warn("预算类型 {} 已超出限制", budgetType);
                return true;
            case "allow":
            default:
                return true;
        }
    }

    // ==================== 辅助方法 ====================

    /**
     * 计算周期开始日期
     */
    private LocalDate calculatePeriodStartDate(String budgetType) {
        LocalDate today = LocalDate.now();
        
        switch (budgetType) {
            case "daily":
                return today;
            case "weekly":
                return today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            case "monthly":
                return today.withDayOfMonth(1);
            case "yearly":
                return today.withDayOfYear(1);
            default:
                return today;
        }
    }

    /**
     * 计算周期的开始和结束日期
     */
    private LocalDate[] calculatePeriodDates(String budgetType) {
        LocalDate today = LocalDate.now();
        LocalDate startDate;
        LocalDate endDate;
        
        switch (budgetType) {
            case "daily":
                startDate = today;
                endDate = today;
                break;
            case "weekly":
                startDate = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                endDate = startDate.plusDays(6);
                break;
            case "monthly":
                startDate = today.withDayOfMonth(1);
                endDate = today.with(TemporalAdjusters.lastDayOfMonth());
                break;
            case "yearly":
                startDate = today.withDayOfYear(1);
                endDate = today.with(TemporalAdjusters.lastDayOfYear());
                break;
            default:
                startDate = today;
                endDate = today;
        }
        
        return new LocalDate[]{startDate, endDate};
    }

    /**
     * 发送预算告警
     */
    private void sendBudgetAlert(AIBudgetConfig config) {
        // TODO: 调用通知服务发送告警
        log.info("发送预算告警: 租户={}, 类型={}, 使用率={}%",
            config.getTenantId(),
            config.getBudgetType(),
            getBudgetUsagePercentage(config.getBudgetType()));
    }
}