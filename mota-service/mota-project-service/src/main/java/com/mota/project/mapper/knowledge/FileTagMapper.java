package com.mota.project.mapper.knowledge;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.knowledge.FileTag;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 文件标签Mapper
 */
@Mapper
public interface FileTagMapper extends BaseMapper<FileTag> {

    /**
     * 获取热门标签
     */
    @Select("SELECT * FROM file_tag ORDER BY file_count DESC LIMIT #{limit}")
    List<FileTag> selectPopularTags(@Param("limit") Integer limit);

    /**
     * 根据名称查询标签
     */
    @Select("SELECT * FROM file_tag WHERE name = #{name}")
    FileTag selectByName(@Param("name") String name);

    /**
     * 更新标签文件数量
     */
    @Update("UPDATE file_tag SET file_count = " +
            "(SELECT COUNT(*) FROM knowledge_file_tag WHERE tag_id = #{tagId}) " +
            "WHERE id = #{tagId}")
    void updateFileCount(@Param("tagId") Long tagId);

    /**
     * 增加标签文件数量
     */
    @Update("UPDATE file_tag SET file_count = file_count + 1 WHERE id = #{tagId}")
    void incrementFileCount(@Param("tagId") Long tagId);

    /**
     * 减少标签文件数量
     */
    @Update("UPDATE file_tag SET file_count = GREATEST(file_count - 1, 0) WHERE id = #{tagId}")
    void decrementFileCount(@Param("tagId") Long tagId);
}