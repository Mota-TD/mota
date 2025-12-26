package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.ProjectAttachment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 项目附件Mapper
 */
@Mapper
public interface ProjectAttachmentMapper extends BaseMapper<ProjectAttachment> {

    /**
     * 根据项目ID查询附件列表
     */
    @Select("SELECT * FROM project_attachment WHERE project_id = #{projectId} AND deleted = 0 ORDER BY create_time DESC")
    List<ProjectAttachment> selectByProjectId(@Param("projectId") Long projectId);

    /**
     * 根据上传者ID查询附件列表
     */
    @Select("SELECT * FROM project_attachment WHERE uploaded_by = #{uploadedBy} AND deleted = 0 ORDER BY create_time DESC")
    List<ProjectAttachment> selectByUploadedBy(@Param("uploadedBy") Long uploadedBy);
}