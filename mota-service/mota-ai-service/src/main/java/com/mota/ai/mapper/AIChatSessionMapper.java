package com.mota.ai.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.ai.entity.AIChatSession;
import org.apache.ibatis.annotations.Mapper;

/**
 * AI对话会话Mapper
 */
@Mapper
public interface AIChatSessionMapper extends BaseMapper<AIChatSession> {
}