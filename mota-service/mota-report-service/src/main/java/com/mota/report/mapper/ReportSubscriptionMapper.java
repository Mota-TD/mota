package com.mota.report.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.report.entity.ReportSubscription;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 报表订阅Mapper
 *
 * @author mota
 */
@Mapper
public interface ReportSubscriptionMapper extends BaseMapper<ReportSubscription> {

    /**
     * 查询用户的订阅
     */
    @Select("SELECT * FROM report_subscription WHERE tenant_id = #{tenantId} AND user_id = #{userId} AND status = 1")
    List<ReportSubscription> findByUser(@Param("tenantId") Long tenantId, @Param("userId") Long userId);

    /**
     * 查询目标的订阅者
     */
    @Select("SELECT * FROM report_subscription WHERE subscribe_type = #{type} AND target_id = #{targetId} AND status = 1")
    List<ReportSubscription> findByTarget(@Param("type") String type, @Param("targetId") Long targetId);

    /**
     * 查询用户对目标的订阅
     */
    @Select("SELECT * FROM report_subscription WHERE user_id = #{userId} AND subscribe_type = #{type} " +
            "AND target_id = #{targetId}")
    ReportSubscription findByUserAndTarget(@Param("userId") Long userId,
                                           @Param("type") String type,
                                           @Param("targetId") Long targetId);

    /**
     * 更新接收状态
     */
    @Update("UPDATE report_subscription SET last_received_at = #{receivedAt}, receive_count = receive_count + 1 " +
            "WHERE id = #{id}")
    int updateReceiveStatus(@Param("id") Long id, @Param("receivedAt") LocalDateTime receivedAt);

    /**
     * 取消订阅
     */
    @Update("UPDATE report_subscription SET status = 0, unsubscribed_at = NOW() WHERE id = #{id}")
    int unsubscribe(@Param("id") Long id);

    /**
     * 重新订阅
     */
    @Update("UPDATE report_subscription SET status = 1, subscribed_at = NOW(), unsubscribed_at = NULL WHERE id = #{id}")
    int resubscribe(@Param("id") Long id);
}