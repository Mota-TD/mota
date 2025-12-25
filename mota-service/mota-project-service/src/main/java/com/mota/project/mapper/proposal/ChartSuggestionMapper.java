package com.mota.project.mapper.proposal;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.proposal.ChartSuggestion;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 图表建议Mapper
 */
@Mapper
public interface ChartSuggestionMapper extends BaseMapper<ChartSuggestion> {
    
    /**
     * 获取方案的图表建议
     */
    @Select("SELECT * FROM ai_chart_suggestion WHERE proposal_id = #{proposalId} ORDER BY created_at")
    List<ChartSuggestion> findByProposalId(@Param("proposalId") Long proposalId);
    
    /**
     * 获取章节的图表建议
     */
    @Select("SELECT * FROM ai_chart_suggestion WHERE section_id = #{sectionId} ORDER BY created_at")
    List<ChartSuggestion> findBySectionId(@Param("sectionId") Long sectionId);
    
    /**
     * 获取未应用的图表建议
     */
    @Select("SELECT * FROM ai_chart_suggestion WHERE proposal_id = #{proposalId} AND is_applied = false ORDER BY created_at")
    List<ChartSuggestion> findUnapplied(@Param("proposalId") Long proposalId);
}