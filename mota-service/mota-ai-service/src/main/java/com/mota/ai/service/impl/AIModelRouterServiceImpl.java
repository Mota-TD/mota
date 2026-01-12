package com.mota.ai.service.impl;

import com.mota.ai.entity.AIModelConfig;
import com.mota.ai.mapper.AIModelConfigMapper;
import com.mota.ai.service.AIModelRouterService;
import com.mota.common.core.context.TenantContext;
import com.mota.common.core.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * AI模型路由服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AIModelRouterServiceImpl implements AIModelRouterService {

    private final AIModelConfigMapper modelConfigMapper;

    @Override
    public AIModelConfig selectBestModel(String modelType, List<String> capabilities) {
        Long tenantId = TenantContext.getTenantId();
        
        // 获取所有健康的模型
        List<AIModelConfig> healthyModels = modelConfigMapper.selectHealthyModels(tenantId);
        
        // 按模型类型过滤
        List<AIModelConfig> filteredModels = healthyModels.stream()
            .filter(m -> modelType == null || modelType.equals(m.getModelType()))
            .collect(Collectors.toList());
        
        // 按能力过滤
        if (capabilities != null && !capabilities.isEmpty()) {
            filteredModels = filteredModels.stream()
                .filter(m -> {
                    if (m.getCapabilities() == null) return false;
                    Set<String> modelCaps = new HashSet<>(Arrays.asList(m.getCapabilities().split(",")));
                    return modelCaps.containsAll(capabilities);
                })
                .collect(Collectors.toList());
        }
        
        if (filteredModels.isEmpty()) {
            // 尝试获取默认模型
            AIModelConfig defaultModel = modelConfigMapper.selectDefaultByTenant(tenantId);
            if (defaultModel != null) {
                return defaultModel;
            }
            throw new BusinessException("没有可用的AI模型");
        }
        
        // 按优先级和权重选择
        return selectByWeight(filteredModels);
    }

    @Override
    public AIModelConfig getModel(String modelName) {
        Long tenantId = TenantContext.getTenantId();
        List<AIModelConfig> models = modelConfigMapper.selectEnabledByTenant(tenantId);
        
        return models.stream()
            .filter(m -> modelName.equals(m.getModelName()))
            .findFirst()
            .orElseThrow(() -> new BusinessException("模型不存在: " + modelName));
    }

    @Override
    public AIModelConfig getDefaultModel() {
        Long tenantId = TenantContext.getTenantId();
        AIModelConfig defaultModel = modelConfigMapper.selectDefaultByTenant(tenantId);
        
        if (defaultModel == null) {
            // 返回第一个可用模型
            List<AIModelConfig> models = modelConfigMapper.selectEnabledByTenant(tenantId);
            if (!models.isEmpty()) {
                return models.get(0);
            }
            throw new BusinessException("没有可用的AI模型");
        }
        
        return defaultModel;
    }

    @Override
    public AIModelConfig getFallbackModel(Long modelId) {
        AIModelConfig model = modelConfigMapper.selectById(modelId);
        if (model == null || model.getFallbackModelId() == null) {
            return null;
        }
        
        AIModelConfig fallback = modelConfigMapper.selectById(model.getFallbackModelId());
        if (fallback != null && fallback.getIsEnabled() && "healthy".equals(fallback.getHealthStatus())) {
            return fallback;
        }
        
        // 递归查找降级模型
        if (fallback != null && fallback.getFallbackModelId() != null) {
            return getFallbackModel(fallback.getId());
        }
        
        return null;
    }

    @Override
    public List<AIModelConfig> getAvailableModels() {
        Long tenantId = TenantContext.getTenantId();
        return modelConfigMapper.selectEnabledByTenant(tenantId);
    }

    @Override
    public List<AIModelConfig> getModelsByProvider(String provider) {
        Long tenantId = TenantContext.getTenantId();
        return modelConfigMapper.selectByProvider(tenantId, provider);
    }

    @Override
    public boolean checkModelHealth(Long modelId) {
        AIModelConfig model = modelConfigMapper.selectById(modelId);
        return model != null && "healthy".equals(model.getHealthStatus());
    }

    @Override
    @Transactional
    public void updateModelHealth(Long modelId, String status) {
        AIModelConfig model = modelConfigMapper.selectById(modelId);
        if (model != null) {
            model.setHealthStatus(status);
            model.setLastHealthCheck(LocalDateTime.now());
            modelConfigMapper.updateById(model);
        }
    }

    @Override
    @Scheduled(fixedRate = 60000) // 每分钟执行一次
    public void performHealthCheck() {
        log.debug("执行AI模型健康检查...");
        
        // 获取所有启用的模型
        List<AIModelConfig> allModels = modelConfigMapper.selectList(null);
        
        for (AIModelConfig model : allModels) {
            if (!model.getIsEnabled()) continue;
            
            try {
                // TODO: 实际的健康检查逻辑（调用模型API）
                boolean isHealthy = performSingleHealthCheck(model);
                
                String newStatus = isHealthy ? "healthy" : "unhealthy";
                if (!newStatus.equals(model.getHealthStatus())) {
                    updateModelHealth(model.getId(), newStatus);
                    log.info("模型 {} 健康状态变更: {} -> {}", model.getModelName(), model.getHealthStatus(), newStatus);
                }
            } catch (Exception e) {
                log.warn("模型 {} 健康检查失败: {}", model.getModelName(), e.getMessage());
                updateModelHealth(model.getId(), "unhealthy");
            }
        }
    }

    @Override
    @Transactional
    public AIModelConfig createModelConfig(AIModelConfig config) {
        config.setTenantId(TenantContext.getTenantId());
        config.setHealthStatus("healthy");
        config.setLastHealthCheck(LocalDateTime.now());
        modelConfigMapper.insert(config);
        return config;
    }

    @Override
    @Transactional
    public AIModelConfig updateModelConfig(AIModelConfig config) {
        modelConfigMapper.updateById(config);
        return modelConfigMapper.selectById(config.getId());
    }

    @Override
    @Transactional
    public void deleteModelConfig(Long modelId) {
        modelConfigMapper.deleteById(modelId);
    }

    @Override
    public AIModelConfig getModelConfig(Long modelId) {
        return modelConfigMapper.selectById(modelId);
    }

    @Override
    public List<AIModelConfig> listModelConfigs() {
        Long tenantId = TenantContext.getTenantId();
        return modelConfigMapper.selectEnabledByTenant(tenantId);
    }

    @Override
    @Transactional
    public void setDefaultModel(Long modelId) {
        Long tenantId = TenantContext.getTenantId();
        
        // 取消当前默认模型
        AIModelConfig currentDefault = modelConfigMapper.selectDefaultByTenant(tenantId);
        if (currentDefault != null) {
            currentDefault.setIsDefault(false);
            modelConfigMapper.updateById(currentDefault);
        }
        
        // 设置新的默认模型
        AIModelConfig newDefault = modelConfigMapper.selectById(modelId);
        if (newDefault != null) {
            newDefault.setIsDefault(true);
            modelConfigMapper.updateById(newDefault);
        }
    }

    @Override
    @Transactional
    public void setModelEnabled(Long modelId, boolean enabled) {
        AIModelConfig model = modelConfigMapper.selectById(modelId);
        if (model != null) {
            model.setIsEnabled(enabled);
            modelConfigMapper.updateById(model);
        }
    }

    // ==================== 辅助方法 ====================

    /**
     * 按权重选择模型
     */
    private AIModelConfig selectByWeight(List<AIModelConfig> models) {
        if (models.size() == 1) {
            return models.get(0);
        }
        
        // 计算总权重
        int totalWeight = models.stream()
            .mapToInt(m -> m.getWeight() != null ? m.getWeight() : 1)
            .sum();
        
        // 随机选择
        int random = new Random().nextInt(totalWeight);
        int currentWeight = 0;
        
        for (AIModelConfig model : models) {
            currentWeight += model.getWeight() != null ? model.getWeight() : 1;
            if (random < currentWeight) {
                return model;
            }
        }
        
        return models.get(0);
    }

    /**
     * 执行单个模型的健康检查
     */
    private boolean performSingleHealthCheck(AIModelConfig model) {
        // TODO: 实现实际的健康检查逻辑
        // 可以发送一个简单的请求到模型API来验证连接
        return true;
    }
}