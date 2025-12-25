package com.mota.project.controller;

import com.mota.project.entity.search.*;
import com.mota.project.service.SmartSearchService;
import com.mota.project.service.SmartSearchService.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
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
public class SmartSearchController {
    
    private final SmartSearchService searchService;
    
    // ==================== SS-001 全文检索 ====================
    
    /**
     * 全文关键词检索
     */
    @GetMapping("/keyword")
    public ResponseEntity<SearchResult> keywordSearch(
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
        return ResponseEntity.ok(result);
    }
    
    // ==================== SS-002 语义搜索 ====================
    
    /**
     * 语义相似度搜索
     */
    @GetMapping("/semantic")
    public ResponseEntity<SearchResult> semanticSearch(
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
        return ResponseEntity.ok(result);
    }
    
    // ==================== SS-003 向量检索 ====================
    
    /**
     * 向量数据库检索
     */
    @PostMapping("/vector")
    public ResponseEntity<List<DocumentVector>> vectorSearch(
            @RequestBody VectorSearchRequest request) {
        
        // 模拟向量输入
        float[] queryVector = new float[768];
        List<DocumentVector> results = searchService.vectorSearch(queryVector, request.getTopK());
        return ResponseEntity.ok(results);
    }
    
    // ==================== SS-004 混合检索 ====================
    
    /**
     * 向量+关键词混合检索
     */
    @GetMapping("/hybrid")
    public ResponseEntity<SearchResult> hybridSearch(
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
        return ResponseEntity.ok(result);
    }
    
    // ==================== SS-005 意图识别 ====================
    
    /**
     * 搜索意图识别
     */
    @GetMapping("/intent")
    public ResponseEntity<SearchIntent> detectIntent(@RequestParam String query) {
        SearchIntent intent = searchService.detectIntent(query);
        return ResponseEntity.ok(intent);
    }
    
    // ==================== SS-006 自动纠错 ====================
    
    /**
     * 搜索词自动纠错
     */
    @GetMapping("/correct")
    public ResponseEntity<Map<String, Object>> autoCorrect(@RequestParam String query) {
        String corrected = searchService.autoCorrect(query);
        List<String> suggestions = searchService.getCorrectionSuggestions(query);
        
        Map<String, Object> result = new HashMap<>();
        result.put("original", query);
        result.put("corrected", corrected);
        result.put("wasCorrected", !query.equals(corrected));
        result.put("suggestions", suggestions);
        
        return ResponseEntity.ok(result);
    }
    
    // ==================== SS-007 智能补全 ====================
    
    /**
     * 搜索词智能补全
     */
    @GetMapping("/complete")
    public ResponseEntity<List<SearchSuggestion>> getCompletions(
            @RequestParam String prefix,
            @RequestParam(required = false, defaultValue = "10") int limit) {
        
        List<SearchSuggestion> completions = searchService.getCompletions(prefix, limit);
        return ResponseEntity.ok(completions);
    }
    
    // ==================== SS-008 相关推荐 ====================
    
    /**
     * 相关搜索推荐
     */
    @GetMapping("/related")
    public ResponseEntity<List<SearchRelatedQuery>> getRelatedQueries(
            @RequestParam String query,
            @RequestParam(required = false, defaultValue = "10") int limit) {
        
        List<SearchRelatedQuery> related = searchService.getRelatedQueries(query, limit);
        return ResponseEntity.ok(related);
    }
    
    /**
     * 获取热门搜索
     */
    @GetMapping("/hot")
    public ResponseEntity<List<SearchHotWord>> getHotSearches(
            @RequestParam(required = false, defaultValue = "daily") String period,
            @RequestParam(required = false, defaultValue = "10") int limit) {
        
        List<SearchHotWord> hotWords = searchService.getHotSearches(period, limit);
        return ResponseEntity.ok(hotWords);
    }
    
    // ==================== 用户偏好与历史 ====================
    
    /**
     * 获取搜索历史
     */
    @GetMapping("/history")
    public ResponseEntity<List<SearchLog>> getSearchHistory(
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "1") Long userId,
            @RequestParam(required = false, defaultValue = "20") int limit) {
        
        List<SearchLog> history = searchService.getSearchHistory(userId, limit);
        return ResponseEntity.ok(history);
    }
    
    /**
     * 清除搜索历史
     */
    @DeleteMapping("/history")
    public ResponseEntity<Map<String, Object>> clearSearchHistory(
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "1") Long userId) {
        
        searchService.clearSearchHistory(userId);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "搜索历史已清除");
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * 获取用户搜索偏好
     */
    @GetMapping("/preference")
    public ResponseEntity<UserSearchPreference> getUserPreference(
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "1") Long userId) {
        
        UserSearchPreference preference = searchService.getUserPreference(userId);
        return ResponseEntity.ok(preference);
    }
    
    /**
     * 保存用户搜索偏好
     */
    @PostMapping("/preference")
    public ResponseEntity<Map<String, Object>> saveUserPreference(
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "1") Long userId,
            @RequestBody UserSearchPreference preference) {
        
        preference.setUserId(userId);
        searchService.saveUserPreference(preference);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "搜索偏好已保存");
        
        return ResponseEntity.ok(result);
    }
    
    // ==================== 统一搜索入口 ====================
    
    /**
     * 统一搜索接口（自动选择最佳搜索策略）
     */
    @GetMapping("")
    public ResponseEntity<SearchResult> search(
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
        
        return ResponseEntity.ok(result);
    }
    
    // ==================== 内部类 ====================
    
    @lombok.Data
    public static class VectorSearchRequest {
        private float[] vector;
        private int topK = 10;
    }
}