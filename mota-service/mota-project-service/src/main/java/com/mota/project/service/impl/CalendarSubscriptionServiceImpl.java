package com.mota.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mota.project.entity.CalendarEvent;
import com.mota.project.entity.CalendarSubscription;
import com.mota.project.mapper.CalendarEventMapper;
import com.mota.project.mapper.CalendarSubscriptionMapper;
import com.mota.project.service.CalendarSubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * 日历订阅服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CalendarSubscriptionServiceImpl extends ServiceImpl<CalendarSubscriptionMapper, CalendarSubscription> 
        implements CalendarSubscriptionService {
    
    private final CalendarSubscriptionMapper calendarSubscriptionMapper;
    private final CalendarEventMapper calendarEventMapper;
    
    @Value("${app.base-url:http://localhost:8084}")
    private String baseUrl;
    
    @Override
    public List<CalendarSubscription> getByUserId(Long userId) {
        return calendarSubscriptionMapper.selectByUserId(userId);
    }
    
    @Override
    @Transactional
    public CalendarSubscription createSubscription(CalendarSubscription subscription) {
        subscription.setSyncStatus(CalendarSubscription.SYNC_PENDING);
        if (subscription.getSyncFrequency() == null) {
            subscription.setSyncFrequency(CalendarSubscription.DEFAULT_SYNC_FREQUENCY);
        }
        if (subscription.getIsVisible() == null) {
            subscription.setIsVisible(true);
        }
        subscription.setCreatedAt(LocalDateTime.now());
        subscription.setUpdatedAt(LocalDateTime.now());
        save(subscription);
        return subscription;
    }
    
    @Override
    @Transactional
    public CalendarSubscription updateSubscription(CalendarSubscription subscription) {
        subscription.setUpdatedAt(LocalDateTime.now());
        updateById(subscription);
        return getById(subscription.getId());
    }
    
    @Override
    @Transactional
    public void syncSubscription(Long subscriptionId) {
        CalendarSubscription subscription = getById(subscriptionId);
        if (subscription == null) {
            log.warn("Subscription not found: {}", subscriptionId);
            return;
        }
        
        try {
            // TODO: 实现实际的iCal同步逻辑
            // 1. 从subscription.getSourceUrl()获取iCal数据
            // 2. 解析iCal数据
            // 3. 将事件保存到数据库
            
            log.info("Syncing subscription: {} from URL: {}", subscriptionId, subscription.getSourceUrl());
            
            // 更新同步状态为成功
            calendarSubscriptionMapper.updateSyncStatus(subscriptionId, CalendarSubscription.SYNC_SUCCESS, null);
            
        } catch (Exception e) {
            log.error("Failed to sync subscription: {}", subscriptionId, e);
            // 更新同步状态为错误
            calendarSubscriptionMapper.updateSyncStatus(subscriptionId, CalendarSubscription.SYNC_ERROR, e.getMessage());
        }
    }
    
    @Override
    public List<CalendarEvent> getSubscriptionEvents(Long subscriptionId) {
        CalendarSubscription subscription = getById(subscriptionId);
        if (subscription == null) {
            return Collections.emptyList();
        }
        
        // 查询与该订阅用户关联的事件（通过创建者ID）
        LambdaQueryWrapper<CalendarEvent> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CalendarEvent::getCreatorId, subscription.getUserId())
               .orderByAsc(CalendarEvent::getStartTime);
        
        return calendarEventMapper.selectList(wrapper);
    }
    
    @Override
    public String generateSubscriptionUrl(Long userId) {
        // 生成一个唯一的订阅token
        String token = UUID.randomUUID().toString().replace("-", "");
        
        // 返回iCal订阅URL
        return String.format("%s/api/v1/calendar/ical/%s/%s.ics", baseUrl, userId, token);
    }
}