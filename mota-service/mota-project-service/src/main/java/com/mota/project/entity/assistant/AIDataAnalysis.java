package com.mota.project.entity.assistant;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 数据分析建议实体
 * AA-006 数据分析建议
 */
@Data
@TableName("ai_data_analysis")
public class AIDataAnalysis {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 分析类型: project/task/team/resource/trend
     */
    private String analysisType;
    
    /**
     * 分析范围: personal/team/project/organization
     */
    private String analysisScope;
    
    /**
     * 范围ID
     */
    private Long scopeId;
    
    /**
     * 时间范围: week/month/quarter/year
     */
    private String timeRange;
    
    /**
     * 开始日期
     */
    private LocalDate startDate;
    
    /**
     * 结束日期
     */
    private LocalDate endDate;
    
    /**
     * 分析标题
     */
    private String analysisTitle;
    
    /**
     * 分析内容
     */
    private String analysisContent;
    
    /**
     * 关键发现(JSON)
     */
    private String keyFindings;
    
    /**
     * 指标数据(JSON)
     */
    private String metrics;
    
    /**
     * 图表配置(JSON)
     */
    private String charts;
    
    /**
     * 建议列表(JSON)
     */
    private String recommendations;
    
    /**
     * 数据来源(JSON)
     */
    private String dataSources;
    
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
     * 是否保存
     */
    private Boolean isSaved;
    
    /**
     * 用户评分
     */
    private Integer feedbackRating;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
}