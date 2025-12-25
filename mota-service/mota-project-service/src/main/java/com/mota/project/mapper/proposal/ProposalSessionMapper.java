package com.mota.project.mapper.proposal;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.proposal.ProposalSession;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 方案会话Mapper
 */
@Mapper
public interface ProposalSessionMapper extends BaseMapper<ProposalSession> {
    
    /**
     * 获取用户的会话列表
     */
    @Select("SELECT * FROM ai_proposal_session WHERE user_id = #{userId} ORDER BY updated_at DESC")
    List<ProposalSession> findByUserId(@Param("userId") Long userId);
    
    /**
     * 获取用户活跃会话
     */
    @Select("SELECT * FROM ai_proposal_session WHERE user_id = #{userId} AND status = 'active' ORDER BY updated_at DESC LIMIT 1")
    ProposalSession findActiveSession(@Param("userId") Long userId);
}