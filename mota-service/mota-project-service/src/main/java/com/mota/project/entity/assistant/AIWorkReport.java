package com.mota.project.entity.assistant;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 工作报告实体
 * AA-008 工作报告生成
 */
@Data
@TableName("ai_work_report")
public class AIWorkReport {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 报告类型: daily/weekly/monthly/project/custom
     */
    private String reportType;
    
    /**
     * 报告范围: personal/team/project
     */
    private String reportScope;
    
    /**
     * 范围ID
     */
    private Long scopeId;
    
    /**
     * 报告标题
     */
    private String reportTitle;
    
    /**
     * 报告周期开始
     */
    private LocalDate reportPeriodStart;
    
    /**
     * 报告周期结束
     */
    private LocalDate reportPeriodEnd;
    
    /**
     * 报告内容
     */
    private String reportContent;
    
    /**
     * 摘要
     */
    private String summary;
    
    /**
     * 完成事项(JSON)
     */
    private String accomplishments;
    
    /**
     * 进行中事项(JSON)
     */
    private String inProgress;
    
    /**
     * 阻塞问题(JSON)
     */
    private String blockers;
    
    /**
     * 下一步计划(JSON)
     */
    private String nextSteps;
    
    /**
     * 指标数据(JSON)
     */
    private String metrics;
    
    /**
     * 图表配置(JSON)
     */
    private String charts;
    
    /**
     * 附件列表(JSON)
     */
    private String attachments;
    
    /**
     * 使用的模型
     */
    private String modelUsed;
    
    /**
     * 使用的Token数
     */
    private Integer tokensUsed;
    
    /**
     * 生成时间(毫秒)
     */
    private Integer generationTimeMs;
    
    /**
     * 是否草稿
     */
    private Boolean isDraft;
    
    /**
     * 是否已发送
     */
    private Boolean isSent;
    
    /**
     * 发送对象(JSON)
     */
    private String sentTo;
    
    /**
     * 发送时间
     */
    private LocalDateTime sentAt;
    
    /**
     * 用户评分
     */
    private Integer feedbackRating;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
}