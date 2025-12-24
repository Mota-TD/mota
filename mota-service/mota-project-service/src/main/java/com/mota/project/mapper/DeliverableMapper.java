package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.Deliverable;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 交付物 Mapper 接口
 */
@Mapper
public interface DeliverableMapper extends BaseMapper<Deliverable> {

    /**
     * 根据任务ID查询交付物列表
     */
    List<Deliverable> selectByTaskId(@Param("taskId") Long taskId);

    /**
     * 根据上传人ID查询交付物列表
     */
    List<Deliverable> selectByUploadedBy(@Param("uploadedBy") Long uploadedBy);

    /**
     * 统计任务的交付物数量
     */
    int countByTaskId(@Param("taskId") Long taskId);
}