package com.mota.ai.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * AI训练历史实体
 */
@Data
@TableName("ai_training_history")
public class AITrainingHistory {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 企业ID
     */
    private Long enterpriseId;

    /**
     * 模型版本
     */
    private String version;

    /**
     * 训练日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDateTime date;

    /**
     * 训练文档数量
     */
    private Integer documents;

    /**
     * 状态：training-训练中, completed-已完成, failed-失败
     */
    private String status;

    /**
     * 准确率
     */
    private BigDecimal accuracy;

    /**
     * 任务ID
     */
    private String taskId;

    /**
     * 训练进度（0-100）
     */
    private Integer progress;

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