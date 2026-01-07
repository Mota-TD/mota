package com.mota.project.mapper.knowledge;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.knowledge.FileCategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 文件分类Mapper
 */
@Mapper
public interface FileCategoryMapper extends BaseMapper<FileCategory> {

    /**
     * 获取所有顶级分类
     */
    @Select("SELECT * FROM file_category WHERE parent_id IS NULL ORDER BY sort_order, id")
    List<FileCategory> selectTopCategories();

    /**
     * 获取子分类
     */
    @Select("SELECT * FROM file_category WHERE parent_id = #{parentId} ORDER BY sort_order, id")
    List<FileCategory> selectByParentId(@Param("parentId") Long parentId);

    /**
     * 更新分类文件数量
     */
    @Update("UPDATE file_category SET file_count = " +
            "(SELECT COUNT(*) FROM knowledge_file WHERE category = #{categoryName}) " +
            "WHERE name = #{categoryName}")
    void updateFileCount(@Param("categoryName") String categoryName);

    /**
     * 增加分类文件数量
     */
    @Update("UPDATE file_category SET file_count = file_count + 1 WHERE name = #{categoryName}")
    void incrementFileCount(@Param("categoryName") String categoryName);

    /**
     * 减少分类文件数量
     */
    @Update("UPDATE file_category SET file_count = GREATEST(file_count - 1, 0) WHERE name = #{categoryName}")
    void decrementFileCount(@Param("categoryName") String categoryName);
}