package com.mota.project.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mota.project.entity.CalendarConfig;
import com.mota.project.mapper.CalendarConfigMapper;
import com.mota.project.service.CalendarConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * 日历配置服务实现
 * 用于管理用户的日历显示配置（视图设置、工作时间等）
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CalendarConfigServiceImpl extends ServiceImpl<CalendarConfigMapper, CalendarConfig>
        implements CalendarConfigService {
    
    private final CalendarConfigMapper calendarConfigMapper;
    
    @Override
    public CalendarConfig getByUserId(Long userId) {
        return calendarConfigMapper.selectByUserId(userId);
    }
    
    @Override
    public CalendarConfig getByUserIdAndEnterpriseId(Long userId, Long enterpriseId) {
        return calendarConfigMapper.selectByUserIdAndEnterpriseId(userId, enterpriseId);
    }
    
    @Override
    @Transactional
    public CalendarConfig saveOrUpdateConfig(CalendarConfig config) {
        CalendarConfig existing = null;
        if (config.getEnterpriseId() != null) {
            existing = calendarConfigMapper.selectByUserIdAndEnterpriseId(config.getUserId(), config.getEnterpriseId());
        } else {
            existing = calendarConfigMapper.selectByUserId(config.getUserId());
        }
        
        if (existing != null) {
            config.setId(existing.getId());
            config.setUpdatedAt(LocalDateTime.now());
            updateById(config);
            log.info("更新日历配置成功: id={}, userId={}", config.getId(), config.getUserId());
        } else {
            config.setCreatedAt(LocalDateTime.now());
            config.setUpdatedAt(LocalDateTime.now());
            save(config);
            log.info("创建日历配置成功: id={}, userId={}", config.getId(), config.getUserId());
        }
        return getById(config.getId());
    }
    
    @Override
    @Transactional
    public CalendarConfig updateConfig(CalendarConfig config) {
        config.setUpdatedAt(LocalDateTime.now());
        updateById(config);
        log.info("更新日历配置成功: id={}", config.getId());
        return getById(config.getId());
    }
    
    @Override
    public CalendarConfig getOrCreateDefault(Long userId, Long enterpriseId) {
        CalendarConfig config = null;
        if (enterpriseId != null) {
            config = calendarConfigMapper.selectByUserIdAndEnterpriseId(userId, enterpriseId);
        } else {
            config = calendarConfigMapper.selectByUserId(userId);
        }
        
        if (config == null) {
            // 创建默认配置
            config = new CalendarConfig();
            config.setUserId(userId);
            config.setEnterpriseId(enterpriseId);
            config.setDefaultView(CalendarConfig.VIEW_MONTH);
            config.setWeekStart(CalendarConfig.WEEK_START_MONDAY);
            config.setWorkHoursStart(LocalTime.of(9, 0));
            config.setWorkHoursEnd(LocalTime.of(18, 0));
            config.setWorkDays("[1,2,3,4,5]");
            config.setTimezone("Asia/Shanghai");
            config.setDefaultReminder(15);
            config.setShowWeekends(true);
            config.setShowDeclined(false);
            config.setCreatedAt(LocalDateTime.now());
            config.setUpdatedAt(LocalDateTime.now());
            save(config);
            log.info("创建默认日历配置: userId={}, enterpriseId={}", userId, enterpriseId);
        }
        
        return config;
    }
}