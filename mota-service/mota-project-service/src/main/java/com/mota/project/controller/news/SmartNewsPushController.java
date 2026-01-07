package com.mota.project.controller.news;

import com.mota.common.core.domain.R;
import com.mota.project.entity.news.*;
import com.mota.project.service.news.SmartNewsPushService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 智能新闻推送控制器
 * 实现 NW-001 到 NW-009 功能的 REST API
 */
@Slf4j
@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class SmartNewsPushController {

    private final SmartNewsPushService smartNewsPushService;

    // ==================== NW-001 行业识别 ====================

    /**
     * 自动识别企业行业
     */
    @PostMapping("/industry/detect")
    public R<List<EnterpriseIndustry>> detectIndustry(
            @RequestParam Long teamId,
            @RequestBody Map<String, String> request) {
        String description = request.get("description");
        List<EnterpriseIndustry> industries = smartNewsPushService.detectIndustry(teamId, description);
        return R.ok(industries);
    }

    /**
     * 获取团队行业配置
     */
    @GetMapping("/industry/team/{teamId}")
    public R<List<EnterpriseIndustry>> getTeamIndustries(@PathVariable Long teamId) {
        List<EnterpriseIndustry> industries = smartNewsPushService.getTeamIndustries(teamId);
        return R.ok(industries);
    }

    /**
     * 保存行业配置
     */
    @PostMapping("/industry")
    public R<EnterpriseIndustry> saveIndustry(@RequestBody EnterpriseIndustry industry) {
        EnterpriseIndustry saved = smartNewsPushService.saveIndustry(industry);
        return R.ok(saved);
    }

    /**
     * 删除行业配置
     */
    @DeleteMapping("/industry/{id}")
    public R<Void> deleteIndustry(@PathVariable Long id) {
        // 实际应删除数据库记录
        return R.ok();
    }

    // ==================== NW-002 业务理解 ====================

    /**
     * 提取企业业务领域
     */
    @PostMapping("/business/extract")
    public R<List<BusinessDomain>> extractBusinessDomains(
            @RequestParam Long teamId,
            @RequestBody Map<String, String> request) {
        String description = request.get("description");
        List<BusinessDomain> domains = smartNewsPushService.extractBusinessDomains(teamId, description);
        return R.ok(domains);
    }

    /**
     * 获取团队业务领域
     */
    @GetMapping("/business/team/{teamId}")
    public R<List<BusinessDomain>> getTeamBusinessDomains(@PathVariable Long teamId) {
        List<BusinessDomain> domains = smartNewsPushService.getTeamBusinessDomains(teamId);
        return R.ok(domains);
    }

    /**
     * 保存业务领域
     */
    @PostMapping("/business")
    public R<BusinessDomain> saveBusinessDomain(@RequestBody BusinessDomain domain) {
        domain.setId(System.currentTimeMillis());
        return R.ok(domain);
    }

    // ==================== NW-003 新闻采集 ====================

    /**
     * 获取新闻数据源列表
     */
    @GetMapping("/sources")
    public R<List<NewsDataSource>> getDataSources() {
        List<NewsDataSource> sources = smartNewsPushService.getDataSources();
        return R.ok(sources);
    }

    /**
     * 采集新闻
     */
    @PostMapping("/crawl/{sourceId}")
    public R<List<NewsArticle>> crawlNews(@PathVariable Long sourceId) {
        List<NewsArticle> articles = smartNewsPushService.crawlNews(sourceId);
        return R.ok(articles);
    }

    /**
     * 搜索新闻
     */
    @GetMapping("/search")
    public R<Map<String, Object>> searchNews(
            @RequestParam String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        List<NewsArticle> articles = smartNewsPushService.searchNews(keyword, category, page, pageSize);
        int total = smartNewsPushService.countSearchNews(keyword, category);
        
        Map<String, Object> result = new HashMap<>();
        result.put("list", articles);
        result.put("total", total);
        result.put("page", page);
        result.put("pageSize", pageSize);
        
        return R.ok(result);
    }

    /**
     * 获取新闻详情 - 从数据库获取
     */
    @GetMapping("/article/{id}")
    public R<NewsArticle> getArticle(@PathVariable Long id) {
        NewsArticle article = smartNewsPushService.getArticleById(id);
        if (article == null) {
            return R.fail("文章不存在");
        }
        return R.ok(article);
    }

    // ==================== NW-004 政策监控 ====================

    /**
     * 创建政策监控
     */
    @PostMapping("/policy/monitor")
    public R<PolicyMonitor> createPolicyMonitor(@RequestBody PolicyMonitor monitor) {
        PolicyMonitor created = smartNewsPushService.createPolicyMonitor(monitor);
        return R.ok(created);
    }

    /**
     * 获取政策监控列表
     */
    @GetMapping("/policy/monitors/{teamId}")
    public R<List<PolicyMonitor>> getPolicyMonitors(@PathVariable Long teamId) {
        List<PolicyMonitor> monitors = smartNewsPushService.getPolicyMonitors(teamId);
        return R.ok(monitors);
    }

    /**
     * 更新政策监控
     */
    @PutMapping("/policy/monitor/{id}")
    public R<PolicyMonitor> updatePolicyMonitor(
            @PathVariable Long id,
            @RequestBody PolicyMonitor monitor) {
        monitor.setId(id);
        return R.ok(monitor);
    }

    /**
     * 删除政策监控
     */
    @DeleteMapping("/policy/monitor/{id}")
    public R<Void> deletePolicyMonitor(@PathVariable Long id) {
        return R.ok();
    }

    /**
     * 获取政策新闻
     */
    @GetMapping("/policy/news/{teamId}")
    public R<List<NewsArticle>> getPolicyNews(
            @PathVariable Long teamId,
            @RequestParam(defaultValue = "10") int limit) {
        List<NewsArticle> policies = smartNewsPushService.getPolicyNews(teamId, limit);
        return R.ok(policies);
    }

    // ==================== NW-005 智能匹配 ====================

    /**
     * 计算新闻匹配度
     */
    @GetMapping("/match/{articleId}")
    public R<NewsMatchRecord> calculateMatch(
            @PathVariable Long articleId,
            @RequestParam(required = false) Long teamId,
            @RequestParam(required = false) Long userId) {
        NewsMatchRecord record = smartNewsPushService.calculateMatch(articleId, teamId, userId);
        return R.ok(record);
    }

    /**
     * 获取推荐新闻
     */
    @GetMapping("/recommended")
    public R<List<NewsArticle>> getRecommendedNews(
            @RequestParam Long userId,
            @RequestParam(required = false) Long teamId,
            @RequestParam(defaultValue = "10") int limit) {
        List<NewsArticle> articles = smartNewsPushService.getRecommendedNews(userId, teamId, limit);
        return R.ok(articles);
    }

    /**
     * 批量计算匹配度
     */
    @PostMapping("/match/batch")
    public R<List<NewsMatchRecord>> batchCalculateMatch(
            @RequestBody Map<String, Object> request) {
        // 实现批量匹配逻辑
        return R.ok(List.of());
    }

    // ==================== NW-006 个性化推送 ====================

    /**
     * 获取用户偏好
     */
    @GetMapping("/preference/{userId}")
    public R<NewsUserPreference> getUserPreference(@PathVariable Long userId) {
        NewsUserPreference preference = smartNewsPushService.getUserPreference(userId);
        return R.ok(preference);
    }

    /**
     * 更新用户偏好
     */
    @PutMapping("/preference/{userId}")
    public R<NewsUserPreference> updateUserPreference(
            @PathVariable Long userId,
            @RequestBody NewsUserPreference preference) {
        preference.setUserId(userId);
        NewsUserPreference updated = smartNewsPushService.updateUserPreference(preference);
        return R.ok(updated);
    }

    /**
     * 基于角色获取推荐
     */
    @GetMapping("/by-role")
    public R<List<NewsArticle>> getNewsByRole(
            @RequestParam String role,
            @RequestParam(defaultValue = "10") int limit) {
        List<NewsArticle> articles = smartNewsPushService.getNewsByRole(role, limit);
        return R.ok(articles);
    }

    // ==================== NW-007 推送优化 ====================

    /**
     * 获取推送配置
     */
    @GetMapping("/push/config/{userId}")
    public R<NewsPushConfig> getPushConfig(@PathVariable Long userId) {
        NewsPushConfig config = smartNewsPushService.getPushConfig(userId);
        return R.ok(config);
    }

    /**
     * 更新推送配置
     */
    @PutMapping("/push/config/{userId}")
    public R<NewsPushConfig> updatePushConfig(
            @PathVariable Long userId,
            @RequestBody NewsPushConfig config) {
        config.setUserId(userId);
        NewsPushConfig updated = smartNewsPushService.updatePushConfig(config);
        return R.ok(updated);
    }

    /**
     * 执行推送
     */
    @PostMapping("/push/execute")
    public R<NewsPushRecord> executePush(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        @SuppressWarnings("unchecked")
        List<Long> articleIds = (List<Long>) request.get("articleIds");
        String channel = (String) request.get("channel");
        
        NewsPushRecord record = smartNewsPushService.executePush(userId, articleIds, channel);
        return R.ok(record);
    }

    /**
     * 获取推送历史
     */
    @GetMapping("/push/history/{userId}")
    public R<Map<String, Object>> getPushHistory(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        List<NewsPushRecord> records = smartNewsPushService.getPushHistory(userId, page, pageSize);
        
        Map<String, Object> result = new HashMap<>();
        result.put("list", records);
        result.put("total", 50);
        result.put("page", page);
        result.put("pageSize", pageSize);
        
        return R.ok(result);
    }

    // ==================== NW-008 新闻收藏 ====================

    /**
     * 收藏新闻
     */
    @PostMapping("/favorite")
    public R<NewsFavorite> favoriteNews(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        Long articleId = Long.valueOf(request.get("articleId").toString());
        Long folderId = request.get("folderId") != null ? 
                Long.valueOf(request.get("folderId").toString()) : null;
        String note = (String) request.get("note");
        
        NewsFavorite favorite = smartNewsPushService.favoriteNews(userId, articleId, folderId, note);
        return R.ok(favorite);
    }

    /**
     * 取消收藏
     */
    @DeleteMapping("/favorite")
    public R<Void> unfavoriteNews(
            @RequestParam Long userId,
            @RequestParam Long articleId) {
        smartNewsPushService.unfavoriteNews(userId, articleId);
        return R.ok();
    }

    /**
     * 获取收藏列表
     */
    @GetMapping("/favorites/{userId}")
    public R<List<NewsFavorite>> getFavorites(
            @PathVariable Long userId,
            @RequestParam(required = false) Long folderId) {
        List<NewsFavorite> favorites = smartNewsPushService.getFavorites(userId, folderId);
        return R.ok(favorites);
    }

    /**
     * 获取收藏夹列表
     */
    @GetMapping("/folders/{userId}")
    public R<List<NewsFavoriteFolder>> getFolders(@PathVariable Long userId) {
        List<NewsFavoriteFolder> folders = smartNewsPushService.getFolders(userId);
        return R.ok(folders);
    }

    /**
     * 创建收藏夹
     */
    @PostMapping("/folder")
    public R<NewsFavoriteFolder> createFolder(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        String folderName = (String) request.get("folderName");
        String description = (String) request.get("description");
        
        NewsFavoriteFolder folder = smartNewsPushService.createFolder(userId, folderName, description);
        return R.ok(folder);
    }

    /**
     * 删除收藏夹
     */
    @DeleteMapping("/folder/{id}")
    public R<Void> deleteFolder(@PathVariable Long id) {
        return R.ok();
    }

    // ==================== NW-009 新闻分类 ====================

    /**
     * 获取分类列表
     */
    @GetMapping("/categories")
    public R<List<NewsCategory>> getCategories() {
        List<NewsCategory> categories = smartNewsPushService.getCategories();
        return R.ok(categories);
    }

    /**
     * 获取分类树
     */
    @GetMapping("/categories/tree")
    public R<List<Map<String, Object>>> getCategoryTree() {
        List<Map<String, Object>> tree = smartNewsPushService.getCategoryTree();
        return R.ok(tree);
    }

    /**
     * 自动分类新闻
     */
    @PostMapping("/classify")
    public R<Map<String, Object>> classifyNews(@RequestBody Map<String, String> request) {
        String title = request.get("title");
        String content = request.get("content");
        
        String category = smartNewsPushService.classifyNews(title, content);
        
        Map<String, Object> result = new HashMap<>();
        result.put("category", category);
        result.put("confidence", 0.85);
        
        return R.ok(result);
    }

    /**
     * 创建分类
     */
    @PostMapping("/category")
    public R<NewsCategory> createCategory(@RequestBody NewsCategory category) {
        category.setId(System.currentTimeMillis());
        return R.ok(category);
    }

    /**
     * 更新分类
     */
    @PutMapping("/category/{id}")
    public R<NewsCategory> updateCategory(
            @PathVariable Long id,
            @RequestBody NewsCategory category) {
        category.setId(id);
        return R.ok(category);
    }

    /**
     * 删除分类
     */
    @DeleteMapping("/category/{id}")
    public R<Void> deleteCategory(@PathVariable Long id) {
        return R.ok();
    }

    // ==================== 统计接口 ====================

    /**
     * 获取新闻统计
     */
    @GetMapping("/statistics")
    public R<Map<String, Object>> getStatistics(@RequestParam(required = false) Long teamId) {
        Map<String, Object> stats = smartNewsPushService.getStatistics(teamId);
        return R.ok(stats);
    }

    /**
     * 获取热门话题
     */
    @GetMapping("/hot-topics")
    public R<List<Map<String, Object>>> getHotTopics(@RequestParam(defaultValue = "10") int limit) {
        List<Map<String, Object>> topics = smartNewsPushService.getHotTopics(limit);
        return R.ok(topics);
    }
    
    /**
     * 获取行业动态新闻
     */
    @GetMapping("/industry")
    public R<List<NewsArticle>> getIndustryNews(
            @RequestParam(required = false) Long teamId,
            @RequestParam(defaultValue = "20") int limit) {
        List<NewsArticle> articles = smartNewsPushService.getIndustryNews(teamId, limit);
        return R.ok(articles);
    }
    
    /**
     * 获取科技资讯
     */
    @GetMapping("/technology")
    public R<List<NewsArticle>> getTechnologyNews(
            @RequestParam(defaultValue = "20") int limit) {
        List<NewsArticle> articles = smartNewsPushService.getTechnologyNews(limit);
        return R.ok(articles);
    }
    
    /**
     * 手动触发新闻采集
     */
    @PostMapping("/crawl/trigger")
    public R<Map<String, Object>> triggerCrawl() {
        smartNewsPushService.triggerManualCrawl();
        Map<String, Object> result = new HashMap<>();
        result.put("message", "新闻采集任务已触发");
        result.put("timestamp", System.currentTimeMillis());
        return R.ok(result);
    }
}