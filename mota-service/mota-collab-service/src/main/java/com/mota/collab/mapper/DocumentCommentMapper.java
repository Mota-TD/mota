package com.mota.collab.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.collab.entity.DocumentComment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 文档评论Mapper
 */
@Mapper
public interface DocumentCommentMapper extends BaseMapper<DocumentComment> {

    /**
     * 查询文档的评论列表
     */
    @Select("SELECT * FROM document_comment WHERE document_id = #{documentId} AND deleted = 0 ORDER BY created_at ASC")
    List<DocumentComment> selectByDocumentId(@Param("documentId") Long documentId);

    /**
     * 查询文档的顶级评论（非回复）
     */
    @Select("SELECT * FROM document_comment WHERE document_id = #{documentId} AND parent_id IS NULL AND deleted = 0 ORDER BY created_at ASC")
    List<DocumentComment> selectTopLevelComments(@Param("documentId") Long documentId);

    /**
     * 查询评论的回复
     */
    @Select("SELECT * FROM document_comment WHERE parent_id = #{parentId} AND deleted = 0 ORDER BY created_at ASC")
    List<DocumentComment> selectReplies(@Param("parentId") Long parentId);

    /**
     * 查询未解决的评论
     */
    @Select("SELECT * FROM document_comment WHERE document_id = #{documentId} AND is_resolved = 0 AND deleted = 0 ORDER BY created_at ASC")
    List<DocumentComment> selectUnresolvedComments(@Param("documentId") Long documentId);

    /**
     * 查询行内评论
     */
    @Select("SELECT * FROM document_comment WHERE document_id = #{documentId} AND comment_type = 'inline' AND deleted = 0 ORDER BY created_at ASC")
    List<DocumentComment> selectInlineComments(@Param("documentId") Long documentId);

    /**
     * 统计文档的评论数量
     */
    @Select("SELECT COUNT(*) FROM document_comment WHERE document_id = #{documentId} AND deleted = 0")
    int countByDocumentId(@Param("documentId") Long documentId);

    /**
     * 解决评论
     */
    @Update("UPDATE document_comment SET is_resolved = 1, status = 'resolved', resolved_by = #{resolvedBy}, resolved_at = NOW() WHERE id = #{commentId}")
    int resolveComment(@Param("commentId") Long commentId, @Param("resolvedBy") Long resolvedBy);
}