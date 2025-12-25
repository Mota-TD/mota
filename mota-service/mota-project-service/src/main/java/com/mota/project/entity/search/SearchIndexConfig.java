package com.mota.project.entity.search;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 搜索索引配置实体
 */
@Data
@TableName("search_index_config")
public class SearchIndexConfig {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 索引名称
     */
    private String indexName;
    
    /**
     * 索引类型(document/task/project/knowledge)
     */
    private String indexType;
    
    /**
     * 关联表名
     */
    private String tableName;
    
    /**
     * 字段映射配置(JSON)
     */
    private String fieldMappings;
    
    /**
     * 分析器配置(JSON)
     */
    private String analyzerConfig;
    
    /**
     * 向量化配置(JSON)
     */
    private String vectorConfig;
    
    /**
     * 是否启用
     */
    private Boolean isEnabled;
    
    /**
     * 最后同步时间
     */
    private LocalDateTime lastSyncAt;
    
    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}