package com.mota.project.entity.ai;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 语音转文字记录实体
 * 对应功能: AI-003 语音转文字
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("ai_speech_to_text")
public class AISpeechToText implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 关联文档ID
     */
    private Long documentId;

    /**
     * 音频/视频文件路径
     */
    private String audioPath;

    /**
     * 文件类型(mp3/wav/mp4/avi/mov)
     */
    private String audioType;

    /**
     * 时长(秒)
     */
    private Integer duration;

    /**
     * 文件大小(字节)
     */
    private Long fileSize;

    /**
     * STT引擎(whisper/azure/google/aliyun)
     */
    private String sttEngine;

    /**
     * 识别语言
     */
    private String sttLanguage;

    /**
     * 转写的文本
     */
    private String transcribedText;

    /**
     * 分段信息(时间戳+文本) JSON
     */
    private String segments;

    /**
     * 说话人分离信息 JSON
     */
    private String speakers;

    /**
     * 识别置信度(0-100)
     */
    private BigDecimal confidence;

    /**
     * 转写状态(pending/processing/completed/failed)
     */
    private String sttStatus;

    /**
     * 转写错误信息
     */
    private String sttError;

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