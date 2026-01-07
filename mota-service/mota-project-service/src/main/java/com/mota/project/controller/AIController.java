package com.mota.project.controller;

import com.mota.common.core.result.Result;
import com.mota.project.dto.ai.*;
import com.mota.project.service.ai.ClaudeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * AI 项目智能功能控制器
 * 提供项目相关的AI功能：历史记录、方案生成、PPT生成、项目协同AI等
 *
 * 注意：
 * - AI核心功能（对话、新闻、训练、搜索）已迁移到 mota-ai-service
 * - 此控制器只保留与项目强相关的AI功能
 */
@Slf4j
@Tag(name = "AI项目智能功能", description = "项目相关的AI功能：历史记录、方案生成、PPT生成、项目协同AI等")
@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AIController {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    private final ClaudeService claudeService;

    // ============ AI 历史记录 API ============

    /**
     * 获取 AI 历史记录列表
     */
    @Operation(summary = "获取AI历史记录列表", description = "分页获取AI生成内容的历史记录")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/history")
    public Result<AIHistoryListResponse> getHistory(
            @Parameter(description = "记录类型") @RequestParam(required = false) String type,
            @Parameter(description = "状态") @RequestParam(required = false) String status,
            @Parameter(description = "搜索关键字") @RequestParam(required = false) String search,
            @Parameter(description = "开始日期") @RequestParam(required = false) String startDate,
            @Parameter(description = "结束日期") @RequestParam(required = false) String endDate,
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer page,
            @Parameter(description = "每页数量") @RequestParam(defaultValue = "10") Integer pageSize) {
        
        List<AIHistoryRecord> records = new ArrayList<>();
        records.add(AIHistoryRecord.builder()
                .id("1")
                .title("企业数字化转型方案")
                .type("solution")
                .status("completed")
                .creator("张三")
                .creatorId(1L)
                .content("这是一份关于企业数字化转型的详细方案...")
                .createdAt(LocalDateTime.now().minusDays(1).format(DATE_FORMATTER))
                .build());
        records.add(AIHistoryRecord.builder()
                .id("2")
                .title("Q4季度工作汇报PPT")
                .type("ppt")
                .status("completed")
                .creator("李四")
                .creatorId(2L)
                .createdAt(LocalDateTime.now().minusDays(2).format(DATE_FORMATTER))
                .build());
        records.add(AIHistoryRecord.builder()
                .id("3")
                .title("新产品营销方案")
                .type("marketing")
                .status("processing")
                .creator("王五")
                .creatorId(3L)
                .createdAt(LocalDateTime.now().minusHours(3).format(DATE_FORMATTER))
                .build());
        
        return Result.success(AIHistoryListResponse.builder()
                .list(records)
                .total(records.size())
                .build());
    }

    /**
     * 获取 AI 历史记录详情
     */
    @Operation(summary = "获取AI历史记录详情", description = "根据ID获取AI历史记录的详细内容")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "查询成功"),
        @ApiResponse(responseCode = "404", description = "记录不存在")
    })
    @GetMapping("/history/{id}")
    public Result<AIHistoryRecord> getHistoryById(
            @Parameter(description = "记录ID", required = true) @PathVariable String id) {
        return Result.success(AIHistoryRecord.builder()
                .id(id)
                .title("企业数字化转型方案")
                .type("solution")
                .status("completed")
                .creator("张三")
                .creatorId(1L)
                .content("# 企业数字化转型方案\n\n## 1. 背景分析\n\n随着数字经济的快速发展...")
                .createdAt(LocalDateTime.now().minusDays(1).format(DATE_FORMATTER))
                .updatedAt(LocalDateTime.now().format(DATE_FORMATTER))
                .build());
    }

    /**
     * 删除 AI 历史记录
     */
    @Operation(summary = "删除AI历史记录", description = "根据ID删除AI历史记录")
    @ApiResponse(responseCode = "200", description = "删除成功")
    @DeleteMapping("/history/{id}")
    public Result<Void> deleteHistory(
            @Parameter(description = "记录ID", required = true) @PathVariable String id) {
        return Result.success(null);
    }

    // ============ 方案生成 API ============

    /**
     * 生成方案
     */
    @Operation(summary = "AI生成方案", description = "根据输入信息使用AI生成解决方案")
    @ApiResponse(responseCode = "200", description = "生成成功")
    @PostMapping("/solution/generate")
    public Result<GeneratedSolution> generateSolution(@RequestBody GenerateSolutionRequest request) {
        return Result.success(GeneratedSolution.builder()
                .id(UUID.randomUUID().toString())
                .title(request.getCompanyName() + " - " + request.getSolutionType() + "方案")
                .content("# " + request.getSolutionType() + "方案\n\n## 1. 项目背景\n\n" + request.getBusinessDesc() + "\n\n## 2. 需求分析\n\n" + request.getRequirements() + "\n\n## 3. 解决方案\n\n基于以上需求，我们建议采用以下方案...")
                .type(request.getSolutionType())
                .createdAt(LocalDateTime.now().format(DATE_FORMATTER))
                .build());
    }

    /**
     * 获取方案类型列表
     */
    @Operation(summary = "获取方案类型列表", description = "获取AI支持生成的方案类型")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/solution/types")
    public Result<List<SolutionType>> getSolutionTypes() {
        List<SolutionType> types = Arrays.asList(
                SolutionType.builder().value("digital").label("数字化转型").desc("企业数字化转型整体方案").icon("laptop").build(),
                SolutionType.builder().value("marketing").label("营销方案").desc("产品营销推广方案").icon("megaphone").build(),
                SolutionType.builder().value("operation").label("运营方案").desc("企业运营优化方案").icon("settings").build(),
                SolutionType.builder().value("hr").label("人力资源").desc("人力资源管理方案").icon("users").build()
        );
        return Result.success(types);
    }

    /**
     * 获取快捷模板
     */
    @Operation(summary = "获取方案快捷模板", description = "获取方案生成的快捷模板")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/solution/templates")
    public Result<List<QuickTemplate>> getQuickTemplates() {
        List<QuickTemplate> templates = Arrays.asList(
                QuickTemplate.builder().label("数字化转型").value("请帮我生成一份企业数字化转型方案").build(),
                QuickTemplate.builder().label("营销推广").value("请帮我生成一份新产品营销推广方案").build(),
                QuickTemplate.builder().label("团队建设").value("请帮我生成一份团队建设活动方案").build()
        );
        return Result.success(templates);
    }

    // ============ PPT 生成 API ============

    /**
     * 获取 PPT 模板列表
     */
    @Operation(summary = "获取PPT模板列表", description = "获取AI生成PPT可用的模板")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/ppt/templates")
    public Result<List<PPTTemplate>> getPPTTemplates() {
        List<PPTTemplate> templates = Arrays.asList(
                PPTTemplate.builder().value("business").label("商务简约").color("#1890ff").icon("briefcase").build(),
                PPTTemplate.builder().value("tech").label("科技风格").color("#722ed1").icon("cpu").build(),
                PPTTemplate.builder().value("creative").label("创意设计").color("#eb2f96").icon("palette").build(),
                PPTTemplate.builder().value("academic").label("学术报告").color("#52c41a").icon("book").build()
        );
        return Result.success(templates);
    }

    /**
     * 获取 PPT 配色方案
     */
    @Operation(summary = "获取PPT配色方案", description = "获取PPT可用的配色方案")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/ppt/color-schemes")
    public Result<List<PPTColorScheme>> getPPTColorSchemes() {
        List<PPTColorScheme> schemes = Arrays.asList(
                PPTColorScheme.builder().value("blue").label("商务蓝").colors(Arrays.asList("#1890ff", "#69c0ff", "#bae7ff")).build(),
                PPTColorScheme.builder().value("green").label("清新绿").colors(Arrays.asList("#52c41a", "#95de64", "#d9f7be")).build(),
                PPTColorScheme.builder().value("purple").label("优雅紫").colors(Arrays.asList("#722ed1", "#b37feb", "#efdbff")).build(),
                PPTColorScheme.builder().value("orange").label("活力橙").colors(Arrays.asList("#fa8c16", "#ffc069", "#ffe7ba")).build()
        );
        return Result.success(schemes);
    }

    /**
     * 获取 PPT 快捷模板
     */
    @Operation(summary = "获取PPT快捷模板", description = "获取PPT生成的快捷模板")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/ppt/quick-templates")
    public Result<List<QuickTemplate>> getPPTQuickTemplates() {
        List<QuickTemplate> templates = Arrays.asList(
                QuickTemplate.builder().label("工作汇报").value("请帮我生成一份季度工作汇报PPT").build(),
                QuickTemplate.builder().label("项目介绍").value("请帮我生成一份项目介绍PPT").build(),
                QuickTemplate.builder().label("产品发布").value("请帮我生成一份新产品发布PPT").build()
        );
        return Result.success(templates);
    }

    /**
     * 生成 PPT
     */
    @Operation(summary = "AI生成PPT", description = "根据输入信息使用AI生成PPT")
    @ApiResponse(responseCode = "200", description = "生成成功")
    @PostMapping("/ppt/generate")
    public Result<GeneratedPPT> generatePPT(@RequestBody GeneratePPTRequest request) {
        List<PPTPage> pages = new ArrayList<>();
        pages.add(PPTPage.builder().id(1).title("封面").type("cover").build());
        pages.add(PPTPage.builder().id(2).title("目录").type("toc").build());
        pages.add(PPTPage.builder().id(3).title("背景介绍").type("content").build());
        pages.add(PPTPage.builder().id(4).title("核心内容").type("content").build());
        pages.add(PPTPage.builder().id(5).title("总结").type("summary").build());
        
        return Result.success(GeneratedPPT.builder()
                .id(UUID.randomUUID().toString())
                .title(request.getTitle())
                .slides(request.getSlideCount() != null ? request.getSlideCount() : 5)
                .template(request.getTemplate())
                .createdAt(LocalDateTime.now().format(DATE_FORMATTER))
                .pages(pages)
                .build());
    }

    /**
     * 下载 PPT
     */
    @Operation(summary = "下载PPT", description = "下载生成的PPT文件")
    @ApiResponse(responseCode = "200", description = "返回下载链接")
    @GetMapping("/ppt/{id}/download")
    public Result<String> downloadPPT(
            @Parameter(description = "PPT ID", required = true) @PathVariable String id,
            @Parameter(description = "下载格式(pptx/pdf)", required = true) @RequestParam String format) {
        // 返回模拟的下载链接
        return Result.success("/downloads/ppt/" + id + "." + format);
    }

    // ============ 项目协同 AI 功能 ============
    // 注意：模型训练相关API已迁移到 mota-ai-service 的 AITrainingController

    /**
     * AI 任务分解 - 调用 Claude 大模型进行智能任务分解
     */
    @Operation(summary = "AI任务分解", description = "使用Claude大模型智能分解项目任务，根据项目描述自动生成任务列表")
    @ApiResponse(responseCode = "200", description = "分解成功")
    @PostMapping("/project/decompose")
    public Result<TaskDecompositionResponse> generateTaskDecomposition(@RequestBody TaskDecompositionRequest request) {
        log.info("收到AI任务分解请求, 项目名称: {}", request.getProjectName());
        
        // 调用 Claude 服务进行任务分解
        TaskDecompositionResponse response = claudeService.decomposeTask(request);
        
        log.info("AI任务分解完成, 生成 {} 个任务建议", response.getSuggestions().size());
        return Result.success(response);
    }

    /**
     * AI 进度预测
     */
    @Operation(summary = "AI进度预测", description = "使用AI预测项目进度")
    @ApiResponse(responseCode = "200", description = "预测成功")
    @GetMapping("/project/{projectId}/predict")
    public Result<ProgressPrediction> predictProjectProgress(
            @Parameter(description = "项目ID", required = true) @PathVariable String projectId) {
        return Result.success(ProgressPrediction.builder()
                .projectId(projectId)
                .currentProgress(45)
                .predictedProgress(52)
                .predictedCompletionDate("2024-03-15")
                .confidence(0.85)
                .factors(Arrays.asList(
                        "当前进度符合预期",
                        "团队效率稳定",
                        "无重大风险因素"
                ))
                .build());
    }

    /**
     * AI 风险预警
     */
    @Operation(summary = "AI风险预警", description = "获取AI分析的项目风险预警")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/project/{projectId}/risks")
    public Result<List<RiskWarning>> getProjectRiskWarnings(
            @Parameter(description = "项目ID", required = true) @PathVariable String projectId) {
        List<RiskWarning> warnings = Arrays.asList(
                RiskWarning.builder()
                        .id("1")
                        .type("delay")
                        .severity("medium")
                        .title("任务延期风险")
                        .description("'用户界面开发'任务已延期2天，可能影响后续任务")
                        .affectedTasks(Arrays.asList("用户界面开发", "集成测试"))
                        .suggestions(Arrays.asList("增加开发资源", "调整任务优先级"))
                        .createdAt(LocalDateTime.now().minusHours(2).format(DATE_FORMATTER))
                        .build(),
                RiskWarning.builder()
                        .id("2")
                        .type("resource")
                        .severity("low")
                        .title("资源不足预警")
                        .description("下周测试人员可能不足")
                        .affectedTasks(Arrays.asList("功能测试", "性能测试"))
                        .suggestions(Arrays.asList("提前协调测试资源", "考虑外包测试"))
                        .createdAt(LocalDateTime.now().minusDays(1).format(DATE_FORMATTER))
                        .build()
        );
        return Result.success(warnings);
    }

    /**
     * AI 智能报告
     */
    @Operation(summary = "AI生成项目报告", description = "使用AI生成项目进度报告")
    @ApiResponse(responseCode = "200", description = "生成成功")
    @PostMapping("/project/{projectId}/report")
    public Result<ProjectReport> generateProjectReport(
            @Parameter(description = "项目ID", required = true) @PathVariable String projectId,
            @RequestBody ProjectReportRequest request) {
        
        return Result.success(ProjectReport.builder()
                .id(UUID.randomUUID().toString())
                .projectId(projectId)
                .projectName("示例项目")
                .reportType(request.getReportType())
                .summary("本周项目整体进展顺利，完成了3个主要任务，新增2个待办事项。")
                .highlights(Arrays.asList(
                        "完成用户认证模块开发",
                        "数据库设计通过评审",
                        "前端框架搭建完成"
                ))
                .issues(Arrays.asList(
                        "API文档更新滞后",
                        "部分单元测试覆盖率不足"
                ))
                .nextSteps(Arrays.asList(
                        "完成订单模块开发",
                        "进行第一轮集成测试",
                        "补充API文档"
                ))
                .statistics(ProjectReport.ReportStatistics.builder()
                        .totalTasks(25)
                        .completedTasks(12)
                        .inProgressTasks(8)
                        .overdueTasks(2)
                        .progressChange(8)
                        .build())
                .generatedAt(LocalDateTime.now().format(DATE_FORMATTER))
                .build());
    }

    /**
     * 获取 AI 建议的任务优先级
     */
    @Operation(summary = "AI建议任务优先级", description = "使用AI分析并建议任务优先级")
    @ApiResponse(responseCode = "200", description = "分析成功")
    @PostMapping("/project/suggest-priority")
    public Result<TaskPrioritySuggestion> suggestTaskPriority(@RequestBody TaskPriorityRequest request) {
        String priority = "medium";
        String reason = "根据任务描述分析，该任务属于常规开发任务";
        
        if (request.getDeadline() != null && !request.getDeadline().isEmpty()) {
            priority = "high";
            reason = "该任务有明确的截止日期，建议设置为高优先级以确保按时完成";
        }
        
        return Result.success(TaskPrioritySuggestion.builder()
                .suggestedPriority(priority)
                .reason(reason)
                .build());
    }

    /**
     * AI 智能分配
     */
    @Operation(summary = "AI智能分配任务", description = "使用AI推荐任务的最佳执行人")
    @ApiResponse(responseCode = "200", description = "推荐成功")
    @GetMapping("/project/task/{taskId}/suggest-assignee")
    public Result<TaskAssignmentSuggestion> suggestTaskAssignment(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId) {
        List<TaskAssignmentSuggestion.SuggestedAssignee> assignees = Arrays.asList(
                TaskAssignmentSuggestion.SuggestedAssignee.builder()
                        .userId(1L)
                        .userName("张三")
                        .matchScore(0.95)
                        .currentWorkload(3)
                        .reason("技能匹配度高，当前工作量适中")
                        .build(),
                TaskAssignmentSuggestion.SuggestedAssignee.builder()
                        .userId(2L)
                        .userName("李四")
                        .matchScore(0.82)
                        .currentWorkload(5)
                        .reason("有相关经验，但当前工作量较大")
                        .build()
        );
        
        return Result.success(TaskAssignmentSuggestion.builder()
                .suggestedAssignees(assignees)
                .build());
    }

    /**
     * AI 工作计划生成
     */
    @Operation(summary = "AI生成工作计划建议", description = "使用AI为部门任务生成工作计划建议")
    @ApiResponse(responseCode = "200", description = "生成成功")
    @GetMapping("/project/department-task/{departmentTaskId}/work-plan-suggestion")
    public Result<WorkPlanSuggestion> generateWorkPlanSuggestion(
            @Parameter(description = "部门任务ID", required = true) @PathVariable Long departmentTaskId) {
        List<WorkPlanSuggestion.MilestoneSuggestion> milestones = Arrays.asList(
                WorkPlanSuggestion.MilestoneSuggestion.builder()
                        .name("需求确认")
                        .targetDate("2024-02-01")
                        .deliverables(Arrays.asList("需求文档", "原型设计"))
                        .build(),
                WorkPlanSuggestion.MilestoneSuggestion.builder()
                        .name("开发完成")
                        .targetDate("2024-02-15")
                        .deliverables(Arrays.asList("功能代码", "单元测试"))
                        .build(),
                WorkPlanSuggestion.MilestoneSuggestion.builder()
                        .name("测试验收")
                        .targetDate("2024-02-28")
                        .deliverables(Arrays.asList("测试报告", "验收文档"))
                        .build()
        );
        
        return Result.success(WorkPlanSuggestion.builder()
                .summary("基于任务要求，建议分三个阶段完成：需求确认、开发实现、测试验收")
                .milestones(milestones)
                .resourceRequirements("需要2名开发人员、1名测试人员")
                .risks(Arrays.asList("需求变更风险", "技术难点风险", "人员变动风险"))
                .build());
    }
}