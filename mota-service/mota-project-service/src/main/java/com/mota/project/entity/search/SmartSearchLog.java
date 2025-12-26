package com.mota.project.entity.search;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 智能搜索日志实体
 */
@Data
@TableName("search_log")
public class SmartSearchLog {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 会话ID
     */
    private String sessionId;
    
    /**
     * 搜索词
     */
    private String queryText;
    
    /**
     * 搜索类型(keyword/semantic/hybrid)
     */
    private String queryType;
    
    /**
     * 纠错后的搜索词
     */
    private String correctedQuery;
    
    /**
     * 识别的意图
     */
    private String detectedIntent;
    
    /**
     * 筛选条件(JSON)
     */
    private String filters;
    
    /**
     * 结果数量
     */
    private Integer resultCount;
    
    /**
     * 点击的结果(JSON)
     */
    private String clickedResults;
    
    /**
     * 搜索耗时(毫秒)
     */
    private Integer searchTimeMs;
    
    /**
     * 是否成功
     */
    private Boolean isSuccessful;
    
    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}