package com.mota.project.mapper.proposal;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.proposal.ProposalContent;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 方案内容Mapper
 */
@Mapper
public interface ProposalContentMapper extends BaseMapper<ProposalContent> {
    
    /**
     * 获取会话的方案列表
     */
    @Select("SELECT * FROM ai_proposal_content WHERE session_id = #{sessionId} ORDER BY created_at DESC")
    List<ProposalContent> findBySessionId(@Param("sessionId") Long sessionId);
    
    /**
     * 获取用户的方案列表
     */
    @Select("SELECT * FROM ai_proposal_content WHERE created_by = #{userId} ORDER BY created_at DESC")
    List<ProposalContent> findByUserId(@Param("userId") Long userId);
    
    /**
     * 按状态获取方案
     */
    @Select("SELECT * FROM ai_proposal_content WHERE status = #{status} ORDER BY created_at DESC")
    List<ProposalContent> findByStatus(@Param("status") String status);
}