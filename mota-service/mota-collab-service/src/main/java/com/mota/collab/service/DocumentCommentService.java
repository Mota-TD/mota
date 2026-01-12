package com.mota.collab.service;

import com.mota.collab.entity.DocumentComment;

import java.util.List;

/**
 * 文档评论服务接口
 */
public interface DocumentCommentService {

    /**
     * 创建评论
     */
    DocumentComment createComment(DocumentComment comment);

    /**
     * 创建行内评论
     */
    DocumentComment createInlineComment(Long documentId, String content, String selectedText, String anchorPosition);

    /**
     * 创建区域批注
     */
    DocumentComment createBlockComment(Long documentId, String content, String anchorPosition);

    /**
     * 回复评论
     */
    DocumentComment replyComment(Long parentId, String content);

    /**
     * 更新评论
     */
    DocumentComment updateComment(Long commentId, String content);

    /**
     * 删除评论
     */
    void deleteComment(Long commentId);

    /**
     * 获取评论详情
     */
    DocumentComment getById(Long commentId);

    /**
     * 获取文档的所有评论
     */
    List<DocumentComment> listByDocumentId(Long documentId);

    /**
     * 获取文档的顶级评论
     */
    List<DocumentComment> listTopLevelComments(Long documentId);

    /**
     * 获取评论的回复
     */
    List<DocumentComment> listReplies(Long parentId);

    /**
     * 获取未解决的评论
     */
    List<DocumentComment> listUnresolvedComments(Long documentId);

    /**
     * 获取行内评论
     */
    List<DocumentComment> listInlineComments(Long documentId);

    /**
     * 解决评论
     */
    void resolveComment(Long commentId);

    /**
     * 重新打开评论
     */
    void reopenComment(Long commentId);

    /**
     * 统计文档的评论数量
     */
    int countByDocumentId(Long documentId);

    /**
     * @提及用户
     */
    void mentionUsers(Long commentId, List<Long> userIds);
}