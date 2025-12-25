package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.UserViewConfig;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 用户视图配置Mapper接口
 */
@Mapper
public interface UserViewConfigMapper extends BaseMapper<UserViewConfig> {

    /**
     * 获取用户的所有视图配置
     */
    List<UserViewConfig> selectByUserId(@Param("userId") Long userId);

    /**
     * 获取用户指定类型的视图配置
     */
    List<UserViewConfig> selectByUserIdAndType(@Param("userId") Long userId,
                                                @Param("viewType") String viewType);

    /**
     * 获取用户的默认视图
     */
    UserViewConfig selectDefaultView(@Param("userId") Long userId,
                                      @Param("viewType") String viewType);

    /**
     * 获取项目相关的视图配置
     */
    List<UserViewConfig> selectByProjectId(@Param("projectId") Long projectId);

    /**
     * 获取共享的视图配置
     */
    List<UserViewConfig> selectSharedViews(@Param("viewType") String viewType);

    /**
     * 设置默认视图
     */
    int setDefaultView(@Param("id") Long id, @Param("userId") Long userId, @Param("viewType") String viewType);

    /**
     * 取消默认视图
     */
    int unsetDefaultView(@Param("userId") Long userId, @Param("viewType") String viewType);

    /**
     * 检查视图名称是否存在
     */
    int countByUserIdAndName(@Param("userId") Long userId, @Param("name") String name);
}