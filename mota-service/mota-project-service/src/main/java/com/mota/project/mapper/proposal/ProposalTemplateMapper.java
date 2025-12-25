package com.mota.project.mapper.proposal;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.proposal.ProposalTemplate;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 方案模板Mapper
 */
@Mapper
public interface ProposalTemplateMapper extends BaseMapper<ProposalTemplate> {
    
    /**
     * 获取启用的模板列表
     */
    @Select("SELECT * FROM ai_proposal_template WHERE is_active = true ORDER BY usage_count DESC")
    List<ProposalTemplate> findActiveTemplates();
    
    /**
     * 按类型获取模板
     */
    @Select("SELECT * FROM ai_proposal_template WHERE template_type = #{templateType} AND is_active = true ORDER BY usage_count DESC")
    List<ProposalTemplate> findByType(@Param("templateType") String templateType);
    
    /**
     * 按行业获取模板
     */
    @Select("SELECT * FROM ai_proposal_template WHERE industry = #{industry} AND is_active = true ORDER BY usage_count DESC")
    List<ProposalTemplate> findByIndustry(@Param("industry") String industry);
    
    /**
     * 获取系统模板
     */
    @Select("SELECT * FROM ai_proposal_template WHERE is_system = true AND is_active = true ORDER BY usage_count DESC")
    List<ProposalTemplate> findSystemTemplates();
    
    /**
     * 增加使用次数
     */
    @Update("UPDATE ai_proposal_template SET usage_count = usage_count + 1 WHERE id = #{id}")
    void incrementUsageCount(@Param("id") Long id);
}