package com.mota.collab.service.impl;

import com.mota.collab.entity.CollaborationSession;
import com.mota.collab.entity.DocumentCollaborator;
import com.mota.collab.mapper.CollaborationSessionMapper;
import com.mota.collab.mapper.DocumentCollaboratorMapper;
import com.mota.collab.service.CollaborationService;
import com.mota.common.core.context.TenantContext;
import com.mota.common.core.context.UserContext;
import com.mota.common.core.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

/**
 * 协作服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CollaborationServiceImpl implements CollaborationService {

    private final DocumentCollaboratorMapper collaboratorMapper;
    private final CollaborationSessionMapper sessionMapper;

    // 用户颜色池
    private static final String[] USER_COLORS = {
        "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
        "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"
    };

    // ==================== 协作者管理 ====================

    @Override
    @Transactional
    public void addCollaborators(Long documentId, List<Long> userIds, String permission) {
        for (Long userId : userIds) {
            try {
                addCollaborator(documentId, userId, permission);
            } catch (BusinessException e) {
                log.warn("添加协作者失败: documentId={}, userId={}, error={}", documentId, userId, e.getMessage());
            }
        }
    }

    @Override
    public DocumentCollaborator getCollaborator(Long documentId, Long userId) {
        return collaboratorMapper.selectByDocumentAndUser(documentId, userId);
    }

    @Override
    public boolean isCollaborator(Long documentId, Long userId) {
        return collaboratorMapper.selectByDocumentAndUser(documentId, userId) != null;
    }

    @Override
    public boolean canEdit(Long documentId, Long userId) {
        return hasEditPermission(documentId, userId);
    }

    @Override
    public boolean canComment(Long documentId, Long userId) {
        DocumentCollaborator collaborator = collaboratorMapper.selectByDocumentAndUser(documentId, userId);
        if (collaborator == null) {
            return false;
        }
        String permission = collaborator.getPermission();
        return "owner".equals(permission) || "editor".equals(permission) || "commenter".equals(permission);
    }

    @Override
    @Transactional
    public void transferOwnership(Long documentId, Long newOwnerId) {
        // 获取当前所有者
        List<DocumentCollaborator> collaborators = listCollaborators(documentId);
        DocumentCollaborator currentOwner = collaborators.stream()
                .filter(c -> "owner".equals(c.getPermission()))
                .findFirst()
                .orElseThrow(() -> new BusinessException("文档所有者不存在"));
        
        // 检查新所有者是否为协作者
        DocumentCollaborator newOwner = collaboratorMapper.selectByDocumentAndUser(documentId, newOwnerId);
        if (newOwner == null) {
            throw new BusinessException("新所有者必须是文档协作者");
        }
        
        // 更新权限
        currentOwner.setPermission("editor");
        collaboratorMapper.updateById(currentOwner);
        
        newOwner.setPermission("owner");
        collaboratorMapper.updateById(newOwner);
        
        log.info("转让文档所有权: documentId={}, from={}, to={}", documentId, currentOwner.getUserId(), newOwnerId);
    }

    @Override
    @Transactional
    public DocumentCollaborator addCollaborator(Long documentId, Long userId, String permission) {
        // 检查是否已存在
        DocumentCollaborator existing = collaboratorMapper.selectByDocumentAndUser(documentId, userId);
        if (existing != null) {
            throw new BusinessException("用户已是协作者");
        }
        
        DocumentCollaborator collaborator = new DocumentCollaborator();
        collaborator.setTenantId(TenantContext.getTenantId());
        collaborator.setDocumentId(documentId);
        collaborator.setUserId(userId);
        collaborator.setPermission(permission);
        collaborator.setCanShare(!"viewer".equals(permission));
        collaborator.setCanExport(true);
        collaborator.setCanPrint(true);
        collaborator.setInvitedBy(UserContext.getUserId());
        collaborator.setInvitedAt(LocalDateTime.now());
        
        collaboratorMapper.insert(collaborator);
        
        log.info("添加协作者: documentId={}, userId={}, permission={}", documentId, userId, permission);
        return collaborator;
    }

    @Override
    @Transactional
    public void removeCollaborator(Long documentId, Long userId) {
        DocumentCollaborator collaborator = collaboratorMapper.selectByDocumentAndUser(documentId, userId);
        if (collaborator == null) {
            throw new BusinessException("协作者不存在");
        }
        
        // 不能移除所有者
        if ("owner".equals(collaborator.getPermission())) {
            throw new BusinessException("不能移除文档所有者");
        }
        
        collaboratorMapper.deleteById(collaborator.getId());
        
        // 同时移除该用户的协作会话
        sessionMapper.deleteByDocumentAndUser(documentId, userId);
        
        log.info("移除协作者: documentId={}, userId={}", documentId, userId);
    }

    @Override
    @Transactional
    public DocumentCollaborator updatePermission(Long documentId, Long userId, String permission) {
        DocumentCollaborator collaborator = collaboratorMapper.selectByDocumentAndUser(documentId, userId);
        if (collaborator == null) {
            throw new BusinessException("协作者不存在");
        }
        
        // 不能修改所有者权限
        if ("owner".equals(collaborator.getPermission())) {
            throw new BusinessException("不能修改文档所有者权限");
        }
        
        collaborator.setPermission(permission);
        collaborator.setCanShare(!"viewer".equals(permission));
        collaboratorMapper.updateById(collaborator);
        
        log.info("更新协作者权限: documentId={}, userId={}, permission={}", documentId, userId, permission);
        return collaborator;
    }

    @Override
    public List<DocumentCollaborator> listCollaborators(Long documentId) {
        return collaboratorMapper.selectByDocumentId(documentId);
    }

    @Override
    public List<DocumentCollaborator> listUserCollaborations(Long userId) {
        return collaboratorMapper.selectByUserId(userId);
    }

    @Override
    public boolean hasAccess(Long documentId, Long userId) {
        return collaboratorMapper.hasAccess(documentId, userId);
    }

    @Override
    public boolean hasEditPermission(Long documentId, Long userId) {
        return collaboratorMapper.hasEditPermission(documentId, userId);
    }

    @Override
    public void updateLastAccessTime(Long documentId, Long userId) {
        collaboratorMapper.updateLastAccessTime(documentId, userId);
    }

    // ==================== 实时协作会话 ====================

    @Override
    @Transactional
    public CollaborationSession joinSession(Long documentId) {
        Long userId = UserContext.getUserId();
        String sessionId = java.util.UUID.randomUUID().toString();
        String userName = "User-" + userId; // 简化处理，实际应从用户服务获取
        String userAvatar = null;
        return joinSession(documentId, userId, sessionId, userName, userAvatar);
    }

    @Override
    @Transactional
    public CollaborationSession joinSession(Long documentId, Long userId, String sessionId,
                                            String userName, String userAvatar) {
        CollaborationSession session = new CollaborationSession();
        session.setTenantId(TenantContext.getTenantId());
        session.setDocumentId(documentId);
        session.setUserId(userId);
        session.setSessionId(sessionId);
        session.setUserName(userName);
        session.setUserAvatar(userAvatar);
        session.setUserColor(getRandomColor());
        session.setStatus("active");
        session.setJoinedAt(LocalDateTime.now());
        session.setLastActiveAt(LocalDateTime.now());
        
        sessionMapper.insert(session);
        
        log.info("用户加入协作会话: documentId={}, userId={}, sessionId={}", documentId, userId, sessionId);
        return session;
    }

    @Override
    @Transactional
    public void leaveSession(String sessionId) {
        sessionMapper.updateSessionStatus(sessionId, "disconnected");
        log.info("用户离开协作会话: sessionId={}", sessionId);
    }

    @Override
    @Transactional
    public void leaveSession(Long documentId) {
        Long userId = UserContext.getUserId();
        sessionMapper.deleteByDocumentAndUser(documentId, userId);
        log.info("用户离开协作会话: documentId={}, userId={}", documentId, userId);
    }

    @Override
    public List<CollaborationSession> getActiveSessions(Long documentId) {
        return sessionMapper.selectActiveSessionsByDocument(documentId);
    }

    @Override
    public List<CollaborationSession> listActiveSessions(Long documentId) {
        return getActiveSessions(documentId);
    }

    @Override
    public int getOnlineUserCount(Long documentId) {
        return sessionMapper.countOnlineUsers(documentId);
    }

    @Override
    public int countOnlineUsers(Long documentId) {
        return getOnlineUserCount(documentId);
    }

    @Override
    public void updateCursorPosition(String sessionId, String cursorPosition) {
        sessionMapper.updateCursorPosition(sessionId, cursorPosition);
    }

    @Override
    public void updateCursorPosition(Long documentId, String cursorPosition) {
        Long userId = UserContext.getUserId();
        CollaborationSession session = sessionMapper.selectByDocumentAndUser(documentId, userId);
        if (session != null) {
            sessionMapper.updateCursorPosition(session.getSessionId(), cursorPosition);
        }
    }

    @Override
    public void updateSelectionRange(String sessionId, String selectionRange) {
        sessionMapper.updateSelectionRange(sessionId, selectionRange);
    }

    @Override
    public void updateSelectionRange(Long documentId, String selectionRange) {
        Long userId = UserContext.getUserId();
        CollaborationSession session = sessionMapper.selectByDocumentAndUser(documentId, userId);
        if (session != null) {
            sessionMapper.updateSelectionRange(session.getSessionId(), selectionRange);
        }
    }

    @Override
    public void heartbeat(Long documentId) {
        Long userId = UserContext.getUserId();
        CollaborationSession session = sessionMapper.selectByDocumentAndUser(documentId, userId);
        if (session != null) {
            sessionMapper.updateLastActiveTime(session.getSessionId());
        }
    }

    @Override
    @Scheduled(fixedRate = 60000) // 每分钟执行一次
    @Transactional
    public void cleanupExpiredSessions() {
        int cleaned = sessionMapper.cleanupExpiredSessions();
        if (cleaned > 0) {
            log.info("清理过期协作会话: count={}", cleaned);
        }
    }

    // ==================== 协作操作 ====================

    @Override
    public void broadcastDocumentChange(Long documentId, String operation, String data) {
        // TODO: 通过WebSocket广播文档变更
        log.debug("广播文档变更: documentId={}, operation={}", documentId, operation);
    }

    @Override
    public void broadcastCursorPosition(Long documentId, String sessionId, String cursorPosition) {
        // TODO: 通过WebSocket广播光标位置
        log.debug("广播光标位置: documentId={}, sessionId={}", documentId, sessionId);
    }

    @Override
    public void broadcastSelectionChange(Long documentId, String sessionId, String selectionRange) {
        // TODO: 通过WebSocket广播选区变更
        log.debug("广播选区变更: documentId={}, sessionId={}", documentId, sessionId);
    }

    @Override
    public String resolveConflict(Long documentId, String baseContent, String localContent, String remoteContent) {
        // 简单的冲突解决策略：使用远程内容
        // TODO: 实现更复杂的CRDT或OT算法
        log.info("解决协作冲突: documentId={}", documentId);
        return remoteContent;
    }

    /**
     * 获取随机用户颜色
     */
    private String getRandomColor() {
        Random random = new Random();
        return USER_COLORS[random.nextInt(USER_COLORS.length)];
    }
}