package com.mota.project.controller;

import com.mota.project.entity.KnowledgeEdge;
import com.mota.project.entity.KnowledgeNode;
import com.mota.project.service.KnowledgeGraphService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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

    // ========== 聚类与子图 ==========

    @PostMapping("/visualization/clustered")
    public ResponseEntity<Map<String, Object>> getClusteredVisualizationData(
            @RequestBody(required = false) Map<String, Object> config) {
        return ResponseEntity.ok(knowledgeGraphService.getClusteredVisualizationData(
                config != null ? config : Map.of()));
    }

    @GetMapping("/visualization/interactive")
    public ResponseEntity<Map<String, Object>> getInteractiveGraphData(
            @RequestParam(required = false) Long centerNodeId,
            @RequestParam(required = false) Integer depth,
            @RequestParam(required = false) List<String> nodeTypes,
            @RequestParam(required = false) List<String> relationTypes,
            @RequestParam(required = false) Double minWeight) {
        return ResponseEntity.ok(knowledgeGraphService.getInteractiveGraphData(
                centerNodeId, depth, nodeTypes, relationTypes, minWeight));
    }

    @PostMapping("/cluster")
    public ResponseEntity<List<Map<String, Object>>> clusterNodes(
            @RequestBody Map<String, Object> config) {
        return ResponseEntity.ok(knowledgeGraphService.clusterNodes(config));
    }

    @GetMapping("/cluster/{clusterId}")
    public ResponseEntity<Map<String, Object>> getClusterDetails(@PathVariable Long clusterId) {
        return ResponseEntity.ok(knowledgeGraphService.getClusterDetails(clusterId));
    }

    @PostMapping("/cluster/{clusterId}/layout")
    public ResponseEntity<Map<String, Object>> updateClusterLayout(
            @PathVariable Long clusterId,
            @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(knowledgeGraphService.updateClusterLayout(
                clusterId, request.get("layout")));
    }

    @PostMapping("/subgraph/filter")
    public ResponseEntity<Map<String, Object>> filterSubgraph(
            @RequestBody Map<String, Object> filter) {
        return ResponseEntity.ok(knowledgeGraphService.filterSubgraph(filter));
    }

    @PostMapping("/subgraph/save-view")
    public ResponseEntity<Map<String, Object>> saveSubgraphAsView(
            @RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        Map<String, Object> filter = (Map<String, Object>) request.get("filter");
        String viewName = (String) request.get("viewName");
        return ResponseEntity.ok(knowledgeGraphService.saveSubgraphAsView(filter, viewName));
    }

    @GetMapping("/subgraph/views")
    public ResponseEntity<List<Map<String, Object>>> getSavedViews() {
        return ResponseEntity.ok(knowledgeGraphService.getSavedViews());
    }

    @PostMapping("/subgraph/export")
    public ResponseEntity<byte[]> exportSubgraph(@RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        Map<String, Object> filter = (Map<String, Object>) request.get("filter");
        String format = (String) request.get("format");
        byte[] data = knowledgeGraphService.exportSubgraph(filter, format);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "subgraph." + format);
        
        return ResponseEntity.ok().headers(headers).body(data);
    }

    // ========== 路径查询 ==========

    @GetMapping("/paths/shortest")
    public ResponseEntity<Map<String, Object>> findShortestPath(
            @RequestParam Long sourceNodeId,
            @RequestParam Long targetNodeId,
            @RequestParam(required = false) Integer maxDepth,
            @RequestParam(required = false) List<String> relationTypes) {
        return ResponseEntity.ok(knowledgeGraphService.findShortestPath(
                sourceNodeId, targetNodeId, maxDepth, relationTypes));
    }

    @GetMapping("/paths/all")
    public ResponseEntity<List<Map<String, Object>>> findAllPaths(
            @RequestParam Long sourceNodeId,
            @RequestParam Long targetNodeId,
            @RequestParam(required = false) Integer maxDepth,
            @RequestParam(required = false) Integer maxPaths) {
        return ResponseEntity.ok(knowledgeGraphService.findAllPaths(
                sourceNodeId, targetNodeId, maxDepth, maxPaths));
    }

    @GetMapping("/paths/by-relation")
    public ResponseEntity<List<Map<String, Object>>> findPathsByRelationType(
            @RequestParam Long sourceNodeId,
            @RequestParam String relationType,
            @RequestParam(defaultValue = "3") Integer maxDepth) {
        return ResponseEntity.ok(knowledgeGraphService.findPathsByRelationType(
                sourceNodeId, relationType, maxDepth));
    }

    // ========== 知识导航 ==========

    @GetMapping("/navigation/{nodeId}/suggestions")
    public ResponseEntity<List<Map<String, Object>>> getNavigationSuggestions(
            @PathVariable Long nodeId,
            @RequestParam(defaultValue = "10") Integer limit) {
        return ResponseEntity.ok(knowledgeGraphService.getNavigationSuggestions(nodeId, limit));
    }

    @GetMapping("/navigation/history")
    public ResponseEntity<List<Map<String, Object>>> getNavigationHistory(
            @RequestParam(defaultValue = "20") Integer limit) {
        return ResponseEntity.ok(knowledgeGraphService.getNavigationHistory(limit));
    }

    @PostMapping("/navigation/record/{nodeId}")
    public ResponseEntity<Void> recordNavigation(@PathVariable Long nodeId) {
        knowledgeGraphService.recordNavigation(nodeId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/navigation/{nodeId}/related")
    public ResponseEntity<List<Map<String, Object>>> getRelatedKnowledge(
            @PathVariable Long nodeId,
            @RequestParam(required = false) List<String> types,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Double minRelevance) {
        return ResponseEntity.ok(knowledgeGraphService.getRelatedKnowledge(
                nodeId, types, limit, minRelevance));
    }

    // ========== 关联推荐 ==========

    @GetMapping("/recommendations/{nodeId}")
    public ResponseEntity<Map<String, Object>> getRecommendations(
            @PathVariable Long nodeId,
            @RequestParam(required = false) List<String> types) {
        return ResponseEntity.ok(knowledgeGraphService.getRecommendations(nodeId, types));
    }

    @GetMapping("/recommendations/{nodeId}/documents")
    public ResponseEntity<List<Map<String, Object>>> getDocumentRecommendations(
            @PathVariable Long nodeId,
            @RequestParam(defaultValue = "10") Integer limit) {
        return ResponseEntity.ok(knowledgeGraphService.getDocumentRecommendations(nodeId, limit));
    }

    @GetMapping("/recommendations/{nodeId}/projects")
    public ResponseEntity<List<Map<String, Object>>> getProjectRecommendations(
            @PathVariable Long nodeId,
            @RequestParam(defaultValue = "10") Integer limit) {
        return ResponseEntity.ok(knowledgeGraphService.getProjectRecommendations(nodeId, limit));
    }

    @GetMapping("/recommendations/{nodeId}/persons")
    public ResponseEntity<List<Map<String, Object>>> getPersonRecommendations(
            @PathVariable Long nodeId,
            @RequestParam(defaultValue = "10") Integer limit) {
        return ResponseEntity.ok(knowledgeGraphService.getPersonRecommendations(nodeId, limit));
    }

    @GetMapping("/recommendations/{nodeId}/similar")
    public ResponseEntity<List<Map<String, Object>>> getSimilarNodes(
            @PathVariable Long nodeId,
            @RequestParam(defaultValue = "10") Integer limit) {
        return ResponseEntity.ok(knowledgeGraphService.getSimilarNodes(nodeId, limit));
    }

    // ========== 实体识别与关系抽取 ==========

    @PostMapping("/extract/entities/{documentId}")
    public ResponseEntity<Map<String, Object>> extractEntitiesFromDocument(
            @PathVariable Long documentId) {
        return ResponseEntity.ok(knowledgeGraphService.extractEntitiesFromDocument(documentId));
    }

    @PostMapping("/extract/entities/text")
    public ResponseEntity<List<Map<String, Object>>> extractEntitiesFromText(
            @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(knowledgeGraphService.extractEntitiesFromText(request.get("text")));
    }

    @PostMapping("/extract/relations/{documentId}")
    public ResponseEntity<Map<String, Object>> extractRelationsFromDocument(
            @PathVariable Long documentId) {
        return ResponseEntity.ok(knowledgeGraphService.extractRelationsFromDocument(documentId));
    }

    @PostMapping("/extract/relations/entities")
    public ResponseEntity<List<Map<String, Object>>> extractRelationsFromEntities(
            @RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> entities = (List<Map<String, Object>>) request.get("entities");
        return ResponseEntity.ok(knowledgeGraphService.extractRelationsFromEntities(entities));
    }

    @PostMapping("/extract/attributes/{entityId}")
    public ResponseEntity<Map<String, Object>> extractAttributesFromEntity(
            @PathVariable Long entityId) {
        return ResponseEntity.ok(knowledgeGraphService.extractAttributesFromEntity(entityId));
    }

    @PostMapping("/extract/attributes/batch")
    public ResponseEntity<List<Map<String, Object>>> batchExtractAttributes(
            @RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<Long> entityIds = (List<Long>) request.get("entityIds");
        return ResponseEntity.ok(knowledgeGraphService.batchExtractAttributes(entityIds));
    }

    // ========== 知识融合 ==========

    @GetMapping("/fusion/duplicates")
    public ResponseEntity<List<Map<String, Object>>> findDuplicates(
            @RequestParam(defaultValue = "0.8") Double threshold) {
        return ResponseEntity.ok(knowledgeGraphService.findDuplicates(threshold));
    }

    @PostMapping("/fusion/merge")
    public ResponseEntity<Map<String, Object>> mergeEntities(
            @RequestBody Map<String, Object> request) {
        Long entity1Id = ((Number) request.get("entity1Id")).longValue();
        Long entity2Id = ((Number) request.get("entity2Id")).longValue();
        String mergedName = (String) request.get("mergedName");
        @SuppressWarnings("unchecked")
        Map<String, String> conflictResolution = (Map<String, String>) request.get("conflictResolution");
        return ResponseEntity.ok(knowledgeGraphService.mergeEntities(
                entity1Id, entity2Id, mergedName, conflictResolution));
    }

    @PostMapping("/fusion/auto-merge")
    public ResponseEntity<List<Map<String, Object>>> autoMergeDuplicates(
            @RequestParam(defaultValue = "0.9") Double threshold) {
        return ResponseEntity.ok(knowledgeGraphService.autoMergeDuplicates(threshold));
    }
}