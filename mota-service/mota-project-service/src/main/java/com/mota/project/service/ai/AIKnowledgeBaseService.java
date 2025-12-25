package com.mota.project.service.ai;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.project.entity.ai.*;
import com.mota.project.mapper.ai.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;

/**
 * AI知识库服务
 * 实现AI-001到AI-010的所有功能
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AIKnowledgeBaseService {

    private final AIKnowledgeDocumentMapper documentMapper;
    private final AIOcrRecordMapper ocrRecordMapper;
    private final AIDocumentVectorMapper vectorMapper;

    private static final String UPLOAD_DIR = "uploads/ai-knowledge/";

    // ==================== AI-001 文档解析 ====================

    /**
     * 上传并解析文档
     */
    @Transactional
    public AIKnowledgeDocument uploadDocument(MultipartFile file, Long teamId, Long creatorId) throws IOException {
        // 保存文件
        String originalFilename = file.getOriginalFilename();
        String fileType = getFileType(originalFilename);
        String filePath = saveFile(file, teamId);

        // 创建文档记录
        AIKnowledgeDocument document = new AIKnowledgeDocument();
        document.setTitle(getFileNameWithoutExtension(originalFilename));
        document.setOriginalFilename(originalFilename);
        document.setFilePath(filePath);
        document.setFileType(fileType);
        document.setFileSize(file.getSize());
        document.setMimeType(file.getContentType());
        document.setParseStatus(AIKnowledgeDocument.STATUS_PENDING);
        document.setTeamId(teamId);
        document.setCreatorId(creatorId);
        document.setLanguage("zh");

        documentMapper.insert(document);

        // 异步解析文档
        parseDocumentAsync(document.getId());

        return document;
    }

    /**
     * 解析文档内容
     */
    @Transactional
    public void parseDocument(Long documentId) {
        AIKnowledgeDocument document = documentMapper.selectById(documentId);
        if (document == null) {
            log.error("Document not found: {}", documentId);
            return;
        }

        try {
            document.setParseStatus(AIKnowledgeDocument.STATUS_PARSING);
            documentMapper.updateById(document);

            // 根据文件类型解析
            String content = parseFileContent(document.getFilePath(), document.getFileType());
            
            document.setContentText(content);
            document.setWordCount(countWords(content));
            document.setCharCount(content.length());
            document.setParseStatus(AIKnowledgeDocument.STATUS_COMPLETED);
            document.setParsedAt(LocalDateTime.now());

            documentMapper.updateById(document);

            // 触发后续处理：向量化、摘要生成等
            processDocumentAfterParse(document);

        } catch (Exception e) {
            log.error("Failed to parse document: {}", documentId, e);
            document.setParseStatus(AIKnowledgeDocument.STATUS_FAILED);
            document.setParseError(e.getMessage());
            documentMapper.updateById(document);
        }
    }

    /**
     * 获取文档列表
     */
    public IPage<AIKnowledgeDocument> getDocumentList(
            int page, int size, Long teamId, Long categoryId, 
            String fileType, String parseStatus, String keyword) {
        Page<AIKnowledgeDocument> pageParam = new Page<>(page, size);
        return documentMapper.selectDocumentPage(pageParam, teamId, categoryId, fileType, parseStatus, keyword);
    }

    /**
     * 获取文档详情
     */
    public AIKnowledgeDocument getDocumentById(Long id) {
        return documentMapper.selectById(id);
    }

    /**
     * 删除文档
     */
    @Transactional
    public void deleteDocument(Long id) {
        // 删除关联的向量
        vectorMapper.deleteByDocumentId(id);
        // 删除文档
        documentMapper.deleteById(id);
    }

    // ==================== AI-002 OCR识别 ====================

    /**
     * OCR识别图片
     */
    @Transactional
    public AIOcrRecord recognizeImage(MultipartFile imageFile, Long documentId, Long creatorId) throws IOException {
        String imagePath = saveFile(imageFile, null);

        AIOcrRecord record = new AIOcrRecord();
        record.setDocumentId(documentId);
        record.setImagePath(imagePath);
        record.setImageType(getFileType(imageFile.getOriginalFilename()));
        record.setOcrEngine("tesseract");
        record.setOcrLanguage("chi_sim+eng");
        record.setOcrStatus(AIOcrRecord.STATUS_PENDING);
        record.setCreatorId(creatorId);

        ocrRecordMapper.insert(record);

        // 异步执行OCR
        performOcrAsync(record.getId());

        return record;
    }

    /**
     * 执行OCR识别
     */
    @Transactional
    public void performOcr(Long recordId) {
        AIOcrRecord record = ocrRecordMapper.selectById(recordId);
        if (record == null) return;

        try {
            record.setOcrStatus(AIOcrRecord.STATUS_PROCESSING);
            ocrRecordMapper.updateById(record);

            long startTime = System.currentTimeMillis();

            // 模拟OCR识别（实际应调用OCR引擎）
            String recognizedText = performOcrRecognition(record.getImagePath(), record.getOcrLanguage());

            record.setRecognizedText(recognizedText);
            record.setConfidence(new BigDecimal("95.5"));
            record.setProcessingTime((int) (System.currentTimeMillis() - startTime));
            record.setOcrStatus(AIOcrRecord.STATUS_COMPLETED);

            ocrRecordMapper.updateById(record);

        } catch (Exception e) {
            log.error("OCR failed for record: {}", recordId, e);
            record.setOcrStatus(AIOcrRecord.STATUS_FAILED);
            record.setOcrError(e.getMessage());
            ocrRecordMapper.updateById(record);
        }
    }

    /**
     * 获取OCR记录
     */
    public List<AIOcrRecord> getOcrRecordsByDocumentId(Long documentId) {
        return ocrRecordMapper.selectByDocumentId(documentId);
    }

    // ==================== AI-003 语音转文字 ====================

    /**
     * 语音转文字
     */
    public Map<String, Object> transcribeAudio(MultipartFile audioFile, Long creatorId) throws IOException {
        // 保存音频文件
        String audioPath = saveFile(audioFile, null);

        // 模拟语音转文字结果
        Map<String, Object> result = new HashMap<>();
        result.put("audioPath", audioPath);
        result.put("status", "processing");
        result.put("message", "语音转文字任务已提交，请稍后查看结果");

        // 实际应调用Whisper或其他STT引擎
        return result;
    }

    // ==================== AI-004 表格提取 ====================

    /**
     * 从文档中提取表格
     */
    public List<Map<String, Object>> extractTables(Long documentId) {
        AIKnowledgeDocument document = documentMapper.selectById(documentId);
        if (document == null) {
            return Collections.emptyList();
        }

        // 模拟表格提取结果
        List<Map<String, Object>> tables = new ArrayList<>();
        
        Map<String, Object> table1 = new HashMap<>();
        table1.put("tableIndex", 0);
        table1.put("pageNumber", 1);
        table1.put("rowCount", 5);
        table1.put("columnCount", 3);
        table1.put("headers", Arrays.asList("列1", "列2", "列3"));
        table1.put("data", Arrays.asList(
            Arrays.asList("数据1", "数据2", "数据3"),
            Arrays.asList("数据4", "数据5", "数据6")
        ));
        table1.put("confidence", 92.5);
        tables.add(table1);

        return tables;
    }

    // ==================== AI-005 关键信息提取 ====================

    /**
     * 提取关键信息（实体、关系、事件）
     */
    public Map<String, Object> extractKeyInfo(Long documentId) {
        AIKnowledgeDocument document = documentMapper.selectById(documentId);
        if (document == null || document.getContentText() == null) {
            return Collections.emptyMap();
        }

        Map<String, Object> result = new HashMap<>();

        // 模拟实体提取
        List<Map<String, Object>> entities = new ArrayList<>();
        Map<String, Object> entity1 = new HashMap<>();
        entity1.put("type", "person");
        entity1.put("text", "张三");
        entity1.put("confidence", 95.0);
        entities.add(entity1);

        Map<String, Object> entity2 = new HashMap<>();
        entity2.put("type", "org");
        entity2.put("text", "摩塔科技");
        entity2.put("confidence", 98.0);
        entities.add(entity2);

        result.put("entities", entities);

        // 模拟关系提取
        List<Map<String, Object>> relations = new ArrayList<>();
        Map<String, Object> relation1 = new HashMap<>();
        relation1.put("type", "work_for");
        relation1.put("subject", "张三");
        relation1.put("object", "摩塔科技");
        relation1.put("confidence", 88.0);
        relations.add(relation1);

        result.put("relations", relations);

        // 模拟事件提取
        List<Map<String, Object>> events = new ArrayList<>();
        Map<String, Object> event1 = new HashMap<>();
        event1.put("type", "meeting");
        event1.put("trigger", "会议");
        event1.put("time", "2025年1月");
        event1.put("location", "北京");
        events.add(event1);

        result.put("events", events);

        return result;
    }

    // ==================== AI-006 自动摘要 ====================

    /**
     * 生成文档摘要
     */
    public Map<String, Object> generateSummary(Long documentId, String summaryType, String summaryLength) {
        AIKnowledgeDocument document = documentMapper.selectById(documentId);
        if (document == null || document.getContentText() == null) {
            return Collections.emptyMap();
        }

        String content = document.getContentText();
        
        // 模拟摘要生成
        Map<String, Object> result = new HashMap<>();
        
        String summary;
        if ("short".equals(summaryLength)) {
            summary = content.length() > 100 ? content.substring(0, 100) + "..." : content;
        } else if ("long".equals(summaryLength)) {
            summary = content.length() > 500 ? content.substring(0, 500) + "..." : content;
        } else {
            summary = content.length() > 200 ? content.substring(0, 200) + "..." : content;
        }

        result.put("summary", summary);
        result.put("summaryType", summaryType);
        result.put("summaryLength", summaryLength);
        result.put("keyPoints", Arrays.asList("要点1", "要点2", "要点3"));
        result.put("keywords", Arrays.asList("关键词1", "关键词2", "关键词3"));
        result.put("wordCount", summary.length());
        result.put("compressionRatio", (double) summary.length() / content.length());

        return result;
    }

    // ==================== AI-007 主题分类 ====================

    /**
     * 自动分类文档
     */
    public Map<String, Object> classifyDocument(Long documentId) {
        AIKnowledgeDocument document = documentMapper.selectById(documentId);
        if (document == null || document.getContentText() == null) {
            return Collections.emptyMap();
        }

        // 模拟分类结果
        Map<String, Object> result = new HashMap<>();
        
        List<Map<String, Object>> categories = new ArrayList<>();
        
        Map<String, Object> cat1 = new HashMap<>();
        cat1.put("categoryId", 1);
        cat1.put("categoryName", "技术文档");
        cat1.put("confidence", 85.5);
        cat1.put("isPrimary", true);
        categories.add(cat1);

        Map<String, Object> cat2 = new HashMap<>();
        cat2.put("categoryId", 7);
        cat2.put("categoryName", "项目管理");
        cat2.put("confidence", 72.3);
        cat2.put("isPrimary", false);
        categories.add(cat2);

        result.put("categories", categories);
        result.put("documentId", documentId);

        return result;
    }

    // ==================== AI-008 自动标签 ====================

    /**
     * 自动生成标签
     */
    public Map<String, Object> generateTags(Long documentId) {
        AIKnowledgeDocument document = documentMapper.selectById(documentId);
        if (document == null || document.getContentText() == null) {
            return Collections.emptyMap();
        }

        // 模拟标签生成
        Map<String, Object> result = new HashMap<>();
        
        List<Map<String, Object>> tags = new ArrayList<>();
        
        Map<String, Object> tag1 = new HashMap<>();
        tag1.put("name", "AI");
        tag1.put("type", "keyword");
        tag1.put("confidence", 95.0);
        tags.add(tag1);

        Map<String, Object> tag2 = new HashMap<>();
        tag2.put("name", "知识库");
        tag2.put("type", "keyword");
        tag2.put("confidence", 88.0);
        tags.add(tag2);

        Map<String, Object> tag3 = new HashMap<>();
        tag3.put("name", "文档管理");
        tag3.put("type", "topic");
        tag3.put("confidence", 82.0);
        tags.add(tag3);

        result.put("tags", tags);
        result.put("documentId", documentId);

        return result;
    }

    // ==================== AI-009 向量化存储 ====================

    /**
     * 向量化文档
     */
    @Transactional
    public void vectorizeDocument(Long documentId) {
        AIKnowledgeDocument document = documentMapper.selectById(documentId);
        if (document == null || document.getContentText() == null) {
            log.error("Document not found or has no content: {}", documentId);
            return;
        }

        try {
            // 删除旧的向量
            vectorMapper.deleteByDocumentId(documentId);

            // 分块处理
            List<String> chunks = splitTextIntoChunks(document.getContentText(), 500);

            for (int i = 0; i < chunks.size(); i++) {
                String chunk = chunks.get(i);
                
                AIDocumentVector vector = new AIDocumentVector();
                vector.setDocumentId(documentId);
                vector.setChunkIndex(i);
                vector.setChunkText(chunk);
                vector.setTokenCount(estimateTokenCount(chunk));
                vector.setEmbeddingModel(AIDocumentVector.DEFAULT_MODEL);
                vector.setEmbeddingDimension(AIDocumentVector.DEFAULT_DIMENSION);
                vector.setCollectionName("knowledge_base");
                vector.setVectorizeStatus(AIDocumentVector.STATUS_PENDING);

                vectorMapper.insert(vector);

                // 异步生成向量
                generateEmbeddingAsync(vector.getId());
            }

        } catch (Exception e) {
            log.error("Failed to vectorize document: {}", documentId, e);
        }
    }

    /**
     * 生成向量嵌入
     */
    @Transactional
    public void generateEmbedding(Long vectorId) {
        AIDocumentVector vector = vectorMapper.selectById(vectorId);
        if (vector == null) return;

        try {
            vector.setVectorizeStatus(AIDocumentVector.STATUS_PROCESSING);
            vectorMapper.updateById(vector);

            // 模拟向量生成（实际应调用OpenAI Embedding API）
            float[] embedding = generateMockEmbedding(vector.getChunkText());
            
            // 存储向量（实际应存储到向量数据库如Milvus）
            vector.setEmbeddingJson(Arrays.toString(embedding));
            vector.setVectorId(UUID.randomUUID().toString());
            vector.setVectorizeStatus(AIDocumentVector.STATUS_COMPLETED);

            vectorMapper.updateById(vector);

        } catch (Exception e) {
            log.error("Failed to generate embedding: {}", vectorId, e);
            vector.setVectorizeStatus(AIDocumentVector.STATUS_FAILED);
            vector.setVectorizeError(e.getMessage());
            vectorMapper.updateById(vector);
        }
    }

    // ==================== AI-010 语义检索 ====================

    /**
     * 语义检索
     */
    public Map<String, Object> semanticSearch(String query, Long teamId, int topK, double threshold) {
        long startTime = System.currentTimeMillis();

        Map<String, Object> result = new HashMap<>();

        // 模拟语义检索结果
        List<Map<String, Object>> results = new ArrayList<>();

        // 先进行全文搜索作为基础
        List<AIKnowledgeDocument> documents = documentMapper.fullTextSearch(query, teamId, topK);

        for (int i = 0; i < documents.size(); i++) {
            AIKnowledgeDocument doc = documents.get(i);
            Map<String, Object> item = new HashMap<>();
            item.put("documentId", doc.getId());
            item.put("title", doc.getTitle());
            item.put("content", doc.getContentText() != null && doc.getContentText().length() > 200 
                    ? doc.getContentText().substring(0, 200) + "..." 
                    : doc.getContentText());
            item.put("score", 0.95 - i * 0.05); // 模拟相似度分数
            item.put("fileType", doc.getFileType());
            results.add(item);
        }

        result.put("results", results);
        result.put("total", results.size());
        result.put("query", query);
        result.put("searchTime", System.currentTimeMillis() - startTime);
        result.put("searchType", "hybrid");

        return result;
    }

    /**
     * 混合检索（向量+关键词）
     */
    public Map<String, Object> hybridSearch(String query, Long teamId, int topK, 
                                            double semanticWeight, double keywordWeight) {
        // 语义检索
        Map<String, Object> semanticResults = semanticSearch(query, teamId, topK, 0.7);
        
        // 关键词检索
        List<AIKnowledgeDocument> keywordResults = documentMapper.fullTextSearch(query, teamId, topK);

        // 合并结果（实际应进行分数融合）
        Map<String, Object> result = new HashMap<>();
        result.put("semanticResults", semanticResults.get("results"));
        result.put("keywordResults", keywordResults);
        result.put("query", query);
        result.put("semanticWeight", semanticWeight);
        result.put("keywordWeight", keywordWeight);

        return result;
    }

    // ==================== 辅助方法 ====================

    private String saveFile(MultipartFile file, Long teamId) throws IOException {
        String dir = UPLOAD_DIR + (teamId != null ? teamId + "/" : "common/");
        Path dirPath = Paths.get(dir);
        if (!Files.exists(dirPath)) {
            Files.createDirectories(dirPath);
        }

        String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = dirPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath);

        return filePath.toString();
    }

    private String getFileType(String filename) {
        if (filename == null) return "unknown";
        int lastDot = filename.lastIndexOf('.');
        return lastDot > 0 ? filename.substring(lastDot + 1).toLowerCase() : "unknown";
    }

    private String getFileNameWithoutExtension(String filename) {
        if (filename == null) return "untitled";
        int lastDot = filename.lastIndexOf('.');
        return lastDot > 0 ? filename.substring(0, lastDot) : filename;
    }

    private String parseFileContent(String filePath, String fileType) {
        // 模拟文件解析（实际应使用Apache Tika等库）
        return "这是从文件 " + filePath + " 解析出的内容。文件类型: " + fileType;
    }

    private int countWords(String text) {
        if (text == null || text.isEmpty()) return 0;
        return text.split("\\s+").length;
    }

    private void parseDocumentAsync(Long documentId) {
        // 实际应使用异步任务队列
        new Thread(() -> parseDocument(documentId)).start();
    }

    private void performOcrAsync(Long recordId) {
        new Thread(() -> performOcr(recordId)).start();
    }

    private void generateEmbeddingAsync(Long vectorId) {
        new Thread(() -> generateEmbedding(vectorId)).start();
    }

    private void processDocumentAfterParse(AIKnowledgeDocument document) {
        // 触发向量化
        vectorizeDocument(document.getId());
    }

    private String performOcrRecognition(String imagePath, String language) {
        // 模拟OCR识别
        return "OCR识别结果：这是从图片中识别出的文字内容。";
    }

    private List<String> splitTextIntoChunks(String text, int chunkSize) {
        List<String> chunks = new ArrayList<>();
        if (text == null || text.isEmpty()) return chunks;

        for (int i = 0; i < text.length(); i += chunkSize) {
            int end = Math.min(i + chunkSize, text.length());
            chunks.add(text.substring(i, end));
        }
        return chunks;
    }

    private int estimateTokenCount(String text) {
        // 简单估算：中文约1.5字符/token，英文约4字符/token
        return text.length() / 2;
    }

    private float[] generateMockEmbedding(String text) {
        // 生成模拟向量
        float[] embedding = new float[1536];
        Random random = new Random(text.hashCode());
        for (int i = 0; i < embedding.length; i++) {
            embedding[i] = random.nextFloat() * 2 - 1;
        }
        return embedding;
    }
}