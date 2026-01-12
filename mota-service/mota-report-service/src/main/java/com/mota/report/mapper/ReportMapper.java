package com.mota.report.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.report.entity.Report;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 报表实例Mapper
 *
 * @author mota
 */
@Mapper
public interface ReportMapper extends BaseMapper<Report> {

    /**
     * 查询用户的报表
     */
    @Select("SELECT * FROM report WHERE tenant_id = #{tenantId} AND created_by = #{userId} AND deleted = 0 " +
            "ORDER BY created_at DESC")
    List<Report> findByUser(@Param("tenantId") Long tenantId, @Param("userId") Long userId);

    /**
     * 查询模板的报表
     */
    @Select("SELECT * FROM report WHERE template_id = #{templateId} AND deleted = 0 ORDER BY created_at DESC")
    List<Report> findByTemplate(@Param("templateId") Long templateId);

    /**
     * 查询待处理的报表
     */
    @Select("SELECT * FROM report WHERE status = 'pending' AND deleted = 0 ORDER BY created_at ASC LIMIT #{limit}")
    List<Report> findPendingReports(@Param("limit") int limit);

    /**
     * 查询生成中的报表
     */
    @Select("SELECT * FROM report WHERE status = 'generating' AND deleted = 0")
    List<Report> findGeneratingReports();

    /**
     * 查询已过期的报表
     */
    @Select("SELECT * FROM report WHERE expire_at < #{now} AND deleted = 0")
    List<Report> findExpiredReports(@Param("now") LocalDateTime now);

    /**
     * 更新报表状态
     */
    @Update("UPDATE report SET status = #{status}, error_message = #{errorMessage}, " +
            "generate_end_time = #{endTime}, generate_duration = #{duration} WHERE id = #{id}")
    int updateStatus(@Param("id") Long id,
                     @Param("status") String status,
                     @Param("errorMessage") String errorMessage,
                     @Param("endTime") LocalDateTime endTime,
                     @Param("duration") Long duration);

    /**
     * 更新文件信息
     */
    @Update("UPDATE report SET file_path = #{filePath}, file_format = #{fileFormat}, " +
            "file_size = #{fileSize}, data_row_count = #{rowCount} WHERE id = #{id}")
    int updateFileInfo(@Param("id") Long id,
                       @Param("filePath") String filePath,
                       @Param("fileFormat") String fileFormat,
                       @Param("fileSize") Long fileSize,
                       @Param("rowCount") Integer rowCount);

    /**
     * 增加查看次数
     */
    @Update("UPDATE report SET view_count = view_count + 1 WHERE id = #{id}")
    int incrementViewCount(@Param("id") Long id);

    /**
     * 增加下载次数
     */
    @Update("UPDATE report SET download_count = download_count + 1 WHERE id = #{id}")
    int incrementDownloadCount(@Param("id") Long id);

    /**
     * 分页查询报表
     */
    @Select("<script>" +
            "SELECT r.* FROM report r " +
            "LEFT JOIN report_template t ON r.template_id = t.id " +
            "WHERE r.tenant_id = #{tenantId} AND r.deleted = 0 " +
            "<if test='userId != null'>" +
            "AND r.created_by = #{userId} " +
            "</if>" +
            "<if test='templateId != null'>" +
            "AND r.template_id = #{templateId} " +
            "</if>" +
            "<if test='status != null and status != \"\"'>" +
            "AND r.status = #{status} " +
            "</if>" +
            "<if test='keyword != null and keyword != \"\"'>" +
            "AND (r.name LIKE CONCAT('%', #{keyword}, '%') OR t.name LIKE CONCAT('%', #{keyword}, '%')) " +
            "</if>" +
            "ORDER BY r.created_at DESC" +
            "</script>")
    IPage<Report> findByCondition(Page<Report> page,
                                  @Param("tenantId") Long tenantId,
                                  @Param("userId") Long userId,
                                  @Param("templateId") Long templateId,
                                  @Param("status") String status,
                                  @Param("keyword") String keyword);

    /**
     * 统计报表数量
     */
    @Select("SELECT COUNT(*) FROM report WHERE tenant_id = #{tenantId} AND deleted = 0 " +
            "AND created_at >= #{startTime} AND created_at < #{endTime}")
    int countByDateRange(@Param("tenantId") Long tenantId,
                         @Param("startTime") LocalDateTime startTime,
                         @Param("endTime") LocalDateTime endTime);

    /**
     * 统计各状态报表数量
     */
    @Select("SELECT status, COUNT(*) as count FROM report WHERE tenant_id = #{tenantId} AND deleted = 0 " +
            "GROUP BY status")
    List<java.util.Map<String, Object>> countByStatus(@Param("tenantId") Long tenantId);
}