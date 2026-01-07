package com.mota.common.feign.client;

import com.mota.common.core.result.Result;
import com.mota.common.feign.config.FeignConfig;
import com.mota.common.feign.dto.KnowledgeFileDTO;
import com.mota.common.feign.dto.TemplateDTO;
import com.mota.common.feign.fallback.KnowledgeServiceFallback;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 知识服务Feign客户端
 * 用于服务间调用知识服务
 */
@FeignClient(
    name = "mota-knowledge-service",
    configuration = FeignConfig.class,
    fallbackFactory = KnowledgeServiceFallback.class
)
public interface KnowledgeServiceClient {

    // ==================== 知识文件相关 ====================

    /**
     * 获取文件详情
     */
    @GetMapping("/api/v1/knowledge/files/{id}")
    Result<KnowledgeFileDTO> getFileById(@PathVariable("id") Long id);

    /**
     * 搜索文件
     */
    @GetMapping("/api/v1/knowledge/files/search")
    Result<List<KnowledgeFileDTO>> searchFiles(
            @RequestParam("enterpriseId") Long enterpriseId,
            @RequestParam("keyword") String keyword,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "20") int size);

    /**
     * 获取最近文件
     */
    @GetMapping("/api/v1/knowledge/files/recent")
    Result<List<KnowledgeFileDTO>> getRecentFiles(
            @RequestParam("userId") Long userId,
            @RequestParam(value = "limit", defaultValue = "10") int limit);

    // ==================== 模板相关 ====================

    /**
     * 获取模板详情
     */
    @GetMapping("/api/v1/knowledge/templates/{id}")
    Result<TemplateDTO> getTemplateById(@PathVariable("id") Long id);

    /**
     * 获取系统模板
     */
    @GetMapping("/api/v1/knowledge/templates/system")
    Result<List<TemplateDTO>> getSystemTemplates(
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "category", required = false) String category);

    /**
     * 获取热门模板
     */
    @GetMapping("/api/v1/knowledge/templates/popular")
    Result<List<TemplateDTO>> getPopularTemplates(
            @RequestParam(value = "limit", defaultValue = "10") int limit);

    /**
     * 使用模板
     */
    @PostMapping("/api/v1/knowledge/templates/{id}/use")
    Result<String> useTemplate(@PathVariable("id") Long id);
}