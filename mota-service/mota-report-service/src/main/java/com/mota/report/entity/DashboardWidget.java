package com.mota.report.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 仪表盘组件实体
 * 仪表盘中的各个可视化组件
 *
 * @author mota
 */
@Data
@TableName("dashboard_widget")
public class DashboardWidget {

    /**
     * 组件ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 仪表盘ID
     */
    private Long dashboardId;

    /**
     * 组件名称
     */
    private String name;

    /**
     * 组件类型：
     * - stat: 统计数值
     * - chart: 图表
     * - table: 表格
     * - list: 列表
     * - progress: 进度条
     * - gauge: 仪表盘
     * - map: 地图
     * - text: 文本
     * - image: 图片
     * - iframe: 嵌入页面
     */
    private String type;

    /**
     * 图表子类型（当type=chart时）：
     * line/bar/pie/scatter/radar/funnel/heatmap等
     */
    private String chartType;

    /**
     * 数据源类型：api/sql/static
     */
    private String dataSourceType;

    /**
     * 数据源配置（JSON）
     * API: {service, endpoint, method, params}
     * SQL: {database, query}
     * Static: {data}
     */
    private String dataSourceConfig;

    /**
     * 数据转换配置（JSON）
     * 包含：字段映射、计算公式、过滤条件等
     */
    private String transformConfig;

    /**
     * 组件配置（JSON）
     * 包含：标题、颜色、图例、坐标轴等
     */
    private String widgetConfig;

    /**
     * 位置配置（JSON）
     * 包含：x, y, width, height
     */
    private String positionConfig;

    /**
     * 刷新间隔（秒），0表示跟随仪表盘
     */
    private Integer refreshInterval;

    /**
     * 缓存时间（秒）
     */
    private Integer cacheSeconds;

    /**
     * 排序号
     */
    private Integer sortOrder;

    /**
     * 状态：0-禁用，1-启用
     */
    private Integer status;

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

    /**
     * 是否删除
     */
    @TableLogic
    private Boolean deleted;
}