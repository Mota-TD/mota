package com.mota.project.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * 效能指标控制器
 */
@RestController
@RequestMapping("/api/v1/metrics")
@RequiredArgsConstructor
public class MetricsController {

    /**
     * 获取所有效能指标（根路径）
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllMetrics(
            @RequestParam(value = "projectId", required = false) Long projectId,
            @RequestParam(value = "sprintId", required = false) Long sprintId,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate) {
        
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "success");
        
        Map<String, Object> data = new HashMap<>();
        
        // DORA 指标
        Map<String, Object> dora = new HashMap<>();
        dora.put("deploymentFrequency", Map.of("value", 4.2, "unit", "次/周", "trend", "up", "trendValue", 12.5));
        dora.put("leadTime", Map.of("value", 3.5, "unit", "天", "trend", "down", "trendValue", -8.3));
        dora.put("changeFailureRate", Map.of("value", 2.1, "unit", "%", "trend", "down", "trendValue", -15.2));
        dora.put("mttr", Map.of("value", 1.2, "unit", "小时", "trend", "down", "trendValue", -20.0));
        data.put("dora", dora);
        
        // 速度指标
        Map<String, Object> velocity = new HashMap<>();
        velocity.put("current", 42);
        velocity.put("average", 38);
        velocity.put("trend", "up");
        List<Map<String, Object>> history = new ArrayList<>();
        history.add(Map.of("sprint", "Sprint 1", "value", 35));
        history.add(Map.of("sprint", "Sprint 2", "value", 38));
        history.add(Map.of("sprint", "Sprint 3", "value", 40));
        history.add(Map.of("sprint", "Sprint 4", "value", 42));
        velocity.put("history", history);
        data.put("velocity", velocity);
        
        // 燃尽图数据
        Map<String, Object> burndown = new HashMap<>();
        List<Map<String, Object>> ideal = new ArrayList<>();
        List<Map<String, Object>> actual = new ArrayList<>();
        LocalDate burndownStart = LocalDate.now().minusDays(13);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM-dd");
        int[] idealValues = {100, 93, 86, 79, 71, 64, 57, 50, 43, 36, 29, 21, 14, 7, 0};
        int[] actualValues = {100, 95, 88, 82, 75, 70, 62, 55, 48, 42, 35, 28, 20, 12, 5};
        for (int i = 0; i < 15; i++) {
            String date = burndownStart.plusDays(i).format(formatter);
            ideal.add(Map.of("date", date, "value", idealValues[i]));
            actual.add(Map.of("date", date, "value", actualValues[i]));
        }
        burndown.put("ideal", ideal);
        burndown.put("actual", actual);
        data.put("burndown", burndown);
        
        // 事项统计
        Map<String, Object> issueStats = new HashMap<>();
        issueStats.put("total", 48);
        issueStats.put("open", 12);
        issueStats.put("inProgress", 8);
        issueStats.put("done", 25);
        issueStats.put("closed", 3);
        issueStats.put("byType", Map.of("story", 20, "task", 15, "bug", 10, "epic", 3));
        issueStats.put("byPriority", Map.of("highest", 5, "high", 12, "medium", 18, "low", 10, "lowest", 3));
        data.put("issueStats", issueStats);
        
        // 团队指标
        Map<String, Object> team = new HashMap<>();
        team.put("memberCount", 5);
        team.put("avgVelocity", 38);
        team.put("completionRate", 85.5);
        team.put("bugRate", 12.3);
        data.put("team", team);
        
        result.put("data", data);
        
        return ResponseEntity.ok(result);
    }

    /**
     * 获取 DORA 指标
     */
    @GetMapping("/dora")
    public ResponseEntity<Map<String, Object>> getDoraMetrics(
            @RequestParam(value = "projectId", required = false) Long projectId,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate) {
        
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "success");
        
        Map<String, Object> data = new HashMap<>();
        data.put("deploymentFrequency", Map.of("value", 4.2, "unit", "次/周", "trend", "up", "trendValue", 12.5));
        data.put("leadTime", Map.of("value", 3.5, "unit", "天", "trend", "down", "trendValue", -8.3));
        data.put("changeFailureRate", Map.of("value", 2.1, "unit", "%", "trend", "down", "trendValue", -15.2));
        data.put("mttr", Map.of("value", 1.2, "unit", "小时", "trend", "down", "trendValue", -20.0));
        
        result.put("data", data);
        
        return ResponseEntity.ok(result);
    }

    /**
     * 获取事项统计
     */
    @GetMapping("/issues")
    public ResponseEntity<Map<String, Object>> getIssueStats(
            @RequestParam(value = "projectId", required = false) Long projectId,
            @RequestParam(value = "sprintId", required = false) Long sprintId) {
        
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "success");
        
        Map<String, Object> data = new HashMap<>();
        data.put("total", 48);
        data.put("open", 12);
        data.put("inProgress", 8);
        data.put("done", 25);
        data.put("closed", 3);
        data.put("byType", Map.of("story", 20, "task", 15, "bug", 10, "epic", 3));
        data.put("byPriority", Map.of("highest", 5, "high", 12, "medium", 18, "low", 10, "lowest", 3));
        
        result.put("data", data);
        
        return ResponseEntity.ok(result);
    }

    /**
     * 获取团队效能指标
     */
    @GetMapping("/team")
    public ResponseEntity<Map<String, Object>> getTeamMetrics(
            @RequestParam(value = "teamId", required = false) Long teamId) {
        
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "success");
        
        Map<String, Object> data = new HashMap<>();
        data.put("memberCount", 5);
        data.put("avgVelocity", 38);
        data.put("completionRate", 85.5);
        data.put("bugRate", 12.3);
        
        result.put("data", data);
        
        return ResponseEntity.ok(result);
    }

    /**
     * 获取效能概览
     */
    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getOverview(
            @RequestParam(value = "projectId", required = false) Long projectId,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate) {
        
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "success");
        
        Map<String, Object> data = new HashMap<>();
        
        // 整体效能指标
        data.put("velocity", 42);
        data.put("velocityTrend", 8.5);
        data.put("cycleTime", 3.2);
        data.put("cycleTimeTrend", -12.3);
        data.put("throughput", 28);
        data.put("throughputTrend", 15.2);
        data.put("defectRate", 2.1);
        data.put("defectRateTrend", -5.8);
        
        result.put("data", data);
        
        return ResponseEntity.ok(result);
    }

    /**
     * 获取燃尽图数据
     */
    @GetMapping("/burndown")
    public ResponseEntity<Map<String, Object>> getBurndown(
            @RequestParam(value = "sprintId", required = false) Long sprintId,
            @RequestParam(value = "projectId", required = false) Long projectId) {
        
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "success");
        
        // 生成燃尽图数据
        List<Map<String, Object>> burndownData = new ArrayList<>();
        LocalDate startDate = LocalDate.now().minusDays(13);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM-dd");
        
        int[] ideal = {100, 93, 86, 79, 71, 64, 57, 50, 43, 36, 29, 21, 14, 7, 0};
        int[] actual = {100, 95, 88, 82, 75, 70, 62, 55, 48, 42, 35, 28, 20, 12, 0};
        
        for (int i = 0; i < 15; i++) {
            Map<String, Object> point = new HashMap<>();
            point.put("date", startDate.plusDays(i).format(formatter));
            point.put("ideal", ideal[i]);
            point.put("actual", i < 14 ? actual[i] : null);
            burndownData.add(point);
        }
        
        Map<String, Object> data = new HashMap<>();
        data.put("burndown", burndownData);
        data.put("totalPoints", 100);
        data.put("completedPoints", 88);
        data.put("remainingPoints", 12);
        data.put("sprintName", "Sprint 3");
        
        result.put("data", data);
        
        return ResponseEntity.ok(result);
    }

    /**
     * 获取速度图数据
     */
    @GetMapping("/velocity")
    public ResponseEntity<Map<String, Object>> getVelocity(
            @RequestParam(value = "projectId", required = false) Long projectId,
            @RequestParam(value = "sprintCount", defaultValue = "6") Integer sprintCount) {
        
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "success");
        
        // 生成速度图数据
        List<Map<String, Object>> velocityData = new ArrayList<>();
        String[] sprints = {"Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4", "Sprint 5", "Sprint 6"};
        int[] committed = {40, 45, 42, 48, 50, 45};
        int[] completed = {38, 42, 40, 45, 48, 42};
        
        for (int i = 0; i < Math.min(sprintCount, sprints.length); i++) {
            Map<String, Object> point = new HashMap<>();
            point.put("sprint", sprints[i]);
            point.put("committed", committed[i]);
            point.put("completed", completed[i]);
            velocityData.add(point);
        }
        
        Map<String, Object> data = new HashMap<>();
        data.put("velocity", velocityData);
        data.put("averageVelocity", 42.5);
        data.put("completionRate", 93.2);
        
        result.put("data", data);
        
        return ResponseEntity.ok(result);
    }

    /**
     * 获取累积流图数据
     */
    @GetMapping("/cumulative-flow")
    public ResponseEntity<Map<String, Object>> getCumulativeFlow(
            @RequestParam(value = "projectId", required = false) Long projectId,
            @RequestParam(value = "days", defaultValue = "30") Integer days) {
        
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "success");
        
        // 生成累积流图数据
        List<Map<String, Object>> flowData = new ArrayList<>();
        LocalDate startDate = LocalDate.now().minusDays(days - 1);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM-dd");
        
        Random random = new Random(42);
        int todo = 20, inProgress = 5, done = 0;
        
        for (int i = 0; i < days; i++) {
            Map<String, Object> point = new HashMap<>();
            point.put("date", startDate.plusDays(i).format(formatter));
            point.put("todo", todo);
            point.put("inProgress", inProgress);
            point.put("done", done);
            flowData.add(point);
            
            // 模拟变化
            if (random.nextDouble() > 0.3 && todo > 0) {
                todo--;
                inProgress++;
            }
            if (random.nextDouble() > 0.4 && inProgress > 0) {
                inProgress--;
                done++;
            }
            if (random.nextDouble() > 0.7) {
                todo += random.nextInt(3);
            }
        }
        
        Map<String, Object> data = new HashMap<>();
        data.put("flow", flowData);
        
        result.put("data", data);
        
        return ResponseEntity.ok(result);
    }

    /**
     * 获取周期时间分布
     */
    @GetMapping("/cycle-time")
    public ResponseEntity<Map<String, Object>> getCycleTime(
            @RequestParam(value = "projectId", required = false) Long projectId) {
        
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "success");
        
        Map<String, Object> data = new HashMap<>();
        
        // 周期时间分布
        data.put("distribution", new int[]{5, 12, 18, 15, 8, 4, 2, 1});
        data.put("labels", new String[]{"1天", "2天", "3天", "4天", "5天", "6天", "7天", "7天+"});
        data.put("average", 3.2);
        data.put("median", 3.0);
        data.put("p85", 5.0);
        
        result.put("data", data);
        
        return ResponseEntity.ok(result);
    }

    /**
     * 获取团队效能
     */
    @GetMapping("/team-performance")
    public ResponseEntity<Map<String, Object>> getTeamPerformance(
            @RequestParam(value = "projectId", required = false) Long projectId) {
        
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "success");
        
        // 团队成员效能数据
        List<Map<String, Object>> members = new ArrayList<>();
        members.add(Map.of(
            "name", "张三",
            "avatar", "ZS",
            "completedTasks", 15,
            "storyPoints", 42,
            "avgCycleTime", 2.8,
            "efficiency", 95
        ));
        members.add(Map.of(
            "name", "李四",
            "avatar", "LS",
            "completedTasks", 12,
            "storyPoints", 35,
            "avgCycleTime", 3.2,
            "efficiency", 88
        ));
        members.add(Map.of(
            "name", "王五",
            "avatar", "WW",
            "completedTasks", 10,
            "storyPoints", 28,
            "avgCycleTime", 3.5,
            "efficiency", 82
        ));
        members.add(Map.of(
            "name", "赵六",
            "avatar", "ZL",
            "completedTasks", 8,
            "storyPoints", 22,
            "avgCycleTime", 4.0,
            "efficiency", 75
        ));
        
        Map<String, Object> data = new HashMap<>();
        data.put("members", members);
        data.put("teamAvgEfficiency", 85);
        
        result.put("data", data);
        
        return ResponseEntity.ok(result);
    }

    /**
     * 获取缺陷统计
     */
    @GetMapping("/defects")
    public ResponseEntity<Map<String, Object>> getDefects(
            @RequestParam(value = "projectId", required = false) Long projectId) {
        
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "success");
        
        Map<String, Object> data = new HashMap<>();
        
        // 缺陷统计
        data.put("total", 25);
        data.put("open", 8);
        data.put("inProgress", 5);
        data.put("resolved", 10);
        data.put("closed", 2);
        
        // 按严重程度分布
        data.put("bySeverity", Map.of(
            "critical", 2,
            "major", 8,
            "minor", 12,
            "trivial", 3
        ));
        
        // 按模块分布
        data.put("byModule", Map.of(
            "用户模块", 5,
            "项目模块", 8,
            "任务模块", 7,
            "报表模块", 5
        ));
        
        // 趋势数据
        data.put("trend", new int[]{3, 5, 4, 6, 8, 7, 5, 4, 3, 2});
        
        result.put("data", data);
        
        return ResponseEntity.ok(result);
    }
}