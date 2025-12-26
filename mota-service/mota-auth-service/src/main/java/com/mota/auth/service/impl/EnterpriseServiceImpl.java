package com.mota.auth.service.impl;

import cn.hutool.core.util.IdUtil;
import com.mota.auth.dto.*;
import com.mota.auth.entity.*;
import com.mota.auth.mapper.*;
import com.mota.auth.service.EnterpriseService;
import com.mota.common.core.exception.BusinessException;
import com.mota.common.security.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 企业服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EnterpriseServiceImpl implements EnterpriseService {

    private final EnterpriseMapper enterpriseMapper;
    private final EnterpriseMemberMapper enterpriseMemberMapper;
    private final EnterpriseInvitationMapper enterpriseInvitationMapper;
    private final IndustryMapper industryMapper;
    private final UserMapper userMapper;

    private static final Map<String, String> ROLE_NAMES = new HashMap<>();
    private static final Map<Integer, String> STATUS_NAMES = new HashMap<>();

    static {
        ROLE_NAMES.put("super_admin", "超级管理员");
        ROLE_NAMES.put("admin", "管理员");
        ROLE_NAMES.put("member", "成员");

        STATUS_NAMES.put(0, "已失效");
        STATUS_NAMES.put(1, "有效");
        STATUS_NAMES.put(2, "已使用完");
    }

    @Override
    public EnterpriseVO getCurrentEnterprise() {
        Long currentUserId = SecurityUtils.getUserId();
        if (currentUserId == null) {
            throw new BusinessException("用户未登录");
        }

        // 查询用户所属企业
        List<EnterpriseMember> members = enterpriseMemberMapper.findByUserId(currentUserId);
        if (members.isEmpty()) {
            return null;
        }

        // 获取第一个企业（目前一个用户只能属于一个企业）
        EnterpriseMember member = members.get(0);
        Enterprise enterprise = enterpriseMapper.selectById(member.getEnterpriseId());
        if (enterprise == null || enterprise.getDeleted() == 1) {
            return null;
        }

        return EnterpriseVO.builder()
                .id(enterprise.getId())
                .orgId(enterprise.getOrgId())
                .name(enterprise.getName())
                .shortName(enterprise.getShortName())
                .industryId(enterprise.getIndustryId())
                .industryName(enterprise.getIndustryName())
                .logo(enterprise.getLogo())
                .description(enterprise.getDescription())
                .address(enterprise.getAddress())
                .contactName(enterprise.getContactName())
                .contactPhone(enterprise.getContactPhone())
                .contactEmail(enterprise.getContactEmail())
                .website(enterprise.getWebsite())
                .scale(enterprise.getScale())
                .memberCount(enterprise.getMemberCount())
                .maxMembers(enterprise.getMaxMembers())
                .status(enterprise.getStatus())
                .verified(enterprise.getVerified())
                .currentUserRole(member.getRole())
                .createdAt(enterprise.getCreatedAt())
                .build();
    }

    @Override
    public Enterprise getEnterpriseById(Long enterpriseId) {
        Enterprise enterprise = enterpriseMapper.selectById(enterpriseId);
        if (enterprise == null || enterprise.getDeleted() == 1) {
            throw new BusinessException("企业不存在");
        }
        return enterprise;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Enterprise updateEnterprise(Long enterpriseId, EnterpriseUpdateRequest request) {
        // 验证权限
        checkEnterpriseAdminPermission(enterpriseId);

        Enterprise enterprise = getEnterpriseById(enterpriseId);

        // 更新字段
        if (request.getName() != null) {
            // 检查名称是否重复
            Enterprise existing = enterpriseMapper.findByName(request.getName());
            if (existing != null && !existing.getId().equals(enterpriseId)) {
                throw new BusinessException("企业名称已被使用");
            }
            enterprise.setName(request.getName());
        }
        if (request.getShortName() != null) {
            enterprise.setShortName(request.getShortName());
        }
        if (request.getIndustryId() != null) {
            Industry industry = industryMapper.selectById(request.getIndustryId());
            if (industry == null) {
                throw new BusinessException("行业不存在");
            }
            enterprise.setIndustryId(request.getIndustryId());
            enterprise.setIndustryName(industry.getName());
        }
        if (request.getLogo() != null) {
            enterprise.setLogo(request.getLogo());
        }
        if (request.getDescription() != null) {
            enterprise.setDescription(request.getDescription());
        }
        if (request.getAddress() != null) {
            enterprise.setAddress(request.getAddress());
        }
        if (request.getContactName() != null) {
            enterprise.setContactName(request.getContactName());
        }
        if (request.getContactPhone() != null) {
            enterprise.setContactPhone(request.getContactPhone());
        }
        if (request.getContactEmail() != null) {
            enterprise.setContactEmail(request.getContactEmail());
        }
        if (request.getWebsite() != null) {
            enterprise.setWebsite(request.getWebsite());
        }
        if (request.getScale() != null) {
            enterprise.setScale(request.getScale());
        }

        enterprise.setUpdatedAt(LocalDateTime.now());
        enterpriseMapper.updateById(enterprise);

        log.info("企业信息更新成功: enterpriseId={}", enterpriseId);
        return enterprise;
    }

    @Override
    public List<EnterpriseMemberVO> getMembers(Long enterpriseId) {
        // 验证权限
        checkEnterpriseMemberPermission(enterpriseId);

        List<EnterpriseMember> members = enterpriseMemberMapper.findByEnterpriseId(enterpriseId);
        List<EnterpriseMemberVO> result = new ArrayList<>();

        for (EnterpriseMember member : members) {
            User user = userMapper.selectById(member.getUserId());
            if (user == null) continue;

            User inviter = member.getInvitedBy() != null ? userMapper.selectById(member.getInvitedBy()) : null;

            result.add(EnterpriseMemberVO.builder()
                    .id(member.getId())
                    .userId(member.getUserId())
                    .username(user.getUsername())
                    .nickname(user.getNickname())
                    .email(user.getEmail())
                    .phone(user.getPhone())
                    .avatar(user.getAvatar())
                    .role(member.getRole())
                    .roleName(ROLE_NAMES.getOrDefault(member.getRole(), member.getRole()))
                    .departmentId(member.getDepartmentId())
                    .position(member.getPosition())
                    .employeeNo(member.getEmployeeNo())
                    .status(member.getStatus())
                    .joinedAt(member.getJoinedAt())
                    .invitedBy(member.getInvitedBy())
                    .invitedByName(inviter != null ? inviter.getNickname() : null)
                    .build());
        }

        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateMemberRole(Long enterpriseId, Long memberId, String role) {
        // 验证权限（只有超级管理员可以修改角色）
        checkEnterpriseSuperAdminPermission(enterpriseId);

        EnterpriseMember member = enterpriseMemberMapper.selectById(memberId);
        if (member == null || member.getDeleted() == 1 || !member.getEnterpriseId().equals(enterpriseId)) {
            throw new BusinessException("成员不存在");
        }

        // 不能修改超级管理员的角色
        if ("super_admin".equals(member.getRole())) {
            throw new BusinessException("不能修改超级管理员的角色");
        }

        // 验证角色值
        if (!ROLE_NAMES.containsKey(role) || "super_admin".equals(role)) {
            throw new BusinessException("无效的角色");
        }

        member.setRole(role);
        member.setUpdatedAt(LocalDateTime.now());
        enterpriseMemberMapper.updateById(member);

        log.info("成员角色更新成功: memberId={}, role={}", memberId, role);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void removeMember(Long enterpriseId, Long memberId) {
        // 验证权限
        checkEnterpriseAdminPermission(enterpriseId);

        EnterpriseMember member = enterpriseMemberMapper.selectById(memberId);
        if (member == null || member.getDeleted() == 1 || !member.getEnterpriseId().equals(enterpriseId)) {
            throw new BusinessException("成员不存在");
        }

        // 不能移除超级管理员
        if ("super_admin".equals(member.getRole())) {
            throw new BusinessException("不能移除超级管理员");
        }

        // 不能移除自己
        Long currentUserId = SecurityUtils.getUserId();
        if (member.getUserId().equals(currentUserId)) {
            throw new BusinessException("不能移除自己");
        }

        // 软删除成员
        member.setDeleted(1);
        member.setUpdatedAt(LocalDateTime.now());
        enterpriseMemberMapper.updateById(member);

        // 更新企业成员数量
        enterpriseMapper.updateMemberCount(enterpriseId, -1);

        // 更新用户的组织信息
        User user = userMapper.selectById(member.getUserId());
        if (user != null) {
            user.setOrgId(null);
            user.setOrgName(null);
            userMapper.updateById(user);
        }

        log.info("成员移除成功: memberId={}", memberId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public InvitationVO createInvitation(Long enterpriseId, CreateInvitationRequest request) {
        // 验证权限
        checkEnterpriseAdminPermission(enterpriseId);

        Enterprise enterprise = getEnterpriseById(enterpriseId);
        Long currentUserId = SecurityUtils.getUserId();

        // 生成邀请码
        String inviteCode = IdUtil.fastSimpleUUID().substring(0, 12).toUpperCase();

        EnterpriseInvitation invitation = new EnterpriseInvitation();
        invitation.setEnterpriseId(enterpriseId);
        invitation.setInviteCode(inviteCode);
        invitation.setInviteType(request.getInviteType());
        invitation.setTargetEmail(request.getTargetEmail());
        invitation.setTargetPhone(request.getTargetPhone());
        invitation.setRole(request.getRole());
        invitation.setDepartmentId(request.getDepartmentId());
        invitation.setMaxUses(request.getMaxUses());
        invitation.setUsedCount(0);
        invitation.setExpiredAt(LocalDateTime.now().plusDays(request.getValidDays()));
        invitation.setStatus(1);
        invitation.setInvitedBy(currentUserId);
        invitation.setCreatedAt(LocalDateTime.now());
        invitation.setUpdatedAt(LocalDateTime.now());

        enterpriseInvitationMapper.insert(invitation);

        User inviter = userMapper.selectById(currentUserId);

        log.info("邀请创建成功: inviteCode={}, enterpriseId={}", inviteCode, enterpriseId);

        return InvitationVO.builder()
                .id(invitation.getId())
                .inviteCode(inviteCode)
                .inviteLink("/register?inviteCode=" + inviteCode)
                .inviteType(invitation.getInviteType())
                .targetEmail(invitation.getTargetEmail())
                .targetPhone(invitation.getTargetPhone())
                .role(invitation.getRole())
                .roleName(ROLE_NAMES.getOrDefault(invitation.getRole(), invitation.getRole()))
                .departmentId(invitation.getDepartmentId())
                .maxUses(invitation.getMaxUses())
                .usedCount(invitation.getUsedCount())
                .expiredAt(invitation.getExpiredAt())
                .status(invitation.getStatus())
                .statusName(STATUS_NAMES.getOrDefault(invitation.getStatus(), "未知"))
                .invitedBy(currentUserId)
                .invitedByName(inviter != null ? inviter.getNickname() : null)
                .createdAt(invitation.getCreatedAt())
                .build();
    }

    @Override
    public List<InvitationVO> getInvitations(Long enterpriseId) {
        // 验证权限
        checkEnterpriseAdminPermission(enterpriseId);

        List<EnterpriseInvitation> invitations = enterpriseInvitationMapper.findByEnterpriseId(enterpriseId);

        return invitations.stream().map(invitation -> {
            User inviter = userMapper.selectById(invitation.getInvitedBy());
            return InvitationVO.builder()
                    .id(invitation.getId())
                    .inviteCode(invitation.getInviteCode())
                    .inviteLink("/register?inviteCode=" + invitation.getInviteCode())
                    .inviteType(invitation.getInviteType())
                    .targetEmail(invitation.getTargetEmail())
                    .targetPhone(invitation.getTargetPhone())
                    .role(invitation.getRole())
                    .roleName(ROLE_NAMES.getOrDefault(invitation.getRole(), invitation.getRole()))
                    .departmentId(invitation.getDepartmentId())
                    .maxUses(invitation.getMaxUses())
                    .usedCount(invitation.getUsedCount())
                    .expiredAt(invitation.getExpiredAt())
                    .status(invitation.getStatus())
                    .statusName(STATUS_NAMES.getOrDefault(invitation.getStatus(), "未知"))
                    .invitedBy(invitation.getInvitedBy())
                    .invitedByName(inviter != null ? inviter.getNickname() : null)
                    .createdAt(invitation.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void revokeInvitation(Long enterpriseId, Long invitationId) {
        // 验证权限
        checkEnterpriseAdminPermission(enterpriseId);

        EnterpriseInvitation invitation = enterpriseInvitationMapper.selectById(invitationId);
        if (invitation == null || !invitation.getEnterpriseId().equals(enterpriseId)) {
            throw new BusinessException("邀请不存在");
        }

        enterpriseInvitationMapper.updateStatus(invitationId, 0);
        log.info("邀请已撤销: invitationId={}", invitationId);
    }

    @Override
    public InvitationValidateVO validateInvitation(String inviteCode) {
        EnterpriseInvitation invitation = enterpriseInvitationMapper.findByInviteCode(inviteCode);

        if (invitation == null) {
            return InvitationValidateVO.builder()
                    .valid(false)
                    .errorMessage("邀请码无效")
                    .build();
        }

        if (invitation.getExpiredAt().isBefore(LocalDateTime.now())) {
            return InvitationValidateVO.builder()
                    .valid(false)
                    .errorMessage("邀请码已过期")
                    .build();
        }

        if (invitation.getMaxUses() > 0 && invitation.getUsedCount() >= invitation.getMaxUses()) {
            return InvitationValidateVO.builder()
                    .valid(false)
                    .errorMessage("邀请码已达到使用上限")
                    .build();
        }

        Enterprise enterprise = enterpriseMapper.selectById(invitation.getEnterpriseId());
        if (enterprise == null || enterprise.getDeleted() == 1) {
            return InvitationValidateVO.builder()
                    .valid(false)
                    .errorMessage("企业不存在")
                    .build();
        }

        User inviter = userMapper.selectById(invitation.getInvitedBy());

        return InvitationValidateVO.builder()
                .valid(true)
                .enterpriseId(enterprise.getId())
                .enterpriseName(enterprise.getName())
                .enterpriseLogo(enterprise.getLogo())
                .industryName(enterprise.getIndustryName())
                .role(invitation.getRole())
                .roleName(ROLE_NAMES.getOrDefault(invitation.getRole(), invitation.getRole()))
                .invitedByName(inviter != null ? inviter.getNickname() : null)
                .expiredAt(invitation.getExpiredAt())
                .build();
    }

    /**
     * 检查是否是企业成员
     */
    private void checkEnterpriseMemberPermission(Long enterpriseId) {
        Long currentUserId = SecurityUtils.getUserId();
        if (currentUserId == null) {
            throw new BusinessException("用户未登录");
        }

        EnterpriseMember member = enterpriseMemberMapper.findByEnterpriseAndUser(enterpriseId, currentUserId);
        if (member == null || member.getDeleted() == 1) {
            throw new BusinessException("无权访问该企业");
        }
    }

    /**
     * 检查是否是企业管理员
     */
    private void checkEnterpriseAdminPermission(Long enterpriseId) {
        Long currentUserId = SecurityUtils.getUserId();
        if (currentUserId == null) {
            throw new BusinessException("用户未登录");
        }

        EnterpriseMember member = enterpriseMemberMapper.findByEnterpriseAndUser(enterpriseId, currentUserId);
        if (member == null || member.getDeleted() == 1) {
            throw new BusinessException("无权访问该企业");
        }

        if (!"super_admin".equals(member.getRole()) && !"admin".equals(member.getRole())) {
            throw new BusinessException("需要管理员权限");
        }
    }

    /**
     * 检查是否是企业超级管理员
     */
    private void checkEnterpriseSuperAdminPermission(Long enterpriseId) {
        Long currentUserId = SecurityUtils.getUserId();
        if (currentUserId == null) {
            throw new BusinessException("用户未登录");
        }

        EnterpriseMember member = enterpriseMemberMapper.findByEnterpriseAndUser(enterpriseId, currentUserId);
        if (member == null || member.getDeleted() == 1) {
            throw new BusinessException("无权访问该企业");
        }

        if (!"super_admin".equals(member.getRole())) {
            throw new BusinessException("需要超级管理员权限");
        }
    }
}