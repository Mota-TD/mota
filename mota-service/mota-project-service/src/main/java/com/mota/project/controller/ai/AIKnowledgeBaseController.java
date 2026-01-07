package com.mota.project.controller.ai;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.mota.project.entity.ai.AIKnowledgeDocument;
import com.mota.project.entity.ai.AIOcrRecord;
import com.mota.project.service.ai.AIKnowledgeBaseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * AI知识库控制器（项目知识库相关）
 * 提供AI-001到AI-010的所有API接口
 * 注意：此控制器提供项目相关的知识库AI功能
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/ai/knowledge")
@RequiredArgsConstructor
@Tag(name = "项目AI知识库", description = "项目相关的AI知识库管理接口")
public class AIKnowledgeBaseController {

    private final AIKnowledgeBaseService knowledgeBaseService;

    // ==================== AI-001 文档解析 ====================

    @PostMapping("/documents/upload")
    @Operation(summary = "上传文档", description = "上传并解析文档")
    public ResponseEntity<AIKnowledgeDocument> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "teamId", required = false) Long teamId,
            @RequestParam("creatorId") Long creatorId) throws IOException {
        AIKnowledgeDocument document = knowledgeBaseService.uploadDocument(file, teamId, creatorId);
        return ResponseEntity.ok(document);
    }

    @GetMapping("/documents")
    @Operation(summary = "获取文档列表", description = "分页获取文档列表")
    public ResponseEntity<IPage<AIKnowledgeDocument>> getDocumentList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long teamId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String fileType,
            @RequestParam(required = false) String parseStatus,
            @RequestParam(required = false) String keyword) {
        IPage<AIKnowledgeDocument> result = knowledgeBaseService.getDocumentList(
                page, size, teamId, categoryId, fileType, parseStatus, keyword);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/documents/{id}")
    @Operation(summary = "获取文档详情", description = "根据ID获取文档详情")
    public ResponseEntity<AIKnowledgeDocument> getDocumentById(
            @PathVariable Long id) {
        AIKnowledgeDocument document = knowledgeBaseService.getDocumentById(id);
        return ResponseEntity.ok(document);
    }

    @DeleteMapping("/documents/{id}")
    @Operation(summary = "删除文档", description = "删除指定文档")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        knowledgeBaseService.deleteDocument(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/documents/{id}/reparse")
    @Operation(summary = "重新解析文档", description = "重新解析指定文档")
    public ResponseEntity<Void> reparseDocument(@PathVariable Long id) {
        knowledgeBaseService.parseDocument(id);
        return ResponseEntity.ok().build();
    }

    // ==================== AI-002 OCR识别 ====================

    @PostMapping("/ocr/recognize")
    @Operation(summary = "OCR识别", description = "识别图片中的文字")
    public ResponseEntity<AIOcrRecord> recognizeImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "documentId", required = false) Long documentId,
            @RequestParam("creatorId") Long creatorId) throws IOException {
        AIOcrRecord record = knowledgeBaseService.recognizeImage(file, documentId, creatorId);
        return ResponseEntity.ok(record);
    }

    @GetMapping("/ocr/records")
    @Operation(summary = "获取OCR记录", description = "获取文档的OCR识别记录")
    public ResponseEntity<List<AIOcrRecord>> getOcrRecords(
            @RequestParam Long documentId) {
        List<AIOcrRecord> records = knowledgeBaseService.getOcrRecordsByDocumentId(documentId);
        return ResponseEntity.ok(records);
    }

    // ==================== AI-003 语音转文字 ====================

    @PostMapping("/speech/transcribe")
    @Operation(summary = "语音转文字", description = "将音频/视频转换为文字")
    public ResponseEntity<Map<String, Object>> transcribeAudio(
            @RequestParam("file") MultipartFile file,
            @RequestParam("creatorId") Long creatorId) throws IOException {
        Map<String, Object> result = knowledgeBaseService.transcribeAudio(file, creatorId);
        return ResponseEntity.ok(result);
    }

    // ==================== AI-004 表格提取 ====================

    @GetMapping("/documents/{id}/tables")
    @Operation(summary = "提取表格", description = "从文档中提取表格")
    public ResponseEntity<List<Map<String, Object>>> extractTables(
            @PathVariable Long id) {
        List<Map<String, Object>> tables = knowledgeBaseService.extractTables(id);
        return ResponseEntity.ok(tables);
    }

    // ==================== AI-005 关键信息提取 ====================

    @GetMapping("/documents/{id}/key-info")
    @Operation(summary = "提取关键信息", description = "提取文档中的实体、关系、事件")
    public ResponseEntity<Map<String, Object>> extractKeyInfo(
            @PathVariable Long id) {
        Map<String, Object> result = knowledgeBaseService.extractKeyInfo(id);
        return ResponseEntity.ok(result);
    }

    // ==================== AI-006 自动摘要 ====================

    @PostMapping("/documents/{id}/summary")
    @Operation(summary = "生成摘要", description = "生成文档摘要")
    public ResponseEntity<Map<String, Object>> generateSummary(
            @PathVariable Long id,
            @RequestParam(defaultValue = "abstractive") String summaryType,
            @RequestParam(defaultValue = "medium") String summaryLength) {
        Map<String, Object> result = knowledgeBaseService.generateSummary(id, summaryType, summaryLength);
        return ResponseEntity.ok(result);
    }

    // ==================== AI-007 主题分类 ====================

    @PostMapping("/documents/{id}/classify")
    @Operation(summary = "自动分类", description = "自动对文档进行主题分类")
    public ResponseEntity<Map<String, Object>> classifyDocument(
            @PathVariable Long id) {
        Map<String, Object> result = knowledgeBaseService.classifyDocument(id);
        return ResponseEntity.ok(result);
    }

    // ==================== AI-008 自动标签 ====================

    @PostMapping("/documents/{id}/tags")
    @Operation(summary = "生成标签", description = "自动为文档生成标签")
    public ResponseEntity<Map<String, Object>> generateTags(
            @PathVariable Long id) {
        Map<String, Object> result = knowledgeBaseService.generateTags(id);
        return ResponseEntity.ok(result);
    }

    // ==================== AI-009 向量化存储 ====================

    @PostMapping("/documents/{id}/vectorize")
    @Operation(summary = "向量化文档", description = "将文档内容向量化存储")
    public ResponseEntity<Map<String, Object>> vectorizeDocument(
            @PathVariable Long id) {
        knowledgeBaseService.vectorizeDocument(id);
        Map<String, Object> result = new HashMap<>();
        result.put("documentId", id);
        result.put("status", "processing");
        result.put("message", "向量化任务已提交");
        return ResponseEntity.ok(result);
    }

    // ==================== AI-010 语义检索 ====================

    @GetMapping("/search")
    @Operation(summary = "语义检索", description = "基于语义相似度检索文档")
    public ResponseEntity<Map<String, Object>> semanticSearch(
            @RequestParam String query,
            @RequestParam(required = false) Long teamId,
            @RequestParam(defaultValue = "10") int topK,
            @RequestParam(defaultValue = "0.7") double threshold) {
        Map<String, Object> result = knowledgeBaseService.semanticSearch(query, teamId, topK, threshold);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/search/hybrid")
    @Operation(summary = "混合检索", description = "向量+关键词混合检索")
    public ResponseEntity<Map<String, Object>> hybridSearch(
            @RequestParam String query,
            @RequestParam(required = false) Long teamId,
            @RequestParam(defaultValue = "10") int topK,
            @RequestParam(defaultValue = "0.7") double semanticWeight,
            @RequestParam(defaultValue = "0.3") double keywordWeight) {
        Map<String, Object> result = knowledgeBaseService.hybridSearch(
                query, teamId, topK, semanticWeight, keywordWeight);
        return ResponseEntity.ok(result);
    }

    // ==================== 批量操作 ====================

    @PostMapping("/documents/batch/parse")
    @Operation(summary = "批量解析", description = "批量解析多个文档")
    public ResponseEntity<Map<String, Object>> batchParse(
            @RequestBody List<Long> documentIds) {
        Map<String, Object> result = new HashMap<>();
        int count = 0;
        for (Long id : documentIds) {
            try {
                knowledgeBaseService.parseDocument(id);
                count++;
            } catch (Exception e) {
                log.error("Failed to parse document: {}", id, e);
            }
        }
        result.put("total", documentIds.size());
        result.put("success", count);
        result.put("failed", documentIds.size() - count);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/documents/batch/vectorize")
    @Operation(summary = "批量向量化", description = "批量向量化多个文档")
    public ResponseEntity<Map<String, Object>> batchVectorize(
            @RequestBody List<Long> documentIds) {
        Map<String, Object> result = new HashMap<>();
        int count = 0;
        for (Long id : documentIds) {
            try {
                knowledgeBaseService.vectorizeDocument(id);
                count++;
            } catch (Exception e) {
                log.error("Failed to vectorize document: {}", id, e);
            }
        }
        result.put("total", documentIds.size());
        result.put("success", count);
        result.put("failed", documentIds.size() - count);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/documents/batch/classify")
    @Operation(summary = "批量分类", description = "批量对文档进行分类")
    public ResponseEntity<Map<String, Object>> batchClassify(
            @RequestBody List<Long> documentIds) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> classifications = new java.util.ArrayList<>();
        for (Long id : documentIds) {
            try {
                Map<String, Object> classification = knowledgeBaseService.classifyDocument(id);
                classifications.add(classification);
            } catch (Exception e) {
                log.error("Failed to classify document: {}", id, e);
            }
        }
        result.put("total", documentIds.size());
        result.put("classifications", classifications);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/documents/batch/tags")
    @Operation(summary = "批量生成标签", description = "批量为文档生成标签")
    public ResponseEntity<Map<String, Object>> batchGenerateTags(
            @RequestBody List<Long> documentIds) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> tagResults = new java.util.ArrayList<>();
        for (Long id : documentIds) {
            try {
                Map<String, Object> tags = knowledgeBaseService.generateTags(id);
                tagResults.add(tags);
            } catch (Exception e) {
                log.error("Failed to generate tags for document: {}", id, e);
            }
        }
        result.put("total", documentIds.size());
        result.put("tagResults", tagResults);
        return ResponseEntity.ok(result);
    }

    // ==================== 统计信息 ====================

    @GetMapping("/stats")
    @Operation(summary = "获取统计信息", description = "获取知识库统计信息")
    public ResponseEntity<Map<String, Object>> getStats(
            @RequestParam(required = false) Long teamId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalDocuments", 128);
        stats.put("parsedDocuments", 120);
        stats.put("vectorizedDocuments", 115);
        stats.put("totalVectors", 2560);
        stats.put("totalTokens", "1.2M");
        stats.put("storageUsed", "256MB");
        stats.put("lastUpdated", java.time.LocalDateTime.now());
        return ResponseEntity.ok(stats);
    }
}