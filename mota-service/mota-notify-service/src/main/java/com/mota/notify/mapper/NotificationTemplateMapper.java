package com.mota.notify.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.notify.entity.NotificationTemplate;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 通知模板Mapper
 */
@Mapper
public interface NotificationTemplateMapper extends BaseMapper<NotificationTemplate> {

    /**
     * 根据模板编码查询
     */
    NotificationTemplate selectByCode(@Param("tenantId") Long tenantId, @Param("templateCode") String templateCode);

    /**
     * 查询租户的模板列表
     */
    List<NotificationTemplate> selectByTenant(@Param("tenantId") Long tenantId);

    /**
     * 查询指定类型和渠道的模板
     */
    NotificationTemplate selectByTypeAndChannel(@Param("tenantId") Long tenantId,
                                                 @Param("notifyType") String notifyType,
                                                 @Param("channel") String channel);

    /**
     * 查询系统模板
     */
    List<NotificationTemplate> selectSystemTemplates();

    /**
     * 查询启用的模板
     */
    List<NotificationTemplate> selectEnabled(@Param("tenantId") Long tenantId);
}