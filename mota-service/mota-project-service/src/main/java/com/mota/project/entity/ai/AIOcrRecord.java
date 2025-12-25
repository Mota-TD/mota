package com.mota.project.entity.ai;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * OCR识别记录实体
 * 对应功能: AI-002 OCR识别
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("ai_ocr_record")
public class AIOcrRecord implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 关联文档ID
     */
    private Long documentId;

    /**
     * 图片路径
     */
    private String imagePath;

    /**
     * 图片类型(jpg/png/gif/bmp)
     */
    private String imageType;

    /**
     * 图片宽度
     */
    private Integer imageWidth;

    /**
     * 图片高度
     */
    private Integer imageHeight;

    /**
     * OCR引擎(tesseract/paddleocr/azure/google)
     */
    private String ocrEngine;

    /**
     * OCR语言
     */
    private String ocrLanguage;

    /**
     * 识别出的文本
     */
    private String recognizedText;

    /**
     * 识别置信度(0-100)
     */
    private BigDecimal confidence;

    /**
     * 文字区域坐标信息(JSON)
     */
    private String textRegions;

    /**
     * 识别状态(pending/processing/completed/failed)
     */
    private String ocrStatus;

    /**
     * 识别错误信息
     */
    private String ocrError;

    /**
     * 处理耗时(毫秒)
     */
    private Integer processingTime;

    /**
     * 创建者ID
     */
    private Long creatorId;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    public static final String STATUS_PENDING = "pending";
    public static final String STATUS_PROCESSING = "processing";
    public static final String STATUS_COMPLETED = "completed";
    public static final String STATUS_FAILED = "failed";
}