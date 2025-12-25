package com.mota.project.mapper.proposal;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.proposal.QualityCheck;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 质量检查Mapper
 */
@Mapper
public interface QualityCheckMapper extends BaseMapper<QualityCheck> {
    
    /**
     * 获取方案的质量检查结果
     */
    @Select("SELECT * FROM ai_quality_check WHERE proposal_id = #{proposalId} ORDER BY created_at DESC")
    List<QualityCheck> findByProposalId(@Param("proposalId") Long proposalId);
    
    /**
     * 获取版本的质量检查结果
     */
    @Select("SELECT * FROM ai_quality_check WHERE version_id = #{versionId} ORDER BY created_at DESC")
    List<QualityCheck> findByVersionId(@Param("versionId") Long versionId);
    
    /**
     * 获取未修复的问题
     */
    @Select("SELECT * FROM ai_quality_check WHERE proposal_id = #{proposalId} AND is_fixed = false AND result != 'pass' ORDER BY created_at DESC")
    List<QualityCheck> findUnfixedIssues(@Param("proposalId") Long proposalId);
    
    /**
     * 获取质量得分
     */
    @Select("SELECT AVG(score) FROM ai_quality_check WHERE proposal_id = #{proposalId} AND version_id = #{versionId}")
    Integer getAverageScore(@Param("proposalId") Long proposalId, @Param("versionId") Long versionId);
}