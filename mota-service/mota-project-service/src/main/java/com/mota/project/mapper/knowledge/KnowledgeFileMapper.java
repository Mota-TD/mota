package com.mota.project.mapper.knowledge;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.project.entity.knowledge.KnowledgeFile;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 知识文件Mapper
 */
@Mapper
public interface KnowledgeFileMapper extends BaseMapper<KnowledgeFile> {

    /**
     * 分页查询文件列表
     */
    Page<KnowledgeFile> selectFilePage(
            Page<KnowledgeFile> page,
            @Param("projectId") Long projectId,
            @Param("folderId") Long folderId,
            @Param("category") String category,
            @Param("keyword") String keyword
    );

    /**
     * 根据标签查询文件
     */
    List<KnowledgeFile> selectFilesByTags(@Param("tags") List<String> tags);

    /**
     * 获取文件的标签列表
     */
    @Select("SELECT t.name FROM file_tag t " +
            "INNER JOIN knowledge_file_tag kft ON t.id = kft.tag_id " +
            "WHERE kft.file_id = #{fileId}")
    List<String> selectTagsByFileId(@Param("fileId") Long fileId);
}