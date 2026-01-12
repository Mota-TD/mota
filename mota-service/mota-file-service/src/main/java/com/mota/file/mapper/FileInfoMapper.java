package com.mota.file.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.file.entity.FileInfo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 文件信息Mapper
 * 
 * @author mota
 */
@Mapper
public interface FileInfoMapper extends BaseMapper<FileInfo> {

    /**
     * 根据MD5查询文件（秒传检查）
     */
    @Select("SELECT * FROM file_info WHERE md5_hash = #{md5Hash} AND tenant_id = #{tenantId} AND status = 1 LIMIT 1")
    FileInfo findByMd5Hash(@Param("md5Hash") String md5Hash, @Param("tenantId") Long tenantId);

    /**
     * 根据SHA256查询文件
     */
    @Select("SELECT * FROM file_info WHERE sha256_hash = #{sha256Hash} AND tenant_id = #{tenantId} AND status = 1 LIMIT 1")
    FileInfo findBySha256Hash(@Param("sha256Hash") String sha256Hash, @Param("tenantId") Long tenantId);

    /**
     * 增加访问次数
     */
    @Update("UPDATE file_info SET access_count = access_count + 1 WHERE id = #{fileId}")
    int incrementAccessCount(@Param("fileId") Long fileId);

    /**
     * 增加下载次数
     */
    @Update("UPDATE file_info SET download_count = download_count + 1 WHERE id = #{fileId}")
    int incrementDownloadCount(@Param("fileId") Long fileId);

    /**
     * 查询待清理的已删除文件
     */
    @Select("SELECT * FROM file_info WHERE status = 2 AND deleted_at < #{beforeTime} LIMIT #{limit}")
    List<FileInfo> findDeletedFilesBefore(@Param("beforeTime") LocalDateTime beforeTime, @Param("limit") int limit);

    /**
     * 按分类统计文件数量
     */
    @Select("SELECT category, COUNT(*) as count, SUM(file_size) as total_size " +
            "FROM file_info WHERE tenant_id = #{tenantId} AND status = 1 " +
            "GROUP BY category")
    List<Map<String, Object>> statisticsByCategory(@Param("tenantId") Long tenantId);

    /**
     * 按业务类型统计文件数量
     */
    @Select("SELECT business_type, COUNT(*) as count, SUM(file_size) as total_size " +
            "FROM file_info WHERE tenant_id = #{tenantId} AND status = 1 " +
            "GROUP BY business_type")
    List<Map<String, Object>> statisticsByBusinessType(@Param("tenantId") Long tenantId);

    /**
     * 统计租户存储使用量
     */
    @Select("SELECT SUM(file_size) FROM file_info WHERE tenant_id = #{tenantId} AND status = 1")
    Long getTenantStorageUsage(@Param("tenantId") Long tenantId);

    /**
     * 按日期统计上传量
     */
    @Select("SELECT DATE(create_time) as date, COUNT(*) as count, SUM(file_size) as total_size " +
            "FROM file_info WHERE tenant_id = #{tenantId} AND status = 1 " +
            "AND create_time >= #{startDate} AND create_time < #{endDate} " +
            "GROUP BY DATE(create_time) ORDER BY date")
    List<Map<String, Object>> statisticsByDate(@Param("tenantId") Long tenantId,
                                                @Param("startDate") LocalDateTime startDate,
                                                @Param("endDate") LocalDateTime endDate);

    /**
     * 查询热门文件
     */
    @Select("SELECT * FROM file_info WHERE tenant_id = #{tenantId} AND status = 1 " +
            "ORDER BY access_count DESC LIMIT #{limit}")
    List<FileInfo> findTopAccessedFiles(@Param("tenantId") Long tenantId, @Param("limit") int limit);
}