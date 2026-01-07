package com.mota.ai.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.mota.ai.entity.AINews;
import com.mota.ai.service.AINewsService;
import com.mota.common.core.result.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * AI新闻控制器
 */
@RestController
@RequestMapping("/api/v1/ai/news")
@RequiredArgsConstructor
public class AINewsController {

    private final AINewsService aiNewsService;

    /**
     * 获取新闻列表
     */
    @GetMapping
    public Result<IPage<AINews>> getNewsList(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        IPage<AINews> news = aiNewsService.getNewsList(category, page, size);
        return Result.success(news);
    }

    /**
     * 获取新闻详情
     */
    @GetMapping("/{id}")
    public Result<AINews> getNewsById(@PathVariable String id) {
        AINews news = aiNewsService.getNewsById(id);
        return Result.success(news);
    }

    /**
     * 获取推荐新闻
     */
    @GetMapping("/recommended")
    public Result<List<AINews>> getRecommendedNews(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "10") int limit) {
        List<AINews> news = aiNewsService.getRecommendedNews(userId, limit);
        return Result.success(news);
    }

    /**
     * 按分类获取新闻
     */
    @GetMapping("/category/{category}")
    public Result<List<AINews>> getNewsByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "10") int limit) {
        List<AINews> news = aiNewsService.getNewsByCategory(category, limit);
        return Result.success(news);
    }

    /**
     * 搜索新闻
     */
    @GetMapping("/search")
    public Result<IPage<AINews>> searchNews(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        IPage<AINews> news = aiNewsService.searchNews(keyword, page, size);
        return Result.success(news);
    }

    /**
     * 刷新新闻
     */
    @PostMapping("/refresh")
    public Result<Void> refreshNews() {
        aiNewsService.refreshNews();
        return Result.success();
    }
    
    /**
     * 获取收藏的新闻
     */
    @GetMapping("/starred")
    public Result<List<AINews>> getStarredNews(
            @RequestParam(defaultValue = "10") int limit) {
        List<AINews> news = aiNewsService.getStarredNews(limit);
        return Result.success(news);
    }
}