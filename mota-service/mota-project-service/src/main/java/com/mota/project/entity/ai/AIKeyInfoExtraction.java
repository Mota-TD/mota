package com.mota.project.entity.ai;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 关键信息提取实体
 * 对应功能: AI-005 关键信息提取
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("ai_key_info_extraction")
public class AIKeyInfoExtraction implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 关联文档ID
     */
    private Long documentId;

    /**
     * 提取类型(entity/relation/event)
     */
    private String extractionType;

    // ========== 实体信息 ==========
    /**
     * 实体类型(person/org/location/date/money/product等)
     */
    private String entityType;

    /**
     * 实体文本
     */
    private String entityText;

    /**
     * 实体起始位置
     */
    private Integer entityStart;

    /**
     * 实体结束位置
     */
    private Integer entityEnd;

    // ========== 关系信息 ==========
    /**
     * 关系类型
     */
    private String relationType;

    /**
     * 主体实体
     */
    private String subjectEntity;

    /**
     * 客体实体
     */
    private String objectEntity;

    // ========== 事件信息 ==========
    /**
     * 事件类型
     */
    private String eventType;

    /**
     * 事件触发词
     */
    private String eventTrigger;

    /**
     * 事件论元 JSON
     */
    private String eventArguments;

    /**
     * 事件时间
     */
    private String eventTime;

    /**
     * 事件地点
     */
    private String eventLocation;

    /**
     * 提取置信度(0-100)
     */
    private BigDecimal confidence;

    /**
     * 上下文文本
     */
    private String contextText;

    /**
     * 其他元数据 JSON
     */
    private String metadata;

    /**
     * 提取状态
     */
    private String extractionStatus;

    /**
     * 创建者ID
     */
    private Long creatorId;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    // 提取类型常量
    public static final String TYPE_ENTITY = "entity";
    public static final String TYPE_RELATION = "relation";
    public static final String TYPE_EVENT = "event";

    // 实体类型常量
    public static final String ENTITY_PERSON = "person";
    public static final String ENTITY_ORG = "org";
    public static final String ENTITY_LOCATION = "location";
    public static final String ENTITY_DATE = "date";
    public static final String ENTITY_MONEY = "money";
    public static final String ENTITY_PRODUCT = "product";
}