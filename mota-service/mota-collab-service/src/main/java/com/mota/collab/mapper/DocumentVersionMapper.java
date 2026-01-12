package com.mota.collab.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.collab.entity.DocumentVersion;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 文档版本Mapper
 */
@Mapper
public interface DocumentVersionMapper extends BaseMapper<DocumentVersion> {

    /**
     * 查询文档的版本历史
     */
    @Select("SELECT * FROM document_version WHERE document_id = #{documentId} ORDER BY version_number DESC")
    List<DocumentVersion> selectByDocumentId(@Param("documentId") Long documentId);

    /**
     * 查询文档的最新版本
     */
    @Select("SELECT * FROM document_version WHERE document_id = #{documentId} ORDER BY version_number DESC LIMIT 1")
    DocumentVersion selectLatestVersion(@Param("documentId") Long documentId);

    /**
     * 查询指定版本
     */
    @Select("SELECT * FROM document_version WHERE document_id = #{documentId} AND version_number = #{versionNumber}")
    DocumentVersion selectByVersionNumber(@Param("documentId") Long documentId, @Param("versionNumber") Integer versionNumber);

    /**
     * 查询主要版本列表
     */
    @Select("SELECT * FROM document_version WHERE document_id = #{documentId} AND is_major = 1 ORDER BY version_number DESC")
    List<DocumentVersion> selectMajorVersions(@Param("documentId") Long documentId);

    /**
     * 获取下一个版本号
     */
    @Select("SELECT COALESCE(MAX(version_number), 0) + 1 FROM document_version WHERE document_id = #{documentId}")
    Integer getNextVersionNumber(@Param("documentId") Long documentId);
}