package com.mota.collab.config;

import com.mota.collab.websocket.CollaborationWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

/**
 * WebSocket配置
 */
@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final CollaborationWebSocketHandler collaborationWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(collaborationWebSocketHandler, "/ws/collab/{documentId}")
                .addInterceptors(new CollaborationHandshakeInterceptor())
                .setAllowedOrigins("*");
    }

    /**
     * WebSocket握手拦截器
     * 从请求中提取文档ID和用户ID
     */
    public static class CollaborationHandshakeInterceptor implements HandshakeInterceptor {

        @Override
        public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                       WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
            if (request instanceof ServletServerHttpRequest) {
                ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;
                String path = servletRequest.getServletRequest().getRequestURI();
                
                // 从路径中提取文档ID: /ws/collab/{documentId}
                String[] pathParts = path.split("/");
                if (pathParts.length >= 4) {
                    try {
                        Long documentId = Long.parseLong(pathParts[pathParts.length - 1]);
                        attributes.put("documentId", documentId);
                    } catch (NumberFormatException e) {
                        return false;
                    }
                }

                // 从请求头或参数中获取用户ID
                String userIdHeader = servletRequest.getServletRequest().getHeader("X-User-Id");
                if (userIdHeader != null) {
                    try {
                        Long userId = Long.parseLong(userIdHeader);
                        attributes.put("userId", userId);
                    } catch (NumberFormatException e) {
                        return false;
                    }
                } else {
                    // 尝试从查询参数获取
                    String userIdParam = servletRequest.getServletRequest().getParameter("userId");
                    if (userIdParam != null) {
                        try {
                            Long userId = Long.parseLong(userIdParam);
                            attributes.put("userId", userId);
                        } catch (NumberFormatException e) {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }

                // 获取租户ID
                String tenantIdHeader = servletRequest.getServletRequest().getHeader("X-Tenant-Id");
                if (tenantIdHeader != null) {
                    try {
                        Long tenantId = Long.parseLong(tenantIdHeader);
                        attributes.put("tenantId", tenantId);
                    } catch (NumberFormatException ignored) {
                    }
                }

                return true;
            }
            return false;
        }

        @Override
        public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Exception exception) {
            // 握手后处理
        }
    }
}