package com.mota.project.service;

import com.mota.project.entity.KnowledgeEdge;
import com.mota.project.entity.KnowledgeNode;

import java.util.List;
import java.util.Map;

/**
 * 知识图谱服务接口
 */
public interface KnowledgeGraphService {

    // ========== 节点管理 ==========

    /**
     * 创建节点
     */
    KnowledgeNode createNode(KnowledgeNode node);

    /**
     * 更新节点
     */
    KnowledgeNode updateNode(Long id, KnowledgeNode node);

    /**
     * 删除节点
     */
    boolean deleteNode(Long id);

    /**
     * 获取节点详情
     */
    KnowledgeNode getNodeById(Long id);

    /**
     * 获取节点及其关系
     */
    KnowledgeNode getNodeWithRelations(Long id, int depth);

    /**
     * 按类型获取节点列表
     */
    List<KnowledgeNode> getNodesByType(String nodeType, int page, int pageSize);

    /**
     * 搜索节点
     */
    List<KnowledgeNode> searchNodes(String keyword, String nodeType, int page, int pageSize);

    /**
     * 语义搜索节点（基于向量相似度）
     */
    List<KnowledgeNode> semanticSearchNodes(String query, int topK);

    // ========== 关系管理 ==========

    /**
     * 创建关系
     */
    KnowledgeEdge createEdge(KnowledgeEdge edge);

    /**
     * 删除关系
     */
    boolean deleteEdge(Long id);

    /**
     * 获取节点的出边
     */
    List<KnowledgeEdge> getOutEdges(Long nodeId);

    /**
     * 获取节点的入边
     */
    List<KnowledgeEdge> getInEdges(Long nodeId);

    /**
     * 获取两个节点之间的关系
     */
    List<KnowledgeEdge> getEdgesBetween(Long sourceNodeId, Long targetNodeId);

    /**
     * 按关系类型获取边
     */
    List<KnowledgeEdge> getEdgesByType(String relationType, int page, int pageSize);

    // ========== 图谱构建 ==========

    /**
     * 从文档提取知识并构建图谱
     */
    List<KnowledgeNode> extractKnowledgeFromDocument(Long documentId);

    /**
     * 从任务提取知识并构建图谱
     */
    KnowledgeNode extractKnowledgeFromTask(Long taskId);

    /**
     * 从项目提取知识并构建图谱
     */
    KnowledgeNode extractKnowledgeFromProject(Long projectId);

    /**
     * 自动发现节点之间的关系
     */
    List<KnowledgeEdge> discoverRelations(Long nodeId);

    /**
     * 合并相似节点
     */
    KnowledgeNode mergeNodes(List<Long> nodeIds, String mergedName);

    // ========== 图谱查询 ==========

    /**
     * 获取节点的邻居节点
     */
    List<KnowledgeNode> getNeighbors(Long nodeId, int depth);

    /**
     * 查找两个节点之间的路径
     */
    List<List<KnowledgeNode>> findPaths(Long sourceNodeId, Long targetNodeId, int maxDepth);

    /**
     * 获取相关节点推荐
     */
    List<KnowledgeNode> getRelatedNodes(Long nodeId, int limit);

    /**
     * 获取热门节点
     */
    List<KnowledgeNode> getPopularNodes(int limit);

    // ========== 图谱可视化 ==========

    /**
     * 获取图谱可视化数据
     */
    Map<String, Object> getGraphVisualizationData(Long centerNodeId, int depth);

    /**
     * 获取项目知识图谱
     */
    Map<String, Object> getProjectKnowledgeGraph(Long projectId);

    /**
     * 获取全局知识图谱概览
     */
    Map<String, Object> getGlobalGraphOverview();

    // ========== 向量嵌入 ==========

    /**
     * 更新节点的向量嵌入
     */
    void updateNodeEmbedding(Long nodeId);

    /**
     * 批量更新向量嵌入
     */
    void batchUpdateEmbeddings(List<Long> nodeIds);

    // ========== 统计分析 ==========

    /**
     * 获取图谱统计信息
     */
    Map<String, Object> getGraphStats();

    /**
     * 获取节点类型分布
     */
    Map<String, Long> getNodeTypeDistribution();

    /**
     * 获取关系类型分布
     */
    Map<String, Long> getEdgeTypeDistribution();

    // ========== 聚类与子图 ==========

    /**
     * 获取聚类可视化数据
     */
    Map<String, Object> getClusteredVisualizationData(Map<String, Object> config);

    /**
     * 获取交互式图谱数据
     */
    Map<String, Object> getInteractiveGraphData(Long centerNodeId, Integer depth,
            List<String> nodeTypes, List<String> relationTypes, Double minWeight);

    /**
     * 执行节点聚类
     */
    List<Map<String, Object>> clusterNodes(Map<String, Object> config);

    /**
     * 获取聚类详情
     */
    Map<String, Object> getClusterDetails(Long clusterId);

    /**
     * 更新聚类布局
     */
    Map<String, Object> updateClusterLayout(Long clusterId, String layout);

    /**
     * 筛选子图
     */
    Map<String, Object> filterSubgraph(Map<String, Object> filter);

    /**
     * 保存子图为视图
     */
    Map<String, Object> saveSubgraphAsView(Map<String, Object> filter, String viewName);

    /**
     * 获取保存的视图列表
     */
    List<Map<String, Object>> getSavedViews();

    /**
     * 导出子图
     */
    byte[] exportSubgraph(Map<String, Object> filter, String format);

    // ========== 路径查询 ==========

    /**
     * 查找最短路径
     */
    Map<String, Object> findShortestPath(Long sourceNodeId, Long targetNodeId,
            Integer maxDepth, List<String> relationTypes);

    /**
     * 查找所有路径
     */
    List<Map<String, Object>> findAllPaths(Long sourceNodeId, Long targetNodeId,
            Integer maxDepth, Integer maxPaths);

    /**
     * 按关系类型查找路径
     */
    List<Map<String, Object>> findPathsByRelationType(Long sourceNodeId,
            String relationType, Integer maxDepth);

    // ========== 知识导航 ==========

    /**
     * 获取导航建议
     */
    List<Map<String, Object>> getNavigationSuggestions(Long nodeId, Integer limit);

    /**
     * 获取导航历史
     */
    List<Map<String, Object>> getNavigationHistory(Integer limit);

    /**
     * 记录导航
     */
    void recordNavigation(Long nodeId);

    /**
     * 获取相关知识
     */
    List<Map<String, Object>> getRelatedKnowledge(Long nodeId, List<String> types,
            Integer limit, Double minRelevance);

    // ========== 关联推荐 ==========

    /**
     * 获取推荐
     */
    Map<String, Object> getRecommendations(Long nodeId, List<String> types);

    /**
     * 获取文档推荐
     */
    List<Map<String, Object>> getDocumentRecommendations(Long nodeId, Integer limit);

    /**
     * 获取项目推荐
     */
    List<Map<String, Object>> getProjectRecommendations(Long nodeId, Integer limit);

    /**
     * 获取人员推荐
     */
    List<Map<String, Object>> getPersonRecommendations(Long nodeId, Integer limit);

    /**
     * 获取相似节点
     */
    List<Map<String, Object>> getSimilarNodes(Long nodeId, Integer limit);

    // ========== 实体识别与关系抽取 ==========

    /**
     * 从文档提取实体
     */
    Map<String, Object> extractEntitiesFromDocument(Long documentId);

    /**
     * 从文本提取实体
     */
    List<Map<String, Object>> extractEntitiesFromText(String text);

    /**
     * 从文档提取关系
     */
    Map<String, Object> extractRelationsFromDocument(Long documentId);

    /**
     * 从实体提取关系
     */
    List<Map<String, Object>> extractRelationsFromEntities(List<Map<String, Object>> entities);

    /**
     * 提取实体属性
     */
    Map<String, Object> extractAttributesFromEntity(Long entityId);

    /**
     * 批量提取属性
     */
    List<Map<String, Object>> batchExtractAttributes(List<Long> entityIds);

    // ========== 知识融合 ==========

    /**
     * 查找重复实体
     */
    List<Map<String, Object>> findDuplicates(Double threshold);

    /**
     * 合并实体
     */
    Map<String, Object> mergeEntities(Long entity1Id, Long entity2Id,
            String mergedName, Map<String, String> conflictResolution);

    /**
     * 自动合并重复实体
     */
    List<Map<String, Object>> autoMergeDuplicates(Double threshold);
}