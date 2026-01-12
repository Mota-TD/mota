package com.mota.knowledge.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.knowledge.entity.FileVersion;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 文件版本Mapper
 */
@Mapper
public interface FileVersionMapper extends BaseMapper<FileVersion> {

    /**
     * 获取文件的版本历史
     */
    @Select("SELECT * FROM file_version WHERE file_id = #{fileId} AND deleted = 0 ORDER BY version_number DESC")
    List<FileVersion> selectByFileId(@Param("fileId") Long fileId);

    /**
     * 获取文件的当前版本
     */
    @Select("SELECT * FROM file_version WHERE file_id = #{fileId} AND is_current = 1 AND deleted = 0")
    FileVersion selectCurrentVersion(@Param("fileId") Long fileId);

    /**
     * 获取文件的指定版本
     */
    @Select("SELECT * FROM file_version WHERE file_id = #{fileId} AND version_number = #{versionNumber} AND deleted = 0")
    FileVersion selectByVersion(@Param("fileId") Long fileId, @Param("versionNumber") Integer versionNumber);

    /**
     * 获取文件的指定版本（别名方法）
     */
    @Select("SELECT * FROM file_version WHERE file_id = #{fileId} AND version_number = #{versionNumber} AND deleted = 0")
    FileVersion selectByVersionNumber(@Param("fileId") Long fileId, @Param("versionNumber") Integer versionNumber);

    /**
     * 获取文件的最新版本
     */
    @Select("SELECT * FROM file_version WHERE file_id = #{fileId} AND deleted = 0 ORDER BY version_number DESC LIMIT 1")
    FileVersion selectLatestVersion(@Param("fileId") Long fileId);

    /**
     * 获取文件的最大版本号
     */
    @Select("SELECT COALESCE(MAX(version_number), 0) FROM file_version WHERE file_id = #{fileId} AND deleted = 0")
    Integer selectMaxVersionNumber(@Param("fileId") Long fileId);
}