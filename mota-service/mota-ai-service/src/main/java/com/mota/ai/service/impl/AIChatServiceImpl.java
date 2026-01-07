package com.mota.ai.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.ai.entity.AIChatMessage;
import com.mota.ai.entity.AIChatSession;
import com.mota.ai.mapper.AIChatMessageMapper;
import com.mota.ai.mapper.AIChatSessionMapper;
import com.mota.ai.service.AIChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * AI对话服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AIChatServiceImpl implements AIChatService {

    private final AIChatSessionMapper sessionMapper;
    private final AIChatMessageMapper messageMapper;

    @Override
    @Transactional
    public AIChatSession createSession(Long userId, Long enterpriseId, String sessionType, String title) {
        AIChatSession session = new AIChatSession();
        session.setUserId(userId);
        session.setEnterpriseId(enterpriseId);
        session.setSessionType(sessionType != null ? sessionType : "general");
        session.setTitle(title != null ? title : "新对话");
        session.setStatus(1); // 1-活跃
        session.setMessageCount(0);
        session.setCreatedAt(LocalDateTime.now());
        session.setUpdatedAt(LocalDateTime.now());
        sessionMapper.insert(session);
        return session;
    }

    @Override
    public IPage<AIChatSession> getUserSessions(Long userId, int page, int size) {
        Page<AIChatSession> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<AIChatSession> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AIChatSession::getUserId, userId)
               .eq(AIChatSession::getDeleted, 0)
               .orderByDesc(AIChatSession::getUpdatedAt);
        return sessionMapper.selectPage(pageParam, wrapper);
    }

    @Override
    public AIChatSession getSession(Long sessionId) {
        return sessionMapper.selectById(sessionId);
    }

    @Override
    @Transactional
    public void updateSessionTitle(Long sessionId, String title) {
        AIChatSession session = sessionMapper.selectById(sessionId);
        if (session != null) {
            session.setTitle(title);
            session.setUpdatedAt(LocalDateTime.now());
            sessionMapper.updateById(session);
        }
    }

    @Override
    @Transactional
    public void archiveSession(Long sessionId) {
        AIChatSession session = sessionMapper.selectById(sessionId);
        if (session != null) {
            session.setIsArchived(true);
            session.setStatus(0); // 0-已归档
            session.setUpdatedAt(LocalDateTime.now());
            sessionMapper.updateById(session);
        }
    }

    @Override
    @Transactional
    public void deleteSession(Long sessionId) {
        AIChatSession session = sessionMapper.selectById(sessionId);
        if (session != null) {
            session.setDeleted(1);
            session.setUpdatedAt(LocalDateTime.now());
            sessionMapper.updateById(session);
        }
    }

    @Override
    @Transactional
    public AIChatMessage sendMessage(Long sessionId, String content) {
        // 保存用户消息
        AIChatMessage userMessage = new AIChatMessage();
        userMessage.setSessionId(sessionId);
        userMessage.setRole("user");
        userMessage.setContent(content);
        userMessage.setContentType("text");
        userMessage.setCreatedAt(LocalDateTime.now());
        messageMapper.insert(userMessage);

        // 更新会话
        AIChatSession session = sessionMapper.selectById(sessionId);
        if (session != null) {
            session.setMessageCount(session.getMessageCount() + 1);
            session.setLastMessageAt(LocalDateTime.now());
            session.setUpdatedAt(LocalDateTime.now());
            sessionMapper.updateById(session);
        }

        // TODO: 调用AI模型生成回复
        // 这里暂时返回模拟回复
        AIChatMessage aiMessage = new AIChatMessage();
        aiMessage.setSessionId(sessionId);
        aiMessage.setRole("assistant");
        aiMessage.setContent("感谢您的消息！我是摩塔AI助手，目前正在开发中。您的问题是：" + content);
        aiMessage.setContentType("text");
        aiMessage.setTokensUsed(100);
        aiMessage.setCreatedAt(LocalDateTime.now());
        messageMapper.insert(aiMessage);

        // 更新会话消息数
        if (session != null) {
            session.setMessageCount(session.getMessageCount() + 1);
            sessionMapper.updateById(session);
        }

        return aiMessage;
    }

    @Override
    public List<AIChatMessage> getSessionMessages(Long sessionId) {
        LambdaQueryWrapper<AIChatMessage> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AIChatMessage::getSessionId, sessionId)
               .orderByAsc(AIChatMessage::getCreatedAt);
        return messageMapper.selectList(wrapper);
    }

    @Override
    @Transactional
    public void submitFeedback(Long messageId, Integer rating, String comment) {
        AIChatMessage message = messageMapper.selectById(messageId);
        if (message != null) {
            message.setFeedbackRating(rating);
            message.setFeedbackComment(comment);
            messageMapper.updateById(message);
        }
    }
}