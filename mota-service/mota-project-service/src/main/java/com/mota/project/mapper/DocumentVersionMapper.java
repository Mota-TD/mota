package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.DocumentVersion;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 文档版本Mapper接口
 */
@Mapper
public interface DocumentVersionMapper extends BaseMapper<DocumentVersion> {

    /**
     * 按文档ID获取版本列表
     */
    List<DocumentVersion> selectByDocumentId(@Param("documentId") Long documentId);

    /**
     * 获取文档的最新版本
     */
    DocumentVersion selectLatestVersion(@Param("documentId") Long documentId);

    /**
     * 获取指定版本号的版本
     */
    DocumentVersion selectByVersionNumber(@Param("documentId") Long documentId, 
                                          @Param("versionNumber") Integer versionNumber);

    /**
     * 获取版本历史（分页）
     */
    List<DocumentVersion> selectVersionHistory(@Param("documentId") Long documentId,
                                               @Param("offset") int offset,
                                               @Param("limit") int limit);

    /**
     * 获取版本数量
     */
    Long countByDocumentId(@Param("documentId") Long documentId);

    /**
     * 获取两个版本之间的版本列表
     */
    List<DocumentVersion> selectVersionsBetween(@Param("documentId") Long documentId,
                                                @Param("fromVersion") Integer fromVersion,
                                                @Param("toVersion") Integer toVersion);

    /**
     * 按编辑者获取版本
     */
    List<DocumentVersion> selectByEditorId(@Param("editorId") Long editorId,
                                           @Param("limit") int limit);
}