package com.mota.task.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.task.entity.Checklist;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 检查清单Mapper接口
 */
@Mapper
public interface ChecklistMapper extends BaseMapper<Checklist> {

    /**
     * 获取任务的检查清单列表
     */
    @Select("SELECT * FROM checklist WHERE task_id = #{taskId} AND deleted = 0 ORDER BY sort_order")
    List<Checklist> selectByTaskId(@Param("taskId") Long taskId);
}