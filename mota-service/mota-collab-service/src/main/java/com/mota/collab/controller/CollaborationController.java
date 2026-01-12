package com.mota.collab.controller;

import com.mota.collab.entity.CollaborationSession;
import com.mota.collab.entity.DocumentCollaborator;
import com.mota.collab.service.CollaborationService;
import com.mota.common.core.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 协作控制器
 */
@Tag(name = "文档协作管理", description = "协作者管理、实时协作会话等功能")
@RestController
@RequestMapping("/api/v1/documents/{documentId}/collaboration")
@RequiredArgsConstructor
public class CollaborationController {

    private final CollaborationService collaborationService;

    // ==================== 协作者管理 ====================

    @Operation(summary = "添加协作者")
    @PostMapping("/collaborators")
    public Result<DocumentCollaborator> addCollaborator(
            @PathVariable Long documentId,
            @RequestBody AddCollaboratorRequest request) {
        return Result.success(collaborationService.addCollaborator(
            documentId, 
            request.getUserId(), 
            request.getPermission()
        ));
    }

    @Operation(summary = "批量添加协作者")
    @PostMapping("/collaborators/batch")
    public Result<Void> addCollaborators(
            @PathVariable Long documentId,
            @RequestBody BatchAddCollaboratorRequest request) {
        collaborationService.addCollaborators(documentId, request.getUserIds(), request.getPermission());
        return Result.success();
    }

    @Operation(summary = "移除协作者")
    @DeleteMapping("/collaborators/{userId}")
    public Result<Void> removeCollaborator(
            @PathVariable Long documentId,
            @PathVariable Long userId) {
        collaborationService.removeCollaborator(documentId, userId);
        return Result.success();
    }

    @Operation(summary = "更新协作者权限")
    @PutMapping("/collaborators/{userId}")
    public Result<Void> updatePermission(
            @PathVariable Long documentId,
            @PathVariable Long userId,
            @RequestBody UpdatePermissionRequest request) {
        collaborationService.updatePermission(documentId, userId, request.getPermission());
        return Result.success();
    }

    @Operation(summary = "获取文档的所有协作者")
    @GetMapping("/collaborators")
    public Result<List<DocumentCollaborator>> listCollaborators(@PathVariable Long documentId) {
        return Result.success(collaborationService.listCollaborators(documentId));
    }

    @Operation(summary = "获取协作者详情")
    @GetMapping("/collaborators/{userId}")
    public Result<DocumentCollaborator> getCollaborator(
            @PathVariable Long documentId,
            @PathVariable Long userId) {
        return Result.success(collaborationService.getCollaborator(documentId, userId));
    }

    @Operation(summary = "检查用户是否为协作者")
    @GetMapping("/collaborators/{userId}/check")
    public Result<Boolean> isCollaborator(
            @PathVariable Long documentId,
            @PathVariable Long userId) {
        return Result.success(collaborationService.isCollaborator(documentId, userId));
    }

    @Operation(summary = "检查用户是否有编辑权限")
    @GetMapping("/collaborators/{userId}/can-edit")
    public Result<Boolean> canEdit(
            @PathVariable Long documentId,
            @PathVariable Long userId) {
        return Result.success(collaborationService.canEdit(documentId, userId));
    }

    @Operation(summary = "检查用户是否有评论权限")
    @GetMapping("/collaborators/{userId}/can-comment")
    public Result<Boolean> canComment(
            @PathVariable Long documentId,
            @PathVariable Long userId) {
        return Result.success(collaborationService.canComment(documentId, userId));
    }

    @Operation(summary = "转让所有权")
    @PostMapping("/transfer-ownership")
    public Result<Void> transferOwnership(
            @PathVariable Long documentId,
            @RequestBody TransferOwnershipRequest request) {
        collaborationService.transferOwnership(documentId, request.getNewOwnerId());
        return Result.success();
    }

    // ==================== 实时协作会话 ====================

    @Operation(summary = "加入协作会话")
    @PostMapping("/sessions/join")
    public Result<CollaborationSession> joinSession(@PathVariable Long documentId) {
        return Result.success(collaborationService.joinSession(documentId));
    }

    @Operation(summary = "离开协作会话")
    @PostMapping("/sessions/leave")
    public Result<Void> leaveSession(@PathVariable Long documentId) {
        collaborationService.leaveSession(documentId);
        return Result.success();
    }

    @Operation(summary = "更新光标位置")
    @PutMapping("/sessions/cursor")
    public Result<Void> updateCursor(
            @PathVariable Long documentId,
            @RequestBody UpdateCursorRequest request) {
        collaborationService.updateCursorPosition(documentId, request.getCursorPosition());
        return Result.success();
    }

    @Operation(summary = "更新选区范围")
    @PutMapping("/sessions/selection")
    public Result<Void> updateSelection(
            @PathVariable Long documentId,
            @RequestBody UpdateSelectionRequest request) {
        collaborationService.updateSelectionRange(documentId, request.getSelectionRange());
        return Result.success();
    }

    @Operation(summary = "获取活跃会话")
    @GetMapping("/sessions/active")
    public Result<List<CollaborationSession>> listActiveSessions(@PathVariable Long documentId) {
        return Result.success(collaborationService.listActiveSessions(documentId));
    }

    @Operation(summary = "获取在线用户数")
    @GetMapping("/sessions/online-count")
    public Result<Integer> countOnlineUsers(@PathVariable Long documentId) {
        return Result.success(collaborationService.countOnlineUsers(documentId));
    }

    @Operation(summary = "发送心跳")
    @PostMapping("/sessions/heartbeat")
    public Result<Void> heartbeat(@PathVariable Long documentId) {
        collaborationService.heartbeat(documentId);
        return Result.success();
    }

    // ==================== 请求对象 ====================

    @lombok.Data
    public static class AddCollaboratorRequest {
        private Long userId;
        private String permission;
    }

    @lombok.Data
    public static class BatchAddCollaboratorRequest {
        private List<Long> userIds;
        private String permission;
    }

    @lombok.Data
    public static class UpdatePermissionRequest {
        private String permission;
    }

    @lombok.Data
    public static class TransferOwnershipRequest {
        private Long newOwnerId;
    }

    @lombok.Data
    public static class UpdateCursorRequest {
        private String cursorPosition;
    }

    @lombok.Data
    public static class UpdateSelectionRequest {
        private String selectionRange;
    }
}