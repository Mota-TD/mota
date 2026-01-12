package com.mota.notify.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.notify.entity.DoNotDisturbSetting;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 免打扰设置Mapper
 */
@Mapper
public interface DoNotDisturbSettingMapper extends BaseMapper<DoNotDisturbSetting> {

    /**
     * 查询用户的免打扰设置
     */
    DoNotDisturbSetting selectByUser(@Param("tenantId") Long tenantId, @Param("userId") Long userId);

    /**
     * 删除用户的免打扰设置
     */
    int deleteByUser(@Param("tenantId") Long tenantId, @Param("userId") Long userId);
}