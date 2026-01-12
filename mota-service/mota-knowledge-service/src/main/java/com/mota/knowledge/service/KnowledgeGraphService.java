package com.mota.knowledge.service;

import com.mota.knowledge.entity.KnowledgeEntity;
import com.mota.knowledge.entity.KnowledgeRelation;

import java.util.List;
import java.util.Map;

/**
 * 知识图谱服务接口
 */
public interface KnowledgeGraphService {

    // ==================== 实体管理 ====================

    /**
     * 创建实体
     */
    KnowledgeEntity createEntity(KnowledgeEntity entity);

    /**
     * 批量创建实体
     */
    List<KnowledgeEntity> createEntities(List<KnowledgeEntity> entities);

    /**
     * 更新实体
     */
    KnowledgeEntity updateEntity(KnowledgeEntity entity);

    /**
     * 删除实体
     */
    void deleteEntity(Long entityId);

    /**
     * 获取实体详情
     */
    KnowledgeEntity getEntityById(Long entityId);

    /**
     * 按类型查询实体
     */
    List<KnowledgeEntity> listEntitiesByType(String entityType);

    /**
     * 搜索实体
     */
    List<KnowledgeEntity> searchEntities(String keyword);

    /**
     * 获取热门实体
     */
    List<KnowledgeEntity> getTopEntities(Integer limit);

    /**
     * 验证实体
     */
    void verifyEntity(Long entityId);

    // ==================== 关系管理 ====================

    /**
     * 创建关系
     */
    KnowledgeRelation createRelation(KnowledgeRelation relation);

    /**
     * 批量创建关系
     */
    List<KnowledgeRelation> createRelations(List<KnowledgeRelation> relations);

    /**
     * 更新关系
     */
    KnowledgeRelation updateRelation(KnowledgeRelation relation);

    /**
     * 删除关系
     */
    void deleteRelation(Long relationId);

    /**
     * 获取实体的所有关系
     */
    List<KnowledgeRelation> getEntityRelations(Long entityId);

    /**
     * 获取两个实体之间的关系
     */
    List<KnowledgeRelation> getRelationsBetween(Long entityId1, Long entityId2);

    // ==================== 图谱查询 ====================

    /**
     * 获取图谱数据（用于可视化）
     */
    Map<String, Object> getGraphData(Integer limit);

    /**
     * 获取实体的子图
     */
    Map<String, Object> getSubGraph(Long entityId, Integer depth);

    /**
     * 路径查询（两个实体之间的路径）
     */
    List<List<Object>> findPaths(Long sourceEntityId, Long targetEntityId, Integer maxDepth);

    /**
     * 获取相关实体推荐
     */
    List<KnowledgeEntity> getRelatedEntities(Long entityId, Integer limit);

    // ==================== 统计分析 ====================

    /**
     * 获取实体类型统计
     */
    Map<String, Long> getEntityTypeStats();

    /**
     * 获取关系类型统计
     */
    Map<String, Long> getRelationTypeStats();

    /**
     * 获取图谱概览统计
     */
    Map<String, Object> getGraphOverview();

    // ==================== 知识抽取 ====================

    /**
     * 从文件中抽取实体和关系
     */
    Map<String, Object> extractFromFile(Long fileId);

    /**
     * 从文本中抽取实体和关系
     */
    Map<String, Object> extractFromText(String text);
}