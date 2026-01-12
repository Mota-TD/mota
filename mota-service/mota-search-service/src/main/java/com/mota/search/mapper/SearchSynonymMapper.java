package com.mota.search.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.search.entity.SearchSynonym;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 搜索同义词Mapper
 * 
 * @author mota
 */
@Mapper
public interface SearchSynonymMapper extends BaseMapper<SearchSynonym> {

    /**
     * 获取所有启用的同义词
     */
    @Select("SELECT * FROM search_synonym " +
            "WHERE (tenant_id = #{tenantId} OR tenant_id IS NULL) " +
            "AND enabled = true")
    List<SearchSynonym> selectEnabledSynonyms(@Param("tenantId") Long tenantId);

    /**
     * 根据词查找同义词
     */
    @Select("SELECT * FROM search_synonym " +
            "WHERE (tenant_id = #{tenantId} OR tenant_id IS NULL) " +
            "AND word = #{word} AND enabled = true")
    List<SearchSynonym> selectByWord(@Param("tenantId") Long tenantId,
                                      @Param("word") String word);

    /**
     * 根据类型获取同义词
     */
    @Select("SELECT * FROM search_synonym " +
            "WHERE (tenant_id = #{tenantId} OR tenant_id IS NULL) " +
            "AND type = #{type} AND enabled = true")
    List<SearchSynonym> selectByType(@Param("tenantId") Long tenantId,
                                      @Param("type") String type);

    /**
     * 搜索同义词（模糊匹配）
     */
    @Select("SELECT * FROM search_synonym " +
            "WHERE (tenant_id = #{tenantId} OR tenant_id IS NULL) " +
            "AND (word LIKE CONCAT('%', #{keyword}, '%') OR synonyms LIKE CONCAT('%', #{keyword}, '%')) " +
            "AND enabled = true")
    List<SearchSynonym> searchSynonyms(@Param("tenantId") Long tenantId,
                                        @Param("keyword") String keyword);
    
    /**
     * 根据关键词和类型查找同义词
     */
    @Select("SELECT * FROM search_synonym " +
            "WHERE (tenant_id = #{tenantId} OR tenant_id IS NULL) " +
            "AND word = #{keyword} AND type = #{type} AND enabled = true")
    List<SearchSynonym> selectByKeywordAndType(@Param("tenantId") Long tenantId,
                                                @Param("keyword") String keyword,
                                                @Param("type") String type);
}