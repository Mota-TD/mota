package com.mota.ai.controller;

import com.mota.ai.entity.AIBudgetConfig;
import com.mota.ai.entity.AIModelConfig;
import com.mota.ai.service.AIBudgetService;
import com.mota.ai.service.AIModelRouterService;
import com.mota.ai.service.AIUsageStatsService;
import com.mota.common.core.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * AI模型管理控制器
 */
@Tag(name = "AI模型管理", description = "AI模型配置、路由、统计和预算管理")
@RestController
@RequestMapping("/api/ai/models")
@RequiredArgsConstructor
public class AIModelController {

    private final AIModelRouterService modelRouterService;
    private final AIUsageStatsService usageStatsService;
    private final AIBudgetService budgetService;

    // ==================== 模型配置管理 ====================

    @Operation(summary = "获取模型列表")
    @GetMapping
    public Result<List<AIModelConfig>> listModels() {
        return Result.success(modelRouterService.listModelConfigs());
    }

    @Operation(summary = "获取模型详情")
    @GetMapping("/{modelId}")
    public Result<AIModelConfig> getModel(@PathVariable Long modelId) {
        return Result.success(modelRouterService.getModelConfig(modelId));
    }

    @Operation(summary = "创建模型配置")
    @PostMapping
    public Result<AIModelConfig> createModel(@RequestBody AIModelConfig config) {
        return Result.success(modelRouterService.createModelConfig(config));
    }

    @Operation(summary = "更新模型配置")
    @PutMapping("/{modelId}")
    public Result<AIModelConfig> updateModel(@PathVariable Long modelId, @RequestBody AIModelConfig config) {
        config.setId(modelId);
        return Result.success(modelRouterService.updateModelConfig(config));
    }

    @Operation(summary = "删除模型配置")
    @DeleteMapping("/{modelId}")
    public Result<Void> deleteModel(@PathVariable Long modelId) {
        modelRouterService.deleteModelConfig(modelId);
        return Result.success();
    }

    @Operation(summary = "设置默认模型")
    @PostMapping("/{modelId}/default")
    public Result<Void> setDefaultModel(@PathVariable Long modelId) {
        modelRouterService.setDefaultModel(modelId);
        return Result.success();
    }

    @Operation(summary = "启用/禁用模型")
    @PostMapping("/{modelId}/enabled")
    public Result<Void> setModelEnabled(@PathVariable Long modelId, @RequestParam boolean enabled) {
        modelRouterService.setModelEnabled(modelId, enabled);
        return Result.success();
    }

    // ==================== 模型路由 ====================

    @Operation(summary = "获取可用模型列表")
    @GetMapping("/available")
    public Result<List<AIModelConfig>> getAvailableModels() {
        return Result.success(modelRouterService.getAvailableModels());
    }

    @Operation(summary = "获取默认模型")
    @GetMapping("/default")
    public Result<AIModelConfig> getDefaultModel() {
        return Result.success(modelRouterService.getDefaultModel());
    }

    @Operation(summary = "按提供商获取模型")
    @GetMapping("/provider/{provider}")
    public Result<List<AIModelConfig>> getModelsByProvider(@PathVariable String provider) {
        return Result.success(modelRouterService.getModelsByProvider(provider));
    }

    @Operation(summary = "选择最佳模型")
    @PostMapping("/select")
    public Result<AIModelConfig> selectBestModel(
            @RequestParam(required = false) String modelType,
            @RequestParam(required = false) List<String> capabilities) {
        return Result.success(modelRouterService.selectBestModel(modelType, capabilities));
    }

    @Operation(summary = "获取降级模型")
    @GetMapping("/{modelId}/fallback")
    public Result<AIModelConfig> getFallbackModel(@PathVariable Long modelId) {
        return Result.success(modelRouterService.getFallbackModel(modelId));
    }

    // ==================== 健康检查 ====================

    @Operation(summary = "检查模型健康状态")
    @GetMapping("/{modelId}/health")
    public Result<Boolean> checkModelHealth(@PathVariable Long modelId) {
        return Result.success(modelRouterService.checkModelHealth(modelId));
    }

    @Operation(summary = "更新模型健康状态")
    @PostMapping("/{modelId}/health")
    public Result<Void> updateModelHealth(@PathVariable Long modelId, @RequestParam String status) {
        modelRouterService.updateModelHealth(modelId, status);
        return Result.success();
    }

    // ==================== 使用统计 ====================

    @Operation(summary = "获取今日统计摘要")
    @GetMapping("/stats/today")
    public Result<Map<String, Object>> getTodaySummary() {
        return Result.success(usageStatsService.getTodaySummary());
    }

    @Operation(summary = "获取本月统计摘要")
    @GetMapping("/stats/month")
    public Result<Map<String, Object>> getMonthSummary() {
        return Result.success(usageStatsService.getMonthSummary());
    }

    @Operation(summary = "获取当前QPS")
    @GetMapping("/stats/qps")
    public Result<Double> getCurrentQps() {
        return Result.success(usageStatsService.getCurrentQps());
    }

    @Operation(summary = "获取日期范围内的统计")
    @GetMapping("/stats/range")
    public Result<Map<String, Object>> getStatsByRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Map<String, Object> stats = Map.of(
            "totalRequests", usageStatsService.getTotalRequests(startDate, endDate),
            "totalTokens", usageStatsService.getTotalTokens(startDate, endDate),
            "totalCost", usageStatsService.getTotalCost(startDate, endDate)
        );
        return Result.success(stats);
    }

    @Operation(summary = "获取模型使用排行")
    @GetMapping("/stats/ranking/models")
    public Result<List<Map<String, Object>>> getModelUsageRanking(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "10") int limit) {
        return Result.success(usageStatsService.getModelUsageRanking(startDate, endDate, limit));
    }

    @Operation(summary = "获取用户使用排行")
    @GetMapping("/stats/ranking/users")
    public Result<List<Map<String, Object>>> getUserUsageRanking(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "10") int limit) {
        return Result.success(usageStatsService.getUserUsageRanking(startDate, endDate, limit));
    }

    @Operation(summary = "获取每日请求趋势")
    @GetMapping("/stats/trend/requests")
    public Result<List<Map<String, Object>>> getDailyRequestTrend(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return Result.success(usageStatsService.getDailyRequestTrend(startDate, endDate));
    }

    @Operation(summary = "获取每日费用趋势")
    @GetMapping("/stats/trend/cost")
    public Result<List<Map<String, Object>>> getDailyCostTrend(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return Result.success(usageStatsService.getDailyCostTrend(startDate, endDate));
    }

    // ==================== 预算管理 ====================

    @Operation(summary = "获取预算配置列表")
    @GetMapping("/budgets")
    public Result<List<AIBudgetConfig>> listBudgetConfigs() {
        return Result.success(budgetService.listBudgetConfigs());
    }

    @Operation(summary = "获取预算配置")
    @GetMapping("/budgets/{configId}")
    public Result<AIBudgetConfig> getBudgetConfig(@PathVariable Long configId) {
        return Result.success(budgetService.getBudgetConfig(configId));
    }

    @Operation(summary = "创建预算配置")
    @PostMapping("/budgets")
    public Result<AIBudgetConfig> createBudgetConfig(@RequestBody AIBudgetConfig config) {
        return Result.success(budgetService.createBudgetConfig(config));
    }

    @Operation(summary = "更新预算配置")
    @PutMapping("/budgets/{configId}")
    public Result<AIBudgetConfig> updateBudgetConfig(@PathVariable Long configId, @RequestBody AIBudgetConfig config) {
        config.setId(configId);
        return Result.success(budgetService.updateBudgetConfig(config));
    }

    @Operation(summary = "删除预算配置")
    @DeleteMapping("/budgets/{configId}")
    public Result<Void> deleteBudgetConfig(@PathVariable Long configId) {
        budgetService.deleteBudgetConfig(configId);
        return Result.success();
    }

    @Operation(summary = "获取预算摘要")
    @GetMapping("/budgets/summary")
    public Result<Map<String, Object>> getBudgetSummary() {
        return Result.success(budgetService.getBudgetSummary());
    }

    @Operation(summary = "获取预算使用趋势")
    @GetMapping("/budgets/{budgetType}/trend")
    public Result<List<Map<String, Object>>> getBudgetUsageTrend(
            @PathVariable String budgetType,
            @RequestParam(defaultValue = "30") int days) {
        return Result.success(budgetService.getBudgetUsageTrend(budgetType, days));
    }

    @Operation(summary = "预测预算使用")
    @GetMapping("/budgets/{budgetType}/predict")
    public Result<Map<String, Object>> predictBudgetUsage(@PathVariable String budgetType) {
        return Result.success(budgetService.predictBudgetUsage(budgetType));
    }

    @Operation(summary = "设置超限策略")
    @PostMapping("/budgets/{configId}/policy")
    public Result<Void> setOverLimitPolicy(@PathVariable Long configId, @RequestParam String policy) {
        budgetService.setOverLimitPolicy(configId, policy);
        return Result.success();
    }

    @Operation(summary = "重置预算周期")
    @PostMapping("/budgets/{budgetType}/reset")
    public Result<Void> resetBudgetPeriod(@PathVariable String budgetType) {
        budgetService.resetBudgetPeriod(budgetType);
        return Result.success();
    }
}