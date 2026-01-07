package com.mota.project.service.news;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.stats.CacheStats;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * 本地缓存服务（L1缓存）
 * 使用Caffeine实现高性能本地缓存
 * 
 * 缓存层级：
 * L1 (Caffeine) -> L2 (Redis) -> Database (MySQL)
 * 
 * 特性：
 * - 超高性能：纳秒级访问速度
 * - 自动过期：基于时间和容量的淘汰策略
 * - 统计监控：命中率、加载时间等指标
 * - 内存安全：限制最大容量，防止OOM
 * 
 * @author Mota Team
 * @since 2.0
 */
@Slf4j
@Service
public class LocalCacheService {

    // ==================== 缓存实例 ====================
    
    /**
     * 新闻列表缓存
     * 容量：1000条，过期时间：2分钟
     */
    private Cache<String, Object> newsListCache;
    
    /**
     * 新闻详情缓存
     * 容量：5000条，过期时间：10分钟
     */
    private Cache<String, Object> newsDetailCache;
    
    /**
     * 统计数据缓存
     * 容量：100条，过期时间：1分钟
     */
    private Cache<String, Object> statisticsCache;
    
    /**
     * 热门话题缓存
     * 容量：500条，过期时间：3分钟
     */
    private Cache<String, Object> hotTopicsCache;
    
    /**
     * 分类新闻缓存
     * 容量：2000条，过期时间：2分钟
     */
    private Cache<String, Object> categoryCache;

    // ==================== 初始化 ====================
    
    @PostConstruct
    public void init() {
        log.info("初始化Caffeine本地缓存...");
        
        // 新闻列表缓存
        newsListCache = Caffeine.newBuilder()
            .maximumSize(1000)
            .expireAfterWrite(2, TimeUnit.MINUTES)
            .recordStats()
            .build();
        
        // 新闻详情缓存
        newsDetailCache = Caffeine.newBuilder()
            .maximumSize(5000)
            .expireAfterWrite(10, TimeUnit.MINUTES)
            .recordStats()
            .build();
        
        // 统计数据缓存
        statisticsCache = Caffeine.newBuilder()
            .maximumSize(100)
            .expireAfterWrite(1, TimeUnit.MINUTES)
            .recordStats()
            .build();
        
        // 热门话题缓存
        hotTopicsCache = Caffeine.newBuilder()
            .maximumSize(500)
            .expireAfterWrite(3, TimeUnit.MINUTES)
            .recordStats()
            .build();
        
        // 分类新闻缓存
        categoryCache = Caffeine.newBuilder()
            .maximumSize(2000)
            .expireAfterWrite(2, TimeUnit.MINUTES)
            .recordStats()
            .build();
        
        log.info("Caffeine本地缓存初始化完成");
    }

    // ==================== 新闻列表缓存 ====================
    
    /**
     * 获取新闻列表
     */
    @SuppressWarnings("unchecked")
    public <T> T getNewsList(String key) {
        return (T) newsListCache.getIfPresent(key);
    }
    
    /**
     * 缓存新闻列表
     */
    public void putNewsList(String key, Object value) {
        newsListCache.put(key, value);
        log.debug("L1缓存新闻列表: {}", key);
    }
    
    /**
     * 删除新闻列表缓存
     */
    public void evictNewsList(String key) {
        newsListCache.invalidate(key);
    }
    
    /**
     * 清空新闻列表缓存
     */
    public void clearNewsList() {
        newsListCache.invalidateAll();
        log.info("清空L1新闻列表缓存");
    }

    // ==================== 新闻详情缓存 ====================
    
    /**
     * 获取新闻详情
     */
    @SuppressWarnings("unchecked")
    public <T> T getNewsDetail(String key) {
        return (T) newsDetailCache.getIfPresent(key);
    }
    
    /**
     * 缓存新闻详情
     */
    public void putNewsDetail(String key, Object value) {
        newsDetailCache.put(key, value);
        log.debug("L1缓存新闻详情: {}", key);
    }
    
    /**
     * 删除新闻详情缓存
     */
    public void evictNewsDetail(String key) {
        newsDetailCache.invalidate(key);
    }

    // ==================== 统计数据缓存 ====================
    
    /**
     * 获取统计数据
     */
    @SuppressWarnings("unchecked")
    public <T> T getStatistics(String key) {
        return (T) statisticsCache.getIfPresent(key);
    }
    
    /**
     * 缓存统计数据
     */
    public void putStatistics(String key, Object value) {
        statisticsCache.put(key, value);
        log.debug("L1缓存统计数据: {}", key);
    }
    
    /**
     * 清空统计数据缓存
     */
    public void clearStatistics() {
        statisticsCache.invalidateAll();
        log.info("清空L1统计数据缓存");
    }

    // ==================== 热门话题缓存 ====================
    
    /**
     * 获取热门话题
     */
    @SuppressWarnings("unchecked")
    public <T> T getHotTopics(String key) {
        return (T) hotTopicsCache.getIfPresent(key);
    }
    
    /**
     * 缓存热门话题
     */
    public void putHotTopics(String key, Object value) {
        hotTopicsCache.put(key, value);
        log.debug("L1缓存热门话题: {}", key);
    }
    
    /**
     * 清空热门话题缓存
     */
    public void clearHotTopics() {
        hotTopicsCache.invalidateAll();
        log.info("清空L1热门话题缓存");
    }

    // ==================== 分类新闻缓存 ====================
    
    /**
     * 获取分类新闻
     */
    @SuppressWarnings("unchecked")
    public <T> T getCategoryNews(String key) {
        return (T) categoryCache.getIfPresent(key);
    }
    
    /**
     * 缓存分类新闻
     */
    public void putCategoryNews(String key, Object value) {
        categoryCache.put(key, value);
        log.debug("L1缓存分类新闻: {}", key);
    }
    
    /**
     * 清空分类新闻缓存
     */
    public void clearCategoryNews() {
        categoryCache.invalidateAll();
        log.info("清空L1分类新闻缓存");
    }

    // ==================== 缓存管理 ====================
    
    /**
     * 清空所有本地缓存
     */
    public void clearAll() {
        newsListCache.invalidateAll();
        newsDetailCache.invalidateAll();
        statisticsCache.invalidateAll();
        hotTopicsCache.invalidateAll();
        categoryCache.invalidateAll();
        log.info("清空所有L1缓存");
    }
    
    /**
     * 获取缓存统计信息
     */
    public Map<String, Object> getCacheStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        // 新闻列表缓存统计
        CacheStats newsListStats = newsListCache.stats();
        stats.put("newsList", buildStatsMap(newsListStats, newsListCache.estimatedSize()));
        
        // 新闻详情缓存统计
        CacheStats newsDetailStats = newsDetailCache.stats();
        stats.put("newsDetail", buildStatsMap(newsDetailStats, newsDetailCache.estimatedSize()));
        
        // 统计数据缓存统计
        CacheStats statisticsStats = statisticsCache.stats();
        stats.put("statistics", buildStatsMap(statisticsStats, statisticsCache.estimatedSize()));
        
        // 热门话题缓存统计
        CacheStats hotTopicsStats = hotTopicsCache.stats();
        stats.put("hotTopics", buildStatsMap(hotTopicsStats, hotTopicsCache.estimatedSize()));
        
        // 分类新闻缓存统计
        CacheStats categoryStats = categoryCache.stats();
        stats.put("category", buildStatsMap(categoryStats, categoryCache.estimatedSize()));
        
        // 总体统计
        long totalHits = newsListStats.hitCount() + newsDetailStats.hitCount() + 
                        statisticsStats.hitCount() + hotTopicsStats.hitCount() + 
                        categoryStats.hitCount();
        long totalMisses = newsListStats.missCount() + newsDetailStats.missCount() + 
                          statisticsStats.missCount() + hotTopicsStats.missCount() + 
                          categoryStats.missCount();
        long totalRequests = totalHits + totalMisses;
        
        Map<String, Object> totalStats = new HashMap<>();
        totalStats.put("totalHits", totalHits);
        totalStats.put("totalMisses", totalMisses);
        totalStats.put("totalRequests", totalRequests);
        if (totalRequests > 0) {
            double hitRate = (double) totalHits / totalRequests * 100;
            totalStats.put("hitRate", String.format("%.2f%%", hitRate));
        } else {
            totalStats.put("hitRate", "0.00%");
        }
        
        stats.put("total", totalStats);
        
        return stats;
    }
    
    /**
     * 构建统计信息Map
     */
    private Map<String, Object> buildStatsMap(CacheStats stats, long size) {
        Map<String, Object> map = new HashMap<>();
        map.put("size", size);
        map.put("hitCount", stats.hitCount());
        map.put("missCount", stats.missCount());
        map.put("loadSuccessCount", stats.loadSuccessCount());
        map.put("loadFailureCount", stats.loadFailureCount());
        map.put("evictionCount", stats.evictionCount());
        
        long totalRequests = stats.hitCount() + stats.missCount();
        if (totalRequests > 0) {
            double hitRate = (double) stats.hitCount() / totalRequests * 100;
            map.put("hitRate", String.format("%.2f%%", hitRate));
        } else {
            map.put("hitRate", "0.00%");
        }
        
        return map;
    }
    
    /**
     * 输出缓存统计日志
     */
    public void logStatistics() {
        Map<String, Object> stats = getCacheStatistics();
        log.info("L1缓存统计: {}", stats);
    }
}