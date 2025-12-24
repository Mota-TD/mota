package com.mota.project.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.common.core.result.Result;
import com.mota.project.entity.WorkPlan;
import com.mota.project.entity.WorkPlanAttachment;
import com.mota.project.service.WorkPlanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * 工作计划控制器
 */
@Tag(name = "工作计划管理", description = "工作计划的提交、审批和附件管理")
@RestController
@RequestMapping("/api/v1/work-plans")
@RequiredArgsConstructor
public class WorkPlanController {

    private final WorkPlanService workPlanService;

    /**
     * 获取工作计划列表（分页）
     */
    @Operation(summary = "获取工作计划列表", description = "分页获取工作计划列表，支持多条件筛选")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "查询成功"),
        @ApiResponse(responseCode = "401", description = "未授权")
    })
    @GetMapping
    public Result<IPage<WorkPlan>> list(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer page,
            @Parameter(description = "每页数量") @RequestParam(defaultValue = "10") Integer pageSize,
            @Parameter(description = "部门任务ID") @RequestParam(required = false) Long departmentTaskId,
            @Parameter(description = "项目ID") @RequestParam(required = false) Long projectId,
            @Parameter(description = "工作计划状态") @RequestParam(required = false) String status,
            @Parameter(description = "提交人ID") @RequestParam(required = false) Long submittedBy) {
        Page<WorkPlan> pageParam = new Page<>(page, pageSize);
        IPage<WorkPlan> result = workPlanService.pageWorkPlans(pageParam, departmentTaskId, projectId, status, submittedBy);
        return Result.success(result);
    }

    /**
     * 根据部门任务ID获取工作计划
     */
    @Operation(summary = "根据部门任务获取工作计划", description = "获取指定部门任务的工作计划")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/department-task/{departmentTaskId}")
    public Result<WorkPlan> getByDepartmentTaskId(
            @Parameter(description = "部门任务ID", required = true) @PathVariable Long departmentTaskId) {
        WorkPlan workPlan = workPlanService.getByDepartmentTaskId(departmentTaskId);
        return Result.success(workPlan);
    }

    /**
     * 获取工作计划详情
     */
    @Operation(summary = "获取工作计划详情", description = "根据ID获取工作计划详细信息")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "查询成功"),
        @ApiResponse(responseCode = "404", description = "工作计划不存在")
    })
    @GetMapping("/{id}")
    public Result<WorkPlan> getById(
            @Parameter(description = "工作计划ID", required = true) @PathVariable Long id) {
        WorkPlan workPlan = workPlanService.getDetailById(id);
        return Result.success(workPlan);
    }

    /**
     * 创建工作计划
     */
    @Operation(summary = "创建工作计划", description = "创建一个新的工作计划")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "创建成功"),
        @ApiResponse(responseCode = "400", description = "请求参数错误")
    })
    @PostMapping
    public Result<WorkPlan> create(@RequestBody WorkPlan workPlan) {
        WorkPlan created = workPlanService.createWorkPlan(workPlan);
        return Result.success(created);
    }

    /**
     * 更新工作计划
     */
    @Operation(summary = "更新工作计划", description = "更新工作计划信息")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "更新成功"),
        @ApiResponse(responseCode = "404", description = "工作计划不存在")
    })
    @PutMapping("/{id}")
    public Result<WorkPlan> update(
            @Parameter(description = "工作计划ID", required = true) @PathVariable Long id,
            @RequestBody WorkPlan workPlan) {
        workPlan.setId(id);
        WorkPlan updated = workPlanService.updateWorkPlan(workPlan);
        return Result.success(updated);
    }

    /**
     * 删除工作计划
     */
    @Operation(summary = "删除工作计划", description = "根据ID删除工作计划")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "删除成功"),
        @ApiResponse(responseCode = "404", description = "工作计划不存在")
    })
    @DeleteMapping("/{id}")
    public Result<Boolean> delete(
            @Parameter(description = "工作计划ID", required = true) @PathVariable Long id) {
        boolean result = workPlanService.deleteWorkPlan(id);
        return Result.success(result);
    }

    /**
     * 提交工作计划
     */
    @Operation(summary = "提交工作计划", description = "提交工作计划进行审批")
    @ApiResponse(responseCode = "200", description = "提交成功")
    @PostMapping("/{id}/submit")
    public Result<WorkPlan> submit(
            @Parameter(description = "工作计划ID", required = true) @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String summary = body != null ? body.get("summary") : null;
        String resourceRequirement = body != null ? body.get("resourceRequirement") : null;
        WorkPlan workPlan = workPlanService.submitWorkPlan(id, summary, resourceRequirement);
        return Result.success(workPlan);
    }

    /**
     * 审批工作计划
     */
    @Operation(summary = "审批工作计划", description = "审批通过或拒绝工作计划")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "审批成功"),
        @ApiResponse(responseCode = "400", description = "审批结果不能为空")
    })
    @PostMapping("/{id}/approve")
    public Result<WorkPlan> approve(
            @Parameter(description = "工作计划ID", required = true) @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Boolean approved = (Boolean) body.get("approved");
        String comment = (String) body.get("comment");
        if (approved == null) {
            return Result.fail("审批结果不能为空");
        }
        WorkPlan workPlan = workPlanService.approveWorkPlan(id, approved, comment);
        return Result.success(workPlan);
    }

    /**
     * 获取工作计划附件列表
     */
    @Operation(summary = "获取工作计划附件列表", description = "获取指定工作计划的所有附件")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/{workPlanId}/attachments")
    public Result<List<WorkPlanAttachment>> getAttachments(
            @Parameter(description = "工作计划ID", required = true) @PathVariable Long workPlanId) {
        List<WorkPlanAttachment> attachments = workPlanService.getAttachments(workPlanId);
        return Result.success(attachments);
    }

    /**
     * 上传工作计划附件
     */
    @Operation(summary = "上传工作计划附件", description = "为工作计划上传附件文件")
    @ApiResponse(responseCode = "200", description = "上传成功")
    @PostMapping("/{workPlanId}/attachments")
    public Result<WorkPlanAttachment> uploadAttachment(
            @Parameter(description = "工作计划ID", required = true) @PathVariable Long workPlanId,
            @Parameter(description = "附件文件", required = true) @RequestParam("file") MultipartFile file) {
        // TODO: 实现文件上传逻辑，这里暂时使用模拟数据
        String fileName = file.getOriginalFilename();
        String fileUrl = "/uploads/work-plans/" + workPlanId + "/" + fileName;
        Long fileSize = file.getSize();
        String fileType = file.getContentType();
        
        WorkPlanAttachment attachment = workPlanService.addAttachment(workPlanId, fileName, fileUrl, fileSize, fileType);
        return Result.success(attachment);
    }

    /**
     * 删除工作计划附件
     */
    @Operation(summary = "删除工作计划附件", description = "删除指定的工作计划附件")
    @ApiResponse(responseCode = "200", description = "删除成功")
    @DeleteMapping("/{workPlanId}/attachments/{attachmentId}")
    public Result<Boolean> deleteAttachment(
            @Parameter(description = "工作计划ID", required = true) @PathVariable Long workPlanId,
            @Parameter(description = "附件ID", required = true) @PathVariable Long attachmentId) {
        boolean result = workPlanService.deleteAttachment(workPlanId, attachmentId);
        return Result.success(result);
    }
}