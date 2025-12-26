package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.DocumentAccessLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 文档访问记录Mapper
 */
@Mapper
public interface DocumentAccessLogMapper extends BaseMapper<DocumentAccessLog> {

    /**
     * 获取文档访问统计
     */
    Map<String, Object> getDocumentAccessStats(@Param("documentId") Long documentId,
                                                @Param("startDate") LocalDate startDate,
                                                @Param("endDate") LocalDate endDate);

    /**
     * 获取访问趋势数据
     */
    List<Map<String, Object>> getAccessTrend(@Param("projectId") Long projectId,
                                              @Param("startDate") LocalDate startDate,
                                              @Param("endDate") LocalDate endDate,
                                              @Param("groupBy") String groupBy);

    /**
     * 获取访问来源分布
     */
    List<Map<String, Object>> getAccessSourceDistribution(@Param("projectId") Long projectId,
                                                           @Param("startDate") LocalDate startDate,
                                                           @Param("endDate") LocalDate endDate);

    /**
     * 获取设备类型分布
     */
    List<Map<String, Object>> getDeviceTypeDistribution(@Param("projectId") Long projectId,
                                                         @Param("startDate") LocalDate startDate,
                                                         @Param("endDate") LocalDate endDate);

    /**
     * 获取独立访客数
     */
    Integer getUniqueVisitors(@Param("documentId") Long documentId,
                              @Param("startDate") LocalDate startDate,
                              @Param("endDate") LocalDate endDate);

    /**
     * 插入或更新访问记录
     */
    void upsertAccessLog(@Param("userId") Long userId,
                         @Param("documentId") Long documentId,
                         @Param("accessType") String accessType);

    /**
     * 获取用户最近访问记录（带详情）
     */
    List<DocumentAccessLog> selectRecentAccessWithDetails(@Param("userId") Long userId,
                                                          @Param("limit") int limit);

    /**
     * 清除用户访问记录
     */
    int clearUserAccessLogs(@Param("userId") Long userId);
}