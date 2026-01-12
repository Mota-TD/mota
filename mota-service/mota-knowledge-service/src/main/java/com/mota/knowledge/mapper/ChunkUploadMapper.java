package com.mota.knowledge.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.knowledge.entity.ChunkUpload;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 分片上传Mapper
 */
@Mapper
public interface ChunkUploadMapper extends BaseMapper<ChunkUpload> {

    /**
     * 根据上传ID查询
     */
    @Select("SELECT * FROM chunk_upload WHERE upload_id = #{uploadId}")
    ChunkUpload selectByUploadId(@Param("uploadId") String uploadId);

    /**
     * 根据MD5查询
     */
    @Select("SELECT * FROM chunk_upload WHERE tenant_id = #{tenantId} AND md5_hash = #{md5Hash} AND status = 'uploading' LIMIT 1")
    ChunkUpload selectByMd5(@Param("tenantId") Long tenantId, @Param("md5Hash") String md5Hash);

    /**
     * 查询过期的上传任务
     */
    @Select("SELECT * FROM chunk_upload WHERE status = 'uploading' AND expire_at < #{expireTime}")
    List<ChunkUpload> selectExpired(@Param("expireTime") LocalDateTime expireTime);
}