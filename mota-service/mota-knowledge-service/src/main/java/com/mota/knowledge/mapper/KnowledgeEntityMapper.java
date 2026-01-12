package com.mota.knowledge.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.knowledge.entity.KnowledgeEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 知识图谱实体Mapper
 */
@Mapper
public interface KnowledgeEntityMapper extends BaseMapper<KnowledgeEntity> {

    /**
     * 按类型查询实体
     */
    @Select("SELECT * FROM knowledge_entity WHERE tenant_id = #{tenantId} AND entity_type = #{entityType} AND deleted = 0")
    List<KnowledgeEntity> selectByType(@Param("tenantId") Long tenantId, @Param("entityType") String entityType);

    /**
     * 按名称模糊查询
     */
    @Select("SELECT * FROM knowledge_entity WHERE tenant_id = #{tenantId} AND name LIKE CONCAT('%', #{keyword}, '%') AND deleted = 0")
    List<KnowledgeEntity> searchByName(@Param("tenantId") Long tenantId, @Param("keyword") String keyword);

    /**
     * 按来源文件查询
     */
    @Select("SELECT * FROM knowledge_entity WHERE source_file_id = #{fileId} AND deleted = 0")
    List<KnowledgeEntity> selectBySourceFile(@Param("fileId") Long fileId);

    /**
     * 获取热门实体（按引用次数）
     */
    @Select("SELECT * FROM knowledge_entity WHERE tenant_id = #{tenantId} AND deleted = 0 ORDER BY reference_count DESC LIMIT #{limit}")
    List<KnowledgeEntity> selectTopEntities(@Param("tenantId") Long tenantId, @Param("limit") Integer limit);

    /**
     * 统计各类型实体数量
     */
    @Select("SELECT entity_type, COUNT(*) as count FROM knowledge_entity WHERE tenant_id = #{tenantId} AND deleted = 0 GROUP BY entity_type")
    List<java.util.Map<String, Object>> countByType(@Param("tenantId") Long tenantId);
}