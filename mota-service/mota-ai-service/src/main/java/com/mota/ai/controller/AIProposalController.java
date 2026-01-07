package com.mota.ai.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.mota.ai.entity.AIProposal;
import com.mota.ai.service.AIProposalService;
import com.mota.common.core.result.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * AI方案控制器
 */
@RestController
@RequestMapping("/api/v1/ai/proposal")
@RequiredArgsConstructor
public class AIProposalController {

    private final AIProposalService aiProposalService;

    /**
     * 生成方案
     */
    @PostMapping("/generate")
    public Result<AIProposal> generateProposal(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        Long enterpriseId = request.get("enterpriseId") != null ? 
            Long.valueOf(request.get("enterpriseId").toString()) : null;
        Long projectId = request.get("projectId") != null ? 
            Long.valueOf(request.get("projectId").toString()) : null;
        String title = (String) request.get("title");
        String description = (String) request.get("description");
        String type = (String) request.getOrDefault("type", "general");
        
        AIProposal proposal = aiProposalService.generateProposal(userId, enterpriseId, projectId, title, description, type);
        return Result.success(proposal);
    }

    /**
     * 获取方案列表
     */
    @GetMapping
    public Result<IPage<AIProposal>> getProposalList(
            @RequestParam Long userId,
            @RequestParam(required = false) Long enterpriseId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        IPage<AIProposal> proposals = aiProposalService.getProposalList(userId, enterpriseId, page, size);
        return Result.success(proposals);
    }

    /**
     * 获取方案详情
     */
    @GetMapping("/{id}")
    public Result<AIProposal> getProposalById(@PathVariable Long id) {
        AIProposal proposal = aiProposalService.getProposalById(id);
        return Result.success(proposal);
    }

    /**
     * 更新方案
     */
    @PutMapping("/{id}")
    public Result<Void> updateProposal(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        aiProposalService.updateProposal(id, request.get("title"), request.get("content"));
        return Result.success();
    }

    /**
     * 发布方案
     */
    @PostMapping("/{id}/publish")
    public Result<Void> publishProposal(@PathVariable Long id) {
        aiProposalService.publishProposal(id);
        return Result.success();
    }

    /**
     * 归档方案
     */
    @PostMapping("/{id}/archive")
    public Result<Void> archiveProposal(@PathVariable Long id) {
        aiProposalService.archiveProposal(id);
        return Result.success();
    }

    /**
     * 删除方案
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteProposal(@PathVariable Long id) {
        aiProposalService.deleteProposal(id);
        return Result.success();
    }

    /**
     * 根据项目获取方案
     */
    @GetMapping("/project/{projectId}")
    public Result<IPage<AIProposal>> getProposalsByProject(
            @PathVariable Long projectId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        IPage<AIProposal> proposals = aiProposalService.getProposalsByProject(projectId, page, size);
        return Result.success(proposals);
    }
}