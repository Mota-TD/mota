package com.mota.ai.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.ai.entity.AITrainingHistory;
import org.apache.ibatis.annotations.Mapper;

/**
 * AI训练历史Mapper
 */
@Mapper
public interface AITrainingHistoryMapper extends BaseMapper<AITrainingHistory> {
}