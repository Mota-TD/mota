package com.mota.project.service.news;

import com.alibaba.fastjson2.JSON;
import com.mota.project.entity.news.NewsArticle;
import com.mota.project.entity.news.NewsDataSource;
import com.mota.project.mapper.news.NewsArticleMapper;
import com.mota.project.mapper.news.NewsDataSourceMapper;
import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndFeed;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.jsoup.Jsoup;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.TimeUnit;
import javax.net.ssl.*;

/**
 * 新闻采集服务
 * 从RSS源采集新闻并存储到数据库
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NewsCrawlerService {

    private final NewsArticleMapper newsArticleMapper;
    private final NewsDataSourceMapper newsDataSourceMapper;
    private final NewsCacheService newsCacheService;
    private final BloomFilterService bloomFilterService;

    // 使用静态方法创建 OkHttpClient，避免与 Lombok 构造函数冲突
    private final OkHttpClient httpClient = createHttpClient();

    /**
     * 创建信任所有证书的 OkHttpClient（仅用于开发环境）
     */
    private static OkHttpClient createHttpClient() {
        try {
            // 创建信任所有证书的 TrustManager
            TrustManager[] trustAllCerts = new TrustManager[]{
                new X509TrustManager() {
                    public X509Certificate[] getAcceptedIssuers() { return new X509Certificate[0]; }
                    public void checkClientTrusted(X509Certificate[] certs, String authType) {}
                    public void checkServerTrusted(X509Certificate[] certs, String authType) {}
                }
            };

            SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(null, trustAllCerts, new SecureRandom());

            return new OkHttpClient.Builder()
                    .connectTimeout(30, TimeUnit.SECONDS)
                    .readTimeout(30, TimeUnit.SECONDS)
                    .writeTimeout(30, TimeUnit.SECONDS)
                    .sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0])
                    .hostnameVerifier((hostname, session) -> true)
                    .build();
        } catch (Exception e) {
            // 如果 SSL 配置失败，使用默认配置
            return new OkHttpClient.Builder()
                    .connectTimeout(30, TimeUnit.SECONDS)
                    .readTimeout(30, TimeUnit.SECONDS)
                    .writeTimeout(30, TimeUnit.SECONDS)
                    .build();
        }
    }

    /**
     * 应用启动时执行一次采集
     */
    @PostConstruct
    public void init() {
        log.info("新闻采集服务初始化，准备首次采集...");
        // 异步执行首次采集，避免阻塞启动
        try {
            crawlAllSourcesAsync();
        } catch (Exception e) {
            log.error("首次新闻采集失败，但不影响服务启动: {}", e.getMessage());
        }
    }

    /**
     * 定时采集任务 - 每小时执行一次
     */
    @Scheduled(fixedRate = 3600000, initialDelay = 3600000)
    public void scheduledCrawl() {
        log.info("执行定时新闻采集任务...");
        crawlAllSources();
    }

    /**
     * 异步采集所有数据源
     */
    @Async
    public void crawlAllSourcesAsync() {
        crawlAllSources();
    }

    /**
     * 采集所有启用的数据源
     */
    public void crawlAllSources() {
        log.info("开始采集所有新闻源...");
        
        List<NewsDataSource> sources = null;
        try {
            sources = newsDataSourceMapper.selectAllEnabled();
        } catch (Exception e) {
            log.error("获取数据源列表失败: {}", e.getMessage());
            return;
        }
        
        if (sources == null || sources.isEmpty()) {
            log.warn("没有启用的新闻数据源");
            return;
        }

        int totalCrawled = 0;
        int totalFailed = 0;

        for (NewsDataSource source : sources) {
            try {
                int count = crawlSource(source);
                totalCrawled += count;
                log.info("数据源 [{}] 采集完成，新增 {} 条新闻", source.getSourceName(), count);
            } catch (Exception e) {
                totalFailed++;
                log.error("数据源 [{}] 采集失败: {}", source.getSourceName(), e.getMessage());
                // 更新数据源状态为失败，截断错误消息
                try {
                    String errorMsg = truncateString(e.getMessage(), 200);
                    newsDataSourceMapper.updateCrawlStatus(
                        source.getId(),
                        LocalDateTime.now(),
                        "failed",
                        errorMsg
                    );
                } catch (Exception updateEx) {
                    log.error("更新数据源状态失败: {}", updateEx.getMessage());
                }
            }
        }

        log.info("新闻采集完成，共采集 {} 条新闻，{} 个数据源失败", totalCrawled, totalFailed);
        
        // 采集完成后清除缓存，确保用户获取最新数据
        if (totalCrawled > 0) {
            log.info("清除新闻缓存以反映最新采集的数据");
            newsCacheService.clearAllNewsCache();
        }
    }

    /**
     * 采集单个数据源
     */
    public int crawlSource(NewsDataSource source) {
        log.info("开始采集数据源: {} ({})", source.getSourceName(), source.getSourceUrl());

        if (source.getSourceUrl() == null || source.getSourceUrl().isEmpty()) {
            throw new RuntimeException("数据源URL为空");
        }

        List<NewsArticle> articles = new ArrayList<>();

        try {
            // 根据数据源类型选择采集方式
            if ("rss".equals(source.getSourceType())) {
                articles = crawlRssFeed(source);
            } else if ("api".equals(source.getSourceType())) {
                articles = crawlApi(source);
            } else {
                log.warn("不支持的数据源类型: {}", source.getSourceType());
                return 0;
            }

            // 过滤已存在的文章并保存新文章
            int savedCount = 0;
            for (NewsArticle article : articles) {
                try {
                    if (article.getSourceUrl() != null &&
                        !newsArticleMapper.existsBySourceUrl(article.getSourceUrl())) {
                        // 设置数据源信息
                        article.setSourceId(source.getId());
                        article.setSourceName(source.getSourceName());
                        article.setCrawlTime(LocalDateTime.now());
                        
                        // 分析文章
                        analyzeArticle(article);
                        
                        // 保存到数据库
                        newsArticleMapper.insert(article);
                        
                        // 添加到布隆过滤器
                        if (article.getId() != null) {
                            bloomFilterService.put(article.getId());
                            // 缓存新文章详情
                            newsCacheService.cacheNewsDetail(article);
                        }
                        
                        savedCount++;
                    }
                } catch (Exception e) {
                    log.warn("保存文章失败 [{}]: {}", article.getTitle(), e.getMessage());
                    // 继续处理下一篇文章
                }
            }

            // 更新数据源状态
            try {
                newsDataSourceMapper.updateCrawlStatus(
                    source.getId(),
                    LocalDateTime.now(),
                    "success",
                    null
                );
                newsDataSourceMapper.incrementTotalArticles(source.getId(), savedCount);
            } catch (Exception e) {
                log.warn("更新数据源状态失败: {}", e.getMessage());
            }

            return savedCount;

        } catch (Exception e) {
            log.error("采集数据源 [{}] 失败: {}", source.getSourceName(), e.getMessage());
            throw new RuntimeException("采集失败: " + truncateString(e.getMessage(), 100), e);
        }
    }

    /**
     * 采集RSS源
     */
    private List<NewsArticle> crawlRssFeed(NewsDataSource source) throws Exception {
        List<NewsArticle> articles = new ArrayList<>();

        Request request = new Request.Builder()
                .url(source.getSourceUrl())
                .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new RuntimeException("HTTP请求失败: " + response.code());
            }

            String content = response.body() != null ? response.body().string() : "";
            if (content.isEmpty()) {
                throw new RuntimeException("响应内容为空");
            }

            SyndFeedInput input = new SyndFeedInput();
            SyndFeed feed = input.build(new XmlReader(new ByteArrayInputStream(content.getBytes())));

            for (SyndEntry entry : feed.getEntries()) {
                NewsArticle article = convertRssEntry(entry, source);
                if (article != null) {
                    articles.add(article);
                }
            }
        }

        return articles;
    }

    /**
     * 采集API数据源（预留接口）
     */
    private List<NewsArticle> crawlApi(NewsDataSource source) {
        // TODO: 实现API采集逻辑
        log.warn("API采集暂未实现: {}", source.getSourceName());
        return new ArrayList<>();
    }

    /**
     * 转换RSS条目为新闻文章
     */
    private NewsArticle convertRssEntry(SyndEntry entry, NewsDataSource source) {
        if (entry.getTitle() == null || entry.getTitle().trim().isEmpty()) {
            return null;
        }

        NewsArticle article = new NewsArticle();
        article.setTitle(cleanHtml(entry.getTitle()));
        article.setSourceUrl(entry.getLink());
        article.setCategory(source.getCategory());
        article.setStatus("active");

        // 处理发布时间
        if (entry.getPublishedDate() != null) {
            article.setPublishTime(LocalDateTime.ofInstant(
                entry.getPublishedDate().toInstant(), 
                ZoneId.systemDefault()
            ));
        } else {
            article.setPublishTime(LocalDateTime.now());
        }

        // 处理摘要
        if (entry.getDescription() != null) {
            String summary = cleanHtml(entry.getDescription().getValue());
            article.setSummary(summary.length() > 500 ? summary.substring(0, 500) : summary);
            article.setWordCount(summary.length());
            article.setReadTime(Math.max(1, summary.length() / 500));
        }

        // 处理作者
        if (entry.getAuthor() != null && !entry.getAuthor().isEmpty()) {
            article.setAuthor(entry.getAuthor());
        }

        return article;
    }

    /**
     * 分析文章（情感分析、重要性评分等）
     */
    private void analyzeArticle(NewsArticle article) {
        String text = (article.getTitle() + " " + 
                      (article.getSummary() != null ? article.getSummary() : "")).toLowerCase();

        // 简单的情感分析
        String sentiment = analyzeSentiment(text);
        article.setSentiment(sentiment);
        article.setSentimentScore(BigDecimal.valueOf(
            "positive".equals(sentiment) ? 0.7 : ("negative".equals(sentiment) ? 0.3 : 0.5)
        ));

        // 重要性评分
        double importanceScore = calculateImportance(text);
        article.setImportanceScore(BigDecimal.valueOf(importanceScore));

        // 质量评分
        double qualityScore = calculateQuality(article);
        article.setQualityScore(BigDecimal.valueOf(qualityScore));

        // 判断是否为政策新闻
        boolean isPolicy = isPolicyNews(text);
        article.setIsPolicy(isPolicy);
        if (isPolicy) {
            article.setCategory("policy");
            article.setPolicyLevel(detectPolicyLevel(text));
        }

        // 提取关键词 - 使用 JSON 格式
        List<String> keywords = extractKeywords(text);
        article.setKeywords(JSON.toJSONString(keywords));
    }

    /**
     * 情感分析
     */
    private String analyzeSentiment(String text) {
        String[] positiveWords = {"增长", "突破", "创新", "成功", "领先", "提升", "利好", "上涨", "盈利"};
        String[] negativeWords = {"下跌", "亏损", "风险", "危机", "下滑", "困难", "问题", "失败", "警告"};

        int positiveCount = 0;
        int negativeCount = 0;

        for (String word : positiveWords) {
            if (text.contains(word)) positiveCount++;
        }
        for (String word : negativeWords) {
            if (text.contains(word)) negativeCount++;
        }

        if (positiveCount > negativeCount + 1) return "positive";
        if (negativeCount > positiveCount + 1) return "negative";
        return "neutral";
    }

    /**
     * 计算重要性评分
     */
    private double calculateImportance(String text) {
        double score = 50.0;
        
        String[] importantKeywords = {"重大", "突破", "首次", "最新", "官方", "发布", "政策", "战略"};
        for (String keyword : importantKeywords) {
            if (text.contains(keyword)) score += 10;
        }

        return Math.min(100, score);
    }

    /**
     * 计算质量评分
     */
    private double calculateQuality(NewsArticle article) {
        double score = 60.0;

        if (article.getSummary() != null && article.getSummary().length() > 100) score += 10;
        if (article.getAuthor() != null && !article.getAuthor().isEmpty()) score += 10;
        if (article.getSourceUrl() != null) score += 10;

        return Math.min(100, score);
    }

    /**
     * 判断是否为政策新闻
     */
    private boolean isPolicyNews(String text) {
        String[] policyKeywords = {"政策", "法规", "监管", "国务院", "部委", "通知", "意见", "规定", "条例"};
        for (String keyword : policyKeywords) {
            if (text.contains(keyword)) return true;
        }
        return false;
    }

    /**
     * 检测政策级别
     */
    private String detectPolicyLevel(String text) {
        if (text.contains("国务院") || text.contains("中央") || text.contains("全国")) {
            return "national";
        } else if (text.contains("省") || text.contains("自治区") || text.contains("直辖市")) {
            return "provincial";
        } else if (text.contains("市") || text.contains("区") || text.contains("县")) {
            return "municipal";
        }
        return "national";
    }

    /**
     * 提取关键词
     */
    private List<String> extractKeywords(String text) {
        List<String> keywords = new ArrayList<>();
        String[] hotKeywords = {"AI", "人工智能", "大模型", "数字化", "云计算", "5G", "新能源", 
                               "芯片", "半导体", "元宇宙", "区块链", "物联网", "智能制造"};
        
        for (String keyword : hotKeywords) {
            if (text.toLowerCase().contains(keyword.toLowerCase())) {
                keywords.add(keyword);
            }
        }
        return keywords;
    }

    /**
     * 清理HTML标签
     */
    private String cleanHtml(String html) {
        if (html == null) return "";
        return Jsoup.parse(html).text();
    }

    /**
     * 截断字符串
     */
    private String truncateString(String str, int maxLength) {
        if (str == null) return null;
        if (str.length() <= maxLength) return str;
        return str.substring(0, maxLength) + "...";
    }

    // ==================== 查询方法 ====================

    /**
     * 获取所有新闻 - 优先从缓存获取
     */
    public List<NewsArticle> getAllNews(int limit) {
        return getAllNews(1, limit);
    }

    /**
     * 获取所有新闻（带分页）- 优先从缓存获取
     */
    public List<NewsArticle> getAllNews(int page, int pageSize) {
        // 先从缓存获取
        List<NewsArticle> cached = newsCacheService.getNewsList(page, pageSize);
        if (cached != null) {
            log.debug("从缓存返回新闻列表: page={}, pageSize={}, count={}", page, pageSize, cached.size());
            return cached;
        }
        
        // 缓存未命中，从数据库获取
        int offset = (page - 1) * pageSize;
        List<NewsArticle> results = newsArticleMapper.selectAll(offset, pageSize);
        
        // 缓存结果
        if (!results.isEmpty()) {
            newsCacheService.cacheNewsList(page, pageSize, results);
        }
        
        return results;
    }

    /**
     * 按分类获取新闻 - 优先从缓存获取
     */
    public List<NewsArticle> getNewsByCategory(String category, int limit) {
        return getNewsByCategory(category, 1, limit);
    }

    /**
     * 按分类获取新闻（带分页）- 优先从缓存获取
     */
    public List<NewsArticle> getNewsByCategory(String category, int page, int pageSize) {
        // 先从缓存获取
        List<NewsArticle> cached = newsCacheService.getCategoryNews(category, page, pageSize);
        if (cached != null) {
            log.debug("从缓存返回分类新闻: category={}, page={}, count={}", category, page, cached.size());
            return cached;
        }
        
        // 缓存未命中，从数据库获取
        int offset = (page - 1) * pageSize;
        List<NewsArticle> results = newsArticleMapper.selectByCategory(category, offset, pageSize);
        
        // 缓存结果
        if (!results.isEmpty()) {
            newsCacheService.cacheCategoryNews(category, page, pageSize, results);
        }
        
        return results;
    }

    /**
     * 搜索新闻 - 优先从缓存获取
     */
    public List<NewsArticle> searchNews(String keyword, int limit) {
        return searchNews(keyword, 1, limit);
    }

    /**
     * 搜索新闻（带分页）- 优先从缓存获取
     */
    public List<NewsArticle> searchNews(String keyword, int page, int pageSize) {
        // 先从缓存获取
        List<NewsArticle> cached = newsCacheService.getSearchResult(keyword, page, pageSize);
        if (cached != null) {
            log.debug("从缓存返回搜索结果: keyword={}, page={}, count={}", keyword, page, cached.size());
            return cached;
        }
        
        // 缓存未命中，从数据库搜索
        int offset = (page - 1) * pageSize;
        List<NewsArticle> results = newsArticleMapper.search(keyword, offset, pageSize);
        
        // 缓存结果
        if (!results.isEmpty()) {
            newsCacheService.cacheSearchResult(keyword, page, pageSize, results);
        }
        
        return results;
    }

    /**
     * 获取新闻总数
     */
    public int countAll() {
        return newsArticleMapper.countAll();
    }

    /**
     * 按分类获取新闻总数
     */
    public int countByCategory(String category) {
        return newsArticleMapper.countByCategory(category);
    }

    /**
     * 搜索新闻总数
     */
    public int countSearch(String keyword) {
        return newsArticleMapper.countSearch(keyword);
    }

    /**
     * 获取政策新闻 - 优先从缓存获取
     */
    public List<NewsArticle> getPolicyNews(int limit) {
        // 先从缓存获取
        List<NewsArticle> cached = newsCacheService.getPolicyNews(limit);
        if (cached != null) {
            log.debug("从缓存返回政策新闻: limit={}, count={}", limit, cached.size());
            return cached;
        }
        
        // 缓存未命中，从数据库获取
        List<NewsArticle> results = newsArticleMapper.selectPolicyNews(0, limit);
        
        // 缓存结果
        if (!results.isEmpty()) {
            newsCacheService.cachePolicyNews(limit, results);
        }
        
        return results;
    }

    /**
     * 获取推荐新闻
     */
    public List<NewsArticle> getRecommendedNews(List<String> interests, int limit) {
        if (interests == null || interests.isEmpty()) {
            return getAllNews(limit);
        }
        return newsArticleMapper.selectByKeywords(interests, 0, limit);
    }

    /**
     * 获取统计数据 - 优先从缓存获取
     */
    public Map<String, Object> getStatistics() {
        // 先从缓存获取
        Map<String, Object> cached = newsCacheService.getStatistics();
        if (cached != null) {
            log.debug("从缓存返回统计数据");
            return cached;
        }
        
        // 缓存未命中，从数据库统计
        Map<String, Object> stats = new HashMap<>();
        
        int totalArticles = newsArticleMapper.countAll();
        int todayArticles = newsArticleMapper.countToday(LocalDate.now().atStartOfDay());
        int policyCount = newsArticleMapper.countPolicyNews();
        
        stats.put("totalArticles", totalArticles);
        stats.put("todayArticles", todayArticles);
        stats.put("policyCount", policyCount);
        stats.put("matchedCount", 0); // 需要根据用户匹配计算
        stats.put("favoriteCount", 0); // 需要从收藏表统计
        stats.put("pushCount", 0); // 需要从推送记录统计

        // 分类统计
        Map<String, Integer> categoryStats = new HashMap<>();
        categoryStats.put("technology", newsArticleMapper.countByCategory("technology"));
        categoryStats.put("industry", newsArticleMapper.countByCategory("industry"));
        categoryStats.put("policy", newsArticleMapper.countByCategory("policy"));
        categoryStats.put("finance", newsArticleMapper.countByCategory("finance"));
        stats.put("categoryDistribution", categoryStats);

        // 缓存统计数据
        newsCacheService.cacheStatistics(stats);
        
        return stats;
    }

    /**
     * 获取热门话题 - 优先从缓存获取
     */
    public List<Map<String, Object>> getHotTopics(int limit) {
        // 先从缓存获取
        List<Map<String, Object>> cached = newsCacheService.getHotTopics();
        if (cached != null && !cached.isEmpty()) {
            log.debug("从缓存返回热门话题: count={}", cached.size());
            // 如果缓存的数量大于需要的数量，截取
            if (cached.size() > limit) {
                return cached.subList(0, limit);
            }
            return cached;
        }
        
        // 缓存未命中，从数据库统计
        List<NewsArticle> recentNews = newsArticleMapper.selectAll(0, 100);
        Map<String, Integer> topicCounts = new HashMap<>();

        String[] hotKeywords = {"AI大模型", "数字化转型", "企业服务", "云计算", "数据安全",
                               "智能制造", "新能源", "元宇宙", "区块链", "物联网"};

        for (NewsArticle article : recentNews) {
            String text = (article.getTitle() + " " +
                          (article.getSummary() != null ? article.getSummary() : "")).toLowerCase();
            for (String keyword : hotKeywords) {
                if (text.contains(keyword.toLowerCase())) {
                    topicCounts.merge(keyword, 1, Integer::sum);
                }
            }
        }

        // 转换为结果列表
        List<Map<String, Object>> topics = new ArrayList<>();
        topicCounts.entrySet().stream()
            .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
            .limit(limit)
            .forEach(entry -> {
                Map<String, Object> topic = new HashMap<>();
                topic.put("name", entry.getKey());
                topic.put("count", entry.getValue());
                topic.put("trend", entry.getValue() > 5 ? "up" : "stable");
                topic.put("change", "+" + (entry.getValue() * 2) + "%");
                topics.add(topic);
            });

        // 缓存热门话题
        if (!topics.isEmpty()) {
            newsCacheService.cacheHotTopics(topics);
        }
        
        return topics;
    }

    /**
     * 获取所有数据源
     */
    public List<NewsDataSource> getDataSources() {
        return newsDataSourceMapper.selectAll();
    }

    /**
     * 手动触发采集
     */
    public void triggerManualCrawl() {
        crawlAllSourcesAsync();
    }
}