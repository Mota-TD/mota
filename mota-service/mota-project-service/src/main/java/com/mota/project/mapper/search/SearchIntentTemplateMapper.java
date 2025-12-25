package com.mota.project.mapper.search;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.search.SearchIntentTemplate;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * 搜索意图模板Mapper
 */
@Mapper
public interface SearchIntentTemplateMapper extends BaseMapper<SearchIntentTemplate> {
    
    /**
     * 查询所有启用的意图模板
     */
    @Select("SELECT * FROM search_intent_template WHERE is_active = true ORDER BY priority DESC")
    List<SearchIntentTemplate> findActiveTemplates();
    
    /**
     * 根据意图代码查询
     */
    @Select("SELECT * FROM search_intent_template WHERE intent_code = #{intentCode} AND is_active = true")
    SearchIntentTemplate findByIntentCode(@Param("intentCode") String intentCode);
    
    /**
     * 根据动作类型查询
     */
    @Select("SELECT * FROM search_intent_template WHERE action_type = #{actionType} AND is_active = true ORDER BY priority DESC")
    List<SearchIntentTemplate> findByActionType(@Param("actionType") String actionType);
}