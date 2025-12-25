package com.mota.project.mapper.search;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.search.SearchCorrectionDict;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * 搜索纠错词典Mapper
 */
@Mapper
public interface SearchCorrectionDictMapper extends BaseMapper<SearchCorrectionDict> {
    
    /**
     * 查询所有启用的纠错词
     */
    @Select("SELECT * FROM search_correction_dict WHERE is_active = true ORDER BY usage_count DESC")
    List<SearchCorrectionDict> findActiveCorrections();
    
    /**
     * 根据错误词查询
     */
    @Select("SELECT * FROM search_correction_dict WHERE wrong_word = #{wrongWord} AND is_active = true")
    SearchCorrectionDict findByWrongWord(@Param("wrongWord") String wrongWord);
    
    /**
     * 更新使用次数
     */
    @Update("UPDATE search_correction_dict SET usage_count = usage_count + 1 WHERE id = #{id}")
    void incrementUsageCount(@Param("id") Long id);
}