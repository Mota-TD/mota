package com.mota.project.dto.resource;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 跨项目资源冲突数据 DTO
 * RM-006: 跨项目资源冲突检测
 */
@Data
public class ProjectConflictData {
    
    /**
     * 冲突总数
     */
    private Integer totalConflicts;
    
    /**
     * 高优先级冲突数
     */
    private Integer highPriorityConflicts;
    
    /**
     * 中优先级冲突数
     */
    private Integer mediumPriorityConflicts;
    
    /**
     * 低优先级冲突数
     */
    private Integer lowPriorityConflicts;
    
    /**
     * 已解决冲突数
     */
    private Integer resolvedConflicts;
    
    /**
     * 冲突列表
     */
    private List<Conflict> conflicts;
    
    /**
     * 受影响的用户列表
     */
    private List<AffectedUser> affectedUsers;
    
    /**
     * 冲突详情
     */
    @Data
    public static class Conflict {
        /**
         * 冲突ID
         */
        private Long conflictId;
        
        /**
         * 冲突类型：TIME_OVERLAP(时间重叠), RESOURCE_OVERLOAD(资源过载), SKILL_MISMATCH(技能不匹配), DEADLINE_CONFLICT(截止日期冲突)
         */
        private String conflictType;
        
        /**
         * 冲突级别：HIGH(高), MEDIUM(中), LOW(低)
         */
        private String conflictLevel;
        
        /**
         * 冲突描述
         */
        private String description;
        
        /**
         * 涉及的用户
         */
        private ConflictUser user;
        
        /**
         * 冲突的项目列表
         */
        private List<ConflictProject> projects;
        
        /**
         * 冲突的任务列表
         */
        private List<ConflictTask> tasks;
        
        /**
         * 冲突开始日期
         */
        private LocalDate conflictStartDate;
        
        /**
         * 冲突结束日期
         */
        private LocalDate conflictEndDate;
        
        /**
         * 冲突工时
         */
        private Double conflictHours;
        
        /**
         * 可用工时
         */
        private Double availableHours;
        
        /**
         * 超出工时
         */
        private Double excessHours;
        
        /**
         * 解决建议
         */
        private List<ResolutionSuggestion> suggestions;
        
        /**
         * 是否已解决
         */
        private Boolean resolved;
        
        /**
         * 解决方案
         */
        private String resolution;
        
        /**
         * 检测时间
         */
        private LocalDateTime detectedTime;
        
        /**
         * 解决时间
         */
        private LocalDateTime resolvedTime;
    }
    
    /**
     * 冲突用户
     */
    @Data
    public static class ConflictUser {
        /**
         * 用户ID
         */
        private Long userId;
        
        /**
         * 用户名
         */
        private String userName;
        
        /**
         * 用户头像
         */
        private String avatar;
        
        /**
         * 部门
         */
        private String department;
    }
    
    /**
     * 冲突项目
     */
    @Data
    public static class ConflictProject {
        /**
         * 项目ID
         */
        private Long projectId;
        
        /**
         * 项目名称
         */
        private String projectName;
        
        /**
         * 项目优先级
         */
        private String priority;
        
        /**
         * 分配工时
         */
        private Double allocatedHours;
    }
    
    /**
     * 冲突任务
     */
    @Data
    public static class ConflictTask {
        /**
         * 任务ID
         */
        private Long taskId;
        
        /**
         * 任务名称
         */
        private String taskName;
        
        /**
         * 所属项目ID
         */
        private Long projectId;
        
        /**
         * 所属项目名称
         */
        private String projectName;
        
        /**
         * 开始日期
         */
        private LocalDate startDate;
        
        /**
         * 结束日期
         */
        private LocalDate endDate;
        
        /**
         * 预估工时
         */
        private Double estimatedHours;
        
        /**
         * 优先级
         */
        private String priority;
    }
    
    /**
     * 解决建议
     */
    @Data
    public static class ResolutionSuggestion {
        /**
         * 建议类型：REASSIGN(重新分配), RESCHEDULE(重新排期), SPLIT(拆分任务), PRIORITIZE(调整优先级)
         */
        private String suggestionType;
        
        /**
         * 建议描述
         */
        private String description;
        
        /**
         * 影响评估
         */
        private String impactAssessment;
        
        /**
         * 推荐指数（1-5）
         */
        private Integer recommendationScore;
    }
    
    /**
     * 受影响的用户
     */
    @Data
    public static class AffectedUser {
        /**
         * 用户ID
         */
        private Long userId;
        
        /**
         * 用户名
         */
        private String userName;
        
        /**
         * 用户头像
         */
        private String avatar;
        
        /**
         * 冲突数量
         */
        private Integer conflictCount;
        
        /**
         * 涉及项目数
         */
        private Integer projectCount;
        
        /**
         * 超出工时
         */
        private Double excessHours;
    }
}