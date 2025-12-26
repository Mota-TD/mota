package com.mota.auth.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.auth.entity.EnterpriseMember;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 企业成员Mapper
 */
@Mapper
public interface EnterpriseMemberMapper extends BaseMapper<EnterpriseMember> {

    /**
     * 根据企业ID和用户ID查询成员
     */
    @Select("SELECT * FROM enterprise_member WHERE enterprise_id = #{enterpriseId} AND user_id = #{userId} AND deleted = 0")
    EnterpriseMember findByEnterpriseAndUser(@Param("enterpriseId") Long enterpriseId, @Param("userId") Long userId);

    /**
     * 根据用户ID查询所属企业成员信息
     */
    @Select("SELECT * FROM enterprise_member WHERE user_id = #{userId} AND deleted = 0")
    List<EnterpriseMember> findByUserId(@Param("userId") Long userId);

    /**
     * 根据企业ID查询所有成员
     */
    @Select("SELECT * FROM enterprise_member WHERE enterprise_id = #{enterpriseId} AND deleted = 0 ORDER BY role, created_at")
    List<EnterpriseMember> findByEnterpriseId(@Param("enterpriseId") Long enterpriseId);

    /**
     * 统计企业成员数量
     */
    @Select("SELECT COUNT(*) FROM enterprise_member WHERE enterprise_id = #{enterpriseId} AND deleted = 0")
    int countByEnterpriseId(@Param("enterpriseId") Long enterpriseId);
}