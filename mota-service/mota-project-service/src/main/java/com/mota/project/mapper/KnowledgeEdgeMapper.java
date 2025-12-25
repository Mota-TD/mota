package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.KnowledgeEdge;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 知识边Mapper接口
 */
@Mapper
public interface KnowledgeEdgeMapper extends BaseMapper<KnowledgeEdge> {

    /**
     * 获取节点的出边
     */
    List<KnowledgeEdge> selectOutEdges(@Param("nodeId") Long nodeId);

    /**
     * 获取节点的入边
     */
    List<KnowledgeEdge> selectInEdges(@Param("nodeId") Long nodeId);

    /**
     * 获取两个节点之间的边
     */
    List<KnowledgeEdge> selectEdgesBetween(@Param("sourceNodeId") Long sourceNodeId,
                                           @Param("targetNodeId") Long targetNodeId);

    /**
     * 按关系类型获取边
     */
    List<KnowledgeEdge> selectByRelationType(@Param("relationType") String relationType,
                                             @Param("offset") int offset,
                                             @Param("limit") int limit);

    /**
     * 删除节点相关的所有边
     */
    int deleteByNodeId(@Param("nodeId") Long nodeId);

    /**
     * 获取关系类型分布
     */
    List<Object> selectRelationTypeDistribution();

    /**
     * 获取边总数
     */
    Long countEdges();

    /**
     * 检查边是否存在
     */
    boolean existsEdge(@Param("sourceNodeId") Long sourceNodeId,
                       @Param("targetNodeId") Long targetNodeId,
                       @Param("relationType") String relationType);

    /**
     * 更新边权重
     */
    int updateWeight(@Param("id") Long id, @Param("weight") Double weight);

    /**
     * 获取高权重边
     */
    List<KnowledgeEdge> selectHighWeightEdges(@Param("minWeight") Double minWeight,
                                              @Param("limit") int limit);
}