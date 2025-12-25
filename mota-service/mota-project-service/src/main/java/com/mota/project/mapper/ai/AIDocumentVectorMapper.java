package com.mota.project.mapper.ai;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.ai.AIDocumentVector;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 文档向量Mapper
 */
@Mapper
public interface AIDocumentVectorMapper extends BaseMapper<AIDocumentVector> {

    /**
     * 根据文档ID查询向量
     */
    List<AIDocumentVector> selectByDocumentId(@Param("documentId") Long documentId);

    /**
     * 根据文档ID删除向量
     */
    int deleteByDocumentId(@Param("documentId") Long documentId);

    /**
     * 获取待向量化的文档块
     */
    List<AIDocumentVector> selectPendingVectors(@Param("limit") int limit);

    /**
     * 批量更新向量化状态
     */
    int batchUpdateStatus(
            @Param("ids") List<Long> ids,
            @Param("status") String status
    );

    /**
     * 根据集合名称统计向量数量
     */
    int countByCollectionName(@Param("collectionName") String collectionName);
}