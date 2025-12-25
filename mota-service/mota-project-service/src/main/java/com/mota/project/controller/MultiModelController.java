package com.mota.project.controller;

import com.mota.project.service.MultiModelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 多模型支持控制器
 * 实现 MM-001 到 MM-008 功能
 */
@RestController
@RequestMapping("/api/multi-model")
@CrossOrigin(origins = "*")
public class MultiModelController {

    @Autowired
    private MultiModelService multiModelService;

    // ==================== 提供商管理 ====================

    /**
     * 获取所有提供商列表
     */
    @GetMapping("/providers")
    public ResponseEntity<List<Map<String, Object>>> getProviders() {
        return ResponseEntity.ok(multiModelService.getProviders());
    }

    /**
     * 获取提供商详情
     */
    @GetMapping("/providers/{providerId}")
    public ResponseEntity<Map<String, Object>> getProviderById(@PathVariable Long providerId) {
        Map<String, Object> provider = multiModelService.getProviderById(providerId);
        if (provider == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(provider);
    }

    /**
     * 创建提供商
     */
    @PostMapping("/providers")
    public ResponseEntity<Map<String, Object>> createProvider(@RequestBody Map<String, Object> provider) {
        return ResponseEntity.ok(multiModelService.saveProvider(provider));
    }

    /**
     * 更新提供商
     */
    @PutMapping("/providers/{providerId}")
    public ResponseEntity<Map<String, Object>> updateProvider(
            @PathVariable Long providerId,
            @RequestBody Map<String, Object> provider) {
        return ResponseEntity.ok(multiModelService.updateProvider(providerId, provider));
    }

    // ==================== 模型管理 ====================

    /**
     * 获取所有模型列表
     */
    @GetMapping("/models")
    public ResponseEntity<List<Map<String, Object>>> getModels(
            @RequestParam(required = false) Long providerId) {
        return ResponseEntity.ok(multiModelService.getModels(providerId));
    }

    /**
     * 获取模型详情
     */
    @GetMapping("/models/{modelId}")
    public ResponseEntity<Map<String, Object>> getModelById(@PathVariable Long modelId) {
        Map<String, Object> model = multiModelService.getModelById(modelId);
        if (model == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(model);
    }

    /**
     * 创建模型配置
     */
    @PostMapping("/models")
    public ResponseEntity<Map<String, Object>> createModel(@RequestBody Map<String, Object> model) {
        return ResponseEntity.ok(multiModelService.saveModel(model));
    }

    /**
     * 更新模型配置
     */
    @PutMapping("/models/{modelId}")
    public ResponseEntity<Map<String, Object>> updateModel(
            @PathVariable Long modelId,
            @RequestBody Map<String, Object> model) {
        return ResponseEntity.ok(multiModelService.updateModel(modelId, model));
    }

    /**
     * 设置默认模型
     */
    @PostMapping("/models/{modelId}/set-default")
    public ResponseEntity<Map<String, Object>> setDefaultModel(@PathVariable Long modelId) {
        return ResponseEntity.ok(multiModelService.setDefaultModel(modelId));
    }

    // ==================== 路由规则管理 ====================

    /**
     * 获取路由规则列表
     */
    @GetMapping("/routing-rules")
    public ResponseEntity<List<Map<String, Object>>> getRoutingRules() {
        return ResponseEntity.ok(multiModelService.getRoutingRules());
    }

    /**
     * 创建路由规则
     */
    @PostMapping("/routing-rules")
    public ResponseEntity<Map<String, Object>> createRoutingRule(@RequestBody Map<String, Object> rule) {
        return ResponseEntity.ok(multiModelService.saveRoutingRule(rule));
    }

    /**
     * 更新路由规则
     */
    @PutMapping("/routing-rules/{ruleId}")
    public ResponseEntity<Map<String, Object>> updateRoutingRule(
            @PathVariable Long ruleId,
            @RequestBody Map<String, Object> rule) {
        return ResponseEntity.ok(multiModelService.updateRoutingRule(ruleId, rule));
    }

    /**
     * 删除路由规则
     */
    @DeleteMapping("/routing-rules/{ruleId}")
    public ResponseEntity<Map<String, Object>> deleteRoutingRule(@PathVariable Long ruleId) {
        return ResponseEntity.ok(multiModelService.deleteRoutingRule(ruleId));
    }

    /**
     * 选择模型
     */
    @PostMapping("/select-model")
    public ResponseEntity<Map<String, Object>> selectModel(@RequestBody Map<String, Object> context) {
        return ResponseEntity.ok(multiModelService.selectModel(context));
    }

    // ==================== 降级策略管理 ====================

    /**
     * 获取降级策略列表
     */
    @GetMapping("/fallback-strategies")
    public ResponseEntity<List<Map<String, Object>>> getFallbackStrategies() {
        return ResponseEntity.ok(multiModelService.getFallbackStrategies());
    }

    /**
     * 创建降级策略
     */
    @PostMapping("/fallback-strategies")
    public ResponseEntity<Map<String, Object>> createFallbackStrategy(@RequestBody Map<String, Object> strategy) {
        return ResponseEntity.ok(multiModelService.saveFallbackStrategy(strategy));
    }

    /**
     * 更新降级策略
     */
    @PutMapping("/fallback-strategies/{strategyId}")
    public ResponseEntity<Map<String, Object>> updateFallbackStrategy(
            @PathVariable Long strategyId,
            @RequestBody Map<String, Object> strategy) {
        return ResponseEntity.ok(multiModelService.updateFallbackStrategy(strategyId, strategy));
    }

    /**
     * 获取熔断器状态
     */
    @GetMapping("/circuit-breaker/status")
    public ResponseEntity<List<Map<String, Object>>> getCircuitBreakerStatus() {
        return ResponseEntity.ok(multiModelService.getCircuitBreakerStatus());
    }

    /**
     * 重置熔断器
     */
    @PostMapping("/circuit-breaker/{modelId}/reset")
    public ResponseEntity<Map<String, Object>> resetCircuitBreaker(@PathVariable Long modelId) {
        return ResponseEntity.ok(multiModelService.resetCircuitBreaker(modelId));
    }

    // ==================== 成本控制 ====================

    /**
     * 获取成本预算列表
     */
    @GetMapping("/cost-budgets")
    public ResponseEntity<List<Map<String, Object>>> getCostBudgets() {
        return ResponseEntity.ok(multiModelService.getCostBudgets());
    }

    /**
     * 创建成本预算
     */
    @PostMapping("/cost-budgets")
    public ResponseEntity<Map<String, Object>> createCostBudget(@RequestBody Map<String, Object> budget) {
        return ResponseEntity.ok(multiModelService.saveCostBudget(budget));
    }

    /**
     * 更新成本预算
     */
    @PutMapping("/cost-budgets/{budgetId}")
    public ResponseEntity<Map<String, Object>> updateCostBudget(
            @PathVariable Long budgetId,
            @RequestBody Map<String, Object> budget) {
        return ResponseEntity.ok(multiModelService.updateCostBudget(budgetId, budget));
    }

    /**
     * 获取成本统计
     */
    @GetMapping("/cost-statistics")
    public ResponseEntity<Map<String, Object>> getCostStatistics(
            @RequestParam(defaultValue = "monthly") String period,
            @RequestParam(required = false) Long providerId,
            @RequestParam(required = false) Long modelId) {
        return ResponseEntity.ok(multiModelService.getCostStatistics(period, providerId, modelId));
    }

    /**
     * 获取调用日志
     */
    @GetMapping("/call-logs")
    public ResponseEntity<Map<String, Object>> getCallLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long modelId,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(multiModelService.getCallLogs(page, size, modelId, status));
    }

    /**
     * 检查预算
     */
    @PostMapping("/check-budget")
    public ResponseEntity<Map<String, Object>> checkBudget(
            @RequestParam Long userId,
            @RequestParam BigDecimal estimatedCost) {
        return ResponseEntity.ok(multiModelService.checkBudget(userId, estimatedCost));
    }

    /**
     * 健康检查
     */
    @GetMapping("/health-check")
    public ResponseEntity<List<Map<String, Object>>> healthCheck() {
        return ResponseEntity.ok(multiModelService.healthCheck());
    }
}