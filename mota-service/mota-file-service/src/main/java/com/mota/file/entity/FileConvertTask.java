package com.mota.file.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 文件转换任务实体
 * 
 * @author mota
 */
@Data
@TableName("file_convert_task")
public class FileConvertTask {

    /**
     * 任务ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 租户ID
     */
    private Long tenantId;

    /**
     * 源文件ID
     */
    private Long sourceFileId;

    /**
     * 源文件路径
     */
    private String sourceFilePath;

    /**
     * 源文件格式
     */
    private String sourceFormat;

    /**
     * 目标格式
     */
    private String targetFormat;

    /**
     * 转换类型：preview/thumbnail/format/compress
     */
    private String convertType;

    /**
     * 转换参数（JSON格式）
     */
    private String convertParams;

    /**
     * 目标文件ID
     */
    private Long targetFileId;

    /**
     * 目标文件路径
     */
    private String targetFilePath;

    /**
     * 状态：0-待处理 1-处理中 2-已完成 3-失败
     */
    private Integer status;

    /**
     * 进度（0-100）
     */
    private Integer progress;

    /**
     * 错误信息
     */
    private String errorMessage;

    /**
     * 重试次数
     */
    private Integer retryCount;

    /**
     * 最大重试次数
     */
    private Integer maxRetry;

    /**
     * 优先级（数字越大优先级越高）
     */
    private Integer priority;

    /**
     * 开始时间
     */
    private LocalDateTime startTime;

    /**
     * 完成时间
     */
    private LocalDateTime completeTime;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    /**
     * 转换类型常量
     */
    public static class ConvertType {
        public static final String PREVIEW = "preview";
        public static final String THUMBNAIL = "thumbnail";
        public static final String FORMAT = "format";
        public static final String COMPRESS = "compress";
    }

    /**
     * 状态常量
     */
    public static class Status {
        public static final int PENDING = 0;
        public static final int PROCESSING = 1;
        public static final int COMPLETED = 2;
        public static final int FAILED = 3;
    }
}