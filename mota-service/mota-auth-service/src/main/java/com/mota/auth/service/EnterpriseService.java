package com.mota.auth.service;

import com.mota.auth.dto.*;
import com.mota.auth.entity.Enterprise;

import java.util.List;

/**
 * 企业服务接口
 */
public interface EnterpriseService {

    /**
     * 获取当前用户的企业信息
     */
    EnterpriseVO getCurrentEnterprise();

    /**
     * 根据ID获取企业信息
     */
    Enterprise getEnterpriseById(Long enterpriseId);

    /**
     * 更新企业信息
     */
    Enterprise updateEnterprise(Long enterpriseId, EnterpriseUpdateRequest request);

    /**
     * 获取企业成员列表
     */
    List<EnterpriseMemberVO> getMembers(Long enterpriseId);

    /**
     * 更新成员角色
     */
    void updateMemberRole(Long enterpriseId, Long memberId, String role);

    /**
     * 移除成员
     */
    void removeMember(Long enterpriseId, Long memberId);

    /**
     * 创建邀请
     */
    InvitationVO createInvitation(Long enterpriseId, CreateInvitationRequest request);

    /**
     * 获取邀请列表
     */
    List<InvitationVO> getInvitations(Long enterpriseId);

    /**
     * 撤销邀请
     */
    void revokeInvitation(Long enterpriseId, Long invitationId);

    /**
     * 验证邀请码
     */
    InvitationValidateVO validateInvitation(String inviteCode);
}