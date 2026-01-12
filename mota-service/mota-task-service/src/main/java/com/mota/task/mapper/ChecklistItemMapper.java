package com.mota.task.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.task.entity.ChecklistItem;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 检查清单项Mapper接口
 */
@Mapper
public interface ChecklistItemMapper extends BaseMapper<ChecklistItem> {

    /**
     * 获取检查清单的所有项
     */
    @Select("SELECT * FROM checklist_item WHERE checklist_id = #{checklistId} AND deleted = 0 ORDER BY sort_order")
    List<ChecklistItem> selectByChecklistId(@Param("checklistId") Long checklistId);

    /**
     * 统计检查清单的完成项数量
     */
    @Select("SELECT COUNT(*) FROM checklist_item WHERE checklist_id = #{checklistId} AND completed = 1 AND deleted = 0")
    int countCompletedByChecklistId(@Param("checklistId") Long checklistId);

    /**
     * 统计检查清单的总项数量
     */
    @Select("SELECT COUNT(*) FROM checklist_item WHERE checklist_id = #{checklistId} AND deleted = 0")
    int countByChecklistId(@Param("checklistId") Long checklistId);

    /**
     * 批量更新完成状态
     */
    @Update("<script>" +
            "UPDATE checklist_item SET completed = #{completed}, " +
            "completed_at = CASE WHEN #{completed} = 1 THEN NOW() ELSE NULL END, " +
            "completed_by = CASE WHEN #{completed} = 1 THEN #{completedBy} ELSE NULL END " +
            "WHERE id IN " +
            "<foreach collection='ids' item='id' open='(' separator=',' close=')'>" +
            "#{id}" +
            "</foreach>" +
            "</script>")
    int batchUpdateCompleted(@Param("ids") List<Long> ids, @Param("completed") Boolean completed, @Param("completedBy") Long completedBy);
}