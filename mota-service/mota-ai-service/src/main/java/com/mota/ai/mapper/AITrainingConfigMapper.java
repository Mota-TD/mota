package com.mota.ai.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.ai.entity.AITrainingConfig;
import org.apache.ibatis.annotations.Mapper;

/**
 * AI训练配置Mapper
 */
@Mapper
public interface AITrainingConfigMapper extends BaseMapper<AITrainingConfig> {
}