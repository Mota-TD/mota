package com.mota.project.mapper.proposal;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.proposal.RequirementAnalysis;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 需求分析Mapper
 */
@Mapper
public interface RequirementAnalysisMapper extends BaseMapper<RequirementAnalysis> {
    
    /**
     * 获取会话的需求分析
     */
    @Select("SELECT * FROM ai_requirement_analysis WHERE session_id = #{sessionId} ORDER BY created_at DESC")
    List<RequirementAnalysis> findBySessionId(@Param("sessionId") Long sessionId);
    
    /**
     * 获取最新的需求分析
     */
    @Select("SELECT * FROM ai_requirement_analysis WHERE session_id = #{sessionId} ORDER BY created_at DESC LIMIT 1")
    RequirementAnalysis findLatestBySessionId(@Param("sessionId") Long sessionId);
}