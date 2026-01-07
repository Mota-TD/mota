package com.mota.ai.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.mota.ai.entity.AIChatMessage;
import com.mota.ai.entity.AIChatSession;
import com.mota.ai.service.AIChatService;
import com.mota.common.core.result.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * AI对话控制器
 */
@RestController
@RequestMapping("/api/v1/ai/assistant")
@RequiredArgsConstructor
public class AIChatController {

    private final AIChatService aiChatService;

    /**
     * 创建会话
     */
    @PostMapping("/sessions")
    public Result<AIChatSession> createSession(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        Long enterpriseId = request.get("enterpriseId") != null ? 
            Long.valueOf(request.get("enterpriseId").toString()) : null;
        String sessionType = (String) request.getOrDefault("sessionType", "general");
        String title = (String) request.get("title");
        
        AIChatSession session = aiChatService.createSession(userId, enterpriseId, sessionType, title);
        return Result.success(session);
    }

    /**
     * 获取用户会话列表
     */
    @GetMapping("/sessions")
    public Result<IPage<AIChatSession>> getUserSessions(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        IPage<AIChatSession> sessions = aiChatService.getUserSessions(userId, page, size);
        return Result.success(sessions);
    }

    /**
     * 获取会话详情
     */
    @GetMapping("/sessions/{sessionId}")
    public Result<AIChatSession> getSession(@PathVariable Long sessionId) {
        AIChatSession session = aiChatService.getSession(sessionId);
        return Result.success(session);
    }

    /**
     * 更新会话标题
     */
    @PutMapping("/sessions/{sessionId}/title")
    public Result<Void> updateSessionTitle(
            @PathVariable Long sessionId,
            @RequestBody Map<String, String> request) {
        aiChatService.updateSessionTitle(sessionId, request.get("title"));
        return Result.success();
    }

    /**
     * 归档会话
     */
    @PostMapping("/sessions/{sessionId}/archive")
    public Result<Void> archiveSession(@PathVariable Long sessionId) {
        aiChatService.archiveSession(sessionId);
        return Result.success();
    }

    /**
     * 删除会话
     */
    @DeleteMapping("/sessions/{sessionId}")
    public Result<Void> deleteSession(@PathVariable Long sessionId) {
        aiChatService.deleteSession(sessionId);
        return Result.success();
    }

    /**
     * 发送消息
     */
    @PostMapping("/sessions/{sessionId}/messages")
    public Result<AIChatMessage> sendMessage(
            @PathVariable Long sessionId,
            @RequestBody Map<String, String> request) {
        AIChatMessage message = aiChatService.sendMessage(sessionId, request.get("content"));
        return Result.success(message);
    }

    /**
     * 获取会话消息列表
     */
    @GetMapping("/sessions/{sessionId}/messages")
    public Result<List<AIChatMessage>> getSessionMessages(@PathVariable Long sessionId) {
        List<AIChatMessage> messages = aiChatService.getSessionMessages(sessionId);
        return Result.success(messages);
    }

    /**
     * 提交消息反馈
     */
    @PostMapping("/messages/{messageId}/feedback")
    public Result<Void> submitFeedback(
            @PathVariable Long messageId,
            @RequestBody Map<String, Object> request) {
        Integer rating = (Integer) request.get("rating");
        String comment = (String) request.get("comment");
        aiChatService.submitFeedback(messageId, rating, comment);
        return Result.success();
    }
}