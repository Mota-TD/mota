package com.mota.project.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.mota.project.entity.CalendarConfig;

import java.util.List;

/**
 * 日历配置服务接口
 */
public interface CalendarConfigService extends IService<CalendarConfig> {
    
    /**
     * 获取用户的日历配置列表
     */
    List<CalendarConfig> getByUserId(Long userId);
    
    /**
     * 获取用户的默认日历配置
     */
    CalendarConfig getDefaultByUserId(Long userId);
    
    /**
     * 创建日历配置
     */
    CalendarConfig createConfig(CalendarConfig config);
    
    /**
     * 更新日历配置
     */
    CalendarConfig updateConfig(CalendarConfig config);
    
    /**
     * 设置默认日历
     */
    void setDefault(Long userId, Long configId);
}