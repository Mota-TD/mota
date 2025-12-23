package com.mota.issue.controller;

import com.mota.common.core.result.Result;
import com.mota.issue.entity.Issue;
import com.mota.issue.service.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 任务控制器
 */
@RestController
@RequestMapping("/api/v1/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;

    /**
     * 获取任务列表
     */
    @GetMapping
    public Result<List<Issue>> list(
            @RequestParam(value = "projectId", required = false) Long projectId,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "assigneeId", required = false) Long assigneeId,
            @RequestParam(value = "sprintId", required = false) Long sprintId) {
        List<Issue> issues = issueService.getIssueList(projectId, status, type, assigneeId, sprintId);
        return Result.success(issues);
    }

    /**
     * 获取任务详情
     */
    @GetMapping("/{id}")
    public Result<Issue> detail(@PathVariable("id") Long id) {
        Issue issue = issueService.getIssueDetail(id);
        return Result.success(issue);
    }

    /**
     * 创建任务
     */
    @PostMapping
    public Result<Issue> create(@RequestBody Issue issue) {
        Issue created = issueService.createIssue(issue);
        return Result.success(created);
    }

    /**
     * 更新任务
     */
    @PutMapping("/{id}")
    public Result<Issue> update(@PathVariable("id") Long id, @RequestBody Issue issue) {
        Issue updated = issueService.updateIssue(id, issue);
        return Result.success(updated);
    }

    /**
     * 删除任务
     */
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable("id") Long id) {
        issueService.deleteIssue(id);
        return Result.success();
    }

    /**
     * 更新任务状态
     */
    @PatchMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable("id") Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        issueService.updateStatus(id, status);
        return Result.success();
    }
}