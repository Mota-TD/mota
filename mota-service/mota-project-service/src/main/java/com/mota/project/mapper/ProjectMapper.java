package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.Project;
import org.apache.ibatis.annotations.Mapper;

/**
 * 项目Mapper
 */
@Mapper
public interface ProjectMapper extends BaseMapper<Project> {
}