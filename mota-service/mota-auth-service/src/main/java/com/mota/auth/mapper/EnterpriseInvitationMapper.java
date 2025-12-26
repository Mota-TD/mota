package com.mota.auth.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.auth.entity.EnterpriseInvitation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 企业邀请Mapper
 */
@Mapper
public interface EnterpriseInvitationMapper extends BaseMapper<EnterpriseInvitation> {

    /**
     * 根据邀请码查询
     */
    @Select("SELECT * FROM enterprise_invitation WHERE invite_code = #{inviteCode} AND status = 1")
    EnterpriseInvitation findByInviteCode(@Param("inviteCode") String inviteCode);

    /**
     * 根据企业ID查询所有邀请
     */
    @Select("SELECT * FROM enterprise_invitation WHERE enterprise_id = #{enterpriseId} ORDER BY created_at DESC")
    List<EnterpriseInvitation> findByEnterpriseId(@Param("enterpriseId") Long enterpriseId);

    /**
     * 增加使用次数
     */
    @Update("UPDATE enterprise_invitation SET used_count = used_count + 1 WHERE id = #{id}")
    void incrementUsedCount(@Param("id") Long id);

    /**
     * 更新状态
     */
    @Update("UPDATE enterprise_invitation SET status = #{status} WHERE id = #{id}")
    void updateStatus(@Param("id") Long id, @Param("status") Integer status);
}