package com.mota.project.entity.ai;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 表格提取记录实体
 * 对应功能: AI-004 表格提取
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("ai_table_extraction")
public class AITableExtraction implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 关联文档ID
     */
    private Long documentId;

    /**
     * 所在页码
     */
    private Integer pageNumber;

    /**
     * 表格序号(同一页可能有多个表格)
     */
    private Integer tableIndex;

    /**
     * 表格标题
     */
    private String tableTitle;

    /**
     * 行数
     */
    private Integer rowCount;

    /**
     * 列数
     */
    private Integer columnCount;

    /**
     * 表头信息 JSON
     */
    private String headers;

    /**
     * 表格数据(二维数组) JSON
     */
    private String tableData;

    /**
     * 表格HTML格式
     */
    private String tableHtml;

    /**
     * 表格Markdown格式
     */
    private String tableMarkdown;

    /**
     * 表格CSV格式
     */
    private String tableCsv;

    /**
     * 提取方法(auto/camelot/tabula/custom)
     */
    private String extractionMethod;

    /**
     * 提取置信度(0-100)
     */
    private BigDecimal confidence;

    /**
     * 提取状态(pending/processing/completed/failed)
     */
    private String extractionStatus;

    /**
     * 提取错误信息
     */
    private String extractionError;

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