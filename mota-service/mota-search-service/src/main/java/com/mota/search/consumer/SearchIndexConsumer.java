package com.mota.search.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mota.search.dto.IndexRequest;
import com.mota.search.service.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 搜索索引Kafka消费者
 * 监听各业务服务的数据变更事件，同步更新搜索索引
 * 
 * @author mota
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SearchIndexConsumer {

    private final SearchService searchService;
    private final ObjectMapper objectMapper;

    /**
     * 监听项目变更事件
     */
    @KafkaListener(topics = "project-events", groupId = "search-service")
    public void handleProjectEvent(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            String eventType = event.get("type").asText();
            Long tenantId = event.get("tenantId").asLong();
            JsonNode data = event.get("data");
            
            switch (eventType) {
                case "PROJECT_CREATED":
                case "PROJECT_UPDATED":
                    indexProject(tenantId, data);
                    break;
                case "PROJECT_DELETED":
                    Long projectId = data.get("id").asLong();
                    searchService.deleteDocument(tenantId, "project", projectId);
                    break;
                default:
                    log.debug("忽略项目事件类型: {}", eventType);
            }
        } catch (Exception e) {
            log.error("处理项目事件失败: {}", message, e);
        }
    }

    /**
     * 监听任务变更事件
     */
    @KafkaListener(topics = "task-events", groupId = "search-service")
    public void handleTaskEvent(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            String eventType = event.get("type").asText();
            Long tenantId = event.get("tenantId").asLong();
            JsonNode data = event.get("data");
            
            switch (eventType) {
                case "TASK_CREATED":
                case "TASK_UPDATED":
                    indexTask(tenantId, data);
                    break;
                case "TASK_DELETED":
                    Long taskId = data.get("id").asLong();
                    searchService.deleteDocument(tenantId, "task", taskId);
                    break;
                default:
                    log.debug("忽略任务事件类型: {}", eventType);
            }
        } catch (Exception e) {
            log.error("处理任务事件失败: {}", message, e);
        }
    }

    /**
     * 监听文档变更事件
     */
    @KafkaListener(topics = "document-events", groupId = "search-service")
    public void handleDocumentEvent(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            String eventType = event.get("type").asText();
            Long tenantId = event.get("tenantId").asLong();
            JsonNode data = event.get("data");
            
            switch (eventType) {
                case "DOCUMENT_CREATED":
                case "DOCUMENT_UPDATED":
                    indexDocument(tenantId, data);
                    break;
                case "DOCUMENT_DELETED":
                    Long documentId = data.get("id").asLong();
                    searchService.deleteDocument(tenantId, "document", documentId);
                    break;
                default:
                    log.debug("忽略文档事件类型: {}", eventType);
            }
        } catch (Exception e) {
            log.error("处理文档事件失败: {}", message, e);
        }
    }

    /**
     * 监听知识库变更事件
     */
    @KafkaListener(topics = "knowledge-events", groupId = "search-service")
    public void handleKnowledgeEvent(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            String eventType = event.get("type").asText();
            Long tenantId = event.get("tenantId").asLong();
            JsonNode data = event.get("data");
            
            switch (eventType) {
                case "KNOWLEDGE_CREATED":
                case "KNOWLEDGE_UPDATED":
                    indexKnowledge(tenantId, data);
                    break;
                case "KNOWLEDGE_DELETED":
                    Long knowledgeId = data.get("id").asLong();
                    searchService.deleteDocument(tenantId, "knowledge", knowledgeId);
                    break;
                default:
                    log.debug("忽略知识库事件类型: {}", eventType);
            }
        } catch (Exception e) {
            log.error("处理知识库事件失败: {}", message, e);
        }
    }

    /**
     * 监听用户变更事件
     */
    @KafkaListener(topics = "user-events", groupId = "search-service")
    public void handleUserEvent(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            String eventType = event.get("type").asText();
            Long tenantId = event.get("tenantId").asLong();
            JsonNode data = event.get("data");
            
            switch (eventType) {
                case "USER_CREATED":
                case "USER_UPDATED":
                    indexUser(tenantId, data);
                    break;
                case "USER_DELETED":
                    Long userId = data.get("id").asLong();
                    searchService.deleteDocument(tenantId, "user", userId);
                    break;
                default:
                    log.debug("忽略用户事件类型: {}", eventType);
            }
        } catch (Exception e) {
            log.error("处理用户事件失败: {}", message, e);
        }
    }

    /**
     * 监听新闻变更事件
     */
    @KafkaListener(topics = "news-events", groupId = "search-service")
    public void handleNewsEvent(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            String eventType = event.get("type").asText();
            Long tenantId = event.get("tenantId").asLong();
            JsonNode data = event.get("data");
            
            switch (eventType) {
                case "NEWS_CREATED":
                case "NEWS_UPDATED":
                    indexNews(tenantId, data);
                    break;
                case "NEWS_DELETED":
                    Long newsId = data.get("id").asLong();
                    searchService.deleteDocument(tenantId, "news", newsId);
                    break;
                default:
                    log.debug("忽略新闻事件类型: {}", eventType);
            }
        } catch (Exception e) {
            log.error("处理新闻事件失败: {}", message, e);
        }
    }

    /**
     * 监听批量索引请求
     */
    @KafkaListener(topics = "search-bulk-index", groupId = "search-service")
    public void handleBulkIndexRequest(String message) {
        try {
            JsonNode request = objectMapper.readTree(message);
            Long tenantId = request.get("tenantId").asLong();
            String type = request.get("type").asText();
            JsonNode items = request.get("items");
            
            List<IndexRequest> indexRequests = new ArrayList<>();
            for (JsonNode item : items) {
                IndexRequest indexRequest = buildIndexRequest(type, item);
                if (indexRequest != null) {
                    indexRequests.add(indexRequest);
                }
            }
            
            if (!indexRequests.isEmpty()) {
                int count = searchService.bulkIndexDocuments(tenantId, indexRequests);
                log.info("批量索引完成: tenantId={}, type={}, count={}", tenantId, type, count);
            }
            
        } catch (Exception e) {
            log.error("处理批量索引请求失败: {}", message, e);
        }
    }

    /**
     * 监听索引重建请求
     */
    @KafkaListener(topics = "search-rebuild-index", groupId = "search-service")
    public void handleRebuildIndexRequest(String message) {
        try {
            JsonNode request = objectMapper.readTree(message);
            Long tenantId = request.get("tenantId").asLong();
            String type = request.has("type") ? request.get("type").asText() : null;
            
            log.info("开始重建索引: tenantId={}, type={}", tenantId, type);
            searchService.rebuildIndex(tenantId, type);
            
        } catch (Exception e) {
            log.error("处理索引重建请求失败: {}", message, e);
        }
    }

    // ==================== 私有方法 ====================

    private void indexProject(Long tenantId, JsonNode data) {
        IndexRequest request = new IndexRequest();
        request.setType("project");
        request.setBusinessId(data.get("id").asLong());
        request.setTitle(getTextValue(data, "name"));
        request.setContent(getTextValue(data, "description"));
        request.setSummary(getTextValue(data, "description"));
        request.setTags(getTagsList(data, "tags"));
        request.setCreatorId(getLongValue(data, "creatorId"));
        request.setCreatorName(getTextValue(data, "creatorName"));
        request.setCreateTime(getTextValue(data, "createTime"));
        request.setUpdateTime(getTextValue(data, "updateTime"));
        
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("status", getTextValue(data, "status"));
        metadata.put("priority", getTextValue(data, "priority"));
        request.setMetadata(metadata);
        
        searchService.indexDocument(tenantId, request);
    }

    private void indexTask(Long tenantId, JsonNode data) {
        IndexRequest request = new IndexRequest();
        request.setType("task");
        request.setBusinessId(data.get("id").asLong());
        request.setTitle(getTextValue(data, "title"));
        request.setContent(getTextValue(data, "description"));
        request.setSummary(getTextValue(data, "description"));
        request.setTags(getTagsList(data, "tags"));
        request.setCreatorId(getLongValue(data, "creatorId"));
        request.setCreatorName(getTextValue(data, "creatorName"));
        request.setCreateTime(getTextValue(data, "createTime"));
        request.setUpdateTime(getTextValue(data, "updateTime"));
        
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("projectId", getLongValue(data, "projectId"));
        metadata.put("status", getTextValue(data, "status"));
        metadata.put("priority", getTextValue(data, "priority"));
        metadata.put("assigneeId", getLongValue(data, "assigneeId"));
        request.setMetadata(metadata);
        
        searchService.indexDocument(tenantId, request);
    }

    private void indexDocument(Long tenantId, JsonNode data) {
        IndexRequest request = new IndexRequest();
        request.setType("document");
        request.setBusinessId(data.get("id").asLong());
        request.setTitle(getTextValue(data, "title"));
        request.setContent(getTextValue(data, "content"));
        request.setSummary(getTextValue(data, "summary"));
        request.setTags(getTagsList(data, "tags"));
        request.setCreatorId(getLongValue(data, "creatorId"));
        request.setCreatorName(getTextValue(data, "creatorName"));
        request.setCreateTime(getTextValue(data, "createTime"));
        request.setUpdateTime(getTextValue(data, "updateTime"));
        
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("folderId", getLongValue(data, "folderId"));
        metadata.put("version", getTextValue(data, "version"));
        request.setMetadata(metadata);
        
        searchService.indexDocument(tenantId, request);
    }

    private void indexKnowledge(Long tenantId, JsonNode data) {
        IndexRequest request = new IndexRequest();
        request.setType("knowledge");
        request.setBusinessId(data.get("id").asLong());
        request.setTitle(getTextValue(data, "title"));
        request.setContent(getTextValue(data, "content"));
        request.setSummary(getTextValue(data, "summary"));
        request.setTags(getTagsList(data, "tags"));
        request.setCreatorId(getLongValue(data, "creatorId"));
        request.setCreatorName(getTextValue(data, "creatorName"));
        request.setCreateTime(getTextValue(data, "createTime"));
        request.setUpdateTime(getTextValue(data, "updateTime"));
        
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("categoryId", getLongValue(data, "categoryId"));
        metadata.put("viewCount", getLongValue(data, "viewCount"));
        request.setMetadata(metadata);
        
        searchService.indexDocument(tenantId, request);
    }

    private void indexUser(Long tenantId, JsonNode data) {
        IndexRequest request = new IndexRequest();
        request.setType("user");
        request.setBusinessId(data.get("id").asLong());
        request.setTitle(getTextValue(data, "nickname"));
        request.setContent(getTextValue(data, "bio"));
        request.setSummary(getTextValue(data, "email"));
        request.setCreatorId(getLongValue(data, "id"));
        request.setCreatorName(getTextValue(data, "nickname"));
        request.setCreateTime(getTextValue(data, "createTime"));
        request.setUpdateTime(getTextValue(data, "updateTime"));
        
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("department", getTextValue(data, "department"));
        metadata.put("position", getTextValue(data, "position"));
        request.setMetadata(metadata);
        
        // 用户信息不需要生成向量嵌入
        request.setGenerateEmbedding(false);
        
        searchService.indexDocument(tenantId, request);
    }

    private void indexNews(Long tenantId, JsonNode data) {
        IndexRequest request = new IndexRequest();
        request.setType("news");
        request.setBusinessId(data.get("id").asLong());
        request.setTitle(getTextValue(data, "title"));
        request.setContent(getTextValue(data, "content"));
        request.setSummary(getTextValue(data, "summary"));
        request.setTags(getTagsList(data, "tags"));
        request.setCreatorId(getLongValue(data, "authorId"));
        request.setCreatorName(getTextValue(data, "authorName"));
        request.setCreateTime(getTextValue(data, "publishTime"));
        request.setUpdateTime(getTextValue(data, "updateTime"));
        
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("category", getTextValue(data, "category"));
        metadata.put("source", getTextValue(data, "source"));
        request.setMetadata(metadata);
        
        searchService.indexDocument(tenantId, request);
    }

    private IndexRequest buildIndexRequest(String type, JsonNode data) {
        switch (type) {
            case "project":
                return buildProjectIndexRequest(data);
            case "task":
                return buildTaskIndexRequest(data);
            case "document":
                return buildDocumentIndexRequest(data);
            case "knowledge":
                return buildKnowledgeIndexRequest(data);
            case "user":
                return buildUserIndexRequest(data);
            case "news":
                return buildNewsIndexRequest(data);
            default:
                log.warn("未知的索引类型: {}", type);
                return null;
        }
    }

    private IndexRequest buildProjectIndexRequest(JsonNode data) {
        IndexRequest request = new IndexRequest();
        request.setType("project");
        request.setBusinessId(data.get("id").asLong());
        request.setTitle(getTextValue(data, "name"));
        request.setContent(getTextValue(data, "description"));
        return request;
    }

    private IndexRequest buildTaskIndexRequest(JsonNode data) {
        IndexRequest request = new IndexRequest();
        request.setType("task");
        request.setBusinessId(data.get("id").asLong());
        request.setTitle(getTextValue(data, "title"));
        request.setContent(getTextValue(data, "description"));
        return request;
    }

    private IndexRequest buildDocumentIndexRequest(JsonNode data) {
        IndexRequest request = new IndexRequest();
        request.setType("document");
        request.setBusinessId(data.get("id").asLong());
        request.setTitle(getTextValue(data, "title"));
        request.setContent(getTextValue(data, "content"));
        return request;
    }

    private IndexRequest buildKnowledgeIndexRequest(JsonNode data) {
        IndexRequest request = new IndexRequest();
        request.setType("knowledge");
        request.setBusinessId(data.get("id").asLong());
        request.setTitle(getTextValue(data, "title"));
        request.setContent(getTextValue(data, "content"));
        return request;
    }

    private IndexRequest buildUserIndexRequest(JsonNode data) {
        IndexRequest request = new IndexRequest();
        request.setType("user");
        request.setBusinessId(data.get("id").asLong());
        request.setTitle(getTextValue(data, "nickname"));
        request.setGenerateEmbedding(false);
        return request;
    }

    private IndexRequest buildNewsIndexRequest(JsonNode data) {
        IndexRequest request = new IndexRequest();
        request.setType("news");
        request.setBusinessId(data.get("id").asLong());
        request.setTitle(getTextValue(data, "title"));
        request.setContent(getTextValue(data, "content"));
        return request;
    }

    private String getTextValue(JsonNode node, String field) {
        return node.has(field) && !node.get(field).isNull() ? node.get(field).asText() : null;
    }

    private Long getLongValue(JsonNode node, String field) {
        return node.has(field) && !node.get(field).isNull() ? node.get(field).asLong() : null;
    }

    private List<String> getTagsList(JsonNode node, String field) {
        List<String> tags = new ArrayList<>();
        if (node.has(field) && node.get(field).isArray()) {
            for (JsonNode tag : node.get(field)) {
                tags.add(tag.asText());
            }
        }
        return tags;
    }
}