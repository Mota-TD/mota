package com.mota.project.mapper.search;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.search.UserSearchPreference;
import org.apache.ibatis.annotations.*;

/**
 * 用户搜索偏好Mapper
 */
@Mapper
public interface UserSearchPreferenceMapper extends BaseMapper<UserSearchPreference> {
    
    /**
     * 根据用户ID查询偏好
     */
    @Select("SELECT * FROM user_search_preference WHERE user_id = #{userId}")
    UserSearchPreference findByUserId(@Param("userId") Long userId);
    
    /**
     * 删除用户偏好
     */
    @Delete("DELETE FROM user_search_preference WHERE user_id = #{userId}")
    void deleteByUserId(@Param("userId") Long userId);
}