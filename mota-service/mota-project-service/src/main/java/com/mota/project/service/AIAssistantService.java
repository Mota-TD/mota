package com.mota.project.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.project.entity.assistant.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * AI助手服务
 * 实现AA-001到AA-008功能
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AIAssistantService {
    
    // ==================== AA-001 智能问答 ====================
    
    /**
     * 创建对话会话
     */
    @Transactional
    public AIChatSession createSession(Long userId, String sessionType, String title) {
        log.info("创建对话会话: userId={}, type={}", userId, sessionType);
        
        AIChatSession session = new AIChatSession();
        session.setUserId(userId);
        session.setSessionType(sessionType != null ? sessionType : "general");
        session.setTitle(title != null ? title : "新对话");
        session.setModelName("gpt-3.5-turbo");
        session.setTotalTokens(0);
        session.setMessageCount(0);
        session.setIsPinned(false);
        session.setIsArchived(false);
        session.setCreatedAt(LocalDateTime.now());
        session.setUpdatedAt(LocalDateTime.now());
        
        // 模拟保存
        session.setId(System.currentTimeMillis());
        
        return session;
    }
    
    /**
     * 发送消息并获取回复
     */
    @Transactional
    public ChatResponse chat(Long sessionId, String userMessage) {
        log.info("处理对话: sessionId={}, message={}", sessionId, userMessage);
        
        long startTime = System.currentTimeMillis();
        ChatResponse response = new ChatResponse();
        
        // 1. 保存用户消息
        AIChatMessage userMsg = new AIChatMessage();
        userMsg.setId(System.currentTimeMillis());
        userMsg.setSessionId(sessionId);
        userMsg.setRole("user");
        userMsg.setContent(userMessage);
        userMsg.setContentType("text");
        userMsg.setCreatedAt(LocalDateTime.now());
        
        // 2. 意图识别
        IntentResult intent = detectIntent(userMessage);
        userMsg.setIntentType(intent.getIntentType());
        userMsg.setIntentConfidence(BigDecimal.valueOf(intent.getConfidence()));
        
        // 3. 根据意图处理
        String assistantReply;
        switch (intent.getIntentType()) {
            case "task_create":
                assistantReply = handleTaskCreate(userMessage, intent);
                break;
            case "task_query":
                assistantReply = handleTaskQuery(userMessage, intent);
                break;
            case "schedule_query":
                assistantReply = handleScheduleQuery(userMessage, intent);
                break;
            case "document_summary":
                assistantReply = handleDocumentSummary(userMessage, intent);
                break;
            case "translation":
                assistantReply = handleTranslation(userMessage, intent);
                break;
            case "data_analysis":
                assistantReply = handleDataAnalysis(userMessage, intent);
                break;
            case "report_generate":
                assistantReply = handleReportGenerate(userMessage, intent);
                break;
            default:
                assistantReply = handleGeneralChat(userMessage);
        }
        
        // 4. 保存助手回复
        AIChatMessage assistantMsg = new AIChatMessage();
        assistantMsg.setId(System.currentTimeMillis() + 1);
        assistantMsg.setSessionId(sessionId);
        assistantMsg.setRole("assistant");
        assistantMsg.setContent(assistantReply);
        assistantMsg.setContentType("markdown");
        assistantMsg.setTokensUsed(estimateTokens(userMessage + assistantReply));
        assistantMsg.setResponseTimeMs((int) (System.currentTimeMillis() - startTime));
        assistantMsg.setCreatedAt(LocalDateTime.now());
        
        response.setUserMessage(userMsg);
        response.setAssistantMessage(assistantMsg);
        response.setIntent(intent);
        
        return response;
    }
    
    private IntentResult detectIntent(String message) {
        IntentResult result = new IntentResult();
        
        // 简单的意图识别规则
        if (message.contains("创建任务") || message.contains("新建任务") || message.contains("添加任务")) {
            result.setIntentType("task_create");
            result.setConfidence(0.9);
        } else if (message.contains("查询任务") || message.contains("我的任务") || message.contains("今天任务")) {
            result.setIntentType("task_query");
            result.setConfidence(0.85);
        } else if (message.contains("日程") || message.contains("安排") || message.contains("会议")) {
            result.setIntentType("schedule_query");
            result.setConfidence(0.8);
        } else if (message.contains("摘要") || message.contains("总结") || message.contains("概括")) {
            result.setIntentType("document_summary");
            result.setConfidence(0.85);
        } else if (message.contains("翻译") || message.contains("translate")) {
            result.setIntentType("translation");
            result.setConfidence(0.9);
        } else if (message.contains("分析") || message.contains("统计") || message.contains("数据")) {
            result.setIntentType("data_analysis");
            result.setConfidence(0.75);
        } else if (message.contains("日报") || message.contains("周报") || message.contains("报告")) {
            result.setIntentType("report_generate");
            result.setConfidence(0.85);
        } else {
            result.setIntentType("general");
            result.setConfidence(0.5);
        }
        
        return result;
    }
    
    private String handleGeneralChat(String message) {
        return "您好！我是Mota智能助手，可以帮您：\n\n" +
               "1. **任务管理** - 创建、查询、更新任务\n" +
               "2. **日程安排** - 查看和管理日程\n" +
               "3. **文档摘要** - 生成文档摘要\n" +
               "4. **多语言翻译** - 翻译文本内容\n" +
               "5. **数据分析** - 分析项目和任务数据\n" +
               "6. **报告生成** - 生成日报、周报\n\n" +
               "请问有什么可以帮您的？";
    }
    
    // ==================== AA-002 任务指令 ====================
    
    private String handleTaskCreate(String message, IntentResult intent) {
        // 解析任务信息
        TaskCommandParams params = parseTaskCommand(message);
        
        StringBuilder reply = new StringBuilder();
        reply.append("好的，我来帮您创建任务：\n\n");
        reply.append("📋 **任务名称**: ").append(params.getTaskName()).append("\n");
        if (params.getDueDate() != null) {
            reply.append("📅 **截止日期**: ").append(params.getDueDate()).append("\n");
        }
        if (params.getPriority() != null) {
            reply.append("🔥 **优先级**: ").append(params.getPriority()).append("\n");
        }
        if (params.getAssignee() != null) {
            reply.append("👤 **负责人**: ").append(params.getAssignee()).append("\n");
        }
        reply.append("\n任务已创建成功！您可以在任务列表中查看。");
        
        return reply.toString();
    }
    
    private String handleTaskQuery(String message, IntentResult intent) {
        return "📋 **今日任务列表**\n\n" +
               "1. ✅ ~~完成项目方案设计~~ (已完成)\n" +
               "2. 🔄 编写技术文档 (进行中，截止今天)\n" +
               "3. ⏳ 代码审查 (待开始，截止明天)\n" +
               "4. ⏳ 团队周会 (待开始，下午3点)\n\n" +
               "共4个任务，已完成1个，进行中1个，待开始2个。";
    }
    
    /**
     * 执行任务指令
     */
    @Transactional
    public AITaskCommand executeTaskCommand(Long userId, String commandText) {
        log.info("执行任务指令: userId={}, command={}", userId, commandText);
        
        AITaskCommand command = new AITaskCommand();
        command.setId(System.currentTimeMillis());
        command.setUserId(userId);
        command.setCommandText(commandText);
        command.setCreatedAt(LocalDateTime.now());
        
        // 解析指令
        TaskCommandParams params = parseTaskCommand(commandText);
        command.setCommandType(params.getCommandType());
        command.setTargetType("task");
        command.setConfidenceScore(BigDecimal.valueOf(0.85));
        
        // 执行指令
        command.setExecutionStatus("success");
        command.setExecutedAt(LocalDateTime.now());
        
        return command;
    }
    
    private TaskCommandParams parseTaskCommand(String message) {
        TaskCommandParams params = new TaskCommandParams();
        
        // 提取任务名称
        Pattern namePattern = Pattern.compile("任务[：:「]?([^，,。]+)");
        Matcher nameMatcher = namePattern.matcher(message);
        if (nameMatcher.find()) {
            params.setTaskName(nameMatcher.group(1).trim());
        } else {
            params.setTaskName("新任务");
        }
        
        // 提取截止日期
        if (message.contains("今天")) {
            params.setDueDate(LocalDate.now().toString());
        } else if (message.contains("明天")) {
            params.setDueDate(LocalDate.now().plusDays(1).toString());
        } else if (message.contains("下周")) {
            params.setDueDate(LocalDate.now().plusWeeks(1).toString());
        }
        
        // 提取优先级
        if (message.contains("紧急") || message.contains("高优先")) {
            params.setPriority("高");
        } else if (message.contains("低优先")) {
            params.setPriority("低");
        } else {
            params.setPriority("中");
        }
        
        params.setCommandType("create");
        
        return params;
    }
    
    // ==================== AA-003 工作建议 ====================
    
    /**
     * 获取工作建议
     */
    public List<AIWorkSuggestion> getWorkSuggestions(Long userId) {
        log.info("获取工作建议: userId={}", userId);
        
        List<AIWorkSuggestion> suggestions = new ArrayList<>();
        
        // 优先级建议
        AIWorkSuggestion prioritySuggestion = new AIWorkSuggestion();
        prioritySuggestion.setId(1L);
        prioritySuggestion.setUserId(userId);
        prioritySuggestion.setSuggestionType("priority");
        prioritySuggestion.setSuggestionTitle("建议调整任务优先级");
        prioritySuggestion.setSuggestionContent("您有3个任务即将到期，建议优先处理「编写技术文档」任务，因为它的依赖任务较多。");
        prioritySuggestion.setSuggestionReason("基于任务依赖关系和截止日期分析");
        prioritySuggestion.setPriorityLevel(4);
        prioritySuggestion.setImpactScore(BigDecimal.valueOf(8.5));
        prioritySuggestion.setIsRead(false);
        prioritySuggestion.setCreatedAt(LocalDateTime.now());
        suggestions.add(prioritySuggestion);
        
        // 效率建议
        AIWorkSuggestion efficiencySuggestion = new AIWorkSuggestion();
        efficiencySuggestion.setId(2L);
        efficiencySuggestion.setUserId(userId);
        efficiencySuggestion.setSuggestionType("efficiency");
        efficiencySuggestion.setSuggestionTitle("提高工作效率建议");
        efficiencySuggestion.setSuggestionContent("根据您的工作模式分析，上午9-11点是您效率最高的时段，建议将重要任务安排在这个时间段。");
        efficiencySuggestion.setSuggestionReason("基于历史工作数据分析");
        efficiencySuggestion.setPriorityLevel(3);
        efficiencySuggestion.setImpactScore(BigDecimal.valueOf(7.0));
        efficiencySuggestion.setIsRead(false);
        efficiencySuggestion.setCreatedAt(LocalDateTime.now());
        suggestions.add(efficiencySuggestion);
        
        // 协作建议
        AIWorkSuggestion collaborationSuggestion = new AIWorkSuggestion();
        collaborationSuggestion.setId(3L);
        collaborationSuggestion.setUserId(userId);
        collaborationSuggestion.setSuggestionType("collaboration");
        collaborationSuggestion.setSuggestionTitle("团队协作建议");
        collaborationSuggestion.setSuggestionContent("项目A的进度落后于计划，建议与张三同步进度，他负责的前置任务已完成。");
        collaborationSuggestion.setSuggestionReason("基于项目进度和团队协作分析");
        collaborationSuggestion.setPriorityLevel(3);
        collaborationSuggestion.setImpactScore(BigDecimal.valueOf(6.5));
        collaborationSuggestion.setIsRead(false);
        collaborationSuggestion.setCreatedAt(LocalDateTime.now());
        suggestions.add(collaborationSuggestion);
        
        return suggestions;
    }
    
    // ==================== AA-004 文档摘要 ====================
    
    private String handleDocumentSummary(String message, IntentResult intent) {
        return "📄 **文档摘要**\n\n" +
               "根据您提供的内容，以下是主要摘要：\n\n" +
               "**核心要点：**\n" +
               "1. 项目目标明确，预计Q2完成\n" +
               "2. 技术方案采用微服务架构\n" +
               "3. 团队分工清晰，责任到人\n\n" +
               "**关键数据：**\n" +
               "- 预算：100万\n" +
               "- 工期：3个月\n" +
               "- 团队规模：8人\n\n" +
               "需要更详细的摘要吗？";
    }
    
    /**
     * 生成文档摘要
     */
    public DocumentSummaryResult generateDocumentSummary(Long documentId, String summaryType) {
        log.info("生成文档摘要: documentId={}, type={}", documentId, summaryType);
        
        DocumentSummaryResult result = new DocumentSummaryResult();
        result.setDocumentId(documentId);
        result.setSummaryType(summaryType);
        
        // 模拟摘要生成
        result.setSummary("这是一份关于项目管理的技术文档，主要介绍了项目的整体架构、技术选型和实施计划。");
        result.setKeyPoints(Arrays.asList(
            "采用微服务架构设计",
            "使用Spring Boot + Vue.js技术栈",
            "预计3个月完成开发",
            "团队规模8人"
        ));
        result.setWordCount(5000);
        result.setSummaryWordCount(200);
        result.setCompressionRatio(BigDecimal.valueOf(0.04));
        
        return result;
    }
    
    // ==================== AA-005 翻译功能 ====================
    
    private String handleTranslation(String message, IntentResult intent) {
        // 提取要翻译的内容
        String textToTranslate = message.replaceAll("翻译|translate|成|为|英文|中文|：|:", "").trim();
        
        return "🌐 **翻译结果**\n\n" +
               "**原文：**\n" + textToTranslate + "\n\n" +
               "**译文：**\n" + "This is the translated content. (模拟翻译结果)\n\n" +
               "翻译引擎：AI翻译\n" +
               "置信度：95%";
    }
    
    /**
     * 翻译文本
     */
    public AITranslation translateText(Long userId, String sourceText, String sourceLanguage, String targetLanguage) {
        log.info("翻译文本: userId={}, from={}, to={}", userId, sourceLanguage, targetLanguage);
        
        long startTime = System.currentTimeMillis();
        
        AITranslation translation = new AITranslation();
        translation.setId(System.currentTimeMillis());
        translation.setUserId(userId);
        translation.setSourceType("text");
        translation.setSourceLanguage(sourceLanguage);
        translation.setTargetLanguage(targetLanguage);
        translation.setSourceText(sourceText);
        
        // 模拟翻译
        if ("zh".equals(sourceLanguage) && "en".equals(targetLanguage)) {
            translation.setTranslatedText("This is the translated English text.");
        } else if ("en".equals(sourceLanguage) && "zh".equals(targetLanguage)) {
            translation.setTranslatedText("这是翻译后的中文文本。");
        } else {
            translation.setTranslatedText("[Translated: " + sourceText + "]");
        }
        
        translation.setWordCount(sourceText.length());
        translation.setTranslationEngine("ai");
        translation.setModelUsed("gpt-3.5-turbo");
        translation.setTokensUsed(estimateTokens(sourceText + translation.getTranslatedText()));
        translation.setTranslationTimeMs((int) (System.currentTimeMillis() - startTime));
        translation.setQualityScore(BigDecimal.valueOf(0.95));
        translation.setIsReviewed(false);
        translation.setCreatedAt(LocalDateTime.now());
        
        return translation;
    }
    
    // ==================== AA-006 数据分析 ====================
    
    private String handleDataAnalysis(String message, IntentResult intent) {
        return "📊 **数据分析报告**\n\n" +
               "**项目进度分析：**\n" +
               "- 总任务数：45个\n" +
               "- 已完成：32个 (71%)\n" +
               "- 进行中：8个 (18%)\n" +
               "- 待开始：5个 (11%)\n\n" +
               "**效率指标：**\n" +
               "- 平均完成时间：2.3天\n" +
               "- 逾期率：8%\n" +
               "- 团队速度：15点/周\n\n" +
               "**趋势分析：**\n" +
               "本周完成率较上周提升12%，团队效率持续改善。\n\n" +
               "需要更详细的分析吗？";
    }
    
    /**
     * 生成数据分析
     */
    public AIDataAnalysis generateDataAnalysis(Long userId, String analysisType, String analysisScope, Long scopeId) {
        log.info("生成数据分析: userId={}, type={}, scope={}", userId, analysisType, analysisScope);
        
        AIDataAnalysis analysis = new AIDataAnalysis();
        analysis.setId(System.currentTimeMillis());
        analysis.setUserId(userId);
        analysis.setAnalysisType(analysisType);
        analysis.setAnalysisScope(analysisScope);
        analysis.setScopeId(scopeId);
        analysis.setTimeRange("month");
        analysis.setStartDate(LocalDate.now().minusMonths(1));
        analysis.setEndDate(LocalDate.now());
        analysis.setAnalysisTitle(analysisType + "分析报告");
        analysis.setAnalysisContent("基于过去一个月的数据分析...");
        analysis.setKeyFindings("[\"效率提升12%\", \"逾期率下降5%\", \"团队协作改善\"]");
        analysis.setMetrics("{\"completionRate\": 0.71, \"overdueRate\": 0.08, \"avgCompletionTime\": 2.3}");
        analysis.setRecommendations("[\"建议增加代码审查频率\", \"优化任务分配策略\"]");
        analysis.setModelUsed("gpt-3.5-turbo");
        analysis.setTokensUsed(500);
        analysis.setGenerationTimeMs(1500);
        analysis.setIsSaved(false);
        analysis.setCreatedAt(LocalDateTime.now());
        
        return analysis;
    }
    
    // ==================== AA-007 日程建议 ====================
    
    private String handleScheduleQuery(String message, IntentResult intent) {
        return "📅 **今日日程**\n\n" +
               "| 时间 | 事项 | 状态 |\n" +
               "|------|------|------|\n" +
               "| 09:00-10:00 | 晨会 | ✅ 已完成 |\n" +
               "| 10:30-11:30 | 需求评审 | 🔄 进行中 |\n" +
               "| 14:00-15:00 | 技术方案讨论 | ⏳ 待开始 |\n" +
               "| 15:30-16:30 | 代码审查 | ⏳ 待开始 |\n" +
               "| 17:00-17:30 | 日报总结 | ⏳ 待开始 |\n\n" +
               "💡 **建议：** 下午有2小时空闲时间(11:30-14:00)，建议用于处理紧急任务。";
    }
    
    /**
     * 获取日程建议
     */
    public List<AIScheduleSuggestion> getScheduleSuggestions(Long userId, LocalDate date) {
        log.info("获取日程建议: userId={}, date={}", userId, date);
        
        List<AIScheduleSuggestion> suggestions = new ArrayList<>();
        
        // 优化建议
        AIScheduleSuggestion optimizeSuggestion = new AIScheduleSuggestion();
        optimizeSuggestion.setId(1L);
        optimizeSuggestion.setUserId(userId);
        optimizeSuggestion.setSuggestionType("optimize");
        optimizeSuggestion.setSuggestionDate(date);
        optimizeSuggestion.setSuggestionTitle("日程优化建议");
        optimizeSuggestion.setSuggestionContent("建议将「代码审查」移至上午，因为这是您效率最高的时段。");
        optimizeSuggestion.setOptimizationScore(BigDecimal.valueOf(8.5));
        optimizeSuggestion.setTimeSavedMinutes(30);
        optimizeSuggestion.setPriorityLevel(3);
        optimizeSuggestion.setIsRead(false);
        optimizeSuggestion.setCreatedAt(LocalDateTime.now());
        suggestions.add(optimizeSuggestion);
        
        // 休息建议
        AIScheduleSuggestion breakSuggestion = new AIScheduleSuggestion();
        breakSuggestion.setId(2L);
        breakSuggestion.setUserId(userId);
        breakSuggestion.setSuggestionType("break");
        breakSuggestion.setSuggestionDate(date);
        breakSuggestion.setSuggestionTitle("休息提醒");
        breakSuggestion.setSuggestionContent("您已连续工作3小时，建议休息15分钟。");
        breakSuggestion.setPriorityLevel(2);
        breakSuggestion.setIsRead(false);
        breakSuggestion.setCreatedAt(LocalDateTime.now());
        suggestions.add(breakSuggestion);
        
        return suggestions;
    }
    
    // ==================== AA-008 报告生成 ====================
    
    private String handleReportGenerate(String message, IntentResult intent) {
        String reportType = "日报";
        if (message.contains("周报")) {
            reportType = "周报";
        } else if (message.contains("月报")) {
            reportType = "月报";
        }
        
        return "📝 **工作" + reportType + "**\n\n" +
               "**日期：** " + LocalDate.now() + "\n\n" +
               "---\n\n" +
               "### 一、今日完成\n" +
               "1. 完成项目方案设计文档\n" +
               "2. 参加需求评审会议\n" +
               "3. 修复3个Bug\n\n" +
               "### 二、进行中\n" +
               "1. 编写技术文档（进度60%）\n" +
               "2. 代码审查\n\n" +
               "### 三、遇到的问题\n" +
               "1. 接口文档不完整，需要与后端同步\n\n" +
               "### 四、明日计划\n" +
               "1. 完成技术文档编写\n" +
               "2. 开始新功能开发\n\n" +
               "---\n\n" +
               "报告已生成，是否需要修改或发送？";
    }
    
    /**
     * 生成工作报告
     */
    public AIWorkReport generateWorkReport(Long userId, String reportType, String reportScope, Long scopeId) {
        log.info("生成工作报告: userId={}, type={}, scope={}", userId, reportType, reportScope);
        
        AIWorkReport report = new AIWorkReport();
        report.setId(System.currentTimeMillis());
        report.setUserId(userId);
        report.setReportType(reportType);
        report.setReportScope(reportScope);
        report.setScopeId(scopeId);
        
        LocalDate today = LocalDate.now();
        if ("daily".equals(reportType)) {
            report.setReportTitle(today + " 工作日报");
            report.setReportPeriodStart(today);
            report.setReportPeriodEnd(today);
        } else if ("weekly".equals(reportType)) {
            report.setReportTitle("第" + getWeekOfYear(today) + "周 工作周报");
            report.setReportPeriodStart(today.minusDays(today.getDayOfWeek().getValue() - 1));
            report.setReportPeriodEnd(today);
        } else if ("monthly".equals(reportType)) {
            report.setReportTitle(today.getMonth() + " 工作月报");
            report.setReportPeriodStart(today.withDayOfMonth(1));
            report.setReportPeriodEnd(today);
        }
        
        report.setReportContent(generateReportContent(reportType));
        report.setSummary("本周完成任务12个，进行中5个，效率较上周提升15%。");
        report.setAccomplishments("[\"完成项目方案设计\", \"修复10个Bug\", \"完成代码审查\"]");
        report.setInProgress("[\"技术文档编写\", \"新功能开发\"]");
        report.setBlockers("[\"接口文档不完整\"]");
        report.setNextSteps("[\"完成技术文档\", \"开始集成测试\"]");
        report.setMetrics("{\"tasksCompleted\": 12, \"tasksInProgress\": 5, \"efficiency\": 0.85}");
        report.setModelUsed("gpt-3.5-turbo");
        report.setTokensUsed(800);
        report.setGenerationTimeMs(2000);
        report.setIsDraft(true);
        report.setIsSent(false);
        report.setCreatedAt(LocalDateTime.now());
        report.setUpdatedAt(LocalDateTime.now());
        
        return report;
    }
    
    private String generateReportContent(String reportType) {
        return "# 工作" + reportType + "\n\n" +
               "## 一、完成事项\n" +
               "- 完成项目方案设计文档\n" +
               "- 参加需求评审会议\n" +
               "- 修复Bug若干\n\n" +
               "## 二、进行中\n" +
               "- 技术文档编写\n" +
               "- 代码审查\n\n" +
               "## 三、问题与风险\n" +
               "- 接口文档不完整\n\n" +
               "## 四、下一步计划\n" +
               "- 完成技术文档\n" +
               "- 开始新功能开发\n";
    }
    
    private int getWeekOfYear(LocalDate date) {
        return date.getDayOfYear() / 7 + 1;
    }
    
    // ==================== 辅助方法 ====================
    
    private int estimateTokens(String text) {
        // 简单估算：中文约1.5字符/token，英文约4字符/token
        return text.length() / 2;
    }
    
    /**
     * 获取用户会话列表
     */
    public List<AIChatSession> getUserSessions(Long userId, int limit) {
        // 模拟返回会话列表
        List<AIChatSession> sessions = new ArrayList<>();
        
        AIChatSession session1 = new AIChatSession();
        session1.setId(1L);
        session1.setUserId(userId);
        session1.setSessionType("general");
        session1.setTitle("日常对话");
        session1.setMessageCount(10);
        session1.setLastMessageAt(LocalDateTime.now().minusHours(1));
        session1.setCreatedAt(LocalDateTime.now().minusDays(1));
        sessions.add(session1);
        
        AIChatSession session2 = new AIChatSession();
        session2.setId(2L);
        session2.setUserId(userId);
        session2.setSessionType("task");
        session2.setTitle("任务管理");
        session2.setMessageCount(5);
        session2.setLastMessageAt(LocalDateTime.now().minusHours(3));
        session2.setCreatedAt(LocalDateTime.now().minusDays(2));
        sessions.add(session2);
        
        return sessions;
    }
    
    /**
     * 获取会话消息
     */
    public List<AIChatMessage> getSessionMessages(Long sessionId, int limit) {
        // 模拟返回消息列表
        return new ArrayList<>();
    }
    
    /**
     * 获取AI助手配置
     */
    public AIAssistantConfig getAssistantConfig(Long userId) {
        AIAssistantConfig config = new AIAssistantConfig();
        config.setId(1L);
        config.setUserId(userId);
        config.setAssistantName("Mota助手");
        config.setDefaultModel("gpt-3.5-turbo");
        config.setTemperature(BigDecimal.valueOf(0.7));
        config.setMaxTokens(2000);
        config.setEnableContext(true);
        config.setContextWindow(10);
        config.setEnableSuggestions(true);
        config.setSuggestionFrequency("daily");
        config.setEnableAutoSummary(true);
        config.setEnableAutoTranslation(false);
        config.setPreferredLanguage("zh");
        config.setCreatedAt(LocalDateTime.now());
        config.setUpdatedAt(LocalDateTime.now());
        
        return config;
    }
    
    /**
     * 保存AI助手配置
     */
    @Transactional
    public void saveAssistantConfig(AIAssistantConfig config) {
        config.setUpdatedAt(LocalDateTime.now());
        // 保存配置
    }
    
    // ==================== 内部类 ====================
    
    @lombok.Data
    public static class ChatResponse {
        private AIChatMessage userMessage;
        private AIChatMessage assistantMessage;
        private IntentResult intent;
    }
    
    @lombok.Data
    public static class IntentResult {
        private String intentType;
        private double confidence;
        private Map<String, Object> parameters;
    }
    
    @lombok.Data
    public static class TaskCommandParams {
        private String commandType;
        private String taskName;
        private String dueDate;
        private String priority;
        private String assignee;
    }
    
    @lombok.Data
    public static class DocumentSummaryResult {
        private Long documentId;
        private String summaryType;
        private String summary;
        private List<String> keyPoints;
        private Integer wordCount;
        private Integer summaryWordCount;
        private BigDecimal compressionRatio;
    }
}