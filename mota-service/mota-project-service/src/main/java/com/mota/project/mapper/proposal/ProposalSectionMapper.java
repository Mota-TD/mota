package com.mota.project.mapper.proposal;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.proposal.ProposalSection;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 方案章节Mapper
 */
@Mapper
public interface ProposalSectionMapper extends BaseMapper<ProposalSection> {
    
    /**
     * 获取方案的章节列表
     */
    @Select("SELECT * FROM ai_proposal_section WHERE proposal_id = #{proposalId} ORDER BY sort_order")
    List<ProposalSection> findByProposalId(@Param("proposalId") Long proposalId);
    
    /**
     * 获取顶级章节
     */
    @Select("SELECT * FROM ai_proposal_section WHERE proposal_id = #{proposalId} AND parent_id IS NULL ORDER BY sort_order")
    List<ProposalSection> findTopLevelSections(@Param("proposalId") Long proposalId);
    
    /**
     * 获取子章节
     */
    @Select("SELECT * FROM ai_proposal_section WHERE parent_id = #{parentId} ORDER BY sort_order")
    List<ProposalSection> findByParentId(@Param("parentId") Long parentId);
}