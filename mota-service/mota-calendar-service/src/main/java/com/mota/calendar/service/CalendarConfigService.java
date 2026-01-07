package com.mota.calendar.service;

import com.mota.calendar.entity.CalendarConfig;

/**
 * 日历配置服务接口
 * 用于管理用户的日历显示配置（视图设置、工作时间等）
 */
public interface CalendarConfigService {
    
    /**
     * 获取用户的日历配置
     */
    CalendarConfig getByUserId(Long userId);
    
    /**
     * 获取用户在指定企业的日历配置
     */
    CalendarConfig getByUserIdAndEnterpriseId(Long userId, Long enterpriseId);
    
    /**
     * 创建或更新日历配置
     */
    CalendarConfig saveOrUpdateConfig(CalendarConfig config);
    
    /**
     * 更新日历配置
     */
    CalendarConfig updateConfig(CalendarConfig config);
    
    /**
     * 获取配置详情
     */
    CalendarConfig getById(Long id);
    
    /**
     * 获取或创建默认配置
     */
    CalendarConfig getOrCreateDefault(Long userId, Long enterpriseId);
}