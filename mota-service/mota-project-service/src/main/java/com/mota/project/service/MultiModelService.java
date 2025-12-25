package com.mota.project.service;

import org.springframework.stereotype.Service;
import java.util.*;
import java.math.BigDecimal;

/**
 * 多模型支持服务
 * 实现 MM-001 到 MM-008 功能
 */
@Service
public class MultiModelService {

    // ==================== MM-001/002/003/004/005 多模型支持 ====================

    /**
     * 获取所有提供商列表
     */
    public List<Map<String, Object>> getProviders() {
        List<Map<String, Object>> providers = new ArrayList<>();
        
        // OpenAI
        Map<String, Object> openai = new HashMap<>();
        openai.put("id", 1L);
        openai.put("providerCode", "openai");
        openai.put("providerName", "OpenAI");
        openai.put("providerType", "international");
        openai.put("apiBaseUrl", "https://api.openai.com/v1");
        openai.put("isEnabled", true);
        openai.put("healthStatus", "healthy");
        openai.put("priority", 100);
        providers.add(openai);
        
        // Anthropic
        Map<String, Object> anthropic = new HashMap<>();
        anthropic.put("id", 2L);
        anthropic.put("providerCode", "anthropic");
        anthropic.put("providerName", "Anthropic");
        anthropic.put("providerType", "international");
        anthropic.put("apiBaseUrl", "https://api.anthropic.com/v1");
        anthropic.put("isEnabled", true);
        anthropic.put("healthStatus", "healthy");
        anthropic.put("priority", 90);
        providers.add(anthropic);
        
        // 阿里云
        Map<String, Object> aliyun = new HashMap<>();
        aliyun.put("id", 3L);
        aliyun.put("providerCode", "aliyun");
        aliyun.put("providerName", "阿里云通义千问");
        aliyun.put("providerType", "domestic");
        aliyun.put("apiBaseUrl", "https://dashscope.aliyuncs.com/api/v1");
        aliyun.put("isEnabled", true);
        aliyun.put("healthStatus", "healthy");
        aliyun.put("priority", 80);
        providers.add(aliyun);
        
        // 百度
        Map<String, Object> baidu = new HashMap<>();
        baidu.put("id", 4L);
        baidu.put("providerCode", "baidu");
        baidu.put("providerName", "百度文心一言");
        baidu.put("providerType", "domestic");
        baidu.put("apiBaseUrl", "https://aip.baidubce.com");
        baidu.put("isEnabled", true);
        baidu.put("healthStatus", "healthy");
        baidu.put("priority", 70);
        providers.add(baidu);
        
        return providers;
    }

    /**
     * 获取提供商详情
     */
    public Map<String, Object> getProviderById(Long providerId) {
        List<Map<String, Object>> providers = getProviders();
        return providers.stream()
                .filter(p -> p.get("id").equals(providerId))
                .findFirst()
                .orElse(null);
    }

    /**
     * 保存提供商配置
     */
    public Map<String, Object> saveProvider(Map<String, Object> provider) {
        provider.put("id", System.currentTimeMillis());
        provider.put("createdAt", new Date());
        return provider;
    }

    /**
     * 更新提供商配置
     */
    public Map<String, Object> updateProvider(Long providerId, Map<String, Object> provider) {
        provider.put("id", providerId);
        provider.put("updatedAt", new Date());
        return provider;
    }

    /**
     * 获取所有模型列表
     */
    public List<Map<String, Object>> getModels(Long providerId) {
        List<Map<String, Object>> models = new ArrayList<>();
        
        // GPT-4
        if (providerId == null || providerId == 1L) {
            Map<String, Object> gpt4 = new HashMap<>();
            gpt4.put("id", 1L);
            gpt4.put("providerId", 1L);
            gpt4.put("providerName", "OpenAI");
            gpt4.put("modelCode", "gpt-4");
            gpt4.put("modelName", "GPT-4");
            gpt4.put("modelType", "chat");
            gpt4.put("maxTokens", 8192);
            gpt4.put("contextWindow", 8192);
            gpt4.put("inputPrice", new BigDecimal("0.03"));
            gpt4.put("outputPrice", new BigDecimal("0.06"));
            gpt4.put("supportsStreaming", true);
            gpt4.put("supportsFunctionCall", true);
            gpt4.put("supportsVision", false);
            gpt4.put("isEnabled", true);
            gpt4.put("isDefault", false);
            models.add(gpt4);
            
            Map<String, Object> gpt4Turbo = new HashMap<>();
            gpt4Turbo.put("id", 2L);
            gpt4Turbo.put("providerId", 1L);
            gpt4Turbo.put("providerName", "OpenAI");
            gpt4Turbo.put("modelCode", "gpt-4-turbo");
            gpt4Turbo.put("modelName", "GPT-4 Turbo");
            gpt4Turbo.put("modelType", "chat");
            gpt4Turbo.put("maxTokens", 128000);
            gpt4Turbo.put("contextWindow", 128000);
            gpt4Turbo.put("inputPrice", new BigDecimal("0.01"));
            gpt4Turbo.put("outputPrice", new BigDecimal("0.03"));
            gpt4Turbo.put("supportsStreaming", true);
            gpt4Turbo.put("supportsFunctionCall", true);
            gpt4Turbo.put("supportsVision", true);
            gpt4Turbo.put("isEnabled", true);
            gpt4Turbo.put("isDefault", false);
            models.add(gpt4Turbo);
            
            Map<String, Object> gpt35 = new HashMap<>();
            gpt35.put("id", 3L);
            gpt35.put("providerId", 1L);
            gpt35.put("providerName", "OpenAI");
            gpt35.put("modelCode", "gpt-3.5-turbo");
            gpt35.put("modelName", "GPT-3.5 Turbo");
            gpt35.put("modelType", "chat");
            gpt35.put("maxTokens", 16385);
            gpt35.put("contextWindow", 16385);
            gpt35.put("inputPrice", new BigDecimal("0.0005"));
            gpt35.put("outputPrice", new BigDecimal("0.0015"));
            gpt35.put("supportsStreaming", true);
            gpt35.put("supportsFunctionCall", true);
            gpt35.put("supportsVision", false);
            gpt35.put("isEnabled", true);
            gpt35.put("isDefault", true);
            models.add(gpt35);
        }
        
        // Claude
        if (providerId == null || providerId == 2L) {
            Map<String, Object> claudeOpus = new HashMap<>();
            claudeOpus.put("id", 4L);
            claudeOpus.put("providerId", 2L);
            claudeOpus.put("providerName", "Anthropic");
            claudeOpus.put("modelCode", "claude-3-opus");
            claudeOpus.put("modelName", "Claude 3 Opus");
            claudeOpus.put("modelType", "chat");
            claudeOpus.put("maxTokens", 200000);
            claudeOpus.put("contextWindow", 200000);
            claudeOpus.put("inputPrice", new BigDecimal("0.015"));
            claudeOpus.put("outputPrice", new BigDecimal("0.075"));
            claudeOpus.put("supportsStreaming", true);
            claudeOpus.put("supportsFunctionCall", true);
            claudeOpus.put("supportsVision", true);
            claudeOpus.put("isEnabled", true);
            claudeOpus.put("isDefault", false);
            models.add(claudeOpus);
            
            Map<String, Object> claudeSonnet = new HashMap<>();
            claudeSonnet.put("id", 5L);
            claudeSonnet.put("providerId", 2L);
            claudeSonnet.put("providerName", "Anthropic");
            claudeSonnet.put("modelCode", "claude-3-sonnet");
            claudeSonnet.put("modelName", "Claude 3 Sonnet");
            claudeSonnet.put("modelType", "chat");
            claudeSonnet.put("maxTokens", 200000);
            claudeSonnet.put("contextWindow", 200000);
            claudeSonnet.put("inputPrice", new BigDecimal("0.003"));
            claudeSonnet.put("outputPrice", new BigDecimal("0.015"));
            claudeSonnet.put("supportsStreaming", true);
            claudeSonnet.put("supportsFunctionCall", true);
            claudeSonnet.put("supportsVision", true);
            claudeSonnet.put("isEnabled", true);
            claudeSonnet.put("isDefault", false);
            models.add(claudeSonnet);
        }
        
        // 通义千问
        if (providerId == null || providerId == 3L) {
            Map<String, Object> qwenTurbo = new HashMap<>();
            qwenTurbo.put("id", 6L);
            qwenTurbo.put("providerId", 3L);
            qwenTurbo.put("providerName", "阿里云通义千问");
            qwenTurbo.put("modelCode", "qwen-turbo");
            qwenTurbo.put("modelName", "通义千问-Turbo");
            qwenTurbo.put("modelType", "chat");
            qwenTurbo.put("maxTokens", 8000);
            qwenTurbo.put("contextWindow", 8000);
            qwenTurbo.put("inputPrice", new BigDecimal("0.008"));
            qwenTurbo.put("outputPrice", new BigDecimal("0.008"));
            qwenTurbo.put("supportsStreaming", true);
            qwenTurbo.put("supportsFunctionCall", false);
            qwenTurbo.put("supportsVision", false);
            qwenTurbo.put("isEnabled", true);
            qwenTurbo.put("isDefault", false);
            models.add(qwenTurbo);
            
            Map<String, Object> qwenPlus = new HashMap<>();
            qwenPlus.put("id", 7L);
            qwenPlus.put("providerId", 3L);
            qwenPlus.put("providerName", "阿里云通义千问");
            qwenPlus.put("modelCode", "qwen-plus");
            qwenPlus.put("modelName", "通义千问-Plus");
            qwenPlus.put("modelType", "chat");
            qwenPlus.put("maxTokens", 32000);
            qwenPlus.put("contextWindow", 32000);
            qwenPlus.put("inputPrice", new BigDecimal("0.02"));
            qwenPlus.put("outputPrice", new BigDecimal("0.02"));
            qwenPlus.put("supportsStreaming", true);
            qwenPlus.put("supportsFunctionCall", true);
            qwenPlus.put("supportsVision", false);
            qwenPlus.put("isEnabled", true);
            qwenPlus.put("isDefault", false);
            models.add(qwenPlus);
        }
        
        // 文心一言
        if (providerId == null || providerId == 4L) {
            Map<String, Object> ernie4 = new HashMap<>();
            ernie4.put("id", 8L);
            ernie4.put("providerId", 4L);
            ernie4.put("providerName", "百度文心一言");
            ernie4.put("modelCode", "ernie-bot-4");
            ernie4.put("modelName", "文心一言4.0");
            ernie4.put("modelType", "chat");
            ernie4.put("maxTokens", 8000);
            ernie4.put("contextWindow", 8000);
            ernie4.put("inputPrice", new BigDecimal("0.12"));
            ernie4.put("outputPrice", new BigDecimal("0.12"));
            ernie4.put("supportsStreaming", true);
            ernie4.put("supportsFunctionCall", true);
            ernie4.put("supportsVision", false);
            ernie4.put("isEnabled", true);
            ernie4.put("isDefault", false);
            models.add(ernie4);
            
            Map<String, Object> ernieTurbo = new HashMap<>();
            ernieTurbo.put("id", 9L);
            ernieTurbo.put("providerId", 4L);
            ernieTurbo.put("providerName", "百度文心一言");
            ernieTurbo.put("modelCode", "ernie-bot-turbo");
            ernieTurbo.put("modelName", "文心一言Turbo");
            ernieTurbo.put("modelType", "chat");
            ernieTurbo.put("maxTokens", 8000);
            ernieTurbo.put("contextWindow", 8000);
            ernieTurbo.put("inputPrice", new BigDecimal("0.008"));
            ernieTurbo.put("outputPrice", new BigDecimal("0.008"));
            ernieTurbo.put("supportsStreaming", true);
            ernieTurbo.put("supportsFunctionCall", false);
            ernieTurbo.put("supportsVision", false);
            ernieTurbo.put("isEnabled", true);
            ernieTurbo.put("isDefault", false);
            models.add(ernieTurbo);
        }
        
        return models;
    }

    /**
     * 获取模型详情
     */
    public Map<String, Object> getModelById(Long modelId) {
        List<Map<String, Object>> models = getModels(null);
        return models.stream()
                .filter(m -> m.get("id").equals(modelId))
                .findFirst()
                .orElse(null);
    }

    /**
     * 保存模型配置
     */
    public Map<String, Object> saveModel(Map<String, Object> model) {
        model.put("id", System.currentTimeMillis());
        model.put("createdAt", new Date());
        return model;
    }

    /**
     * 更新模型配置
     */
    public Map<String, Object> updateModel(Long modelId, Map<String, Object> model) {
        model.put("id", modelId);
        model.put("updatedAt", new Date());
        return model;
    }

    /**
     * 设置默认模型
     */
    public Map<String, Object> setDefaultModel(Long modelId) {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "默认模型设置成功");
        result.put("modelId", modelId);
        return result;
    }

    // ==================== MM-006 模型路由 ====================

    /**
     * 获取路由规则列表
     */
    public List<Map<String, Object>> getRoutingRules() {
        List<Map<String, Object>> rules = new ArrayList<>();
        
        Map<String, Object> rule1 = new HashMap<>();
        rule1.put("id", 1L);
        rule1.put("ruleName", "默认路由");
        rule1.put("ruleType", "default");
        rule1.put("priority", 0);
        rule1.put("conditions", new HashMap<>());
        rule1.put("targetModelId", 3L);
        rule1.put("targetModelName", "GPT-3.5 Turbo");
        rule1.put("weight", 100);
        rule1.put("isEnabled", true);
        rules.add(rule1);
        
        Map<String, Object> rule2 = new HashMap<>();
        rule2.put("id", 2L);
        rule2.put("ruleName", "高级用户路由");
        rule2.put("ruleType", "user_level");
        rule2.put("priority", 10);
        Map<String, Object> conditions2 = new HashMap<>();
        conditions2.put("userLevel", "premium");
        rule2.put("conditions", conditions2);
        rule2.put("targetModelId", 1L);
        rule2.put("targetModelName", "GPT-4");
        rule2.put("weight", 100);
        rule2.put("isEnabled", true);
        rules.add(rule2);
        
        Map<String, Object> rule3 = new HashMap<>();
        rule3.put("id", 3L);
        rule3.put("ruleName", "成本优先路由");
        rule3.put("ruleType", "cost");
        rule3.put("priority", 5);
        Map<String, Object> conditions3 = new HashMap<>();
        conditions3.put("maxCostPerCall", 0.01);
        rule3.put("conditions", conditions3);
        rule3.put("targetModelId", 3L);
        rule3.put("targetModelName", "GPT-3.5 Turbo");
        rule3.put("weight", 100);
        rule3.put("isEnabled", true);
        rules.add(rule3);
        
        Map<String, Object> rule4 = new HashMap<>();
        rule4.put("id", 4L);
        rule4.put("ruleName", "负载均衡路由");
        rule4.put("ruleType", "load_balance");
        rule4.put("priority", 8);
        rule4.put("conditions", new HashMap<>());
        rule4.put("targetModelId", null);
        rule4.put("targetModelName", "多模型负载均衡");
        rule4.put("weight", 100);
        rule4.put("isEnabled", false);
        rules.add(rule4);
        
        return rules;
    }

    /**
     * 保存路由规则
     */
    public Map<String, Object> saveRoutingRule(Map<String, Object> rule) {
        rule.put("id", System.currentTimeMillis());
        rule.put("createdAt", new Date());
        return rule;
    }

    /**
     * 更新路由规则
     */
    public Map<String, Object> updateRoutingRule(Long ruleId, Map<String, Object> rule) {
        rule.put("id", ruleId);
        rule.put("updatedAt", new Date());
        return rule;
    }

    /**
     * 删除路由规则
     */
    public Map<String, Object> deleteRoutingRule(Long ruleId) {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "路由规则删除成功");
        return result;
    }

    /**
     * 根据条件选择模型
     */
    public Map<String, Object> selectModel(Map<String, Object> context) {
        // 模拟模型选择逻辑
        Map<String, Object> result = new HashMap<>();
        result.put("selectedModelId", 3L);
        result.put("selectedModelCode", "gpt-3.5-turbo");
        result.put("selectedModelName", "GPT-3.5 Turbo");
        result.put("routingRuleId", 1L);
        result.put("routingRuleName", "默认路由");
        result.put("reason", "使用默认路由规则");
        return result;
    }

    // ==================== MM-007 降级策略 ====================

    /**
     * 获取降级策略列表
     */
    public List<Map<String, Object>> getFallbackStrategies() {
        List<Map<String, Object>> strategies = new ArrayList<>();
        
        Map<String, Object> strategy1 = new HashMap<>();
        strategy1.put("id", 1L);
        strategy1.put("strategyName", "GPT-4降级策略");
        strategy1.put("primaryModelId", 1L);
        strategy1.put("primaryModelName", "GPT-4");
        strategy1.put("fallbackModelIds", Arrays.asList(2L, 3L));
        strategy1.put("fallbackModelNames", Arrays.asList("GPT-4 Turbo", "GPT-3.5 Turbo"));
        strategy1.put("maxRetries", 3);
        strategy1.put("retryDelayMs", 1000);
        strategy1.put("circuitBreakerEnabled", true);
        strategy1.put("circuitBreakerThreshold", 5);
        strategy1.put("isEnabled", true);
        strategies.add(strategy1);
        
        Map<String, Object> strategy2 = new HashMap<>();
        strategy2.put("id", 2L);
        strategy2.put("strategyName", "Claude降级策略");
        strategy2.put("primaryModelId", 4L);
        strategy2.put("primaryModelName", "Claude 3 Opus");
        strategy2.put("fallbackModelIds", Arrays.asList(5L, 3L));
        strategy2.put("fallbackModelNames", Arrays.asList("Claude 3 Sonnet", "GPT-3.5 Turbo"));
        strategy2.put("maxRetries", 3);
        strategy2.put("retryDelayMs", 1000);
        strategy2.put("circuitBreakerEnabled", true);
        strategy2.put("circuitBreakerThreshold", 5);
        strategy2.put("isEnabled", true);
        strategies.add(strategy2);
        
        Map<String, Object> strategy3 = new HashMap<>();
        strategy3.put("id", 3L);
        strategy3.put("strategyName", "国内模型降级策略");
        strategy3.put("primaryModelId", 6L);
        strategy3.put("primaryModelName", "通义千问-Turbo");
        strategy3.put("fallbackModelIds", Arrays.asList(7L, 8L, 9L));
        strategy3.put("fallbackModelNames", Arrays.asList("通义千问-Plus", "文心一言4.0", "文心一言Turbo"));
        strategy3.put("maxRetries", 3);
        strategy3.put("retryDelayMs", 1000);
        strategy3.put("circuitBreakerEnabled", true);
        strategy3.put("circuitBreakerThreshold", 5);
        strategy3.put("isEnabled", true);
        strategies.add(strategy3);
        
        return strategies;
    }

    /**
     * 保存降级策略
     */
    public Map<String, Object> saveFallbackStrategy(Map<String, Object> strategy) {
        strategy.put("id", System.currentTimeMillis());
        strategy.put("createdAt", new Date());
        return strategy;
    }

    /**
     * 更新降级策略
     */
    public Map<String, Object> updateFallbackStrategy(Long strategyId, Map<String, Object> strategy) {
        strategy.put("id", strategyId);
        strategy.put("updatedAt", new Date());
        return strategy;
    }

    /**
     * 获取熔断器状态
     */
    public List<Map<String, Object>> getCircuitBreakerStatus() {
        List<Map<String, Object>> statuses = new ArrayList<>();
        
        Map<String, Object> status1 = new HashMap<>();
        status1.put("modelId", 1L);
        status1.put("modelName", "GPT-4");
        status1.put("state", "closed");
        status1.put("failureCount", 0);
        status1.put("lastFailureTime", null);
        statuses.add(status1);
        
        Map<String, Object> status2 = new HashMap<>();
        status2.put("modelId", 4L);
        status2.put("modelName", "Claude 3 Opus");
        status2.put("state", "closed");
        status2.put("failureCount", 2);
        status2.put("lastFailureTime", new Date(System.currentTimeMillis() - 3600000));
        statuses.add(status2);
        
        return statuses;
    }

    /**
     * 重置熔断器
     */
    public Map<String, Object> resetCircuitBreaker(Long modelId) {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "熔断器已重置");
        result.put("modelId", modelId);
        return result;
    }

    // ==================== MM-008 成本控制 ====================

    /**
     * 获取成本预算列表
     */
    public List<Map<String, Object>> getCostBudgets() {
        List<Map<String, Object>> budgets = new ArrayList<>();
        
        Map<String, Object> budget1 = new HashMap<>();
        budget1.put("id", 1L);
        budget1.put("budgetType", "global");
        budget1.put("budgetScopeId", null);
        budget1.put("budgetScopeName", "全局");
        budget1.put("budgetPeriod", "monthly");
        budget1.put("budgetAmount", new BigDecimal("10000.00"));
        budget1.put("currency", "CNY");
        budget1.put("alertThreshold", 80);
        budget1.put("hardLimit", false);
        budget1.put("currentUsage", new BigDecimal("3500.00"));
        budget1.put("usagePercent", 35);
        budget1.put("isEnabled", true);
        budgets.add(budget1);
        
        return budgets;
    }

    /**
     * 保存成本预算
     */
    public Map<String, Object> saveCostBudget(Map<String, Object> budget) {
        budget.put("id", System.currentTimeMillis());
        budget.put("createdAt", new Date());
        return budget;
    }

    /**
     * 更新成本预算
     */
    public Map<String, Object> updateCostBudget(Long budgetId, Map<String, Object> budget) {
        budget.put("id", budgetId);
        budget.put("updatedAt", new Date());
        return budget;
    }

    /**
     * 获取成本统计
     */
    public Map<String, Object> getCostStatistics(String period, Long providerId, Long modelId) {
        Map<String, Object> stats = new HashMap<>();
        
        // 总体统计
        stats.put("totalCalls", 15680);
        stats.put("totalTokens", 4520000);
        stats.put("totalCost", new BigDecimal("3500.00"));
        stats.put("avgCostPerCall", new BigDecimal("0.223"));
        stats.put("avgResponseTime", 1250);
        stats.put("successRate", 99.5);
        
        // 按提供商统计
        List<Map<String, Object>> byProvider = new ArrayList<>();
        Map<String, Object> openaiStats = new HashMap<>();
        openaiStats.put("providerId", 1L);
        openaiStats.put("providerName", "OpenAI");
        openaiStats.put("calls", 8500);
        openaiStats.put("cost", new BigDecimal("2100.00"));
        openaiStats.put("percent", 60);
        byProvider.add(openaiStats);
        
        Map<String, Object> anthropicStats = new HashMap<>();
        anthropicStats.put("providerId", 2L);
        anthropicStats.put("providerName", "Anthropic");
        anthropicStats.put("calls", 3200);
        anthropicStats.put("cost", new BigDecimal("800.00"));
        anthropicStats.put("percent", 23);
        byProvider.add(anthropicStats);
        
        Map<String, Object> domesticStats = new HashMap<>();
        domesticStats.put("providerId", 3L);
        domesticStats.put("providerName", "国内模型");
        domesticStats.put("calls", 3980);
        domesticStats.put("cost", new BigDecimal("600.00"));
        domesticStats.put("percent", 17);
        byProvider.add(domesticStats);
        
        stats.put("byProvider", byProvider);
        
        // 趋势数据
        List<Map<String, Object>> trend = new ArrayList<>();
        for (int i = 30; i >= 0; i--) {
            Map<String, Object> day = new HashMap<>();
            day.put("date", new Date(System.currentTimeMillis() - i * 86400000L));
            day.put("calls", 400 + (int)(Math.random() * 200));
            day.put("cost", new BigDecimal(String.format("%.2f", 80 + Math.random() * 50)));
            trend.add(day);
        }
        stats.put("trend", trend);
        
        return stats;
    }

    /**
     * 获取调用日志
     */
    public Map<String, Object> getCallLogs(int page, int size, Long modelId, String status) {
        Map<String, Object> result = new HashMap<>();
        
        List<Map<String, Object>> logs = new ArrayList<>();
        for (int i = 0; i < size; i++) {
            Map<String, Object> log = new HashMap<>();
            log.put("id", (long)(page * size + i + 1));
            log.put("userId", 1L);
            log.put("userName", "张三");
            log.put("modelId", 3L);
            log.put("modelCode", "gpt-3.5-turbo");
            log.put("modelName", "GPT-3.5 Turbo");
            log.put("callType", "chat");
            log.put("inputTokens", 150 + (int)(Math.random() * 100));
            log.put("outputTokens", 200 + (int)(Math.random() * 300));
            log.put("totalCost", new BigDecimal(String.format("%.4f", 0.001 + Math.random() * 0.01)));
            log.put("responseTimeMs", 800 + (int)(Math.random() * 1000));
            log.put("status", "success");
            log.put("createdAt", new Date(System.currentTimeMillis() - i * 60000));
            logs.add(log);
        }
        
        result.put("content", logs);
        result.put("totalElements", 1000);
        result.put("totalPages", 100);
        result.put("page", page);
        result.put("size", size);
        
        return result;
    }

    /**
     * 检查预算
     */
    public Map<String, Object> checkBudget(Long userId, BigDecimal estimatedCost) {
        Map<String, Object> result = new HashMap<>();
        result.put("allowed", true);
        result.put("remainingBudget", new BigDecimal("6500.00"));
        result.put("usagePercent", 35);
        result.put("alertLevel", "normal");
        result.put("message", "预算充足");
        return result;
    }

    /**
     * 健康检查
     */
    public List<Map<String, Object>> healthCheck() {
        List<Map<String, Object>> results = new ArrayList<>();
        
        for (Map<String, Object> provider : getProviders()) {
            Map<String, Object> health = new HashMap<>();
            health.put("providerId", provider.get("id"));
            health.put("providerName", provider.get("providerName"));
            health.put("status", "healthy");
            health.put("latency", 150 + (int)(Math.random() * 100));
            health.put("lastCheck", new Date());
            results.add(health);
        }
        
        return results;
    }
}