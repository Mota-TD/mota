package com.mota.project.entity.proposal;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 图表建议实体 (AG-007 图表建议)
 */
@Data
@TableName("ai_chart_suggestion")
public class ChartSuggestion {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 方案ID
     */
    private Long proposalId;
    
    /**
     * 章节ID
     */
    private Long sectionId;
    
    /**
     * 图表类型(bar/line/pie/table/flow/gantt)
     */
    private String chartType;
    
    /**
     * 图表标题
     */
    private String title;
    
    /**
     * 图表描述
     */
    private String description;
    
    /**
     * 数据来源说明
     */
    private String dataSource;
    
    /**
     * 示例数据(JSON)
     */
    private String sampleData;
    
    /**
     * 图表配置(JSON)
     */
    private String chartConfig;
    
    /**
     * 建议位置
     */
    private String position;
    
    /**
     * 是否已应用
     */
    private Boolean isApplied;
    
    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}