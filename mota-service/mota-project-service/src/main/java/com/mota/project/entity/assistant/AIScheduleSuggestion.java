package com.mota.project.entity.assistant;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 日程建议实体
 * AA-007 日程安排建议
 */
@Data
@TableName("ai_schedule_suggestion")
public class AIScheduleSuggestion {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 建议类型: optimize/conflict/reminder/focus/break
     */
    private String suggestionType;
    
    /**
     * 建议日期
     */
    private LocalDate suggestionDate;
    
    /**
     * 建议标题
     */
    private String suggestionTitle;
    
    /**
     * 建议内容
     */
    private String suggestionContent;
    
    /**
     * 当前日程(JSON)
     */
    private String currentSchedule;
    
    /**
     * 建议日程(JSON)
     */
    private String suggestedSchedule;
    
    /**
     * 受影响的事件(JSON)
     */
    private String affectedEvents;
    
    /**
     * 优化评分
     */
    private BigDecimal optimizationScore;
    
    /**
     * 节省时间(分钟)
     */
    private Integer timeSavedMinutes;
    
    /**
     * 优先级: 1-5
     */
    private Integer priorityLevel;
    
    /**
     * 是否已读
     */
    private Boolean isRead;
    
    /**
     * 是否应用
     */
    private Boolean isApplied;
    
    /**
     * 是否忽略
     */
    private Boolean isDismissed;
    
    /**
     * 反馈评论
     */
    private String feedbackComment;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
}