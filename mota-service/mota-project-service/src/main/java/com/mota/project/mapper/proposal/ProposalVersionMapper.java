package com.mota.project.mapper.proposal;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.proposal.ProposalVersion;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 方案版本Mapper
 */
@Mapper
public interface ProposalVersionMapper extends BaseMapper<ProposalVersion> {
    
    /**
     * 获取方案的版本列表
     */
    @Select("SELECT * FROM ai_proposal_version WHERE proposal_id = #{proposalId} ORDER BY created_at DESC")
    List<ProposalVersion> findByProposalId(@Param("proposalId") Long proposalId);
    
    /**
     * 获取当前版本
     */
    @Select("SELECT * FROM ai_proposal_version WHERE proposal_id = #{proposalId} AND is_current = true LIMIT 1")
    ProposalVersion findCurrentVersion(@Param("proposalId") Long proposalId);
    
    /**
     * 获取最新版本号
     */
    @Select("SELECT MAX(version_number) FROM ai_proposal_version WHERE proposal_id = #{proposalId}")
    String getLatestVersionNumber(@Param("proposalId") Long proposalId);
    
    /**
     * 重置当前版本标记
     */
    @Update("UPDATE ai_proposal_version SET is_current = false WHERE proposal_id = #{proposalId}")
    void resetCurrentVersion(@Param("proposalId") Long proposalId);
}