package com.mota.project.dto.request;

import lombok.Data;

/**
 * 项目查询请求DTO
 */
@Data
public class ProjectQueryRequest {

    /**
     * 关键词搜索(项目名称/标识)
     */
    private String keyword;

    /**
     * 项目状态
     */
    private String status;

    /**
     * 优先级
     */
    private String priority;

    /**
     * 负责人ID
     */
    private Long ownerId;

    /**
     * 是否收藏
     */
    private Boolean starred;

    /**
     * 是否包含归档项目
     */
    private Boolean includeArchived;

    /**
     * 部门ID
     */
    private Long departmentId;

    /**
     * 页码
     */
    private Integer page = 1;

    /**
     * 每页数量
     */
    private Integer pageSize = 20;

    /**
     * 排序字段
     */
    private String sortBy = "createdAt";

    /**
     * 排序方向(asc/desc)
     */
    private String sortOrder = "desc";
}