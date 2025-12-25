package com.mota.project.service.impl;

import com.mota.project.entity.KnowledgeEdge;
import com.mota.project.entity.KnowledgeNode;
import com.mota.project.mapper.KnowledgeEdgeMapper;
import com.mota.project.mapper.KnowledgeNodeMapper;
import com.mota.project.service.KnowledgeGraphService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 知识图谱服务实现类
 */
@Service
@RequiredArgsConstructor
public class KnowledgeGraphServiceImpl implements KnowledgeGraphService {

    private final KnowledgeNodeMapper knowledgeNodeMapper;
    private final KnowledgeEdgeMapper knowledgeEdgeMapper;

    // ========== 节点管理 ==========

    @Override
    @Transactional
    public KnowledgeNode createNode(KnowledgeNode node) {
        node.setReferenceCount(0);
        node.setCreatedAt(LocalDateTime.now());
        node.setUpdatedAt(LocalDateTime.now());
        knowledgeNodeMapper.insert(node);
        return node;
    }

    @Override
    @Transactional
    public KnowledgeNode updateNode(Long id, KnowledgeNode node) {
        KnowledgeNode existing = knowledgeNodeMapper.selectById(id);
        if (existing == null) {
            throw new RuntimeException("节点不存在");
        }
        
        node.setId(id);
        node.setUpdatedAt(LocalDateTime.now());
        knowledgeNodeMapper.updateById(node);
        
        return knowledgeNodeMapper.selectById(id);
    }

    @Override
    @Transactional
    public boolean deleteNode(Long id) {
        // 删除相关的边
        knowledgeEdgeMapper.deleteByNodeId(id);
        return knowledgeNodeMapper.deleteById(id) > 0;
    }

    @Override
    public KnowledgeNode getNodeById(Long id) {
        return knowledgeNodeMapper.selectById(id);
    }

    @Override
    public KnowledgeNode getNodeWithRelations(Long id, int depth) {
        KnowledgeNode node = knowledgeNodeMapper.selectById(id);
        if (node == null) {
            return null;
        }
        
        // 获取邻居节点
        List<KnowledgeNode> neighbors = getNeighbors(id, depth);
        // TODO: 将邻居节点信息附加到节点上
        
        return node;
    }

    @Override
    public List<KnowledgeNode> getNodesByType(String nodeType, int page, int pageSize) {
        int offset = (page - 1) * pageSize;
        return knowledgeNodeMapper.selectByNodeType(nodeType, offset, pageSize);
    }

    @Override
    public List<KnowledgeNode> searchNodes(String keyword, String nodeType, int page, int pageSize) {
        int offset = (page - 1) * pageSize;
        return knowledgeNodeMapper.searchNodes(keyword, nodeType, offset, pageSize);
    }

    @Override
    public List<KnowledgeNode> semanticSearchNodes(String query, int topK) {
        // TODO: 实现基于向量相似度的语义搜索
        // 需要集成向量数据库（如Milvus）
        return searchNodes(query, null, 1, topK);
    }

    // ========== 关系管理 ==========

    @Override
    @Transactional
    public KnowledgeEdge createEdge(KnowledgeEdge edge) {
        edge.setCreatedAt(LocalDateTime.now());
        knowledgeEdgeMapper.insert(edge);
        
        // 增加目标节点的引用次数
        knowledgeNodeMapper.incrementReferenceCount(edge.getTargetNodeId());
        
        return edge;
    }

    @Override
    @Transactional
    public boolean deleteEdge(Long id) {
        KnowledgeEdge edge = knowledgeEdgeMapper.selectById(id);
        if (edge != null) {
            knowledgeEdgeMapper.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public List<KnowledgeEdge> getOutEdges(Long nodeId) {
        return knowledgeEdgeMapper.selectOutEdges(nodeId);
    }

    @Override
    public List<KnowledgeEdge> getInEdges(Long nodeId) {
        return knowledgeEdgeMapper.selectInEdges(nodeId);
    }

    @Override
    public List<KnowledgeEdge> getEdgesBetween(Long sourceNodeId, Long targetNodeId) {
        return knowledgeEdgeMapper.selectEdgesBetween(sourceNodeId, targetNodeId);
    }

    @Override
    public List<KnowledgeEdge> getEdgesByType(String relationType, int page, int pageSize) {
        int offset = (page - 1) * pageSize;
        return knowledgeEdgeMapper.selectByRelationType(relationType, offset, pageSize);
    }

    // ========== 图谱构建 ==========

    @Override
    @Transactional
    public List<KnowledgeNode> extractKnowledgeFromDocument(Long documentId) {
        // TODO: 实现从文档提取知识
        // 1. 获取文档内容
        // 2. 使用NLP提取实体和关系
        // 3. 创建节点和边
        
        List<KnowledgeNode> nodes = new ArrayList<>();
        
        // 创建文档节点
        KnowledgeNode docNode = new KnowledgeNode();
        docNode.setName("文档-" + documentId);
        docNode.setNodeType("document");
        docNode.setRelatedId(documentId);
        docNode.setRelatedType("document");
        docNode.setDescription("从文档提取的知识节点");
        
        nodes.add(createNode(docNode));
        
        return nodes;
    }

    @Override
    @Transactional
    public KnowledgeNode extractKnowledgeFromTask(Long taskId) {
        KnowledgeNode taskNode = new KnowledgeNode();
        taskNode.setName("任务-" + taskId);
        taskNode.setNodeType("task");
        taskNode.setRelatedId(taskId);
        taskNode.setRelatedType("task");
        taskNode.setDescription("从任务提取的知识节点");
        
        return createNode(taskNode);
    }

    @Override
    @Transactional
    public KnowledgeNode extractKnowledgeFromProject(Long projectId) {
        KnowledgeNode projectNode = new KnowledgeNode();
        projectNode.setName("项目-" + projectId);
        projectNode.setNodeType("project");
        projectNode.setRelatedId(projectId);
        projectNode.setRelatedType("project");
        projectNode.setDescription("从项目提取的知识节点");
        
        return createNode(projectNode);
    }

    @Override
    @Transactional
    public List<KnowledgeEdge> discoverRelations(Long nodeId) {
        // TODO: 实现自动发现节点之间的关系
        // 可以基于：
        // 1. 文本相似度
        // 2. 共现关系
        // 3. 语义关联
        return List.of();
    }

    @Override
    @Transactional
    public KnowledgeNode mergeNodes(List<Long> nodeIds, String mergedName) {
        if (nodeIds == null || nodeIds.size() < 2) {
            throw new RuntimeException("至少需要两个节点进行合并");
        }
        
        // 创建合并后的新节点
        KnowledgeNode mergedNode = new KnowledgeNode();
        mergedNode.setName(mergedName);
        mergedNode.setNodeType("merged");
        mergedNode.setDescription("合并自节点: " + nodeIds);
        createNode(mergedNode);
        
        // 将原节点的边迁移到新节点
        for (Long nodeId : nodeIds) {
            List<KnowledgeEdge> outEdges = getOutEdges(nodeId);
            for (KnowledgeEdge edge : outEdges) {
                KnowledgeEdge newEdge = new KnowledgeEdge();
                newEdge.setSourceNodeId(mergedNode.getId());
                newEdge.setTargetNodeId(edge.getTargetNodeId());
                newEdge.setRelationType(edge.getRelationType());
                newEdge.setWeight(edge.getWeight());
                createEdge(newEdge);
            }
            
            List<KnowledgeEdge> inEdges = getInEdges(nodeId);
            for (KnowledgeEdge edge : inEdges) {
                KnowledgeEdge newEdge = new KnowledgeEdge();
                newEdge.setSourceNodeId(edge.getSourceNodeId());
                newEdge.setTargetNodeId(mergedNode.getId());
                newEdge.setRelationType(edge.getRelationType());
                newEdge.setWeight(edge.getWeight());
                createEdge(newEdge);
            }
            
            // 删除原节点
            deleteNode(nodeId);
        }
        
        return mergedNode;
    }

    // ========== 图谱查询 ==========

    @Override
    public List<KnowledgeNode> getNeighbors(Long nodeId, int depth) {
        return knowledgeNodeMapper.selectNeighbors(nodeId, depth);
    }

    @Override
    public List<List<KnowledgeNode>> findPaths(Long sourceNodeId, Long targetNodeId, int maxDepth) {
        // TODO: 实现路径查找算法（BFS/DFS）
        List<List<KnowledgeNode>> paths = new ArrayList<>();
        
        // 简单实现：直接连接
        List<KnowledgeEdge> directEdges = getEdgesBetween(sourceNodeId, targetNodeId);
        if (!directEdges.isEmpty()) {
            KnowledgeNode source = getNodeById(sourceNodeId);
            KnowledgeNode target = getNodeById(targetNodeId);
            paths.add(Arrays.asList(source, target));
        }
        
        return paths;
    }

    @Override
    public List<KnowledgeNode> getRelatedNodes(Long nodeId, int limit) {
        // 获取直接相连的节点
        List<KnowledgeNode> related = new ArrayList<>();
        
        List<KnowledgeEdge> outEdges = getOutEdges(nodeId);
        for (KnowledgeEdge edge : outEdges) {
            if (related.size() >= limit) break;
            KnowledgeNode node = getNodeById(edge.getTargetNodeId());
            if (node != null) {
                related.add(node);
            }
        }
        
        List<KnowledgeEdge> inEdges = getInEdges(nodeId);
        for (KnowledgeEdge edge : inEdges) {
            if (related.size() >= limit) break;
            KnowledgeNode node = getNodeById(edge.getSourceNodeId());
            if (node != null && !related.contains(node)) {
                related.add(node);
            }
        }
        
        return related;
    }

    @Override
    public List<KnowledgeNode> getPopularNodes(int limit) {
        return knowledgeNodeMapper.selectPopularNodes(limit);
    }

    // ========== 图谱可视化 ==========

    @Override
    public Map<String, Object> getGraphVisualizationData(Long centerNodeId, int depth) {
        Map<String, Object> data = new HashMap<>();
        
        List<Map<String, Object>> nodes = new ArrayList<>();
        List<Map<String, Object>> edges = new ArrayList<>();
        Set<Long> visitedNodes = new HashSet<>();
        
        // 添加中心节点
        KnowledgeNode centerNode = getNodeById(centerNodeId);
        if (centerNode != null) {
            nodes.add(nodeToMap(centerNode));
            visitedNodes.add(centerNodeId);
            
            // 递归获取邻居节点
            collectNeighbors(centerNodeId, depth, nodes, edges, visitedNodes);
        }
        
        data.put("nodes", nodes);
        data.put("edges", edges);
        
        return data;
    }

    private void collectNeighbors(Long nodeId, int depth, List<Map<String, Object>> nodes, 
                                  List<Map<String, Object>> edges, Set<Long> visitedNodes) {
        if (depth <= 0) return;
        
        List<KnowledgeEdge> outEdges = getOutEdges(nodeId);
        for (KnowledgeEdge edge : outEdges) {
            edges.add(edgeToMap(edge));
            
            if (!visitedNodes.contains(edge.getTargetNodeId())) {
                KnowledgeNode node = getNodeById(edge.getTargetNodeId());
                if (node != null) {
                    nodes.add(nodeToMap(node));
                    visitedNodes.add(edge.getTargetNodeId());
                    collectNeighbors(edge.getTargetNodeId(), depth - 1, nodes, edges, visitedNodes);
                }
            }
        }
        
        List<KnowledgeEdge> inEdges = getInEdges(nodeId);
        for (KnowledgeEdge edge : inEdges) {
            edges.add(edgeToMap(edge));
            
            if (!visitedNodes.contains(edge.getSourceNodeId())) {
                KnowledgeNode node = getNodeById(edge.getSourceNodeId());
                if (node != null) {
                    nodes.add(nodeToMap(node));
                    visitedNodes.add(edge.getSourceNodeId());
                    collectNeighbors(edge.getSourceNodeId(), depth - 1, nodes, edges, visitedNodes);
                }
            }
        }
    }

    private Map<String, Object> nodeToMap(KnowledgeNode node) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", node.getId());
        map.put("name", node.getName());
        map.put("type", node.getNodeType());
        map.put("description", node.getDescription());
        map.put("referenceCount", node.getReferenceCount());
        return map;
    }

    private Map<String, Object> edgeToMap(KnowledgeEdge edge) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", edge.getId());
        map.put("source", edge.getSourceNodeId());
        map.put("target", edge.getTargetNodeId());
        map.put("type", edge.getRelationType());
        map.put("weight", edge.getWeight());
        return map;
    }

    @Override
    public Map<String, Object> getProjectKnowledgeGraph(Long projectId) {
        // 查找项目相关的节点
        KnowledgeNode projectNode = knowledgeNodeMapper.selectByRelatedId(projectId, "project");
        if (projectNode != null) {
            return getGraphVisualizationData(projectNode.getId(), 3);
        }
        return Map.of("nodes", List.of(), "edges", List.of());
    }

    @Override
    public Map<String, Object> getGlobalGraphOverview() {
        Map<String, Object> overview = new HashMap<>();
        
        // 获取热门节点作为概览
        List<KnowledgeNode> popularNodes = getPopularNodes(50);
        List<Map<String, Object>> nodes = new ArrayList<>();
        List<Map<String, Object>> edges = new ArrayList<>();
        Set<Long> nodeIds = new HashSet<>();
        
        for (KnowledgeNode node : popularNodes) {
            nodes.add(nodeToMap(node));
            nodeIds.add(node.getId());
        }
        
        // 获取这些节点之间的边
        for (Long nodeId : nodeIds) {
            List<KnowledgeEdge> outEdges = getOutEdges(nodeId);
            for (KnowledgeEdge edge : outEdges) {
                if (nodeIds.contains(edge.getTargetNodeId())) {
                    edges.add(edgeToMap(edge));
                }
            }
        }
        
        overview.put("nodes", nodes);
        overview.put("edges", edges);
        
        return overview;
    }

    // ========== 向量嵌入 ==========

    @Override
    @Transactional
    public void updateNodeEmbedding(Long nodeId) {
        // TODO: 调用AI服务生成向量嵌入
        // 1. 获取节点信息
        // 2. 调用Embedding API
        // 3. 更新节点的embeddingVector字段
    }

    @Override
    @Transactional
    public void batchUpdateEmbeddings(List<Long> nodeIds) {
        for (Long nodeId : nodeIds) {
            updateNodeEmbedding(nodeId);
        }
    }

    // ========== 统计分析 ==========

    @Override
    public Map<String, Object> getGraphStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalNodes", knowledgeNodeMapper.countNodes());
        stats.put("totalEdges", knowledgeEdgeMapper.countEdges());
        stats.put("nodeTypeDistribution", getNodeTypeDistribution());
        stats.put("edgeTypeDistribution", getEdgeTypeDistribution());
        return stats;
    }

    @Override
    public Map<String, Long> getNodeTypeDistribution() {
        List<Object> distribution = knowledgeNodeMapper.selectNodeTypeDistribution();
        Map<String, Long> result = new HashMap<>();
        // TODO: 转换分布数据
        return result;
    }

    @Override
    public Map<String, Long> getEdgeTypeDistribution() {
        List<Object> distribution = knowledgeEdgeMapper.selectRelationTypeDistribution();
        Map<String, Long> result = new HashMap<>();
        // TODO: 转换分布数据
        return result;
    }
}