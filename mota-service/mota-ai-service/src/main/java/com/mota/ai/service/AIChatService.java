package com.mota.ai.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.mota.ai.entity.AIChatMessage;
import com.mota.ai.entity.AIChatSession;

import java.util.List;

/**
 * AI对话服务接口
 */
public interface AIChatService {

    /**
     * 创建会话
     */
    AIChatSession createSession(Long userId, Long enterpriseId, String sessionType, String title);

    /**
     * 获取用户会话列表
     */
    IPage<AIChatSession> getUserSessions(Long userId, int page, int size);

    /**
     * 获取会话详情
     */
    AIChatSession getSession(Long sessionId);

    /**
     * 更新会话标题
     */
    void updateSessionTitle(Long sessionId, String title);

    /**
     * 归档会话
     */
    void archiveSession(Long sessionId);

    /**
     * 删除会话
     */
    void deleteSession(Long sessionId);

    /**
     * 发送消息并获取AI回复
     */
    AIChatMessage sendMessage(Long sessionId, String content);

    /**
     * 获取会话消息列表
     */
    List<AIChatMessage> getSessionMessages(Long sessionId);

    /**
     * 提交消息反馈
     */
    void submitFeedback(Long messageId, Integer rating, String comment);
}