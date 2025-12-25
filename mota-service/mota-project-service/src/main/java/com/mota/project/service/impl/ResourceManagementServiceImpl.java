package com.mota.project.service.impl;

import com.mota.project.dto.resource.*;
import com.mota.project.service.ResourceManagementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 资源管理服务实现类
 * 提供资源管理相关功能的实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ResourceManagementServiceImpl implements ResourceManagementService {
    
    private static final String[] NAMES = {"张三", "李四", "王五", "赵六", "钱七", "孙八", "周九", "吴十"};
    private static final String[] DEPARTMENTS = {"研发部", "产品部", "设计部", "测试部", "运维部"};
    private static final String[] PROJECTS = {"项目A", "项目B", "项目C", "项目D", "项目E"};
    private static final Random random = new Random();
    
    @Override
    public WorkloadStatsData getWorkloadStats(Long userId, LocalDate startDate, LocalDate endDate) {
        log.info("获取用户工作量统计: userId={}, startDate={}, endDate={}", userId, startDate, endDate);
        
        WorkloadStatsData data = new WorkloadStatsData();
        data.setUserId(userId);
        data.setUserName(NAMES[userId.intValue() % NAMES.length]);
        data.setAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=" + userId);
        
        // 生成任务统计
        int totalTasks = 15 + random.nextInt(20);
        int completedTasks = random.nextInt(totalTasks);
        int inProgressTasks = random.nextInt(totalTasks - completedTasks);
        int overdueTasks = random.nextInt(5);
        
        data.setTotalTasks(totalTasks);
        data.setCompletedTasks(completedTasks);
        data.setInProgressTasks(inProgressTasks);
        data.setOverdueTasks(overdueTasks);
        
        // 生成工时统计
        double totalHours = 160.0; // 假设每月160小时
        double usedHours = 80 + random.nextDouble() * 100;
        data.setTotalHours(totalHours);
        data.setUsedHours(Math.round(usedHours * 10) / 10.0);
        data.setRemainingHours(Math.round((totalHours - usedHours) * 10) / 10.0);
        
        // 计算工作负载
        double workloadPercentage = (usedHours / totalHours) * 100;
        data.setWorkloadPercentage(Math.round(workloadPercentage * 10) / 10.0);
        data.setWorkloadStatus(getWorkloadStatus(workloadPercentage));
        
        // 生成每日工作量
        List<WorkloadStatsData.DailyWorkload> dailyWorkloads = new ArrayList<>();
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            WorkloadStatsData.DailyWorkload daily = new WorkloadStatsData.DailyWorkload();
            daily.setDate(current.format(DateTimeFormatter.ISO_DATE));
            daily.setPlannedHours(8.0);
            daily.setActualHours(6 + random.nextDouble() * 4);
            daily.setTaskCount(2 + random.nextInt(5));
            dailyWorkloads.add(daily);
            current = current.plusDays(1);
        }
        data.setDailyWorkloads(dailyWorkloads);
        
        // 生成项目工作量分布
        List<WorkloadStatsData.ProjectWorkload> projectWorkloads = new ArrayList<>();
        double remainingPercentage = 100.0;
        for (int i = 0; i < 3 + random.nextInt(3); i++) {
            WorkloadStatsData.ProjectWorkload pw = new WorkloadStatsData.ProjectWorkload();
            pw.setProjectId((long) (i + 1));
            pw.setProjectName(PROJECTS[i % PROJECTS.length]);
            pw.setTaskCount(3 + random.nextInt(8));
            double percentage = i == 0 ? 30 + random.nextDouble() * 20 : random.nextDouble() * remainingPercentage * 0.6;
            pw.setHoursPercentage(Math.round(percentage * 10) / 10.0);
            pw.setTotalHours(Math.round(usedHours * percentage / 100 * 10) / 10.0);
            remainingPercentage -= percentage;
            projectWorkloads.add(pw);
        }
        data.setProjectWorkloads(projectWorkloads);
        
        return data;
    }
    
    @Override
    public List<WorkloadStatsData> getTeamWorkloadStats(Long teamId, LocalDate startDate, LocalDate endDate) {
        log.info("获取团队工作量统计: teamId={}, startDate={}, endDate={}", teamId, startDate, endDate);
        
        List<WorkloadStatsData> result = new ArrayList<>();
        int memberCount = 5 + random.nextInt(5);
        
        for (int i = 0; i < memberCount; i++) {
            result.add(getWorkloadStats((long) (i + 1), startDate, endDate));
        }
        
        return result;
    }
    
    @Override
    public TeamDistributionData getTeamDistribution(Long teamId, LocalDate startDate, LocalDate endDate) {
        log.info("获取团队工作量分布: teamId={}, startDate={}, endDate={}", teamId, startDate, endDate);
        
        TeamDistributionData data = new TeamDistributionData();
        data.setTeamId(teamId);
        data.setTeamName("研发一组");
        
        int totalMembers = 8 + random.nextInt(5);
        data.setTotalMembers(totalMembers);
        data.setActiveMembers(totalMembers - random.nextInt(2));
        data.setTotalTasks(50 + random.nextInt(100));
        data.setTotalHours(totalMembers * 160.0);
        data.setAverageWorkload(60 + random.nextDouble() * 30);
        
        // 生成成员工作量
        List<TeamDistributionData.MemberWorkload> memberWorkloads = new ArrayList<>();
        for (int i = 0; i < totalMembers; i++) {
            TeamDistributionData.MemberWorkload mw = new TeamDistributionData.MemberWorkload();
            mw.setUserId((long) (i + 1));
            mw.setUserName(NAMES[i % NAMES.length]);
            mw.setAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=" + (i + 1));
            mw.setTaskCount(5 + random.nextInt(15));
            mw.setHours(80 + random.nextDouble() * 80);
            double workload = 50 + random.nextDouble() * 60;
            mw.setWorkloadPercentage(Math.round(workload * 10) / 10.0);
            mw.setWorkloadStatus(getWorkloadStatus(workload));
            mw.setCompletionRate(60 + random.nextDouble() * 35);
            memberWorkloads.add(mw);
        }
        data.setMemberWorkloads(memberWorkloads);
        
        // 生成状态分布
        TeamDistributionData.StatusDistribution statusDist = new TeamDistributionData.StatusDistribution();
        int total = data.getTotalTasks();
        statusDist.setCompleted((int) (total * 0.4));
        statusDist.setInProgress((int) (total * 0.35));
        statusDist.setPending((int) (total * 0.15));
        statusDist.setOverdue((int) (total * 0.07));
        statusDist.setCancelled((int) (total * 0.03));
        data.setStatusDistribution(statusDist);
        
        // 生成优先级分布
        TeamDistributionData.PriorityDistribution priorityDist = new TeamDistributionData.PriorityDistribution();
        priorityDist.setUrgent((int) (total * 0.1));
        priorityDist.setHigh((int) (total * 0.25));
        priorityDist.setMedium((int) (total * 0.45));
        priorityDist.setLow((int) (total * 0.2));
        data.setPriorityDistribution(priorityDist);
        
        return data;
    }
    
    @Override
    public WorkloadAlertData getWorkloadAlerts(Long teamId, List<String> alertTypes) {
        log.info("获取工作量预警: teamId={}, alertTypes={}", teamId, alertTypes);
        
        WorkloadAlertData data = new WorkloadAlertData();
        
        List<WorkloadAlertData.Alert> alerts = new ArrayList<>();
        
        // 生成过载预警
        for (int i = 0; i < 2 + random.nextInt(3); i++) {
            WorkloadAlertData.Alert alert = new WorkloadAlertData.Alert();
            alert.setAlertId((long) (i + 1));
            alert.setUserId((long) (i + 1));
            alert.setUserName(NAMES[i % NAMES.length]);
            alert.setAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=" + (i + 1));
            alert.setAlertType("OVERLOAD");
            alert.setAlertLevel("HIGH");
            alert.setTitle(NAMES[i % NAMES.length] + " 工作量过载");
            alert.setDescription("当前工作负载已超过100%，建议重新分配任务");
            alert.setCurrentWorkload(110 + random.nextDouble() * 30);
            alert.setSuggestedWorkload(80.0);
            alert.setAffectedTasks(5 + random.nextInt(5));
            alert.setAffectedProjects(Arrays.asList(PROJECTS[0], PROJECTS[1]));
            alert.setSuggestions(Arrays.asList(
                "将部分任务转移给其他成员",
                "延长任务截止日期",
                "增加团队人手"
            ));
            alert.setAlertTime(LocalDateTime.now().minusHours(random.nextInt(48)));
            alert.setResolved(false);
            alerts.add(alert);
        }
        
        // 生成空闲预警
        for (int i = 0; i < 1 + random.nextInt(2); i++) {
            WorkloadAlertData.Alert alert = new WorkloadAlertData.Alert();
            alert.setAlertId((long) (10 + i));
            alert.setUserId((long) (5 + i));
            alert.setUserName(NAMES[(5 + i) % NAMES.length]);
            alert.setAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=" + (5 + i));
            alert.setAlertType("IDLE");
            alert.setAlertLevel("MEDIUM");
            alert.setTitle(NAMES[(5 + i) % NAMES.length] + " 工作量不足");
            alert.setDescription("当前工作负载低于50%，可以分配更多任务");
            alert.setCurrentWorkload(20 + random.nextDouble() * 25);
            alert.setSuggestedWorkload(70.0);
            alert.setAffectedTasks(1 + random.nextInt(3));
            alert.setAffectedProjects(Arrays.asList(PROJECTS[2]));
            alert.setSuggestions(Arrays.asList(
                "分配更多任务",
                "参与其他项目支援",
                "安排培训学习"
            ));
            alert.setAlertTime(LocalDateTime.now().minusHours(random.nextInt(24)));
            alert.setResolved(false);
            alerts.add(alert);
        }
        
        // 生成即将过载预警
        WorkloadAlertData.Alert nearOverload = new WorkloadAlertData.Alert();
        nearOverload.setAlertId(20L);
        nearOverload.setUserId(3L);
        nearOverload.setUserName(NAMES[2]);
        nearOverload.setAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=3");
        nearOverload.setAlertType("NEAR_OVERLOAD");
        nearOverload.setAlertLevel("MEDIUM");
        nearOverload.setTitle(NAMES[2] + " 即将过载");
        nearOverload.setDescription("当前工作负载接近100%，需要关注");
        nearOverload.setCurrentWorkload(90 + random.nextDouble() * 8);
        nearOverload.setSuggestedWorkload(80.0);
        nearOverload.setAffectedTasks(3);
        nearOverload.setAffectedProjects(Arrays.asList(PROJECTS[0]));
        nearOverload.setSuggestions(Arrays.asList(
            "暂停分配新任务",
            "评估现有任务优先级"
        ));
        nearOverload.setAlertTime(LocalDateTime.now().minusHours(2));
        nearOverload.setResolved(false);
        alerts.add(nearOverload);
        
        data.setAlerts(alerts);
        
        // 统计
        data.setTotalAlerts(alerts.size());
        data.setOverloadAlerts((int) alerts.stream().filter(a -> "OVERLOAD".equals(a.getAlertType())).count());
        data.setIdleAlerts((int) alerts.stream().filter(a -> "IDLE".equals(a.getAlertType())).count());
        data.setNearOverloadAlerts((int) alerts.stream().filter(a -> "NEAR_OVERLOAD".equals(a.getAlertType())).count());
        
        // 生成预警趋势
        List<WorkloadAlertData.AlertSummary> alertTrend = new ArrayList<>();
        LocalDate current = LocalDate.now().minusDays(6);
        for (int i = 0; i < 7; i++) {
            WorkloadAlertData.AlertSummary summary = new WorkloadAlertData.AlertSummary();
            summary.setDate(current.format(DateTimeFormatter.ISO_DATE));
            summary.setOverloadCount(1 + random.nextInt(3));
            summary.setIdleCount(random.nextInt(2));
            summary.setNormalCount(5 + random.nextInt(3));
            alertTrend.add(summary);
            current = current.plusDays(1);
        }
        data.setAlertTrend(alertTrend);
        
        return data;
    }
    
    @Override
    public ResourceCalendarData getResourceCalendar(Long teamId, List<Long> userIds, LocalDate startDate, LocalDate endDate) {
        log.info("获取资源日历: teamId={}, userIds={}, startDate={}, endDate={}", teamId, userIds, startDate, endDate);
        
        ResourceCalendarData data = new ResourceCalendarData();
        data.setStartDate(startDate);
        data.setEndDate(endDate);
        
        // 生成日期列
        List<ResourceCalendarData.DateColumn> dates = new ArrayList<>();
        LocalDate current = startDate;
        String[] weekDays = {"周日", "周一", "周二", "周三", "周四", "周五", "周六"};
        while (!current.isAfter(endDate)) {
            ResourceCalendarData.DateColumn dc = new ResourceCalendarData.DateColumn();
            dc.setDate(current);
            dc.setDayOfWeek(weekDays[current.getDayOfWeek().getValue() % 7]);
            dc.setIsWorkday(current.getDayOfWeek().getValue() < 6);
            dc.setIsHoliday(false);
            dates.add(dc);
            current = current.plusDays(1);
        }
        data.setDates(dates);
        
        // 生成资源行
        List<ResourceCalendarData.ResourceRow> resources = new ArrayList<>();
        int memberCount = userIds != null && !userIds.isEmpty() ? userIds.size() : 6;
        
        for (int i = 0; i < memberCount; i++) {
            ResourceCalendarData.ResourceRow row = new ResourceCalendarData.ResourceRow();
            long userId = userIds != null && !userIds.isEmpty() ? userIds.get(i) : (i + 1);
            row.setUserId(userId);
            row.setUserName(NAMES[(int) (userId % NAMES.length)]);
            row.setAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=" + userId);
            row.setDepartment(DEPARTMENTS[i % DEPARTMENTS.length]);
            row.setPosition("工程师");
            
            // 生成每日分配
            List<ResourceCalendarData.DayAllocation> allocations = new ArrayList<>();
            for (ResourceCalendarData.DateColumn date : dates) {
                ResourceCalendarData.DayAllocation alloc = new ResourceCalendarData.DayAllocation();
                alloc.setDate(date.getDate());
                
                if (date.getIsWorkday()) {
                    alloc.setAvailableHours(8.0);
                    double allocated = 4 + random.nextDouble() * 6;
                    alloc.setAllocatedHours(Math.round(allocated * 10) / 10.0);
                    double utilization = (allocated / 8.0) * 100;
                    alloc.setUtilizationPercentage(Math.round(utilization * 10) / 10.0);
                    alloc.setStatus(getAllocationStatus(utilization));
                    
                    // 生成任务
                    List<ResourceCalendarData.TaskAllocation> tasks = new ArrayList<>();
                    int taskCount = 1 + random.nextInt(3);
                    for (int t = 0; t < taskCount; t++) {
                        ResourceCalendarData.TaskAllocation task = new ResourceCalendarData.TaskAllocation();
                        task.setTaskId((long) (i * 100 + t));
                        task.setTaskName("任务" + (t + 1));
                        task.setProjectId((long) (t % 3 + 1));
                        task.setProjectName(PROJECTS[t % PROJECTS.length]);
                        task.setHours(2 + random.nextDouble() * 3);
                        task.setPriority(t == 0 ? "HIGH" : "MEDIUM");
                        tasks.add(task);
                    }
                    alloc.setTasks(tasks);
                } else {
                    alloc.setAvailableHours(0.0);
                    alloc.setAllocatedHours(0.0);
                    alloc.setUtilizationPercentage(0.0);
                    alloc.setStatus("OFF");
                    alloc.setTasks(new ArrayList<>());
                }
                
                allocations.add(alloc);
            }
            row.setAllocations(allocations);
            resources.add(row);
        }
        data.setResources(resources);
        
        return data;
    }
    
    @Override
    public ResourceUtilizationData getResourceUtilization(Long teamId, String period, LocalDate startDate, LocalDate endDate) {
        log.info("获取资源利用率: teamId={}, period={}, startDate={}, endDate={}", teamId, period, startDate, endDate);
        
        ResourceUtilizationData data = new ResourceUtilizationData();
        data.setPeriod(period);
        data.setStartDate(startDate.format(DateTimeFormatter.ISO_DATE));
        data.setEndDate(endDate.format(DateTimeFormatter.ISO_DATE));
        data.setTeamAverageUtilization(65 + random.nextDouble() * 20);
        data.setTargetUtilization(80.0);
        
        // 生成利用率趋势
        List<ResourceUtilizationData.UtilizationTrend> trends = new ArrayList<>();
        int periods = "DAILY".equals(period) ? 14 : ("WEEKLY".equals(period) ? 8 : 6);
        for (int i = 0; i < periods; i++) {
            ResourceUtilizationData.UtilizationTrend trend = new ResourceUtilizationData.UtilizationTrend();
            if ("DAILY".equals(period)) {
                trend.setPeriod(startDate.plusDays(i).format(DateTimeFormatter.ISO_DATE));
            } else if ("WEEKLY".equals(period)) {
                trend.setPeriod("第" + (i + 1) + "周");
            } else {
                trend.setPeriod(startDate.plusMonths(i).format(DateTimeFormatter.ofPattern("yyyy-MM")));
            }
            trend.setAvailableHours(160.0);
            double actual = 100 + random.nextDouble() * 80;
            trend.setActualHours(Math.round(actual * 10) / 10.0);
            trend.setUtilizationPercentage(Math.round(actual / 160 * 1000) / 10.0);
            trend.setBillableHours(Math.round(actual * 0.85 * 10) / 10.0);
            trend.setBillableRate(Math.round(actual * 0.85 / actual * 1000) / 10.0);
            trends.add(trend);
        }
        data.setUtilizationTrends(trends);
        
        // 生成成员利用率
        List<ResourceUtilizationData.MemberUtilization> memberUtils = new ArrayList<>();
        for (int i = 0; i < 8; i++) {
            ResourceUtilizationData.MemberUtilization mu = new ResourceUtilizationData.MemberUtilization();
            mu.setUserId((long) (i + 1));
            mu.setUserName(NAMES[i % NAMES.length]);
            mu.setAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=" + (i + 1));
            mu.setDepartment(DEPARTMENTS[i % DEPARTMENTS.length]);
            mu.setAvailableHours(160.0);
            double allocated = 100 + random.nextDouble() * 80;
            mu.setAllocatedHours(Math.round(allocated * 10) / 10.0);
            double actual = allocated * (0.8 + random.nextDouble() * 0.3);
            mu.setActualHours(Math.round(actual * 10) / 10.0);
            double utilization = actual / 160 * 100;
            mu.setUtilizationPercentage(Math.round(utilization * 10) / 10.0);
            mu.setEfficiencyIndex(Math.round(actual / allocated * 100) / 100.0);
            mu.setUtilizationStatus(getUtilizationStatus(utilization));
            mu.setTrend(random.nextBoolean() ? "UP" : (random.nextBoolean() ? "DOWN" : "STABLE"));
            memberUtils.add(mu);
        }
        data.setMemberUtilizations(memberUtils);
        
        // 生成项目利用率
        List<ResourceUtilizationData.ProjectUtilization> projectUtils = new ArrayList<>();
        double totalHours = memberUtils.stream().mapToDouble(ResourceUtilizationData.MemberUtilization::getActualHours).sum();
        for (int i = 0; i < 5; i++) {
            ResourceUtilizationData.ProjectUtilization pu = new ResourceUtilizationData.ProjectUtilization();
            pu.setProjectId((long) (i + 1));
            pu.setProjectName(PROJECTS[i]);
            double hours = totalHours * (0.1 + random.nextDouble() * 0.25);
            pu.setAllocatedHours(Math.round(hours * 10) / 10.0);
            pu.setActualHours(Math.round(hours * (0.9 + random.nextDouble() * 0.2) * 10) / 10.0);
            pu.setHoursPercentage(Math.round(hours / totalHours * 1000) / 10.0);
            pu.setMemberCount(2 + random.nextInt(4));
            projectUtils.add(pu);
        }
        data.setProjectUtilizations(projectUtils);
        
        // 生成利用率分布
        ResourceUtilizationData.UtilizationDistribution dist = new ResourceUtilizationData.UtilizationDistribution();
        dist.setLowCount((int) memberUtils.stream().filter(m -> m.getUtilizationPercentage() < 50).count());
        dist.setOptimalCount((int) memberUtils.stream().filter(m -> m.getUtilizationPercentage() >= 50 && m.getUtilizationPercentage() < 80).count());
        dist.setHighCount((int) memberUtils.stream().filter(m -> m.getUtilizationPercentage() >= 80 && m.getUtilizationPercentage() <= 100).count());
        dist.setOverutilizedCount((int) memberUtils.stream().filter(m -> m.getUtilizationPercentage() > 100).count());
        data.setDistribution(dist);
        
        return data;
    }
    
    @Override
    public ProjectConflictData getProjectConflicts(Long teamId, Long userId, LocalDate startDate, LocalDate endDate) {
        log.info("获取跨项目资源冲突: teamId={}, userId={}, startDate={}, endDate={}", teamId, userId, startDate, endDate);
        
        ProjectConflictData data = new ProjectConflictData();
        
        List<ProjectConflictData.Conflict> conflicts = new ArrayList<>();
        
        // 生成时间重叠冲突
        for (int i = 0; i < 2 + random.nextInt(2); i++) {
            ProjectConflictData.Conflict conflict = new ProjectConflictData.Conflict();
            conflict.setConflictId((long) (i + 1));
            conflict.setConflictType("TIME_OVERLAP");
            conflict.setConflictLevel(i == 0 ? "HIGH" : "MEDIUM");
            conflict.setDescription("多个项目任务时间重叠，导致资源分配冲突");
            
            ProjectConflictData.ConflictUser user = new ProjectConflictData.ConflictUser();
            user.setUserId((long) (i + 1));
            user.setUserName(NAMES[i % NAMES.length]);
            user.setAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=" + (i + 1));
            user.setDepartment(DEPARTMENTS[i % DEPARTMENTS.length]);
            conflict.setUser(user);
            
            List<ProjectConflictData.ConflictProject> projects = new ArrayList<>();
            for (int j = 0; j < 2; j++) {
                ProjectConflictData.ConflictProject cp = new ProjectConflictData.ConflictProject();
                cp.setProjectId((long) (j + 1));
                cp.setProjectName(PROJECTS[j]);
                cp.setPriority(j == 0 ? "HIGH" : "MEDIUM");
                cp.setAllocatedHours(20 + random.nextDouble() * 20);
                projects.add(cp);
            }
            conflict.setProjects(projects);
            
            List<ProjectConflictData.ConflictTask> tasks = new ArrayList<>();
            for (int j = 0; j < 2; j++) {
                ProjectConflictData.ConflictTask ct = new ProjectConflictData.ConflictTask();
                ct.setTaskId((long) (i * 10 + j));
                ct.setTaskName("任务" + (j + 1));
                ct.setProjectId((long) (j + 1));
                ct.setProjectName(PROJECTS[j]);
                ct.setStartDate(startDate.plusDays(random.nextInt(5)));
                ct.setEndDate(startDate.plusDays(5 + random.nextInt(5)));
                ct.setEstimatedHours(16 + random.nextDouble() * 16);
                ct.setPriority(j == 0 ? "HIGH" : "MEDIUM");
                tasks.add(ct);
            }
            conflict.setTasks(tasks);
            
            conflict.setConflictStartDate(startDate.plusDays(2));
            conflict.setConflictEndDate(startDate.plusDays(7));
            conflict.setConflictHours(24 + random.nextDouble() * 16);
            conflict.setAvailableHours(40.0);
            conflict.setExcessHours(conflict.getConflictHours() - conflict.getAvailableHours());
            
            List<ProjectConflictData.ResolutionSuggestion> suggestions = new ArrayList<>();
            ProjectConflictData.ResolutionSuggestion s1 = new ProjectConflictData.ResolutionSuggestion();
            s1.setSuggestionType("REASSIGN");
            s1.setDescription("将低优先级任务重新分配给其他成员");
            s1.setImpactAssessment("可能影响项目B的进度");
            s1.setRecommendationScore(4);
            suggestions.add(s1);
            
            ProjectConflictData.ResolutionSuggestion s2 = new ProjectConflictData.ResolutionSuggestion();
            s2.setSuggestionType("RESCHEDULE");
            s2.setDescription("调整任务时间，错开冲突时段");
            s2.setImpactAssessment("需要与项目经理协调");
            s2.setRecommendationScore(3);
            suggestions.add(s2);
            conflict.setSuggestions(suggestions);
            
            conflict.setResolved(false);
            conflict.setDetectedTime(LocalDateTime.now().minusHours(random.nextInt(48)));
            
            conflicts.add(conflict);
        }
        
        // 生成资源过载冲突
        ProjectConflictData.Conflict overloadConflict = new ProjectConflictData.Conflict();
        overloadConflict.setConflictId(10L);
        overloadConflict.setConflictType("RESOURCE_OVERLOAD");
        overloadConflict.setConflictLevel("HIGH");
        overloadConflict.setDescription("资源在多个项目中分配过度，总工时超出可用时间");
        
        ProjectConflictData.ConflictUser overloadUser = new ProjectConflictData.ConflictUser();
        overloadUser.setUserId(3L);
        overloadUser.setUserName(NAMES[2]);
        overloadUser.setAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=3");
        overloadUser.setDepartment(DEPARTMENTS[0]);
        overloadConflict.setUser(overloadUser);
        
        List<ProjectConflictData.ConflictProject> overloadProjects = new ArrayList<>();
        for (int j = 0; j < 3; j++) {
            ProjectConflictData.ConflictProject cp = new ProjectConflictData.ConflictProject();
            cp.setProjectId((long) (j + 1));
            cp.setProjectName(PROJECTS[j]);
            cp.setPriority(j == 0 ? "HIGH" : (j == 1 ? "HIGH" : "MEDIUM"));
            cp.setAllocatedHours(30 + random.nextDouble() * 20);
            overloadProjects.add(cp);
        }
        overloadConflict.setProjects(overloadProjects);
        overloadConflict.setTasks(new ArrayList<>());
        overloadConflict.setConflictStartDate(startDate);
        overloadConflict.setConflictEndDate(endDate);
        overloadConflict.setConflictHours(overloadProjects.stream().mapToDouble(ProjectConflictData.ConflictProject::getAllocatedHours).sum());
        overloadConflict.setAvailableHours(160.0);
        overloadConflict.setExcessHours(overloadConflict.getConflictHours() - 160);
        
        List<ProjectConflictData.ResolutionSuggestion> overloadSuggestions = new ArrayList<>();
        ProjectConflictData.ResolutionSuggestion os1 = new ProjectConflictData.ResolutionSuggestion();
        os1.setSuggestionType("PRIORITIZE");
        os1.setDescription("根据项目优先级重新分配资源");
        os1.setImpactAssessment("低优先级项目可能延期");
        os1.setRecommendationScore(5);
        overloadSuggestions.add(os1);
        overloadConflict.setSuggestions(overloadSuggestions);
        overloadConflict.setResolved(false);
        overloadConflict.setDetectedTime(LocalDateTime.now().minusHours(12));
        conflicts.add(overloadConflict);
        
        data.setConflicts(conflicts);
        
        // 统计
        data.setTotalConflicts(conflicts.size());
        data.setHighPriorityConflicts((int) conflicts.stream().filter(c -> "HIGH".equals(c.getConflictLevel())).count());
        data.setMediumPriorityConflicts((int) conflicts.stream().filter(c -> "MEDIUM".equals(c.getConflictLevel())).count());
        data.setLowPriorityConflicts((int) conflicts.stream().filter(c -> "LOW".equals(c.getConflictLevel())).count());
        data.setResolvedConflicts((int) conflicts.stream().filter(ProjectConflictData.Conflict::getResolved).count());
        
        // 受影响的用户
        List<ProjectConflictData.AffectedUser> affectedUsers = conflicts.stream()
            .map(ProjectConflictData.Conflict::getUser)
            .collect(Collectors.groupingBy(ProjectConflictData.ConflictUser::getUserId))
            .entrySet().stream()
            .map(e -> {
                ProjectConflictData.AffectedUser au = new ProjectConflictData.AffectedUser();
                au.setUserId(e.getKey());
                au.setUserName(e.getValue().get(0).getUserName());
                au.setAvatar(e.getValue().get(0).getAvatar());
                au.setConflictCount(e.getValue().size());
                au.setProjectCount(2 + random.nextInt(2));
                au.setExcessHours(10 + random.nextDouble() * 20);
                return au;
            })
            .collect(Collectors.toList());
        data.setAffectedUsers(affectedUsers);
        
        return data;
    }
    
    @Override
    public boolean resolveConflict(Long conflictId, String resolution) {
        log.info("解决资源冲突: conflictId={}, resolution={}", conflictId, resolution);
        // 实际实现中应该更新数据库
        return true;
    }
    
    @Override
    public boolean resolveAlert(Long alertId) {
        log.info("标记预警为已处理: alertId={}", alertId);
        // 实际实现中应该更新数据库
        return true;
    }
    
    private String getWorkloadStatus(double percentage) {
        if (percentage < 50) return "LIGHT";
        if (percentage < 80) return "NORMAL";
        if (percentage <= 100) return "HEAVY";
        return "OVERLOAD";
    }
    
    private String getAllocationStatus(double utilization) {
        if (utilization < 25) return "AVAILABLE";
        if (utilization < 75) return "PARTIAL";
        if (utilization <= 100) return "FULL";
        return "OVERLOAD";
    }
    
    private String getUtilizationStatus(double utilization) {
        if (utilization < 50) return "LOW";
        if (utilization < 80) return "OPTIMAL";
        if (utilization <= 100) return "HIGH";
        return "OVERUTILIZED";
    }
}