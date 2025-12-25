package com.mota.project.entity.news;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 政策监控配置实体 (NW-004 政策监控)
 */
@Data
@TableName("news_policy_monitor")
public class PolicyMonitor {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 团队ID
     */
    private Long teamId;
    
    /**
     * 监控名称
     */
    private String monitorName;
    
    /**
     * 监控的政策类型(JSON)
     */
    private String policyTypes;
    
    /**
     * 监控的政策级别(JSON)
     */
    private String policyLevels;
    
    /**
     * 监控关键词(JSON)
     */
    private String keywords;
    
    /**
     * 关联行业(JSON)
     */
    private String industries;
    
    /**
     * 监控地区(JSON)
     */
    private String regions;
    
    /**
     * 监控部门(JSON)
     */
    private String departments;
    
    /**
     * 是否启用
     */
    private Boolean isEnabled;
    
    /**
     * 是否开启提醒
     */
    private Boolean alertEnabled;
    
    /**
     * 提醒渠道(JSON)
     */
    private String alertChannels;
    
    /**
     * 上次检查时间
     */
    private LocalDateTime lastCheckAt;
    
    /**
     * 匹配数量
     */
    private Integer matchedCount;
    
    /**
     * 创建者ID
     */
    private Long creatorId;
    
    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}