package com.mota.auth.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.auth.entity.Enterprise;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

/**
 * 企业Mapper
 */
@Mapper
public interface EnterpriseMapper extends BaseMapper<Enterprise> {

    /**
     * 根据组织ID查询企业
     */
    @Select("SELECT * FROM enterprise WHERE org_id = #{orgId} AND deleted = 0")
    Enterprise findByOrgId(@Param("orgId") String orgId);

    /**
     * 根据企业名称查询
     */
    @Select("SELECT * FROM enterprise WHERE name = #{name} AND deleted = 0")
    Enterprise findByName(@Param("name") String name);

    /**
     * 根据管理员用户ID查询企业
     */
    @Select("SELECT * FROM enterprise WHERE admin_user_id = #{adminUserId} AND deleted = 0")
    Enterprise findByAdminUserId(@Param("adminUserId") Long adminUserId);

    /**
     * 更新成员数量
     */
    @Update("UPDATE enterprise SET member_count = member_count + #{delta} WHERE id = #{enterpriseId}")
    void updateMemberCount(@Param("enterpriseId") Long enterpriseId, @Param("delta") int delta);
}