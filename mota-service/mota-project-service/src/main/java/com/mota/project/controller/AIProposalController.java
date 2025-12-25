package com.mota.project.controller;

import com.mota.project.service.AIProposalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * AI方案生成控制器
 */
@RestController
@RequestMapping("/api/ai/proposal")
@RequiredArgsConstructor
public class AIProposalController {

    private final AIProposalService aiProposalService;

    // ========== 方案生成 ==========

    @PostMapping("/project")
    public ResponseEntity<String> generateProjectProposal(
            @RequestParam String requirement,
            @RequestParam String projectType,
            @RequestBody(required = false) Map<String, Object> context) {
        return ResponseEntity.ok(aiProposalService.generateProjectProposal(requirement, projectType, context));
    }

    @PostMapping("/technical")
    public ResponseEntity<String> generateTechnicalProposal(
            @RequestParam String requirement,
            @RequestBody Map<String, Object> params) {
        @SuppressWarnings("unchecked")
        List<String> techStack = (List<String>) params.get("techStack");
        @SuppressWarnings("unchecked")
        Map<String, Object> constraints = (Map<String, Object>) params.get("constraints");
        return ResponseEntity.ok(aiProposalService.generateTechnicalProposal(requirement, techStack, constraints));
    }

    @PostMapping("/marketing")
    public ResponseEntity<String> generateMarketingProposal(
            @RequestParam String product,
            @RequestParam String targetAudience,
            @RequestParam(required = false) Double budget) {
        return ResponseEntity.ok(aiProposalService.generateMarketingProposal(product, targetAudience, budget));
    }

    @PostMapping("/business-plan")
    public ResponseEntity<String> generateBusinessPlan(
            @RequestParam String businessIdea,
            @RequestParam String industry,
            @RequestParam String scale) {
        return ResponseEntity.ok(aiProposalService.generateBusinessPlan(businessIdea, industry, scale));
    }

    @PostMapping("/work-report")
    public ResponseEntity<String> generateWorkReport(
            @RequestParam Long projectId,
            @RequestParam String reportType,
            @RequestParam String period) {
        return ResponseEntity.ok(aiProposalService.generateWorkReport(projectId, reportType, period));
    }

    // ========== 方案优化 ==========

    @PostMapping("/optimize")
    public ResponseEntity<String> optimizeProposal(
            @RequestBody Map<String, String> params) {
        String originalProposal = params.get("originalProposal");
        String feedback = params.get("feedback");
        return ResponseEntity.ok(aiProposalService.optimizeProposal(originalProposal, feedback));
    }

    @PostMapping("/expand")
    public ResponseEntity<String> expandProposalSection(
            @RequestBody Map<String, String> params) {
        String proposal = params.get("proposal");
        String section = params.get("section");
        return ResponseEntity.ok(aiProposalService.expandProposalSection(proposal, section));
    }

    @PostMapping("/evaluate")
    public ResponseEntity<Map<String, Object>> evaluateProposal(
            @RequestBody String proposal) {
        return ResponseEntity.ok(aiProposalService.evaluateProposal(proposal));
    }

    // ========== 知识库集成 ==========

    @PostMapping("/with-knowledge")
    public ResponseEntity<String> generateProposalWithKnowledge(
            @RequestParam String requirement,
            @RequestBody List<Long> knowledgeBaseIds) {
        return ResponseEntity.ok(aiProposalService.generateProposalWithKnowledge(requirement, knowledgeBaseIds));
    }

    @GetMapping("/search-related")
    public ResponseEntity<List<Map<String, Object>>> searchRelatedProposals(
            @RequestParam String requirement,
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(aiProposalService.searchRelatedProposals(requirement, limit));
    }

    // ========== 多轮对话 ==========

    @PostMapping("/session/start")
    public ResponseEntity<String> startProposalSession(
            @RequestParam Long userId,
            @RequestParam String proposalType) {
        return ResponseEntity.ok(aiProposalService.startProposalSession(userId, proposalType));
    }

    @PostMapping("/session/{sessionId}/continue")
    public ResponseEntity<String> continueProposalSession(
            @PathVariable String sessionId,
            @RequestBody String userMessage) {
        return ResponseEntity.ok(aiProposalService.continueProposalSession(sessionId, userMessage));
    }

    @GetMapping("/session/{sessionId}/history")
    public ResponseEntity<List<Map<String, Object>>> getSessionHistory(
            @PathVariable String sessionId) {
        return ResponseEntity.ok(aiProposalService.getSessionHistory(sessionId));
    }

    @PostMapping("/session/{sessionId}/finalize")
    public ResponseEntity<String> finalizeProposalSession(
            @PathVariable String sessionId) {
        return ResponseEntity.ok(aiProposalService.finalizeProposalSession(sessionId));
    }

    // ========== 模板管理 ==========

    @GetMapping("/templates")
    public ResponseEntity<List<Map<String, Object>>> getProposalTemplates(
            @RequestParam(required = false) String proposalType) {
        return ResponseEntity.ok(aiProposalService.getProposalTemplates(proposalType));
    }

    @PostMapping("/from-template/{templateId}")
    public ResponseEntity<String> generateFromTemplate(
            @PathVariable Long templateId,
            @RequestBody Map<String, Object> variables) {
        return ResponseEntity.ok(aiProposalService.generateFromTemplate(templateId, variables));
    }

    // ========== AI助手功能 ==========

    @PostMapping("/ask")
    public ResponseEntity<String> askQuestion(
            @RequestParam String question,
            @RequestBody(required = false) Map<String, Object> context) {
        return ResponseEntity.ok(aiProposalService.askQuestion(question, context));
    }

    @GetMapping("/document/{documentId}/summary")
    public ResponseEntity<String> generateDocumentSummary(
            @PathVariable Long documentId,
            @RequestParam(defaultValue = "500") int maxLength) {
        return ResponseEntity.ok(aiProposalService.generateDocumentSummary(documentId, maxLength));
    }

    @PostMapping("/meeting-minutes")
    public ResponseEntity<String> generateMeetingMinutes(
            @RequestBody String meetingNotes) {
        return ResponseEntity.ok(aiProposalService.generateMeetingMinutes(meetingNotes));
    }

    @PostMapping("/suggest-tasks")
    public ResponseEntity<List<Map<String, Object>>> suggestTasks(
            @RequestParam Long projectId,
            @RequestBody(required = false) List<Long> currentTasks) {
        return ResponseEntity.ok(aiProposalService.suggestTasks(projectId, currentTasks));
    }

    @PostMapping("/analyze-data")
    public ResponseEntity<Map<String, Object>> analyzeData(
            @RequestBody Map<String, Object> data,
            @RequestParam String analysisType) {
        return ResponseEntity.ok(aiProposalService.analyzeData(data, analysisType));
    }
}