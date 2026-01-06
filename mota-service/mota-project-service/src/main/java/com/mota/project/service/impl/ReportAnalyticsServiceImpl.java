package com.mota.project.service.impl;

import com.mota.project.dto.report.*;
import com.mota.project.service.ReportAnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * 报表分析服务实现
 * 提供模拟数据用于前端展示
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReportAnalyticsServiceImpl implements ReportAnalyticsService {
    
    private final Random random = new Random();
    
    @Override
    public TeamEfficiencyKPI getTeamEfficiency(Long teamId, String period, LocalDate startDate, LocalDate endDate) {
        log.info("获取团队效能指标: teamId={}, period={}, startDate={}, endDate={}", teamId, period, startDate, endDate);
        
        TeamEfficiencyKPI kpi = new TeamEfficiencyKPI();
        kpi.setTeamId(teamId != null ? teamId : 1L);
        kpi.setTeamName(getTeamName(teamId));
        kpi.setPeriod(period != null ? period : "MONTHLY");
        
        // 核心指标
        kpi.setTotalTasks(150 + random.nextInt(100));
        kpi.setCompletedTasks((int)(kpi.getTotalTasks() * (0.6 + random.nextDouble() * 0.3)));
        kpi.setCompletionRate(kpi.getCompletedTasks() * 100.0 / kpi.getTotalTasks());
        kpi.setOnTimeCompletionRate(70.0 + random.nextDouble() * 25);
        kpi.setAvgCompletionDays(3.0 + random.nextDouble() * 5);
        kpi.setVelocity(15.0 + random.nextDouble() * 10);
        
        // 质量指标
        kpi.setBugRate(5.0 + random.nextDouble() * 10);
        kpi.setReworkRate(8.0 + random.nextDouble() * 12);
        kpi.setFirstTimePassRate(75.0 + random.nextDouble() * 20);
        
        // 效率指标
        kpi.setUtilizationRate(60.0 + random.nextDouble() * 30);
        kpi.setFocusTime(25.0 + random.nextDouble() * 15);
        kpi.setMeetingTime(5.0 + random.nextDouble() * 10);
        
        // 趋势数据
        kpi.setTrends(generateEfficiencyTrends(startDate, endDate, period));
        
        // 与上期对比
        kpi.setCompletionRateChange(-5.0 + random.nextDouble() * 10);
        kpi.setOnTimeRateChange(-3.0 + random.nextDouble() * 8);
        kpi.setVelocityChange(-2.0 + random.nextDouble() * 6);
        
        return kpi;
    }
    
    @Override
    public AvgCompletionTimeData getAvgCompletionTime(Long teamId, Long projectId, LocalDate startDate, LocalDate endDate) {
        log.info("获取平均完成时间: teamId={}, projectId={}, startDate={}, endDate={}", teamId, projectId, startDate, endDate);
        
        AvgCompletionTimeData data = new AvgCompletionTimeData();
        data.setTeamId(teamId != null ? teamId : 1L);
        data.setTeamName(getTeamName(teamId));
        data.setPeriod(startDate + " ~ " + endDate);
        
        // 总体统计
        data.setTotalCompletedTasks(80 + random.nextInt(50));
        data.setAvgCompletionDays(4.5 + random.nextDouble() * 3);
        data.setMedianCompletionDays(3.0 + random.nextDouble() * 2);
        data.setMinCompletionDays(0.5 + random.nextDouble() * 0.5);
        data.setMaxCompletionDays(15.0 + random.nextDouble() * 10);
        
        // 分布数据
        data.setDistribution(generateCompletionTimeDistribution());
        
        // 按优先级
        data.setByPriority(generateCompletionTimeByPriority());
        
        // 按类型
        data.setByType(generateCompletionTimeByType());
        
        // 趋势
        data.setTrends(generateCompletionTimeTrends(startDate, endDate));
        
        // 与上期对比
        data.setAvgDaysChange(-0.5 + random.nextDouble() * 1.5);
        
        return data;
    }
    
    @Override
    public OverdueRateData getOverdueRate(Long teamId, Long projectId, LocalDate startDate, LocalDate endDate) {
        log.info("获取逾期率统计: teamId={}, projectId={}, startDate={}, endDate={}", teamId, projectId, startDate, endDate);
        
        OverdueRateData data = new OverdueRateData();
        data.setTeamId(teamId != null ? teamId : 1L);
        data.setTeamName(getTeamName(teamId));
        data.setPeriod(startDate + " ~ " + endDate);
        
        // 总体统计
        data.setTotalTasks(120 + random.nextInt(80));
        data.setOverdueTasks((int)(data.getTotalTasks() * (0.1 + random.nextDouble() * 0.15)));
        data.setOverdueRate(data.getOverdueTasks() * 100.0 / data.getTotalTasks());
        data.setAvgOverdueDays(3.0 + random.nextDouble() * 5);
        
        // 严重程度分布
        int remaining = data.getOverdueTasks();
        data.setSlightlyOverdue((int)(remaining * 0.5));
        data.setModeratelyOverdue((int)(remaining * 0.3));
        data.setSeverelyOverdue(remaining - data.getSlightlyOverdue() - data.getModeratelyOverdue());
        
        // 逾期任务列表
        data.setOverdueTasks_list(generateOverdueTasks(Math.min(data.getOverdueTasks(), 10)));
        
        // 原因分析
        data.setReasons(generateOverdueReasons());
        
        // 趋势
        data.setTrends(generateOverdueTrends(startDate, endDate));
        
        // 按成员
        data.setByMember(generateOverdueByMember());
        
        // 与上期对比
        data.setOverdueRateChange(-2.0 + random.nextDouble() * 5);
        
        return data;
    }
    
    @Override
    public MemberContributionData getMemberContribution(Long teamId, String period, LocalDate startDate, LocalDate endDate) {
        log.info("获取成员贡献度: teamId={}, period={}, startDate={}, endDate={}", teamId, period, startDate, endDate);
        
        MemberContributionData data = new MemberContributionData();
        data.setTeamId(teamId != null ? teamId : 1L);
        data.setTeamName(getTeamName(teamId));
        data.setPeriod(period != null ? period : "MONTHLY");
        
        // 成员列表
        List<MemberContributionData.MemberContribution> members = generateMemberContributions();
        data.setMembers(members);
        
        // 总体统计
        data.setTotalMembers(members.size());
        data.setAvgContributionScore(members.stream()
            .mapToDouble(MemberContributionData.MemberContribution::getContributionScore)
            .average()
            .orElse(0.0));
        
        // 分布
        data.setDistribution(generateContributionDistribution(members));
        
        // 趋势
        data.setTrends(generateContributionTrends(startDate, endDate));
        
        // Top贡献者
        data.setTopContributors(members.subList(0, Math.min(3, members.size())));
        
        return data;
    }
    
    // ==================== 辅助方法 ====================
    
    private String getTeamName(Long teamId) {
        if (teamId == null) return "全部团队";
        String[] teams = {"总经办", "运营部", "市场部", "营销部", "财务部", "行政部", "科技部"};
        int index = (int)(teamId % teams.length);
        return teams[index];
    }
    
    private List<TeamEfficiencyKPI.EfficiencyTrend> generateEfficiencyTrends(LocalDate startDate, LocalDate endDate, String period) {
        List<TeamEfficiencyKPI.EfficiencyTrend> trends = new ArrayList<>();
        long days = ChronoUnit.DAYS.between(startDate, endDate);
        int points = Math.min((int)(days / 7) + 1, 12);
        
        for (int i = 0; i < points; i++) {
            TeamEfficiencyKPI.EfficiencyTrend trend = new TeamEfficiencyKPI.EfficiencyTrend();
            LocalDate date = startDate.plusDays(i * 7);
            trend.setPeriod(date.format(DateTimeFormatter.ofPattern("MM-dd")));
            trend.setCompletionRate(60.0 + random.nextDouble() * 30);
            trend.setOnTimeRate(70.0 + random.nextDouble() * 25);
            trend.setAvgCompletionDays(3.0 + random.nextDouble() * 4);
            trend.setVelocity(12.0 + random.nextDouble() * 10);
            trends.add(trend);
        }
        return trends;
    }
    
    private List<AvgCompletionTimeData.CompletionTimeDistribution> generateCompletionTimeDistribution() {
        List<AvgCompletionTimeData.CompletionTimeDistribution> list = new ArrayList<>();
        String[] ranges = {"0-1天", "1-3天", "3-7天", "7-14天", ">14天"};
        double[] percentages = {15, 35, 30, 15, 5};
        
        for (int i = 0; i < ranges.length; i++) {
            AvgCompletionTimeData.CompletionTimeDistribution dist = new AvgCompletionTimeData.CompletionTimeDistribution();
            dist.setRange(ranges[i]);
            dist.setPercentage(percentages[i] + random.nextDouble() * 5 - 2.5);
            dist.setCount((int)(dist.getPercentage() * 1.5));
            list.add(dist);
        }
        return list;
    }
    
    private List<AvgCompletionTimeData.CompletionTimeByPriority> generateCompletionTimeByPriority() {
        List<AvgCompletionTimeData.CompletionTimeByPriority> list = new ArrayList<>();
        String[] priorities = {"紧急", "高", "中", "低"};
        double[] avgDays = {1.5, 3.0, 5.0, 8.0};
        
        for (int i = 0; i < priorities.length; i++) {
            AvgCompletionTimeData.CompletionTimeByPriority item = new AvgCompletionTimeData.CompletionTimeByPriority();
            item.setPriority(priorities[i]);
            item.setAvgDays(avgDays[i] + random.nextDouble() * 2);
            item.setMinDays(avgDays[i] * 0.3);
            item.setMaxDays(avgDays[i] * 2.5);
            item.setTaskCount(20 + random.nextInt(30));
            list.add(item);
        }
        return list;
    }
    
    private List<AvgCompletionTimeData.CompletionTimeByType> generateCompletionTimeByType() {
        List<AvgCompletionTimeData.CompletionTimeByType> list = new ArrayList<>();
        String[] types = {"功能开发", "Bug修复", "优化改进", "文档编写", "测试任务"};
        double[] avgDays = {5.0, 2.0, 3.0, 1.5, 2.5};
        
        for (int i = 0; i < types.length; i++) {
            AvgCompletionTimeData.CompletionTimeByType item = new AvgCompletionTimeData.CompletionTimeByType();
            item.setTaskType(types[i]);
            item.setAvgDays(avgDays[i] + random.nextDouble() * 2);
            item.setTaskCount(15 + random.nextInt(25));
            list.add(item);
        }
        return list;
    }
    
    private List<AvgCompletionTimeData.CompletionTimeTrend> generateCompletionTimeTrends(LocalDate startDate, LocalDate endDate) {
        List<AvgCompletionTimeData.CompletionTimeTrend> trends = new ArrayList<>();
        long days = ChronoUnit.DAYS.between(startDate, endDate);
        int points = Math.min((int)(days / 7) + 1, 8);
        
        for (int i = 0; i < points; i++) {
            AvgCompletionTimeData.CompletionTimeTrend trend = new AvgCompletionTimeData.CompletionTimeTrend();
            LocalDate date = startDate.plusDays(i * 7);
            trend.setPeriod(date.format(DateTimeFormatter.ofPattern("MM-dd")));
            trend.setAvgDays(3.0 + random.nextDouble() * 4);
            trend.setMedianDays(2.5 + random.nextDouble() * 3);
            trend.setTaskCount(10 + random.nextInt(20));
            trends.add(trend);
        }
        return trends;
    }
    
    private List<OverdueRateData.OverdueTask> generateOverdueTasks(int count) {
        List<OverdueRateData.OverdueTask> tasks = new ArrayList<>();
        String[] taskNames = {"用户模块开发", "接口优化", "数据迁移", "性能测试", "文档更新", "Bug修复", "代码审查", "需求分析"};
        String[] priorities = {"紧急", "高", "中", "低"};
        String[] statuses = {"进行中", "待处理"};
        String[] users = {"张三", "李四", "王五", "赵六", "钱七"};
        
        for (int i = 0; i < count; i++) {
            OverdueRateData.OverdueTask task = new OverdueRateData.OverdueTask();
            task.setTaskId((long)(1000 + i));
            task.setTaskName(taskNames[random.nextInt(taskNames.length)] + "-" + (i + 1));
            task.setProjectId((long)(100 + random.nextInt(5)));
            task.setProjectName("项目" + task.getProjectId());
            task.setAssigneeId((long)(i + 1));
            task.setAssigneeName(users[random.nextInt(users.length)]);
            task.setDueDate(LocalDate.now().minusDays(random.nextInt(10) + 1).toString());
            task.setOverdueDays(1 + random.nextInt(10));
            task.setPriority(priorities[random.nextInt(priorities.length)]);
            task.setStatus(statuses[random.nextInt(statuses.length)]);
            tasks.add(task);
        }
        return tasks;
    }
    
    private List<OverdueRateData.OverdueReason> generateOverdueReasons() {
        List<OverdueRateData.OverdueReason> reasons = new ArrayList<>();
        String[] reasonNames = {"需求变更", "资源不足", "技术难度高", "依赖阻塞", "沟通不畅", "其他"};
        double[] percentages = {25, 20, 18, 15, 12, 10};
        
        for (int i = 0; i < reasonNames.length; i++) {
            OverdueRateData.OverdueReason reason = new OverdueRateData.OverdueReason();
            reason.setReason(reasonNames[i]);
            reason.setPercentage(percentages[i] + random.nextDouble() * 5 - 2.5);
            reason.setCount((int)(reason.getPercentage() * 0.5));
            reasons.add(reason);
        }
        return reasons;
    }
    
    private List<OverdueRateData.OverdueTrend> generateOverdueTrends(LocalDate startDate, LocalDate endDate) {
        List<OverdueRateData.OverdueTrend> trends = new ArrayList<>();
        long days = ChronoUnit.DAYS.between(startDate, endDate);
        int points = Math.min((int)(days / 7) + 1, 8);
        
        for (int i = 0; i < points; i++) {
            OverdueRateData.OverdueTrend trend = new OverdueRateData.OverdueTrend();
            LocalDate date = startDate.plusDays(i * 7);
            trend.setPeriod(date.format(DateTimeFormatter.ofPattern("MM-dd")));
            trend.setTotalTasks(30 + random.nextInt(20));
            trend.setOverdueTasks((int)(trend.getTotalTasks() * (0.1 + random.nextDouble() * 0.15)));
            trend.setOverdueRate(trend.getOverdueTasks() * 100.0 / trend.getTotalTasks());
            trends.add(trend);
        }
        return trends;
    }
    
    private List<OverdueRateData.OverdueByMember> generateOverdueByMember() {
        List<OverdueRateData.OverdueByMember> list = new ArrayList<>();
        String[] users = {"张三", "李四", "王五", "赵六", "钱七", "孙八"};
        
        for (int i = 0; i < users.length; i++) {
            OverdueRateData.OverdueByMember member = new OverdueRateData.OverdueByMember();
            member.setUserId((long)(i + 1));
            member.setUserName(users[i]);
            member.setTotalTasks(15 + random.nextInt(20));
            member.setOverdueTasks((int)(member.getTotalTasks() * (0.05 + random.nextDouble() * 0.2)));
            member.setOverdueRate(member.getOverdueTasks() * 100.0 / member.getTotalTasks());
            list.add(member);
        }
        return list;
    }
    
    private List<MemberContributionData.MemberContribution> generateMemberContributions() {
        List<MemberContributionData.MemberContribution> members = new ArrayList<>();
        String[] users = {"张三", "李四", "王五", "赵六", "钱七", "孙八", "周九", "吴十"};
        String[] departments = {"研发部", "测试部", "产品部", "设计部"};
        String[] positions = {"高级工程师", "工程师", "产品经理", "设计师"};
        String[] trends = {"UP", "DOWN", "STABLE"};
        
        for (int i = 0; i < users.length; i++) {
            MemberContributionData.MemberContribution member = new MemberContributionData.MemberContribution();
            member.setUserId((long)(i + 1));
            member.setUserName(users[i]);
            member.setDepartment(departments[random.nextInt(departments.length)]);
            member.setPosition(positions[random.nextInt(positions.length)]);
            
            // 任务贡献
            member.setTotalTasks(20 + random.nextInt(30));
            member.setCompletedTasks((int)(member.getTotalTasks() * (0.6 + random.nextDouble() * 0.35)));
            member.setCompletionRate(member.getCompletedTasks() * 100.0 / member.getTotalTasks());
            
            // 工时贡献
            member.setTotalHours(80.0 + random.nextDouble() * 80);
            member.setHoursPercentage(8.0 + random.nextDouble() * 8);
            
            // 质量指标
            member.setOnTimeRate(70.0 + random.nextDouble() * 25);
            member.setAvgCompletionDays(2.0 + random.nextDouble() * 4);
            
            // 协作指标
            member.setCommentsCount(10 + random.nextInt(30));
            member.setReviewsCount(5 + random.nextInt(15));
            member.setHelpedOthers(2 + random.nextInt(8));
            
            // 综合得分
            member.setContributionScore(60.0 + random.nextDouble() * 35);
            member.setRank(i + 1);
            
            // 趋势
            member.setTrend(trends[random.nextInt(trends.length)]);
            member.setScoreChange(-5.0 + random.nextDouble() * 15);
            
            members.add(member);
        }
        
        // 按得分排序
        members.sort((a, b) -> Double.compare(b.getContributionScore(), a.getContributionScore()));
        for (int i = 0; i < members.size(); i++) {
            members.get(i).setRank(i + 1);
        }
        
        return members;
    }
    
    private List<MemberContributionData.ContributionDistribution> generateContributionDistribution(List<MemberContributionData.MemberContribution> members) {
        List<MemberContributionData.ContributionDistribution> list = new ArrayList<>();
        String[] levels = {"核心贡献者", "活跃贡献者", "一般贡献者", "待提升"};
        
        int core = 0, active = 0, normal = 0, needImprove = 0;
        for (MemberContributionData.MemberContribution m : members) {
            if (m.getContributionScore() >= 85) core++;
            else if (m.getContributionScore() >= 70) active++;
            else if (m.getContributionScore() >= 50) normal++;
            else needImprove++;
        }
        
        int[] counts = {core, active, normal, needImprove};
        for (int i = 0; i < levels.length; i++) {
            MemberContributionData.ContributionDistribution dist = new MemberContributionData.ContributionDistribution();
            dist.setLevel(levels[i]);
            dist.setCount(counts[i]);
            dist.setPercentage(counts[i] * 100.0 / members.size());
            list.add(dist);
        }
        return list;
    }
    
    private List<MemberContributionData.ContributionTrend> generateContributionTrends(LocalDate startDate, LocalDate endDate) {
        List<MemberContributionData.ContributionTrend> trends = new ArrayList<>();
        long days = ChronoUnit.DAYS.between(startDate, endDate);
        int points = Math.min((int)(days / 7) + 1, 8);
        
        for (int i = 0; i < points; i++) {
            MemberContributionData.ContributionTrend trend = new MemberContributionData.ContributionTrend();
            LocalDate date = startDate.plusDays(i * 7);
            trend.setPeriod(date.format(DateTimeFormatter.ofPattern("MM-dd")));
            trend.setAvgScore(65.0 + random.nextDouble() * 15);
            trend.setTopContributorScore(85.0 + random.nextDouble() * 10);
            trend.setBottomContributorScore(40.0 + random.nextDouble() * 20);
            trends.add(trend);
        }
        return trends;
    }
}