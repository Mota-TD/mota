package com.mota.issue.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.issue.entity.Sprint;
import org.apache.ibatis.annotations.Mapper;

/**
 * 迭代Mapper
 */
@Mapper
public interface SprintMapper extends BaseMapper<Sprint> {
}