package com.mota.project.mapper.knowledge;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.knowledge.KnowledgeFileTag;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 知识文件标签关联Mapper
 */
@Mapper
public interface KnowledgeFileTagMapper extends BaseMapper<KnowledgeFileTag> {

    /**
     * 删除文件的所有标签关联
     */
    @Delete("DELETE FROM knowledge_file_tag WHERE file_id = #{fileId}")
    void deleteByFileId(@Param("fileId") Long fileId);

    /**
     * 删除标签的所有文件关联
     */
    @Delete("DELETE FROM knowledge_file_tag WHERE tag_id = #{tagId}")
    void deleteByTagId(@Param("tagId") Long tagId);

    /**
     * 查询文件的标签ID列表
     */
    @Select("SELECT tag_id FROM knowledge_file_tag WHERE file_id = #{fileId}")
    List<Long> selectTagIdsByFileId(@Param("fileId") Long fileId);

    /**
     * 查询标签的文件ID列表
     */
    @Select("SELECT file_id FROM knowledge_file_tag WHERE tag_id = #{tagId}")
    List<Long> selectFileIdsByTagId(@Param("tagId") Long tagId);
}