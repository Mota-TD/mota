package com.mota.file.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.file.entity.FileAccessLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 文件访问日志Mapper
 * 
 * @author mota
 */
@Mapper
public interface FileAccessLogMapper extends BaseMapper<FileAccessLog> {

    /**
     * 按访问类型统计
     */
    @Select("SELECT access_type, COUNT(*) as count FROM file_access_log " +
            "WHERE tenant_id = #{tenantId} AND access_time >= #{startTime} AND access_time < #{endTime} " +
            "GROUP BY access_type")
    List<Map<String, Object>> statisticsByAccessType(@Param("tenantId") Long tenantId,
                                                      @Param("startTime") LocalDateTime startTime,
                                                      @Param("endTime") LocalDateTime endTime);

    /**
     * 按日期统计访问量
     */
    @Select("SELECT DATE(access_time) as date, COUNT(*) as count FROM file_access_log " +
            "WHERE tenant_id = #{tenantId} AND access_time >= #{startTime} AND access_time < #{endTime} " +
            "GROUP BY DATE(access_time) ORDER BY date")
    List<Map<String, Object>> statisticsByDate(@Param("tenantId") Long tenantId,
                                                @Param("startTime") LocalDateTime startTime,
                                                @Param("endTime") LocalDateTime endTime);

    /**
     * 查询文件的访问记录
     */
    @Select("SELECT * FROM file_access_log WHERE file_id = #{fileId} " +
            "ORDER BY access_time DESC LIMIT #{limit}")
    List<FileAccessLog> findByFileId(@Param("fileId") Long fileId, @Param("limit") int limit);

    /**
     * 统计文件访问用户数
     */
    @Select("SELECT COUNT(DISTINCT user_id) FROM file_access_log WHERE file_id = #{fileId}")
    Long countDistinctUsers(@Param("fileId") Long fileId);

    /**
     * 查询热门访问文件
     */
    @Select("SELECT file_id, COUNT(*) as access_count FROM file_access_log " +
            "WHERE tenant_id = #{tenantId} AND access_time >= #{startTime} " +
            "GROUP BY file_id ORDER BY access_count DESC LIMIT #{limit}")
    List<Map<String, Object>> findHotFiles(@Param("tenantId") Long tenantId,
                                            @Param("startTime") LocalDateTime startTime,
                                            @Param("limit") int limit);
}