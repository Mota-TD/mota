package com.mota.project.mapper.search;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.search.SearchSynonym;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * 搜索同义词Mapper
 */
@Mapper
public interface SearchSynonymMapper extends BaseMapper<SearchSynonym> {
    
    /**
     * 查询所有启用的同义词组
     */
    @Select("SELECT * FROM search_synonym WHERE is_active = true")
    List<SearchSynonym> findActiveSynonyms();
    
    /**
     * 根据词组类型查询
     */
    @Select("SELECT * FROM search_synonym WHERE group_type = #{groupType} AND is_active = true")
    List<SearchSynonym> findByGroupType(@Param("groupType") String groupType);
    
    /**
     * 根据词查询包含该词的同义词组
     */
    @Select("SELECT * FROM search_synonym WHERE word_group LIKE CONCAT('%', #{word}, '%') AND is_active = true")
    List<SearchSynonym> findByWord(@Param("word") String word);
}