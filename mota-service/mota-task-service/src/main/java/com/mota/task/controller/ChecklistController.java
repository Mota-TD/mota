package com.mota.task.controller;

import com.mota.common.core.result.Result;
import com.mota.common.security.annotation.RequiresLogin;
import com.mota.common.security.annotation.RequiresPermission;
import com.mota.task.entity.Checklist;
import com.mota.task.entity.ChecklistItem;
import com.mota.task.service.ChecklistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 检查清单控制器
 */
@Tag(name = "检查清单管理", description = "检查清单和检查项的CRUD接口")
@RestController
@RequestMapping("/api/v1/checklists")
@RequiredArgsConstructor
@RequiresLogin
public class ChecklistController {

    private final ChecklistService checklistService;

    @Operation(summary = "创建检查清单")
    @PostMapping
    @RequiresPermission("task:update")
    public Result<Checklist> createChecklist(
            @Parameter(description = "任务ID") @RequestParam Long taskId,
            @Parameter(description = "清单标题") @RequestParam String title) {
        Checklist checklist = checklistService.createChecklist(taskId, title);
        return Result.success(checklist);
    }

    @Operation(summary = "更新检查清单")
    @PutMapping("/{checklistId}")
    @RequiresPermission("task:update")
    public Result<Checklist> updateChecklist(
            @PathVariable Long checklistId,
            @Parameter(description = "清单标题") @RequestParam String title) {
        Checklist checklist = checklistService.updateChecklist(checklistId, title);
        return Result.success(checklist);
    }

    @Operation(summary = "删除检查清单")
    @DeleteMapping("/{checklistId}")
    @RequiresPermission("task:update")
    public Result<Void> deleteChecklist(@PathVariable Long checklistId) {
        checklistService.deleteChecklist(checklistId);
        return Result.success();
    }

    @Operation(summary = "获取任务的检查清单列表")
    @GetMapping("/task/{taskId}")
    public Result<List<Checklist>> getChecklistsByTask(@PathVariable Long taskId) {
        List<Checklist> checklists = checklistService.getChecklistsByTask(taskId);
        return Result.success(checklists);
    }

    @Operation(summary = "添加检查项")
    @PostMapping("/{checklistId}/items")
    @RequiresPermission("task:update")
    public Result<ChecklistItem> addItem(
            @PathVariable Long checklistId,
            @Parameter(description = "检查项内容") @RequestParam String content) {
        ChecklistItem item = checklistService.addItem(checklistId, content);
        return Result.success(item);
    }

    @Operation(summary = "更新检查项")
    @PutMapping("/items/{itemId}")
    @RequiresPermission("task:update")
    public Result<ChecklistItem> updateItem(
            @PathVariable Long itemId,
            @Parameter(description = "检查项内容") @RequestParam String content) {
        ChecklistItem item = checklistService.updateItem(itemId, content);
        return Result.success(item);
    }

    @Operation(summary = "删除检查项")
    @DeleteMapping("/items/{itemId}")
    @RequiresPermission("task:update")
    public Result<Void> deleteItem(@PathVariable Long itemId) {
        checklistService.deleteItem(itemId);
        return Result.success();
    }

    @Operation(summary = "完成检查项")
    @PutMapping("/items/{itemId}/complete")
    @RequiresPermission("task:update")
    public Result<Void> completeItem(@PathVariable Long itemId) {
        checklistService.completeItem(itemId);
        return Result.success();
    }

    @Operation(summary = "取消完成检查项")
    @PutMapping("/items/{itemId}/uncomplete")
    @RequiresPermission("task:update")
    public Result<Void> uncompleteItem(@PathVariable Long itemId) {
        checklistService.uncompleteItem(itemId);
        return Result.success();
    }

    @Operation(summary = "批量完成检查项")
    @PutMapping("/items/batch/complete")
    @RequiresPermission("task:update")
    public Result<Void> batchCompleteItems(
            @Parameter(description = "检查项ID列表") @RequestParam List<Long> itemIds) {
        checklistService.batchCompleteItems(itemIds);
        return Result.success();
    }

    @Operation(summary = "获取检查清单的所有项")
    @GetMapping("/{checklistId}/items")
    public Result<List<ChecklistItem>> getItemsByChecklist(@PathVariable Long checklistId) {
        List<ChecklistItem> items = checklistService.getItemsByChecklist(checklistId);
        return Result.success(items);
    }

    @Operation(summary = "获取检查清单完成进度")
    @GetMapping("/{checklistId}/progress")
    public Result<Integer> getChecklistProgress(@PathVariable Long checklistId) {
        int progress = checklistService.getChecklistProgress(checklistId);
        return Result.success(progress);
    }

    @Operation(summary = "调整检查项顺序")
    @PutMapping("/{checklistId}/items/reorder")
    @RequiresPermission("task:update")
    public Result<Void> reorderItems(
            @PathVariable Long checklistId,
            @Parameter(description = "检查项ID列表（按新顺序）") @RequestParam List<Long> itemIds) {
        checklistService.reorderItems(checklistId, itemIds);
        return Result.success();
    }

    @Operation(summary = "复制检查清单到另一个任务")
    @PostMapping("/{checklistId}/copy")
    @RequiresPermission("task:update")
    public Result<Checklist> copyChecklist(
            @PathVariable Long checklistId,
            @Parameter(description = "目标任务ID") @RequestParam Long targetTaskId) {
        Checklist checklist = checklistService.copyChecklist(checklistId, targetTaskId);
        return Result.success(checklist);
    }
}