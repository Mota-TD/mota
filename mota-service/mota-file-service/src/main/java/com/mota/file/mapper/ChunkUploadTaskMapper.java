package com.mota.file.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.file.entity.ChunkUploadTask;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 分片上传任务Mapper
 * 
 * @author mota
 */
@Mapper
public interface ChunkUploadTaskMapper extends BaseMapper<ChunkUploadTask> {

    /**
     * 根据上传ID查询任务
     */
    @Select("SELECT * FROM chunk_upload_task WHERE upload_id = #{uploadId} AND tenant_id = #{tenantId}")
    ChunkUploadTask findByUploadId(@Param("uploadId") String uploadId, @Param("tenantId") Long tenantId);

    /**
     * 根据MD5查询未完成的任务（断点续传）
     */
    @Select("SELECT * FROM chunk_upload_task WHERE md5_hash = #{md5Hash} AND tenant_id = #{tenantId} " +
            "AND status = 0 AND expire_time > NOW() ORDER BY create_time DESC LIMIT 1")
    ChunkUploadTask findByMd5Hash(@Param("md5Hash") String md5Hash, @Param("tenantId") Long tenantId);

    /**
     * 更新已上传分片信息
     */
    @Update("UPDATE chunk_upload_task SET uploaded_chunks = #{uploadedChunks}, " +
            "uploaded_indexes = #{uploadedIndexes}, update_time = NOW() WHERE id = #{id}")
    int updateUploadProgress(@Param("id") Long id, 
                             @Param("uploadedChunks") Integer uploadedChunks,
                             @Param("uploadedIndexes") String uploadedIndexes);

    /**
     * 完成上传任务
     */
    @Update("UPDATE chunk_upload_task SET status = 1, complete_time = NOW(), " +
            "file_id = #{fileId}, update_time = NOW() WHERE id = #{id}")
    int completeTask(@Param("id") Long id, @Param("fileId") Long fileId);

    /**
     * 取消上传任务
     */
    @Update("UPDATE chunk_upload_task SET status = 2, update_time = NOW() WHERE id = #{id}")
    int cancelTask(@Param("id") Long id);

    /**
     * 查询过期的上传任务
     */
    @Select("SELECT * FROM chunk_upload_task WHERE status = 0 AND expire_time < #{now} LIMIT #{limit}")
    List<ChunkUploadTask> findExpiredTasks(@Param("now") LocalDateTime now, @Param("limit") int limit);

    /**
     * 标记任务为过期
     */
    @Update("UPDATE chunk_upload_task SET status = 3, update_time = NOW() WHERE id = #{id}")
    int markAsExpired(@Param("id") Long id);

    /**
     * 查询用户的上传任务
     */
    @Select("SELECT * FROM chunk_upload_task WHERE upload_user_id = #{userId} AND tenant_id = #{tenantId} " +
            "AND status = 0 ORDER BY create_time DESC")
    List<ChunkUploadTask> findByUserId(@Param("userId") Long userId, @Param("tenantId") Long tenantId);
}