package com.mota.project.service.news;

import com.mota.project.entity.news.NewsArticle;
import com.mota.project.mapper.news.NewsArticleMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 智能预加载服务
 * 基于访问模式预测性地加载数据到缓存
 * 
 * 核心功能：
 * 1. 访问模式分析：记录和分析用户访问行为
 * 2. 预测性加载：根据历史模式预加载可能访问的数据
 * 3. 时间段分析：识别高峰时段和访问规律
 * 4. 自适应调整：根据命中率动态调整预加载策略
 * 
 * 预加载策略：
 * - 热点数据：访问频率高的数据优先预加载
 * - 时间规律：根据时间段预加载相关数据
 * - 关联数据：预加载相关联的数据（如同分类新闻）
 * - 趋势预测：基于访问趋势预测未来需求
 * 
 * @author Mota Team
 * @since 2.1
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SmartPreloadService {

    private final NewsCacheService cacheService;
    private final NewsArticleMapper newsArticleMapper;
    
    // 访问记录存储（使用ConcurrentHashMap保证线程安全）
    private final Map<String, AccessPattern> accessPatterns = new ConcurrentHashMap<>();
    
    // 预加载任务队列
    private final PriorityBlockingQueue<PreloadTask> preloadQueue = new PriorityBlockingQueue<>();
    
    // 预加载线程池
    private ExecutorService preloadExecutor;
    
    // 统计数据
    private final AtomicLong totalPreloads = new AtomicLong(0);
    private final AtomicLong successfulPreloads = new AtomicLong(0);
    private final AtomicLong preloadHits = new AtomicLong(0);
    
    // 配置参数
    private static final int PRELOAD_THREAD_POOL_SIZE = 2;
    private static final int MAX_PRELOAD_QUEUE_SIZE = 100;
    private static final int MIN_ACCESS_COUNT_FOR_PRELOAD = 3; // 最少访问次数才触发预加载
    private static final double PRELOAD_THRESHOLD = 0.7; // 预加载阈值（访问频率）

    // ==================== 初始化 ====================
    
    @PostConstruct
    public void init() {
        log.info("初始化智能预加载服务...");
        
        // 创建预加载线程池
        preloadExecutor = Executors.newFixedThreadPool(
            PRELOAD_THREAD_POOL_SIZE,
            new ThreadFactory() {
                private final AtomicLong threadNumber = new AtomicLong(1);
                @Override
                public Thread newThread(Runnable r) {
                    Thread t = new Thread(r, "preload-worker-" + threadNumber.getAndIncrement());
                    t.setDaemon(true);
                    return t;
                }
            }
        );
        
        // 启动预加载任务处理线程
        startPreloadWorker();
        
        log.info("智能预加载服务初始化完成");
    }

    // ==================== 访问模式记录 ====================
    
    /**
     * 访问模式数据结构
     */
    private static class AccessPattern {
        private final String key;
        private final AtomicLong accessCount = new AtomicLong(0);
        private final ConcurrentLinkedQueue<LocalDateTime> accessTimes = new ConcurrentLinkedQueue<>();
        private volatile LocalDateTime lastAccessTime;
        private volatile LocalDateTime lastPreloadTime;
        
        public AccessPattern(String key) {
            this.key = key;
        }
        
        public void recordAccess() {
            accessCount.incrementAndGet();
            LocalDateTime now = LocalDateTime.now();
            lastAccessTime = now;
            accessTimes.offer(now);
            
            // 只保留最近100次访问记录
            while (accessTimes.size() > 100) {
                accessTimes.poll();
            }
        }
        
        public long getAccessCount() {
            return accessCount.get();
        }
        
        public LocalDateTime getLastAccessTime() {
            return lastAccessTime;
        }
        
        public void setLastPreloadTime(LocalDateTime time) {
            this.lastPreloadTime = time;
        }
        
        public LocalDateTime getLastPreloadTime() {
            return lastPreloadTime;
        }
        
        /**
         * 计算访问频率（次/小时）
         */
        public double getAccessFrequency() {
            if (accessTimes.isEmpty()) {
                return 0;
            }
            
            LocalDateTime oldest = accessTimes.peek();
            LocalDateTime newest = lastAccessTime;
            
            if (oldest == null || newest == null) {
                return 0;
            }
            
            long hours = java.time.Duration.between(oldest, newest).toHours();
            if (hours == 0) {
                hours = 1;
            }
            
            return (double) accessCount.get() / hours;
        }
        
        /**
         * 判断是否需要预加载
         */
        public boolean shouldPreload() {
            // 访问次数太少，不预加载
            if (accessCount.get() < MIN_ACCESS_COUNT_FOR_PRELOAD) {
                return false;
            }
            
            // 访问频率太低，不预加载
            if (getAccessFrequency() < PRELOAD_THRESHOLD) {
                return false;
            }
            
            // 最近刚预加载过，不重复预加载
            if (lastPreloadTime != null) {
                long minutesSincePreload = java.time.Duration.between(lastPreloadTime, LocalDateTime.now()).toMinutes();
                if (minutesSincePreload < 5) {
                    return false;
                }
            }
            
            return true;
        }
    }

    // ==================== 预加载任务 ====================
    
    /**
     * 预加载任务
     */
    private static class PreloadTask implements Comparable<PreloadTask> {
        private final String key;
        private final PreloadType type;
        private final double priority;
        private final Map<String, Object> params;
        
        public PreloadTask(String key, PreloadType type, double priority, Map<String, Object> params) {
            this.key = key;
            this.type = type;
            this.priority = priority;
            this.params = params;
        }
        
        @Override
        public int compareTo(PreloadTask other) {
            // 优先级高的排在前面
            return Double.compare(other.priority, this.priority);
        }
        
        public String getKey() {
            return key;
        }
        
        public PreloadType getType() {
            return type;
        }
        
        public Map<String, Object> getParams() {
            return params;
        }
    }
    
    /**
     * 预加载类型
     */
    private enum PreloadType {
        NEWS_LIST,      // 新闻列表
        NEWS_DETAIL,    // 新闻详情
        CATEGORY_NEWS,  // 分类新闻
        STATISTICS,     // 统计数据
        RELATED_NEWS    // 相关新闻
    }

    // ==================== 访问记录 ====================
    
    /**
     * 记录新闻列表访问
     */
    public void recordNewsListAccess(int page, int pageSize) {
        String key = "list:" + page + ":" + pageSize;
        AccessPattern pattern = accessPatterns.computeIfAbsent(key, AccessPattern::new);
        pattern.recordAccess();
        
        // 检查是否需要预加载
        if (pattern.shouldPreload()) {
            schedulePreload(key, PreloadType.NEWS_LIST, pattern.getAccessFrequency(),
                Map.of("page", page, "pageSize", pageSize));
        }
    }
    
    /**
     * 记录新闻详情访问
     */
    public void recordNewsDetailAccess(Long articleId) {
        String key = "detail:" + articleId;
        AccessPattern pattern = accessPatterns.computeIfAbsent(key, AccessPattern::new);
        pattern.recordAccess();
        
        // 检查是否需要预加载相关新闻
        if (pattern.shouldPreload()) {
            schedulePreload(key, PreloadType.RELATED_NEWS, pattern.getAccessFrequency(),
                Map.of("articleId", articleId));
        }
    }
    
    /**
     * 记录分类新闻访问
     */
    public void recordCategoryNewsAccess(String category, int page, int pageSize) {
        String key = "category:" + category + ":" + page + ":" + pageSize;
        AccessPattern pattern = accessPatterns.computeIfAbsent(key, AccessPattern::new);
        pattern.recordAccess();
        
        if (pattern.shouldPreload()) {
            schedulePreload(key, PreloadType.CATEGORY_NEWS, pattern.getAccessFrequency(),
                Map.of("category", category, "page", page, "pageSize", pageSize));
        }
    }

    // ==================== 预加载调度 ====================
    
    /**
     * 调度预加载任务
     */
    private void schedulePreload(String key, PreloadType type, double priority, Map<String, Object> params) {
        // 队列已满，不再添加
        if (preloadQueue.size() >= MAX_PRELOAD_QUEUE_SIZE) {
            log.debug("预加载队列已满，跳过任务: {}", key);
            return;
        }
        
        PreloadTask task = new PreloadTask(key, type, priority, params);
        preloadQueue.offer(task);
        log.debug("调度预加载任务: type={}, key={}, priority={}", type, key, priority);
    }
    
    /**
     * 启动预加载工作线程
     */
    private void startPreloadWorker() {
        preloadExecutor.submit(() -> {
            while (!Thread.currentThread().isInterrupted()) {
                try {
                    PreloadTask task = preloadQueue.poll(1, TimeUnit.SECONDS);
                    if (task != null) {
                        executePreload(task);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                } catch (Exception e) {
                    log.warn("预加载任务执行失败: {}", e.getMessage());
                }
            }
        });
    }
    
    /**
     * 执行预加载任务
     */
    private void executePreload(PreloadTask task) {
        totalPreloads.incrementAndGet();
        
        try {
            switch (task.getType()) {
                case NEWS_LIST:
                    preloadNewsList(task.getParams());
                    break;
                case CATEGORY_NEWS:
                    preloadCategoryNews(task.getParams());
                    break;
                case RELATED_NEWS:
                    preloadRelatedNews(task.getParams());
                    break;
                case STATISTICS:
                    preloadStatistics();
                    break;
                default:
                    log.warn("未知的预加载类型: {}", task.getType());
                    return;
            }
            
            // 更新预加载时间
            AccessPattern pattern = accessPatterns.get(task.getKey());
            if (pattern != null) {
                pattern.setLastPreloadTime(LocalDateTime.now());
            }
            
            successfulPreloads.incrementAndGet();
            log.debug("预加载任务完成: type={}, key={}", task.getType(), task.getKey());
            
        } catch (Exception e) {
            log.warn("预加载任务执行失败: type={}, key={}, error={}", 
                task.getType(), task.getKey(), e.getMessage());
        }
    }

    // ==================== 具体预加载逻辑 ====================
    
    /**
     * 预加载新闻列表
     */
    private void preloadNewsList(Map<String, Object> params) {
        int page = (int) params.get("page");
        int pageSize = (int) params.get("pageSize");
        
        // 预加载当前页和下一页
        for (int p = page; p <= page + 1; p++) {
            List<NewsArticle> articles = newsArticleMapper.selectAll((p - 1) * pageSize, pageSize);
            if (!articles.isEmpty()) {
                cacheService.cacheNewsList(p, pageSize, articles);
                log.debug("预加载新闻列表: page={}, count={}", p, articles.size());
            }
        }
    }
    
    /**
     * 预加载分类新闻
     */
    private void preloadCategoryNews(Map<String, Object> params) {
        String category = (String) params.get("category");
        int page = (int) params.get("page");
        int pageSize = (int) params.get("pageSize");
        
        // 预加载当前页和下一页
        for (int p = page; p <= page + 1; p++) {
            List<NewsArticle> articles = newsArticleMapper.selectByCategory(
                category, (p - 1) * pageSize, pageSize);
            if (!articles.isEmpty()) {
                cacheService.cacheCategoryNews(category, p, pageSize, articles);
                log.debug("预加载分类新闻: category={}, page={}, count={}", category, p, articles.size());
            }
        }
    }
    
    /**
     * 预加载相关新闻
     */
    private void preloadRelatedNews(Map<String, Object> params) {
        Long articleId = (Long) params.get("articleId");
        
        // 获取文章详情
        NewsArticle article = newsArticleMapper.selectById(articleId);
        if (article == null) {
            return;
        }
        
        // 预加载同分类的其他新闻
        if (article.getCategory() != null) {
            List<NewsArticle> relatedArticles = newsArticleMapper.selectByCategory(
                article.getCategory(), 0, 10);
            if (!relatedArticles.isEmpty()) {
                cacheService.cacheCategoryNews(article.getCategory(), 1, 10, relatedArticles);
                log.debug("预加载相关新闻: category={}, count={}", article.getCategory(), relatedArticles.size());
            }
        }
    }
    
    /**
     * 预加载统计数据
     */
    private void preloadStatistics() {
        // 统计数据已经在缓存预热中处理，这里可以根据需要补充
        log.debug("预加载统计数据");
    }

    // ==================== 定时任务 ====================
    
    /**
     * 定时分析访问模式并触发预加载
     * 每5分钟执行一次
     */
    @Scheduled(fixedRate = 300000, initialDelay = 60000)
    public void analyzeAndPreload() {
        log.debug("开始分析访问模式...");
        
        int preloadCount = 0;
        for (Map.Entry<String, AccessPattern> entry : accessPatterns.entrySet()) {
            AccessPattern pattern = entry.getValue();
            
            if (pattern.shouldPreload()) {
                // 根据key类型调度不同的预加载任务
                String key = entry.getKey();
                if (key.startsWith("list:")) {
                    String[] parts = key.split(":");
                    schedulePreload(key, PreloadType.NEWS_LIST, pattern.getAccessFrequency(),
                        Map.of("page", Integer.parseInt(parts[1]), 
                               "pageSize", Integer.parseInt(parts[2])));
                    preloadCount++;
                } else if (key.startsWith("category:")) {
                    String[] parts = key.split(":");
                    schedulePreload(key, PreloadType.CATEGORY_NEWS, pattern.getAccessFrequency(),
                        Map.of("category", parts[1],
                               "page", Integer.parseInt(parts[2]),
                               "pageSize", Integer.parseInt(parts[3])));
                    preloadCount++;
                }
            }
        }
        
        if (preloadCount > 0) {
            log.info("访问模式分析完成，调度了 {} 个预加载任务", preloadCount);
        }
    }
    
    /**
     * 定时清理过期的访问模式记录
     * 每小时执行一次
     */
    @Scheduled(fixedRate = 3600000, initialDelay = 3600000)
    public void cleanupOldPatterns() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(7);
        int removed = 0;
        
        Iterator<Map.Entry<String, AccessPattern>> iterator = accessPatterns.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<String, AccessPattern> entry = iterator.next();
            AccessPattern pattern = entry.getValue();
            
            if (pattern.getLastAccessTime() != null && 
                pattern.getLastAccessTime().isBefore(threshold)) {
                iterator.remove();
                removed++;
            }
        }
        
        if (removed > 0) {
            log.info("清理过期访问模式记录: {} 条", removed);
        }
    }

    // ==================== 统计信息 ====================
    
    /**
     * 获取预加载统计信息
     */
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalPreloads", totalPreloads.get());
        stats.put("successfulPreloads", successfulPreloads.get());
        stats.put("preloadHits", preloadHits.get());
        stats.put("queueSize", preloadQueue.size());
        stats.put("patternCount", accessPatterns.size());
        
        long total = totalPreloads.get();
        if (total > 0) {
            double successRate = (double) successfulPreloads.get() / total * 100;
            stats.put("successRate", String.format("%.2f%%", successRate));
            
            double hitRate = (double) preloadHits.get() / total * 100;
            stats.put("hitRate", String.format("%.2f%%", hitRate));
        } else {
            stats.put("successRate", "0.00%");
            stats.put("hitRate", "0.00%");
        }
        
        return stats;
    }
    
    /**
     * 记录预加载命中
     */
    public void recordPreloadHit() {
        preloadHits.incrementAndGet();
    }
    
    /**
     * 定时输出统计信息
     */
    @Scheduled(fixedRate = 3600000, initialDelay = 3600000)
    public void logStatistics() {
        Map<String, Object> stats = getStatistics();
        log.info("智能预加载统计: {}", stats);
    }
}