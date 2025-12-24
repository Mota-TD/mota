package com.mota.project.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.common.core.result.Result;
import com.mota.project.entity.Deliverable;
import com.mota.project.service.DeliverableService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

/**
 * 交付物控制器
 */
@RestController
@RequestMapping("/api/v1/deliverables")
@RequiredArgsConstructor
public class DeliverableController {

    private final DeliverableService deliverableService;

    /**
     * 获取交付物列表（分页）
     */
    @GetMapping
    public Result<IPage<Deliverable>> list(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long taskId,
            @RequestParam(required = false) Long uploadedBy) {
        Page<Deliverable> pageParam = new Page<>(page, pageSize);
        IPage<Deliverable> result = deliverableService.pageDeliverables(pageParam, taskId, uploadedBy);
        return Result.success(result);
    }

    /**
     * 根据任务ID获取交付物列表
     */
    @GetMapping("/task/{taskId}")
    public Result<List<Deliverable>> getByTaskId(@PathVariable Long taskId) {
        List<Deliverable> deliverables = deliverableService.getByTaskId(taskId);
        return Result.success(deliverables);
    }

    /**
     * 根据用户ID获取交付物列表
     */
    @GetMapping("/user/{userId}")
    public Result<List<Deliverable>> getByUserId(@PathVariable Long userId) {
        List<Deliverable> deliverables = deliverableService.getByUserId(userId);
        return Result.success(deliverables);
    }

    /**
     * 获取交付物详情
     */
    @GetMapping("/{id}")
    public Result<Deliverable> getById(@PathVariable Long id) {
        Deliverable deliverable = deliverableService.getDetailById(id);
        return Result.success(deliverable);
    }

    /**
     * 创建交付物（不含文件）
     */
    @PostMapping
    public Result<Deliverable> create(@RequestBody Deliverable deliverable) {
        Deliverable created = deliverableService.createDeliverable(deliverable);
        return Result.success(created);
    }

    /**
     * 上传交付物（含文件）
     */
    @PostMapping("/upload")
    public Result<Deliverable> upload(
            @RequestParam("taskId") Long taskId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "description", required = false) String description) {
        // TODO: 实现文件上传逻辑，这里暂时使用模拟数据
        String fileName = file.getOriginalFilename();
        String fileUrl = "/uploads/deliverables/" + taskId + "/" + fileName;
        Long fileSize = file.getSize();
        String fileType = file.getContentType();
        
        Deliverable deliverable = deliverableService.uploadDeliverable(
                taskId, name, description, fileName, fileUrl, fileSize, fileType);
        return Result.success(deliverable);
    }

    /**
     * 更新交付物信息
     */
    @PutMapping("/{id}")
    public Result<Deliverable> update(@PathVariable Long id, @RequestBody Deliverable deliverable) {
        deliverable.setId(id);
        Deliverable updated = deliverableService.updateDeliverable(deliverable);
        return Result.success(updated);
    }

    /**
     * 删除交付物
     */
    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        boolean result = deliverableService.deleteDeliverable(id);
        return Result.success(result);
    }

    /**
     * 下载交付物
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        Deliverable deliverable = deliverableService.getDetailById(id);
        
        try {
            // TODO: 实现实际的文件下载逻辑
            Path filePath = Paths.get(deliverable.getFileUrl());
            Resource resource = new UrlResource(filePath.toUri());
            
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + deliverable.getFileName() + "\"")
                    .body(resource);
        } catch (MalformedURLException e) {
            throw new RuntimeException("文件下载失败", e);
        }
    }

    /**
     * 获取交付物预览URL
     */
    @GetMapping("/{id}/preview")
    public Result<String> getPreviewUrl(@PathVariable Long id) {
        String previewUrl = deliverableService.getPreviewUrl(id);
        return Result.success(previewUrl);
    }

    /**
     * 获取任务的交付物数量
     */
    @GetMapping("/task/{taskId}/count")
    public Result<Integer> countByTaskId(@PathVariable Long taskId) {
        int count = deliverableService.countByTaskId(taskId);
        return Result.success(count);
    }
}