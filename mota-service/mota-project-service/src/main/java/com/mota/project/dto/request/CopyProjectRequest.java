package com.mota.project.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

/**
 * 复制项目请求
 */
@Data
@Schema(description = "复制项目请求")
public class CopyProjectRequest {

    /**
     * 源项目ID
     */
    @NotNull(message = "源项目ID不能为空")
    @Schema(description = "源项目ID", required = true)
    private Long sourceProjectId;

    /**
     * 新项目名称
     */
    @NotBlank(message = "新项目名称不能为空")
    @Size(max = 100, message = "项目名称不能超过100个字符")
    @Schema(description = "新项目名称", required = true)
    private String name;

    /**
     * 新项目标识
     */
    @Size(max = 20, message = "项目标识不能超过20个字符")
    @Schema(description = "新项目标识（可选，不填则自动生成）")
    private String key;

    /**
     * 新项目描述
     */
    @Size(max = 500, message = "项目描述不能超过500个字符")
    @Schema(description = "新项目描述")
    private String description;

    /**
     * 新项目负责人ID
     */
    @Schema(description = "新项目负责人ID（可选，不填则使用当前用户）")
    private Long ownerId;

    /**
     * 新项目开始日期
     */
    @Schema(description = "新项目开始日期")
    private LocalDate startDate;

    /**
     * 新项目结束日期
     */
    @Schema(description = "新项目结束日期")
    private LocalDate endDate;

    /**
     * 是否复制成员
     */
    @Schema(description = "是否复制成员", defaultValue = "true")
    private Boolean copyMembers = true;

    /**
     * 是否复制里程碑
     */
    @Schema(description = "是否复制里程碑", defaultValue = "true")
    private Boolean copyMilestones = true;

    /**
     * 是否复制任务
     */
    @Schema(description = "是否复制任务", defaultValue = "false")
    private Boolean copyTasks = false;

    /**
     * 是否复制工作流配置
     */
    @Schema(description = "是否复制工作流配置", defaultValue = "true")
    private Boolean copyWorkflow = true;

    /**
     * 是否复制文档
     */
    @Schema(description = "是否复制文档", defaultValue = "false")
    private Boolean copyDocuments = false;

    /**
     * 是否复制附件
     */
    @Schema(description = "是否复制附件", defaultValue = "false")
    private Boolean copyAttachments = false;

    /**
     * 日期偏移天数（用于调整里程碑和任务日期）
     */
    @Schema(description = "日期偏移天数")
    private Integer dateOffset;
}