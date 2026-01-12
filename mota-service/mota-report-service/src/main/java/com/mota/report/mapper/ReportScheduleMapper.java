package com.mota.report.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.report.entity.ReportSchedule;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 定时报表任务Mapper
 *
 * @author mota
 */
@Mapper
public interface ReportScheduleMapper extends BaseMapper<ReportSchedule> {

    /**
     * 查询需要执行的定时任务
     */
    @Select("SELECT * FROM report_schedule WHERE status = 1 AND deleted = 0 " +
            "AND next_execute_time <= #{now} ORDER BY next_execute_time ASC")
    List<ReportSchedule> findDueSchedules(@Param("now") LocalDateTime now);

    /**
     * 查询模板的定时任务
     */
    @Select("SELECT * FROM report_schedule WHERE template_id = #{templateId} AND deleted = 0")
    List<ReportSchedule> findByTemplate(@Param("templateId") Long templateId);

    /**
     * 查询用户创建的定时任务
     */
    @Select("SELECT * FROM report_schedule WHERE tenant_id = #{tenantId} AND created_by = #{userId} AND deleted = 0")
    List<ReportSchedule> findByCreator(@Param("tenantId") Long tenantId, @Param("userId") Long userId);

    /**
     * 更新执行状态
     */
    @Update("UPDATE report_schedule SET last_execute_time = #{executeTime}, " +
            "last_execute_status = #{status}, next_execute_time = #{nextTime}, " +
            "execute_count = execute_count + 1, " +
            "success_count = success_count + #{successIncr}, " +
            "fail_count = fail_count + #{failIncr} " +
            "WHERE id = #{id}")
    int updateExecuteStatus(@Param("id") Long id,
                            @Param("executeTime") LocalDateTime executeTime,
                            @Param("status") String status,
                            @Param("nextTime") LocalDateTime nextTime,
                            @Param("successIncr") int successIncr,
                            @Param("failIncr") int failIncr);

    /**
     * 启用/禁用定时任务
     */
    @Update("UPDATE report_schedule SET status = #{status}, updated_at = NOW() WHERE id = #{id}")
    int updateStatus(@Param("id") Long id, @Param("status") Integer status);
}