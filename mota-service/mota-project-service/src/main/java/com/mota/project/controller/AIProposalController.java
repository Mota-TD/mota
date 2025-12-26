package com.mota.project.controller;

import com.mota.common.core.result.Result;
import com.mota.project.service.AIProposalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * AI方案生成控制器（旧版兼容接口）
 * 注意：新功能请使用 AIProposalGenerationController
 */
@RestController
@RequestMapping("/api/ai/proposal/legacy")
@RequiredArgsConstructor
@Tag(name = "AI方案生成（旧版）", description = "AI方案生成旧版兼容接口")
public class AIProposalController {

    private final AIProposalService aiProposalService;

    // ========== 方案生成 ==========

    @PostMapping("/project")
    @Operation(summary = "生成项目方案", description = "根据需求生成项目方案")
    public Result<String> generateProjectProposal(
            @RequestParam String requirement,
            @RequestParam String projectType,
            @RequestBody(required = false) Map<String, Object> context) {
        return Result.success(aiProposalService.generateProjectProposal(requirement, projectType, context));
    }

    @PostMapping("/technical")
    @Operation(summary = "生成技术方案", description = "根据需求生成技术方案")
    public Result<String> generateTechnicalProposal(
            @RequestParam String requirement,
            @RequestBody Map<String, Object> params) {
        @SuppressWarnings("unchecked")
        List<String> techStack = (List<String>) params.get("techStack");
        @SuppressWarnings("unchecked")
        Map<String, Object> constraints = (Map<String, Object>) params.get("constraints");
        return Result.success(aiProposalService.generateTechnicalProposal(requirement, techStack, constraints));
    }

    @PostMapping("/marketing")
    @Operation(summary = "生成营销方案", description = "根据产品和目标受众生成营销方案")
    public Result<String> generateMarketingProposal(
            @RequestParam String product,
            @RequestParam String targetAudience,
            @RequestParam(required = false) Double budget) {
        return Result.success(aiProposalService.generateMarketingProposal(product, targetAudience, budget));
    }

    @PostMapping("/business-plan")
    @Operation(summary = "生成商业计划", description = "根据商业想法生成商业计划")
    public Result<String> generateBusinessPlan(
            @RequestParam String businessIdea,
            @RequestParam String industry,
            @RequestParam String scale) {
        return Result.success(aiProposalService.generateBusinessPlan(businessIdea, industry, scale));
    }

    @PostMapping("/work-report")
    @Operation(summary = "生成工作报告", description = "根据项目生成工作报告")
    public Result<String> generateWorkReport(
            @RequestParam Long projectId,
            @RequestParam String reportType,
            @RequestParam String period) {
        return Result.success(aiProposalService.generateWorkReport(projectId, reportType, period));
    }

    // ========== 方案优化 ==========

    @PostMapping("/optimize")
    @Operation(summary = "优化方案", description = "根据反馈优化方案")
    public Result<String> optimizeProposal(
            @RequestBody Map<String, String> params) {
        String originalProposal = params.get("originalProposal");
        String feedback = params.get("feedback");
        return Result.success(aiProposalService.optimizeProposal(originalProposal, feedback));
    }

    @PostMapping("/expand")
    @Operation(summary = "扩展方案章节", description = "扩展方案的指定章节")
    public Result<String> expandProposalSection(
            @RequestBody Map<String, String> params) {
        String proposal = params.get("proposal");
        String section = params.get("section");
        return Result.success(aiProposalService.expandProposalSection(proposal, section));
    }

    @PostMapping("/evaluate")
    @Operation(summary = "评估方案", description = "评估方案质量")
    public Result<Map<String, Object>> evaluateProposal(
            @RequestBody String proposal) {
        return Result.success(aiProposalService.evaluateProposal(proposal));
    }

    // ========== 知识库集成 ==========

    @PostMapping("/with-knowledge")
    @Operation(summary = "基于知识库生成方案", description = "结合知识库内容生成方案")
    public Result<String> generateProposalWithKnowledge(
            @RequestParam String requirement,
            @RequestBody List<Long> knowledgeBaseIds) {
        return Result.success(aiProposalService.generateProposalWithKnowledge(requirement, knowledgeBaseIds));
    }

    @GetMapping("/search-related")
    @Operation(summary = "搜索相关方案", description = "搜索与需求相关的历史方案")
    public Result<List<Map<String, Object>>> searchRelatedProposals(
            @RequestParam String requirement,
            @RequestParam(defaultValue = "5") int limit) {
        return Result.success(aiProposalService.searchRelatedProposals(requirement, limit));
    }

    // ========== 多轮对话 ==========

    @PostMapping("/session/start")
    @Operation(summary = "开始会话", description = "开始方案生成会话")
    public Result<String> startProposalSession(
            @RequestParam Long userId,
            @RequestParam String proposalType) {
        return Result.success(aiProposalService.startProposalSession(userId, proposalType));
    }

    @PostMapping("/session/{sessionId}/continue")
    @Operation(summary = "继续会话", description = "继续方案生成会话")
    public Result<String> continueProposalSession(
            @PathVariable String sessionId,
            @RequestBody String userMessage) {
        return Result.success(aiProposalService.continueProposalSession(sessionId, userMessage));
    }

    @GetMapping("/session/{sessionId}/history")
    @Operation(summary = "获取会话历史", description = "获取会话的历史消息")
    public Result<List<Map<String, Object>>> getSessionHistory(
            @PathVariable String sessionId) {
        return Result.success(aiProposalService.getSessionHistory(sessionId));
    }

    @PostMapping("/session/{sessionId}/finalize")
    @Operation(summary = "完成会话", description = "完成方案生成会话")
    public Result<String> finalizeProposalSession(
            @PathVariable String sessionId) {
        return Result.success(aiProposalService.finalizeProposalSession(sessionId));
    }

    // ========== 模板管理 ==========

    @GetMapping("/templates/list")
    @Operation(summary = "获取模板列表", description = "获取方案模板列表")
    public Result<List<Map<String, Object>>> getProposalTemplates(
            @RequestParam(required = false) String proposalType) {
        return Result.success(aiProposalService.getProposalTemplates(proposalType));
    }

    @PostMapping("/from-template/{templateId}")
    @Operation(summary = "从模板生成", description = "从模板生成方案")
    public Result<String> generateFromTemplate(
            @PathVariable Long templateId,
            @RequestBody Map<String, Object> variables) {
        return Result.success(aiProposalService.generateFromTemplate(templateId, variables));
    }

    // ========== AI助手功能 ==========

    @PostMapping("/ask")
    @Operation(summary = "提问", description = "向AI助手提问")
    public Result<String> askQuestion(
            @RequestParam String question,
            @RequestBody(required = false) Map<String, Object> context) {
        return Result.success(aiProposalService.askQuestion(question, context));
    }

    @GetMapping("/document/{documentId}/summary")
    @Operation(summary = "生成文档摘要", description = "生成文档的摘要")
    public Result<String> generateDocumentSummary(
            @PathVariable Long documentId,
            @RequestParam(defaultValue = "500") int maxLength) {
        return Result.success(aiProposalService.generateDocumentSummary(documentId, maxLength));
    }

    @PostMapping("/meeting-minutes")
    @Operation(summary = "生成会议纪要", description = "根据会议笔记生成会议纪要")
    public Result<String> generateMeetingMinutes(
            @RequestBody String meetingNotes) {
        return Result.success(aiProposalService.generateMeetingMinutes(meetingNotes));
    }

    @PostMapping("/suggest-tasks")
    @Operation(summary = "建议任务", description = "为项目建议任务")
    public Result<List<Map<String, Object>>> suggestTasks(
            @RequestParam Long projectId,
            @RequestBody(required = false) List<Long> currentTasks) {
        return Result.success(aiProposalService.suggestTasks(projectId, currentTasks));
    }

    @PostMapping("/analyze-data")
    @Operation(summary = "分析数据", description = "分析数据并生成报告")
    public Result<Map<String, Object>> analyzeData(
            @RequestBody Map<String, Object> data,
            @RequestParam String analysisType) {
        return Result.success(aiProposalService.analyzeData(data, analysisType));
    }
}