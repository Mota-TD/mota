package com.mota.file.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.file.entity.FileConvertTask;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 文件转换任务Mapper
 * 
 * @author mota
 */
@Mapper
public interface FileConvertTaskMapper extends BaseMapper<FileConvertTask> {

    /**
     * 查询待处理的任务
     */
    @Select("SELECT * FROM file_convert_task WHERE status = 0 " +
            "ORDER BY priority DESC, create_time ASC LIMIT #{limit}")
    List<FileConvertTask> findPendingTasks(@Param("limit") int limit);

    /**
     * 查询文件的转换任务
     */
    @Select("SELECT * FROM file_convert_task WHERE source_file_id = #{fileId} " +
            "AND convert_type = #{convertType} AND status = 2 LIMIT 1")
    FileConvertTask findCompletedTask(@Param("fileId") Long fileId, @Param("convertType") String convertType);

    /**
     * 开始处理任务
     */
    @Update("UPDATE file_convert_task SET status = 1, start_time = NOW(), " +
            "update_time = NOW() WHERE id = #{id} AND status = 0")
    int startTask(@Param("id") Long id);

    /**
     * 更新任务进度
     */
    @Update("UPDATE file_convert_task SET progress = #{progress}, update_time = NOW() WHERE id = #{id}")
    int updateProgress(@Param("id") Long id, @Param("progress") Integer progress);

    /**
     * 完成任务
     */
    @Update("UPDATE file_convert_task SET status = 2, progress = 100, " +
            "target_file_id = #{targetFileId}, target_file_path = #{targetFilePath}, " +
            "complete_time = NOW(), update_time = NOW() WHERE id = #{id}")
    int completeTask(@Param("id") Long id, 
                     @Param("targetFileId") Long targetFileId,
                     @Param("targetFilePath") String targetFilePath);

    /**
     * 任务失败
     */
    @Update("UPDATE file_convert_task SET status = 3, error_message = #{errorMessage}, " +
            "retry_count = retry_count + 1, update_time = NOW() WHERE id = #{id}")
    int failTask(@Param("id") Long id, @Param("errorMessage") String errorMessage);

    /**
     * 重置失败任务
     */
    @Update("UPDATE file_convert_task SET status = 0, progress = 0, error_message = NULL, " +
            "update_time = NOW() WHERE id = #{id} AND retry_count < max_retry")
    int resetTask(@Param("id") Long id);

    /**
     * 查询失败可重试的任务
     */
    @Select("SELECT * FROM file_convert_task WHERE status = 3 AND retry_count < max_retry LIMIT #{limit}")
    List<FileConvertTask> findRetryableTasks(@Param("limit") int limit);
}