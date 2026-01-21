package com.mota.project.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mota.common.core.result.Result;
import com.mota.project.entity.Activity;
import com.mota.project.mapper.ActivityMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 活动动态控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityMapper activityMapper;

    /**
     * 获取活动动态列表
     */
    @GetMapping
    public Result<Map<String, Object>> list(
            @RequestParam(value = "projectId", required = false) Long projectId,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "page", defaultValue = "1") Integer page,
            @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize) {
        
        LambdaQueryWrapper<Activity> wrapper = new LambdaQueryWrapper<>();
        
        if (projectId != null) {
            wrapper.eq(Activity::getProjectId, projectId);
        }
        if (userId != null) {
            wrapper.eq(Activity::getUserId, userId);
        }
        if (type != null && !type.isEmpty()) {
            wrapper.eq(Activity::getType, type);
        }
        
        wrapper.orderByDesc(Activity::getCreatedAt);
        
        List<Activity> activities = activityMapper.selectList(wrapper);
        
        Map<String, Object> result = new HashMap<>();
        result.put("list", activities);
        result.put("total", activities.size());
        
        return Result.success(result);
    }

    /**
     * 获取最近活动动态
     */
    @GetMapping("/recent")
    public Result<List<Activity>> recent(
            @RequestParam(value = "limit", defaultValue = "6") Integer limit) {
        try {
            log.info("获取最近活动动态, limit: {}", limit);
            LambdaQueryWrapper<Activity> wrapper = new LambdaQueryWrapper<>();
            wrapper.orderByDesc(Activity::getCreatedAt);
            wrapper.last("LIMIT " + limit);
            
            List<Activity> activities = activityMapper.selectList(wrapper);
            log.info("获取最近活动动态成功, 返回记录数: {}", activities.size());
            return Result.success(activities);
        } catch (Exception e) {
            log.error("获取最近活动动态失败, limit: {}, error: {}", limit, e.getMessage(), e);
            throw e;
        }
    }
}