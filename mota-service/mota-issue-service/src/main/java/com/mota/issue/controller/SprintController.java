package com.mota.issue.controller;

import com.mota.common.core.result.Result;
import com.mota.issue.entity.Sprint;
import com.mota.issue.service.SprintService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 迭代控制器
 */
@RestController
@RequestMapping("/api/v1/sprints")
@RequiredArgsConstructor
public class SprintController {

    private final SprintService sprintService;

    /**
     * 获取迭代列表
     */
    @GetMapping
    public Result<List<Sprint>> list(
            @RequestParam(value = "projectId", required = false) Long projectId,
            @RequestParam(value = "status", required = false) String status) {
        List<Sprint> sprints = sprintService.getSprintList(projectId, status);
        return Result.success(sprints);
    }

    /**
     * 获取迭代详情
     */
    @GetMapping("/{id}")
    public Result<Sprint> detail(@PathVariable("id") Long id) {
        Sprint sprint = sprintService.getSprintDetail(id);
        return Result.success(sprint);
    }

    /**
     * 创建迭代
     */
    @PostMapping
    public Result<Sprint> create(@RequestBody Sprint sprint) {
        Sprint created = sprintService.createSprint(sprint);
        return Result.success(created);
    }

    /**
     * 更新迭代
     */
    @PutMapping("/{id}")
    public Result<Sprint> update(@PathVariable("id") Long id, @RequestBody Sprint sprint) {
        Sprint updated = sprintService.updateSprint(id, sprint);
        return Result.success(updated);
    }

    /**
     * 删除迭代
     */
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable("id") Long id) {
        sprintService.deleteSprint(id);
        return Result.success();
    }

    /**
     * 开始迭代
     */
    @PostMapping("/{id}/start")
    public Result<Void> start(@PathVariable("id") Long id) {
        sprintService.startSprint(id);
        return Result.success();
    }

    /**
     * 完成迭代
     */
    @PostMapping("/{id}/complete")
    public Result<Void> complete(@PathVariable("id") Long id) {
        sprintService.completeSprint(id);
        return Result.success();
    }
}