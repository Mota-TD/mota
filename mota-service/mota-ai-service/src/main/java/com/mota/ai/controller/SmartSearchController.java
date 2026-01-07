package com.mota.ai.controller;

import com.mota.ai.service.SmartSearchService;
import com.mota.common.core.result.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 智能搜索控制器
 */
@RestController
@RequestMapping("/api/v1/ai/search")
@RequiredArgsConstructor
public class SmartSearchController {

    private final SmartSearchService smartSearchService;

    /**
     * 智能搜索
     */
    @GetMapping
    public Result<Map<String, Object>> search(
            @RequestParam Long userId,
            @RequestParam(required = false) Long enterpriseId,
            @RequestParam String query) {
        Map<String, Object> result = smartSearchService.search(userId, enterpriseId, query);
        return Result.success(result);
    }

    /**
     * 语义搜索
     */
    @GetMapping("/semantic")
    public Result<List<Map<String, Object>>> semanticSearch(
            @RequestParam String query,
            @RequestParam(defaultValue = "10") int limit) {
        List<Map<String, Object>> results = smartSearchService.semanticSearch(query, limit);
        return Result.success(results);
    }

    /**
     * 获取搜索建议
     */
    @GetMapping("/suggestions")
    public Result<List<String>> getSuggestions(@RequestParam String query) {
        List<String> suggestions = smartSearchService.getSuggestions(query);
        return Result.success(suggestions);
    }

    /**
     * 获取热门搜索
     */
    @GetMapping("/hot")
    public Result<List<String>> getHotSearches(
            @RequestParam(required = false) Long enterpriseId,
            @RequestParam(defaultValue = "10") int limit) {
        List<String> hotSearches = smartSearchService.getHotSearches(enterpriseId, limit);
        return Result.success(hotSearches);
    }
}