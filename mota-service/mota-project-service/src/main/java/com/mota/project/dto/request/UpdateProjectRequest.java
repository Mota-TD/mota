package com.mota.project.dto.request;

import lombok.Data;

import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/**
 * 更新项目请求DTO
 */
@Data
public class UpdateProjectRequest {

    /**
     * 项目名称
     */
    @Size(max = 200, message = "项目名称不能超过200个字符")
    private String name;

    /**
     * 项目描述
     */
    @Size(max = 2000, message = "项目描述不能超过2000个字符")
    private String description;

    /**
     * 项目颜色
     */
    private String color;

    /**
     * 项目状态
     */
    private String status;

    /**
     * 项目开始日期
     */
    private LocalDate startDate;

    /**
     * 项目结束日期
     */
    private LocalDate endDate;

    /**
     * 项目负责人ID
     */
    private Long ownerId;

    /**
     * 优先级(low/medium/high/urgent)
     */
    private String priority;

    /**
     * 可见性(private/internal/public)
     */
    private String visibility;

    /**
     * 进度(0-100)
     */
    private Integer progress;
}