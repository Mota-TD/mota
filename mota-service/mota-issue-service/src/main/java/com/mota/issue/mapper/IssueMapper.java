package com.mota.issue.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.issue.entity.Issue;
import org.apache.ibatis.annotations.Mapper;

/**
 * 任务Mapper
 */
@Mapper
public interface IssueMapper extends BaseMapper<Issue> {
}