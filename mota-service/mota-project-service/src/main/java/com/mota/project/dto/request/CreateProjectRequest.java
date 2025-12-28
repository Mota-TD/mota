package com.mota.project.dto.request;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

/**
 * 创建项目请求DTO
 */
@Data
public class CreateProjectRequest {

    /**
     * 项目名称
     */
    @NotBlank(message = "项目名称不能为空")
    @Size(max = 200, message = "项目名称不能超过200个字符")
    private String name;

    /**
     * 项目标识（系统自动生成，格式：AF-0000，不允许用户修改）
     * 此字段由系统自动生成，前端无需传递
     */
    private String key;

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
     * 参与部门ID列表
     */
    private List<Long> departmentIds;

    /**
     * 项目成员ID列表
     */
    private List<Long> memberIds;

    /**
     * 里程碑列表
     */
    private List<MilestoneRequest> milestones;

    /**
     * 里程碑请求
     */
    @Data
    public static class MilestoneRequest {
        @NotBlank(message = "里程碑名称不能为空")
        private String name;
        
        private LocalDate targetDate;
        
        private String description;
        
        /**
         * 里程碑负责人ID列表（支持多负责人）
         */
        private List<Long> assigneeIds;
        
        /**
         * 里程碑下的部门任务分配列表
         */
        private List<DepartmentTaskAssignment> departmentTasks;
    }
    
    /**
     * 部门任务分配请求
     */
    @Data
    public static class DepartmentTaskAssignment {
        /**
         * 负责部门ID
         */
        private Long departmentId;
        
        /**
         * 部门负责人ID
         */
        private Long managerId;
        
        /**
         * 任务名称（可选，默认使用里程碑名称+部门名称）
         */
        private String name;
        
        /**
         * 任务描述
         */
        private String description;
        
        /**
         * 优先级(low/medium/high/urgent)
         */
        private String priority;
        
        /**
         * 开始日期
         */
        private LocalDate startDate;
        
        /**
         * 截止日期
         */
        private LocalDate endDate;
        
        /**
         * 是否需要提交工作计划(默认true)
         */
        private Boolean requirePlan;
        
        /**
         * 工作计划是否需要审批(默认true)
         */
        private Boolean requireApproval;
    }
}