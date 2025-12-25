package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.ChecklistItem;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 检查清单项 Mapper 接口
 */
@Mapper
public interface ChecklistItemMapper extends BaseMapper<ChecklistItem> {

    /**
     * 根据清单ID查询清单项列表
     */
    List<ChecklistItem> selectByChecklistId(@Param("checklistId") Long checklistId);

    /**
     * 根据任务ID查询所有清单项
     */
    List<ChecklistItem> selectByTaskId(@Param("taskId") Long taskId);

    /**
     * 统计清单的完成情况
     */
    Map<String, Object> countCompletionByChecklistId(@Param("checklistId") Long checklistId);

    /**
     * 统计任务的所有清单项完成情况
     */
    Map<String, Object> countCompletionByTaskId(@Param("taskId") Long taskId);

    /**
     * 更新清单项完成状态
     */
    int updateCompleted(@Param("id") Long id, @Param("isCompleted") Integer isCompleted, 
                        @Param("completedBy") Long completedBy);

    /**
     * 批量更新排序顺序
     */
    int batchUpdateSortOrder(@Param("list") List<ChecklistItem> items);

    /**
     * 获取清单下的最大排序顺序
     */
    Integer getMaxSortOrder(@Param("checklistId") Long checklistId);

    /**
     * 删除清单的所有清单项
     */
    int deleteByChecklistId(@Param("checklistId") Long checklistId);

    /**
     * 批量插入清单项
     */
    int batchInsert(@Param("list") List<ChecklistItem> items);
}