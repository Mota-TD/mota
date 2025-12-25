package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.KnowledgeReuseLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 知识复用记录Mapper
 */
@Mapper
public interface KnowledgeReuseLogMapper extends BaseMapper<KnowledgeReuseLog> {

    /**
     * 获取复用统计
     */
    Map<String, Object> getReuseStats(@Param("projectId") Long projectId,
                                       @Param("startDate") LocalDate startDate,
                                       @Param("endDate") LocalDate endDate);

    /**
     * 获取复用趋势
     */
    List<Map<String, Object>> getReuseTrend(@Param("projectId") Long projectId,
                                             @Param("startDate") LocalDate startDate,
                                             @Param("endDate") LocalDate endDate);

    /**
     * 获取复用类型分布
     */
    List<Map<String, Object>> getReuseTypeDistribution(@Param("projectId") Long projectId,
                                                        @Param("startDate") LocalDate startDate,
                                                        @Param("endDate") LocalDate endDate);

    /**
     * 获取高复用文档
     */
    List<Map<String, Object>> getHighReuseDocuments(@Param("projectId") Long projectId,
                                                     @Param("startDate") LocalDate startDate,
                                                     @Param("endDate") LocalDate endDate,
                                                     @Param("limit") Integer limit);

    /**
     * 获取文档复用详情
     */
    List<KnowledgeReuseLog> getDocumentReuseDetails(@Param("documentId") Long documentId,
                                                     @Param("startDate") LocalDate startDate,
                                                     @Param("endDate") LocalDate endDate);
}