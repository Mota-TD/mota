package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.Checklist;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 检查清单 Mapper 接口
 */
@Mapper
public interface ChecklistMapper extends BaseMapper<Checklist> {

    /**
     * 根据任务ID查询检查清单列表
     */
    List<Checklist> selectByTaskId(@Param("taskId") Long taskId);

    /**
     * 根据任务ID查询检查清单列表（包含清单项）
     */
    List<Checklist> selectWithItemsByTaskId(@Param("taskId") Long taskId);

    /**
     * 批量更新排序顺序
     */
    int batchUpdateSortOrder(@Param("list") List<Checklist> checklists);

    /**
     * 获取任务下的最大排序顺序
     */
    Integer getMaxSortOrder(@Param("taskId") Long taskId);

    /**
     * 删除任务的所有检查清单
     */
    int deleteByTaskId(@Param("taskId") Long taskId);
}