package com.mota.project.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.project.entity.search.*;
import com.mota.project.mapper.search.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * 智能搜索服务
 * 实现SS-001到SS-008功能
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SmartSearchService {
    
    private final SmartSearchLogMapper searchLogMapper;
    private final SearchSuggestionMapper suggestionMapper;
    private final SearchCorrectionDictMapper correctionMapper;
    private final SearchSynonymMapper synonymMapper;
    private final SearchIntentTemplateMapper intentMapper;
    private final SearchHotWordMapper hotWordMapper;
    private final SearchRelatedQueryMapper relatedQueryMapper;
    private final SearchCompletionMapper completionMapper;
    private final UserSearchPreferenceMapper preferenceMapper;
    private final DocumentVectorMapper vectorMapper;
    
    // ==================== SS-001 全文检索 ====================
    
    /**
     * 全文关键词检索
     */
    public SearchResult keywordSearch(String query, SearchRequest request) {
        log.info("全文检索: query={}, type={}", query, request.getSearchType());
        
        long startTime = System.currentTimeMillis();
        SearchResult result = new SearchResult();
        result.setQuery(query);
        result.setSearchType("keyword");
        
        // 1. 自动纠错
        String correctedQuery = autoCorrect(query);
        if (!correctedQuery.equals(query)) {
            result.setCorrectedQuery(correctedQuery);
            result.setWasCorrected(true);
        }
        
        // 2. 同义词扩展
        List<String> expandedTerms = expandSynonyms(correctedQuery);
        result.setExpandedTerms(expandedTerms);
        
        // 3. 意图识别
        SearchIntent intent = detectIntent(correctedQuery);
        result.setDetectedIntent(intent);
        
        // 4. 执行搜索（模拟）
        List<SearchResultItem> items = executeKeywordSearch(correctedQuery, expandedTerms, request);
        result.setItems(items);
        result.setTotalCount(items.size());
        
        // 5. 记录搜索日志
        long searchTime = System.currentTimeMillis() - startTime;
        result.setSearchTimeMs((int) searchTime);
        
        logSearch(request.getUserId(), query, "keyword", correctedQuery, intent, items.size(), (int) searchTime);
        
        // 6. 更新热词
        updateHotWord(correctedQuery);
        
        return result;
    }
    
    private List<SearchResultItem> executeKeywordSearch(String query, List<String> expandedTerms, SearchRequest request) {
        // 模拟搜索结果
        List<SearchResultItem> items = new ArrayList<>();
        
        // 根据搜索类型返回不同结果
        String searchType = request.getSearchType();
        if (searchType == null || "all".equals(searchType)) {
            items.addAll(searchDocuments(query, 5));
            items.addAll(searchTasks(query, 5));
            items.addAll(searchProjects(query, 5));
        } else if ("document".equals(searchType)) {
            items.addAll(searchDocuments(query, 20));
        } else if ("task".equals(searchType)) {
            items.addAll(searchTasks(query, 20));
        } else if ("project".equals(searchType)) {
            items.addAll(searchProjects(query, 20));
        }
        
        // 按相关度排序
        items.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));
        
        return items;
    }
    
    private List<SearchResultItem> searchDocuments(String query, int limit) {
        List<SearchResultItem> items = new ArrayList<>();
        for (int i = 0; i < Math.min(limit, 3); i++) {
            SearchResultItem item = new SearchResultItem();
            item.setId((long) (i + 1));
            item.setType("document");
            item.setTitle("文档: " + query + " 相关内容 " + (i + 1));
            item.setContent("这是与 " + query + " 相关的文档内容摘要...");
            item.setScore(0.9 - i * 0.1);
            item.setHighlights(Arrays.asList("<em>" + query + "</em>"));
            items.add(item);
        }
        return items;
    }
    
    private List<SearchResultItem> searchTasks(String query, int limit) {
        List<SearchResultItem> items = new ArrayList<>();
        for (int i = 0; i < Math.min(limit, 3); i++) {
            SearchResultItem item = new SearchResultItem();
            item.setId((long) (i + 100));
            item.setType("task");
            item.setTitle("任务: " + query + " 相关任务 " + (i + 1));
            item.setContent("这是与 " + query + " 相关的任务描述...");
            item.setScore(0.85 - i * 0.1);
            item.setHighlights(Arrays.asList("<em>" + query + "</em>"));
            items.add(item);
        }
        return items;
    }
    
    private List<SearchResultItem> searchProjects(String query, int limit) {
        List<SearchResultItem> items = new ArrayList<>();
        for (int i = 0; i < Math.min(limit, 2); i++) {
            SearchResultItem item = new SearchResultItem();
            item.setId((long) (i + 200));
            item.setType("project");
            item.setTitle("项目: " + query + " 相关项目 " + (i + 1));
            item.setContent("这是与 " + query + " 相关的项目描述...");
            item.setScore(0.8 - i * 0.1);
            item.setHighlights(Arrays.asList("<em>" + query + "</em>"));
            items.add(item);
        }
        return items;
    }
    
    // ==================== SS-002 语义搜索 ====================
    
    /**
     * 语义相似度搜索
     */
    public SearchResult semanticSearch(String query, SearchRequest request) {
        log.info("语义搜索: query={}", query);
        
        long startTime = System.currentTimeMillis();
        SearchResult result = new SearchResult();
        result.setQuery(query);
        result.setSearchType("semantic");
        
        // 1. 文本向量化
        float[] queryVector = textToVector(query);
        
        // 2. 向量相似度搜索
        List<SearchResultItem> items = vectorSimilaritySearch(queryVector, request);
        result.setItems(items);
        result.setTotalCount(items.size());
        
        // 3. 意图识别
        SearchIntent intent = detectIntent(query);
        result.setDetectedIntent(intent);
        
        long searchTime = System.currentTimeMillis() - startTime;
        result.setSearchTimeMs((int) searchTime);
        
        logSearch(request.getUserId(), query, "semantic", null, intent, items.size(), (int) searchTime);
        
        return result;
    }
    
    private float[] textToVector(String text) {
        // 模拟文本向量化（实际应调用嵌入模型API）
        float[] vector = new float[768];
        Random random = new Random(text.hashCode());
        for (int i = 0; i < vector.length; i++) {
            vector[i] = random.nextFloat() * 2 - 1;
        }
        return vector;
    }
    
    private List<SearchResultItem> vectorSimilaritySearch(float[] queryVector, SearchRequest request) {
        // 模拟向量相似度搜索结果
        List<SearchResultItem> items = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            SearchResultItem item = new SearchResultItem();
            item.setId((long) (i + 1));
            item.setType("document");
            item.setTitle("语义相关文档 " + (i + 1));
            item.setContent("这是语义相似的文档内容...");
            item.setScore(0.95 - i * 0.05);
            items.add(item);
        }
        return items;
    }
    
    // ==================== SS-003 向量检索 ====================
    
    /**
     * 向量数据库检索
     */
    public List<DocumentVector> vectorSearch(float[] queryVector, int topK) {
        log.info("向量检索: topK={}", topK);
        
        // 实际应使用向量数据库（如Milvus、Pinecone等）
        // 这里返回模拟结果
        return vectorMapper.findSimilarVectors(topK);
    }
    
    // ==================== SS-004 混合检索 ====================
    
    /**
     * 向量+关键词混合检索
     */
    public SearchResult hybridSearch(String query, SearchRequest request) {
        log.info("混合检索: query={}", query);
        
        long startTime = System.currentTimeMillis();
        SearchResult result = new SearchResult();
        result.setQuery(query);
        result.setSearchType("hybrid");
        
        // 1. 关键词搜索
        SearchResult keywordResult = keywordSearch(query, request);
        
        // 2. 语义搜索
        SearchResult semanticResult = semanticSearch(query, request);
        
        // 3. 融合结果（RRF算法）
        List<SearchResultItem> fusedItems = fuseResults(
            keywordResult.getItems(), 
            semanticResult.getItems(),
            0.5 // 关键词权重
        );
        
        result.setItems(fusedItems);
        result.setTotalCount(fusedItems.size());
        result.setCorrectedQuery(keywordResult.getCorrectedQuery());
        result.setWasCorrected(keywordResult.isWasCorrected());
        result.setDetectedIntent(keywordResult.getDetectedIntent());
        
        long searchTime = System.currentTimeMillis() - startTime;
        result.setSearchTimeMs((int) searchTime);
        
        logSearch(request.getUserId(), query, "hybrid", result.getCorrectedQuery(), 
                  result.getDetectedIntent(), fusedItems.size(), (int) searchTime);
        
        return result;
    }
    
    private List<SearchResultItem> fuseResults(List<SearchResultItem> keywordResults, 
                                                List<SearchResultItem> semanticResults,
                                                double keywordWeight) {
        Map<String, SearchResultItem> fusedMap = new HashMap<>();
        
        // 计算关键词搜索的RRF分数
        for (int i = 0; i < keywordResults.size(); i++) {
            SearchResultItem item = keywordResults.get(i);
            String key = item.getType() + "_" + item.getId();
            double rrfScore = keywordWeight / (60 + i + 1);
            item.setScore(rrfScore);
            fusedMap.put(key, item);
        }
        
        // 计算语义搜索的RRF分数并融合
        double semanticWeight = 1 - keywordWeight;
        for (int i = 0; i < semanticResults.size(); i++) {
            SearchResultItem item = semanticResults.get(i);
            String key = item.getType() + "_" + item.getId();
            double rrfScore = semanticWeight / (60 + i + 1);
            
            if (fusedMap.containsKey(key)) {
                SearchResultItem existing = fusedMap.get(key);
                existing.setScore(existing.getScore() + rrfScore);
            } else {
                item.setScore(rrfScore);
                fusedMap.put(key, item);
            }
        }
        
        // 按融合分数排序
        return fusedMap.values().stream()
            .sorted((a, b) -> Double.compare(b.getScore(), a.getScore()))
            .collect(Collectors.toList());
    }
    
    // ==================== SS-005 意图识别 ====================
    
    /**
     * 搜索意图识别
     */
    public SearchIntent detectIntent(String query) {
        log.info("意图识别: query={}", query);
        
        SearchIntent intent = new SearchIntent();
        intent.setOriginalQuery(query);
        
        // 获取所有意图模板
        List<SearchIntentTemplate> templates = intentMapper.findActiveTemplates();
        
        for (SearchIntentTemplate template : templates) {
            // 检查关键词匹配
            if (matchKeywords(query, template.getKeywords())) {
                intent.setIntentCode(template.getIntentCode());
                intent.setIntentName(template.getIntentName());
                intent.setActionType(template.getActionType());
                intent.setConfidence(0.8);
                break;
            }
            
            // 检查正则匹配
            if (matchPatterns(query, template.getPatterns())) {
                intent.setIntentCode(template.getIntentCode());
                intent.setIntentName(template.getIntentName());
                intent.setActionType(template.getActionType());
                intent.setConfidence(0.9);
                break;
            }
        }
        
        // 默认意图
        if (intent.getIntentCode() == null) {
            intent.setIntentCode("general_search");
            intent.setIntentName("通用搜索");
            intent.setActionType("search");
            intent.setConfidence(0.5);
        }
        
        return intent;
    }
    
    private boolean matchKeywords(String query, String keywordsJson) {
        if (keywordsJson == null) return false;
        try {
            // 简化的关键词匹配
            String[] keywords = keywordsJson.replace("[", "").replace("]", "")
                .replace("\"", "").split(",");
            for (String keyword : keywords) {
                if (query.contains(keyword.trim())) {
                    return true;
                }
            }
        } catch (Exception e) {
            log.error("关键词匹配失败", e);
        }
        return false;
    }
    
    private boolean matchPatterns(String query, String patternsJson) {
        if (patternsJson == null) return false;
        try {
            // 简化的正则匹配
            String[] patterns = patternsJson.replace("[", "").replace("]", "")
                .replace("\"", "").split(",");
            for (String pattern : patterns) {
                Pattern p = Pattern.compile(pattern.trim());
                Matcher m = p.matcher(query);
                if (m.find()) {
                    return true;
                }
            }
        } catch (Exception e) {
            log.error("正则匹配失败", e);
        }
        return false;
    }
    
    // ==================== SS-006 自动纠错 ====================
    
    /**
     * 搜索词自动纠错
     */
    public String autoCorrect(String query) {
        log.info("自动纠错: query={}", query);
        
        // 查找纠错词典
        List<SearchCorrectionDict> corrections = correctionMapper.findActiveCorrections();
        
        String corrected = query;
        for (SearchCorrectionDict dict : corrections) {
            if (corrected.contains(dict.getWrongWord())) {
                corrected = corrected.replace(dict.getWrongWord(), dict.getCorrectWord());
                // 更新使用次数
                correctionMapper.incrementUsageCount(dict.getId());
            }
        }
        
        return corrected;
    }
    
    /**
     * 获取纠错建议
     */
    public List<String> getCorrectionSuggestions(String query) {
        List<String> suggestions = new ArrayList<>();
        
        // 基于编辑距离的纠错建议
        List<SearchCorrectionDict> corrections = correctionMapper.findActiveCorrections();
        for (SearchCorrectionDict dict : corrections) {
            if (editDistance(query, dict.getWrongWord()) <= 2) {
                suggestions.add(dict.getCorrectWord());
            }
        }
        
        return suggestions;
    }
    
    private int editDistance(String s1, String s2) {
        int[][] dp = new int[s1.length() + 1][s2.length() + 1];
        for (int i = 0; i <= s1.length(); i++) dp[i][0] = i;
        for (int j = 0; j <= s2.length(); j++) dp[0][j] = j;
        
        for (int i = 1; i <= s1.length(); i++) {
            for (int j = 1; j <= s2.length(); j++) {
                if (s1.charAt(i - 1) == s2.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], 
                                   Math.min(dp[i - 1][j], dp[i][j - 1]));
                }
            }
        }
        return dp[s1.length()][s2.length()];
    }
    
    // ==================== SS-007 智能补全 ====================
    
    /**
     * 搜索词智能补全
     */
    public List<SearchSuggestion> getCompletions(String prefix, int limit) {
        log.info("智能补全: prefix={}", prefix);
        
        if (prefix == null || prefix.length() < 1) {
            return Collections.emptyList();
        }
        
        // 从补全表查询
        List<SearchCompletion> completions = completionMapper.findByPrefix(prefix, limit);
        
        // 转换为建议
        List<SearchSuggestion> suggestions = new ArrayList<>();
        for (SearchCompletion completion : completions) {
            SearchSuggestion suggestion = new SearchSuggestion();
            suggestion.setSuggestionText(completion.getCompletionText());
            suggestion.setSuggestionType("completion");
            suggestion.setFrequency(completion.getFrequency());
            suggestion.setScore(completion.getWeight());
            suggestions.add(suggestion);
        }
        
        // 补充热词建议
        if (suggestions.size() < limit) {
            List<SearchHotWord> hotWords = hotWordMapper.findByPrefix(prefix, limit - suggestions.size());
            for (SearchHotWord hotWord : hotWords) {
                SearchSuggestion suggestion = new SearchSuggestion();
                suggestion.setSuggestionText(hotWord.getWord());
                suggestion.setSuggestionType("hot");
                suggestion.setFrequency(hotWord.getSearchCount());
                suggestions.add(suggestion);
            }
        }
        
        return suggestions;
    }
    
    // ==================== SS-008 相关推荐 ====================
    
    /**
     * 相关搜索推荐
     */
    public List<SearchRelatedQuery> getRelatedQueries(String query, int limit) {
        log.info("相关推荐: query={}", query);
        
        // 从相关查询表获取
        List<SearchRelatedQuery> related = relatedQueryMapper.findBySourceQuery(query, limit);
        
        // 如果没有直接匹配，尝试模糊匹配
        if (related.isEmpty()) {
            related = relatedQueryMapper.findSimilarQueries(query, limit);
        }
        
        return related;
    }
    
    /**
     * 获取热门搜索
     */
    public List<SearchHotWord> getHotSearches(String periodType, int limit) {
        return hotWordMapper.findTopHotWords(periodType, LocalDate.now(), limit);
    }
    
    // ==================== 辅助方法 ====================
    
    /**
     * 同义词扩展
     */
    private List<String> expandSynonyms(String query) {
        List<String> expanded = new ArrayList<>();
        expanded.add(query);
        
        List<SearchSynonym> synonyms = synonymMapper.findActiveSynonyms();
        for (SearchSynonym synonym : synonyms) {
            String[] words = synonym.getWordGroup().split(",");
            for (String word : words) {
                if (query.contains(word.trim())) {
                    for (String syn : words) {
                        if (!syn.trim().equals(word.trim()) && !expanded.contains(syn.trim())) {
                            expanded.add(syn.trim());
                        }
                    }
                }
            }
        }
        
        return expanded;
    }
    
    /**
     * 记录搜索日志
     */
    @Transactional
    public void logSearch(Long userId, String query, String queryType, String correctedQuery,
                          SearchIntent intent, int resultCount, int searchTimeMs) {
        SmartSearchLog log = new SmartSearchLog();
        log.setUserId(userId);
        log.setQueryText(query);
        log.setQueryType(queryType);
        log.setCorrectedQuery(correctedQuery);
        log.setDetectedIntent(intent != null ? intent.getIntentCode() : null);
        log.setResultCount(resultCount);
        log.setSearchTimeMs(searchTimeMs);
        log.setIsSuccessful(resultCount > 0);
        log.setCreatedAt(LocalDateTime.now());
        
        searchLogMapper.insert(log);
    }
    
    /**
     * 更新热词
     */
    @Transactional
    public void updateHotWord(String word) {
        SearchHotWord hotWord = hotWordMapper.findByWordAndPeriod(word, "daily", LocalDate.now());
        if (hotWord != null) {
            hotWordMapper.incrementSearchCount(hotWord.getId());
        } else {
            hotWord = new SearchHotWord();
            hotWord.setWord(word);
            hotWord.setPeriodType("daily");
            hotWord.setPeriodDate(LocalDate.now());
            hotWord.setSearchCount(1);
            hotWord.setTrendScore(BigDecimal.ZERO);
            hotWord.setIsTrending(false);
            hotWord.setCreatedAt(LocalDateTime.now());
            hotWordMapper.insert(hotWord);
        }
    }
    
    /**
     * 获取用户搜索偏好
     */
    public UserSearchPreference getUserPreference(Long userId) {
        return preferenceMapper.findByUserId(userId);
    }
    
    /**
     * 保存用户搜索偏好
     */
    @Transactional
    public void saveUserPreference(UserSearchPreference preference) {
        UserSearchPreference existing = preferenceMapper.findByUserId(preference.getUserId());
        if (existing != null) {
            preference.setId(existing.getId());
            preferenceMapper.updateById(preference);
        } else {
            preferenceMapper.insert(preference);
        }
    }
    
    /**
     * 获取搜索历史
     */
    public List<SmartSearchLog> getSearchHistory(Long userId, int limit) {
        return searchLogMapper.findByUserId(userId, limit);
    }
    
    /**
     * 清除搜索历史
     */
    @Transactional
    public void clearSearchHistory(Long userId) {
        searchLogMapper.deleteByUserId(userId);
    }
    
    // ==================== 内部类 ====================
    
    /**
     * 搜索请求
     */
    @lombok.Data
    public static class SearchRequest {
        private Long userId;
        private String searchType; // all/document/task/project/knowledge
        private Map<String, Object> filters;
        private int page = 1;
        private int pageSize = 20;
        private String sortBy;
        private String sortOrder;
    }
    
    /**
     * 搜索结果
     */
    @lombok.Data
    public static class SearchResult {
        private String query;
        private String correctedQuery;
        private boolean wasCorrected;
        private String searchType;
        private SearchIntent detectedIntent;
        private List<String> expandedTerms;
        private List<SearchResultItem> items;
        private int totalCount;
        private int searchTimeMs;
    }
    
    /**
     * 搜索结果项
     */
    @lombok.Data
    public static class SearchResultItem {
        private Long id;
        private String type;
        private String title;
        private String content;
        private double score;
        private List<String> highlights;
        private Map<String, Object> metadata;
    }
    
    /**
     * 搜索意图
     */
    @lombok.Data
    public static class SearchIntent {
        private String originalQuery;
        private String intentCode;
        private String intentName;
        private String actionType;
        private double confidence;
        private Map<String, Object> parameters;
    }
}