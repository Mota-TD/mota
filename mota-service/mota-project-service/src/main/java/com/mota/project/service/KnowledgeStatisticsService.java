package com.mota.project.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.project.entity.*;
import com.mota.project.mapper.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 知识使用统计服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KnowledgeStatisticsService {

    private final DocumentAccessLogMapper documentAccessLogMapper;
    private final DocumentStatsDailyMapper documentStatsDailyMapper;
    private final SearchLogMapper searchLogMapper;
    private final SearchKeywordStatsMapper searchKeywordStatsMapper;
    private final KnowledgeReuseLogMapper knowledgeReuseLogMapper;
    private final KnowledgeGapMapper knowledgeGapMapper;
    private final DocumentRankingMapper documentRankingMapper;

    // ========== 访问统计 (KS-001) ==========

    /**
     * 记录文档访问
     */
    @Transactional
    public void recordDocumentAccess(DocumentAccessLog accessLog) {
        accessLog.setAccessDate(LocalDate.now());
        accessLog.setAccessTime(LocalDateTime.now());
        documentAccessLogMapper.insert(accessLog);
    }

    /**
     * 获取文档访问统计
     */
    public Map<String, Object> getDocumentAccessStats(Long documentId, LocalDate startDate, LocalDate endDate) {
        return documentAccessLogMapper.getDocumentAccessStats(documentId, startDate, endDate);
    }

    /**
     * 获取项目访问统计概览
     */
    public Map<String, Object> getProjectAccessOverview(Long projectId, LocalDate startDate, LocalDate endDate) {
        Map<String, Object> overview = new HashMap<>();
        
        // 获取访问趋势
        List<Map<String, Object>> trend = documentAccessLogMapper.getAccessTrend(projectId, startDate, endDate, "day");
        overview.put("trend", trend);
        
        // 获取访问来源分布
        List<Map<String, Object>> sourceDistribution = documentAccessLogMapper.getAccessSourceDistribution(projectId, startDate, endDate);
        overview.put("sourceDistribution", sourceDistribution);
        
        // 获取设备类型分布
        List<Map<String, Object>> deviceDistribution = documentAccessLogMapper.getDeviceTypeDistribution(projectId, startDate, endDate);
        overview.put("deviceDistribution", deviceDistribution);
        
        return overview;
    }

    // ========== 热门排行 (KS-002) ==========

    /**
     * 获取热门文档排行
     */
    public List<DocumentRanking> getHotDocuments(Long projectId, String rankingType, Integer limit) {
        LocalDate rankingDate = LocalDate.now();
        if ("weekly".equals(rankingType)) {
            rankingDate = rankingDate.minusDays(rankingDate.getDayOfWeek().getValue() - 1);
        } else if ("monthly".equals(rankingType)) {
            rankingDate = rankingDate.withDayOfMonth(1);
        }
        return documentRankingMapper.getRanking(projectId, rankingType, rankingDate, limit != null ? limit : 10);
    }

    /**
     * 获取上升最快的文档
     */
    public List<DocumentRanking> getFastestRisingDocuments(Long projectId, String rankingType, Integer limit) {
        LocalDate rankingDate = LocalDate.now();
        return documentRankingMapper.getFastestRisingDocuments(projectId, rankingType, rankingDate, limit != null ? limit : 10);
    }

    /**
     * 获取文档排名历史
     */
    public List<DocumentRanking> getDocumentRankingHistory(Long documentId, String rankingType, LocalDate startDate, LocalDate endDate) {
        return documentRankingMapper.getDocumentRankingHistory(documentId, rankingType, startDate, endDate);
    }

    // ========== 访问趋势 (KS-003) ==========

    /**
     * 获取访问趋势
     */
    public List<Map<String, Object>> getAccessTrend(Long projectId, LocalDate startDate, LocalDate endDate, String groupBy) {
        return documentAccessLogMapper.getAccessTrend(projectId, startDate, endDate, groupBy);
    }

    /**
     * 获取文档统计趋势
     */
    public List<DocumentStatsDaily> getDocumentStatsTrend(Long documentId, LocalDate startDate, LocalDate endDate) {
        return documentStatsDailyMapper.getStatsByDateRange(documentId, startDate, endDate);
    }

    // ========== 复用率 (KS-004) ==========

    /**
     * 记录知识复用
     */
    @Transactional
    public void recordKnowledgeReuse(KnowledgeReuseLog reuseLog) {
        reuseLog.setReuseDate(LocalDate.now());
        reuseLog.setReuseTime(LocalDateTime.now());
        knowledgeReuseLogMapper.insert(reuseLog);
    }

    /**
     * 获取复用统计
     */
    public Map<String, Object> getReuseStats(Long projectId, LocalDate startDate, LocalDate endDate) {
        return knowledgeReuseLogMapper.getReuseStats(projectId, startDate, endDate);
    }

    /**
     * 获取复用趋势
     */
    public List<Map<String, Object>> getReuseTrend(Long projectId, LocalDate startDate, LocalDate endDate) {
        return knowledgeReuseLogMapper.getReuseTrend(projectId, startDate, endDate);
    }

    /**
     * 获取复用类型分布
     */
    public List<Map<String, Object>> getReuseTypeDistribution(Long projectId, LocalDate startDate, LocalDate endDate) {
        return knowledgeReuseLogMapper.getReuseTypeDistribution(projectId, startDate, endDate);
    }

    /**
     * 获取高复用文档
     */
    public List<Map<String, Object>> getHighReuseDocuments(Long projectId, LocalDate startDate, LocalDate endDate, Integer limit) {
        return knowledgeReuseLogMapper.getHighReuseDocuments(projectId, startDate, endDate, limit != null ? limit : 10);
    }

    // ========== 搜索热词 (KS-005) ==========

    /**
     * 记录搜索
     */
    @Transactional
    public void recordSearch(SearchLog searchLog) {
        searchLog.setSearchDate(LocalDate.now());
        searchLog.setSearchTime(LocalDateTime.now());
        searchLogMapper.insert(searchLog);
        
        // 更新热词统计
        updateKeywordStats(searchLog);
        
        // 如果搜索无结果，记录知识缺口
        if (searchLog.getResultCount() != null && searchLog.getResultCount() == 0) {
            recordSearchNoResultGap(searchLog.getKeyword(), searchLog.getProjectId());
        }
    }

    /**
     * 更新热词统计
     */
    private void updateKeywordStats(SearchLog searchLog) {
        SearchKeywordStats stats = new SearchKeywordStats();
        stats.setKeyword(searchLog.getKeyword());
        stats.setProjectId(searchLog.getProjectId());
        stats.setStatsDate(searchLog.getSearchDate());
        stats.setSearchCount(1);
        stats.setUniqueUsers(1);
        stats.setClickCount(searchLog.getClickedDocumentId() != null ? 1 : 0);
        stats.setAvgResultCount(BigDecimal.valueOf(searchLog.getResultCount() != null ? searchLog.getResultCount() : 0));
        stats.setClickRate(searchLog.getClickedDocumentId() != null ? BigDecimal.ONE : BigDecimal.ZERO);
        
        searchKeywordStatsMapper.upsertKeywordStats(stats);
    }

    /**
     * 获取热门搜索词
     */
    public List<SearchKeywordStats> getHotKeywords(Long projectId, LocalDate startDate, LocalDate endDate, Integer limit) {
        return searchKeywordStatsMapper.getHotKeywords(projectId, startDate, endDate, limit != null ? limit : 20);
    }

    /**
     * 获取关键词云数据
     */
    public List<Map<String, Object>> getKeywordCloud(Long projectId, LocalDate startDate, LocalDate endDate, Integer limit) {
        return searchKeywordStatsMapper.getKeywordCloud(projectId, startDate, endDate, limit != null ? limit : 50);
    }

    /**
     * 获取搜索统计
     */
    public Map<String, Object> getSearchStats(Long projectId, LocalDate startDate, LocalDate endDate) {
        return searchLogMapper.getSearchStats(projectId, startDate, endDate);
    }

    /**
     * 获取搜索趋势
     */
    public List<Map<String, Object>> getSearchTrend(Long projectId, LocalDate startDate, LocalDate endDate) {
        return searchLogMapper.getSearchTrend(projectId, startDate, endDate);
    }

    // ========== 知识缺口 (KS-006) ==========

    /**
     * 记录搜索无结果的知识缺口
     */
    @Transactional
    public void recordSearchNoResultGap(String keyword, Long projectId) {
        KnowledgeGap existingGap = knowledgeGapMapper.findByKeyword(keyword, projectId, "search_no_result");
        
        if (existingGap != null) {
            knowledgeGapMapper.incrementOccurrenceCount(existingGap.getId());
        } else {
            KnowledgeGap gap = new KnowledgeGap();
            gap.setProjectId(projectId);
            gap.setGapType("search_no_result");
            gap.setKeyword(keyword);
            gap.setDescription("用户搜索\"" + keyword + "\"无结果");
            gap.setOccurrenceCount(1);
            gap.setAffectedUsers(1);
            gap.setStatus("open");
            gap.setPriority("medium");
            gap.setFirstOccurredAt(LocalDateTime.now());
            gap.setLastOccurredAt(LocalDateTime.now());
            knowledgeGapMapper.insert(gap);
        }
    }

    /**
     * 获取知识缺口列表
     */
    public Page<KnowledgeGap> getKnowledgeGaps(Long projectId, String gapType, String status, String priority, int page, int pageSize) {
        Page<KnowledgeGap> pageParam = new Page<>(page, pageSize);
        return knowledgeGapMapper.getGapList(pageParam, projectId, gapType, status, priority);
    }

    /**
     * 获取知识缺口统计
     */
    public Map<String, Object> getGapStats(Long projectId) {
        return knowledgeGapMapper.getGapStats(projectId);
    }

    /**
     * 获取缺口类型分布
     */
    public List<Map<String, Object>> getGapTypeDistribution(Long projectId) {
        return knowledgeGapMapper.getGapTypeDistribution(projectId);
    }

    /**
     * 获取高优先级未解决缺口
     */
    public List<KnowledgeGap> getHighPriorityOpenGaps(Long projectId, Integer limit) {
        return knowledgeGapMapper.getHighPriorityOpenGaps(projectId, limit != null ? limit : 10);
    }

    /**
     * 更新知识缺口状态
     */
    @Transactional
    public void updateGapStatus(Long gapId, String status, Long resolvedBy, Long resolvedDocumentId, String resolutionNote) {
        KnowledgeGap gap = knowledgeGapMapper.selectById(gapId);
        if (gap != null) {
            gap.setStatus(status);
            if ("resolved".equals(status)) {
                gap.setResolvedBy(resolvedBy);
                gap.setResolvedDocumentId(resolvedDocumentId);
                gap.setResolvedAt(LocalDateTime.now());
                gap.setResolutionNote(resolutionNote);
            }
            knowledgeGapMapper.updateById(gap);
        }
    }

    /**
     * 创建知识缺口
     */
    @Transactional
    public KnowledgeGap createKnowledgeGap(KnowledgeGap gap) {
        gap.setOccurrenceCount(1);
        gap.setAffectedUsers(1);
        gap.setStatus("open");
        gap.setFirstOccurredAt(LocalDateTime.now());
        gap.setLastOccurredAt(LocalDateTime.now());
        knowledgeGapMapper.insert(gap);
        return gap;
    }

    /**
     * 获取低点击率关键词（潜在知识缺口）
     */
    public List<SearchKeywordStats> getLowClickRateKeywords(Long projectId, LocalDate startDate, LocalDate endDate, Integer minSearchCount, Double maxClickRate, Integer limit) {
        return searchKeywordStatsMapper.getLowClickRateKeywords(
            projectId, startDate, endDate, 
            minSearchCount != null ? minSearchCount : 5,
            maxClickRate != null ? maxClickRate : 0.1,
            limit != null ? limit : 20
        );
    }

    // ========== 综合统计 ==========

    /**
     * 获取知识统计概览
     */
    public Map<String, Object> getKnowledgeStatsOverview(Long projectId, LocalDate startDate, LocalDate endDate) {
        Map<String, Object> overview = new HashMap<>();
        
        // 访问统计
        Map<String, Object> accessStats = getProjectAccessOverview(projectId, startDate, endDate);
        overview.put("access", accessStats);
        
        // 搜索统计
        Map<String, Object> searchStats = getSearchStats(projectId, startDate, endDate);
        overview.put("search", searchStats);
        
        // 复用统计
        Map<String, Object> reuseStats = getReuseStats(projectId, startDate, endDate);
        overview.put("reuse", reuseStats);
        
        // 知识缺口统计
        Map<String, Object> gapStats = getGapStats(projectId);
        overview.put("gaps", gapStats);
        
        // 热门文档
        List<DocumentRanking> hotDocuments = getHotDocuments(projectId, "daily", 5);
        overview.put("hotDocuments", hotDocuments);
        
        // 热门搜索词
        List<SearchKeywordStats> hotKeywords = getHotKeywords(projectId, startDate, endDate, 10);
        overview.put("hotKeywords", hotKeywords);
        
        return overview;
    }
}