package com.mota.knowledge.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.knowledge.entity.FileAccessLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 文件访问日志Mapper
 */
@Mapper
public interface FileAccessLogMapper extends BaseMapper<FileAccessLog> {

    /**
     * 查询文件的访问记录
     */
    @Select("SELECT * FROM file_access_log WHERE file_id = #{fileId} ORDER BY created_at DESC LIMIT #{limit}")
    List<FileAccessLog> selectByFileId(@Param("fileId") Long fileId, @Param("limit") Integer limit);

    /**
     * 查询用户的访问记录
     */
    @Select("SELECT * FROM file_access_log WHERE user_id = #{userId} ORDER BY created_at DESC LIMIT #{limit}")
    List<FileAccessLog> selectByUserId(@Param("userId") Long userId, @Param("limit") Integer limit);

    /**
     * 统计文件访问次数
     */
    @Select("SELECT access_type, COUNT(*) as count FROM file_access_log WHERE file_id = #{fileId} GROUP BY access_type")
    List<Map<String, Object>> countByAccessType(@Param("fileId") Long fileId);

    /**
     * 统计时间段内的访问量
     */
    @Select("SELECT DATE(created_at) as date, COUNT(*) as count FROM file_access_log " +
            "WHERE tenant_id = #{tenantId} AND created_at BETWEEN #{startTime} AND #{endTime} " +
            "GROUP BY DATE(created_at) ORDER BY date")
    List<Map<String, Object>> countByDateRange(@Param("tenantId") Long tenantId,
                                                @Param("startTime") LocalDateTime startTime,
                                                @Param("endTime") LocalDateTime endTime);

    /**
     * 获取热门文件
     */
    @Select("SELECT file_id, COUNT(*) as access_count FROM file_access_log " +
            "WHERE tenant_id = #{tenantId} AND created_at > #{since} " +
            "GROUP BY file_id ORDER BY access_count DESC LIMIT #{limit}")
    List<Map<String, Object>> selectHotFiles(@Param("tenantId") Long tenantId,
                                              @Param("since") LocalDateTime since,
                                              @Param("limit") Integer limit);
}