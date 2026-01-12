package com.mota.knowledge.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.knowledge.entity.KnowledgeRelation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 知识图谱关系Mapper
 */
@Mapper
public interface KnowledgeRelationMapper extends BaseMapper<KnowledgeRelation> {

    /**
     * 获取实体的所有关系（作为源）
     */
    @Select("SELECT r.*, se.name as source_entity_name, te.name as target_entity_name " +
            "FROM knowledge_relation r " +
            "LEFT JOIN knowledge_entity se ON r.source_entity_id = se.id " +
            "LEFT JOIN knowledge_entity te ON r.target_entity_id = te.id " +
            "WHERE r.source_entity_id = #{entityId} AND r.deleted = 0")
    List<KnowledgeRelation> selectBySourceEntity(@Param("entityId") Long entityId);

    /**
     * 获取实体的所有关系（作为目标）
     */
    @Select("SELECT r.*, se.name as source_entity_name, te.name as target_entity_name " +
            "FROM knowledge_relation r " +
            "LEFT JOIN knowledge_entity se ON r.source_entity_id = se.id " +
            "LEFT JOIN knowledge_entity te ON r.target_entity_id = te.id " +
            "WHERE r.target_entity_id = #{entityId} AND r.deleted = 0")
    List<KnowledgeRelation> selectByTargetEntity(@Param("entityId") Long entityId);

    /**
     * 获取实体的所有关系（双向）
     */
    @Select("SELECT r.*, se.name as source_entity_name, te.name as target_entity_name " +
            "FROM knowledge_relation r " +
            "LEFT JOIN knowledge_entity se ON r.source_entity_id = se.id " +
            "LEFT JOIN knowledge_entity te ON r.target_entity_id = te.id " +
            "WHERE (r.source_entity_id = #{entityId} OR r.target_entity_id = #{entityId}) AND r.deleted = 0")
    List<KnowledgeRelation> selectByEntity(@Param("entityId") Long entityId);

    /**
     * 获取两个实体之间的关系
     */
    @Select("SELECT * FROM knowledge_relation WHERE " +
            "((source_entity_id = #{entityId1} AND target_entity_id = #{entityId2}) OR " +
            "(source_entity_id = #{entityId2} AND target_entity_id = #{entityId1})) AND deleted = 0")
    List<KnowledgeRelation> selectBetweenEntities(@Param("entityId1") Long entityId1, @Param("entityId2") Long entityId2);

    /**
     * 按关系类型查询
     */
    @Select("SELECT r.*, se.name as source_entity_name, te.name as target_entity_name " +
            "FROM knowledge_relation r " +
            "LEFT JOIN knowledge_entity se ON r.source_entity_id = se.id " +
            "LEFT JOIN knowledge_entity te ON r.target_entity_id = te.id " +
            "WHERE r.tenant_id = #{tenantId} AND r.relation_type = #{relationType} AND r.deleted = 0")
    List<KnowledgeRelation> selectByType(@Param("tenantId") Long tenantId, @Param("relationType") String relationType);

    /**
     * 获取图谱数据（用于可视化）
     */
    @Select("SELECT r.*, se.name as source_entity_name, te.name as target_entity_name " +
            "FROM knowledge_relation r " +
            "LEFT JOIN knowledge_entity se ON r.source_entity_id = se.id " +
            "LEFT JOIN knowledge_entity te ON r.target_entity_id = te.id " +
            "WHERE r.tenant_id = #{tenantId} AND r.deleted = 0 LIMIT #{limit}")
    List<KnowledgeRelation> selectGraphData(@Param("tenantId") Long tenantId, @Param("limit") Integer limit);

    /**
     * 统计各类型关系数量
     */
    @Select("SELECT relation_type, COUNT(*) as count FROM knowledge_relation WHERE tenant_id = #{tenantId} AND deleted = 0 GROUP BY relation_type")
    List<java.util.Map<String, Object>> countByType(@Param("tenantId") Long tenantId);
}