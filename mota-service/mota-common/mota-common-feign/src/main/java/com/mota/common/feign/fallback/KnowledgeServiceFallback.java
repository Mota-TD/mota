package com.mota.common.feign.fallback;

import com.mota.common.core.result.Result;
import com.mota.common.feign.client.KnowledgeServiceClient;
import com.mota.common.feign.dto.KnowledgeFileDTO;
import com.mota.common.feign.dto.TemplateDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

/**
 * 知识服务降级处理
 * 当知识服务不可用时，提供降级响应
 */
@Slf4j
@Component
public class KnowledgeServiceFallback implements FallbackFactory<KnowledgeServiceClient> {

    @Override
    public KnowledgeServiceClient create(Throwable cause) {
        log.error("知识服务调用失败，触发降级: {}", cause.getMessage());
        
        return new KnowledgeServiceClient() {
            @Override
            public Result<KnowledgeFileDTO> getFileById(Long id) {
                log.warn("获取文件详情降级处理: id={}", id);
                return Result.fail(503, "知识服务暂时不可用");
            }

            @Override
            public Result<List<KnowledgeFileDTO>> searchFiles(Long enterpriseId, String keyword, int page, int size) {
                log.warn("搜索文件降级处理: enterpriseId={}, keyword={}", enterpriseId, keyword);
                return Result.success(Collections.emptyList());
            }

            @Override
            public Result<List<KnowledgeFileDTO>> getRecentFiles(Long userId, int limit) {
                log.warn("获取最近文件降级处理: userId={}", userId);
                return Result.success(Collections.emptyList());
            }

            @Override
            public Result<TemplateDTO> getTemplateById(Long id) {
                log.warn("获取模板详情降级处理: id={}", id);
                return Result.fail(503, "知识服务暂时不可用");
            }

            @Override
            public Result<List<TemplateDTO>> getSystemTemplates(String type, String category) {
                log.warn("获取系统模板降级处理: type={}, category={}", type, category);
                return Result.success(Collections.emptyList());
            }

            @Override
            public Result<List<TemplateDTO>> getPopularTemplates(int limit) {
                log.warn("获取热门模板降级处理: limit={}", limit);
                return Result.success(Collections.emptyList());
            }

            @Override
            public Result<String> useTemplate(Long id) {
                log.warn("使用模板降级处理: id={}", id);
                return Result.fail(503, "知识服务暂时不可用");
            }
        };
    }
}