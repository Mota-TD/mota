package com.mota.search.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 搜索文档实体
 * 用于Elasticsearch索引的通用文档结构
 * 
 * @author mota
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchDocument {

    /**
     * 文档ID（格式：{type}_{id}，如 project_123, task_456）
     */
    private String id;

    /**
     * 租户ID
     */
    private Long tenantId;

    /**
     * 文档类型：project/task/document/knowledge/user/news
     */
    private String type;

    /**
     * 原始业务ID
     */
    private Long businessId;

    /**
     * 标题
     */
    private String title;

    /**
     * 内容/描述
     */
    private String content;

    /**
     * 摘要（用于搜索结果展示）
     */
    private String summary;

    /**
     * 标签列表
     */
    private List<String> tags;

    /**
     * 分类
     */
    private String category;

    /**
     * 状态
     */
    private String status;

    /**
     * 优先级
     */
    private String priority;

    /**
     * 创建者ID
     */
    private Long creatorId;

    /**
     * 创建者名称
     */
    private String creatorName;

    /**
     * 所属项目ID（如果适用）
     */
    private Long projectId;

    /**
     * 所属项目名称
     */
    private String projectName;

    /**
     * 关联用户ID列表（参与者、负责人等）
     */
    private List<Long> relatedUserIds;

    /**
     * 附件文件名列表
     */
    private List<String> attachments;

    /**
     * 扩展属性（JSON格式存储的额外字段）
     */
    private Map<String, Object> metadata;

    /**
     * 向量嵌入（用于语义搜索）
     */
    private List<Float> embedding;

    /**
     * 访问量/热度
     */
    private Long viewCount;

    /**
     * 权重/评分
     */
    private Double weight;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;

    /**
     * 是否已删除
     */
    private Boolean deleted;

    /**
     * 生成文档ID
     */
    public static String generateId(String type, Long businessId) {
        return type + "_" + businessId;
    }
    
    // ========== 别名方法（兼容服务层调用）==========
    
    /**
     * 获取创建时间（字符串格式）
     */
    public String getCreateTime() {
        return this.createdAt != null ? this.createdAt.toString() : null;
    }
    
    /**
     * 设置创建时间（字符串格式）
     */
    public void setCreateTime(String createTime) {
        // 字符串格式的时间设置，用于兼容
        if (createTime != null && !createTime.isEmpty()) {
            try {
                this.createdAt = java.time.LocalDateTime.parse(createTime);
            } catch (Exception e) {
                // 忽略解析错误
            }
        }
    }
    
    /**
     * 获取更新时间（字符串格式）
     */
    public String getUpdateTime() {
        return this.updatedAt != null ? this.updatedAt.toString() : null;
    }
    
    /**
     * 设置更新时间（字符串格式）
     */
    public void setUpdateTime(String updateTime) {
        // 字符串格式的时间设置，用于兼容
        if (updateTime != null && !updateTime.isEmpty()) {
            try {
                this.updatedAt = java.time.LocalDateTime.parse(updateTime);
            } catch (Exception e) {
                // 忽略解析错误
            }
        }
    }
}