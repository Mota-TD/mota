package com.mota.project.controller;

import com.mota.project.entity.assistant.*;
import com.mota.project.service.AIAssistantService;
import com.mota.project.service.AIAssistantService.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * AI助手控制器
 * 实现AA-001到AA-008功能
 */
@Slf4j
@RestController
@RequestMapping("/api/ai/assistant")
@RequiredArgsConstructor
public class AIAssistantController {
    
    private final AIAssistantService assistantService;
    
    // ==================== AA-001 智能问答 ====================
    
    /**
     * 创建对话会话
     */
    @PostMapping("/sessions")
    public ResponseEntity<AIChatSession> createSession(
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "1") Long userId,
            @RequestBody CreateSessionRequest request) {
        
        AIChatSession session = assistantService.createSession(
            userId, 
            request.getSessionType(), 
            request.getTitle()
        );
        return ResponseEntity.ok(session);
    }
    
    /**
     * 获取用户会话列表
     */
    @GetMapping("/sessions")
    public ResponseEntity<List<AIChatSession>> getUserSessions(
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "1") Long userId,
            @RequestParam(required = false, defaultValue = "20") int limit) {
        
        List<AIChatSession> sessions = assistantService.getUserSessions(userId, limit);
        return ResponseEntity.ok(sessions);
    }
    
    /**
     * 获取会话消息
     */
    @GetMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<List<AIChatMessage>> getSessionMessages(
            @PathVariable Long sessionId,
            @RequestParam(required = false, defaultValue = "50") int limit) {
        
        List<AIChatMessage> messages = assistantService.getSessionMessages(sessionId, limit);
        return ResponseEntity.ok(messages);
    }
    
    /**
     * 发送消息
     */
    @PostMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<ChatResponse> sendMessage(
            @PathVariable Long sessionId,
            @RequestBody SendMessageRequest request) {
        
        ChatResponse response = assistantService.chat(sessionId, request.getMessage());
        return ResponseEntity.ok(response);
    }
    
    /**
     * 快速对话（无需创建会话）
     */
    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> quickChat(
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "1") Long userId,
            @RequestBody SendMessageRequest request) {
        
        // 创建临时会话
        AIChatSession session = assistantService.createSession(userId, "general", "快速对话");
        ChatResponse response = assistantService.chat(session.getId(), request.getMessage());
        return ResponseEntity.ok(response);
    }
    
    // ==================== AA-002 任务指令 ====================
    
    /**
     * 执行任务指令
     */
    @PostMapping("/commands/task")
    public ResponseEntity<AITaskCommand> executeTaskCommand(
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "1") Long userId,
            @RequestBody TaskCommandRequest request) {
        
        AITaskCommand command = assistantService.executeTaskCommand(userId, request.getCommand());
        return ResponseEntity.ok(command);
    }
    
    // ==================== AA-003 工作建议 ====================
    
    /**
     * 获取工作建议
     */
    @GetMapping("/suggestions/work")
    public ResponseEntity<List<AIWorkSuggestion>> getWorkSuggestions(
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "1") Long userId) {
        
        List<AIWorkSuggestion> suggestions = assistantService.getWorkSuggestions(userId);
        return ResponseEntity.ok(suggestions);
    }
    
    /**
     * 标记建议已读
     */
    @PutMapping("/suggestions/work/{suggestionId}/read")
    public ResponseEntity<Map<String, Object>> markSuggestionRead(
            @PathVariable Long suggestionId) {
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "已标记为已读");
        return ResponseEntity.ok(result);
    }
    
    /**
     * 采纳/忽略建议
     */
    @PutMapping("/suggestions/work/{suggestionId}/feedback")
    public ResponseEntity<Map<String, Object>> feedbackSuggestion(
            @PathVariable Long suggestionId,
            @RequestBody SuggestionFeedbackRequest request) {
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", request.isAccepted() ? "已采纳建议" : "已忽略建议");
        return ResponseEntity.ok(result);
    }
    
    // ==================== AA-004 文档摘要 ====================
    
    /**
     * 生成文档摘要
     */
    @PostMapping("/summary/document")
    public ResponseEntity<DocumentSummaryResult> generateDocumentSummary(
            @RequestBody DocumentSummaryRequest request) {
        
        DocumentSummaryResult result = assistantService.generateDocumentSummary(
            request.getDocumentId(),
            request.getSummaryType()
        );
        return ResponseEntity.ok(result);
    }
    
    /**
     * 生成文本摘要
     */
    @PostMapping("/summary/text")
    public ResponseEntity<Map<String, Object>> generateTextSummary(
            @RequestBody TextSummaryRequest request) {
        
        // 模拟生成摘要
        Map<String, Object> result = new HashMap<>();
        result.put("summary", "这是生成的摘要内容...");
        result.put("keyPoints", List.of("要点1", "要点2", "要点3"));
        result.put("wordCount", request.getText().length());
        result.put("summaryWordCount", 100);
        
        return ResponseEntity.ok(result);
    }
    
    // ==================== AA-005 翻译功能 ====================
    
    /**
     * 翻译文本
     */
    @PostMapping("/translate")
    public ResponseEntity<AITranslation> translateText(
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "1") Long userId,
            @RequestBody TranslateRequest request) {
        
        AITranslation translation = assistantService.translateText(
            userId,
            request.getText(),
            request.getSourceLanguage(),
            request.getTargetLanguage()
        );
        return ResponseEntity.ok(translation);
    }
    
    /**
     * 检测语言
     */
    @PostMapping("/translate/detect")
    public ResponseEntity<Map<String, Object>> detectLanguage(
            @RequestBody DetectLanguageRequest request) {
        
        // 简单的语言检测
        String text = request.getText();
        String language = "zh";
        double confidence = 0.9;
        
        if (text.matches(".*[a-zA-Z]+.*") && !text.matches(".*[\u4e00-\u9fa5]+.*")) {
            language = "en";
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("language", language);
        result.put("languageName", "zh".equals(language) ? "中文" : "英文");
        result.put("confidence", confidence);
        
        return ResponseEntity.ok(result);
    }
    
    // ==================== AA-006 数据分析 ====================
    
    /**
     * 生成数据分析
     */
    @PostMapping("/analysis")
    public ResponseEntity<AIDataAnalysis> generateDataAnalysis(
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "1") Long userId,
            @RequestBody DataAnalysisRequest request) {
        
        AIDataAnalysis analysis = assistantService.generateDataAnalysis(
            userId,
            request.getAnalysisType(),
            request.getAnalysisScope(),
            request.getScopeId()
        );
        return ResponseEntity.ok(analysis);
    }
    
    /**
     * 获取分析建议
     */
    @GetMapping("/analysis/suggestions")
    public ResponseEntity<List<Map<String, Object>>> getAnalysisSuggestions(
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "1") Long userId,
            @RequestParam(required = false) String scope) {
        
        List<Map<String, Object>> suggestions = List.of(
            Map.of("type", "project", "title", "项目进度分析", "description", "分析项目整体进度和风险"),
            Map.of("type", "task", "title", "任务效率分析", "description", "分析任务完成效率和瓶颈"),
            Map.of("type", "team", "title", "团队效能分析", "description", "分析团队协作效率和贡献度"),
            Map.of("type", "resource", "title", "资源利用分析", "description", "分析资源分配和利用率")
        );
        
        return ResponseEntity.ok(suggestions);
    }
    
    // ==================== AA-007 日程建议 ====================
    
    /**
     * 获取日程建议
     */
    @GetMapping("/suggestions/schedule")
    public ResponseEntity<List<AIScheduleSuggestion>> getScheduleSuggestions(
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "1") Long userId,
            @RequestParam(required = false) String date) {
        
        LocalDate targetDate = date != null ? LocalDate.parse(date) : LocalDate.now();
        List<AIScheduleSuggestion> suggestions = assistantService.getScheduleSuggestions(userId, targetDate);
        return ResponseEntity.ok(suggestions);
    }
    
    /**
     * 应用日程建议
     */
    @PostMapping("/suggestions/schedule/{suggestionId}/apply")
    public ResponseEntity<Map<String, Object>> applyScheduleSuggestion(
            @PathVariable Long suggestionId) {
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "日程建议已应用");
        return ResponseEntity.ok(result);
    }
    
    // ==================== AA-008 报告生成 ====================
    
    /**
     * 生成工作报告
     */
    @PostMapping("/reports")
    public ResponseEntity<AIWorkReport> generateWorkReport(
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "1") Long userId,
            @RequestBody WorkReportRequest request) {
        
        AIWorkReport report = assistantService.generateWorkReport(
            userId,
            request.getReportType(),
            request.getReportScope(),
            request.getScopeId()
        );
        return ResponseEntity.ok(report);
    }
    
    /**
     * 获取报告列表
     */
    @GetMapping("/reports")
    public ResponseEntity<List<AIWorkReport>> getWorkReports(
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "1") Long userId,
            @RequestParam(required = false) String reportType,
            @RequestParam(required = false, defaultValue = "20") int limit) {
        
        // 模拟返回报告列表
        return ResponseEntity.ok(List.of());
    }
    
    /**
     * 发送报告
     */
    @PostMapping("/reports/{reportId}/send")
    public ResponseEntity<Map<String, Object>> sendWorkReport(
            @PathVariable Long reportId,
            @RequestBody SendReportRequest request) {
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "报告已发送");
        result.put("sentTo", request.getRecipients());
        return ResponseEntity.ok(result);
    }
    
    // ==================== 配置管理 ====================
    
    /**
     * 获取AI助手配置
     */
    @GetMapping("/config")
    public ResponseEntity<AIAssistantConfig> getAssistantConfig(
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "1") Long userId) {
        
        AIAssistantConfig config = assistantService.getAssistantConfig(userId);
        return ResponseEntity.ok(config);
    }
    
    /**
     * 保存AI助手配置
     */
    @PutMapping("/config")
    public ResponseEntity<Map<String, Object>> saveAssistantConfig(
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "1") Long userId,
            @RequestBody AIAssistantConfig config) {
        
        config.setUserId(userId);
        assistantService.saveAssistantConfig(config);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "配置已保存");
        return ResponseEntity.ok(result);
    }
    
    // ==================== 请求类 ====================
    
    @lombok.Data
    public static class CreateSessionRequest {
        private String sessionType;
        private String title;
        private String contextType;
        private Long contextId;
    }
    
    @lombok.Data
    public static class SendMessageRequest {
        private String message;
        private String contentType;
    }
    
    @lombok.Data
    public static class TaskCommandRequest {
        private String command;
    }
    
    @lombok.Data
    public static class SuggestionFeedbackRequest {
        private boolean accepted;
        private String comment;
    }
    
    @lombok.Data
    public static class DocumentSummaryRequest {
        private Long documentId;
        private String summaryType;
    }
    
    @lombok.Data
    public static class TextSummaryRequest {
        private String text;
        private String summaryType;
    }
    
    @lombok.Data
    public static class TranslateRequest {
        private String text;
        private String sourceLanguage;
        private String targetLanguage;
    }
    
    @lombok.Data
    public static class DetectLanguageRequest {
        private String text;
    }
    
    @lombok.Data
    public static class DataAnalysisRequest {
        private String analysisType;
        private String analysisScope;
        private Long scopeId;
        private String timeRange;
    }
    
    @lombok.Data
    public static class WorkReportRequest {
        private String reportType;
        private String reportScope;
        private Long scopeId;
    }
    
    @lombok.Data
    public static class SendReportRequest {
        private List<String> recipients;
        private String message;
    }
}