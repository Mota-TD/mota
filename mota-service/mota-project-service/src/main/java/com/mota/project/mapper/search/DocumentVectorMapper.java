package com.mota.project.mapper.search;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.search.DocumentVector;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * 文档向量Mapper
 */
@Mapper
public interface DocumentVectorMapper extends BaseMapper<DocumentVector> {
    
    /**
     * 根据文档ID查询向量
     */
    @Select("SELECT * FROM document_vector WHERE document_id = #{documentId}")
    List<DocumentVector> findByDocumentId(@Param("documentId") Long documentId);
    
    /**
     * 根据文档类型查询向量
     */
    @Select("SELECT * FROM document_vector WHERE document_type = #{documentType} LIMIT #{limit}")
    List<DocumentVector> findByDocumentType(@Param("documentType") String documentType, @Param("limit") int limit);
    
    /**
     * 查询相似向量（模拟，实际应使用向量数据库）
     */
    @Select("SELECT * FROM document_vector ORDER BY id DESC LIMIT #{topK}")
    List<DocumentVector> findSimilarVectors(@Param("topK") int topK);
    
    /**
     * 删除文档向量
     */
    @Delete("DELETE FROM document_vector WHERE document_id = #{documentId}")
    void deleteByDocumentId(@Param("documentId") Long documentId);
}