package com.mota.notify.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mota.notify.entity.NotificationSubscription;
import com.mota.notify.mapper.NotificationSubscriptionMapper;
import com.mota.notify.service.NotificationSubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * 通知订阅服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationSubscriptionServiceImpl implements NotificationSubscriptionService {

    private final NotificationSubscriptionMapper subscriptionMapper;

    // 默认订阅的通知类型
    private static final String[] DEFAULT_NOTIFY_TYPES = {
        "system", "task", "project", "document", "comment", "mention", "reminder"
    };

    // 默认订阅的渠道
    private static final String DEFAULT_CHANNELS = "app,email";

    @Override
    public List<NotificationSubscription> getUserSubscriptions(Long userId) {
        LambdaQueryWrapper<NotificationSubscription> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(NotificationSubscription::getUserId, userId)
               .eq(NotificationSubscription::getEnabled, true)
               .orderByAsc(NotificationSubscription::getNotifyType);
        return subscriptionMapper.selectList(wrapper);
    }

    @Override
    public NotificationSubscription getSubscription(Long userId, String notifyType) {
        LambdaQueryWrapper<NotificationSubscription> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(NotificationSubscription::getUserId, userId)
               .eq(NotificationSubscription::getNotifyType, notifyType)
               .isNull(NotificationSubscription::getBusinessType);
        return subscriptionMapper.selectOne(wrapper);
    }

    @Override
    public NotificationSubscription getBusinessSubscription(Long userId, String businessType, Long businessId) {
        LambdaQueryWrapper<NotificationSubscription> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(NotificationSubscription::getUserId, userId)
               .eq(NotificationSubscription::getBusinessType, businessType)
               .eq(NotificationSubscription::getBusinessId, businessId);
        return subscriptionMapper.selectOne(wrapper);
    }

    @Override
    @Transactional
    public NotificationSubscription saveSubscription(NotificationSubscription subscription) {
        if (subscription.getId() == null) {
            subscriptionMapper.insert(subscription);
        } else {
            subscriptionMapper.updateById(subscription);
        }
        log.info("保存订阅设置: userId={}, type={}", subscription.getUserId(), subscription.getNotifyType());
        return subscription;
    }

    @Override
    @Transactional
    public void batchSaveSubscriptions(List<NotificationSubscription> subscriptions) {
        for (NotificationSubscription subscription : subscriptions) {
            saveSubscription(subscription);
        }
        log.info("批量保存订阅设置: count={}", subscriptions.size());
    }

    @Override
    @Transactional
    public void subscribe(Long userId, String notifyType, String channels) {
        NotificationSubscription subscription = getSubscription(userId, notifyType);
        
        if (subscription == null) {
            subscription = new NotificationSubscription();
            subscription.setUserId(userId);
            subscription.setNotifyType(notifyType);
            subscription.setChannels(channels);
            subscription.setEnabled(true);
            subscriptionMapper.insert(subscription);
        } else {
            subscription.setChannels(channels);
            subscription.setEnabled(true);
            subscriptionMapper.updateById(subscription);
        }
        
        log.info("订阅通知: userId={}, type={}, channels={}", userId, notifyType, channels);
    }

    @Override
    @Transactional
    public void unsubscribe(Long userId, String notifyType) {
        NotificationSubscription subscription = getSubscription(userId, notifyType);
        
        if (subscription != null) {
            subscription.setEnabled(false);
            subscriptionMapper.updateById(subscription);
            log.info("取消订阅: userId={}, type={}", userId, notifyType);
        }
    }

    @Override
    @Transactional
    public void subscribeToBusinessNotification(Long userId, String businessType, Long businessId, String channels) {
        NotificationSubscription subscription = getBusinessSubscription(userId, businessType, businessId);
        
        if (subscription == null) {
            subscription = new NotificationSubscription();
            subscription.setUserId(userId);
            subscription.setBusinessType(businessType);
            subscription.setBusinessId(businessId);
            subscription.setChannels(channels);
            subscription.setEnabled(true);
            subscriptionMapper.insert(subscription);
        } else {
            subscription.setChannels(channels);
            subscription.setEnabled(true);
            subscriptionMapper.updateById(subscription);
        }
        
        log.info("订阅业务通知: userId={}, businessType={}, businessId={}", userId, businessType, businessId);
    }

    @Override
    @Transactional
    public void unsubscribeFromBusinessNotification(Long userId, String businessType, Long businessId) {
        NotificationSubscription subscription = getBusinessSubscription(userId, businessType, businessId);
        
        if (subscription != null) {
            subscription.setEnabled(false);
            subscriptionMapper.updateById(subscription);
            log.info("取消订阅业务通知: userId={}, businessType={}, businessId={}", userId, businessType, businessId);
        }
    }

    @Override
    public boolean isSubscribed(Long userId, String notifyType) {
        NotificationSubscription subscription = getSubscription(userId, notifyType);
        return subscription != null && subscription.getEnabled();
    }

    @Override
    public boolean isSubscribedToBusiness(Long userId, String businessType, Long businessId) {
        NotificationSubscription subscription = getBusinessSubscription(userId, businessType, businessId);
        return subscription != null && subscription.getEnabled();
    }

    @Override
    public List<String> getSubscribedChannels(Long userId, String notifyType) {
        NotificationSubscription subscription = getSubscription(userId, notifyType);
        
        if (subscription == null || !subscription.getEnabled() || subscription.getChannels() == null) {
            return new ArrayList<>();
        }
        
        return Arrays.asList(subscription.getChannels().split(","));
    }

    @Override
    @Transactional
    public void deleteSubscription(Long subscriptionId) {
        subscriptionMapper.deleteById(subscriptionId);
        log.info("删除订阅: id={}", subscriptionId);
    }

    @Override
    @Transactional
    public void initDefaultSubscriptions(Long userId) {
        // 检查是否已有订阅
        List<NotificationSubscription> existing = getUserSubscriptions(userId);
        if (!existing.isEmpty()) {
            log.info("用户已有订阅设置，跳过初始化: userId={}", userId);
            return;
        }
        
        // 创建默认订阅
        for (String notifyType : DEFAULT_NOTIFY_TYPES) {
            NotificationSubscription subscription = new NotificationSubscription();
            subscription.setUserId(userId);
            subscription.setNotifyType(notifyType);
            subscription.setChannels(DEFAULT_CHANNELS);
            subscription.setEnabled(true);
            subscriptionMapper.insert(subscription);
        }
        
        log.info("初始化用户默认订阅: userId={}, count={}", userId, DEFAULT_NOTIFY_TYPES.length);
    }
}