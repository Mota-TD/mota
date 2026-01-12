package com.mota.search.controller;

import com.mota.common.core.result.Result;
import com.mota.common.security.util.SecurityUtils;
import com.mota.search.dto.IndexRequest;
import com.mota.search.dto.SearchRequest;
import com.mota.search.dto.SearchResponse;
import com.mota.search.dto.SuggestionResponse;
import com.mota.search.entity.SearchHotword;
import com.mota.search.service.SearchService;
import com.mota.search.service.SearchStatisticsService;
import com.mota.search.service.SearchSuggestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 搜索控制器
 * 
 * @author mota
 */
@Tag(name = "搜索管理", description = "全文搜索、语义搜索、向量搜索相关接口")
@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;
    private final SearchSuggestionService suggestionService;
    private final SearchStatisticsService statisticsService;

    // ==================== 搜索接口 ====================

    @Operation(summary = "执行搜索")
    @PostMapping
    public Result<SearchResponse> search(@RequestBody SearchRequest request) {
        Long tenantId = SecurityUtils.getTenantId();
        Long userId = SecurityUtils.getUserId();
        SearchResponse response = searchService.search(tenantId, userId, request);
        return Result.success(response);
    }

    @Operation(summary = "全文搜索")
    @GetMapping("/fulltext")
    public Result<SearchResponse> fulltextSearch(
            @Parameter(description = "搜索关键词") @RequestParam String keyword,
            @Parameter(description = "文档类型") @RequestParam(required = false) List<String> types,
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "20") int size) {
        Long tenantId = SecurityUtils.getTenantId();
        SearchResponse response = searchService.fulltextSearch(tenantId, keyword, types, page, size);
        return Result.success(response);
    }

    @Operation(summary = "语义搜索")
    @GetMapping("/semantic")
    public Result<SearchResponse> semanticSearch(
            @Parameter(description = "查询文本") @RequestParam String query,
            @Parameter(description = "文档类型") @RequestParam(required = false) List<String> types,
            @Parameter(description = "返回数量") @RequestParam(defaultValue = "20") int topK) {
        Long tenantId = SecurityUtils.getTenantId();
        SearchResponse response = searchService.semanticSearch(tenantId, query, types, topK);
        return Result.success(response);
    }

    @Operation(summary = "向量搜索")
    @PostMapping("/vector")
    public Result<SearchResponse> vectorSearch(
            @Parameter(description = "查询向量") @RequestBody List<Float> vector,
            @Parameter(description = "文档类型") @RequestParam(required = false) List<String> types,
            @Parameter(description = "返回数量") @RequestParam(defaultValue = "20") int topK,
            @Parameter(description = "最小相似度") @RequestParam(defaultValue = "0.7") float minScore) {
        Long tenantId = SecurityUtils.getTenantId();
        SearchResponse response = searchService.vectorSearch(tenantId, vector, types, topK, minScore);
        return Result.success(response);
    }

    @Operation(summary = "混合搜索")
    @GetMapping("/hybrid")
    public Result<SearchResponse> hybridSearch(
            @Parameter(description = "搜索关键词") @RequestParam String keyword,
            @Parameter(description = "文档类型") @RequestParam(required = false) List<String> types,
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "20") int size) {
        Long tenantId = SecurityUtils.getTenantId();
        SearchResponse response = searchService.hybridSearch(tenantId, keyword, types, page, size);
        return Result.success(response);
    }

    @Operation(summary = "记录搜索点击")
    @PostMapping("/click")
    public Result<Void> recordClick(
            @Parameter(description = "搜索历史ID") @RequestParam Long historyId,
            @Parameter(description = "点击的文档ID") @RequestParam String documentId,
            @Parameter(description = "点击位置") @RequestParam int position) {
        Long tenantId = SecurityUtils.getTenantId();
        Long userId = SecurityUtils.getUserId();
        searchService.recordClick(tenantId, userId, historyId, documentId, position);
        return Result.success();
    }

    // ==================== 索引管理接口 ====================

    @Operation(summary = "索引文档")
    @PostMapping("/index")
    public Result<String> indexDocument(@RequestBody IndexRequest request) {
        Long tenantId = SecurityUtils.getTenantId();
        String docId = searchService.indexDocument(tenantId, request);
        return Result.success(docId);
    }

    @Operation(summary = "批量索引文档")
    @PostMapping("/index/bulk")
    public Result<Integer> bulkIndexDocuments(@RequestBody List<IndexRequest> requests) {
        Long tenantId = SecurityUtils.getTenantId();
        int count = searchService.bulkIndexDocuments(tenantId, requests);
        return Result.success(count);
    }

    @Operation(summary = "更新文档")
    @PutMapping("/index")
    public Result<Boolean> updateDocument(@RequestBody IndexRequest request) {
        Long tenantId = SecurityUtils.getTenantId();
        boolean success = searchService.updateDocument(tenantId, request);
        return Result.success(success);
    }

    @Operation(summary = "删除文档")
    @DeleteMapping("/index/{type}/{businessId}")
    public Result<Boolean> deleteDocument(
            @Parameter(description = "文档类型") @PathVariable String type,
            @Parameter(description = "业务ID") @PathVariable Long businessId) {
        Long tenantId = SecurityUtils.getTenantId();
        boolean success = searchService.deleteDocument(tenantId, type, businessId);
        return Result.success(success);
    }

    @Operation(summary = "重建索引")
    @PostMapping("/index/rebuild")
    public Result<Void> rebuildIndex(
            @Parameter(description = "文档类型") @RequestParam(required = false) String type) {
        Long tenantId = SecurityUtils.getTenantId();
        searchService.rebuildIndex(tenantId, type);
        return Result.success();
    }

    // ==================== 搜索建议接口 ====================

    @Operation(summary = "获取搜索建议")
    @GetMapping("/suggestions")
    public Result<SuggestionResponse> getSuggestions(
            @Parameter(description = "输入前缀") @RequestParam String prefix,
            @Parameter(description = "返回数量") @RequestParam(defaultValue = "10") int limit) {
        Long tenantId = SecurityUtils.getTenantId();
        Long userId = SecurityUtils.getUserId();
        SuggestionResponse response = suggestionService.getSuggestions(tenantId, userId, prefix, limit);
        return Result.success(response);
    }

    @Operation(summary = "获取自动补全")
    @GetMapping("/autocomplete")
    public Result<List<String>> getAutoComplete(
            @Parameter(description = "输入前缀") @RequestParam String prefix,
            @Parameter(description = "返回数量") @RequestParam(defaultValue = "10") int limit) {
        Long tenantId = SecurityUtils.getTenantId();
        List<String> suggestions = suggestionService.getAutoComplete(tenantId, prefix, limit);
        return Result.success(suggestions);
    }

    @Operation(summary = "获取拼写纠正")
    @GetMapping("/spell-check")
    public Result<String> getSpellCorrection(
            @Parameter(description = "关键词") @RequestParam String keyword) {
        Long tenantId = SecurityUtils.getTenantId();
        String corrected = suggestionService.getSpellCorrection(tenantId, keyword);
        return Result.success(corrected);
    }

    @Operation(summary = "获取相关搜索词")
    @GetMapping("/related")
    public Result<List<String>> getRelatedKeywords(
            @Parameter(description = "关键词") @RequestParam String keyword,
            @Parameter(description = "返回数量") @RequestParam(defaultValue = "10") int limit) {
        Long tenantId = SecurityUtils.getTenantId();
        List<String> related = suggestionService.getRelatedKeywords(tenantId, keyword, limit);
        return Result.success(related);
    }

    @Operation(summary = "获取热门搜索词")
    @GetMapping("/hot-keywords")
    public Result<List<SearchHotword>> getHotKeywords(
            @Parameter(description = "时间周期") @RequestParam(defaultValue = "daily") String period,
            @Parameter(description = "返回数量") @RequestParam(defaultValue = "10") int limit) {
        Long tenantId = SecurityUtils.getTenantId();
        List<SearchHotword> hotwords = suggestionService.getHotKeywords(tenantId, period, limit);
        return Result.success(hotwords);
    }

    @Operation(summary = "获取用户搜索历史")
    @GetMapping("/history")
    public Result<List<String>> getUserSearchHistory(
            @Parameter(description = "返回数量") @RequestParam(defaultValue = "10") int limit) {
        Long tenantId = SecurityUtils.getTenantId();
        Long userId = SecurityUtils.getUserId();
        List<String> history = suggestionService.getUserSearchHistory(tenantId, userId, limit);
        return Result.success(history);
    }

    @Operation(summary = "清除用户搜索历史")
    @DeleteMapping("/history")
    public Result<Void> clearUserSearchHistory() {
        Long tenantId = SecurityUtils.getTenantId();
        Long userId = SecurityUtils.getUserId();
        suggestionService.clearUserSearchHistory(tenantId, userId);
        return Result.success();
    }

    @Operation(summary = "删除单条搜索历史")
    @DeleteMapping("/history/{keyword}")
    public Result<Void> deleteSearchHistory(
            @Parameter(description = "关键词") @PathVariable String keyword) {
        Long tenantId = SecurityUtils.getTenantId();
        Long userId = SecurityUtils.getUserId();
        suggestionService.deleteSearchHistory(tenantId, userId, keyword);
        return Result.success();
    }

    // ==================== 搜索统计接口 ====================

    @Operation(summary = "获取搜索概览统计")
    @GetMapping("/statistics/overview")
    public Result<Map<String, Object>> getSearchOverview(
            @Parameter(description = "开始日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "结束日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Long tenantId = SecurityUtils.getTenantId();
        Map<String, Object> overview = statisticsService.getSearchOverview(tenantId, startDate, endDate);
        return Result.success(overview);
    }

    @Operation(summary = "获取每日搜索趋势")
    @GetMapping("/statistics/trend")
    public Result<List<Map<String, Object>>> getDailySearchTrend(
            @Parameter(description = "开始日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "结束日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Long tenantId = SecurityUtils.getTenantId();
        List<Map<String, Object>> trend = statisticsService.getDailySearchTrend(tenantId, startDate, endDate);
        return Result.success(trend);
    }

    @Operation(summary = "获取热门关键词统计")
    @GetMapping("/statistics/top-keywords")
    public Result<List<Map<String, Object>>> getTopKeywords(
            @Parameter(description = "开始日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "结束日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @Parameter(description = "返回数量") @RequestParam(defaultValue = "20") int limit) {
        Long tenantId = SecurityUtils.getTenantId();
        List<Map<String, Object>> keywords = statisticsService.getTopKeywords(tenantId, startDate, endDate, limit);
        return Result.success(keywords);
    }

    @Operation(summary = "获取零结果关键词统计")
    @GetMapping("/statistics/zero-results")
    public Result<List<Map<String, Object>>> getZeroResultKeywords(
            @Parameter(description = "开始日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "结束日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @Parameter(description = "返回数量") @RequestParam(defaultValue = "20") int limit) {
        Long tenantId = SecurityUtils.getTenantId();
        List<Map<String, Object>> keywords = statisticsService.getZeroResultKeywords(tenantId, startDate, endDate, limit);
        return Result.success(keywords);
    }

    @Operation(summary = "获取点击率统计")
    @GetMapping("/statistics/ctr")
    public Result<Map<String, Object>> getClickThroughRate(
            @Parameter(description = "开始日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "结束日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Long tenantId = SecurityUtils.getTenantId();
        Map<String, Object> ctr = statisticsService.getClickThroughRate(tenantId, startDate, endDate);
        return Result.success(ctr);
    }

    @Operation(summary = "获取索引统计信息")
    @GetMapping("/statistics/index")
    public Result<Map<String, Object>> getIndexStatistics() {
        Long tenantId = SecurityUtils.getTenantId();
        Map<String, Object> stats = statisticsService.getIndexStatistics(tenantId);
        return Result.success(stats);
    }

    @Operation(summary = "导出搜索统计报告")
    @GetMapping("/statistics/export")
    public Result<String> exportSearchReport(
            @Parameter(description = "开始日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "结束日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @Parameter(description = "导出格式") @RequestParam(defaultValue = "excel") String format) {
        Long tenantId = SecurityUtils.getTenantId();
        String reportUrl = statisticsService.exportSearchReport(tenantId, startDate, endDate, format);
        return Result.success(reportUrl);
    }
}