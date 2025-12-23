package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.WikiDocument;
import org.apache.ibatis.annotations.Mapper;

/**
 * 知识库文档Mapper
 */
@Mapper
public interface WikiDocumentMapper extends BaseMapper<WikiDocument> {
}