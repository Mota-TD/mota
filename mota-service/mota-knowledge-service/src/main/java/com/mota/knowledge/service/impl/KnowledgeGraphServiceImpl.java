package com.mota.knowledge.service.impl;

import com.mota.common.core.context.TenantContext;
import com.mota.common.core.context.UserContext;
import com.mota.knowledge.entity.KnowledgeEntity;
import com.mota.knowledge.entity.KnowledgeRelation;
import com.mota.knowledge.mapper.KnowledgeEntityMapper;
import com.mota.knowledge.mapper.KnowledgeRelationMapper;
import com.mota.knowledge.service.KnowledgeGraphService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 知识图谱服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KnowledgeGraphServiceImpl implements KnowledgeGraphService {

    private final KnowledgeEntityMapper entityMapper;
    private final KnowledgeRelationMapper relationMapper;

    // ==================== 实体管理 ====================

    @Override
    @Transactional
    public KnowledgeEntity createEntity(KnowledgeEntity entity) {
        entity.setTenantId(TenantContext.getTenantId());
        entity.setCreatedBy(UserContext.getUserId());
        entity.setReferenceCount(0);
        entity.setIsVerified(false);
        entityMapper.insert(entity);
        return entity;
    }

    @Override
    @Transactional
    public List<KnowledgeEntity> createEntities(List<KnowledgeEntity> entities) {
        Long tenantId = TenantContext.getTenantId();
        Long userId = UserContext.getUserId();
        
        for (KnowledgeEntity entity : entities) {
            entity.setTenantId(tenantId);
            entity.setCreatedBy(userId);
            entity.setReferenceCount(0);
            entity.setIsVerified(false);
            entityMapper.insert(entity);
        }
        return entities;
    }

    @Override
    @Transactional
    public KnowledgeEntity updateEntity(KnowledgeEntity entity) {
        entityMapper.updateById(entity);
        return entityMapper.selectById(entity.getId());
    }

    @Override
    @Transactional
    public void deleteEntity(Long entityId) {
        // 同时删除相关的关系
        List<KnowledgeRelation> relations = relationMapper.selectByEntity(entityId);
        for (KnowledgeRelation relation : relations) {
            relationMapper.deleteById(relation.getId());
        }
        entityMapper.deleteById(entityId);
    }

    @Override
    public KnowledgeEntity getEntityById(Long entityId) {
        return entityMapper.selectById(entityId);
    }

    @Override
    public List<KnowledgeEntity> listEntitiesByType(String entityType) {
        return entityMapper.selectByType(TenantContext.getTenantId(), entityType);
    }

    @Override
    public List<KnowledgeEntity> searchEntities(String keyword) {
        return entityMapper.searchByName(TenantContext.getTenantId(), keyword);
    }

    @Override
    public List<KnowledgeEntity> getTopEntities(Integer limit) {
        return entityMapper.selectTopEntities(TenantContext.getTenantId(), limit);
    }

    @Override
    @Transactional
    public void verifyEntity(Long entityId) {
        KnowledgeEntity entity = entityMapper.selectById(entityId);
        if (entity != null) {
            entity.setIsVerified(true);
            entity.setVerifiedBy(UserContext.getUserId());
            entity.setVerifiedAt(LocalDateTime.now());
            entityMapper.updateById(entity);
        }
    }

    // ==================== 关系管理 ====================

    @Override
    @Transactional
    public KnowledgeRelation createRelation(KnowledgeRelation relation) {
        relation.setTenantId(TenantContext.getTenantId());
        relation.setCreatedBy(UserContext.getUserId());
        relation.setIsVerified(false);
        relationMapper.insert(relation);
        
        // 更新实体的引用计数
        updateEntityReferenceCount(relation.getSourceEntityId(), 1);
        updateEntityReferenceCount(relation.getTargetEntityId(), 1);
        
        return relation;
    }

    @Override
    @Transactional
    public List<KnowledgeRelation> createRelations(List<KnowledgeRelation> relations) {
        Long tenantId = TenantContext.getTenantId();
        Long userId = UserContext.getUserId();
        
        for (KnowledgeRelation relation : relations) {
            relation.setTenantId(tenantId);
            relation.setCreatedBy(userId);
            relation.setIsVerified(false);
            relationMapper.insert(relation);
            
            updateEntityReferenceCount(relation.getSourceEntityId(), 1);
            updateEntityReferenceCount(relation.getTargetEntityId(), 1);
        }
        return relations;
    }

    @Override
    @Transactional
    public KnowledgeRelation updateRelation(KnowledgeRelation relation) {
        relationMapper.updateById(relation);
        return relationMapper.selectById(relation.getId());
    }

    @Override
    @Transactional
    public void deleteRelation(Long relationId) {
        KnowledgeRelation relation = relationMapper.selectById(relationId);
        if (relation != null) {
            relationMapper.deleteById(relationId);
            updateEntityReferenceCount(relation.getSourceEntityId(), -1);
            updateEntityReferenceCount(relation.getTargetEntityId(), -1);
        }
    }

    @Override
    public List<KnowledgeRelation> getEntityRelations(Long entityId) {
        return relationMapper.selectByEntity(entityId);
    }

    @Override
    public List<KnowledgeRelation> getRelationsBetween(Long entityId1, Long entityId2) {
        return relationMapper.selectBetweenEntities(entityId1, entityId2);
    }

    // ==================== 图谱查询 ====================

    @Override
    public Map<String, Object> getGraphData(Integer limit) {
        Long tenantId = TenantContext.getTenantId();
        
        // 获取关系
        List<KnowledgeRelation> relations = relationMapper.selectGraphData(tenantId, limit);
        
        // 收集涉及的实体ID
        Set<Long> entityIds = new HashSet<>();
        for (KnowledgeRelation relation : relations) {
            entityIds.add(relation.getSourceEntityId());
            entityIds.add(relation.getTargetEntityId());
        }
        
        // 获取实体
        List<KnowledgeEntity> entities = new ArrayList<>();
        for (Long entityId : entityIds) {
            KnowledgeEntity entity = entityMapper.selectById(entityId);
            if (entity != null) {
                entities.add(entity);
            }
        }
        
        // 构建图谱数据
        Map<String, Object> graphData = new HashMap<>();
        graphData.put("nodes", entities.stream().map(this::entityToNode).collect(Collectors.toList()));
        graphData.put("edges", relations.stream().map(this::relationToEdge).collect(Collectors.toList()));
        
        return graphData;
    }

    @Override
    public Map<String, Object> getSubGraph(Long entityId, Integer depth) {
        Set<Long> visitedEntities = new HashSet<>();
        Set<Long> visitedRelations = new HashSet<>();
        List<KnowledgeEntity> entities = new ArrayList<>();
        List<KnowledgeRelation> relations = new ArrayList<>();
        
        // BFS遍历
        Queue<Long> queue = new LinkedList<>();
        Map<Long, Integer> depthMap = new HashMap<>();
        queue.offer(entityId);
        depthMap.put(entityId, 0);
        
        while (!queue.isEmpty()) {
            Long currentId = queue.poll();
            int currentDepth = depthMap.get(currentId);
            
            if (visitedEntities.contains(currentId)) {
                continue;
            }
            visitedEntities.add(currentId);
            
            KnowledgeEntity entity = entityMapper.selectById(currentId);
            if (entity != null) {
                entities.add(entity);
            }
            
            if (currentDepth < depth) {
                List<KnowledgeRelation> entityRelations = relationMapper.selectByEntity(currentId);
                for (KnowledgeRelation relation : entityRelations) {
                    if (!visitedRelations.contains(relation.getId())) {
                        visitedRelations.add(relation.getId());
                        relations.add(relation);
                        
                        Long nextId = relation.getSourceEntityId().equals(currentId) 
                            ? relation.getTargetEntityId() 
                            : relation.getSourceEntityId();
                        
                        if (!visitedEntities.contains(nextId)) {
                            queue.offer(nextId);
                            depthMap.put(nextId, currentDepth + 1);
                        }
                    }
                }
            }
        }
        
        Map<String, Object> graphData = new HashMap<>();
        graphData.put("nodes", entities.stream().map(this::entityToNode).collect(Collectors.toList()));
        graphData.put("edges", relations.stream().map(this::relationToEdge).collect(Collectors.toList()));
        
        return graphData;
    }

    @Override
    public List<List<Object>> findPaths(Long sourceEntityId, Long targetEntityId, Integer maxDepth) {
        List<List<Object>> allPaths = new ArrayList<>();
        List<Object> currentPath = new ArrayList<>();
        Set<Long> visited = new HashSet<>();
        
        dfs(sourceEntityId, targetEntityId, maxDepth, currentPath, visited, allPaths);
        
        return allPaths;
    }

    private void dfs(Long currentId, Long targetId, int remainingDepth, 
                     List<Object> currentPath, Set<Long> visited, List<List<Object>> allPaths) {
        if (remainingDepth < 0) {
            return;
        }
        
        KnowledgeEntity entity = entityMapper.selectById(currentId);
        if (entity == null) {
            return;
        }
        
        currentPath.add(entity);
        visited.add(currentId);
        
        if (currentId.equals(targetId)) {
            allPaths.add(new ArrayList<>(currentPath));
        } else {
            List<KnowledgeRelation> relations = relationMapper.selectByEntity(currentId);
            for (KnowledgeRelation relation : relations) {
                Long nextId = relation.getSourceEntityId().equals(currentId) 
                    ? relation.getTargetEntityId() 
                    : relation.getSourceEntityId();
                
                if (!visited.contains(nextId)) {
                    currentPath.add(relation);
                    dfs(nextId, targetId, remainingDepth - 1, currentPath, visited, allPaths);
                    currentPath.remove(currentPath.size() - 1);
                }
            }
        }
        
        currentPath.remove(currentPath.size() - 1);
        visited.remove(currentId);
    }

    @Override
    public List<KnowledgeEntity> getRelatedEntities(Long entityId, Integer limit) {
        List<KnowledgeRelation> relations = relationMapper.selectByEntity(entityId);
        Set<Long> relatedIds = new HashSet<>();
        
        for (KnowledgeRelation relation : relations) {
            if (!relation.getSourceEntityId().equals(entityId)) {
                relatedIds.add(relation.getSourceEntityId());
            }
            if (!relation.getTargetEntityId().equals(entityId)) {
                relatedIds.add(relation.getTargetEntityId());
            }
        }
        
        List<KnowledgeEntity> relatedEntities = new ArrayList<>();
        int count = 0;
        for (Long relatedId : relatedIds) {
            if (count >= limit) break;
            KnowledgeEntity entity = entityMapper.selectById(relatedId);
            if (entity != null) {
                relatedEntities.add(entity);
                count++;
            }
        }
        
        return relatedEntities;
    }

    // ==================== 统计分析 ====================

    @Override
    public Map<String, Long> getEntityTypeStats() {
        List<Map<String, Object>> stats = entityMapper.countByType(TenantContext.getTenantId());
        Map<String, Long> result = new HashMap<>();
        for (Map<String, Object> stat : stats) {
            result.put((String) stat.get("entity_type"), ((Number) stat.get("count")).longValue());
        }
        return result;
    }

    @Override
    public Map<String, Long> getRelationTypeStats() {
        List<Map<String, Object>> stats = relationMapper.countByType(TenantContext.getTenantId());
        Map<String, Long> result = new HashMap<>();
        for (Map<String, Object> stat : stats) {
            result.put((String) stat.get("relation_type"), ((Number) stat.get("count")).longValue());
        }
        return result;
    }

    @Override
    public Map<String, Object> getGraphOverview() {
        Map<String, Object> overview = new HashMap<>();
        overview.put("entityTypeStats", getEntityTypeStats());
        overview.put("relationTypeStats", getRelationTypeStats());
        overview.put("totalEntities", getEntityTypeStats().values().stream().mapToLong(Long::longValue).sum());
        overview.put("totalRelations", getRelationTypeStats().values().stream().mapToLong(Long::longValue).sum());
        return overview;
    }

    // ==================== 知识抽取 ====================

    @Override
    public Map<String, Object> extractFromFile(Long fileId) {
        // TODO: 调用AI服务进行实体和关系抽取
        log.info("从文件 {} 抽取知识", fileId);
        Map<String, Object> result = new HashMap<>();
        result.put("entities", new ArrayList<>());
        result.put("relations", new ArrayList<>());
        return result;
    }

    @Override
    public Map<String, Object> extractFromText(String text) {
        // TODO: 调用AI服务进行实体和关系抽取
        log.info("从文本抽取知识，文本长度: {}", text.length());
        Map<String, Object> result = new HashMap<>();
        result.put("entities", new ArrayList<>());
        result.put("relations", new ArrayList<>());
        return result;
    }

    // ==================== 辅助方法 ====================

    private void updateEntityReferenceCount(Long entityId, int delta) {
        KnowledgeEntity entity = entityMapper.selectById(entityId);
        if (entity != null) {
            entity.setReferenceCount(Math.max(0, entity.getReferenceCount() + delta));
            entityMapper.updateById(entity);
        }
    }

    private Map<String, Object> entityToNode(KnowledgeEntity entity) {
        Map<String, Object> node = new HashMap<>();
        node.put("id", entity.getId());
        node.put("name", entity.getName());
        node.put("type", entity.getEntityType());
        node.put("description", entity.getDescription());
        node.put("properties", entity.getProperties());
        node.put("referenceCount", entity.getReferenceCount());
        node.put("isVerified", entity.getIsVerified());
        return node;
    }

    private Map<String, Object> relationToEdge(KnowledgeRelation relation) {
        Map<String, Object> edge = new HashMap<>();
        edge.put("id", relation.getId());
        edge.put("source", relation.getSourceEntityId());
        edge.put("target", relation.getTargetEntityId());
        edge.put("type", relation.getRelationType());
        edge.put("name", relation.getRelationName());
        edge.put("weight", relation.getWeight());
        edge.put("isBidirectional", relation.getIsBidirectional());
        return edge;
    }
}