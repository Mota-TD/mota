package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.DocumentStatsDaily;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 文档统计汇总Mapper
 */
@Mapper
public interface DocumentStatsDailyMapper extends BaseMapper<DocumentStatsDaily> {

    /**
     * 获取文档统计汇总
     */
    DocumentStatsDaily getStatsByDocumentAndDate(@Param("documentId") Long documentId,
                                                  @Param("statsDate") LocalDate statsDate);

    /**
     * 获取日期范围内的统计数据
     */
    List<DocumentStatsDaily> getStatsByDateRange(@Param("documentId") Long documentId,
                                                  @Param("startDate") LocalDate startDate,
                                                  @Param("endDate") LocalDate endDate);

    /**
     * 获取项目文档统计汇总
     */
    Map<String, Object> getProjectStats(@Param("projectId") Long projectId,
                                         @Param("startDate") LocalDate startDate,
                                         @Param("endDate") LocalDate endDate);

    /**
     * 更新或插入统计数据
     */
    void upsertStats(DocumentStatsDaily stats);

    /**
     * 批量更新统计数据
     */
    void batchUpsertStats(@Param("list") List<DocumentStatsDaily> statsList);
}