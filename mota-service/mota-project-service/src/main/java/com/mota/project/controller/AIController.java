package com.mota.project.controller;

import com.mota.common.core.result.Result;
import com.mota.project.dto.ai.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * AI 智能功能控制器
 */
@Tag(name = "AI 智能功能", description = "AI 方案生成、PPT生成、任务分解、风险预警等智能功能")
@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AIController {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

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

    // ============ 新闻 API ============

    /**
     * 获取新闻列表
     */
    @Operation(summary = "获取AI推荐新闻", description = "获取AI推荐的相关新闻列表")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/news")
    public Result<NewsListResponse> getNews(
            @Parameter(description = "新闻分类") @RequestParam(required = false) String category,
            @Parameter(description = "搜索关键字") @RequestParam(required = false) String search,
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer page,
            @Parameter(description = "每页数量") @RequestParam(defaultValue = "10") Integer pageSize) {
        
        List<NewsItem> newsList = new ArrayList<>();
        newsList.add(NewsItem.builder()
                .id("1")
                .title("人工智能在企业管理中的应用趋势")
                .summary("随着AI技术的不断发展，越来越多的企业开始将人工智能应用于日常管理中...")
                .source("科技日报")
                .sourceIcon("https://example.com/tech-daily.png")
                .publishTime(LocalDateTime.now().minusHours(2).format(DATE_FORMATTER))
                .category("technology")
                .tags(Arrays.asList("AI", "企业管理", "数字化"))
                .url("https://example.com/news/1")
                .isStarred(false)
                .relevance(95)
                .build());
        newsList.add(NewsItem.builder()
                .id("2")
                .title("2024年项目管理最佳实践报告发布")
                .summary("PMI发布了最新的项目管理最佳实践报告，涵盖敏捷、瀑布等多种方法论...")
                .source("PMI官网")
                .sourceIcon("https://example.com/pmi.png")
                .publishTime(LocalDateTime.now().minusHours(5).format(DATE_FORMATTER))
                .category("management")
                .tags(Arrays.asList("项目管理", "敏捷", "最佳实践"))
                .url("https://example.com/news/2")
                .isStarred(true)
                .relevance(88)
                .build());
        newsList.add(NewsItem.builder()
                .id("3")
                .title("远程协作工具市场分析")
                .summary("疫情后远程办公成为常态，各类协作工具市场竞争激烈...")
                .source("36氪")
                .sourceIcon("https://example.com/36kr.png")
                .publishTime(LocalDateTime.now().minusDays(1).format(DATE_FORMATTER))
                .category("industry")
                .tags(Arrays.asList("远程办公", "协作工具", "市场分析"))
                .url("https://example.com/news/3")
                .isStarred(false)
                .relevance(82)
                .build());
        
        return Result.success(NewsListResponse.builder()
                .list(newsList)
                .total(newsList.size())
                .build());
    }

    /**
     * 收藏/取消收藏新闻
     */
    @Operation(summary = "收藏/取消收藏新闻", description = "切换新闻的收藏状态")
    @ApiResponse(responseCode = "200", description = "操作成功")
    @PostMapping("/news/{id}/star")
    public Result<Map<String, Boolean>> toggleNewsStar(
            @Parameter(description = "新闻ID", required = true) @PathVariable String id) {
        Map<String, Boolean> result = new HashMap<>();
        result.put("isStarred", true);
        return Result.success(result);
    }

    /**
     * 刷新新闻
     */
    @Operation(summary = "刷新新闻列表", description = "获取最新的AI推荐新闻")
    @ApiResponse(responseCode = "200", description = "刷新成功")
    @PostMapping("/news/refresh")
    public Result<NewsListResponse> refreshNews() {
        return getNews(null, null, 1, 10);
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

    // ============ 模型训练 API ============

    /**
     * 获取训练统计
     */
    @Operation(summary = "获取训练统计", description = "获取AI模型训练的统计信息")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/training/stats")
    public Result<TrainingStats> getTrainingStats() {
        return Result.success(TrainingStats.builder()
                .totalDocuments(156)
                .totalTokens("2.5M")
                .lastTraining(LocalDateTime.now().minusDays(3).format(DATE_FORMATTER))
                .modelVersion("v1.2.0")
                .accuracy(0.92)
                .build());
    }

    /**
     * 获取训练历史
     */
    @Operation(summary = "获取训练历史", description = "获取AI模型的训练历史记录")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/training/history")
    public Result<List<TrainingHistory>> getTrainingHistory() {
        List<TrainingHistory> history = Arrays.asList(
                TrainingHistory.builder().id(1).version("v1.2.0").date("2024-01-15").documents(156).status("completed").accuracy(0.92).build(),
                TrainingHistory.builder().id(2).version("v1.1.0").date("2024-01-01").documents(120).status("completed").accuracy(0.89).build(),
                TrainingHistory.builder().id(3).version("v1.0.0").date("2023-12-15").documents(80).status("completed").accuracy(0.85).build()
        );
        return Result.success(history);
    }

    /**
     * 获取知识库文档列表
     */
    @Operation(summary = "获取知识库文档列表", description = "获取用于AI训练的知识库文档")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/training/documents")
    public Result<List<KnowledgeDocument>> getKnowledgeDocuments() {
        List<KnowledgeDocument> documents = Arrays.asList(
                KnowledgeDocument.builder().id(1).name("公司制度手册.pdf").size("2.5MB").uploadTime("2024-01-10").status("indexed").build(),
                KnowledgeDocument.builder().id(2).name("产品说明书.docx").size("1.2MB").uploadTime("2024-01-08").status("indexed").build(),
                KnowledgeDocument.builder().id(3).name("培训资料.pptx").size("5.8MB").uploadTime("2024-01-05").status("pending").build()
        );
        return Result.success(documents);
    }

    /**
     * 上传知识库文档
     */
    @Operation(summary = "上传知识库文档", description = "上传文档到知识库用于AI训练")
    @ApiResponse(responseCode = "200", description = "上传成功")
    @PostMapping("/training/documents")
    public Result<KnowledgeDocument> uploadKnowledgeDocument(
            @Parameter(description = "文档文件", required = true) @RequestParam("file") MultipartFile file) {
        return Result.success(KnowledgeDocument.builder()
                .id(new Random().nextInt(1000))
                .name(file.getOriginalFilename())
                .size(formatFileSize(file.getSize()))
                .uploadTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")))
                .status("pending")
                .build());
    }

    /**
     * 删除知识库文档
     */
    @Operation(summary = "删除知识库文档", description = "从知识库中删除文档")
    @ApiResponse(responseCode = "200", description = "删除成功")
    @DeleteMapping("/training/documents/{id}")
    public Result<Void> deleteKnowledgeDocument(
            @Parameter(description = "文档ID", required = true) @PathVariable Integer id) {
        return Result.success(null);
    }

    /**
     * 开始训练
     */
    @Operation(summary = "开始AI训练", description = "启动AI模型训练任务")
    @ApiResponse(responseCode = "200", description = "训练任务已启动")
    @PostMapping("/training/start")
    public Result<Map<String, String>> startTraining() {
        Map<String, String> result = new HashMap<>();
        result.put("taskId", UUID.randomUUID().toString());
        return Result.success(result);
    }

    /**
     * 获取训练进度
     */
    @Operation(summary = "获取训练进度", description = "获取AI训练任务的进度")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/training/progress/{taskId}")
    public Result<Map<String, Object>> getTrainingProgress(
            @Parameter(description = "训练任务ID", required = true) @PathVariable String taskId) {
        Map<String, Object> result = new HashMap<>();
        result.put("progress", 75);
        result.put("status", "training");
        return Result.success(result);
    }

    /**
     * 保存训练设置
     */
    @Operation(summary = "保存训练设置", description = "保存AI模型训练的配置参数")
    @ApiResponse(responseCode = "200", description = "保存成功")
    @PostMapping("/training/settings")
    public Result<Void> saveTrainingSettings(@RequestBody TrainingSettingsRequest request) {
        return Result.success(null);
    }

    /**
     * 保存业务配置
     */
    @Operation(summary = "保存业务配置", description = "保存AI业务相关的配置")
    @ApiResponse(responseCode = "200", description = "保存成功")
    @PostMapping("/training/business-config")
    public Result<Void> saveBusinessConfig(@RequestBody BusinessConfigRequest request) {
        return Result.success(null);
    }

    // ============ 项目协同 AI 功能 ============

    /**
     * AI 任务分解
     */
    @Operation(summary = "AI任务分解", description = "使用AI智能分解项目任务")
    @ApiResponse(responseCode = "200", description = "分解成功")
    @PostMapping("/project/decompose")
    public Result<TaskDecompositionResponse> generateTaskDecomposition(@RequestBody TaskDecompositionRequest request) {
        List<TaskDecompositionSuggestion> suggestions = Arrays.asList(
                TaskDecompositionSuggestion.builder()
                        .id("1")
                        .name("需求分析")
                        .description("收集和分析项目需求，编写需求文档")
                        .suggestedDepartment("产品部")
                        .suggestedPriority("high")
                        .estimatedDays(5)
                        .dependencies(Collections.emptyList())
                        .build(),
                TaskDecompositionSuggestion.builder()
                        .id("2")
                        .name("技术方案设计")
                        .description("根据需求设计技术架构和实现方案")
                        .suggestedDepartment("技术部")
                        .suggestedPriority("high")
                        .estimatedDays(3)
                        .dependencies(Arrays.asList("1"))
                        .build(),
                TaskDecompositionSuggestion.builder()
                        .id("3")
                        .name("开发实现")
                        .description("按照技术方案进行编码开发")
                        .suggestedDepartment("技术部")
                        .suggestedPriority("medium")
                        .estimatedDays(15)
                        .dependencies(Arrays.asList("2"))
                        .build(),
                TaskDecompositionSuggestion.builder()
                        .id("4")
                        .name("测试验收")
                        .description("进行功能测试和用户验收测试")
                        .suggestedDepartment("测试部")
                        .suggestedPriority("medium")
                        .estimatedDays(5)
                        .dependencies(Arrays.asList("3"))
                        .build()
        );
        
        return Result.success(TaskDecompositionResponse.builder()
                .suggestions(suggestions)
                .totalEstimatedDays(28)
                .riskAssessment("项目整体风险较低，建议关注需求变更和技术难点")
                .build());
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

    // ============ 辅助方法 ============

    private String formatFileSize(long size) {
        if (size < 1024) {
            return size + "B";
        } else if (size < 1024 * 1024) {
            return String.format("%.1fKB", size / 1024.0);
        } else if (size < 1024 * 1024 * 1024) {
            return String.format("%.1fMB", size / (1024.0 * 1024));
        } else {
            return String.format("%.1fGB", size / (1024.0 * 1024 * 1024));
        }
    }
}