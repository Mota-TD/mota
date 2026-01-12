package com.mota.search.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 搜索历史记录实体
 * 
 * @author mota
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("search_history")
public class SearchHistory {

    /**
     * 主键ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 租户ID
     */
    private Long tenantId;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 搜索关键词
     */
    private String keyword;

    /**
     * 搜索类型：all/project/task/document/knowledge/user/news
     */
    private String searchType;

    /**
     * 搜索模式：fulltext/semantic/vector/hybrid
     */
    private String searchMode;

    /**
     * 搜索结果数量
     */
    private Integer resultCount;

    /**
     * 搜索耗时（毫秒）
     */
    private Long duration;

    /**
     * 是否点击了结果
     */
    private Boolean clicked;

    /**
     * 点击的文档ID
     */
    private String clickedDocId;

    /**
     * 点击位置（排名）
     */
    private Integer clickPosition;

    /**
     * 客户端IP
     */
    private String clientIp;

    /**
     * 用户代理
     */
    private String userAgent;

    /**
     * 搜索来源：web/app/api
     */
    private String source;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    // ========== 别名方法（兼容服务层调用）==========
    
    /**
     * 搜索类型列表（非数据库字段）
     */
    @TableField(exist = false)
    private String searchTypes;
    
    /**
     * 响应时间（非数据库字段，毫秒）
     */
    @TableField(exist = false)
    private Integer responseTime;
    
    /**
     * 点击时间（非数据库字段）
     */
    @TableField(exist = false)
    private LocalDateTime clickTime;
    
    /**
     * 获取搜索类型列表
     */
    public String getSearchTypes() {
        return this.searchTypes;
    }
    
    /**
     * 设置搜索类型列表
     */
    public void setSearchTypes(String searchTypes) {
        this.searchTypes = searchTypes;
    }
    
    /**
     * 获取响应时间
     */
    public Integer getResponseTime() {
        return this.responseTime;
    }
    
    /**
     * 设置响应时间
     */
    public void setResponseTime(Integer responseTime) {
        this.responseTime = responseTime;
        // 同时设置duration
        if (responseTime != null) {
            this.duration = responseTime.longValue();
        }
    }
    
    /**
     * 获取搜索时间（别名方法，映射到createdAt）
     */
    public LocalDateTime getSearchTime() {
        return this.createdAt;
    }
    
    /**
     * 设置搜索时间（别名方法，映射到createdAt）
     */
    public void setSearchTime(LocalDateTime searchTime) {
        this.createdAt = searchTime;
    }
    
    /**
     * 获取点击时间
     */
    public LocalDateTime getClickTime() {
        return this.clickTime;
    }
    
    /**
     * 设置点击时间
     */
    public void setClickTime(LocalDateTime clickTime) {
        this.clickTime = clickTime;
    }
}