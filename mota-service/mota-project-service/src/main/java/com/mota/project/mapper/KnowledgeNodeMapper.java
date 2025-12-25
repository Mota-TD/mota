package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.KnowledgeNode;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 知识节点Mapper接口
 */
@Mapper
public interface KnowledgeNodeMapper extends BaseMapper<KnowledgeNode> {

    /**
     * 按类型获取节点列表
     */
    List<KnowledgeNode> selectByNodeType(@Param("nodeType") String nodeType,
                                         @Param("offset") int offset,
                                         @Param("limit") int limit);

    /**
     * 搜索节点
     */
    List<KnowledgeNode> searchNodes(@Param("keyword") String keyword,
                                    @Param("nodeType") String nodeType,
                                    @Param("offset") int offset,
                                    @Param("limit") int limit);

    /**
     * 按关联ID获取节点
     */
    KnowledgeNode selectByRelatedId(@Param("relatedId") Long relatedId,
                                    @Param("relatedType") String relatedType);

    /**
     * 获取热门节点
     */
    List<KnowledgeNode> selectPopularNodes(@Param("limit") int limit);

    /**
     * 获取邻居节点
     */
    List<KnowledgeNode> selectNeighbors(@Param("nodeId") Long nodeId,
                                        @Param("depth") int depth);

    /**
     * 增加引用次数
     */
    int incrementReferenceCount(@Param("id") Long id);

    /**
     * 更新向量嵌入
     */
    int updateEmbeddingVector(@Param("id") Long id,
                              @Param("embeddingVector") String embeddingVector);

    /**
     * 获取节点类型分布
     */
    List<Object> selectNodeTypeDistribution();

    /**
     * 获取节点总数
     */
    Long countNodes();

    /**
     * 按名称查找节点
     */
    KnowledgeNode selectByName(@Param("name") String name);

    /**
     * 批量获取节点
     */
    List<KnowledgeNode> selectByIds(@Param("ids") List<Long> ids);
}