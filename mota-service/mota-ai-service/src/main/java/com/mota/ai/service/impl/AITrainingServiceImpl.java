package com.mota.ai.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mota.ai.entity.AITrainingConfig;
import com.mota.ai.entity.AITrainingDocument;
import com.mota.ai.entity.AITrainingHistory;
import com.mota.ai.mapper.AITrainingConfigMapper;
import com.mota.ai.mapper.AITrainingDocumentMapper;
import com.mota.ai.mapper.AITrainingHistoryMapper;
import com.mota.ai.service.AITrainingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * AI训练服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AITrainingServiceImpl implements AITrainingService {

    private final AITrainingDocumentMapper documentMapper;
    private final AITrainingHistoryMapper historyMapper;
    private final AITrainingConfigMapper configMapper;

    // 模拟训练进度存储
    private final Map<String, Map<String, Object>> trainingProgressMap = new ConcurrentHashMap<>();

    @Override
    public Map<String, Object> getTrainingStats(Long enterpriseId) {
        Map<String, Object> stats = new HashMap<>();
        
        // 统计文档数量
        LambdaQueryWrapper<AITrainingDocument> docQuery = new LambdaQueryWrapper<>();
        if (enterpriseId != null) {
            docQuery.eq(AITrainingDocument::getEnterpriseId, enterpriseId);
        }
        Long totalDocuments = documentMapper.selectCount(docQuery);
        
        // 获取最近一次训练记录
        LambdaQueryWrapper<AITrainingHistory> historyQuery = new LambdaQueryWrapper<>();
        if (enterpriseId != null) {
            historyQuery.eq(AITrainingHistory::getEnterpriseId, enterpriseId);
        }
        historyQuery.orderByDesc(AITrainingHistory::getCreatedAt);
        historyQuery.last("LIMIT 1");
        AITrainingHistory lastTraining = historyMapper.selectOne(historyQuery);
        
        stats.put("totalDocuments", totalDocuments);
        stats.put("totalTokens", formatTokens(totalDocuments * 5000)); // 估算token数
        stats.put("lastTraining", lastTraining != null ? 
            lastTraining.getDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) : "暂无训练记录");
        stats.put("modelVersion", lastTraining != null ? lastTraining.getVersion() : "v1.0.0");
        stats.put("accuracy", lastTraining != null ? lastTraining.getAccuracy() : BigDecimal.valueOf(0.85));
        
        return stats;
    }

    @Override
    public List<AITrainingHistory> getTrainingHistory(Long enterpriseId) {
        LambdaQueryWrapper<AITrainingHistory> query = new LambdaQueryWrapper<>();
        if (enterpriseId != null) {
            query.eq(AITrainingHistory::getEnterpriseId, enterpriseId);
        }
        query.orderByDesc(AITrainingHistory::getCreatedAt);
        return historyMapper.selectList(query);
    }

    @Override
    public List<AITrainingDocument> getDocuments(Long enterpriseId) {
        LambdaQueryWrapper<AITrainingDocument> query = new LambdaQueryWrapper<>();
        if (enterpriseId != null) {
            query.eq(AITrainingDocument::getEnterpriseId, enterpriseId);
        }
        query.orderByDesc(AITrainingDocument::getUploadTime);
        return documentMapper.selectList(query);
    }

    @Override
    public AITrainingDocument uploadDocument(Long enterpriseId, Long userId, MultipartFile file) {
        AITrainingDocument document = new AITrainingDocument();
        document.setEnterpriseId(enterpriseId);
        document.setName(file.getOriginalFilename());
        document.setFileSize(file.getSize());
        document.setSize(formatFileSize(file.getSize()));
        document.setFileType(getFileExtension(file.getOriginalFilename()));
        document.setStatus("pending");
        document.setUploadUserId(userId);
        document.setUploadTime(LocalDateTime.now());
        document.setCreatedAt(LocalDateTime.now());
        document.setUpdatedAt(LocalDateTime.now());
        
        // TODO: 实际保存文件到存储系统
        document.setFilePath("/uploads/training/" + UUID.randomUUID() + "_" + file.getOriginalFilename());
        
        documentMapper.insert(document);
        
        // 模拟异步索引处理
        new Thread(() -> {
            try {
                Thread.sleep(2000);
                document.setStatus("indexed");
                document.setUpdatedAt(LocalDateTime.now());
                documentMapper.updateById(document);
            } catch (InterruptedException e) {
                log.error("索引处理被中断", e);
                Thread.currentThread().interrupt();
            }
        }).start();
        
        return document;
    }

    @Override
    public void deleteDocument(Long id) {
        documentMapper.deleteById(id);
    }

    @Override
    public Map<String, Object> startTraining(Long enterpriseId) {
        String taskId = UUID.randomUUID().toString();
        
        // 创建训练历史记录
        AITrainingHistory history = new AITrainingHistory();
        history.setEnterpriseId(enterpriseId);
        history.setVersion("v" + System.currentTimeMillis() % 1000);
        history.setDate(LocalDateTime.now());
        history.setStatus("training");
        history.setTaskId(taskId);
        history.setProgress(0);
        history.setCreatedAt(LocalDateTime.now());
        history.setUpdatedAt(LocalDateTime.now());
        
        // 统计文档数量
        LambdaQueryWrapper<AITrainingDocument> docQuery = new LambdaQueryWrapper<>();
        if (enterpriseId != null) {
            docQuery.eq(AITrainingDocument::getEnterpriseId, enterpriseId);
        }
        Long docCount = documentMapper.selectCount(docQuery);
        history.setDocuments(docCount.intValue());
        
        historyMapper.insert(history);
        
        // 初始化进度
        Map<String, Object> progress = new HashMap<>();
        progress.put("progress", 0);
        progress.put("status", "training");
        progress.put("historyId", history.getId());
        trainingProgressMap.put(taskId, progress);
        
        // 模拟异步训练过程
        final Long historyId = history.getId();
        new Thread(() -> simulateTraining(taskId, historyId)).start();
        
        Map<String, Object> result = new HashMap<>();
        result.put("taskId", taskId);
        return result;
    }

    private void simulateTraining(String taskId, Long historyId) {
        try {
            for (int i = 0; i <= 100; i += 10) {
                Thread.sleep(1000);
                Map<String, Object> progress = trainingProgressMap.get(taskId);
                if (progress != null) {
                    progress.put("progress", i);
                    if (i == 100) {
                        progress.put("status", "completed");
                        
                        // 更新训练历史
                        AITrainingHistory history = historyMapper.selectById(historyId);
                        if (history != null) {
                            history.setStatus("completed");
                            history.setProgress(100);
                            history.setAccuracy(BigDecimal.valueOf(0.85 + Math.random() * 0.1));
                            history.setUpdatedAt(LocalDateTime.now());
                            historyMapper.updateById(history);
                        }
                    }
                }
            }
        } catch (InterruptedException e) {
            log.error("训练过程被中断", e);
            Thread.currentThread().interrupt();
        }
    }

    @Override
    public Map<String, Object> getTrainingProgress(String taskId) {
        Map<String, Object> progress = trainingProgressMap.get(taskId);
        if (progress == null) {
            // 从数据库查询
            LambdaQueryWrapper<AITrainingHistory> query = new LambdaQueryWrapper<>();
            query.eq(AITrainingHistory::getTaskId, taskId);
            AITrainingHistory history = historyMapper.selectOne(query);
            if (history != null) {
                progress = new HashMap<>();
                progress.put("progress", history.getProgress());
                progress.put("status", history.getStatus());
            } else {
                progress = new HashMap<>();
                progress.put("progress", 0);
                progress.put("status", "unknown");
            }
        }
        return progress;
    }

    @Override
    public void saveTrainingSettings(Long enterpriseId, Map<String, Object> settings) {
        saveConfig(enterpriseId, "training", settings);
    }

    @Override
    public void saveBusinessConfig(Long enterpriseId, Map<String, Object> config) {
        saveConfig(enterpriseId, "business", config);
    }

    private void saveConfig(Long enterpriseId, String configType, Map<String, Object> configMap) {
        for (Map.Entry<String, Object> entry : configMap.entrySet()) {
            LambdaQueryWrapper<AITrainingConfig> query = new LambdaQueryWrapper<>();
            query.eq(AITrainingConfig::getEnterpriseId, enterpriseId);
            query.eq(AITrainingConfig::getConfigType, configType);
            query.eq(AITrainingConfig::getConfigKey, entry.getKey());
            
            AITrainingConfig config = configMapper.selectOne(query);
            if (config == null) {
                config = new AITrainingConfig();
                config.setEnterpriseId(enterpriseId);
                config.setConfigType(configType);
                config.setConfigKey(entry.getKey());
                config.setConfigValue(String.valueOf(entry.getValue()));
                config.setCreatedAt(LocalDateTime.now());
                config.setUpdatedAt(LocalDateTime.now());
                configMapper.insert(config);
            } else {
                config.setConfigValue(String.valueOf(entry.getValue()));
                config.setUpdatedAt(LocalDateTime.now());
                configMapper.updateById(config);
            }
        }
    }

    private String formatFileSize(long size) {
        if (size < 1024) {
            return size + " B";
        } else if (size < 1024 * 1024) {
            return String.format("%.1f KB", size / 1024.0);
        } else if (size < 1024 * 1024 * 1024) {
            return String.format("%.1f MB", size / (1024.0 * 1024));
        } else {
            return String.format("%.1f GB", size / (1024.0 * 1024 * 1024));
        }
    }

    private String formatTokens(long tokens) {
        if (tokens < 1000) {
            return tokens + "";
        } else if (tokens < 1000000) {
            return String.format("%.1fK", tokens / 1000.0);
        } else {
            return String.format("%.1fM", tokens / 1000000.0);
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }
}