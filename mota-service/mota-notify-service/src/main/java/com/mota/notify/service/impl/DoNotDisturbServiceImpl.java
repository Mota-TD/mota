package com.mota.notify.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mota.notify.entity.DoNotDisturbSetting;
import com.mota.notify.mapper.DoNotDisturbSettingMapper;
import com.mota.notify.service.DoNotDisturbService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

/**
 * 免打扰服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DoNotDisturbServiceImpl implements DoNotDisturbService {

    private final DoNotDisturbSettingMapper doNotDisturbSettingMapper;

    @Override
    public DoNotDisturbSetting getSetting(Long userId) {
        LambdaQueryWrapper<DoNotDisturbSetting> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DoNotDisturbSetting::getUserId, userId);
        DoNotDisturbSetting setting = doNotDisturbSettingMapper.selectOne(wrapper);
        
        if (setting == null) {
            // 返回默认设置
            setting = createDefaultSetting(userId);
        }
        
        return setting;
    }

    @Override
    @Transactional
    public DoNotDisturbSetting saveSetting(DoNotDisturbSetting setting) {
        if (setting.getId() == null) {
            // 检查是否已存在
            LambdaQueryWrapper<DoNotDisturbSetting> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(DoNotDisturbSetting::getUserId, setting.getUserId());
            DoNotDisturbSetting existing = doNotDisturbSettingMapper.selectOne(wrapper);
            
            if (existing != null) {
                setting.setId(existing.getId());
                doNotDisturbSettingMapper.updateById(setting);
            } else {
                doNotDisturbSettingMapper.insert(setting);
            }
        } else {
            doNotDisturbSettingMapper.updateById(setting);
        }
        
        log.info("保存免打扰设置: userId={}, mode={}", setting.getUserId(), setting.getMode());
        return setting;
    }

    @Override
    @Transactional
    public void enable(Long userId) {
        DoNotDisturbSetting setting = getSetting(userId);
        setting.setEnabled(true);
        saveSetting(setting);
        log.info("启用免打扰: userId={}", userId);
    }

    @Override
    @Transactional
    public void disable(Long userId) {
        DoNotDisturbSetting setting = getSetting(userId);
        setting.setEnabled(false);
        saveSetting(setting);
        log.info("禁用免打扰: userId={}", userId);
    }

    @Override
    @Transactional
    public void setTemporary(Long userId, LocalDateTime endTime) {
        DoNotDisturbSetting setting = getSetting(userId);
        setting.setEnabled(true);
        setting.setTemporaryEndTime(endTime);
        saveSetting(setting);
        log.info("设置临时免打扰: userId={}, endTime={}", userId, endTime);
    }

    @Override
    @Transactional
    public void cancelTemporary(Long userId) {
        DoNotDisturbSetting setting = getSetting(userId);
        setting.setTemporaryEndTime(null);
        saveSetting(setting);
        log.info("取消临时免打扰: userId={}", userId);
    }

    @Override
    public boolean isInDoNotDisturb(Long userId) {
        DoNotDisturbSetting setting = getSetting(userId);
        
        if (!setting.getEnabled()) {
            return false;
        }
        
        LocalDateTime now = LocalDateTime.now();
        
        // 检查临时免打扰
        if (setting.getTemporaryEndTime() != null) {
            if (now.isBefore(setting.getTemporaryEndTime())) {
                return true;
            } else {
                // 临时免打扰已过期，清除
                cancelTemporary(userId);
            }
        }
        
        String mode = setting.getMode();
        
        switch (mode) {
            case "always":
                return true;
                
            case "scheduled":
                return isInScheduledTime(setting, now);
                
            case "smart":
                return isInSmartMode(setting, now);
                
            default:
                return false;
        }
    }

    @Override
    public boolean isExcepted(Long userId, String notifyType) {
        DoNotDisturbSetting setting = getSetting(userId);
        
        if (setting.getExceptTypes() == null || setting.getExceptTypes().isEmpty()) {
            return false;
        }
        
        List<String> exceptTypes = Arrays.asList(setting.getExceptTypes().split(","));
        return exceptTypes.contains(notifyType);
    }

    @Override
    public boolean isSenderExcepted(Long userId, Long senderId) {
        DoNotDisturbSetting setting = getSetting(userId);
        
        if (setting.getExceptSenders() == null || setting.getExceptSenders().isEmpty()) {
            return false;
        }
        
        List<String> exceptSenders = Arrays.asList(setting.getExceptSenders().split(","));
        return exceptSenders.contains(String.valueOf(senderId));
    }

    /**
     * 创建默认设置
     */
    private DoNotDisturbSetting createDefaultSetting(Long userId) {
        DoNotDisturbSetting setting = new DoNotDisturbSetting();
        setting.setUserId(userId);
        setting.setEnabled(false);
        setting.setMode("scheduled");
        setting.setStartTime(LocalTime.of(22, 0));
        setting.setEndTime(LocalTime.of(8, 0));
        setting.setWeekdays("1,2,3,4,5,6,7");
        setting.setExceptTypes("important");
        return setting;
    }

    /**
     * 检查是否在计划时间内
     */
    private boolean isInScheduledTime(DoNotDisturbSetting setting, LocalDateTime now) {
        // 检查星期
        if (setting.getWeekdays() != null && !setting.getWeekdays().isEmpty()) {
            DayOfWeek dayOfWeek = now.getDayOfWeek();
            int dayValue = dayOfWeek.getValue();
            List<String> weekdays = Arrays.asList(setting.getWeekdays().split(","));
            if (!weekdays.contains(String.valueOf(dayValue))) {
                return false;
            }
        }
        
        // 检查时间
        LocalTime currentTime = now.toLocalTime();
        LocalTime startTime = setting.getStartTime();
        LocalTime endTime = setting.getEndTime();
        
        if (startTime == null || endTime == null) {
            return false;
        }
        
        // 处理跨天的情况（如22:00到08:00）
        if (startTime.isAfter(endTime)) {
            return currentTime.isAfter(startTime) || currentTime.isBefore(endTime);
        } else {
            return currentTime.isAfter(startTime) && currentTime.isBefore(endTime);
        }
    }

    /**
     * 检查智能模式
     * 智能模式会根据用户的活跃状态自动判断
     */
    private boolean isInSmartMode(DoNotDisturbSetting setting, LocalDateTime now) {
        // 智能模式的简单实现：
        // 1. 工作日的工作时间（9:00-18:00）不免打扰
        // 2. 其他时间免打扰
        
        DayOfWeek dayOfWeek = now.getDayOfWeek();
        LocalTime currentTime = now.toLocalTime();
        
        // 周末免打扰
        if (dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY) {
            return true;
        }
        
        // 工作日非工作时间免打扰
        LocalTime workStart = LocalTime.of(9, 0);
        LocalTime workEnd = LocalTime.of(18, 0);
        
        return currentTime.isBefore(workStart) || currentTime.isAfter(workEnd);
    }
}