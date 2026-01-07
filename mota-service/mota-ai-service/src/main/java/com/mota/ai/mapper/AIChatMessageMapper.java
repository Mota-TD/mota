package com.mota.ai.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.ai.entity.AIChatMessage;
import org.apache.ibatis.annotations.Mapper;

/**
 * AI对话消息Mapper
 */
@Mapper
public interface AIChatMessageMapper extends BaseMapper<AIChatMessage> {
}