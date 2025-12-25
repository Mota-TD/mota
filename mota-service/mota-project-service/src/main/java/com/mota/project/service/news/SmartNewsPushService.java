package com.mota.project.service.news;

import com.mota.project.entity.news.*;
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
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SmartNewsPushService {

    // ==================== NW-001 行业识别 ====================

    /**
     * 自动识别企业行业
     */
    public List<EnterpriseIndustry> detectIndustry(Long teamId, String companyDescription) {
        log.info("开始识别企业行业, teamId: {}", teamId);
        
        List<EnterpriseIndustry> industries = new ArrayList<>();
        
        // 模拟AI行业识别逻辑
        Map<String, String[]> industryKeywords = new HashMap<>();
        industryKeywords.put("IT", new String[]{"软件", "互联网", "科技", "技术", "开发", "系统", "平台", "数字化"});
        industryKeywords.put("FINANCE", new String[]{"金融", "银行", "保险", "投资", "证券", "基金", "理财"});
        industryKeywords.put("MANUFACTURING", new String[]{"制造", "生产", "工厂", "设备", "机械", "加工"});
        industryKeywords.put("RETAIL", new String[]{"零售", "电商", "商城", "销售", "门店", "消费"});
        industryKeywords.put("HEALTHCARE", new String[]{"医疗", "健康", "医院", "药品", "医药", "诊断"});
        industryKeywords.put("EDUCATION", new String[]{"教育", "培训", "学校", "课程", "学习", "教学"});
        
        for (Map.Entry<String, String[]> entry : industryKeywords.entrySet()) {
            int matchCount = 0;
            for (String keyword : entry.getValue()) {
                if (companyDescription != null && companyDescription.contains(keyword)) {
                    matchCount++;
                }
            }
            
            if (matchCount > 0) {
                EnterpriseIndustry industry = new EnterpriseIndustry();
                industry.setTeamId(teamId);
                industry.setIndustryCode(entry.getKey());
                industry.setIndustryName(getIndustryName(entry.getKey()));
                industry.setConfidence(BigDecimal.valueOf(Math.min(100, matchCount * 20)));
                industry.setIsAutoDetected(true);
                industry.setDetectionSource("ai");
                industry.setKeywords("[\"" + String.join("\",\"", entry.getValue()) + "\"]");
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
     */
    public List<EnterpriseIndustry> getTeamIndustries(Long teamId) {
        // 模拟返回数据
        List<EnterpriseIndustry> industries = new ArrayList<>();
        
        EnterpriseIndustry primary = new EnterpriseIndustry();
        primary.setId(1L);
        primary.setTeamId(teamId);
        primary.setIndustryCode("IT");
        primary.setIndustryName("信息技术");
        primary.setConfidence(BigDecimal.valueOf(95));
        primary.setIsPrimary(true);
        primary.setIsAutoDetected(true);
        primary.setKeywords("[\"软件\",\"互联网\",\"科技\"]");
        industries.add(primary);
        
        EnterpriseIndustry secondary = new EnterpriseIndustry();
        secondary.setId(2L);
        secondary.setTeamId(teamId);
        secondary.setIndustryCode("FINANCE");
        secondary.setIndustryName("金融服务");
        secondary.setConfidence(BigDecimal.valueOf(75));
        secondary.setIsPrimary(false);
        secondary.setIsAutoDetected(true);
        secondary.setKeywords("[\"金融\",\"投资\"]");
        industries.add(secondary);
        
        return industries;
    }

    /**
     * 保存行业配置
     */
    @Transactional
    public EnterpriseIndustry saveIndustry(EnterpriseIndustry industry) {
        industry.setCreatedAt(LocalDateTime.now());
        industry.setUpdatedAt(LocalDateTime.now());
        // 实际应保存到数据库
        industry.setId(System.currentTimeMillis());
        return industry;
    }

    // ==================== NW-002 业务理解 ====================

    /**
     * 提取企业关键业务领域
     */
    public List<BusinessDomain> extractBusinessDomains(Long teamId, String businessDescription) {
        log.info("开始提取业务领域, teamId: {}", teamId);
        
        List<BusinessDomain> domains = new ArrayList<>();
        
        // 模拟AI业务领域提取
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
                if (businessDescription != null && businessDescription.contains(keyword)) {
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
     */
    public List<BusinessDomain> getTeamBusinessDomains(Long teamId) {
        List<BusinessDomain> domains = new ArrayList<>();
        
        BusinessDomain domain1 = new BusinessDomain();
        domain1.setId(1L);
        domain1.setTeamId(teamId);
        domain1.setDomainName("企业级SaaS产品");
        domain1.setDomainType("product");
        domain1.setKeywords("[\"SaaS\",\"企业服务\",\"协同办公\"]");
        domain1.setImportance(10);
        domain1.setIsCore(true);
        domains.add(domain1);
        
        BusinessDomain domain2 = new BusinessDomain();
        domain2.setId(2L);
        domain2.setTeamId(teamId);
        domain2.setDomainName("AI技术研发");
        domain2.setDomainType("technology");
        domain2.setKeywords("[\"人工智能\",\"机器学习\",\"NLP\"]");
        domain2.setImportance(8);
        domain2.setIsCore(true);
        domains.add(domain2);
        
        return domains;
    }

    // ==================== NW-003 新闻采集 ====================

    /**
     * 获取新闻数据源列表
     */
    public List<NewsDataSource> getDataSources() {
        List<NewsDataSource> sources = new ArrayList<>();
        
        sources.add(createDataSource(1L, "36氪", "rss", "technology", 90));
        sources.add(createDataSource(2L, "虎嗅", "rss", "technology", 88));
        sources.add(createDataSource(3L, "钛媒体", "rss", "technology", 85));
        sources.add(createDataSource(4L, "亿欧网", "api", "industry", 82));
        sources.add(createDataSource(5L, "艾瑞咨询", "crawler", "market", 90));
        sources.add(createDataSource(6L, "国务院政策", "crawler", "policy", 100));
        
        return sources;
    }

    /**
     * 采集新闻
     */
    public List<NewsArticle> crawlNews(Long sourceId) {
        log.info("开始采集新闻, sourceId: {}", sourceId);
        
        List<NewsArticle> articles = new ArrayList<>();
        
        // 模拟采集的新闻
        for (int i = 1; i <= 5; i++) {
            NewsArticle article = new NewsArticle();
            article.setId((long) i);
            article.setSourceId(sourceId);
            article.setTitle("AI技术最新进展：大模型应用场景持续拓展 " + i);
            article.setContent("随着人工智能技术的快速发展，大模型在各行业的应用场景不断拓展...");
            article.setSummary("本文介绍了AI大模型在企业服务、医疗健康、金融科技等领域的最新应用进展。");
            article.setAuthor("科技观察员");
            article.setSourceName("36氪");
            article.setSourceUrl("https://36kr.com/article/" + i);
            article.setCategory("technology");
            article.setTags("[\"AI\",\"大模型\",\"企业服务\"]");
            article.setKeywords("[\"人工智能\",\"GPT\",\"应用场景\"]");
            article.setPublishTime(LocalDateTime.now().minusHours(i));
            article.setCrawlTime(LocalDateTime.now());
            article.setWordCount(1500);
            article.setReadTime(300);
            article.setSentiment("positive");
            article.setSentimentScore(BigDecimal.valueOf(0.85));
            article.setImportanceScore(BigDecimal.valueOf(85));
            article.setQualityScore(BigDecimal.valueOf(90));
            article.setStatus("active");
            articles.add(article);
        }
        
        return articles;
    }

    /**
     * 搜索新闻
     */
    public List<NewsArticle> searchNews(String keyword, String category, int page, int pageSize) {
        log.info("搜索新闻, keyword: {}, category: {}", keyword, category);
        
        List<NewsArticle> articles = new ArrayList<>();
        
        // 模拟搜索结果
        for (int i = 1; i <= pageSize; i++) {
            NewsArticle article = new NewsArticle();
            article.setId((long) ((page - 1) * pageSize + i));
            article.setTitle("关于\"" + keyword + "\"的最新报道 " + i);
            article.setSummary("这是一篇关于" + keyword + "的深度分析文章...");
            article.setSourceName("科技媒体");
            article.setCategory(category != null ? category : "technology");
            article.setPublishTime(LocalDateTime.now().minusDays(i));
            article.setViewCount(1000 + i * 100);
            article.setImportanceScore(BigDecimal.valueOf(80 + Math.random() * 20));
            articles.add(article);
        }
        
        return articles;
    }

    // ==================== NW-004 政策监控 ====================

    /**
     * 创建政策监控
     */
    @Transactional
    public PolicyMonitor createPolicyMonitor(PolicyMonitor monitor) {
        monitor.setId(System.currentTimeMillis());
        monitor.setIsEnabled(true);
        monitor.setAlertEnabled(true);
        monitor.setMatchedCount(0);
        monitor.setCreatedAt(LocalDateTime.now());
        monitor.setUpdatedAt(LocalDateTime.now());
        return monitor;
    }

    /**
     * 获取政策监控列表
     */
    public List<PolicyMonitor> getPolicyMonitors(Long teamId) {
        List<PolicyMonitor> monitors = new ArrayList<>();
        
        PolicyMonitor monitor1 = new PolicyMonitor();
        monitor1.setId(1L);
        monitor1.setTeamId(teamId);
        monitor1.setMonitorName("数字经济政策");
        monitor1.setPolicyTypes("[\"产业政策\",\"扶持政策\"]");
        monitor1.setPolicyLevels("[\"national\",\"provincial\"]");
        monitor1.setKeywords("[\"数字经济\",\"数字化转型\",\"智能制造\"]");
        monitor1.setIsEnabled(true);
        monitor1.setAlertEnabled(true);
        monitor1.setMatchedCount(15);
        monitor1.setLastCheckAt(LocalDateTime.now().minusHours(1));
        monitors.add(monitor1);
        
        PolicyMonitor monitor2 = new PolicyMonitor();
        monitor2.setId(2L);
        monitor2.setTeamId(teamId);
        monitor2.setMonitorName("AI行业监管");
        monitor2.setPolicyTypes("[\"监管政策\",\"行业规范\"]");
        monitor2.setPolicyLevels("[\"national\"]");
        monitor2.setKeywords("[\"人工智能\",\"算法监管\",\"数据安全\"]");
        monitor2.setIsEnabled(true);
        monitor2.setAlertEnabled(true);
        monitor2.setMatchedCount(8);
        monitor2.setLastCheckAt(LocalDateTime.now().minusHours(2));
        monitors.add(monitor2);
        
        return monitors;
    }

    /**
     * 获取政策新闻
     */
    public List<NewsArticle> getPolicyNews(Long teamId, int limit) {
        List<NewsArticle> policies = new ArrayList<>();
        
        for (int i = 1; i <= limit; i++) {
            NewsArticle article = new NewsArticle();
            article.setId((long) i);
            article.setTitle("国务院发布关于促进数字经济发展的指导意见 " + i);
            article.setSummary("为加快数字经济发展，推动数字技术与实体经济深度融合...");
            article.setSourceName("中国政府网");
            article.setCategory("policy");
            article.setIsPolicy(true);
            article.setPolicyLevel("national");
            article.setPolicyType("产业政策");
            article.setPublishTime(LocalDateTime.now().minusDays(i));
            article.setImportanceScore(BigDecimal.valueOf(95));
            policies.add(article);
        }
        
        return policies;
    }

    // ==================== NW-005 智能匹配 ====================

    /**
     * 计算新闻与用户/团队的匹配度
     */
    public NewsMatchRecord calculateMatch(Long articleId, Long teamId, Long userId) {
        log.info("计算新闻匹配度, articleId: {}, teamId: {}, userId: {}", articleId, teamId, userId);
        
        NewsMatchRecord record = new NewsMatchRecord();
        record.setId(System.currentTimeMillis());
        record.setArticleId(articleId);
        record.setTeamId(teamId);
        record.setUserId(userId);
        
        // 模拟匹配计算
        double industryScore = 0.3 + Math.random() * 0.3;
        double keywordScore = 0.2 + Math.random() * 0.3;
        double semanticScore = 0.4 + Math.random() * 0.4;
        
        double totalScore = (industryScore * 30 + keywordScore * 30 + semanticScore * 40);
        
        record.setMatchType("semantic");
        record.setMatchScore(BigDecimal.valueOf(totalScore));
        record.setSemanticSimilarity(BigDecimal.valueOf(semanticScore));
        record.setMatchedKeywords("[\"AI\",\"企业服务\",\"数字化\"]");
        record.setMatchedIndustries("[\"IT\",\"金融\"]");
        record.setRelevanceReason("该新闻与您关注的AI技术和企业服务领域高度相关");
        record.setIsRecommended(totalScore >= 70);
        record.setRecommendationRank(totalScore >= 90 ? 1 : (totalScore >= 80 ? 2 : 3));
        record.setCreatedAt(LocalDateTime.now());
        
        return record;
    }

    /**
     * 获取推荐新闻
     */
    public List<NewsArticle> getRecommendedNews(Long userId, Long teamId, int limit) {
        log.info("获取推荐新闻, userId: {}, teamId: {}", userId, teamId);
        
        List<NewsArticle> articles = new ArrayList<>();
        
        for (int i = 1; i <= limit; i++) {
            NewsArticle article = new NewsArticle();
            article.setId((long) i);
            article.setTitle("为您推荐：企业数字化转型最佳实践 " + i);
            article.setSummary("基于您的阅读偏好和企业行业特征，为您精选的相关资讯...");
            article.setSourceName("行业观察");
            article.setCategory("industry");
            article.setPublishTime(LocalDateTime.now().minusHours(i * 2));
            article.setImportanceScore(BigDecimal.valueOf(95 - i * 3));
            article.setQualityScore(BigDecimal.valueOf(90));
            articles.add(article);
        }
        
        return articles;
    }

    // ==================== NW-006 个性化推送 ====================

    /**
     * 获取用户偏好
     */
    public NewsUserPreference getUserPreference(Long userId) {
        NewsUserPreference preference = new NewsUserPreference();
        preference.setId(1L);
        preference.setUserId(userId);
        preference.setPreferredCategories("[\"technology\",\"industry\",\"policy\"]");
        preference.setPreferredSources("[\"36氪\",\"虎嗅\",\"钛媒体\"]");
        preference.setPreferredKeywords("[\"AI\",\"SaaS\",\"数字化\"]");
        preference.setBlockedKeywords("[\"娱乐\",\"八卦\"]");
        preference.setInterestIndustries("[\"IT\",\"金融\"]");
        preference.setInterestTopics("[\"人工智能\",\"企业服务\",\"云计算\"]");
        preference.setReadingLevel("normal");
        preference.setContentLanguage("zh");
        preference.setMinQualityScore(BigDecimal.valueOf(60));
        return preference;
    }

    /**
     * 更新用户偏好
     */
    @Transactional
    public NewsUserPreference updateUserPreference(NewsUserPreference preference) {
        preference.setUpdatedAt(LocalDateTime.now());
        return preference;
    }

    /**
     * 基于角色获取推荐
     */
    public List<NewsArticle> getNewsByRole(String role, int limit) {
        List<NewsArticle> articles = new ArrayList<>();
        
        Map<String, String[]> roleCategories = new HashMap<>();
        roleCategories.put("manager", new String[]{"management", "strategy", "industry"});
        roleCategories.put("developer", new String[]{"technology", "development", "tools"});
        roleCategories.put("sales", new String[]{"market", "customer", "trends"});
        
        String[] categories = roleCategories.getOrDefault(role, new String[]{"general"});
        
        for (int i = 1; i <= limit; i++) {
            NewsArticle article = new NewsArticle();
            article.setId((long) i);
            article.setTitle("适合" + role + "角色的资讯 " + i);
            article.setCategory(categories[i % categories.length]);
            article.setPublishTime(LocalDateTime.now().minusHours(i));
            articles.add(article);
        }
        
        return articles;
    }

    // ==================== NW-007 推送优化 ====================

    /**
     * 获取推送配置
     */
    public NewsPushConfig getPushConfig(Long userId) {
        NewsPushConfig config = new NewsPushConfig();
        config.setId(1L);
        config.setUserId(userId);
        config.setPushEnabled(true);
        config.setPushChannels("[\"email\",\"app\"]");
        config.setPushFrequency("daily");
        config.setPushTime("09:00");
        config.setPushDays("[1,2,3,4,5]");
        config.setTimezone("Asia/Shanghai");
        config.setMaxArticlesPerPush(10);
        config.setMinMatchScore(BigDecimal.valueOf(70));
        config.setIncludeSummary(true);
        config.setIncludeImage(true);
        config.setQuietHoursStart("22:00");
        config.setQuietHoursEnd("08:00");
        config.setLastPushAt(LocalDateTime.now().minusDays(1));
        config.setNextPushAt(LocalDateTime.now().plusDays(1).withHour(9).withMinute(0));
        return config;
    }

    /**
     * 更新推送配置
     */
    @Transactional
    public NewsPushConfig updatePushConfig(NewsPushConfig config) {
        config.setUpdatedAt(LocalDateTime.now());
        // 计算下次推送时间
        config.setNextPushAt(calculateNextPushTime(config));
        return config;
    }

    /**
     * 执行推送
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
        
        return record;
    }

    /**
     * 获取推送历史
     */
    public List<NewsPushRecord> getPushHistory(Long userId, int page, int pageSize) {
        List<NewsPushRecord> records = new ArrayList<>();
        
        for (int i = 1; i <= pageSize; i++) {
            NewsPushRecord record = new NewsPushRecord();
            record.setId((long) ((page - 1) * pageSize + i));
            record.setUserId(userId);
            record.setPushChannel("email");
            record.setPushType("scheduled");
            record.setArticleCount(10);
            record.setPushTitle("每日精选资讯");
            record.setPushStatus("sent");
            record.setSentAt(LocalDateTime.now().minusDays(i));
            record.setOpenedAt(i % 2 == 0 ? LocalDateTime.now().minusDays(i).plusHours(1) : null);
            record.setClickCount(i * 2);
            records.add(record);
        }
        
        return records;
    }

    // ==================== NW-008 新闻收藏 ====================

    /**
     * 收藏新闻
     */
    @Transactional
    public NewsFavorite favoriteNews(Long userId, Long articleId, Long folderId, String note) {
        NewsFavorite favorite = new NewsFavorite();
        favorite.setId(System.currentTimeMillis());
        favorite.setUserId(userId);
        favorite.setArticleId(articleId);
        favorite.setFolderId(folderId);
        favorite.setNote(note);
        favorite.setCreatedAt(LocalDateTime.now());
        return favorite;
    }

    /**
     * 取消收藏
     */
    @Transactional
    public void unfavoriteNews(Long userId, Long articleId) {
        log.info("取消收藏, userId: {}, articleId: {}", userId, articleId);
    }

    /**
     * 获取收藏列表
     */
    public List<NewsFavorite> getFavorites(Long userId, Long folderId) {
        List<NewsFavorite> favorites = new ArrayList<>();
        
        for (int i = 1; i <= 5; i++) {
            NewsFavorite favorite = new NewsFavorite();
            favorite.setId((long) i);
            favorite.setUserId(userId);
            favorite.setArticleId((long) (i * 10));
            favorite.setFolderId(folderId);
            favorite.setNote("重要资讯 " + i);
            favorite.setTags("[\"AI\",\"重要\"]");
            favorite.setCreatedAt(LocalDateTime.now().minusDays(i));
            favorites.add(favorite);
        }
        
        return favorites;
    }

    /**
     * 获取收藏夹列表
     */
    public List<NewsFavoriteFolder> getFolders(Long userId) {
        List<NewsFavoriteFolder> folders = new ArrayList<>();
        
        NewsFavoriteFolder defaultFolder = new NewsFavoriteFolder();
        defaultFolder.setId(1L);
        defaultFolder.setUserId(userId);
        defaultFolder.setFolderName("默认收藏夹");
        defaultFolder.setIsDefault(true);
        defaultFolder.setArticleCount(15);
        folders.add(defaultFolder);
        
        NewsFavoriteFolder techFolder = new NewsFavoriteFolder();
        techFolder.setId(2L);
        techFolder.setUserId(userId);
        techFolder.setFolderName("技术文章");
        techFolder.setIsDefault(false);
        techFolder.setArticleCount(8);
        folders.add(techFolder);
        
        NewsFavoriteFolder policyFolder = new NewsFavoriteFolder();
        policyFolder.setId(3L);
        policyFolder.setUserId(userId);
        policyFolder.setFolderName("政策法规");
        policyFolder.setIsDefault(false);
        policyFolder.setArticleCount(5);
        folders.add(policyFolder);
        
        return folders;
    }

    /**
     * 创建收藏夹
     */
    @Transactional
    public NewsFavoriteFolder createFolder(Long userId, String folderName, String description) {
        NewsFavoriteFolder folder = new NewsFavoriteFolder();
        folder.setId(System.currentTimeMillis());
        folder.setUserId(userId);
        folder.setFolderName(folderName);
        folder.setDescription(description);
        folder.setIsDefault(false);
        folder.setArticleCount(0);
        folder.setCreatedAt(LocalDateTime.now());
        folder.setUpdatedAt(LocalDateTime.now());
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
        
        // 子分类
        categories.add(createCategory(7L, "tech_ai", "人工智能", 1L, null, null));
        categories.add(createCategory(8L, "tech_cloud", "云计算", 1L, null, null));
        categories.add(createCategory(9L, "tech_bigdata", "大数据", 1L, null, null));
        
        return categories;
    }

    /**
     * 获取分类树
     */
    public List<Map<String, Object>> getCategoryTree() {
        List<NewsCategory> allCategories = getCategories();
        
        // 构建树形结构
        List<Map<String, Object>> tree = new ArrayList<>();
        
        for (NewsCategory category : allCategories) {
            if (category.getParentId() == null || category.getParentId() == 0) {
                Map<String, Object> node = new HashMap<>();
                node.put("id", category.getId());
                node.put("code", category.getCategoryCode());
                node.put("name", category.getCategoryName());
                node.put("icon", category.getIcon());
                node.put("color", category.getColor());
                
                // 查找子分类
                List<Map<String, Object>> children = new ArrayList<>();
                for (NewsCategory child : allCategories) {
                    if (category.getId().equals(child.getParentId())) {
                        Map<String, Object> childNode = new HashMap<>();
                        childNode.put("id", child.getId());
                        childNode.put("code", child.getCategoryCode());
                        childNode.put("name", child.getCategoryName());
                        children.add(childNode);
                    }
                }
                
                if (!children.isEmpty()) {
                    node.put("children", children);
                }
                
                tree.add(node);
            }
        }
        
        return tree;
    }

    /**
     * 自动分类新闻
     */
    public String classifyNews(String title, String content) {
        log.info("自动分类新闻: {}", title);
        
        // 模拟AI分类逻辑
        Map<String, String[]> categoryKeywords = new HashMap<>();
        categoryKeywords.put("technology", new String[]{"AI", "人工智能", "技术", "软件", "互联网", "科技"});
        categoryKeywords.put("policy", new String[]{"政策", "法规", "监管", "政府", "国务院"});
        categoryKeywords.put("finance", new String[]{"金融", "投资", "股票", "基金", "银行"});
        categoryKeywords.put("industry", new String[]{"行业", "市场", "企业", "产业"});
        
        String text = (title + " " + content).toLowerCase();
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

    private NewsDataSource createDataSource(Long id, String name, String type, String category, int reliability) {
        NewsDataSource source = new NewsDataSource();
        source.setId(id);
        source.setSourceName(name);
        source.setSourceType(type);
        source.setCategory(category);
        source.setReliabilityScore(BigDecimal.valueOf(reliability));
        source.setIsEnabled(true);
        source.setUpdateFrequency(60);
        source.setTotalArticles(1000 + (int)(Math.random() * 5000));
        return source;
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
        category.setArticleCount((int)(Math.random() * 500));
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