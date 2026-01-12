package com.mota.collab.service.impl;

import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mota.collab.entity.DocumentComment;
import com.mota.collab.mapper.DocumentCommentMapper;
import com.mota.collab.service.DocumentCommentService;
import com.mota.common.core.context.TenantContext;
import com.mota.common.core.context.UserContext;
import com.mota.common.core.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 文档评论服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentCommentServiceImpl implements DocumentCommentService {

    private final DocumentCommentMapper commentMapper;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public DocumentComment createComment(DocumentComment comment) {
        comment.setTenantId(TenantContext.getTenantId());
        comment.setCreatedBy(UserContext.getUserId());
        comment.setStatus("open");
        comment.setIsResolved(false);
        
        if (comment.getCommentType() == null) {
            comment.setCommentType("general");
        }
        
        commentMapper.insert(comment);
        
        log.info("创建评论成功: commentId={}, documentId={}, type={}", 
                comment.getId(), comment.getDocumentId(), comment.getCommentType());
        return comment;
    }

    @Override
    @Transactional
    public DocumentComment createInlineComment(Long documentId, String content, String selectedText, String anchorPosition) {
        DocumentComment comment = new DocumentComment();
        comment.setDocumentId(documentId);
        comment.setContent(content);
        comment.setSelectedText(selectedText);
        comment.setAnchorPosition(anchorPosition);
        comment.setCommentType("inline");
        
        return createComment(comment);
    }

    @Override
    @Transactional
    public DocumentComment createBlockComment(Long documentId, String content, String anchorPosition) {
        DocumentComment comment = new DocumentComment();
        comment.setDocumentId(documentId);
        comment.setContent(content);
        comment.setAnchorPosition(anchorPosition);
        comment.setCommentType("block");
        
        return createComment(comment);
    }

    @Override
    @Transactional
    public DocumentComment replyComment(Long parentId, String content) {
        DocumentComment parentComment = commentMapper.selectById(parentId);
        if (parentComment == null) {
            throw new BusinessException("父评论不存在");
        }
        
        DocumentComment reply = new DocumentComment();
        reply.setDocumentId(parentComment.getDocumentId());
        reply.setParentId(parentId);
        reply.setContent(content);
        reply.setCommentType("general");
        
        return createComment(reply);
    }

    @Override
    @Transactional
    public DocumentComment updateComment(Long commentId, String content) {
        DocumentComment comment = commentMapper.selectById(commentId);
        if (comment == null) {
            throw new BusinessException("评论不存在");
        }
        
        // 只有创建者可以编辑
        if (!comment.getCreatedBy().equals(UserContext.getUserId())) {
            throw new BusinessException("无权编辑此评论");
        }
        
        comment.setContent(content);
        commentMapper.updateById(comment);
        
        log.info("更新评论成功: commentId={}", commentId);
        return comment;
    }

    @Override
    @Transactional
    public void deleteComment(Long commentId) {
        DocumentComment comment = commentMapper.selectById(commentId);
        if (comment == null) {
            throw new BusinessException("评论不存在");
        }
        
        // 只有创建者可以删除
        if (!comment.getCreatedBy().equals(UserContext.getUserId())) {
            throw new BusinessException("无权删除此评论");
        }
        
        commentMapper.deleteById(commentId);
        
        // 同时删除所有回复
        List<DocumentComment> replies = commentMapper.selectReplies(commentId);
        for (DocumentComment reply : replies) {
            commentMapper.deleteById(reply.getId());
        }
        
        log.info("删除评论成功: commentId={}", commentId);
    }

    @Override
    public DocumentComment getById(Long commentId) {
        DocumentComment comment = commentMapper.selectById(commentId);
        if (comment == null) {
            throw new BusinessException("评论不存在");
        }
        return comment;
    }

    @Override
    public List<DocumentComment> listByDocumentId(Long documentId) {
        return commentMapper.selectByDocumentId(documentId);
    }

    @Override
    public List<DocumentComment> listTopLevelComments(Long documentId) {
        return commentMapper.selectTopLevelComments(documentId);
    }

    @Override
    public List<DocumentComment> listReplies(Long parentId) {
        return commentMapper.selectReplies(parentId);
    }

    @Override
    public List<DocumentComment> listUnresolvedComments(Long documentId) {
        return commentMapper.selectUnresolvedComments(documentId);
    }

    @Override
    public List<DocumentComment> listInlineComments(Long documentId) {
        return commentMapper.selectInlineComments(documentId);
    }

    @Override
    @Transactional
    public void resolveComment(Long commentId) {
        commentMapper.resolveComment(commentId, UserContext.getUserId());
        log.info("解决评论: commentId={}", commentId);
    }

    @Override
    @Transactional
    public void reopenComment(Long commentId) {
        LambdaUpdateWrapper<DocumentComment> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(DocumentComment::getId, commentId)
               .set(DocumentComment::getIsResolved, false)
               .set(DocumentComment::getStatus, "open")
               .set(DocumentComment::getResolvedBy, null)
               .set(DocumentComment::getResolvedAt, null);
        commentMapper.update(null, wrapper);
        
        log.info("重新打开评论: commentId={}", commentId);
    }

    @Override
    public int countByDocumentId(Long documentId) {
        return commentMapper.countByDocumentId(documentId);
    }

    @Override
    @Transactional
    public void mentionUsers(Long commentId, List<Long> userIds) {
        DocumentComment comment = commentMapper.selectById(commentId);
        if (comment == null) {
            throw new BusinessException("评论不存在");
        }
        
        try {
            String mentionedUsersJson = objectMapper.writeValueAsString(userIds);
            comment.setMentionedUsers(mentionedUsersJson);
            commentMapper.updateById(comment);
            
            // TODO: 发送通知给被@的用户
            log.info("@提及用户: commentId={}, userIds={}", commentId, userIds);
        } catch (JsonProcessingException e) {
            log.error("序列化@用户列表失败", e);
            throw new BusinessException("操作失败");
        }
    }
}