package com.mota.ai.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.ai.entity.AINews;
import org.apache.ibatis.annotations.Mapper;

/**
 * AI新闻Mapper
 */
@Mapper
public interface AINewsMapper extends BaseMapper<AINews> {
}