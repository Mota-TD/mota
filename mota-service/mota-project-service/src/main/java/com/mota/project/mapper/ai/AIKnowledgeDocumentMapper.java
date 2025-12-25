package com.mota.project.mapper.ai;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.project.entity.ai.AIKnowledgeDocument;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * AI知识文档Mapper
 */
@Mapper
public interface AIKnowledgeDocumentMapper extends BaseMapper<AIKnowledgeDocument> {

    /**
     * 分页查询文档列表
     */
    IPage<AIKnowledgeDocument> selectDocumentPage(
            Page<AIKnowledgeDocument> page,
            @Param("teamId") Long teamId,
            @Param("categoryId") Long categoryId,
            @Param("fileType") String fileType,
            @Param("parseStatus") String parseStatus,
            @Param("keyword") String keyword
    );

    /**
     * 根据团队ID统计文档数量
     */
    int countByTeamId(@Param("teamId") Long teamId);

    /**
     * 获取待解析的文档列表
     */
    List<AIKnowledgeDocument> selectPendingDocuments(@Param("limit") int limit);

    /**
     * 全文搜索文档
     */
    List<AIKnowledgeDocument> fullTextSearch(
            @Param("keyword") String keyword,
            @Param("teamId") Long teamId,
            @Param("limit") int limit
    );

    /**
     * 批量更新解析状态
     */
    int batchUpdateParseStatus(
            @Param("ids") List<Long> ids,
            @Param("status") String status
    );
}