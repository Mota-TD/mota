package com.mota.collab.controller;

import com.mota.collab.entity.DocumentComment;
import com.mota.collab.service.DocumentCommentService;
import com.mota.common.core.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 文档评论控制器
 */
@Tag(name = "文档评论管理", description = "评论、回复、@提及等功能")
@RestController
@RequestMapping("/api/v1/documents/{documentId}/comments")
@RequiredArgsConstructor
public class DocumentCommentController {

    private final DocumentCommentService commentService;

    @Operation(summary = "创建评论")
    @PostMapping
    public Result<DocumentComment> createComment(
            @PathVariable Long documentId,
            @RequestBody DocumentComment comment) {
        comment.setDocumentId(documentId);
        return Result.success(commentService.createComment(comment));
    }

    @Operation(summary = "创建行内评论")
    @PostMapping("/inline")
    public Result<DocumentComment> createInlineComment(
            @PathVariable Long documentId,
            @RequestBody InlineCommentRequest request) {
        return Result.success(commentService.createInlineComment(
            documentId, 
            request.getContent(), 
            request.getSelectedText(), 
            request.getAnchorPosition()
        ));
    }

    @Operation(summary = "创建区域批注")
    @PostMapping("/block")
    public Result<DocumentComment> createBlockComment(
            @PathVariable Long documentId,
            @RequestBody BlockCommentRequest request) {
        return Result.success(commentService.createBlockComment(
            documentId, 
            request.getContent(), 
            request.getAnchorPosition()
        ));
    }

    @Operation(summary = "回复评论")
    @PostMapping("/{parentId}/reply")
    public Result<DocumentComment> replyComment(
            @PathVariable Long parentId,
            @RequestBody ReplyRequest request) {
        return Result.success(commentService.replyComment(parentId, request.getContent()));
    }

    @Operation(summary = "更新评论")
    @PutMapping("/{commentId}")
    public Result<DocumentComment> updateComment(
            @PathVariable Long commentId,
            @RequestBody UpdateCommentRequest request) {
        return Result.success(commentService.updateComment(commentId, request.getContent()));
    }

    @Operation(summary = "删除评论")
    @DeleteMapping("/{commentId}")
    public Result<Void> deleteComment(@PathVariable Long commentId) {
        commentService.deleteComment(commentId);
        return Result.success();
    }

    @Operation(summary = "获取评论详情")
    @GetMapping("/{commentId}")
    public Result<DocumentComment> getComment(@PathVariable Long commentId) {
        return Result.success(commentService.getById(commentId));
    }

    @Operation(summary = "获取文档的所有评论")
    @GetMapping
    public Result<List<DocumentComment>> listComments(@PathVariable Long documentId) {
        return Result.success(commentService.listByDocumentId(documentId));
    }

    @Operation(summary = "获取顶级评论")
    @GetMapping("/top-level")
    public Result<List<DocumentComment>> listTopLevelComments(@PathVariable Long documentId) {
        return Result.success(commentService.listTopLevelComments(documentId));
    }

    @Operation(summary = "获取评论的回复")
    @GetMapping("/{parentId}/replies")
    public Result<List<DocumentComment>> listReplies(@PathVariable Long parentId) {
        return Result.success(commentService.listReplies(parentId));
    }

    @Operation(summary = "获取未解决的评论")
    @GetMapping("/unresolved")
    public Result<List<DocumentComment>> listUnresolvedComments(@PathVariable Long documentId) {
        return Result.success(commentService.listUnresolvedComments(documentId));
    }

    @Operation(summary = "获取行内评论")
    @GetMapping("/inline")
    public Result<List<DocumentComment>> listInlineComments(@PathVariable Long documentId) {
        return Result.success(commentService.listInlineComments(documentId));
    }

    @Operation(summary = "解决评论")
    @PostMapping("/{commentId}/resolve")
    public Result<Void> resolveComment(@PathVariable Long commentId) {
        commentService.resolveComment(commentId);
        return Result.success();
    }

    @Operation(summary = "重新打开评论")
    @PostMapping("/{commentId}/reopen")
    public Result<Void> reopenComment(@PathVariable Long commentId) {
        commentService.reopenComment(commentId);
        return Result.success();
    }

    @Operation(summary = "统计评论数量")
    @GetMapping("/count")
    public Result<Integer> countComments(@PathVariable Long documentId) {
        return Result.success(commentService.countByDocumentId(documentId));
    }

    @Operation(summary = "@提及用户")
    @PostMapping("/{commentId}/mention")
    public Result<Void> mentionUsers(
            @PathVariable Long commentId,
            @RequestBody List<Long> userIds) {
        commentService.mentionUsers(commentId, userIds);
        return Result.success();
    }

    /**
     * 行内评论请求
     */
    @lombok.Data
    public static class InlineCommentRequest {
        private String content;
        private String selectedText;
        private String anchorPosition;
    }

    /**
     * 区域批注请求
     */
    @lombok.Data
    public static class BlockCommentRequest {
        private String content;
        private String anchorPosition;
    }

    /**
     * 回复请求
     */
    @lombok.Data
    public static class ReplyRequest {
        private String content;
    }

    /**
     * 更新评论请求
     */
    @lombok.Data
    public static class UpdateCommentRequest {
        private String content;
    }
}