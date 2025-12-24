package com.mota.project.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 项目列表响应DTO
 */
@Data
public class ProjectListResponse {

    /**
     * 项目列表
     */
    private List<ProjectItem> list;

    /**
     * 总数
     */
    private Long total;

    /**
     * 当前页
     */
    private Integer page;

    /**
     * 每页数量
     */
    private Integer pageSize;

    /**
     * 项目列表项
     */
    @Data
    public static class ProjectItem {
        /**
         * 项目ID
         */
        private Long id;

        /**
         * 项目名称
         */
        private String name;

        /**
         * 项目标识
         */
        private String key;

        /**
         * 项目描述
         */
        private String description;

        /**
         * 状态
         */
        private String status;

        /**
         * 负责人ID
         */
        private Long ownerId;

        /**
         * 负责人名称
         */
        private String ownerName;

        /**
         * 负责人头像
         */
        private String ownerAvatar;

        /**
         * 颜色
         */
        private String color;

        /**
         * 是否收藏
         */
        private Integer starred;

        /**
         * 进度
         */
        private Integer progress;

        /**
         * 成员数量
         */
        private Integer memberCount;

        /**
         * 任务数量
         */
        private Integer issueCount;

        /**
         * 项目开始日期
         */
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate startDate;

        /**
         * 项目结束日期
         */
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate endDate;

        /**
         * 优先级
         */
        private String priority;

        /**
         * 创建时间
         */
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime createdAt;

        /**
         * 更新时间
         */
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime updatedAt;
    }
}