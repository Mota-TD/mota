package com.mota.project.mapper.ai;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.ai.AIOcrRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * OCR识别记录Mapper
 */
@Mapper
public interface AIOcrRecordMapper extends BaseMapper<AIOcrRecord> {

    /**
     * 根据文档ID查询OCR记录
     */
    List<AIOcrRecord> selectByDocumentId(@Param("documentId") Long documentId);

    /**
     * 获取待处理的OCR任务
     */
    List<AIOcrRecord> selectPendingTasks(@Param("limit") int limit);

    /**
     * 批量更新状态
     */
    int batchUpdateStatus(
            @Param("ids") List<Long> ids,
            @Param("status") String status
    );
}