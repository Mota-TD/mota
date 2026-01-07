package com.mota.calendar.service;

import com.mota.calendar.entity.CalendarSubscription;

import java.util.List;

/**
 * 日历订阅服务接口
 */
public interface CalendarSubscriptionService {
    
    /**
     * 获取用户的订阅列表
     */
    List<CalendarSubscription> getUserSubscriptions(Long userId);
    
    /**
     * 获取订阅详情
     */
    CalendarSubscription getById(Long id);
    
    /**
     * 创建订阅
     */
    CalendarSubscription createSubscription(CalendarSubscription subscription);
    
    /**
     * 更新订阅
     */
    CalendarSubscription updateSubscription(CalendarSubscription subscription);
    
    /**
     * 删除订阅
     */
    boolean deleteSubscription(Long id);
    
    /**
     * 同步订阅
     */
    boolean syncSubscription(Long id);
    
    /**
     * 暂停订阅
     */
    boolean pauseSubscription(Long id);
    
    /**
     * 恢复订阅
     */
    boolean resumeSubscription(Long id);
}