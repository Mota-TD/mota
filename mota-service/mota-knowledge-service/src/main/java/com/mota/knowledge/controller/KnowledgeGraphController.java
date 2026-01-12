package com.mota.knowledge.controller;

import com.mota.common.core.result.Result;
import com.mota.knowledge.entity.KnowledgeEntity;
import com.mota.knowledge.entity.KnowledgeRelation;
import com.mota.knowledge.service.KnowledgeGraphService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 知识图谱控制器
 */
@Tag(name = "知识图谱", description = "知识图谱管理接口")
@RestController
@RequestMapping("/api/v1/knowledge/graph")
@RequiredArgsConstructor
public class KnowledgeGraphController {

    private final KnowledgeGraphService graphService;

    // ==================== 实体管理 ====================

    @Operation(summary = "创建实体")
    @PostMapping("/entities")
    public Result<KnowledgeEntity> createEntity(@RequestBody KnowledgeEntity entity) {
        return Result.success(graphService.createEntity(entity));
    }

    @Operation(summary = "批量创建实体")
    @PostMapping("/entities/batch")
    public Result<List<KnowledgeEntity>> createEntities(@RequestBody List<KnowledgeEntity> entities) {
        return Result.success(graphService.createEntities(entities));
    }

    @Operation(summary = "更新实体")
    @PutMapping("/entities/{entityId}")
    public Result<KnowledgeEntity> updateEntity(
            @PathVariable Long entityId,
            @RequestBody KnowledgeEntity entity) {
        entity.setId(entityId);
        return Result.success(graphService.updateEntity(entity));
    }

    @Operation(summary = "删除实体")
    @DeleteMapping("/entities/{entityId}")
    public Result<Void> deleteEntity(@PathVariable Long entityId) {
        graphService.deleteEntity(entityId);
        return Result.success();
    }

    @Operation(summary = "获取实体详情")
    @GetMapping("/entities/{entityId}")
    public Result<KnowledgeEntity> getEntity(@PathVariable Long entityId) {
        return Result.success(graphService.getEntityById(entityId));
    }

    @Operation(summary = "按类型获取实体列表")
    @GetMapping("/entities/type/{entityType}")
    public Result<List<KnowledgeEntity>> listEntitiesByType(@PathVariable String entityType) {
        return Result.success(graphService.listEntitiesByType(entityType));
    }

    @Operation(summary = "搜索实体")
    @GetMapping("/entities/search")
    public Result<List<KnowledgeEntity>> searchEntities(
            @Parameter(description = "搜索关键词") @RequestParam String keyword) {
        return Result.success(graphService.searchEntities(keyword));
    }

    @Operation(summary = "获取热门实体")
    @GetMapping("/entities/top")
    public Result<List<KnowledgeEntity>> getTopEntities(
            @Parameter(description = "数量限制") @RequestParam(defaultValue = "10") Integer limit) {
        return Result.success(graphService.getTopEntities(limit));
    }

    @Operation(summary = "验证实体")
    @PostMapping("/entities/{entityId}/verify")
    public Result<Void> verifyEntity(@PathVariable Long entityId) {
        graphService.verifyEntity(entityId);
        return Result.success();
    }

    // ==================== 关系管理 ====================

    @Operation(summary = "创建关系")
    @PostMapping("/relations")
    public Result<KnowledgeRelation> createRelation(@RequestBody KnowledgeRelation relation) {
        return Result.success(graphService.createRelation(relation));
    }

    @Operation(summary = "批量创建关系")
    @PostMapping("/relations/batch")
    public Result<List<KnowledgeRelation>> createRelations(@RequestBody List<KnowledgeRelation> relations) {
        return Result.success(graphService.createRelations(relations));
    }

    @Operation(summary = "更新关系")
    @PutMapping("/relations/{relationId}")
    public Result<KnowledgeRelation> updateRelation(
            @PathVariable Long relationId,
            @RequestBody KnowledgeRelation relation) {
        relation.setId(relationId);
        return Result.success(graphService.updateRelation(relation));
    }

    @Operation(summary = "删除关系")
    @DeleteMapping("/relations/{relationId}")
    public Result<Void> deleteRelation(@PathVariable Long relationId) {
        graphService.deleteRelation(relationId);
        return Result.success();
    }

    @Operation(summary = "获取实体的所有关系")
    @GetMapping("/entities/{entityId}/relations")
    public Result<List<KnowledgeRelation>> getEntityRelations(@PathVariable Long entityId) {
        return Result.success(graphService.getEntityRelations(entityId));
    }

    @Operation(summary = "获取两个实体之间的关系")
    @GetMapping("/relations/between")
    public Result<List<KnowledgeRelation>> getRelationsBetween(
            @Parameter(description = "实体1 ID") @RequestParam Long entityId1,
            @Parameter(description = "实体2 ID") @RequestParam Long entityId2) {
        return Result.success(graphService.getRelationsBetween(entityId1, entityId2));
    }

    // ==================== 图谱查询 ====================

    @Operation(summary = "获取图谱数据")
    @GetMapping("/data")
    public Result<Map<String, Object>> getGraphData(
            @Parameter(description = "数量限制") @RequestParam(defaultValue = "100") Integer limit) {
        return Result.success(graphService.getGraphData(limit));
    }

    @Operation(summary = "获取子图")
    @GetMapping("/subgraph/{entityId}")
    public Result<Map<String, Object>> getSubGraph(
            @PathVariable Long entityId,
            @Parameter(description = "深度") @RequestParam(defaultValue = "2") Integer depth) {
        return Result.success(graphService.getSubGraph(entityId, depth));
    }

    @Operation(summary = "查找路径")
    @GetMapping("/paths")
    public Result<List<List<Object>>> findPaths(
            @Parameter(description = "源实体ID") @RequestParam Long sourceEntityId,
            @Parameter(description = "目标实体ID") @RequestParam Long targetEntityId,
            @Parameter(description = "最大深度") @RequestParam(defaultValue = "5") Integer maxDepth) {
        return Result.success(graphService.findPaths(sourceEntityId, targetEntityId, maxDepth));
    }

    @Operation(summary = "获取相关实体")
    @GetMapping("/entities/{entityId}/related")
    public Result<List<KnowledgeEntity>> getRelatedEntities(
            @PathVariable Long entityId,
            @Parameter(description = "数量限制") @RequestParam(defaultValue = "10") Integer limit) {
        return Result.success(graphService.getRelatedEntities(entityId, limit));
    }

    // ==================== 统计分析 ====================

    @Operation(summary = "获取实体类型统计")
    @GetMapping("/stats/entity-types")
    public Result<Map<String, Long>> getEntityTypeStats() {
        return Result.success(graphService.getEntityTypeStats());
    }

    @Operation(summary = "获取关系类型统计")
    @GetMapping("/stats/relation-types")
    public Result<Map<String, Long>> getRelationTypeStats() {
        return Result.success(graphService.getRelationTypeStats());
    }

    @Operation(summary = "获取图谱概览")
    @GetMapping("/overview")
    public Result<Map<String, Object>> getGraphOverview() {
        return Result.success(graphService.getGraphOverview());
    }

    // ==================== 知识抽取 ====================

    @Operation(summary = "从文件抽取知识")
    @PostMapping("/extract/file/{fileId}")
    public Result<Map<String, Object>> extractFromFile(@PathVariable Long fileId) {
        return Result.success(graphService.extractFromFile(fileId));
    }

    @Operation(summary = "从文本抽取知识")
    @PostMapping("/extract/text")
    public Result<Map<String, Object>> extractFromText(@RequestBody String text) {
        return Result.success(graphService.extractFromText(text));
    }
}