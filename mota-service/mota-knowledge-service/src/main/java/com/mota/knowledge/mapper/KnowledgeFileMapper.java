package com.mota.knowledge.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.knowledge.entity.KnowledgeFile;
import org.apache.ibatis.annotations.Mapper;

/**
 * 知识文件Mapper
 */
@Mapper
public interface KnowledgeFileMapper extends BaseMapper<KnowledgeFile> {
}