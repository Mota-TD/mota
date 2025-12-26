package com.mota.project.controller;

import com.mota.common.core.result.Result;
import com.mota.project.entity.search.*;
import com.mota.project.service.SmartSearchService;
import com.mota.project.service.SmartSearchService.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 智能搜索控制器
 * 实现SS-001到SS-008功能
 */
@Slf4j
@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@Tag(name = "智能搜索", description = "智能搜索相关接口")
public class SmartSearchController {
    
    private final SmartSearchService searchService;
    
    // ==================== SS-001 全文检索 ====================
    
    /**
     * 全文关键词检索
     */
    @GetMapping("/keyword")
    @Operation(summary = "全文关键词检索", description = "SS-001: 基于关键词的全文检索")
    public Result<SearchResult> keywordSearch(
            @RequestParam String query,
            @RequestParam(required = false) String type,
            @RequestParam(required = false, defaultValue = "1") int page,
            @RequestParam(required = false, defaultValue = "20") int pageSize,
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "1") Long userId) {
        
        SearchRequest request = new SearchRequest();
        request.setUserId(userId);
        request.setSearchType(type != null ? type : "all");
        request.setPage(page);
        request.setPageSize(pageSize);
        
        SearchResult result = searchService.keywordSearch(query, request);
        return Result.success(result);
    }
    
    // ==================== SS-002 语义搜索 ====================
    
    /**
     * 语义相似度搜索
     */
    @GetMapping("/semantic")
    @Operation(summary = "语义相似度搜索", description = "SS-002: 基于语义理解的搜索")
    public Result<SearchResult> semanticSearch(
            @RequestParam String query,
            @RequestParam(required = false) String type,
            @RequestParam(required = false, defaultValue = "1") int page,
            @RequestParam(required = false, defaultValue = "20") int pageSize,
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "1") Long userId) {
        
        SearchRequest request = new SearchRequest();
        request.setUserId(userId);
        request.setSearchType(type != null ? type : "all");
        request.setPage(page);
        request.setPageSize(pageSize);
        
        SearchResult result = searchService.semanticSearch(query, request);
        return Result.success(result);
    }
    
    // ==================== SS-003 向量检索 ====================
    
    /**
     * 向量数据库检索
     */
    @PostMapping("/vector")
    @Operation(summary = "向量数据库检索", description = "SS-003: 基于向量的相似度检索")
    public Result<List<DocumentVector>> vectorSearch(
            @RequestBody VectorSearchRequest request) {
        
        // 模拟向量输入
        float[] queryVector = new float[768];
        List<DocumentVector> results = searchService.vectorSearch(queryVector, request.getTopK());
        return Result.success(results);
    }
    
    // ==================== SS-004 混合检索 ====================
    
    /**
     * 向量+关键词混合检索
     */
    @GetMapping("/hybrid")
    @Operation(summary = "混合检索", description = "SS-004: 向量+关键词混合检索")
    public Result<SearchResult> hybridSearch(
            @RequestParam String query,
            @RequestParam(required = false) String type,
            @RequestParam(required = false, defaultValue = "1") int page,
            @RequestParam(required = false, defaultValue = "20") int pageSize,
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "1") Long userId) {
        
        SearchRequest request = new SearchRequest();
        request.setUserId(userId);
        request.setSearchType(type != null ? type : "all");
        request.setPage(page);
        request.setPageSize(pageSize);
        
        SearchResult result = searchService.hybridSearch(query, request);
        return Result.success(result);
    }
    
    // ==================== SS-005 意图识别 ====================
    
    /**
     * 搜索意图识别
     */
    @GetMapping("/intent")
    @Operation(summary = "搜索意图识别", description = "SS-005: 识别用户搜索意图")
    public Result<SearchIntent> detectIntent(@RequestParam String query) {
        SearchIntent intent = searchService.detectIntent(query);
        return Result.success(intent);
    }
    
    // ==================== SS-006 自动纠错 ====================
    
    /**
     * 搜索词自动纠错
     */
    @GetMapping("/correct")
    @Operation(summary = "搜索词自动纠错", description = "SS-006: 自动纠正搜索词拼写错误")
    public Result<CorrectionResult> autoCorrect(@RequestParam String query) {
        String corrected = searchService.autoCorrect(query);
        List<String> suggestions = searchService.getCorrectionSuggestions(query);
        
        CorrectionResult result = new CorrectionResult();
        result.setOriginal(query);
        result.setCorrected(corrected);
        result.setWasCorrected(!query.equals(corrected));
        result.setSuggestions(suggestions);
        
        return Result.success(result);
    }
    
    // ==================== SS-007 智能补全 ====================
    
    /**
     * 搜索词智能补全
     */
    @GetMapping("/complete")
    @Operation(summary = "搜索词智能补全", description = "SS-007: 智能补全搜索词")
    public Result<List<SearchSuggestion>> getCompletions(
            @RequestParam String prefix,
            @RequestParam(required = false, defaultValue = "10") int limit) {
        
        List<SearchSuggestion> completions = searchService.getCompletions(prefix, limit);
        return Result.success(completions);
    }
    
    // ==================== SS-008 相关推荐 ====================
    
    /**
     * 相关搜索推荐
     */
    @GetMapping("/related")
    @Operation(summary = "相关搜索推荐", description = "SS-008: 推荐相关搜索词")
    public Result<List<SearchRelatedQuery>> getRelatedQueries(
            @RequestParam String query,
            @RequestParam(required = false, defaultValue = "10") int limit) {
        
        List<SearchRelatedQuery> related = searchService.getRelatedQueries(query, limit);
        return Result.success(related);
    }
    
    /**
     * 获取热门搜索
     */
    @GetMapping("/hot")
    @Operation(summary = "获取热门搜索", description = "获取热门搜索词")
    public Result<List<SearchHotWord>> getHotSearches(
            @RequestParam(required = false, defaultValue = "daily") String period,
            @RequestParam(required = false, defaultValue = "10") int limit) {
        
        List<SearchHotWord> hotWords = searchService.getHotSearches(period, limit);
        return Result.success(hotWords);
    }
    
    // ==================== 用户偏好与历史 ====================
    
    /**
     * 获取搜索历史
     */
    @GetMapping("/history")
    @Operation(summary = "获取搜索历史", description = "获取用户的搜索历史记录")
    public Result<List<SmartSearchLog>> getSearchHistory(
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "1") Long userId,
            @RequestParam(required = false, defaultValue = "20") int limit) {
        
        List<SmartSearchLog> history = searchService.getSearchHistory(userId, limit);
        return Result.success(history);
    }
    
    /**
     * 清除搜索历史
     */
    @DeleteMapping("/history")
    @Operation(summary = "清除搜索历史", description = "清除用户的搜索历史记录")
    public Result<OperationResult> clearSearchHistory(
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "1") Long userId) {
        
        searchService.clearSearchHistory(userId);
        
        OperationResult result = new OperationResult();
        result.setSuccess(true);
        result.setMessage("搜索历史已清除");
        
        return Result.success(result);
    }
    
    /**
     * 获取用户搜索偏好
     */
    @GetMapping("/preference")
    @Operation(summary = "获取用户搜索偏好", description = "获取用户的搜索偏好设置")
    public Result<UserSearchPreference> getUserPreference(
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "1") Long userId) {
        
        UserSearchPreference preference = searchService.getUserPreference(userId);
        return Result.success(preference);
    }
    
    /**
     * 保存用户搜索偏好
     */
    @PostMapping("/preference")
    @Operation(summary = "保存用户搜索偏好", description = "保存用户的搜索偏好设置")
    public Result<OperationResult> saveUserPreference(
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "1") Long userId,
            @RequestBody UserSearchPreference preference) {
        
        preference.setUserId(userId);
        searchService.saveUserPreference(preference);
        
        OperationResult result = new OperationResult();
        result.setSuccess(true);
        result.setMessage("搜索偏好已保存");
        
        return Result.success(result);
    }
    
    // ==================== 统一搜索入口 ====================
    
    /**
     * 统一搜索接口（自动选择最佳搜索策略）
     */
    @GetMapping("")
    @Operation(summary = "统一搜索", description = "统一搜索接口，自动选择最佳搜索策略")
    public Result<SearchResult> search(
            @RequestParam String query,
            @RequestParam(required = false, defaultValue = "hybrid") String mode,
            @RequestParam(required = false) String type,
            @RequestParam(required = false, defaultValue = "1") int page,
            @RequestParam(required = false, defaultValue = "20") int pageSize,
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "1") Long userId) {
        
        SearchRequest request = new SearchRequest();
        request.setUserId(userId);
        request.setSearchType(type != null ? type : "all");
        request.setPage(page);
        request.setPageSize(pageSize);
        
        SearchResult result;
        switch (mode) {
            case "keyword":
                result = searchService.keywordSearch(query, request);
                break;
            case "semantic":
                result = searchService.semanticSearch(query, request);
                break;
            case "hybrid":
            default:
                result = searchService.hybridSearch(query, request);
                break;
        }
        
        return Result.success(result);
    }
    
    // ==================== 内部类 ====================
    
    @lombok.Data
    public static class VectorSearchRequest {
        private float[] vector;
        private int topK = 10;
    }
    
    @lombok.Data
    public static class CorrectionResult {
        private String original;
        private String corrected;
        private boolean wasCorrected;
        private List<String> suggestions;
    }
    
    @lombok.Data
    public static class OperationResult {
        private boolean success;
        private String message;
    }
}