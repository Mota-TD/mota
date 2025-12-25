package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.DocumentRanking;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

/**
 * 热门文档排行Mapper
 */
@Mapper
public interface DocumentRankingMapper extends BaseMapper<DocumentRanking> {

    /**
     * 获取排行榜
     */
    List<DocumentRanking> getRanking(@Param("projectId") Long projectId,
                                      @Param("rankingType") String rankingType,
                                      @Param("rankingDate") LocalDate rankingDate,
                                      @Param("limit") Integer limit);

    /**
     * 获取文档排名历史
     */
    List<DocumentRanking> getDocumentRankingHistory(@Param("documentId") Long documentId,
                                                     @Param("rankingType") String rankingType,
                                                     @Param("startDate") LocalDate startDate,
                                                     @Param("endDate") LocalDate endDate);

    /**
     * 更新或插入排行数据
     */
    void upsertRanking(DocumentRanking ranking);

    /**
     * 批量更新排行数据
     */
    void batchUpsertRanking(@Param("list") List<DocumentRanking> rankingList);

    /**
     * 删除过期排行数据
     */
    void deleteExpiredRanking(@Param("beforeDate") LocalDate beforeDate);

    /**
     * 获取上升最快的文档
     */
    List<DocumentRanking> getFastestRisingDocuments(@Param("projectId") Long projectId,
                                                     @Param("rankingType") String rankingType,
                                                     @Param("rankingDate") LocalDate rankingDate,
                                                     @Param("limit") Integer limit);
}