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
}