package com.mota.search.service.impl;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.search.CompletionSuggestOption;
import co.elastic.clients.elasticsearch.core.search.Suggestion;
import com.mota.search.dto.SuggestionResponse;
import com.mota.search.entity.SearchHistory;
import com.mota.search.entity.SearchHotword;
import com.mota.search.entity.SearchSynonym;
import com.mota.search.mapper.SearchHistoryMapper;
import com.mota.search.mapper.SearchHotwordMapper;
import com.mota.search.mapper.SearchSynonymMapper;
import com.mota.search.service.SearchSuggestionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * 搜索建议服务实现类
 * 
 * @author mota
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SearchSuggestionServiceImpl implements SearchSuggestionService {

    private final ElasticsearchClient elasticsearchClient;
    private final SearchHistoryMapper searchHistoryMapper;
    private final SearchHotwordMapper searchHotwordMapper;
    private final SearchSynonymMapper searchSynonymMapper;
    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${elasticsearch.index-prefix:mota}")
    private String indexPrefix;

    private static final String HOTWORD_CACHE_KEY = "search:hotword:";
    private static final String SUGGESTION_CACHE_KEY = "search:suggestion:";
    private static final int CACHE_EXPIRE_MINUTES = 30;

    @Override
    public SuggestionResponse getSuggestions(Long tenantId, Long userId, String prefix, int limit) {
        SuggestionResponse response = new SuggestionResponse();
        
        // 获取自动补全建议
        List<String> completions = getAutoComplete(tenantId, prefix, limit);
        List<SuggestionResponse.Suggestion> suggestions = completions.stream()
                .map(text -> {
                    SuggestionResponse.Suggestion suggestion = new SuggestionResponse.Suggestion();
                    suggestion.setText(text);
                    suggestion.setType("completion");
                    suggestion.setHighlight(highlightPrefix(text, prefix));
                    return suggestion;
                })
                .collect(Collectors.toList());
        response.setSuggestions(suggestions);
        
        // 获取热门搜索词
        List<SearchHotword> hotwords = getHotKeywords(tenantId, "daily", 10);
        List<SuggestionResponse.HotKeyword> hotKeywordList = hotwords.stream()
                .map(hw -> {
                    SuggestionResponse.HotKeyword hotKeyword = new SuggestionResponse.HotKeyword();
                    hotKeyword.setKeyword(hw.getKeyword());
                    hotKeyword.setSearchCount(hw.getSearchCount());
                    hotKeyword.setTrend(hw.getTrend());
                    hotKeyword.setIsNew(hw.getIsNew());
                    return hotKeyword;
                })
                .collect(Collectors.toList());
        response.setHotKeywords(hotKeywordList);
        
        // 获取用户搜索历史
        if (userId != null) {
            List<String> history = getUserSearchHistory(tenantId, userId, 5);
            response.setHistoryKeywords(history);
        }
        
        return response;
    }

    @Override
    public List<String> getAutoComplete(Long tenantId, String prefix, int limit) {
        if (prefix == null || prefix.length() < 2) {
            return Collections.emptyList();
        }
        
        // 尝试从缓存获取
        String cacheKey = SUGGESTION_CACHE_KEY + tenantId + ":" + prefix;
        @SuppressWarnings("unchecked")
        List<String> cached = (List<String>) redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return cached.stream().limit(limit).collect(Collectors.toList());
        }
        
        try {
            String indexName = indexPrefix + "_" + tenantId;
            
            // 使用ES的completion suggester
            SearchResponse<Void> response = elasticsearchClient.search(s -> s
                    .index(indexName)
                    .suggest(sg -> sg
                            .suggesters("title-suggest", fs -> fs
                                    .prefix(prefix)
                                    .completion(cs -> cs
                                            .field("title.suggest")
                                            .size(limit)
                                            .skipDuplicates(true)))),
                    Void.class);
            
            List<String> suggestions = new ArrayList<>();
            if (response.suggest() != null && response.suggest().containsKey("title-suggest")) {
                for (Suggestion<Void> suggestion : response.suggest().get("title-suggest")) {
                    if (suggestion.isCompletion()) {
                        for (CompletionSuggestOption<Void> option : suggestion.completion().options()) {
                            suggestions.add(option.text());
                        }
                    }
                }
            }
            
            // 缓存结果
            if (!suggestions.isEmpty()) {
                redisTemplate.opsForValue().set(cacheKey, suggestions, CACHE_EXPIRE_MINUTES, TimeUnit.MINUTES);
            }
            
            return suggestions;
            
        } catch (Exception e) {
            log.error("获取自动补全建议失败: tenantId={}, prefix={}", tenantId, prefix, e);
            return Collections.emptyList();
        }
    }

    @Override
    public String getSpellCorrection(Long tenantId, String keyword) {
        if (keyword == null || keyword.isEmpty()) {
            return keyword;
        }
        
        // 首先检查同义词表中的纠错映射
        List<SearchSynonym> corrections = searchSynonymMapper.selectByKeywordAndType(
                tenantId, keyword, "correction");
        if (!corrections.isEmpty()) {
            return corrections.get(0).getSynonyms().split(",")[0].trim();
        }
        
        try {
            String indexName = indexPrefix + "_" + tenantId;
            
            // 使用ES的phrase suggester进行拼写纠正
            SearchResponse<Void> response = elasticsearchClient.search(s -> s
                    .index(indexName)
                    .suggest(sg -> sg
                            .text(keyword)
                            .suggesters("spell-check", fs -> fs
                                    .phrase(ps -> ps
                                            .field("content")
                                            .size(1)
                                            .gramSize(3)
                                            .confidence(1.0)
                                            .maxErrors(2.0)))),
                    Void.class);
            
            if (response.suggest() != null && response.suggest().containsKey("spell-check")) {
                for (Suggestion<Void> suggestion : response.suggest().get("spell-check")) {
                    if (suggestion.isPhrase() && !suggestion.phrase().options().isEmpty()) {
                        return suggestion.phrase().options().get(0).text();
                    }
                }
            }
            
        } catch (Exception e) {
            log.error("获取拼写纠正失败: tenantId={}, keyword={}", tenantId, keyword, e);
        }
        
        return keyword;
    }

    @Override
    public List<String> getRelatedKeywords(Long tenantId, String keyword, int limit) {
        if (keyword == null || keyword.isEmpty()) {
            return Collections.emptyList();
        }
        
        try {
            String indexName = indexPrefix + "_" + tenantId;
            
            // 使用significant_terms聚合获取相关词
            SearchResponse<Void> response = elasticsearchClient.search(s -> s
                    .index(indexName)
                    .size(0)
                    .query(q -> q.match(m -> m.field("content").query(keyword)))
                    .aggregations("related_terms", a -> a
                            .significantTerms(st -> st
                                    .field("tags")
                                    .size(limit))),
                    Void.class);
            
            List<String> relatedKeywords = new ArrayList<>();
            if (response.aggregations() != null && response.aggregations().containsKey("related_terms")) {
                response.aggregations().get("related_terms").sterms().buckets().array()
                        .forEach(bucket -> relatedKeywords.add(bucket.key().stringValue()));
            }
            
            return relatedKeywords;
            
        } catch (Exception e) {
            log.error("获取相关关键词失败: tenantId={}, keyword={}", tenantId, keyword, e);
            return Collections.emptyList();
        }
    }

    @Override
    public List<SearchHotword> getHotKeywords(Long tenantId, String period, int limit) {
        // 尝试从缓存获取
        String cacheKey = HOTWORD_CACHE_KEY + tenantId + ":" + period;
        @SuppressWarnings("unchecked")
        List<SearchHotword> cached = (List<SearchHotword>) redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return cached.stream().limit(limit).collect(Collectors.toList());
        }
        
        // 从数据库获取
        List<SearchHotword> hotwords = searchHotwordMapper.selectTopHotwords(tenantId, period, limit);
        
        // 缓存结果
        if (!hotwords.isEmpty()) {
            redisTemplate.opsForValue().set(cacheKey, hotwords, CACHE_EXPIRE_MINUTES, TimeUnit.MINUTES);
        }
        
        return hotwords;
    }

    @Override
    public List<String> getUserSearchHistory(Long tenantId, Long userId, int limit) {
        List<SearchHistory> histories = searchHistoryMapper.selectRecentByUser(tenantId, userId, limit);
        return histories.stream()
                .map(SearchHistory::getKeyword)
                .distinct()
                .collect(Collectors.toList());
    }

    @Override
    public void clearUserSearchHistory(Long tenantId, Long userId) {
        searchHistoryMapper.deleteByUser(tenantId, userId);
    }

    @Override
    public void deleteSearchHistory(Long tenantId, Long userId, String keyword) {
        searchHistoryMapper.deleteByUserAndKeyword(tenantId, userId, keyword);
    }

    @Override
    public List<String> expandSynonyms(Long tenantId, String keyword) {
        if (keyword == null || keyword.isEmpty()) {
            return Collections.singletonList(keyword);
        }
        
        Set<String> expanded = new LinkedHashSet<>();
        expanded.add(keyword);
        
        // 获取等价同义词
        List<SearchSynonym> equivalents = searchSynonymMapper.selectByKeywordAndType(
                tenantId, keyword, "equivalent");
        for (SearchSynonym synonym : equivalents) {
            if (synonym.getSynonyms() != null) {
                Arrays.stream(synonym.getSynonyms().split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .forEach(expanded::add);
            }
        }
        
        // 获取扩展同义词
        List<SearchSynonym> expansions = searchSynonymMapper.selectByKeywordAndType(
                tenantId, keyword, "expansion");
        for (SearchSynonym synonym : expansions) {
            if (synonym.getSynonyms() != null) {
                Arrays.stream(synonym.getSynonyms().split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .forEach(expanded::add);
            }
        }
        
        return new ArrayList<>(expanded);
    }

    @Override
    @Async
    public void updateHotwordStats(Long tenantId, String keyword) {
        if (keyword == null || keyword.isEmpty() || keyword.length() > 50) {
            return;
        }
        
        try {
            // 更新或创建热词记录
            SearchHotword hotword = searchHotwordMapper.selectByKeyword(tenantId, keyword, "daily");
            if (hotword == null) {
                hotword = new SearchHotword();
                hotword.setTenantId(tenantId);
                hotword.setKeyword(keyword);
                hotword.setSearchCount(1L);
                hotword.setPeriod("daily");
                hotword.setTrend("stable");
                hotword.setIsNew(true);
                hotword.setIsRecommended(false);
                hotword.setCreateTime(LocalDateTime.now());
                hotword.setUpdateTime(LocalDateTime.now());
                searchHotwordMapper.insert(hotword);
            } else {
                hotword.setSearchCount(hotword.getSearchCount() + 1);
                hotword.setUpdateTime(LocalDateTime.now());
                searchHotwordMapper.updateById(hotword);
            }
            
            // 清除缓存
            redisTemplate.delete(HOTWORD_CACHE_KEY + tenantId + ":daily");
            redisTemplate.delete(HOTWORD_CACHE_KEY + tenantId + ":weekly");
            redisTemplate.delete(HOTWORD_CACHE_KEY + tenantId + ":monthly");
            
        } catch (Exception e) {
            log.error("更新热词统计失败: tenantId={}, keyword={}", tenantId, keyword, e);
        }
    }

    @Override
    public void refreshHotwordRanking(Long tenantId) {
        log.info("刷新热词排行: tenantId={}", tenantId);
        
        try {
            // 获取所有热词
            List<SearchHotword> hotwords = searchHotwordMapper.selectAll(tenantId);
            
            // 按搜索次数排序并更新排名
            hotwords.sort((a, b) -> Long.compare(b.getSearchCount(), a.getSearchCount()));
            
            int rank = 1;
            for (SearchHotword hotword : hotwords) {
                Integer oldRank = hotword.getRanking();
                hotword.setRanking(rank);
                
                // 计算趋势
                if (oldRank == null) {
                    hotword.setTrend("stable");
                    hotword.setIsNew(true);
                } else if (rank < oldRank) {
                    hotword.setTrend("up");
                    hotword.setIsNew(false);
                } else if (rank > oldRank) {
                    hotword.setTrend("down");
                    hotword.setIsNew(false);
                } else {
                    hotword.setTrend("stable");
                    hotword.setIsNew(false);
                }
                
                hotword.setUpdateTime(LocalDateTime.now());
                searchHotwordMapper.updateById(hotword);
                rank++;
            }
            
            // 清除所有缓存
            redisTemplate.delete(HOTWORD_CACHE_KEY + tenantId + ":daily");
            redisTemplate.delete(HOTWORD_CACHE_KEY + tenantId + ":weekly");
            redisTemplate.delete(HOTWORD_CACHE_KEY + tenantId + ":monthly");
            redisTemplate.delete(HOTWORD_CACHE_KEY + tenantId + ":all");
            
            log.info("热词排行刷新完成: tenantId={}, count={}", tenantId, hotwords.size());
            
        } catch (Exception e) {
            log.error("刷新热词排行失败: tenantId={}", tenantId, e);
        }
    }

    // ==================== 私有方法 ====================

    private String highlightPrefix(String text, String prefix) {
        if (text == null || prefix == null) {
            return text;
        }
        int index = text.toLowerCase().indexOf(prefix.toLowerCase());
        if (index >= 0) {
            return text.substring(0, index) + 
                    "<em>" + text.substring(index, index + prefix.length()) + "</em>" +
                    text.substring(index + prefix.length());
        }
        return text;
    }
}