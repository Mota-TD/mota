package com.mota.ai.service;

import com.mota.ai.entity.AIBudgetConfig;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * AI预算服务接口
 */
public interface AIBudgetService {

    // ==================== 预算配置管理 ====================

    /**
     * 创建预算配置
     */
    AIBudgetConfig createBudgetConfig(AIBudgetConfig config);

    /**
     * 更新预算配置
     */
    AIBudgetConfig updateBudgetConfig(AIBudgetConfig config);

    /**
     * 删除预算配置
     */
    void deleteBudgetConfig(Long configId);

    /**
     * 获取预算配置
     */
    AIBudgetConfig getBudgetConfig(Long configId);

    /**
     * 获取租户的所有预算配置
     */
    List<AIBudgetConfig> listBudgetConfigs();

    /**
     * 获取指定类型的预算配置
     */
    AIBudgetConfig getBudgetConfigByType(String budgetType);

    // ==================== 预算检查 ====================

    /**
     * 检查是否超出预算
     * @return true 如果超出预算
     */
    boolean isOverBudget(String budgetType);

    /**
     * 检查是否接近预算阈值
     * @return true 如果接近阈值
     */
    boolean isNearThreshold(String budgetType);

    /**
     * 检查请求是否允许（基于预算）
     * @param estimatedCost 预估费用
     * @return true 如果允许
     */
    boolean checkRequestAllowed(BigDecimal estimatedCost);

    /**
     * 获取剩余预算
     */
    BigDecimal getRemainingBudget(String budgetType);

    /**
     * 获取预算使用百分比
     */
    Double getBudgetUsagePercentage(String budgetType);

    // ==================== 预算使用记录 ====================

    /**
     * 记录预算使用
     */
    void recordBudgetUsage(BigDecimal cost);

    /**
     * 获取当前周期已使用金额
     */
    BigDecimal getCurrentPeriodUsage(String budgetType);

    /**
     * 重置预算周期
     */
    void resetBudgetPeriod(String budgetType);

    // ==================== 预算告警 ====================

    /**
     * 检查并发送预算告警
     */
    void checkAndSendAlerts();

    /**
     * 获取需要告警的预算配置
     */
    List<AIBudgetConfig> getBudgetsNeedingAlert();

    /**
     * 标记告警已发送
     */
    void markAlertSent(Long configId);

    // ==================== 预算统计 ====================

    /**
     * 获取预算使用摘要
     */
    Map<String, Object> getBudgetSummary();

    /**
     * 获取预算使用趋势
     */
    List<Map<String, Object>> getBudgetUsageTrend(String budgetType, int days);

    /**
     * 预测预算使用
     */
    Map<String, Object> predictBudgetUsage(String budgetType);

    // ==================== 预算策略 ====================

    /**
     * 设置超限策略
     * @param policy block/warn/allow
     */
    void setOverLimitPolicy(Long configId, String policy);

    /**
     * 获取超限策略
     */
    String getOverLimitPolicy(String budgetType);

    /**
     * 执行超限策略
     * @return true 如果允许继续
     */
    boolean executeOverLimitPolicy(String budgetType);
}