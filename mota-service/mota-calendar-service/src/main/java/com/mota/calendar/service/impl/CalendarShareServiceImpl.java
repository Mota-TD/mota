package com.mota.calendar.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mota.calendar.entity.Calendar;
import com.mota.calendar.entity.CalendarShare;
import com.mota.calendar.mapper.CalendarShareMapper;
import com.mota.calendar.service.CalendarService;
import com.mota.calendar.service.CalendarShareService;
import com.mota.common.core.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 日历共享服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CalendarShareServiceImpl extends ServiceImpl<CalendarShareMapper, CalendarShare> implements CalendarShareService {

    @Lazy
    private final CalendarService calendarService;

    @Override
    @Transactional
    public CalendarShare shareToUser(Long calendarId, Long userId, String permission, Long operatorId) {
        validateCalendarOwnership(calendarId, operatorId);
        
        // 检查是否已共享
        CalendarShare existing = baseMapper.selectByCalendarIdAndUserId(calendarId, userId);
        if (existing != null) {
            existing.setPermission(permission);
            existing.setUpdateTime(LocalDateTime.now());
            updateById(existing);
            return existing;
        }
        
        CalendarShare share = new CalendarShare();
        share.setCalendarId(calendarId);
        share.setShareType("user");
        share.setShareTargetId(userId);
        share.setPermission(permission);
        share.setSharedBy(operatorId);
        share.setStatus("accepted"); // 用户共享默认接受
        share.setCreateTime(LocalDateTime.now());
        share.setUpdateTime(LocalDateTime.now());
        
        save(share);
        log.info("共享日历给用户成功: calendarId={}, userId={}", calendarId, userId);
        return share;
    }

    @Override
    @Transactional
    public CalendarShare shareToTeam(Long calendarId, Long teamId, String permission, Long operatorId) {
        validateCalendarOwnership(calendarId, operatorId);
        
        CalendarShare share = new CalendarShare();
        share.setCalendarId(calendarId);
        share.setShareType("team");
        share.setShareTargetId(teamId);
        share.setPermission(permission);
        share.setSharedBy(operatorId);
        share.setStatus("active");
        share.setCreateTime(LocalDateTime.now());
        share.setUpdateTime(LocalDateTime.now());
        
        save(share);
        log.info("共享日历给团队成功: calendarId={}, teamId={}", calendarId, teamId);
        return share;
    }

    @Override
    @Transactional
    public CalendarShare shareToDepartment(Long calendarId, Long departmentId, String permission, Long operatorId) {
        validateCalendarOwnership(calendarId, operatorId);
        
        CalendarShare share = new CalendarShare();
        share.setCalendarId(calendarId);
        share.setShareType("department");
        share.setShareTargetId(departmentId);
        share.setPermission(permission);
        share.setSharedBy(operatorId);
        share.setStatus("active");
        share.setCreateTime(LocalDateTime.now());
        share.setUpdateTime(LocalDateTime.now());
        
        save(share);
        log.info("共享日历给部门成功: calendarId={}, departmentId={}", calendarId, departmentId);
        return share;
    }

    @Override
    @Transactional
    public CalendarShare shareToAll(Long calendarId, String permission, Long operatorId) {
        validateCalendarOwnership(calendarId, operatorId);
        
        CalendarShare share = new CalendarShare();
        share.setCalendarId(calendarId);
        share.setShareType("all");
        share.setShareTargetId(0L); // 0表示所有人
        share.setPermission(permission);
        share.setSharedBy(operatorId);
        share.setStatus("active");
        share.setCreateTime(LocalDateTime.now());
        share.setUpdateTime(LocalDateTime.now());
        
        save(share);
        log.info("共享日历给所有人成功: calendarId={}", calendarId);
        return share;
    }

    @Override
    @Transactional
    public void cancelShare(Long shareId) {
        CalendarShare share = getById(shareId);
        if (share == null) {
            throw new BusinessException("共享记录不存在");
        }
        
        removeById(shareId);
        log.info("取消共享成功: shareId={}", shareId);
    }

    @Override
    @Transactional
    public void cancelAllShares(Long calendarId) {
        LambdaQueryWrapper<CalendarShare> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CalendarShare::getCalendarId, calendarId);
        remove(wrapper);
        log.info("取消日历所有共享成功: calendarId={}", calendarId);
    }

    @Override
    public List<CalendarShare> getCalendarShares(Long calendarId) {
        return baseMapper.selectByCalendarId(calendarId);
    }

    @Override
    public List<CalendarShare> getUserSharedCalendars(Long userId) {
        return baseMapper.selectByUserId(userId);
    }

    @Override
    public boolean hasPermission(Long calendarId, Long userId, String requiredPermission) {
        // 检查日历所有者
        Calendar calendar = calendarService.getCalendarById(calendarId);
        if (calendar != null && calendar.getUserId().equals(userId)) {
            return true; // 所有者拥有所有权限
        }
        
        // 检查用户共享权限
        CalendarShare share = baseMapper.selectByCalendarIdAndUserId(calendarId, userId);
        if (share != null) {
            return checkPermissionLevel(share.getPermission(), requiredPermission);
        }
        
        // TODO: 检查团队和部门共享权限
        
        return false;
    }

    @Override
    @Transactional
    public CalendarShare updatePermission(Long shareId, String permission) {
        CalendarShare share = getById(shareId);
        if (share == null) {
            throw new BusinessException("共享记录不存在");
        }
        
        share.setPermission(permission);
        share.setUpdateTime(LocalDateTime.now());
        updateById(share);
        
        log.info("更新共享权限成功: shareId={}, permission={}", shareId, permission);
        return share;
    }

    @Override
    @Transactional
    public void acceptShare(Long shareId, Long userId) {
        CalendarShare share = getById(shareId);
        if (share == null) {
            throw new BusinessException("共享记录不存在");
        }
        
        if (!share.getShareTargetId().equals(userId)) {
            throw new BusinessException("无权操作此共享");
        }
        
        share.setStatus("accepted");
        share.setUpdateTime(LocalDateTime.now());
        updateById(share);
        
        log.info("接受共享邀请成功: shareId={}", shareId);
    }

    @Override
    @Transactional
    public void rejectShare(Long shareId, Long userId) {
        CalendarShare share = getById(shareId);
        if (share == null) {
            throw new BusinessException("共享记录不存在");
        }
        
        if (!share.getShareTargetId().equals(userId)) {
            throw new BusinessException("无权操作此共享");
        }
        
        share.setStatus("rejected");
        share.setUpdateTime(LocalDateTime.now());
        updateById(share);
        
        log.info("拒绝共享邀请成功: shareId={}", shareId);
    }

    /**
     * 验证日历所有权
     */
    private void validateCalendarOwnership(Long calendarId, Long userId) {
        Calendar calendar = calendarService.getCalendarById(calendarId);
        if (calendar == null) {
            throw new BusinessException("日历不存在");
        }
        
        if (!calendar.getUserId().equals(userId)) {
            throw new BusinessException("只有日历所有者才能共享日历");
        }
    }

    /**
     * 检查权限级别
     */
    private boolean checkPermissionLevel(String actualPermission, String requiredPermission) {
        // 权限级别: manage > edit > view
        if ("manage".equals(actualPermission)) {
            return true;
        }
        if ("edit".equals(actualPermission)) {
            return !"manage".equals(requiredPermission);
        }
        if ("view".equals(actualPermission)) {
            return "view".equals(requiredPermission);
        }
        return false;
    }
}