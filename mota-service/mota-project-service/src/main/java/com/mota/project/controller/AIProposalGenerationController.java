package com.mota.project.controller;

import com.mota.common.core.result.Result;
import com.mota.project.entity.proposal.*;
import com.mota.project.service.AIProposalGenerationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * AI方案生成控制器
 * 实现AG-001到AG-010功能的REST API
 * 此控制器属于项目服务，提供项目相关的AI方案生成功能
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/ai/proposal")
@RequiredArgsConstructor
@Tag(name = "AI方案生成", description = "AI智能方案生成相关接口")
public class AIProposalGenerationController {
    
    private final AIProposalGenerationService proposalService;
    
    // ==================== 会话管理 ====================
    
    @PostMapping("/sessions")
    @Operation(summary = "创建会话", description = "创建新的方案生成会话")
    public Result<ProposalSession> createSession(
            @RequestParam Long userId,
            @RequestParam String title,
            @RequestParam(required = false, defaultValue = "general") String proposalType) {
        ProposalSession session = proposalService.createSession(userId, title, proposalType);
        return Result.success(session);
    }
    
    @GetMapping("/sessions")
    @Operation(summary = "获取会话列表", description = "获取用户的方案会话列表")
    public Result<List<ProposalSession>> getUserSessions(@RequestParam Long userId) {
        List<ProposalSession> sessions = proposalService.getUserSessions(userId);
        return Result.success(sessions);
    }
    
    // ==================== AG-001 意图识别 ====================
    
    @PostMapping("/intent/parse")
    @Operation(summary = "解析意图", description = "AG-001: 解析用户输入的意图")
    public Result<Map<String, Object>> parseIntent(
            @RequestParam Long sessionId,
            @RequestBody String userInput) {
        Map<String, Object> result = proposalService.parseIntent(sessionId, userInput);
        return Result.success(result);
    }
    
    // ==================== AG-002 需求解析 ====================
    
    @PostMapping("/requirement/analyze")
    @Operation(summary = "分析需求", description = "AG-002: 解析用户需求，提取关键要素")
    public Result<RequirementAnalysis> analyzeRequirement(
            @RequestParam Long sessionId,
            @RequestBody String userInput) {
        RequirementAnalysis analysis = proposalService.analyzeRequirement(sessionId, userInput);
        return Result.success(analysis);
    }
    
    // ==================== AG-003 知识检索 ====================
    
    @PostMapping("/knowledge/retrieve")
    @Operation(summary = "检索知识", description = "AG-003: 从知识库检索相关内容")
    public Result<List<Map<String, Object>>> retrieveKnowledge(
            @RequestParam Long sessionId,
            @RequestParam String query,
            @RequestParam(required = false) List<Long> knowledgeBaseIds) {
        List<Map<String, Object>> results = proposalService.retrieveKnowledge(sessionId, query, knowledgeBaseIds);
        return Result.success(results);
    }
    
    // ==================== AG-004 历史参考 ====================
    
    @GetMapping("/history/references")
    @Operation(summary = "获取历史参考", description = "AG-004: 获取历史方案作为参考")
    public Result<List<ProposalContent>> getHistoricalReferences(
            @RequestParam Long userId,
            @RequestParam(required = false) String proposalType,
            @RequestParam(required = false, defaultValue = "5") int limit) {
        List<ProposalContent> references = proposalService.getHistoricalReferences(userId, proposalType, limit);
        return Result.success(references);
    }
    
    // ==================== AG-005 方案生成 ====================
    
    @PostMapping("/generate")
    @Operation(summary = "生成方案", description = "AG-005: 根据需求生成方案")
    public Result<ProposalContent> generateProposal(
            @RequestParam Long sessionId,
            @RequestParam Long requirementId,
            @RequestParam(required = false) Long templateId) {
        ProposalContent proposal = proposalService.generateProposal(sessionId, requirementId, templateId);
        return Result.success(proposal);
    }
    
    @GetMapping("/{proposalId}")
    @Operation(summary = "获取方案详情", description = "获取方案的详细信息")
    public Result<ProposalContent> getProposalDetail(@PathVariable Long proposalId) {
        ProposalContent proposal = proposalService.getProposalDetail(proposalId);
        return Result.success(proposal);
    }
    
    // ==================== AG-006 章节编排 ====================
    
    @GetMapping("/{proposalId}/sections")
    @Operation(summary = "获取章节列表", description = "AG-006: 获取方案的章节列表")
    public Result<List<ProposalSection>> getProposalSections(@PathVariable Long proposalId) {
        List<ProposalSection> sections = proposalService.getProposalSections(proposalId);
        return Result.success(sections);
    }
    
    @PutMapping("/sections/{sectionId}")
    @Operation(summary = "更新章节", description = "AG-006: 更新章节内容")
    public Result<ProposalSection> updateSection(
            @PathVariable Long sectionId,
            @RequestParam String title,
            @RequestBody String content) {
        ProposalSection section = proposalService.updateSection(sectionId, title, content);
        return Result.success(section);
    }
    
    @PostMapping("/{proposalId}/sections/reorder")
    @Operation(summary = "调整章节顺序", description = "AG-006: 调整章节的排列顺序")
    public Result<Void> reorderSections(
            @PathVariable Long proposalId,
            @RequestBody List<Long> sectionIds) {
        proposalService.reorderSections(proposalId, sectionIds);
        return Result.success(null);
    }
    
    // ==================== AG-007 图表建议 ====================
    
    @PostMapping("/{proposalId}/charts/suggest")
    @Operation(summary = "生成图表建议", description = "AG-007: 为方案生成图表建议")
    public Result<List<ChartSuggestion>> generateChartSuggestions(@PathVariable Long proposalId) {
        List<ChartSuggestion> suggestions = proposalService.generateChartSuggestions(proposalId);
        return Result.success(suggestions);
    }
    
    @PostMapping("/charts/{suggestionId}/apply")
    @Operation(summary = "应用图表建议", description = "AG-007: 应用选中的图表建议")
    public Result<Void> applyChartSuggestion(
            @PathVariable Long suggestionId,
            @RequestBody(required = false) String chartConfig) {
        proposalService.applyChartSuggestion(suggestionId, chartConfig);
        return Result.success(null);
    }
    
    // ==================== AG-008 质量检查 ====================
    
    @PostMapping("/{proposalId}/quality/check")
    @Operation(summary = "执行质量检查", description = "AG-008: 对方案进行质量检查")
    public Result<List<QualityCheck>> performQualityCheck(
            @PathVariable Long proposalId,
            @RequestParam(required = false) Long versionId) {
        List<QualityCheck> checks = proposalService.performQualityCheck(proposalId, versionId);
        return Result.success(checks);
    }
    
    // ==================== AG-009 多轮优化 ====================
    
    @GetMapping("/{proposalId}/versions")
    @Operation(summary = "获取版本列表", description = "AG-009: 获取方案的版本历史")
    public Result<List<ProposalVersion>> getProposalVersions(@PathVariable Long proposalId) {
        List<ProposalVersion> versions = proposalService.getProposalVersions(proposalId);
        return Result.success(versions);
    }
    
    @PostMapping("/{proposalId}/versions")
    @Operation(summary = "创建新版本", description = "AG-009: 创建方案的新版本")
    public Result<ProposalVersion> createVersion(
            @PathVariable Long proposalId,
            @RequestParam String versionNumber,
            @RequestParam(required = false, defaultValue = "draft") String versionType,
            @RequestParam(required = false) String changeDescription) {
        ProposalVersion version = proposalService.createVersion(proposalId, versionNumber, versionType, changeDescription);
        return Result.success(version);
    }
    
    @PostMapping("/{proposalId}/optimize")
    @Operation(summary = "优化方案", description = "AG-009: 根据反馈优化方案")
    public Result<ProposalContent> optimizeProposal(
            @PathVariable Long proposalId,
            @RequestBody String feedback) {
        ProposalContent proposal = proposalService.optimizeProposal(proposalId, feedback);
        return Result.success(proposal);
    }
    
    @PostMapping("/{proposalId}/rollback/{versionId}")
    @Operation(summary = "回滚版本", description = "AG-009: 回滚到指定版本")
    public Result<ProposalContent> rollbackToVersion(
            @PathVariable Long proposalId,
            @PathVariable Long versionId) {
        ProposalContent proposal = proposalService.rollbackToVersion(proposalId, versionId);
        return Result.success(proposal);
    }
    
    // ==================== AG-010 方案导出 ====================
    
    @PostMapping("/{proposalId}/export")
    @Operation(summary = "导出方案", description = "AG-010: 导出方案为指定格式")
    public Result<ProposalExport> exportProposal(
            @PathVariable Long proposalId,
            @RequestParam(required = false) Long versionId,
            @RequestParam(defaultValue = "word") String format,
            @RequestParam(required = false) Long templateId) {
        ProposalExport export = proposalService.exportProposal(proposalId, versionId, format, templateId);
        return Result.success(export);
    }
    
    @GetMapping("/exports/{exportId}/download")
    @Operation(summary = "下载导出文件", description = "AG-010: 下载已导出的文件")
    public Result<ProposalExport> downloadExport(@PathVariable Long exportId) {
        ProposalExport export = proposalService.downloadExport(exportId);
        return Result.success(export);
    }
    
    // ==================== 模板管理 ====================
    
    @GetMapping("/templates")
    @Operation(summary = "获取模板列表", description = "获取可用的方案模板")
    public Result<List<ProposalTemplate>> getTemplates(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String industry) {
        List<ProposalTemplate> templates = proposalService.getTemplates(type, industry);
        return Result.success(templates);
    }
}