package com.mota.auth.controller;

import com.mota.auth.entity.Enterprise;
import com.mota.auth.entity.EnterpriseMember;
import com.mota.auth.entity.EnterpriseInvitation;
import com.mota.auth.service.EnterpriseService;
import com.mota.auth.dto.*;
import com.mota.common.core.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 企业管理控制器
 */
@Tag(name = "企业管理", description = "企业信息管理、成员管理、邀请管理等")
@RestController
@RequestMapping("/api/v1/enterprise")
@RequiredArgsConstructor
public class EnterpriseController {

    private final EnterpriseService enterpriseService;

    @Operation(summary = "获取当前用户的企业信息")
    @GetMapping("/current")
    public Result<EnterpriseVO> getCurrentEnterprise() {
        EnterpriseVO enterprise = enterpriseService.getCurrentEnterprise();
        return Result.success(enterprise);
    }

    @Operation(summary = "更新企业信息")
    @PutMapping("/{enterpriseId}")
    public Result<Enterprise> updateEnterprise(
            @PathVariable Long enterpriseId,
            @Valid @RequestBody EnterpriseUpdateRequest request) {
        Enterprise enterprise = enterpriseService.updateEnterprise(enterpriseId, request);
        return Result.success(enterprise);
    }

    @Operation(summary = "获取企业成员列表")
    @GetMapping("/{enterpriseId}/members")
    public Result<List<EnterpriseMemberVO>> getMembers(@PathVariable Long enterpriseId) {
        List<EnterpriseMemberVO> members = enterpriseService.getMembers(enterpriseId);
        return Result.success(members);
    }

    @Operation(summary = "更新成员角色")
    @PutMapping("/{enterpriseId}/members/{memberId}/role")
    public Result<Void> updateMemberRole(
            @PathVariable Long enterpriseId,
            @PathVariable Long memberId,
            @RequestParam String role) {
        enterpriseService.updateMemberRole(enterpriseId, memberId, role);
        return Result.success();
    }

    @Operation(summary = "移除成员")
    @DeleteMapping("/{enterpriseId}/members/{memberId}")
    public Result<Void> removeMember(
            @PathVariable Long enterpriseId,
            @PathVariable Long memberId) {
        enterpriseService.removeMember(enterpriseId, memberId);
        return Result.success();
    }

    @Operation(summary = "创建邀请链接")
    @PostMapping("/{enterpriseId}/invitations")
    public Result<InvitationVO> createInvitation(
            @PathVariable Long enterpriseId,
            @Valid @RequestBody CreateInvitationRequest request) {
        InvitationVO invitation = enterpriseService.createInvitation(enterpriseId, request);
        return Result.success(invitation);
    }

    @Operation(summary = "获取邀请列表")
    @GetMapping("/{enterpriseId}/invitations")
    public Result<List<InvitationVO>> getInvitations(@PathVariable Long enterpriseId) {
        List<InvitationVO> invitations = enterpriseService.getInvitations(enterpriseId);
        return Result.success(invitations);
    }

    @Operation(summary = "撤销邀请")
    @DeleteMapping("/{enterpriseId}/invitations/{invitationId}")
    public Result<Void> revokeInvitation(
            @PathVariable Long enterpriseId,
            @PathVariable Long invitationId) {
        enterpriseService.revokeInvitation(enterpriseId, invitationId);
        return Result.success();
    }

    @Operation(summary = "验证邀请码")
    @GetMapping("/invitations/validate")
    public Result<InvitationValidateVO> validateInvitation(@RequestParam String inviteCode) {
        InvitationValidateVO result = enterpriseService.validateInvitation(inviteCode);
        return Result.success(result);
    }
}