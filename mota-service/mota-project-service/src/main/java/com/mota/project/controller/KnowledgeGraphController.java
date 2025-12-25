package com.mota.project.controller;

import com.mota.project.entity.KnowledgeEdge;
import com.mota.project.entity.KnowledgeNode;
import com.mota.project.service.KnowledgeGraphService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 知识图谱控制器
 */
@RestController
@RequestMapping("/api/knowledge-graph")
@RequiredArgsConstructor
public class KnowledgeGraphController {

    private final KnowledgeGraphService knowledgeGraphService;

    // ========== 节点管理 ==========

    @PostMapping("/nodes")
    public ResponseEntity<KnowledgeNode> createNode(@RequestBody KnowledgeNode node) {
        return ResponseEntity.ok(knowledgeGraphService.createNode(node));
    }

    @PutMapping("/nodes/{id}")
    public ResponseEntity<KnowledgeNode> updateNode(@PathVariable Long id, @RequestBody KnowledgeNode node) {
        return ResponseEntity.ok(knowledgeGraphService.updateNode(id, node));
    }

    @DeleteMapping("/nodes/{id}")
    public ResponseEntity<Boolean> deleteNode(@PathVariable Long id) {
        return ResponseEntity.ok(knowledgeGraphService.deleteNode(id));
    }

    @GetMapping("/nodes/{id}")
    public ResponseEntity<KnowledgeNode> getNode(@PathVariable Long id) {
        return ResponseEntity.ok(knowledgeGraphService.getNodeById(id));
    }

    @GetMapping("/nodes/{id}/with-relations")
    public ResponseEntity<KnowledgeNode> getNodeWithRelations(
            @PathVariable Long id,
            @RequestParam(defaultValue = "2") int depth) {
        return ResponseEntity.ok(knowledgeGraphService.getNodeWithRelations(id, depth));
    }

    @GetMapping("/nodes/type/{nodeType}")
    public ResponseEntity<List<KnowledgeNode>> getNodesByType(
            @PathVariable String nodeType,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ResponseEntity.ok(knowledgeGraphService.getNodesByType(nodeType, page, pageSize));
    }

    @GetMapping("/nodes/search")
    public ResponseEntity<List<KnowledgeNode>> searchNodes(
            @RequestParam String keyword,
            @RequestParam(required = false) String nodeType,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ResponseEntity.ok(knowledgeGraphService.searchNodes(keyword, nodeType, page, pageSize));
    }

    @GetMapping("/nodes/semantic-search")
    public ResponseEntity<List<KnowledgeNode>> semanticSearchNodes(
            @RequestParam String query,
            @RequestParam(defaultValue = "10") int topK) {
        return ResponseEntity.ok(knowledgeGraphService.semanticSearchNodes(query, topK));
    }

    @GetMapping("/nodes/popular")
    public ResponseEntity<List<KnowledgeNode>> getPopularNodes(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(knowledgeGraphService.getPopularNodes(limit));
    }

    // ========== 关系管理 ==========

    @PostMapping("/edges")
    public ResponseEntity<KnowledgeEdge> createEdge(@RequestBody KnowledgeEdge edge) {
        return ResponseEntity.ok(knowledgeGraphService.createEdge(edge));
    }

    @DeleteMapping("/edges/{id}")
    public ResponseEntity<Boolean> deleteEdge(@PathVariable Long id) {
        return ResponseEntity.ok(knowledgeGraphService.deleteEdge(id));
    }

    @GetMapping("/nodes/{nodeId}/out-edges")
    public ResponseEntity<List<KnowledgeEdge>> getOutEdges(@PathVariable Long nodeId) {
        return ResponseEntity.ok(knowledgeGraphService.getOutEdges(nodeId));
    }

    @GetMapping("/nodes/{nodeId}/in-edges")
    public ResponseEntity<List<KnowledgeEdge>> getInEdges(@PathVariable Long nodeId) {
        return ResponseEntity.ok(knowledgeGraphService.getInEdges(nodeId));
    }

    @GetMapping("/edges/between")
    public ResponseEntity<List<KnowledgeEdge>> getEdgesBetween(
            @RequestParam Long sourceNodeId,
            @RequestParam Long targetNodeId) {
        return ResponseEntity.ok(knowledgeGraphService.getEdgesBetween(sourceNodeId, targetNodeId));
    }

    @GetMapping("/edges/type/{relationType}")
    public ResponseEntity<List<KnowledgeEdge>> getEdgesByType(
            @PathVariable String relationType,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ResponseEntity.ok(knowledgeGraphService.getEdgesByType(relationType, page, pageSize));
    }

    // ========== 图谱构建 ==========

    @PostMapping("/extract/document/{documentId}")
    public ResponseEntity<List<KnowledgeNode>> extractFromDocument(@PathVariable Long documentId) {
        return ResponseEntity.ok(knowledgeGraphService.extractKnowledgeFromDocument(documentId));
    }

    @PostMapping("/extract/task/{taskId}")
    public ResponseEntity<KnowledgeNode> extractFromTask(@PathVariable Long taskId) {
        return ResponseEntity.ok(knowledgeGraphService.extractKnowledgeFromTask(taskId));
    }

    @PostMapping("/extract/project/{projectId}")
    public ResponseEntity<KnowledgeNode> extractFromProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(knowledgeGraphService.extractKnowledgeFromProject(projectId));
    }

    @PostMapping("/nodes/{nodeId}/discover-relations")
    public ResponseEntity<List<KnowledgeEdge>> discoverRelations(@PathVariable Long nodeId) {
        return ResponseEntity.ok(knowledgeGraphService.discoverRelations(nodeId));
    }

    @PostMapping("/nodes/merge")
    public ResponseEntity<KnowledgeNode> mergeNodes(
            @RequestBody List<Long> nodeIds,
            @RequestParam String mergedName) {
        return ResponseEntity.ok(knowledgeGraphService.mergeNodes(nodeIds, mergedName));
    }

    // ========== 图谱查询 ==========

    @GetMapping("/nodes/{nodeId}/neighbors")
    public ResponseEntity<List<KnowledgeNode>> getNeighbors(
            @PathVariable Long nodeId,
            @RequestParam(defaultValue = "2") int depth) {
        return ResponseEntity.ok(knowledgeGraphService.getNeighbors(nodeId, depth));
    }

    @GetMapping("/paths")
    public ResponseEntity<List<List<KnowledgeNode>>> findPaths(
            @RequestParam Long sourceNodeId,
            @RequestParam Long targetNodeId,
            @RequestParam(defaultValue = "5") int maxDepth) {
        return ResponseEntity.ok(knowledgeGraphService.findPaths(sourceNodeId, targetNodeId, maxDepth));
    }

    @GetMapping("/nodes/{nodeId}/related")
    public ResponseEntity<List<KnowledgeNode>> getRelatedNodes(
            @PathVariable Long nodeId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(knowledgeGraphService.getRelatedNodes(nodeId, limit));
    }

    // ========== 图谱可视化 ==========

    @GetMapping("/visualization/{centerNodeId}")
    public ResponseEntity<Map<String, Object>> getGraphVisualizationData(
            @PathVariable Long centerNodeId,
            @RequestParam(defaultValue = "2") int depth) {
        return ResponseEntity.ok(knowledgeGraphService.getGraphVisualizationData(centerNodeId, depth));
    }

    @GetMapping("/project/{projectId}/graph")
    public ResponseEntity<Map<String, Object>> getProjectKnowledgeGraph(@PathVariable Long projectId) {
        return ResponseEntity.ok(knowledgeGraphService.getProjectKnowledgeGraph(projectId));
    }

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getGlobalGraphOverview() {
        return ResponseEntity.ok(knowledgeGraphService.getGlobalGraphOverview());
    }

    // ========== 向量嵌入 ==========

    @PostMapping("/nodes/{nodeId}/update-embedding")
    public ResponseEntity<Void> updateNodeEmbedding(@PathVariable Long nodeId) {
        knowledgeGraphService.updateNodeEmbedding(nodeId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/nodes/batch-update-embeddings")
    public ResponseEntity<Void> batchUpdateEmbeddings(@RequestBody List<Long> nodeIds) {
        knowledgeGraphService.batchUpdateEmbeddings(nodeIds);
        return ResponseEntity.ok().build();
    }

    // ========== 统计分析 ==========

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getGraphStats() {
        return ResponseEntity.ok(knowledgeGraphService.getGraphStats());
    }

    @GetMapping("/stats/node-types")
    public ResponseEntity<Map<String, Long>> getNodeTypeDistribution() {
        return ResponseEntity.ok(knowledgeGraphService.getNodeTypeDistribution());
    }

    @GetMapping("/stats/edge-types")
    public ResponseEntity<Map<String, Long>> getEdgeTypeDistribution() {
        return ResponseEntity.ok(knowledgeGraphService.getEdgeTypeDistribution());
    }
}