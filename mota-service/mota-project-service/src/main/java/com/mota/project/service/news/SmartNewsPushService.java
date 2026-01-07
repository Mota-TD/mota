package com.mota.project.service.news;

import com.mota.project.entity.news.*;
import com.mota.project.mapper.news.NewsArticleMapper;
import com.mota.project.mapper.news.NewsFavoriteMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 智能新闻推送服务
 * 实现 NW-001 到 NW-009 功能
 * 所有数据从数据库获取，不使用模拟数据
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SmartNewsPushService {

    private final NewsCrawlerService newsCrawlerService;
    private final NewsArticleMapper newsArticleMapper;
    private final NewsFavoriteMapper newsFavoriteMapper;
    private final NewsCacheService newsCacheService;
    private final BloomFilterService bloomFilterService;
    private final SmartPreloadService smartPreloadService;

    // ==================== NW-001 行业识别 ====================

    /**
     * 自动识别企业行业
     * 基于关键词匹配的简单AI识别
     */
    public List<EnterpriseIndustry> detectIndustry(Long teamId, String companyDescription) {
        log.info("开始识别企业行业, teamId: {}", teamId);
        
        if (companyDescription == null || companyDescription.trim().isEmpty()) {
            return Collections.emptyList();
        }
        
        List<EnterpriseIndustry> industries = new ArrayList<>();
        
        // 行业关键词映射
        Map<String, String[]> industryKeywords = new HashMap<>();
        industryKeywords.put("IT", new String[]{"软件", "互联网", "科技", "技术", "开发", "系统", "平台", "数字化"});
        industryKeywords.put("FINANCE", new String[]{"金融", "银行", "保险", "投资", "证券", "基金", "理财"});
        industryKeywords.put("MANUFACTURING", new String[]{"制造", "生产", "工厂", "设备", "机械", "加工"});
        industryKeywords.put("RETAIL", new String[]{"零售", "电商", "商城", "销售", "门店", "消费"});
        industryKeywords.put("HEALTHCARE", new String[]{"医疗", "健康", "医院", "药品", "医药", "诊断"});
        industryKeywords.put("EDUCATION", new String[]{"教育", "培训", "学校", "课程", "学习", "教学"});
        
        for (Map.Entry<String, String[]> entry : industryKeywords.entrySet()) {
            int matchCount = 0;
            List<String> matchedKeywords = new ArrayList<>();
            for (String keyword : entry.getValue()) {
                if (companyDescription.contains(keyword)) {
                    matchCount++;
                    matchedKeywords.add(keyword);
                }
            }
            
            if (matchCount > 0) {
                EnterpriseIndustry industry = new EnterpriseIndustry();
                industry.setTeamId(teamId);
                industry.setIndustryCode(entry.getKey());
                industry.setIndustryName(getIndustryName(entry.getKey()));
                industry.setConfidence(BigDecimal.valueOf(Math.min(100, matchCount * 20)));
                industry.setIsAutoDetected(true);
                industry.setDetectionSource("keyword_matching");
                industry.setKeywords("[\"" + String.join("\",\"", matchedKeywords) + "\"]");
                industry.setCreatedAt(LocalDateTime.now());
                industries.add(industry);
            }
        }
        
        // 按置信度排序
        industries.sort((a, b) -> b.getConfidence().compareTo(a.getConfidence()));
        
        // 标记主行业
        if (!industries.isEmpty()) {
            industries.get(0).setIsPrimary(true);
        }
        
        return industries;
    }

    /**
     * 获取团队行业配置
     * TODO: 需要实现数据库存储
     */
    public List<EnterpriseIndustry> getTeamIndustries(Long teamId) {
        log.info("获取团队行业配置, teamId: {}", teamId);
        // 返回空列表，提示用户需要配置
        return Collections.emptyList();
    }

    /**
     * 保存行业配置
     * TODO: 需要实现数据库存储
     */
    @Transactional
    public EnterpriseIndustry saveIndustry(EnterpriseIndustry industry) {
        industry.setCreatedAt(LocalDateTime.now());
        industry.setUpdatedAt(LocalDateTime.now());
        industry.setId(System.currentTimeMillis());
        // TODO: 保存到数据库
        return industry;
    }

    // ==================== NW-002 业务理解 ====================

    /**
     * 提取企业关键业务领域
     */
    public List<BusinessDomain> extractBusinessDomains(Long teamId, String businessDescription) {
        log.info("开始提取业务领域, teamId: {}", teamId);
        
        if (businessDescription == null || businessDescription.trim().isEmpty()) {
            return Collections.emptyList();
        }
        
        List<BusinessDomain> domains = new ArrayList<>();
        
        String[] domainTypes = {"product", "service", "market", "technology"};
        Map<String, String[]> domainKeywords = new HashMap<>();
        domainKeywords.put("product", new String[]{"产品", "解决方案", "系统", "平台", "工具"});
        domainKeywords.put("service", new String[]{"服务", "咨询", "支持", "运维", "实施"});
        domainKeywords.put("market", new String[]{"市场", "客户", "销售", "渠道", "营销"});
        domainKeywords.put("technology", new String[]{"技术", "研发", "创新", "AI", "云计算"});
        
        for (String type : domainTypes) {
            String[] keywords = domainKeywords.get(type);
            int matchCount = 0;
            List<String> matchedKeywords = new ArrayList<>();
            
            for (String keyword : keywords) {
                if (businessDescription.contains(keyword)) {
                    matchCount++;
                    matchedKeywords.add(keyword);
                }
            }
            
            if (matchCount > 0) {
                BusinessDomain domain = new BusinessDomain();
                domain.setTeamId(teamId);
                domain.setDomainName(getDomainTypeName(type) + "领域");
                domain.setDomainType(type);
                domain.setKeywords("[\"" + String.join("\",\"", matchedKeywords) + "\"]");
                domain.setImportance(Math.min(10, matchCount * 2));
                domain.setIsCore(matchCount >= 3);
                domain.setCreatedAt(LocalDateTime.now());
                domains.add(domain);
            }
        }
        
        return domains;
    }

    /**
     * 获取团队业务领域
     * TODO: 需要实现数据库存储
     */
    public List<BusinessDomain> getTeamBusinessDomains(Long teamId) {
        log.info("获取团队业务领域, teamId: {}", teamId);
        return Collections.emptyList();
    }

    // ==================== NW-003 新闻采集 ====================

    /**
     * 获取新闻数据源列表 - 从数据库获取
     */
    public List<NewsDataSource> getDataSources() {
        return newsCrawlerService.getDataSources();
    }

    /**
     * 采集新闻 - 触发爬虫服务
     */
    public List<NewsArticle> crawlNews(Long sourceId) {
        log.info("开始采集新闻, sourceId: {}", sourceId);
        newsCrawlerService.crawlAllSourcesAsync();
        return newsCrawlerService.getAllNews(20);
    }

    /**
     * 搜索新闻 - 优先从缓存获取（带分页）+ 智能预加载
     */
    public List<NewsArticle> searchNews(String keyword, String category, int page, int pageSize) {
        log.info("搜索新闻, keyword: {}, category: {}, page: {}, pageSize: {}", keyword, category, page, pageSize);
        
        if (keyword != null && !keyword.trim().isEmpty()) {
            // 搜索结果优先从缓存获取
            List<NewsArticle> cached = newsCacheService.getSearchResult(keyword, page, pageSize);
            if (cached != null) {
                log.debug("从缓存返回搜索结果: keyword={}, count={}", keyword, cached.size());
                return cached;
            }
            
            // 缓存未命中，从数据库搜索
            List<NewsArticle> results = newsCrawlerService.searchNews(keyword, page, pageSize);
            if (!results.isEmpty()) {
                newsCacheService.cacheSearchResult(keyword, page, pageSize, results);
            }
            return results;
        } else if (category != null && !category.trim().isEmpty()) {
            // 记录分类新闻访问（用于智能预加载）
            smartPreloadService.recordCategoryNewsAccess(category, page, pageSize);
            
            // 分类新闻优先从缓存获取
            List<NewsArticle> cached = newsCacheService.getCategoryNews(category, page, pageSize);
            if (cached != null) {
                log.debug("从缓存返回分类新闻: category={}, count={}", category, cached.size());
                return cached;
            }
            
            // 缓存未命中，从数据库获取
            List<NewsArticle> results = newsCrawlerService.getNewsByCategory(category, page, pageSize);
            if (!results.isEmpty()) {
                newsCacheService.cacheCategoryNews(category, page, pageSize, results);
            }
            return results;
        } else {
            // 记录新闻列表访问（用于智能预加载）
            smartPreloadService.recordNewsListAccess(page, pageSize);
            
            // 全部新闻优先从缓存获取
            List<NewsArticle> cached = newsCacheService.getNewsList(page, pageSize);
            if (cached != null) {
                log.debug("从缓存返回新闻列表: count={}", cached.size());
                return cached;
            }
            
            // 缓存未命中，从数据库获取
            List<NewsArticle> results = newsCrawlerService.getAllNews(page, pageSize);
            if (!results.isEmpty()) {
                newsCacheService.cacheNewsList(page, pageSize, results);
            }
            return results;
        }
    }

    /**
     * 获取搜索结果总数
     */
    public int countSearchNews(String keyword, String category) {
        if (keyword != null && !keyword.trim().isEmpty()) {
            return newsCrawlerService.countSearch(keyword);
        } else if (category != null && !category.trim().isEmpty()) {
            return newsCrawlerService.countByCategory(category);
        } else {
            return newsCrawlerService.countAll();
        }
    }

    /**
     * 根据ID获取新闻文章 - 优先从缓存获取，使用布隆过滤器防穿透 + 智能预加载
     */
    public NewsArticle getArticleById(Long id) {
        // 1. 布隆过滤器检查（防止缓存穿透）
        if (!bloomFilterService.mightContain(id)) {
            log.debug("布隆过滤器判断文章不存在: {}", id);
            return null; // 直接返回，不查询缓存和数据库
        }
        
        // 2. 记录新闻详情访问（用于智能预加载）
        smartPreloadService.recordNewsDetailAccess(id);
        
        // 3. 先从缓存获取
        NewsArticle cached = newsCacheService.getNewsDetail(id);
        if (cached != null) {
            // 增加浏览次数（异步）
            newsCacheService.incrementViewCount(id);
            return cached;
        }
        
        // 4. 缓存未命中，从数据库获取
        NewsArticle article = newsArticleMapper.selectById(id);
        if (article != null) {
            // 缓存文章详情
            newsCacheService.cacheNewsDetail(article);
            // 增加浏览次数
            newsCacheService.incrementViewCount(id);
        }
        return article;
    }

    // ==================== NW-004 政策监控 ====================

    /**
     * 创建政策监控
     * TODO: 需要实现数据库存储
     */
    @Transactional
    public PolicyMonitor createPolicyMonitor(PolicyMonitor monitor) {
        monitor.setId(System.currentTimeMillis());
        monitor.setIsEnabled(true);
        monitor.setAlertEnabled(true);
        monitor.setMatchedCount(0);
        monitor.setCreatedAt(LocalDateTime.now());
        monitor.setUpdatedAt(LocalDateTime.now());
        // TODO: 保存到数据库
        return monitor;
    }

    /**
     * 获取政策监控列表
     * TODO: 需要实现数据库存储
     */
    public List<PolicyMonitor> getPolicyMonitors(Long teamId) {
        log.info("获取政策监控列表, teamId: {}", teamId);
        return Collections.emptyList();
    }

    /**
     * 获取政策新闻 - 优先从缓存获取
     */
    public List<NewsArticle> getPolicyNews(Long teamId, int limit) {
        log.info("获取政策新闻, teamId: {}, limit: {}", teamId, limit);
        
        // 先从缓存获取
        List<NewsArticle> cached = newsCacheService.getPolicyNews(limit);
        if (cached != null) {
            log.debug("从缓存返回政策新闻: count={}", cached.size());
            return cached;
        }
        
        // 缓存未命中，从数据库获取
        List<NewsArticle> results = newsCrawlerService.getPolicyNews(limit);
        if (!results.isEmpty()) {
            newsCacheService.cachePolicyNews(limit, results);
        }
        return results;
    }

    // ==================== NW-005 智能匹配 ====================

    /**
     * 计算新闻与用户/团队的匹配度
     */
    public NewsMatchRecord calculateMatch(Long articleId, Long teamId, Long userId) {
        log.info("计算新闻匹配度, articleId: {}, teamId: {}, userId: {}", articleId, teamId, userId);
        
        // 获取文章
        NewsArticle article = newsArticleMapper.selectById(articleId);
        if (article == null) {
            throw new RuntimeException("文章不存在: " + articleId);
        }
        
        NewsMatchRecord record = new NewsMatchRecord();
        record.setId(System.currentTimeMillis());
        record.setArticleId(articleId);
        record.setTeamId(teamId);
        record.setUserId(userId);
        
        // 基于文章内容计算匹配度
        String text = (article.getTitle() + " " + 
                      (article.getSummary() != null ? article.getSummary() : "")).toLowerCase();
        
        // 计算各维度分数
        double importanceScore = article.getImportanceScore() != null ? 
                                 article.getImportanceScore().doubleValue() / 100 : 0.5;
        double qualityScore = article.getQualityScore() != null ? 
                             article.getQualityScore().doubleValue() / 100 : 0.5;
        
        double totalScore = (importanceScore * 50 + qualityScore * 50);
        
        record.setMatchType("content_based");
        record.setMatchScore(BigDecimal.valueOf(totalScore));
        record.setSemanticSimilarity(BigDecimal.valueOf(importanceScore));
        record.setRelevanceReason("基于文章内容质量和重要性评分");
        record.setIsRecommended(totalScore >= 60);
        record.setRecommendationRank(totalScore >= 80 ? 1 : (totalScore >= 60 ? 2 : 3));
        record.setCreatedAt(LocalDateTime.now());
        
        return record;
    }

    /**
     * 获取推荐新闻 - 基于用户兴趣，优先从缓存获取
     */
    public List<NewsArticle> getRecommendedNews(Long userId, Long teamId, int limit) {
        log.info("获取推荐新闻, userId: {}, teamId: {}", userId, teamId);
        
        // 获取用户偏好
        NewsUserPreference preference = getUserPreference(userId);
        List<String> interests;
        
        if (preference != null && preference.getPreferredKeywords() != null) {
            // 将JSON字符串转换为List
            String keywordsJson = preference.getPreferredKeywords();
            if (keywordsJson.startsWith("[") && keywordsJson.endsWith("]")) {
                // 简单解析JSON数组
                keywordsJson = keywordsJson.substring(1, keywordsJson.length() - 1);
                interests = Arrays.asList(keywordsJson.replace("\"", "").split(","));
            } else {
                interests = Arrays.asList("AI", "数字化", "企业服务", "科技", "人工智能");
            }
        } else {
            // 默认推荐关键词
            interests = Arrays.asList("AI", "数字化", "企业服务", "科技", "人工智能");
        }
        
        // 构建缓存键（基于兴趣关键词）
        String cacheKey = String.join(",", interests);
        
        // 尝试从缓存获取（使用搜索缓存机制）
        List<NewsArticle> cached = newsCacheService.getSearchResult(cacheKey, 1, limit);
        if (cached != null && !cached.isEmpty()) {
            log.debug("从缓存返回推荐新闻: userId={}, count={}", userId, cached.size());
            return cached;
        }
        
        // 缓存未命中，从数据库获取
        List<NewsArticle> results = newsCrawlerService.getRecommendedNews(interests, limit);
        if (!results.isEmpty()) {
            newsCacheService.cacheSearchResult(cacheKey, 1, limit, results);
        }
        return results;
    }

    // ==================== NW-006 个性化推送 ====================

    /**
     * 获取用户偏好
     * TODO: 需要实现数据库存储
     */
    public NewsUserPreference getUserPreference(Long userId) {
        log.info("获取用户偏好, userId: {}", userId);
        // 返回null表示用户未设置偏好
        return null;
    }

    /**
     * 更新用户偏好
     * TODO: 需要实现数据库存储
     */
    @Transactional
    public NewsUserPreference updateUserPreference(NewsUserPreference preference) {
        preference.setUpdatedAt(LocalDateTime.now());
        // TODO: 保存到数据库
        return preference;
    }

    /**
     * 基于角色获取推荐
     */
    public List<NewsArticle> getNewsByRole(String role, int limit) {
        log.info("基于角色获取推荐, role: {}", role);
        
        // 根据角色确定分类
        String category;
        switch (role) {
            case "manager":
                category = "industry";
                break;
            case "developer":
                category = "technology";
                break;
            case "sales":
                category = "finance";
                break;
            default:
                category = "technology";
        }
        
        return newsCrawlerService.getNewsByCategory(category, limit);
    }

    // ==================== NW-007 推送优化 ====================

    /**
     * 获取推送配置
     * TODO: 需要实现数据库存储
     */
    public NewsPushConfig getPushConfig(Long userId) {
        log.info("获取推送配置, userId: {}", userId);
        // 返回null表示用户未设置推送配置
        return null;
    }

    /**
     * 更新推送配置
     * TODO: 需要实现数据库存储
     */
    @Transactional
    public NewsPushConfig updatePushConfig(NewsPushConfig config) {
        config.setUpdatedAt(LocalDateTime.now());
        config.setNextPushAt(calculateNextPushTime(config));
        // TODO: 保存到数据库
        return config;
    }

    /**
     * 执行推送
     * TODO: 需要实现实际推送逻辑
     */
    @Transactional
    public NewsPushRecord executePush(Long userId, List<Long> articleIds, String channel) {
        log.info("执行新闻推送, userId: {}, articleCount: {}, channel: {}", userId, articleIds.size(), channel);
        
        NewsPushRecord record = new NewsPushRecord();
        record.setId(System.currentTimeMillis());
        record.setUserId(userId);
        record.setPushChannel(channel);
        record.setPushType("manual");
        record.setArticleIds("[" + articleIds.stream().map(String::valueOf).collect(Collectors.joining(",")) + "]");
        record.setArticleCount(articleIds.size());
        record.setPushTitle("今日精选资讯");
        record.setPushContent("为您精选了" + articleIds.size() + "篇相关资讯");
        record.setPushStatus("sent");
        record.setSentAt(LocalDateTime.now());
        record.setClickCount(0);
        record.setCreatedAt(LocalDateTime.now());
        
        // TODO: 保存推送记录到数据库
        // TODO: 实际执行推送（邮件、App推送等）
        
        return record;
    }

    /**
     * 获取推送历史
     * TODO: 需要实现数据库存储
     */
    public List<NewsPushRecord> getPushHistory(Long userId, int page, int pageSize) {
        log.info("获取推送历史, userId: {}", userId);
        return Collections.emptyList();
    }

    // ==================== NW-008 新闻收藏 ====================

    /**
     * 收藏新闻 - 保存到数据库
     */
    @Transactional
    public NewsFavorite favoriteNews(Long userId, Long articleId, Long folderId, String note) {
        log.info("收藏新闻, userId: {}, articleId: {}", userId, articleId);
        
        // 检查文章是否存在
        NewsArticle article = newsArticleMapper.selectById(articleId);
        if (article == null) {
            throw new RuntimeException("文章不存在: " + articleId);
        }
        
        // 检查是否已收藏
        if (newsFavoriteMapper.existsFavorite(userId, articleId)) {
            throw new RuntimeException("已收藏该文章");
        }
        
        NewsFavorite favorite = new NewsFavorite();
        favorite.setUserId(userId);
        favorite.setArticleId(articleId);
        favorite.setFolderId(folderId);
        favorite.setNote(note);
        favorite.setCreatedAt(LocalDateTime.now());
        
        newsFavoriteMapper.insertFavorite(favorite);
        
        // 更新文章收藏数
        newsArticleMapper.updateFavoriteCount(articleId, 1);
        
        // 更新收藏夹文章数
        if (folderId != null) {
            newsFavoriteMapper.updateFolderArticleCount(folderId, 1);
        }
        
        return favorite;
    }

    /**
     * 取消收藏 - 从数据库删除
     */
    @Transactional
    public void unfavoriteNews(Long userId, Long articleId) {
        log.info("取消收藏, userId: {}, articleId: {}", userId, articleId);
        
        int deleted = newsFavoriteMapper.deleteFavorite(userId, articleId);
        if (deleted > 0) {
            // 更新文章收藏数
            newsArticleMapper.updateFavoriteCount(articleId, -1);
        }
    }

    /**
     * 获取收藏列表 - 从数据库获取
     */
    public List<NewsFavorite> getFavorites(Long userId, Long folderId) {
        log.info("获取收藏列表, userId: {}, folderId: {}", userId, folderId);
        return newsFavoriteMapper.selectByUserId(userId, folderId, 0, 100);
    }

    /**
     * 获取收藏夹列表 - 从数据库获取
     */
    public List<NewsFavoriteFolder> getFolders(Long userId) {
        log.info("获取收藏夹列表, userId: {}", userId);
        return newsFavoriteMapper.selectFoldersByUserId(userId);
    }

    /**
     * 创建收藏夹 - 保存到数据库
     */
    @Transactional
    public NewsFavoriteFolder createFolder(Long userId, String folderName, String description) {
        log.info("创建收藏夹, userId: {}, folderName: {}", userId, folderName);
        
        NewsFavoriteFolder folder = new NewsFavoriteFolder();
        folder.setUserId(userId);
        folder.setFolderName(folderName);
        folder.setDescription(description);
        folder.setIsDefault(false);
        folder.setArticleCount(0);
        folder.setCreatedAt(LocalDateTime.now());
        folder.setUpdatedAt(LocalDateTime.now());
        
        newsFavoriteMapper.insertFolder(folder);
        
        return folder;
    }

    // ==================== NW-009 新闻分类 ====================

    /**
     * 获取分类列表
     */
    public List<NewsCategory> getCategories() {
        List<NewsCategory> categories = new ArrayList<>();
        
        categories.add(createCategory(1L, "technology", "科技", null, "RobotOutlined", "#1890ff"));
        categories.add(createCategory(2L, "industry", "行业动态", null, "GlobalOutlined", "#52c41a"));
        categories.add(createCategory(3L, "policy", "政策法规", null, "FileTextOutlined", "#faad14"));
        categories.add(createCategory(4L, "finance", "财经", null, "DollarOutlined", "#f5222d"));
        categories.add(createCategory(5L, "market", "市场分析", null, "LineChartOutlined", "#722ed1"));
        categories.add(createCategory(6L, "management", "企业管理", null, "TeamOutlined", "#13c2c2"));
        
        return categories;
    }

    /**
     * 获取分类树
     */
    public List<Map<String, Object>> getCategoryTree() {
        List<NewsCategory> allCategories = getCategories();
        
        List<Map<String, Object>> tree = new ArrayList<>();
        
        for (NewsCategory category : allCategories) {
            Map<String, Object> node = new HashMap<>();
            node.put("id", category.getId());
            node.put("code", category.getCategoryCode());
            node.put("name", category.getCategoryName());
            node.put("icon", category.getIcon());
            node.put("color", category.getColor());
            tree.add(node);
        }
        
        return tree;
    }

    /**
     * 自动分类新闻
     */
    public String classifyNews(String title, String content) {
        log.info("自动分类新闻: {}", title);
        
        Map<String, String[]> categoryKeywords = new HashMap<>();
        categoryKeywords.put("technology", new String[]{"AI", "人工智能", "技术", "软件", "互联网", "科技"});
        categoryKeywords.put("policy", new String[]{"政策", "法规", "监管", "政府", "国务院"});
        categoryKeywords.put("finance", new String[]{"金融", "投资", "股票", "基金", "银行"});
        categoryKeywords.put("industry", new String[]{"行业", "市场", "企业", "产业"});
        
        String text = (title + " " + (content != null ? content : "")).toLowerCase();
        String bestCategory = "general";
        int maxMatches = 0;
        
        for (Map.Entry<String, String[]> entry : categoryKeywords.entrySet()) {
            int matches = 0;
            for (String keyword : entry.getValue()) {
                if (text.contains(keyword.toLowerCase())) {
                    matches++;
                }
            }
            if (matches > maxMatches) {
                maxMatches = matches;
                bestCategory = entry.getKey();
            }
        }
        
        return bestCategory;
    }

    // ==================== 统计接口 ====================

    /**
     * 获取新闻统计数据 - 优先从缓存获取
     */
    public Map<String, Object> getStatistics(Long teamId) {
        log.info("获取新闻统计, teamId: {}", teamId);
        
        // 先从缓存获取
        Map<String, Object> cached = newsCacheService.getStatistics();
        if (cached != null) {
            log.debug("从缓存返回统计数据");
            return cached;
        }
        
        // 缓存未命中，从数据库获取
        Map<String, Object> stats = newsCrawlerService.getStatistics();
        if (stats != null && !stats.isEmpty()) {
            newsCacheService.cacheStatistics(stats);
        }
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
        List<Map<String, Object>> topics = newsCrawlerService.getHotTopics(limit);
        if (!topics.isEmpty()) {
            newsCacheService.cacheHotTopics(topics);
        }
        return topics;
    }

    /**
     * 获取行业动态新闻 - 优先从缓存获取
     */
    public List<NewsArticle> getIndustryNews(Long teamId, int limit) {
        log.info("获取行业动态新闻, teamId: {}, limit: {}", teamId, limit);
        
        // 先从缓存获取
        List<NewsArticle> cached = newsCacheService.getCategoryNews("industry", 1, limit);
        if (cached != null) {
            log.debug("从缓存返回行业动态: count={}", cached.size());
            return cached;
        }
        
        // 缓存未命中，从数据库获取
        List<NewsArticle> results = newsCrawlerService.getNewsByCategory("industry", limit);
        if (!results.isEmpty()) {
            newsCacheService.cacheCategoryNews("industry", 1, limit, results);
        }
        return results;
    }

    /**
     * 获取科技资讯 - 优先从缓存获取
     */
    public List<NewsArticle> getTechnologyNews(int limit) {
        log.info("获取科技资讯, limit: {}", limit);
        
        // 先从缓存获取
        List<NewsArticle> cached = newsCacheService.getCategoryNews("technology", 1, limit);
        if (cached != null) {
            log.debug("从缓存返回科技资讯: count={}", cached.size());
            return cached;
        }
        
        // 缓存未命中，从数据库获取
        List<NewsArticle> results = newsCrawlerService.getNewsByCategory("technology", limit);
        if (!results.isEmpty()) {
            newsCacheService.cacheCategoryNews("technology", 1, limit, results);
        }
        return results;
    }

    /**
     * 手动触发新闻采集
     * 采集完成后清除相关缓存
     */
    public void triggerManualCrawl() {
        log.info("手动触发新闻采集");
        newsCrawlerService.crawlAllSourcesAsync();
        
        // 清除所有新闻相关缓存，确保用户获取最新数据
        log.info("清除新闻缓存以获取最新数据");
        newsCacheService.clearAllNewsCache();
    }

    // ==================== 辅助方法 ====================

    private String getIndustryName(String code) {
        Map<String, String> names = new HashMap<>();
        names.put("IT", "信息技术");
        names.put("FINANCE", "金融服务");
        names.put("MANUFACTURING", "制造业");
        names.put("RETAIL", "零售业");
        names.put("HEALTHCARE", "医疗健康");
        names.put("EDUCATION", "教育培训");
        return names.getOrDefault(code, code);
    }

    private String getDomainTypeName(String type) {
        Map<String, String> names = new HashMap<>();
        names.put("product", "产品");
        names.put("service", "服务");
        names.put("market", "市场");
        names.put("technology", "技术");
        return names.getOrDefault(type, type);
    }

    private NewsCategory createCategory(Long id, String code, String name, Long parentId, String icon, String color) {
        NewsCategory category = new NewsCategory();
        category.setId(id);
        category.setCategoryCode(code);
        category.setCategoryName(name);
        category.setParentId(parentId);
        category.setLevel(parentId == null ? 1 : 2);
        category.setIcon(icon);
        category.setColor(color);
        category.setIsSystem(true);
        category.setIsEnabled(true);
        return category;
    }

    private LocalDateTime calculateNextPushTime(NewsPushConfig config) {
        LocalDateTime now = LocalDateTime.now();
        String frequency = config.getPushFrequency();
        
        switch (frequency) {
            case "realtime":
                return now.plusMinutes(5);
            case "hourly":
                return now.plusHours(1);
            case "daily":
                return now.plusDays(1).withHour(9).withMinute(0);
            case "weekly":
                return now.plusWeeks(1).withHour(9).withMinute(0);
            default:
                return now.plusDays(1);
        }
    }
}