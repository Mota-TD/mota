package com.mota.ai.service;

import com.mota.ai.entity.AIModelConfig;

import java.util.List;
import java.util.Map;

/**
 * AI模型路由服务接口
 * MM-006 模型路由
 * MM-007 降级策略
 */
public interface AIModelRouterService {

    /**
     * 获取最佳可用模型
     * @param modelType 模型类型
     * @param capabilities 所需能力
     * @return 模型配置
     */
    AIModelConfig selectBestModel(String modelType, List<String> capabilities);

    /**
     * 获取指定模型
     * @param modelName 模型名称
     * @return 模型配置
     */
    AIModelConfig getModel(String modelName);

    /**
     * 获取默认模型
     * @return 模型配置
     */
    AIModelConfig getDefaultModel();

    /**
     * 获取降级模型
     * @param modelId 原模型ID
     * @return 降级模型配置
     */
    AIModelConfig getFallbackModel(Long modelId);

    /**
     * 获取所有可用模型
     * @return 模型列表
     */
    List<AIModelConfig> getAvailableModels();

    /**
     * 按提供商获取模型
     * @param provider 提供商
     * @return 模型列表
     */
    List<AIModelConfig> getModelsByProvider(String provider);

    /**
     * 检查模型健康状态
     * @param modelId 模型ID
     * @return 是否健康
     */
    boolean checkModelHealth(Long modelId);

    /**
     * 更新模型健康状态
     * @param modelId 模型ID
     * @param status 健康状态
     */
    void updateModelHealth(Long modelId, String status);

    /**
     * 执行健康检查
     */
    void performHealthCheck();

    /**
     * 模型配置CRUD
     */
    AIModelConfig createModelConfig(AIModelConfig config);
    AIModelConfig updateModelConfig(AIModelConfig config);
    void deleteModelConfig(Long modelId);
    AIModelConfig getModelConfig(Long modelId);
    List<AIModelConfig> listModelConfigs();

    /**
     * 设置默认模型
     * @param modelId 模型ID
     */
    void setDefaultModel(Long modelId);

    /**
     * 启用/禁用模型
     * @param modelId 模型ID
     * @param enabled 是否启用
     */
    void setModelEnabled(Long modelId, boolean enabled);
}