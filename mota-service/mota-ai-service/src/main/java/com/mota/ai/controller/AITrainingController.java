package com.mota.ai.controller;

import com.mota.ai.entity.AITrainingDocument;
import com.mota.ai.entity.AITrainingHistory;
import com.mota.ai.service.AITrainingService;
import com.mota.common.core.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * AI模型训练控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/ai/training")
@RequiredArgsConstructor
@Tag(name = "AI模型训练", description = "AI模型训练相关接口")
public class AITrainingController {

    private final AITrainingService trainingService;

    /**
     * 获取训练统计信息
     */
    @GetMapping("/stats")
    @Operation(summary = "获取训练统计信息")
    public Result<Map<String, Object>> getTrainingStats(
            @RequestHeader(value = "X-Enterprise-Id", required = false) Long enterpriseId) {
        log.info("获取训练统计信息, enterpriseId: {}", enterpriseId);
        Map<String, Object> stats = trainingService.getTrainingStats(enterpriseId);
        return Result.success(stats);
    }

    /**
     * 获取训练历史
     */
    @GetMapping("/history")
    @Operation(summary = "获取训练历史")
    public Result<List<AITrainingHistory>> getTrainingHistory(
            @RequestHeader(value = "X-Enterprise-Id", required = false) Long enterpriseId) {
        log.info("获取训练历史, enterpriseId: {}", enterpriseId);
        List<AITrainingHistory> history = trainingService.getTrainingHistory(enterpriseId);
        return Result.success(history);
    }

    /**
     * 获取知识库文档列表
     */
    @GetMapping("/documents")
    @Operation(summary = "获取知识库文档列表")
    public Result<List<AITrainingDocument>> getDocuments(
            @RequestHeader(value = "X-Enterprise-Id", required = false) Long enterpriseId) {
        log.info("获取知识库文档列表, enterpriseId: {}", enterpriseId);
        List<AITrainingDocument> documents = trainingService.getDocuments(enterpriseId);
        return Result.success(documents);
    }

    /**
     * 上传知识库文档
     */
    @PostMapping("/documents")
    @Operation(summary = "上传知识库文档")
    public Result<AITrainingDocument> uploadDocument(
            @RequestHeader(value = "X-Enterprise-Id", required = false) Long enterpriseId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestParam("file") MultipartFile file) {
        log.info("上传知识库文档, enterpriseId: {}, userId: {}, fileName: {}", 
                enterpriseId, userId, file.getOriginalFilename());
        AITrainingDocument document = trainingService.uploadDocument(enterpriseId, userId, file);
        return Result.success(document);
    }

    /**
     * 删除知识库文档
     */
    @DeleteMapping("/documents/{id}")
    @Operation(summary = "删除知识库文档")
    public Result<Void> deleteDocument(@PathVariable Long id) {
        log.info("删除知识库文档, id: {}", id);
        trainingService.deleteDocument(id);
        return Result.success();
    }

    /**
     * 开始训练
     */
    @PostMapping("/start")
    @Operation(summary = "开始训练")
    public Result<Map<String, Object>> startTraining(
            @RequestHeader(value = "X-Enterprise-Id", required = false) Long enterpriseId) {
        log.info("开始训练, enterpriseId: {}", enterpriseId);
        Map<String, Object> result = trainingService.startTraining(enterpriseId);
        return Result.success(result);
    }

    /**
     * 获取训练进度
     */
    @GetMapping("/progress/{taskId}")
    @Operation(summary = "获取训练进度")
    public Result<Map<String, Object>> getTrainingProgress(@PathVariable String taskId) {
        log.info("获取训练进度, taskId: {}", taskId);
        Map<String, Object> progress = trainingService.getTrainingProgress(taskId);
        return Result.success(progress);
    }

    /**
     * 保存训练设置
     */
    @PostMapping("/settings")
    @Operation(summary = "保存训练设置")
    public Result<Void> saveTrainingSettings(
            @RequestHeader(value = "X-Enterprise-Id", required = false) Long enterpriseId,
            @RequestBody Map<String, Object> settings) {
        log.info("保存训练设置, enterpriseId: {}, settings: {}", enterpriseId, settings);
        trainingService.saveTrainingSettings(enterpriseId, settings);
        return Result.success();
    }

    /**
     * 保存业务配置
     */
    @PostMapping("/business-config")
    @Operation(summary = "保存业务配置")
    public Result<Void> saveBusinessConfig(
            @RequestHeader(value = "X-Enterprise-Id", required = false) Long enterpriseId,
            @RequestBody Map<String, Object> config) {
        log.info("保存业务配置, enterpriseId: {}, config: {}", enterpriseId, config);
        trainingService.saveBusinessConfig(enterpriseId, config);
        return Result.success();
    }
}