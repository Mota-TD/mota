package com.mota.common.feign.client;

import com.mota.common.core.result.Result;
import com.mota.common.feign.config.FeignConfig;
import com.mota.common.feign.dto.AINewsDTO;
import com.mota.common.feign.fallback.AIServiceFallback;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * AI服务Feign客户端
 * 用于服务间调用AI服务
 */
@FeignClient(
    name = "mota-ai-service",
    configuration = FeignConfig.class,
    fallbackFactory = AIServiceFallback.class
)
public interface AIServiceClient {

    // ==================== AI新闻相关 ====================

    /**
     * 获取AI新闻列表
     */
    @GetMapping("/api/v1/ai/news")
    Result<List<AINewsDTO>> getNewsList(
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "20") int size);

    /**
     * 获取AI新闻详情
     */
    @GetMapping("/api/v1/ai/news/{id}")
    Result<AINewsDTO> getNewsById(@PathVariable("id") Long id);

    /**
     * 获取热门AI新闻
     */
    @GetMapping("/api/v1/ai/news/hot")
    Result<List<AINewsDTO>> getHotNews(
            @RequestParam(value = "limit", defaultValue = "10") int limit);

    /**
     * 搜索AI新闻
     */
    @GetMapping("/api/v1/ai/news/search")
    Result<List<AINewsDTO>> searchNews(
            @RequestParam("keyword") String keyword,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "20") int size);
}