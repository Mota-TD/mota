package com.mota.notify.service;

import com.mota.notify.entity.NotificationSubscription;

import java.util.List;

/**
 * 通知订阅服务接口
 */
public interface NotificationSubscriptionService {

    /**
     * 获取用户的所有订阅
     */
    List<NotificationSubscription> getUserSubscriptions(Long userId);

    /**
     * 获取用户对特定类型的订阅
     */
    NotificationSubscription getSubscription(Long userId, String notifyType);

    /**
     * 获取用户对特定业务的订阅
     */
    NotificationSubscription getBusinessSubscription(Long userId, String businessType, Long businessId);

    /**
     * 保存订阅设置
     */
    NotificationSubscription saveSubscription(NotificationSubscription subscription);

    /**
     * 批量保存订阅设置
     */
    void batchSaveSubscriptions(List<NotificationSubscription> subscriptions);

    /**
     * 订阅通知类型
     */
    void subscribe(Long userId, String notifyType, String channels);

    /**
     * 取消订阅通知类型
     */
    void unsubscribe(Long userId, String notifyType);

    /**
     * 订阅业务通知
     */
    void subscribeToBusinessNotification(Long userId, String businessType, Long businessId, String channels);

    /**
     * 取消订阅业务通知
     */
    void unsubscribeFromBusinessNotification(Long userId, String businessType, Long businessId);

    /**
     * 检查用户是否订阅了某类型通知
     */
    boolean isSubscribed(Long userId, String notifyType);

    /**
     * 检查用户是否订阅了某业务通知
     */
    boolean isSubscribedToBusiness(Long userId, String businessType, Long businessId);

    /**
     * 获取用户订阅的渠道
     */
    List<String> getSubscribedChannels(Long userId, String notifyType);

    /**
     * 删除订阅
     */
    void deleteSubscription(Long subscriptionId);

    /**
     * 初始化用户默认订阅
     */
    void initDefaultSubscriptions(Long userId);
}