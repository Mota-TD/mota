package com.mota.project.mapper.proposal;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.proposal.ProposalExport;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 方案导出Mapper
 */
@Mapper
public interface ProposalExportMapper extends BaseMapper<ProposalExport> {
    
    /**
     * 获取方案的导出记录
     */
    @Select("SELECT * FROM ai_proposal_export WHERE proposal_id = #{proposalId} ORDER BY created_at DESC")
    List<ProposalExport> findByProposalId(@Param("proposalId") Long proposalId);
    
    /**
     * 获取用户的导出记录
     */
    @Select("SELECT * FROM ai_proposal_export WHERE created_by = #{userId} ORDER BY created_at DESC")
    List<ProposalExport> findByUserId(@Param("userId") Long userId);
    
    /**
     * 获取待处理的导出任务
     */
    @Select("SELECT * FROM ai_proposal_export WHERE status = 'pending' ORDER BY created_at LIMIT #{limit}")
    List<ProposalExport> findPendingExports(@Param("limit") int limit);
    
    /**
     * 增加下载次数
     */
    @Update("UPDATE ai_proposal_export SET download_count = download_count + 1 WHERE id = #{id}")
    void incrementDownloadCount(@Param("id") Long id);
}