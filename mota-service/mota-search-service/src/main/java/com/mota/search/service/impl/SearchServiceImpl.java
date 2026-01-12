package com.mota.search.service.impl;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.query_dsl.*;
import co.elastic.clients.elasticsearch.core.*;
import co.elastic.clients.elasticsearch.core.bulk.BulkOperation;
import co.elastic.clients.elasticsearch.core.search.Hit;
import co.elastic.clients.elasticsearch.core.search.HighlightField;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mota.search.dto.IndexRequest;
import com.mota.search.dto.SearchRequest;
import com.mota.search.dto.SearchResponse;
import com.mota.search.entity.SearchDocument;
import com.mota.search.entity.SearchHistory;
import com.mota.search.mapper.SearchHistoryMapper;
import com.mota.search.service.SearchService;
import com.mota.search.service.SearchSuggestionService;
import io.milvus.client.MilvusServiceClient;
import io.milvus.grpc.SearchResults;
import io.milvus.param.R;
import io.milvus.param.dml.SearchParam;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 搜索服务实现类
 * 
 * @author mota
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    private final ElasticsearchClient elasticsearchClient;
    private final MilvusServiceClient milvusClient;
    private final SearchHistoryMapper searchHistoryMapper;
    private final SearchSuggestionService suggestionService;
    private final ObjectMapper objectMapper;

    @Value("${elasticsearch.index-prefix:mota}")
    private String indexPrefix;

    @Value("${milvus.collection:mota_vectors}")
    private String milvusCollection;

    private static final int MAX_CONTENT_LENGTH = 500;

    @Override
    public SearchResponse search(Long tenantId, Long userId, SearchRequest request) {
        long startTime = System.currentTimeMillis();
        
        SearchResponse response;
        String mode = request.getMode() != null ? request.getMode() : "fulltext";
        
        switch (mode) {
            case "semantic":
                response = semanticSearch(tenantId, request.getKeyword(), request.getTypes(), 
                        request.getSize() != null ? request.getSize() : 20);
                break;
            case "vector":
                response = vectorSearch(tenantId, request.getQueryVector(), request.getTypes(),
                        request.getSize() != null ? request.getSize() : 20,
                        request.getMinScore() != null ? request.getMinScore() : 0.7f);
                break;
            case "hybrid":
                response = hybridSearch(tenantId, request.getKeyword(), request.getTypes(),
                        request.getPage() != null ? request.getPage() : 1,
                        request.getSize() != null ? request.getSize() : 20);
                break;
            default:
                response = fulltextSearch(tenantId, request.getKeyword(), request.getTypes(),
                        request.getPage() != null ? request.getPage() : 1,
                        request.getSize() != null ? request.getSize() : 20);
        }
        
        response.setTook(System.currentTimeMillis() - startTime);
        
        // 记录搜索历史
        if (Boolean.TRUE.equals(request.getRecordHistory()) && userId != null) {
            recordSearchHistory(tenantId, userId, request, response);
        }
        
        // 更新热词统计
        if (request.getKeyword() != null && !request.getKeyword().isEmpty()) {
            suggestionService.updateHotwordStats(tenantId, request.getKeyword());
        }
        
        return response;
    }

    @Override
    public SearchResponse fulltextSearch(Long tenantId, String keyword, List<String> types, int page, int size) {
        try {
            String indexName = getIndexName(tenantId);
            
            // 构建查询
            BoolQuery.Builder boolQuery = new BoolQuery.Builder();
            
            // 租户过滤
            boolQuery.filter(TermQuery.of(t -> t.field("tenantId").value(tenantId))._toQuery());
            
            // 类型过滤
            if (types != null && !types.isEmpty()) {
                boolQuery.filter(TermsQuery.of(t -> t
                        .field("type")
                        .terms(ts -> ts.value(types.stream()
                                .map(type -> co.elastic.clients.elasticsearch._types.FieldValue.of(type))
                                .collect(Collectors.toList()))))._toQuery());
            }
            
            // 关键词搜索
            if (keyword != null && !keyword.isEmpty()) {
                boolQuery.must(MultiMatchQuery.of(m -> m
                        .query(keyword)
                        .fields("title^3", "content", "tags^2", "summary^2")
                        .type(TextQueryType.BestFields)
                        .fuzziness("AUTO"))._toQuery());
            }
            
            // 执行搜索
            co.elastic.clients.elasticsearch.core.SearchResponse<SearchDocument> esResponse = 
                    elasticsearchClient.search(s -> s
                            .index(indexName)
                            .query(boolQuery.build()._toQuery())
                            .from((page - 1) * size)
                            .size(size)
                            .highlight(h -> h
                                    .fields("title", HighlightField.of(hf -> hf.preTags("<em>").postTags("</em>")))
                                    .fields("content", HighlightField.of(hf -> hf.preTags("<em>").postTags("</em>").fragmentSize(200))))
                            .sort(so -> so.score(sc -> sc.order(SortOrder.Desc))),
                    SearchDocument.class);
            
            return buildSearchResponse(esResponse, page, size);
            
        } catch (Exception e) {
            log.error("全文搜索失败: tenantId={}, keyword={}", tenantId, keyword, e);
            return buildEmptyResponse(page, size);
        }
    }

    @Override
    public SearchResponse semanticSearch(Long tenantId, String query, List<String> types, int topK) {
        try {
            // 首先生成查询向量（这里需要调用AI服务生成embedding）
            List<Float> queryVector = generateEmbedding(query);
            
            return vectorSearch(tenantId, queryVector, types, topK, 0.7f);
            
        } catch (Exception e) {
            log.error("语义搜索失败: tenantId={}, query={}", tenantId, query, e);
            return buildEmptyResponse(1, topK);
        }
    }

    @Override
    public SearchResponse vectorSearch(Long tenantId, List<Float> vector, List<String> types, int topK, float minScore) {
        try {
            // 构建Milvus搜索参数
            String filter = String.format("tenant_id == %d", tenantId);
            if (types != null && !types.isEmpty()) {
                String typeFilter = types.stream()
                        .map(t -> String.format("type == \"%s\"", t))
                        .collect(Collectors.joining(" || "));
                filter = String.format("(%s) && (%s)", filter, typeFilter);
            }
            
            SearchParam searchParam = SearchParam.newBuilder()
                    .withCollectionName(milvusCollection)
                    .withMetricType(io.milvus.param.MetricType.COSINE)
                    .withOutFields(Arrays.asList("doc_id", "type", "title"))
                    .withTopK(topK)
                    .withVectors(Collections.singletonList(vector))
                    .withExpr(filter)
                    .build();
            
            R<SearchResults> response = milvusClient.search(searchParam);
            
            if (response.getStatus() != R.Status.Success.getCode()) {
                log.error("Milvus搜索失败: {}", response.getMessage());
                return buildEmptyResponse(1, topK);
            }
            
            // 解析Milvus结果并从ES获取完整文档
            return buildVectorSearchResponse(tenantId, response.getData(), minScore);
            
        } catch (Exception e) {
            log.error("向量搜索失败: tenantId={}", tenantId, e);
            return buildEmptyResponse(1, topK);
        }
    }

    @Override
    public SearchResponse hybridSearch(Long tenantId, String keyword, List<String> types, int page, int size) {
        try {
            // 执行全文搜索
            SearchResponse fulltextResult = fulltextSearch(tenantId, keyword, types, page, size * 2);
            
            // 执行语义搜索
            SearchResponse semanticResult = semanticSearch(tenantId, keyword, types, size * 2);
            
            // 合并结果（使用RRF算法）
            return mergeSearchResults(fulltextResult, semanticResult, page, size);
            
        } catch (Exception e) {
            log.error("混合搜索失败: tenantId={}, keyword={}", tenantId, keyword, e);
            return buildEmptyResponse(page, size);
        }
    }

    @Override
    public String indexDocument(Long tenantId, IndexRequest request) {
        try {
            String docId = generateDocId(request.getType(), request.getBusinessId());
            String indexName = getIndexName(tenantId);
            
            // 构建搜索文档
            SearchDocument document = new SearchDocument();
            document.setId(docId);
            document.setTenantId(tenantId);
            document.setType(request.getType());
            document.setBusinessId(request.getBusinessId());
            document.setTitle(request.getTitle());
            document.setContent(request.getContent());
            document.setSummary(request.getSummary());
            document.setTags(request.getTags());
            document.setCreatorId(request.getCreatorId());
            document.setCreatorName(request.getCreatorName());
            document.setCreateTime(request.getCreateTime());
            document.setUpdateTime(request.getUpdateTime());
            document.setMetadata(request.getMetadata());
            
            // 生成向量嵌入
            if (Boolean.TRUE.equals(request.getGenerateEmbedding())) {
                String textForEmbedding = request.getTitle() + " " + 
                        (request.getSummary() != null ? request.getSummary() : "") + " " +
                        (request.getContent() != null ? request.getContent().substring(0, 
                                Math.min(request.getContent().length(), MAX_CONTENT_LENGTH)) : "");
                List<Float> embedding = generateEmbedding(textForEmbedding);
                document.setEmbedding(embedding);
                
                // 同时索引到Milvus
                indexToMilvus(tenantId, docId, request.getType(), request.getTitle(), embedding);
            } else if (request.getEmbedding() != null) {
                document.setEmbedding(request.getEmbedding());
                indexToMilvus(tenantId, docId, request.getType(), request.getTitle(), request.getEmbedding());
            }
            
            // 索引到Elasticsearch
            IndexResponse response = elasticsearchClient.index(i -> i
                    .index(indexName)
                    .id(docId)
                    .document(document));
            
            log.info("文档索引成功: docId={}, result={}", docId, response.result());
            return docId;
            
        } catch (Exception e) {
            log.error("文档索引失败: tenantId={}, type={}, businessId={}", 
                    tenantId, request.getType(), request.getBusinessId(), e);
            throw new RuntimeException("文档索引失败", e);
        }
    }

    @Override
    public int bulkIndexDocuments(Long tenantId, List<IndexRequest> requests) {
        try {
            String indexName = getIndexName(tenantId);
            List<BulkOperation> operations = new ArrayList<>();
            
            for (IndexRequest request : requests) {
                String docId = generateDocId(request.getType(), request.getBusinessId());
                
                SearchDocument document = new SearchDocument();
                document.setId(docId);
                document.setTenantId(tenantId);
                document.setType(request.getType());
                document.setBusinessId(request.getBusinessId());
                document.setTitle(request.getTitle());
                document.setContent(request.getContent());
                document.setSummary(request.getSummary());
                document.setTags(request.getTags());
                document.setCreatorId(request.getCreatorId());
                document.setCreatorName(request.getCreatorName());
                document.setCreateTime(request.getCreateTime());
                document.setUpdateTime(request.getUpdateTime());
                document.setMetadata(request.getMetadata());
                
                operations.add(BulkOperation.of(op -> op
                        .index(idx -> idx
                                .index(indexName)
                                .id(docId)
                                .document(document))));
            }
            
            BulkResponse response = elasticsearchClient.bulk(b -> b.operations(operations));
            
            int successCount = (int) response.items().stream()
                    .filter(item -> item.error() == null)
                    .count();
            
            log.info("批量索引完成: total={}, success={}", requests.size(), successCount);
            return successCount;
            
        } catch (Exception e) {
            log.error("批量索引失败: tenantId={}", tenantId, e);
            throw new RuntimeException("批量索引失败", e);
        }
    }

    @Override
    public boolean updateDocument(Long tenantId, IndexRequest request) {
        try {
            String docId = generateDocId(request.getType(), request.getBusinessId());
            String indexName = getIndexName(tenantId);
            
            Map<String, Object> updates = new HashMap<>();
            if (request.getTitle() != null) updates.put("title", request.getTitle());
            if (request.getContent() != null) updates.put("content", request.getContent());
            if (request.getSummary() != null) updates.put("summary", request.getSummary());
            if (request.getTags() != null) updates.put("tags", request.getTags());
            if (request.getUpdateTime() != null) updates.put("updateTime", request.getUpdateTime());
            if (request.getMetadata() != null) updates.put("metadata", request.getMetadata());
            
            UpdateResponse<SearchDocument> response = elasticsearchClient.update(u -> u
                    .index(indexName)
                    .id(docId)
                    .doc(updates),
                    SearchDocument.class);
            
            log.info("文档更新成功: docId={}, result={}", docId, response.result());
            return true;
            
        } catch (Exception e) {
            log.error("文档更新失败: tenantId={}, type={}, businessId={}", 
                    tenantId, request.getType(), request.getBusinessId(), e);
            return false;
        }
    }

    @Override
    public boolean deleteDocument(Long tenantId, String type, Long businessId) {
        try {
            String docId = generateDocId(type, businessId);
            String indexName = getIndexName(tenantId);
            
            DeleteResponse response = elasticsearchClient.delete(d -> d
                    .index(indexName)
                    .id(docId));
            
            // 同时从Milvus删除
            deleteFromMilvus(docId);
            
            log.info("文档删除成功: docId={}, result={}", docId, response.result());
            return true;
            
        } catch (Exception e) {
            log.error("文档删除失败: tenantId={}, type={}, businessId={}", tenantId, type, businessId, e);
            return false;
        }
    }

    @Override
    public int bulkDeleteDocuments(Long tenantId, String type, List<Long> businessIds) {
        int successCount = 0;
        for (Long businessId : businessIds) {
            if (deleteDocument(tenantId, type, businessId)) {
                successCount++;
            }
        }
        return successCount;
    }

    @Override
    public void rebuildIndex(Long tenantId, String type) {
        log.info("开始重建索引: tenantId={}, type={}", tenantId, type);
        // 重建索引逻辑需要从各个业务服务获取数据
        // 这里通过Kafka发送重建索引请求
    }

    @Override
    public void recordClick(Long tenantId, Long userId, Long historyId, String documentId, int position) {
        try {
            SearchHistory history = searchHistoryMapper.selectById(historyId);
            if (history != null && history.getTenantId().equals(tenantId) && history.getUserId().equals(userId)) {
                history.setClickedDocId(documentId);
                history.setClickPosition(position);
                history.setClickTime(LocalDateTime.now());
                searchHistoryMapper.updateById(history);
            }
        } catch (Exception e) {
            log.error("记录搜索点击失败: historyId={}, documentId={}", historyId, documentId, e);
        }
    }

    // ==================== 私有方法 ====================

    private String getIndexName(Long tenantId) {
        return indexPrefix + "_" + tenantId;
    }

    private String generateDocId(String type, Long businessId) {
        return type + "_" + businessId;
    }

    private List<Float> generateEmbedding(String text) {
        // TODO: 调用AI服务生成embedding
        // 这里返回模拟的向量
        List<Float> embedding = new ArrayList<>();
        for (int i = 0; i < 768; i++) {
            embedding.add((float) Math.random());
        }
        return embedding;
    }

    private void indexToMilvus(Long tenantId, String docId, String type, String title, List<Float> embedding) {
        // TODO: 实现Milvus索引逻辑
        log.debug("索引到Milvus: docId={}", docId);
    }

    private void deleteFromMilvus(String docId) {
        // TODO: 实现Milvus删除逻辑
        log.debug("从Milvus删除: docId={}", docId);
    }

    private SearchResponse buildSearchResponse(
            co.elastic.clients.elasticsearch.core.SearchResponse<SearchDocument> esResponse,
            int page, int size) {
        
        SearchResponse response = new SearchResponse();
        List<SearchResponse.SearchHit> hits = new ArrayList<>();
        
        for (Hit<SearchDocument> hit : esResponse.hits().hits()) {
            SearchDocument doc = hit.source();
            if (doc == null) continue;
            
            SearchResponse.SearchHit searchHit = new SearchResponse.SearchHit();
            searchHit.setId(doc.getId());
            searchHit.setType(doc.getType());
            searchHit.setBusinessId(doc.getBusinessId());
            searchHit.setTitle(doc.getTitle());
            searchHit.setSummary(doc.getSummary());
            searchHit.setScore(hit.score() != null ? hit.score().floatValue() : 0f);
            searchHit.setTags(doc.getTags());
            searchHit.setCreatorId(doc.getCreatorId());
            searchHit.setCreatorName(doc.getCreatorName());
            searchHit.setCreateTime(doc.getCreateTime());
            searchHit.setUpdateTime(doc.getUpdateTime());
            searchHit.setMetadata(doc.getMetadata());
            
            // 处理高亮
            if (hit.highlight() != null) {
                if (hit.highlight().containsKey("title")) {
                    searchHit.setHighlightTitle(String.join("", hit.highlight().get("title")));
                }
                if (hit.highlight().containsKey("content")) {
                    searchHit.setHighlightContent(String.join("...", hit.highlight().get("content")));
                }
            }
            
            hits.add(searchHit);
        }
        
        response.setHits(hits);
        response.setTotal(esResponse.hits().total() != null ? esResponse.hits().total().value() : 0);
        response.setPage(page);
        response.setSize(size);
        response.setTotalPages((int) Math.ceil((double) response.getTotal() / size));
        response.setHasMore(page < response.getTotalPages());
        
        return response;
    }

    private SearchResponse buildVectorSearchResponse(Long tenantId, SearchResults results, float minScore) {
        // TODO: 实现向量搜索结果解析
        return buildEmptyResponse(1, 20);
    }

    private SearchResponse mergeSearchResults(SearchResponse fulltext, SearchResponse semantic, int page, int size) {
        // 使用RRF (Reciprocal Rank Fusion) 算法合并结果
        Map<String, Double> scores = new HashMap<>();
        Map<String, SearchResponse.SearchHit> hitMap = new HashMap<>();
        
        int k = 60; // RRF常数
        
        // 处理全文搜索结果
        int rank = 1;
        for (SearchResponse.SearchHit hit : fulltext.getHits()) {
            scores.merge(hit.getId(), 1.0 / (k + rank), Double::sum);
            hitMap.put(hit.getId(), hit);
            rank++;
        }
        
        // 处理语义搜索结果
        rank = 1;
        for (SearchResponse.SearchHit hit : semantic.getHits()) {
            scores.merge(hit.getId(), 1.0 / (k + rank), Double::sum);
            hitMap.putIfAbsent(hit.getId(), hit);
            rank++;
        }
        
        // 按RRF分数排序
        List<SearchResponse.SearchHit> mergedHits = scores.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .skip((long) (page - 1) * size)
                .limit(size)
                .map(entry -> {
                    SearchResponse.SearchHit hit = hitMap.get(entry.getKey());
                    hit.setScore(entry.getValue().floatValue());
                    return hit;
                })
                .collect(Collectors.toList());
        
        SearchResponse response = new SearchResponse();
        response.setHits(mergedHits);
        response.setTotal((long) scores.size());
        response.setPage(page);
        response.setSize(size);
        response.setTotalPages((int) Math.ceil((double) scores.size() / size));
        response.setHasMore(page < response.getTotalPages());
        
        return response;
    }

    private SearchResponse buildEmptyResponse(int page, int size) {
        SearchResponse response = new SearchResponse();
        response.setHits(new ArrayList<>());
        response.setTotal(0L);
        response.setPage(page);
        response.setSize(size);
        response.setTotalPages(0);
        response.setHasMore(false);
        return response;
    }

    private void recordSearchHistory(Long tenantId, Long userId, SearchRequest request, SearchResponse response) {
        try {
            SearchHistory history = new SearchHistory();
            history.setTenantId(tenantId);
            history.setUserId(userId);
            history.setKeyword(request.getKeyword());
            history.setSearchMode(request.getMode());
            history.setSearchTypes(request.getTypes() != null ? String.join(",", request.getTypes()) : null);
            history.setResultCount(response.getTotal().intValue());
            history.setResponseTime(response.getTook().intValue());
            history.setSearchTime(LocalDateTime.now());
            
            searchHistoryMapper.insert(history);
        } catch (Exception e) {
            log.error("记录搜索历史失败", e);
        }
    }
}