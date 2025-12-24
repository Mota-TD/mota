package com.mota.project.controller;

import com.mota.common.core.result.Result;
import com.mota.project.mapper.ActivityMapper;
import com.mota.project.mapper.ProjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 仪表盘控制器
 */
@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final ProjectMapper projectMapper;
    private final ActivityMapper activityMapper;

    /**
     * 获取仪表盘统计数据
     */
    @GetMapping("/stats")
    public Result<Map<String, Object>> getStats() {
        Map<String, Object> data = new HashMap<>();
        
        // 项目统计
        Long projectCount = projectMapper.selectCount(null);
        data.put("projectCount", projectCount);
        
        // 活动统计
        Long activityCount = activityMapper.selectCount(null);
        data.put("activityCount", activityCount);
        
        // 模拟其他统计数据
        data.put("issueCount", 16);
        data.put("completedIssueCount", 5);
        data.put("inProgressIssueCount", 6);
        data.put("todoIssueCount", 5);
        data.put("memberCount", 5);
        data.put("sprintCount", 5);
        data.put("activeSprintCount", 2);
        
        // 本周统计
        Map<String, Object> weekStats = new HashMap<>();
        weekStats.put("newIssues", 8);
        weekStats.put("completedIssues", 3);
        weekStats.put("newProjects", 1);
        data.put("weekStats", weekStats);
        
        // 趋势数据
        data.put("issueTrend", new int[]{5, 8, 12, 10, 15, 13, 16});
        data.put("completionTrend", new int[]{2, 3, 5, 4, 6, 5, 8});
        
        return Result.success(data);
    }

    /**
     * 获取项目概览
     */
    @GetMapping("/project-overview")
    public Result<Map<String, Object>> getProjectOverview() {
        Map<String, Object> data = new HashMap<>();
        data.put("total", 4);
        data.put("active", 3);
        data.put("completed", 1);
        data.put("archived", 0);
        
        return Result.success(data);
    }

    /**
     * 获取团队工作量
     */
    @GetMapping("/workload")
    public Result<List<Map<String, Object>>> getWorkload() {
        // 模拟团队成员工作量数据
        List<Map<String, Object>> workloadData = new ArrayList<>();
        workloadData.add(Map.of("name", "张三", "assigned", 5, "completed", 3, "inProgress", 2));
        workloadData.add(Map.of("name", "李四", "assigned", 4, "completed", 2, "inProgress", 2));
        workloadData.add(Map.of("name", "王五", "assigned", 3, "completed", 1, "inProgress", 2));
        workloadData.add(Map.of("name", "赵六", "assigned", 4, "completed", 2, "inProgress", 1));
        
        return Result.success(workloadData);
    }
}