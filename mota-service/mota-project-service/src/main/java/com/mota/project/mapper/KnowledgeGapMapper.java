package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.project.entity.KnowledgeGap;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 知识缺口Mapper
 */
@Mapper
public interface KnowledgeGapMapper extends BaseMapper<KnowledgeGap> {

    /**
     * 分页获取知识缺口列表
     */
    Page<KnowledgeGap> getGapList(Page<KnowledgeGap> page,
                                   @Param("projectId") Long projectId,
                                   @Param("gapType") String gapType,
                                   @Param("status") String status,
                                   @Param("priority") String priority);

    /**
     * 获取缺口统计
     */
    Map<String, Object> getGapStats(@Param("projectId") Long projectId);

    /**
     * 获取缺口类型分布
     */
    List<Map<String, Object>> getGapTypeDistribution(@Param("projectId") Long projectId);

    /**
     * 获取优先级分布
     */
    List<Map<String, Object>> getPriorityDistribution(@Param("projectId") Long projectId);

    /**
     * 获取高优先级未解决缺口
     */
    List<KnowledgeGap> getHighPriorityOpenGaps(@Param("projectId") Long projectId,
                                                @Param("limit") Integer limit);

    /**
     * 更新缺口出现次数
     */
    void incrementOccurrenceCount(@Param("id") Long id);

    /**
     * 根据关键词查找或创建缺口
     */
    KnowledgeGap findByKeyword(@Param("keyword") String keyword,
                                @Param("projectId") Long projectId,
                                @Param("gapType") String gapType);
}