package com.mota.search.service;

import com.mota.search.dto.IndexRequest;
import com.mota.search.dto.SearchRequest;
import com.mota.search.dto.SearchResponse;

import java.util.List;

/**
 * 搜索服务接口
 * 
 * @author mota
 */
public interface SearchService {

    /**
     * 执行搜索
     *
     * @param tenantId 租户ID
     * @param userId 用户ID
     * @param request 搜索请求
     * @return 搜索响应
     */
    SearchResponse search(Long tenantId, Long userId, SearchRequest request);

    /**
     * 全文搜索
     *
     * @param tenantId 租户ID
     * @param keyword 关键词
     * @param types 文档类型
     * @param page 页码
     * @param size 每页大小
     * @return 搜索响应
     */
    SearchResponse fulltextSearch(Long tenantId, String keyword, List<String> types, int page, int size);

    /**
     * 语义搜索
     *
     * @param tenantId 租户ID
     * @param query 查询文本
     * @param types 文档类型
     * @param topK 返回数量
     * @return 搜索响应
     */
    SearchResponse semanticSearch(Long tenantId, String query, List<String> types, int topK);

    /**
     * 向量搜索
     *
     * @param tenantId 租户ID
     * @param vector 查询向量
     * @param types 文档类型
     * @param topK 返回数量
     * @param minScore 最小相似度
     * @return 搜索响应
     */
    SearchResponse vectorSearch(Long tenantId, List<Float> vector, List<String> types, int topK, float minScore);

    /**
     * 混合搜索（全文+向量）
     *
     * @param tenantId 租户ID
     * @param keyword 关键词
     * @param types 文档类型
     * @param page 页码
     * @param size 每页大小
     * @return 搜索响应
     */
    SearchResponse hybridSearch(Long tenantId, String keyword, List<String> types, int page, int size);

    /**
     * 索引文档
     *
     * @param tenantId 租户ID
     * @param request 索引请求
     * @return 文档ID
     */
    String indexDocument(Long tenantId, IndexRequest request);

    /**
     * 批量索引文档
     *
     * @param tenantId 租户ID
     * @param requests 索引请求列表
     * @return 成功索引的文档数量
     */
    int bulkIndexDocuments(Long tenantId, List<IndexRequest> requests);

    /**
     * 更新文档
     *
     * @param tenantId 租户ID
     * @param request 索引请求
     * @return 是否成功
     */
    boolean updateDocument(Long tenantId, IndexRequest request);

    /**
     * 删除文档
     *
     * @param tenantId 租户ID
     * @param type 文档类型
     * @param businessId 业务ID
     * @return 是否成功
     */
    boolean deleteDocument(Long tenantId, String type, Long businessId);

    /**
     * 批量删除文档
     *
     * @param tenantId 租户ID
     * @param type 文档类型
     * @param businessIds 业务ID列表
     * @return 成功删除的文档数量
     */
    int bulkDeleteDocuments(Long tenantId, String type, List<Long> businessIds);

    /**
     * 重建索引
     *
     * @param tenantId 租户ID
     * @param type 文档类型（null表示全部）
     */
    void rebuildIndex(Long tenantId, String type);

    /**
     * 记录搜索点击
     *
     * @param tenantId 租户ID
     * @param userId 用户ID
     * @param historyId 搜索历史ID
     * @param documentId 点击的文档ID
     * @param position 点击位置
     */
    void recordClick(Long tenantId, Long userId, Long historyId, String documentId, int position);
}