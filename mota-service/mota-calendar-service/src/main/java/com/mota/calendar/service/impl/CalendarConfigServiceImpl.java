package com.mota.calendar.service.impl;

import com.mota.calendar.entity.CalendarConfig;
import com.mota.calendar.mapper.CalendarConfigMapper;
import com.mota.calendar.service.CalendarConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 日历配置服务实现
 * 用于管理用户的日历显示配置（视图设置、工作时间等）
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CalendarConfigServiceImpl implements CalendarConfigService {
    
    private final CalendarConfigMapper configMapper;
    
    @Override
    public CalendarConfig getByUserId(Long userId) {
        return configMapper.findByUserId(userId);
    }
    
    @Override
    public CalendarConfig getByUserIdAndEnterpriseId(Long userId, Long enterpriseId) {
        return configMapper.findByUserIdAndEnterpriseId(userId, enterpriseId);
    }
    
    @Override
    @Transactional
    public CalendarConfig saveOrUpdateConfig(CalendarConfig config) {
        CalendarConfig existing = null;
        if (config.getEnterpriseId() != null) {
            existing = configMapper.findByUserIdAndEnterpriseId(config.getUserId(), config.getEnterpriseId());
        } else {
            existing = configMapper.findByUserId(config.getUserId());
        }
        
        if (existing != null) {
            config.setId(existing.getId());
            config.setUpdatedAt(LocalDateTime.now());
            configMapper.updateById(config);
            log.info("更新日历配置成功: id={}, userId={}", config.getId(), config.getUserId());
        } else {
            config.setCreatedAt(LocalDateTime.now());
            config.setUpdatedAt(LocalDateTime.now());
            configMapper.insert(config);
            log.info("创建日历配置成功: id={}, userId={}", config.getId(), config.getUserId());
        }
        return configMapper.selectById(config.getId());
    }
    
    @Override
    public CalendarConfig updateConfig(CalendarConfig config) {
        config.setUpdatedAt(LocalDateTime.now());
        configMapper.updateById(config);
        log.info("更新日历配置成功: id={}", config.getId());
        return configMapper.selectById(config.getId());
    }
    
    @Override
    public CalendarConfig getById(Long id) {
        return configMapper.selectById(id);
    }
    
    @Override
    public CalendarConfig getOrCreateDefault(Long userId, Long enterpriseId) {
        CalendarConfig config = null;
        if (enterpriseId != null) {
            config = configMapper.findByUserIdAndEnterpriseId(userId, enterpriseId);
        } else {
            config = configMapper.findByUserId(userId);
        }
        
        if (config == null) {
            // 创建默认配置
            config = new CalendarConfig();
            config.setUserId(userId);
            config.setEnterpriseId(enterpriseId);
            config.setDefaultView(CalendarConfig.VIEW_MONTH);
            config.setWeekStart(CalendarConfig.WEEK_START_MONDAY);
            config.setWorkHoursStart("09:00");
            config.setWorkHoursEnd("18:00");
            config.setWorkDays("[1,2,3,4,5]");
            config.setTimezone("Asia/Shanghai");
            config.setDefaultReminder(15);
            config.setShowWeekends(true);
            config.setShowDeclined(false);
            config.setCreatedAt(LocalDateTime.now());
            config.setUpdatedAt(LocalDateTime.now());
            configMapper.insert(config);
            log.info("创建默认日历配置: userId={}, enterpriseId={}", userId, enterpriseId);
        }
        
        return config;
    }
}