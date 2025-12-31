package com.mota.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mota.project.entity.CalendarConfig;
import com.mota.project.mapper.CalendarConfigMapper;
import com.mota.project.service.CalendarConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 日历配置服务实现
 */
@Service
@RequiredArgsConstructor
public class CalendarConfigServiceImpl extends ServiceImpl<CalendarConfigMapper, CalendarConfig> 
        implements CalendarConfigService {
    
    private final CalendarConfigMapper calendarConfigMapper;
    
    @Override
    public List<CalendarConfig> getByUserId(Long userId) {
        return calendarConfigMapper.selectByUserId(userId);
    }
    
    @Override
    public CalendarConfig getDefaultByUserId(Long userId) {
        return calendarConfigMapper.selectDefaultByUserId(userId);
    }
    
    @Override
    @Transactional
    public CalendarConfig createConfig(CalendarConfig config) {
        config.setCreatedAt(LocalDateTime.now());
        config.setUpdatedAt(LocalDateTime.now());
        
        // 如果是第一个配置，设为默认
        List<CalendarConfig> existingConfigs = getByUserId(config.getUserId());
        if (existingConfigs.isEmpty()) {
            config.setIsDefault(true);
        }
        
        save(config);
        return config;
    }
    
    @Override
    @Transactional
    public CalendarConfig updateConfig(CalendarConfig config) {
        config.setUpdatedAt(LocalDateTime.now());
        updateById(config);
        return getById(config.getId());
    }
    
    @Override
    @Transactional
    public void setDefault(Long userId, Long configId) {
        // 先将该用户所有配置设为非默认
        LambdaUpdateWrapper<CalendarConfig> resetWrapper = new LambdaUpdateWrapper<>();
        resetWrapper.eq(CalendarConfig::getUserId, userId)
                   .set(CalendarConfig::getIsDefault, false)
                   .set(CalendarConfig::getUpdatedAt, LocalDateTime.now());
        update(resetWrapper);
        
        // 设置指定配置为默认
        LambdaUpdateWrapper<CalendarConfig> setWrapper = new LambdaUpdateWrapper<>();
        setWrapper.eq(CalendarConfig::getId, configId)
                 .eq(CalendarConfig::getUserId, userId)
                 .set(CalendarConfig::getIsDefault, true)
                 .set(CalendarConfig::getUpdatedAt, LocalDateTime.now());
        update(setWrapper);
    }
}