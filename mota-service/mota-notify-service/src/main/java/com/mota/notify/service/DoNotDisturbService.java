package com.mota.notify.service;

import com.mota.notify.entity.DoNotDisturbSetting;

import java.time.LocalDateTime;

/**
 * 免打扰服务接口
 */
public interface DoNotDisturbService {

    /**
     * 获取用户的免打扰设置
     */
    DoNotDisturbSetting getSetting(Long userId);

    /**
     * 保存免打扰设置
     */
    DoNotDisturbSetting saveSetting(DoNotDisturbSetting setting);

    /**
     * 启用免打扰
     */
    void enable(Long userId);

    /**
     * 禁用免打扰
     */
    void disable(Long userId);

    /**
     * 设置临时免打扰
     */
    void setTemporary(Long userId, LocalDateTime endTime);

    /**
     * 取消临时免打扰
     */
    void cancelTemporary(Long userId);

    /**
     * 检查用户是否在免打扰时间内
     */
    boolean isInDoNotDisturb(Long userId);

    /**
     * 检查通知类型是否被免打扰排除
     */
    boolean isExcepted(Long userId, String notifyType);

    /**
     * 检查发送人是否被免打扰排除
     */
    boolean isSenderExcepted(Long userId, Long senderId);
}