package com.mota.project.controller;

import com.mota.project.entity.AINews;
import com.mota.project.service.AINewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 智能新闻推送控制器
 */
@RestController
@RequestMapping("/api/ai/news")
@RequiredArgsConstructor
public class AINewsController {

    private final AINewsService aiNewsService;

    // ========== 新闻获取 ==========

    @GetMapping("/recommended")
    public ResponseEntity<List<AINews>> getRecommendedNews(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(aiNewsService.getRecommendedNews(userId, limit));
    }

    @GetMapping("/industry/{industry}")
    public ResponseEntity<List<AINews>> getIndustryNews(
            @PathVariable String industry,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(aiNewsService.getIndustryNews(industry, limit));
    }

    @GetMapping("/trending")
    public ResponseEntity<List<AINews>> getTrendingNews(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(aiNewsService.getTrendingNews(limit));
    }

    @GetMapping("/search")
    public ResponseEntity<List<AINews>> searchNews(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ResponseEntity.ok(aiNewsService.searchNews(keyword, page, pageSize));
    }

    @GetMapping("/{newsId}")
    public ResponseEntity<AINews> getNewsById(@PathVariable Long newsId) {
        return ResponseEntity.ok(aiNewsService.getNewsById(newsId));
    }

    // ========== 个性化推荐 ==========

    @GetMapping("/user/{userId}/profile")
    public ResponseEntity<Map<String, Object>> buildUserProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(aiNewsService.buildUserProfile(userId));
    }

    @PutMapping("/user/{userId}/interests")
    public ResponseEntity<Void> updateUserInterests(
            @PathVariable Long userId,
            @RequestBody List<String> interests) {
        aiNewsService.updateUserInterests(userId, interests);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user/{userId}/interests")
    public ResponseEntity<List<String>> getUserInterests(@PathVariable Long userId) {
        return ResponseEntity.ok(aiNewsService.getUserInterests(userId));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<AINews>> getNewsForProject(
            @PathVariable Long projectId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(aiNewsService.getNewsForProject(projectId, limit));
    }

    // ========== 新闻分析 ==========

    @GetMapping("/{newsId}/relevance")
    public ResponseEntity<Map<String, Object>> analyzeNewsRelevance(
            @PathVariable Long newsId,
            @RequestParam Long userId) {
        return ResponseEntity.ok(aiNewsService.analyzeNewsRelevance(newsId, userId));
    }

    @GetMapping("/{newsId}/key-info")
    public ResponseEntity<Map<String, Object>> extractNewsKeyInfo(@PathVariable Long newsId) {
        return ResponseEntity.ok(aiNewsService.extractNewsKeyInfo(newsId));
    }

    @GetMapping("/{newsId}/summary")
    public ResponseEntity<String> generateNewsSummary(
            @PathVariable Long newsId,
            @RequestParam(defaultValue = "200") int maxLength) {
        return ResponseEntity.ok(aiNewsService.generateNewsSummary(newsId, maxLength));
    }

    @GetMapping("/{newsId}/sentiment")
    public ResponseEntity<Map<String, Object>> analyzeNewsSentiment(@PathVariable Long newsId) {
        return ResponseEntity.ok(aiNewsService.analyzeNewsSentiment(newsId));
    }

    // ========== 用户交互 ==========

    @PostMapping("/{newsId}/read")
    public ResponseEntity<Void> recordNewsRead(
            @PathVariable Long newsId,
            @RequestParam Long userId) {
        aiNewsService.recordNewsRead(userId, newsId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{newsId}/favorite")
    public ResponseEntity<Void> favoriteNews(
            @PathVariable Long newsId,
            @RequestParam Long userId) {
        aiNewsService.favoriteNews(userId, newsId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{newsId}/favorite")
    public ResponseEntity<Void> unfavoriteNews(
            @PathVariable Long newsId,
            @RequestParam Long userId) {
        aiNewsService.unfavoriteNews(userId, newsId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user/{userId}/favorites")
    public ResponseEntity<List<AINews>> getFavoriteNews(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ResponseEntity.ok(aiNewsService.getFavoriteNews(userId, page, pageSize));
    }

    @PostMapping("/{newsId}/not-interested")
    public ResponseEntity<Void> markAsNotInterested(
            @PathVariable Long newsId,
            @RequestParam Long userId,
            @RequestParam(required = false) String reason) {
        aiNewsService.markAsNotInterested(userId, newsId, reason);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{newsId}/share")
    public ResponseEntity<Void> shareNews(
            @PathVariable Long newsId,
            @RequestParam Long userId,
            @RequestParam String platform) {
        aiNewsService.shareNews(userId, newsId, platform);
        return ResponseEntity.ok().build();
    }

    // ========== 推送管理 ==========

    @GetMapping("/user/{userId}/push-settings")
    public ResponseEntity<Map<String, Object>> getPushSettings(@PathVariable Long userId) {
        return ResponseEntity.ok(aiNewsService.getPushSettings(userId));
    }

    @PutMapping("/user/{userId}/push-settings")
    public ResponseEntity<Void> updatePushSettings(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> settings) {
        aiNewsService.updatePushSettings(userId, settings);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/user/{userId}/push")
    public ResponseEntity<Void> sendNewsPush(
            @PathVariable Long userId,
            @RequestBody List<Long> newsIds) {
        aiNewsService.sendNewsPush(userId, newsIds);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user/{userId}/push-history")
    public ResponseEntity<List<Map<String, Object>>> getPushHistory(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ResponseEntity.ok(aiNewsService.getPushHistory(userId, page, pageSize));
    }

    // ========== 新闻源管理 ==========

    @GetMapping("/sources")
    public ResponseEntity<List<Map<String, Object>>> getNewsSources() {
        return ResponseEntity.ok(aiNewsService.getNewsSources());
    }

    @PostMapping("/sources/{sourceId}/subscribe")
    public ResponseEntity<Void> subscribeSource(
            @PathVariable Long sourceId,
            @RequestParam Long userId) {
        aiNewsService.subscribeSource(userId, sourceId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/sources/{sourceId}/subscribe")
    public ResponseEntity<Void> unsubscribeSource(
            @PathVariable Long sourceId,
            @RequestParam Long userId) {
        aiNewsService.unsubscribeSource(userId, sourceId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user/{userId}/subscribed-sources")
    public ResponseEntity<List<Map<String, Object>>> getUserSubscribedSources(
            @PathVariable Long userId) {
        return ResponseEntity.ok(aiNewsService.getUserSubscribedSources(userId));
    }

    // ========== 统计分析 ==========

    @GetMapping("/user/{userId}/reading-stats")
    public ResponseEntity<Map<String, Object>> getReadingStats(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "month") String period) {
        return ResponseEntity.ok(aiNewsService.getReadingStats(userId, period));
    }

    @GetMapping("/hot-topics")
    public ResponseEntity<List<Map<String, Object>>> getHotTopics(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(aiNewsService.getHotTopics(limit));
    }

    @GetMapping("/industry/{industry}/trends")
    public ResponseEntity<Map<String, Object>> getIndustryTrends(
            @PathVariable String industry) {
        return ResponseEntity.ok(aiNewsService.getIndustryTrends(industry));
    }
}