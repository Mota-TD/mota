package com.mota.ai.service;

import com.mota.ai.entity.AITrainingDocument;
import com.mota.ai.entity.AITrainingHistory;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * AI训练服务接口
 */
public interface AITrainingService {

    /**
     * 获取训练统计信息
     */
    Map<String, Object> getTrainingStats(Long enterpriseId);

    /**
     * 获取训练历史
     */
    List<AITrainingHistory> getTrainingHistory(Long enterpriseId);

    /**
     * 获取知识库文档列表
     */
    List<AITrainingDocument> getDocuments(Long enterpriseId);

    /**
     * 上传知识库文档
     */
    AITrainingDocument uploadDocument(Long enterpriseId, Long userId, MultipartFile file);

    /**
     * 删除知识库文档
     */
    void deleteDocument(Long id);

    /**
     * 开始训练
     */
    Map<String, Object> startTraining(Long enterpriseId);

    /**
     * 获取训练进度
     */
    Map<String, Object> getTrainingProgress(String taskId);

    /**
     * 保存训练设置
     */
    void saveTrainingSettings(Long enterpriseId, Map<String, Object> settings);

    /**
     * 保存业务配置
     */
    void saveBusinessConfig(Long enterpriseId, Map<String, Object> config);
}