package com.mota.collab.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.collab.entity.DocumentCollaborator;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 文档协作者Mapper
 */
@Mapper
public interface DocumentCollaboratorMapper extends BaseMapper<DocumentCollaborator> {

    /**
     * 查询文档的协作者列表
     */
    @Select("SELECT * FROM document_collaborator WHERE document_id = #{documentId} ORDER BY created_at ASC")
    List<DocumentCollaborator> selectByDocumentId(@Param("documentId") Long documentId);

    /**
     * 查询用户参与协作的文档
     */
    @Select("SELECT * FROM document_collaborator WHERE user_id = #{userId} ORDER BY last_access_at DESC")
    List<DocumentCollaborator> selectByUserId(@Param("userId") Long userId);

    /**
     * 查询用户在文档中的权限
     */
    @Select("SELECT * FROM document_collaborator WHERE document_id = #{documentId} AND user_id = #{userId}")
    DocumentCollaborator selectByDocumentAndUser(@Param("documentId") Long documentId, @Param("userId") Long userId);

    /**
     * 检查用户是否有文档权限
     */
    @Select("SELECT COUNT(*) > 0 FROM document_collaborator WHERE document_id = #{documentId} AND user_id = #{userId}")
    boolean hasAccess(@Param("documentId") Long documentId, @Param("userId") Long userId);

    /**
     * 检查用户是否有编辑权限
     */
    @Select("SELECT COUNT(*) > 0 FROM document_collaborator WHERE document_id = #{documentId} AND user_id = #{userId} AND permission IN ('owner', 'editor')")
    boolean hasEditPermission(@Param("documentId") Long documentId, @Param("userId") Long userId);

    /**
     * 更新最后访问时间
     */
    @Update("UPDATE document_collaborator SET last_access_at = NOW() WHERE document_id = #{documentId} AND user_id = #{userId}")
    int updateLastAccessTime(@Param("documentId") Long documentId, @Param("userId") Long userId);

    /**
     * 统计文档的协作者数量
     */
    @Select("SELECT COUNT(*) FROM document_collaborator WHERE document_id = #{documentId}")
    int countByDocumentId(@Param("documentId") Long documentId);
}