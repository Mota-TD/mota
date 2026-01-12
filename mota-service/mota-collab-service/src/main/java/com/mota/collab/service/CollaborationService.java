package com.mota.collab.service;

import com.mota.collab.entity.CollaborationSession;
import com.mota.collab.entity.DocumentCollaborator;

import java.util.List;

/**
 * 协作服务接口
 */
public interface CollaborationService {

    // ==================== 协作者管理 ====================

    /**
     * 添加协作者
     */
    DocumentCollaborator addCollaborator(Long documentId, Long userId, String permission);

    /**
     * 批量添加协作者
     */
    void addCollaborators(Long documentId, List<Long> userIds, String permission);

    /**
     * 获取协作者
     */
    DocumentCollaborator getCollaborator(Long documentId, Long userId);

    /**
     * 检查用户是否为协作者
     */
    boolean isCollaborator(Long documentId, Long userId);

    /**
     * 检查用户是否有编辑权限
     */
    boolean canEdit(Long documentId, Long userId);

    /**
     * 检查用户是否有评论权限
     */
    boolean canComment(Long documentId, Long userId);

    /**
     * 转让所有权
     */
    void transferOwnership(Long documentId, Long newOwnerId);

    /**
     * 移除协作者
     */
    void removeCollaborator(Long documentId, Long userId);

    /**
     * 更新协作者权限
     */
    DocumentCollaborator updatePermission(Long documentId, Long userId, String permission);

    /**
     * 获取文档的协作者列表
     */
    List<DocumentCollaborator> listCollaborators(Long documentId);

    /**
     * 获取用户参与协作的文档
     */
    List<DocumentCollaborator> listUserCollaborations(Long userId);

    /**
     * 检查用户是否有访问权限
     */
    boolean hasAccess(Long documentId, Long userId);

    /**
     * 检查用户是否有编辑权限
     */
    boolean hasEditPermission(Long documentId, Long userId);

    /**
     * 更新最后访问时间
     */
    void updateLastAccessTime(Long documentId, Long userId);

    // ==================== 实时协作会话 ====================

    /**
     * 加入协作会话（完整参数）
     */
    CollaborationSession joinSession(Long documentId, Long userId, String sessionId, String userName, String userAvatar);

    /**
     * 加入协作会话（简化版，使用当前用户）
     */
    CollaborationSession joinSession(Long documentId);

    /**
     * 离开协作会话（通过sessionId）
     */
    void leaveSession(String sessionId);

    /**
     * 离开协作会话（通过documentId，使用当前用户）
     */
    void leaveSession(Long documentId);

    /**
     * 获取文档的活跃会话
     */
    List<CollaborationSession> getActiveSessions(Long documentId);

    /**
     * 获取活跃会话列表（别名）
     */
    List<CollaborationSession> listActiveSessions(Long documentId);

    /**
     * 获取文档的在线用户数
     */
    int getOnlineUserCount(Long documentId);

    /**
     * 获取在线用户数（别名）
     */
    int countOnlineUsers(Long documentId);

    /**
     * 更新光标位置（通过sessionId）
     */
    void updateCursorPosition(String sessionId, String cursorPosition);

    /**
     * 更新光标位置（通过documentId，使用当前用户）
     */
    void updateCursorPosition(Long documentId, String cursorPosition);

    /**
     * 更新选区范围（通过sessionId）
     */
    void updateSelectionRange(String sessionId, String selectionRange);

    /**
     * 更新选区范围（通过documentId，使用当前用户）
     */
    void updateSelectionRange(Long documentId, String selectionRange);

    /**
     * 心跳
     */
    void heartbeat(Long documentId);

    /**
     * 清理过期会话
     */
    void cleanupExpiredSessions();

    // ==================== 协作操作 ====================

    /**
     * 广播文档变更
     */
    void broadcastDocumentChange(Long documentId, String operation, String data);

    /**
     * 广播光标位置
     */
    void broadcastCursorPosition(Long documentId, String sessionId, String cursorPosition);

    /**
     * 广播选区变更
     */
    void broadcastSelectionChange(Long documentId, String sessionId, String selectionRange);

    /**
     * 处理协作冲突
     */
    String resolveConflict(Long documentId, String baseContent, String localContent, String remoteContent);
}