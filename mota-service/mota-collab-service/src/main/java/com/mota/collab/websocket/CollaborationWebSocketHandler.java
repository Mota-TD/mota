package com.mota.collab.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mota.collab.service.CollaborationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 协作WebSocket处理器
 * 处理实时协作的WebSocket连接
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CollaborationWebSocketHandler extends TextWebSocketHandler {

    private final CollaborationService collaborationService;
    private final ObjectMapper objectMapper;

    // 文档ID -> (用户ID -> WebSocket会话)
    private final Map<Long, Map<Long, WebSocketSession>> documentSessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        Long documentId = getDocumentId(session);
        Long userId = getUserId(session);
        
        if (documentId == null || userId == null) {
            session.close(CloseStatus.BAD_DATA);
            return;
        }

        // 注册会话
        documentSessions.computeIfAbsent(documentId, k -> new ConcurrentHashMap<>())
                       .put(userId, session);

        // 加入协作会话
        collaborationService.joinSession(documentId);

        // 广播用户加入消息
        broadcastToDocument(documentId, new CollaborationMessage(
            "user_joined",
            userId,
            null,
            null
        ), userId);

        log.info("用户 {} 加入文档 {} 的协作会话", userId, documentId);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        Long documentId = getDocumentId(session);
        Long userId = getUserId(session);

        if (documentId == null || userId == null) {
            return;
        }

        try {
            CollaborationMessage msg = objectMapper.readValue(message.getPayload(), CollaborationMessage.class);
            msg.setUserId(userId);

            switch (msg.getType()) {
                case "cursor_move":
                    // 更新光标位置
                    collaborationService.updateCursorPosition(documentId, msg.getData());
                    broadcastToDocument(documentId, msg, userId);
                    break;

                case "selection_change":
                    // 更新选区
                    collaborationService.updateSelectionRange(documentId, msg.getData());
                    broadcastToDocument(documentId, msg, userId);
                    break;

                case "content_change":
                    // 内容变更（操作转换）
                    broadcastToDocument(documentId, msg, userId);
                    break;

                case "heartbeat":
                    // 心跳
                    collaborationService.heartbeat(documentId);
                    break;

                default:
                    log.warn("未知的消息类型: {}", msg.getType());
            }
        } catch (Exception e) {
            log.error("处理WebSocket消息失败", e);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        Long documentId = getDocumentId(session);
        Long userId = getUserId(session);

        if (documentId != null && userId != null) {
            // 移除会话
            Map<Long, WebSocketSession> sessions = documentSessions.get(documentId);
            if (sessions != null) {
                sessions.remove(userId);
                if (sessions.isEmpty()) {
                    documentSessions.remove(documentId);
                }
            }

            // 离开协作会话
            collaborationService.leaveSession(documentId);

            // 广播用户离开消息
            broadcastToDocument(documentId, new CollaborationMessage(
                "user_left",
                userId,
                null,
                null
            ), userId);

            log.info("用户 {} 离开文档 {} 的协作会话", userId, documentId);
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.error("WebSocket传输错误", exception);
        session.close(CloseStatus.SERVER_ERROR);
    }

    /**
     * 向文档的所有协作者广播消息
     */
    private void broadcastToDocument(Long documentId, CollaborationMessage message, Long excludeUserId) {
        Map<Long, WebSocketSession> sessions = documentSessions.get(documentId);
        if (sessions == null) {
            return;
        }

        try {
            String payload = objectMapper.writeValueAsString(message);
            TextMessage textMessage = new TextMessage(payload);

            for (Map.Entry<Long, WebSocketSession> entry : sessions.entrySet()) {
                if (!entry.getKey().equals(excludeUserId) && entry.getValue().isOpen()) {
                    try {
                        entry.getValue().sendMessage(textMessage);
                    } catch (IOException e) {
                        log.error("发送WebSocket消息失败", e);
                    }
                }
            }
        } catch (Exception e) {
            log.error("序列化消息失败", e);
        }
    }

    /**
     * 向特定用户发送消息
     */
    public void sendToUser(Long documentId, Long userId, CollaborationMessage message) {
        Map<Long, WebSocketSession> sessions = documentSessions.get(documentId);
        if (sessions == null) {
            return;
        }

        WebSocketSession session = sessions.get(userId);
        if (session != null && session.isOpen()) {
            try {
                String payload = objectMapper.writeValueAsString(message);
                session.sendMessage(new TextMessage(payload));
            } catch (Exception e) {
                log.error("发送WebSocket消息失败", e);
            }
        }
    }

    /**
     * 获取文档的在线用户数
     */
    public int getOnlineUserCount(Long documentId) {
        Map<Long, WebSocketSession> sessions = documentSessions.get(documentId);
        return sessions != null ? sessions.size() : 0;
    }

    private Long getDocumentId(WebSocketSession session) {
        return (Long) session.getAttributes().get("documentId");
    }

    private Long getUserId(WebSocketSession session) {
        return (Long) session.getAttributes().get("userId");
    }

    /**
     * 协作消息
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class CollaborationMessage {
        private String type;
        private Long userId;
        private String data;
        private Long timestamp;
    }
}