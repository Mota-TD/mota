package com.mota.calendar.service.impl;

import com.mota.calendar.entity.CalendarSubscription;
import com.mota.calendar.mapper.CalendarSubscriptionMapper;
import com.mota.calendar.service.CalendarSubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 日历订阅服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CalendarSubscriptionServiceImpl implements CalendarSubscriptionService {
    
    private final CalendarSubscriptionMapper subscriptionMapper;
    
    @Override
    public List<CalendarSubscription> getUserSubscriptions(Long userId) {
        return subscriptionMapper.findByUserId(userId);
    }
    
    @Override
    public CalendarSubscription getById(Long id) {
        return subscriptionMapper.selectById(id);
    }
    
    @Override
    @Transactional
    public CalendarSubscription createSubscription(CalendarSubscription subscription) {
        // 设置默认值
        if (subscription.getSyncFrequency() == null) {
            subscription.setSyncFrequency(CalendarSubscription.DEFAULT_SYNC_FREQUENCY);
        }
        if (subscription.getSyncStatus() == null) {
            subscription.setSyncStatus(CalendarSubscription.SYNC_PENDING);
        }
        if (subscription.getColor() == null) {
            subscription.setColor("#1890ff");
        }
        if (subscription.getIsVisible() == null) {
            subscription.setIsVisible(true);
        }
        
        subscription.setCreatedAt(LocalDateTime.now());
        subscription.setUpdatedAt(LocalDateTime.now());
        
        subscriptionMapper.insert(subscription);
        return subscription;
    }
    
    @Override
    @Transactional
    public CalendarSubscription updateSubscription(CalendarSubscription subscription) {
        subscription.setUpdatedAt(LocalDateTime.now());
        subscriptionMapper.updateById(subscription);
        return subscriptionMapper.selectById(subscription.getId());
    }
    
    @Override
    @Transactional
    public boolean deleteSubscription(Long id) {
        return subscriptionMapper.deleteById(id) > 0;
    }
    
    @Override
    @Transactional
    public boolean syncSubscription(Long id) {
        CalendarSubscription subscription = subscriptionMapper.selectById(id);
        if (subscription == null) {
            return false;
        }
        
        try {
            // TODO: 实现实际的iCal同步逻辑
            // 这里只是更新同步时间
            subscription.setLastSyncAt(LocalDateTime.now());
            subscription.setSyncStatus(CalendarSubscription.SYNC_SUCCESS);
            subscription.setSyncError(null);
            subscription.setUpdatedAt(LocalDateTime.now());
            subscriptionMapper.updateById(subscription);
            
            log.info("Successfully synced subscription: {}", id);
            return true;
        } catch (Exception e) {
            log.error("Failed to sync subscription: {}", id, e);
            subscription.setSyncStatus(CalendarSubscription.SYNC_ERROR);
            subscription.setSyncError(e.getMessage());
            subscription.setUpdatedAt(LocalDateTime.now());
            subscriptionMapper.updateById(subscription);
            return false;
        }
    }
    
    @Override
    @Transactional
    public boolean pauseSubscription(Long id) {
        CalendarSubscription subscription = subscriptionMapper.selectById(id);
        if (subscription == null) {
            return false;
        }
        
        subscription.setIsVisible(false);
        subscription.setUpdatedAt(LocalDateTime.now());
        subscriptionMapper.updateById(subscription);
        return true;
    }
    
    @Override
    @Transactional
    public boolean resumeSubscription(Long id) {
        CalendarSubscription subscription = subscriptionMapper.selectById(id);
        if (subscription == null) {
            return false;
        }
        
        subscription.setIsVisible(true);
        subscription.setSyncStatus(CalendarSubscription.SYNC_PENDING);
        subscription.setUpdatedAt(LocalDateTime.now());
        subscriptionMapper.updateById(subscription);
        return true;
    }
}