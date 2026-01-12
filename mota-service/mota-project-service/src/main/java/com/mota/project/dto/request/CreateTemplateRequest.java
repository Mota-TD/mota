package com.mota.project.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

/**
 * 创建项目模板请求
 */
@Data
@Schema(description = "创建项目模板请求")
public class CreateTemplateRequest {

    /**
     * 模板名称
     */
    @NotBlank(message = "模板名称不能为空")
    @Size(max = 100, message = "模板名称不能超过100个字符")
    @Schema(description = "模板名称", required = true)
    private String name;

    /**
     * 模板描述
     */
    @Size(max = 500, message = "模板描述不能超过500个字符")
    @Schema(description = "模板描述")
    private String description;

    /**
     * 模板分类
     */
    @Schema(description = "模板分类")
    private String category;

    /**
     * 项目类型
     */
    @Schema(description = "项目类型(agile/waterfall/kanban)")
    private String projectType;

    /**
     * 是否为系统模板
     */
    @Schema(description = "是否为系统模板")
    private Boolean isSystem;

    /**
     * 模板图标
     */
    @Schema(description = "模板图标")
    private String icon;

    /**
     * 模板颜色
     */
    @Schema(description = "模板颜色")
    private String color;

    /**
     * 默认工作流状态列表
     */
    @Schema(description = "默认工作流状态列表")
    private List<WorkflowStatusConfig> workflowStatuses;

    /**
     * 默认里程碑列表
     */
    @Schema(description = "默认里程碑列表")
    private List<MilestoneConfig> milestones;

    /**
     * 默认任务模板列表
     */
    @Schema(description = "默认任务模板列表")
    private List<TaskTemplateConfig> taskTemplates;

    /**
     * 项目配置（JSON格式）
     */
    @Schema(description = "项目配置")
    private String settings;

    /**
     * 工作流状态配置
     */
    @Data
    @Schema(description = "工作流状态配置")
    public static class WorkflowStatusConfig {
        @Schema(description = "状态名称")
        private String name;
        
        @Schema(description = "状态类型(todo/in_progress/done)")
        private String type;
        
        @Schema(description = "状态颜色")
        private String color;
        
        @Schema(description = "排序顺序")
        private Integer sortOrder;
    }

    /**
     * 里程碑配置
     */
    @Data
    @Schema(description = "里程碑配置")
    public static class MilestoneConfig {
        @Schema(description = "里程碑名称")
        private String name;
        
        @Schema(description = "里程碑描述")
        private String description;
        
        @Schema(description = "相对开始天数（从项目开始日期算起）")
        private Integer relativeDays;
    }

    /**
     * 任务模板配置
     */
    @Data
    @Schema(description = "任务模板配置")
    public static class TaskTemplateConfig {
        @Schema(description = "任务名称")
        private String name;
        
        @Schema(description = "任务描述")
        private String description;
        
        @Schema(description = "优先级")
        private String priority;
        
        @Schema(description = "预估工时（小时）")
        private Integer estimatedHours;
        
        @Schema(description = "所属里程碑索引")
        private Integer milestoneIndex;
    }
}