package com.mota.search.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 搜索热词实体
 * 
 * @author mota
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("search_hotword")
public class SearchHotword {

    /**
     * 主键ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 租户ID（null表示全局热词）
     */
    private Long tenantId;

    /**
     * 热词关键词
     */
    private String keyword;

    /**
     * 搜索次数
     */
    private Long searchCount;

    /**
     * 点击次数
     */
    private Long clickCount;

    /**
     * 点击率
     */
    private Double clickRate;

    /**
     * 热度分数（综合计算）
     */
    private Double hotScore;

    /**
     * 热词类型：auto/manual
     * auto: 自动统计生成
     * manual: 人工配置
     */
    private String type;

    /**
     * 是否推荐展示
     */
    private Boolean recommended;

    /**
     * 排序权重
     */
    private Integer sortOrder;

    /**
     * 统计周期：daily/weekly/monthly/all
     */
    private String period;

    /**
     * 统计日期
     */
    private LocalDateTime statDate;

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
    
    // ========== 别名方法（兼容服务层调用）==========
    
    /**
     * 趋势（非数据库字段）
     */
    @TableField(exist = false)
    private String trend;
    
    /**
     * 是否新词（非数据库字段）
     */
    @TableField(exist = false)
    private Boolean isNew;
    
    /**
     * 排名（非数据库字段）
     */
    @TableField(exist = false)
    private Integer ranking;
    
    /**
     * 获取趋势
     */
    public String getTrend() {
        return this.trend;
    }
    
    /**
     * 设置趋势
     */
    public void setTrend(String trend) {
        this.trend = trend;
    }
    
    /**
     * 获取是否新词
     */
    public Boolean getIsNew() {
        return this.isNew;
    }
    
    /**
     * 设置是否新词
     */
    public void setIsNew(Boolean isNew) {
        this.isNew = isNew;
    }
    
    /**
     * 获取是否推荐（别名方法，映射到recommended）
     */
    public Boolean getIsRecommended() {
        return this.recommended;
    }
    
    /**
     * 设置是否推荐（别名方法，映射到recommended）
     */
    public void setIsRecommended(Boolean isRecommended) {
        this.recommended = isRecommended;
    }
    
    /**
     * 获取排名
     */
    public Integer getRanking() {
        return this.ranking;
    }
    
    /**
     * 设置排名
     */
    public void setRanking(Integer ranking) {
        this.ranking = ranking;
    }
    
    /**
     * 获取创建时间（别名方法，映射到createdAt）
     */
    public LocalDateTime getCreateTime() {
        return this.createdAt;
    }
    
    /**
     * 设置创建时间（别名方法，映射到createdAt）
     */
    public void setCreateTime(LocalDateTime createTime) {
        this.createdAt = createTime;
    }
    
    /**
     * 获取更新时间（别名方法，映射到updatedAt）
     */
    public LocalDateTime getUpdateTime() {
        return this.updatedAt;
    }
    
    /**
     * 设置更新时间（别名方法，映射到updatedAt）
     */
    public void setUpdateTime(LocalDateTime updateTime) {
        this.updatedAt = updateTime;
    }
}