package com.mota.project.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.project.entity.*;
import com.mota.project.service.KnowledgeStatisticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 知识使用统计控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/knowledge/statistics")
@RequiredArgsConstructor
public class KnowledgeStatisticsController {

    private final KnowledgeStatisticsService knowledgeStatisticsService;

    // ========== 访问统计 (KS-001) ==========

    /**
     * 记录文档访问
     */
    @PostMapping("/access")
    public ResponseEntity<Map<String, Object>> recordAccess(@RequestBody DocumentAccessLog accessLog) {
        knowledgeStatisticsService.recordDocumentAccess(accessLog);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "访问记录已保存");
        return ResponseEntity.ok(result);
    }

    /**
     * 获取文档访问统计
     */
    @GetMapping("/access/document/{documentId}")
    public ResponseEntity<Map<String, Object>> getDocumentAccessStats(
            @PathVariable Long documentId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        Map<String, Object> stats = knowledgeStatisticsService.getDocumentAccessStats(documentId, startDate, endDate);
        return ResponseEntity.ok(stats);
    }

    /**
     * 获取项目访问统计概览
     */
    @GetMapping("/access/overview")
    public ResponseEntity<Map<String, Object>> getProjectAccessOverview(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        Map<String, Object> overview = knowledgeStatisticsService.getProjectAccessOverview(projectId, startDate, endDate);
        return ResponseEntity.ok(overview);
    }

    // ========== 热门排行 (KS-002) ==========

    /**
     * 获取热门文档排行
     */
    @GetMapping("/ranking/hot")
    public ResponseEntity<List<DocumentRanking>> getHotDocuments(
            @RequestParam(required = false) Long projectId,
            @RequestParam(defaultValue = "daily") String rankingType,
            @RequestParam(defaultValue = "10") Integer limit) {
        
        List<DocumentRanking> ranking = knowledgeStatisticsService.getHotDocuments(projectId, rankingType, limit);
        return ResponseEntity.ok(ranking);
    }

    /**
     * 获取上升最快的文档
     */
    @GetMapping("/ranking/rising")
    public ResponseEntity<List<DocumentRanking>> getFastestRisingDocuments(
            @RequestParam(required = false) Long projectId,
            @RequestParam(defaultValue = "daily") String rankingType,
            @RequestParam(defaultValue = "10") Integer limit) {
        
        List<DocumentRanking> ranking = knowledgeStatisticsService.getFastestRisingDocuments(projectId, rankingType, limit);
        return ResponseEntity.ok(ranking);
    }

    /**
     * 获取文档排名历史
     */
    @GetMapping("/ranking/history/{documentId}")
    public ResponseEntity<List<DocumentRanking>> getDocumentRankingHistory(
            @PathVariable Long documentId,
            @RequestParam(defaultValue = "daily") String rankingType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        List<DocumentRanking> history = knowledgeStatisticsService.getDocumentRankingHistory(documentId, rankingType, startDate, endDate);
        return ResponseEntity.ok(history);
    }

    // ========== 访问趋势 (KS-003) ==========

    /**
     * 获取访问趋势
     */
    @GetMapping("/trend/access")
    public ResponseEntity<List<Map<String, Object>>> getAccessTrend(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "day") String groupBy) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        List<Map<String, Object>> trend = knowledgeStatisticsService.getAccessTrend(projectId, startDate, endDate, groupBy);
        return ResponseEntity.ok(trend);
    }

    /**
     * 获取文档统计趋势
     */
    @GetMapping("/trend/document/{documentId}")
    public ResponseEntity<List<DocumentStatsDaily>> getDocumentStatsTrend(
            @PathVariable Long documentId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        List<DocumentStatsDaily> trend = knowledgeStatisticsService.getDocumentStatsTrend(documentId, startDate, endDate);
        return ResponseEntity.ok(trend);
    }

    // ========== 复用率 (KS-004) ==========

    /**
     * 记录知识复用
     */
    @PostMapping("/reuse")
    public ResponseEntity<Map<String, Object>> recordReuse(@RequestBody KnowledgeReuseLog reuseLog) {
        knowledgeStatisticsService.recordKnowledgeReuse(reuseLog);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "复用记录已保存");
        return ResponseEntity.ok(result);
    }

    /**
     * 获取复用统计
     */
    @GetMapping("/reuse/stats")
    public ResponseEntity<Map<String, Object>> getReuseStats(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        Map<String, Object> stats = knowledgeStatisticsService.getReuseStats(projectId, startDate, endDate);
        return ResponseEntity.ok(stats);
    }

    /**
     * 获取复用趋势
     */
    @GetMapping("/reuse/trend")
    public ResponseEntity<List<Map<String, Object>>> getReuseTrend(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        List<Map<String, Object>> trend = knowledgeStatisticsService.getReuseTrend(projectId, startDate, endDate);
        return ResponseEntity.ok(trend);
    }

    /**
     * 获取复用类型分布
     */
    @GetMapping("/reuse/distribution")
    public ResponseEntity<List<Map<String, Object>>> getReuseTypeDistribution(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        List<Map<String, Object>> distribution = knowledgeStatisticsService.getReuseTypeDistribution(projectId, startDate, endDate);
        return ResponseEntity.ok(distribution);
    }

    /**
     * 获取高复用文档
     */
    @GetMapping("/reuse/top")
    public ResponseEntity<List<Map<String, Object>>> getHighReuseDocuments(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "10") Integer limit) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        List<Map<String, Object>> documents = knowledgeStatisticsService.getHighReuseDocuments(projectId, startDate, endDate, limit);
        return ResponseEntity.ok(documents);
    }

    // ========== 搜索热词 (KS-005) ==========

    /**
     * 记录搜索
     */
    @PostMapping("/search")
    public ResponseEntity<Map<String, Object>> recordSearch(@RequestBody SearchLog searchLog) {
        knowledgeStatisticsService.recordSearch(searchLog);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "搜索记录已保存");
        return ResponseEntity.ok(result);
    }

    /**
     * 获取热门搜索词
     */
    @GetMapping("/search/hot")
    public ResponseEntity<List<SearchKeywordStats>> getHotKeywords(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "20") Integer limit) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        List<SearchKeywordStats> keywords = knowledgeStatisticsService.getHotKeywords(projectId, startDate, endDate, limit);
        return ResponseEntity.ok(keywords);
    }

    /**
     * 获取关键词云数据
     */
    @GetMapping("/search/cloud")
    public ResponseEntity<List<Map<String, Object>>> getKeywordCloud(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "50") Integer limit) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        List<Map<String, Object>> cloud = knowledgeStatisticsService.getKeywordCloud(projectId, startDate, endDate, limit);
        return ResponseEntity.ok(cloud);
    }

    /**
     * 获取搜索统计
     */
    @GetMapping("/search/stats")
    public ResponseEntity<Map<String, Object>> getSearchStats(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        Map<String, Object> stats = knowledgeStatisticsService.getSearchStats(projectId, startDate, endDate);
        return ResponseEntity.ok(stats);
    }

    /**
     * 获取搜索趋势
     */
    @GetMapping("/search/trend")
    public ResponseEntity<List<Map<String, Object>>> getSearchTrend(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        List<Map<String, Object>> trend = knowledgeStatisticsService.getSearchTrend(projectId, startDate, endDate);
        return ResponseEntity.ok(trend);
    }

    // ========== 知识缺口 (KS-006) ==========

    /**
     * 获取知识缺口列表
     */
    @GetMapping("/gaps")
    public ResponseEntity<Page<KnowledgeGap>> getKnowledgeGaps(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) String gapType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        
        Page<KnowledgeGap> gaps = knowledgeStatisticsService.getKnowledgeGaps(projectId, gapType, status, priority, page, pageSize);
        return ResponseEntity.ok(gaps);
    }

    /**
     * 获取知识缺口统计
     */
    @GetMapping("/gaps/stats")
    public ResponseEntity<Map<String, Object>> getGapStats(@RequestParam(required = false) Long projectId) {
        Map<String, Object> stats = knowledgeStatisticsService.getGapStats(projectId);
        return ResponseEntity.ok(stats);
    }

    /**
     * 获取缺口类型分布
     */
    @GetMapping("/gaps/distribution")
    public ResponseEntity<List<Map<String, Object>>> getGapTypeDistribution(@RequestParam(required = false) Long projectId) {
        List<Map<String, Object>> distribution = knowledgeStatisticsService.getGapTypeDistribution(projectId);
        return ResponseEntity.ok(distribution);
    }

    /**
     * 获取高优先级未解决缺口
     */
    @GetMapping("/gaps/priority")
    public ResponseEntity<List<KnowledgeGap>> getHighPriorityOpenGaps(
            @RequestParam(required = false) Long projectId,
            @RequestParam(defaultValue = "10") Integer limit) {
        
        List<KnowledgeGap> gaps = knowledgeStatisticsService.getHighPriorityOpenGaps(projectId, limit);
        return ResponseEntity.ok(gaps);
    }

    /**
     * 更新知识缺口状态
     */
    @PutMapping("/gaps/{gapId}/status")
    public ResponseEntity<Map<String, Object>> updateGapStatus(
            @PathVariable Long gapId,
            @RequestBody Map<String, Object> request) {
        
        String status = (String) request.get("status");
        Long resolvedBy = request.get("resolvedBy") != null ? Long.valueOf(request.get("resolvedBy").toString()) : null;
        Long resolvedDocumentId = request.get("resolvedDocumentId") != null ? Long.valueOf(request.get("resolvedDocumentId").toString()) : null;
        String resolutionNote = (String) request.get("resolutionNote");
        
        knowledgeStatisticsService.updateGapStatus(gapId, status, resolvedBy, resolvedDocumentId, resolutionNote);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "缺口状态已更新");
        return ResponseEntity.ok(result);
    }

    /**
     * 创建知识缺口
     */
    @PostMapping("/gaps")
    public ResponseEntity<KnowledgeGap> createKnowledgeGap(@RequestBody KnowledgeGap gap) {
        KnowledgeGap created = knowledgeStatisticsService.createKnowledgeGap(gap);
        return ResponseEntity.ok(created);
    }

    /**
     * 获取低点击率关键词（潜在知识缺口）
     */
    @GetMapping("/gaps/potential")
    public ResponseEntity<List<SearchKeywordStats>> getLowClickRateKeywords(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "5") Integer minSearchCount,
            @RequestParam(defaultValue = "0.1") Double maxClickRate,
            @RequestParam(defaultValue = "20") Integer limit) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        List<SearchKeywordStats> keywords = knowledgeStatisticsService.getLowClickRateKeywords(
            projectId, startDate, endDate, minSearchCount, maxClickRate, limit);
        return ResponseEntity.ok(keywords);
    }

    // ========== 综合统计 ==========

    /**
     * 获取知识统计概览
     */
    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getKnowledgeStatsOverview(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        Map<String, Object> overview = knowledgeStatisticsService.getKnowledgeStatsOverview(projectId, startDate, endDate);
        return ResponseEntity.ok(overview);
    }
}