package com.mota.project.controller;

import com.mota.common.core.result.Result;
import com.mota.common.security.util.SecurityUtils;
import com.mota.project.entity.Checklist;
import com.mota.project.entity.ChecklistItem;
import com.mota.project.service.ChecklistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 检查清单 Controller
 */
@Tag(name = "检查清单管理", description = "检查清单和清单项的增删改查")
@RestController
@RequestMapping("/api/v1/checklists")
@RequiredArgsConstructor
public class ChecklistController {

    private final ChecklistService checklistService;

    /**
     * 创建检查清单
     */
    @Operation(summary = "创建检查清单", description = "为指定任务创建检查清单")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "创建成功"),
        @ApiResponse(responseCode = "400", description = "请求参数错误")
    })
    @PostMapping
    public Result<Checklist> create(@RequestBody Checklist checklist) {
        Checklist created = checklistService.createChecklist(checklist);
        return Result.success(created);
    }

    /**
     * 创建检查清单（包含清单项）
     */
    @Operation(summary = "创建检查清单（含清单项）", description = "创建检查清单并同时添加清单项")
    @ApiResponse(responseCode = "200", description = "创建成功")
    @PostMapping("/with-items")
    public Result<Checklist> createWithItems(@RequestBody Map<String, Object> request) {
        Checklist checklist = new Checklist();
        checklist.setTaskId(Long.valueOf(request.get("taskId").toString()));
        checklist.setName((String) request.get("name"));
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> itemsData = (List<Map<String, Object>>) request.get("items");
        List<ChecklistItem> items = itemsData.stream().map(data -> {
            ChecklistItem item = new ChecklistItem();
            item.setContent((String) data.get("content"));
            if (data.get("assigneeId") != null) {
                item.setAssigneeId(Long.valueOf(data.get("assigneeId").toString()));
            }
            if (data.get("dueDate") != null) {
                item.setDueDate(java.time.LocalDate.parse((String) data.get("dueDate")));
            }
            return item;
        }).toList();
        
        Checklist created = checklistService.createChecklistWithItems(checklist, items);
        return Result.success(created);
    }

    /**
     * 更新检查清单
     */
    @Operation(summary = "更新检查清单", description = "更新检查清单信息")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "更新成功"),
        @ApiResponse(responseCode = "404", description = "检查清单不存在")
    })
    @PutMapping("/{id}")
    public Result<Checklist> update(
            @Parameter(description = "检查清单ID", required = true) @PathVariable Long id,
            @RequestBody Checklist checklist) {
        checklist.setId(id);
        Checklist updated = checklistService.updateChecklist(checklist);
        return Result.success(updated);
    }

    /**
     * 删除检查清单
     */
    @Operation(summary = "删除检查清单", description = "删除指定的检查清单及其所有清单项")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "删除成功"),
        @ApiResponse(responseCode = "404", description = "检查清单不存在")
    })
    @DeleteMapping("/{id}")
    public Result<Boolean> delete(
            @Parameter(description = "检查清单ID", required = true) @PathVariable Long id) {
        boolean result = checklistService.deleteChecklist(id);
        return Result.success(result);
    }

    /**
     * 获取检查清单详情
     */
    @Operation(summary = "获取检查清单详情", description = "根据ID获取检查清单详情")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/{id}")
    public Result<Checklist> getById(
            @Parameter(description = "检查清单ID", required = true) @PathVariable Long id) {
        Checklist checklist = checklistService.getById(id);
        return Result.success(checklist);
    }

    /**
     * 根据任务ID查询检查清单列表
     */
    @Operation(summary = "查询任务的检查清单", description = "查询指定任务的所有检查清单")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/task/{taskId}")
    public Result<List<Checklist>> listByTaskId(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId) {
        List<Checklist> list = checklistService.listByTaskId(taskId);
        return Result.success(list);
    }

    /**
     * 根据任务ID查询检查清单列表（包含清单项）
     */
    @Operation(summary = "查询任务的检查清单（含清单项）", description = "查询指定任务的所有检查清单及其清单项")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/task/{taskId}/with-items")
    public Result<List<Checklist>> listWithItemsByTaskId(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId) {
        List<Checklist> list = checklistService.listWithItemsByTaskId(taskId);
        return Result.success(list);
    }

    /**
     * 更新检查清单排序
     */
    @Operation(summary = "更新检查清单排序", description = "批量更新检查清单的排序顺序")
    @ApiResponse(responseCode = "200", description = "更新成功")
    @PutMapping("/sort-order")
    public Result<Boolean> updateSortOrder(@RequestBody List<Checklist> checklists) {
        boolean result = checklistService.updateSortOrder(checklists);
        return Result.success(result);
    }

    /**
     * 获取任务的检查清单完成情况
     */
    @Operation(summary = "获取任务检查清单完成情况", description = "获取指定任务的所有检查清单项完成情况")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/task/{taskId}/completion")
    public Result<Map<String, Object>> getTaskChecklistCompletion(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId) {
        Map<String, Object> completion = checklistService.getTaskChecklistCompletion(taskId);
        return Result.success(completion);
    }

    /**
     * 计算任务的检查清单完成百分比
     */
    @Operation(summary = "计算任务检查清单进度", description = "计算指定任务的检查清单完成百分比")
    @ApiResponse(responseCode = "200", description = "计算成功")
    @GetMapping("/task/{taskId}/progress")
    public Result<Integer> calculateTaskChecklistProgress(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId) {
        Integer progress = checklistService.calculateTaskChecklistProgress(taskId);
        return Result.success(progress);
    }

    // ==================== 清单项相关接口 ====================

    /**
     * 添加清单项
     */
    @Operation(summary = "添加清单项", description = "向检查清单添加清单项")
    @ApiResponse(responseCode = "200", description = "添加成功")
    @PostMapping("/{checklistId}/items")
    public Result<ChecklistItem> addItem(
            @Parameter(description = "检查清单ID", required = true) @PathVariable Long checklistId,
            @RequestBody ChecklistItem item) {
        item.setChecklistId(checklistId);
        ChecklistItem created = checklistService.addItem(item);
        return Result.success(created);
    }

    /**
     * 批量添加清单项
     */
    @Operation(summary = "批量添加清单项", description = "向检查清单批量添加清单项")
    @ApiResponse(responseCode = "200", description = "添加成功")
    @PostMapping("/{checklistId}/items/batch")
    public Result<Boolean> batchAddItems(
            @Parameter(description = "检查清单ID", required = true) @PathVariable Long checklistId,
            @RequestBody List<ChecklistItem> items) {
        items.forEach(item -> item.setChecklistId(checklistId));
        boolean result = checklistService.batchAddItems(items);
        return Result.success(result);
    }

    /**
     * 更新清单项
     */
    @Operation(summary = "更新清单项", description = "更新清单项信息")
    @ApiResponse(responseCode = "200", description = "更新成功")
    @PutMapping("/items/{itemId}")
    public Result<ChecklistItem> updateItem(
            @Parameter(description = "清单项ID", required = true) @PathVariable Long itemId,
            @RequestBody ChecklistItem item) {
        item.setId(itemId);
        ChecklistItem updated = checklistService.updateItem(item);
        return Result.success(updated);
    }

    /**
     * 删除清单项
     */
    @Operation(summary = "删除清单项", description = "删除指定的清单项")
    @ApiResponse(responseCode = "200", description = "删除成功")
    @DeleteMapping("/items/{itemId}")
    public Result<Boolean> deleteItem(
            @Parameter(description = "清单项ID", required = true) @PathVariable Long itemId) {
        boolean result = checklistService.deleteItem(itemId);
        return Result.success(result);
    }

    /**
     * 切换清单项完成状态
     */
    @Operation(summary = "切换清单项完成状态", description = "切换清单项的完成/未完成状态")
    @ApiResponse(responseCode = "200", description = "操作成功")
    @PutMapping("/items/{itemId}/toggle")
    public Result<Boolean> toggleItemCompleted(
            @Parameter(description = "清单项ID", required = true) @PathVariable Long itemId) {
        Long userId = null;
        try {
            userId = SecurityUtils.getUserId();
        } catch (Exception e) {
            userId = 1L; // 开发环境默认用户
        }
        boolean result = checklistService.toggleItemCompleted(itemId, userId);
        return Result.success(result);
    }

    /**
     * 更新清单项完成状态
     */
    @Operation(summary = "更新清单项完成状态", description = "设置清单项的完成状态")
    @ApiResponse(responseCode = "200", description = "操作成功")
    @PutMapping("/items/{itemId}/completed")
    public Result<Boolean> updateItemCompleted(
            @Parameter(description = "清单项ID", required = true) @PathVariable Long itemId,
            @RequestBody Map<String, Boolean> request) {
        Boolean completed = request.get("completed");
        Long userId = null;
        try {
            userId = SecurityUtils.getUserId();
        } catch (Exception e) {
            userId = 1L; // 开发环境默认用户
        }
        boolean result = checklistService.updateItemCompleted(itemId, completed, userId);
        return Result.success(result);
    }

    /**
     * 更新清单项排序
     */
    @Operation(summary = "更新清单项排序", description = "批量更新清单项的排序顺序")
    @ApiResponse(responseCode = "200", description = "更新成功")
    @PutMapping("/items/sort-order")
    public Result<Boolean> updateItemSortOrder(@RequestBody List<ChecklistItem> items) {
        boolean result = checklistService.updateItemSortOrder(items);
        return Result.success(result);
    }

    /**
     * 根据清单ID查询清单项列表
     */
    @Operation(summary = "查询清单的清单项", description = "查询指定检查清单的所有清单项")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/{checklistId}/items")
    public Result<List<ChecklistItem>> listItemsByChecklistId(
            @Parameter(description = "检查清单ID", required = true) @PathVariable Long checklistId) {
        List<ChecklistItem> list = checklistService.listItemsByChecklistId(checklistId);
        return Result.success(list);
    }

    /**
     * 获取检查清单的完成情况
     */
    @Operation(summary = "获取检查清单完成情况", description = "获取指定检查清单的完成情况")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/{checklistId}/completion")
    public Result<Map<String, Object>> getChecklistCompletion(
            @Parameter(description = "检查清单ID", required = true) @PathVariable Long checklistId) {
        Map<String, Object> completion = checklistService.getChecklistCompletion(checklistId);
        return Result.success(completion);
    }
}