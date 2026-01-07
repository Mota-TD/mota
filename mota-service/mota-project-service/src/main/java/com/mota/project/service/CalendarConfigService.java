package com.mota.project.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.mota.project.entity.CalendarConfig;

/**
 * 日历配置服务接口
 * 用于管理用户的日历显示配置（视图设置、工作时间等）
 */
public interface CalendarConfigService extends IService<CalendarConfig> {
    
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
     * 获取或创建默认配置
     */
    CalendarConfig getOrCreateDefault(Long userId, Long enterpriseId);
}