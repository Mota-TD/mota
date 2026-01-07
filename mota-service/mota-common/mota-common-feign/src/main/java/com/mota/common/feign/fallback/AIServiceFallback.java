package com.mota.common.feign.fallback;

import com.mota.common.core.result.Result;
import com.mota.common.feign.client.AIServiceClient;
import com.mota.common.feign.dto.AINewsDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

/**
 * AI服务降级处理
 * 当AI服务不可用时，提供降级响应
 */
@Slf4j
@Component
public class AIServiceFallback implements FallbackFactory<AIServiceClient> {

    @Override
    public AIServiceClient create(Throwable cause) {
        log.error("AI服务调用失败，触发降级: {}", cause.getMessage());
        
        return new AIServiceClient() {
            @Override
            public Result<List<AINewsDTO>> getNewsList(String category, int page, int size) {
                log.warn("获取AI新闻列表降级处理: category={}", category);
                return Result.success(Collections.emptyList());
            }

            @Override
            public Result<AINewsDTO> getNewsById(Long id) {
                log.warn("获取AI新闻详情降级处理: id={}", id);
                return Result.fail(503, "AI服务暂时不可用");
            }

            @Override
            public Result<List<AINewsDTO>> getHotNews(int limit) {
                log.warn("获取热门AI新闻降级处理: limit={}", limit);
                return Result.success(Collections.emptyList());
            }

            @Override
            public Result<List<AINewsDTO>> searchNews(String keyword, int page, int size) {
                log.warn("搜索AI新闻降级处理: keyword={}", keyword);
                return Result.success(Collections.emptyList());
            }
        };
    }
}