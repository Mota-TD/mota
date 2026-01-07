package com.mota.api.knowledge.feign;

import com.mota.api.knowledge.dto.*;
import com.mota.common.core.result.Result;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 知识库服务Feign客户端
 */
@FeignClient(name = "mota-knowledge-service", path = "/api/v1/knowledge")
public interface KnowledgeServiceClient {

    /**
     * 获取文件列表
     */
    @GetMapping("/files")
    Result<List<KnowledgeFileDTO>> getFiles(
            @RequestParam("enterpriseId") Long enterpriseId,
            @RequestParam(value = "categoryId", required = false) Long categoryId);

    /**
     * 获取文件详情
     */
    @GetMapping("/files/{id}")
    Result<KnowledgeFileDTO> getFile(@PathVariable("id") Long id);

    /**
     * 上传文件
     */
    @PostMapping("/files")
    Result<KnowledgeFileDTO> uploadFile(@RequestBody UploadFileDTO request);

    /**
     * 删除文件
     */
    @DeleteMapping("/files/{id}")
    Result<Boolean> deleteFile(@PathVariable("id") Long id);

    /**
     * 获取分类列表
     */
    @GetMapping("/categories")
    Result<List<FileCategoryDTO>> getCategories(@RequestParam("enterpriseId") Long enterpriseId);

    /**
     * 获取模板列表
     */
    @GetMapping("/templates")
    Result<List<TemplateDTO>> getTemplates(@RequestParam("enterpriseId") Long enterpriseId);
}