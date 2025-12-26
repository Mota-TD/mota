package com.mota.auth.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.auth.entity.Industry;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 行业Mapper
 */
@Mapper
public interface IndustryMapper extends BaseMapper<Industry> {

    /**
     * 查询所有启用的行业
     */
    @Select("SELECT * FROM industry WHERE status = 1 ORDER BY level, sort_order")
    List<Industry> findAllEnabled();

    /**
     * 根据父ID查询子行业
     */
    @Select("SELECT * FROM industry WHERE parent_id = #{parentId} AND status = 1 ORDER BY sort_order")
    List<Industry> findByParentId(@Param("parentId") Long parentId);

    /**
     * 查询一级行业
     */
    @Select("SELECT * FROM industry WHERE level = 1 AND status = 1 ORDER BY sort_order")
    List<Industry> findTopLevel();

    /**
     * 根据代码查询行业
     */
    @Select("SELECT * FROM industry WHERE code = #{code} AND status = 1")
    Industry findByCode(@Param("code") String code);
}