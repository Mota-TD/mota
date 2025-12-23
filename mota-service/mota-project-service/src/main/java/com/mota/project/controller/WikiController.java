package com.mota.project.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mota.common.core.result.Result;
import com.mota.project.entity.WikiDocument;
import com.mota.project.mapper.WikiDocumentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 知识库控制器
 */
@RestController
@RequestMapping("/api/v1/wiki")
@RequiredArgsConstructor
public class WikiController {

    private final WikiDocumentMapper wikiDocumentMapper;

    /**
     * 获取Wiki页面列表
     */
    @GetMapping("/pages")
    public Result<Map<String, Object>> list(
            @RequestParam(value = "projectId", required = false) Long projectId,
            @RequestParam(value = "parentId", required = false) Long parentId,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "page", defaultValue = "1") Integer page,
            @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize) {
        
        LambdaQueryWrapper<WikiDocument> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WikiDocument::getDeleted, 0);
        
        if (projectId != null) {
            wrapper.eq(WikiDocument::getProjectId, projectId);
        }
        if (parentId != null) {
            wrapper.eq(WikiDocument::getParentId, parentId);
        }
        if (StringUtils.hasText(keyword)) {
            wrapper.like(WikiDocument::getTitle, keyword);
        }
        
        wrapper.orderByAsc(WikiDocument::getSort);
        wrapper.orderByDesc(WikiDocument::getCreatedAt);
        
        List<WikiDocument> documents = wikiDocumentMapper.selectList(wrapper);
        
        Map<String, Object> result = new HashMap<>();
        result.put("list", documents);
        result.put("total", documents.size());
        
        return Result.success(result);
    }

    /**
     * 获取Wiki页面详情
     */
    @GetMapping("/pages/{id}")
    public Result<WikiDocument> detail(@PathVariable("id") Long id) {
        WikiDocument document = wikiDocumentMapper.selectById(id);
        return Result.success(document);
    }

    /**
     * 创建Wiki页面
     */
    @PostMapping("/pages")
    public Result<WikiDocument> create(@RequestBody WikiDocument document) {
        document.setCreatedAt(LocalDateTime.now());
        document.setUpdatedAt(LocalDateTime.now());
        document.setDeleted(0);
        wikiDocumentMapper.insert(document);
        return Result.success(document);
    }

    /**
     * 更新Wiki页面
     */
    @PutMapping("/pages/{id}")
    public Result<WikiDocument> update(@PathVariable("id") Long id, @RequestBody WikiDocument document) {
        document.setId(id);
        document.setUpdatedAt(LocalDateTime.now());
        wikiDocumentMapper.updateById(document);
        return Result.success(wikiDocumentMapper.selectById(id));
    }

    /**
     * 删除Wiki页面
     */
    @DeleteMapping("/pages/{id}")
    public Result<Void> delete(@PathVariable("id") Long id) {
        WikiDocument document = wikiDocumentMapper.selectById(id);
        if (document != null) {
            document.setDeleted(1);
            wikiDocumentMapper.updateById(document);
        }
        return Result.success();
    }

    /**
     * 获取Wiki树形结构
     */
    @GetMapping("/tree")
    public Result<List<WikiDocument>> tree(
            @RequestParam(value = "projectId") Long projectId) {
        
        LambdaQueryWrapper<WikiDocument> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WikiDocument::getProjectId, projectId);
        wrapper.eq(WikiDocument::getDeleted, 0);
        wrapper.orderByAsc(WikiDocument::getSort);
        
        List<WikiDocument> documents = wikiDocumentMapper.selectList(wrapper);
        return Result.success(documents);
    }
}