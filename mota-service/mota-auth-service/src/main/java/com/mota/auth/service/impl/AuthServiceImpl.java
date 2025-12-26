package com.mota.auth.service.impl;

import cn.hutool.core.util.IdUtil;
import com.mota.api.auth.dto.LoginRequest;
import com.mota.api.auth.dto.LoginResponse;
import com.mota.api.auth.dto.RegisterRequest;
import com.mota.api.auth.dto.RegisterResponse;
import com.mota.auth.entity.*;
import com.mota.auth.mapper.*;
import com.mota.auth.service.AuthService;
import com.mota.common.core.exception.BusinessException;
import com.mota.common.core.result.ResultCode;
import com.mota.common.redis.service.RedisService;
import com.mota.common.security.util.JwtUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 认证服务实现
 */
@Slf4j
@Service
public class AuthServiceImpl implements AuthService {

    private final UserMapper userMapper;
    private final IndustryMapper industryMapper;
    private final EnterpriseMapper enterpriseMapper;
    private final EnterpriseMemberMapper enterpriseMemberMapper;
    private final EnterpriseInvitationMapper enterpriseInvitationMapper;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;
    
    // Optional Redis service - may be null in standalone mode
    private final RedisService redisService;
    
    // In-memory fallback for standalone mode (when Redis is not available)
    private final Map<String, String> tokenBlacklist = new ConcurrentHashMap<>();
    private final Map<String, String> captchaStore = new ConcurrentHashMap<>();

    private static final String TOKEN_BLACKLIST_PREFIX = "token:blacklist:";
    private static final String CAPTCHA_PREFIX = "captcha:";

    @Autowired
    public AuthServiceImpl(UserMapper userMapper,
                          IndustryMapper industryMapper,
                          EnterpriseMapper enterpriseMapper,
                          EnterpriseMemberMapper enterpriseMemberMapper,
                          EnterpriseInvitationMapper enterpriseInvitationMapper,
                          JwtUtils jwtUtils, 
                          PasswordEncoder passwordEncoder,
                          @Autowired(required = false) RedisService redisService) {
        this.userMapper = userMapper;
        this.industryMapper = industryMapper;
        this.enterpriseMapper = enterpriseMapper;
        this.enterpriseMemberMapper = enterpriseMemberMapper;
        this.enterpriseInvitationMapper = enterpriseInvitationMapper;
        this.jwtUtils = jwtUtils;
        this.passwordEncoder = passwordEncoder;
        this.redisService = redisService;
        
        if (redisService == null) {
            log.warn("RedisService is not available, using in-memory storage for tokens and captcha");
        }
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        // 查询用户
        User user = userMapper.findByUsername(request.getUsername());
        if (user == null) {
            user = userMapper.findByEmail(request.getUsername());
        }
        if (user == null) {
            user = userMapper.findByPhone(request.getUsername());
        }
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }

        // 验证密码
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException(ResultCode.PASSWORD_ERROR);
        }

        // 检查账号状态
        if (user.getStatus() == 0) {
            throw new BusinessException(ResultCode.ACCOUNT_DISABLED);
        }

        // 生成Token
        String accessToken = jwtUtils.generateAccessToken(
                user.getId(), 
                user.getUsername(), 
                user.getOrgId()
        );
        String refreshToken = jwtUtils.generateRefreshToken(
                user.getId(), 
                user.getUsername()
        );

        // 更新最后登录时间
        userMapper.updateLastLoginTime(user.getId());

        // 构建响应
        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(86400L)
                .userId(user.getId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .avatar(user.getAvatar())
                .orgId(user.getOrgId())
                .orgName(user.getOrgName())
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public RegisterResponse register(RegisterRequest request) {
        // 验证密码一致性
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException("两次输入的密码不一致");
        }

        // 检查用户名是否已存在
        User existingUser = userMapper.findByUsername(request.getUsername());
        if (existingUser != null) {
            throw new BusinessException("用户名已被使用");
        }

        // 检查手机号是否已存在
        User existingPhone = userMapper.findByPhone(request.getPhone());
        if (existingPhone != null) {
            throw new BusinessException("手机号已被使用");
        }

        // 检查邮箱是否已存在
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            User existingEmail = userMapper.findByEmail(request.getEmail());
            if (existingEmail != null) {
                throw new BusinessException("邮箱已被使用");
            }
        }

        // 验证行业是否存在
        Industry industry = industryMapper.selectById(request.getIndustryId());
        if (industry == null) {
            throw new BusinessException("所选行业不存在");
        }

        Enterprise enterprise;
        String enterpriseRole;
        boolean isNewEnterprise;

        // 检查是否有邀请码（加入已有企业）
        if (request.getInviteCode() != null && !request.getInviteCode().isEmpty()) {
            // 通过邀请码加入已有企业
            EnterpriseInvitation invitation = enterpriseInvitationMapper.findByInviteCode(request.getInviteCode());
            if (invitation == null) {
                throw new BusinessException("邀请码无效");
            }
            if (invitation.getExpiredAt().isBefore(LocalDateTime.now())) {
                throw new BusinessException("邀请码已过期");
            }
            if (invitation.getMaxUses() > 0 && invitation.getUsedCount() >= invitation.getMaxUses()) {
                throw new BusinessException("邀请码已达到使用上限");
            }

            enterprise = enterpriseMapper.selectById(invitation.getEnterpriseId());
            if (enterprise == null || enterprise.getDeleted() == 1) {
                throw new BusinessException("企业不存在");
            }

            // 检查企业成员数量限制
            if (enterprise.getMemberCount() >= enterprise.getMaxMembers()) {
                throw new BusinessException("企业成员数量已达上限");
            }

            enterpriseRole = invitation.getRole() != null ? invitation.getRole() : "member";
            isNewEnterprise = false;

            // 更新邀请码使用次数
            enterpriseInvitationMapper.incrementUsedCount(invitation.getId());
            if (invitation.getMaxUses() > 0 && invitation.getUsedCount() + 1 >= invitation.getMaxUses()) {
                enterpriseInvitationMapper.updateStatus(invitation.getId(), 2); // 已使用完
            }
        } else {
            // 创建新企业
            // 检查企业名称是否已存在
            Enterprise existingEnterprise = enterpriseMapper.findByName(request.getEnterpriseName());
            if (existingEnterprise != null) {
                throw new BusinessException("企业名称已被使用");
            }

            // 生成组织ID
            String orgId = "ORG" + IdUtil.getSnowflakeNextIdStr();

            enterprise = new Enterprise();
            enterprise.setOrgId(orgId);
            enterprise.setName(request.getEnterpriseName());
            enterprise.setIndustryId(request.getIndustryId());
            enterprise.setIndustryName(industry.getName());
            enterprise.setMemberCount(1);
            enterprise.setMaxMembers(100);
            enterprise.setStatus(1);
            enterprise.setVerified(0);
            enterprise.setCreatedAt(LocalDateTime.now());
            enterprise.setUpdatedAt(LocalDateTime.now());
            enterprise.setDeleted(0);

            enterpriseRole = "super_admin";
            isNewEnterprise = true;
        }

        // 创建用户
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPhone(request.getPhone());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setNickname(request.getUsername());
        user.setStatus(1);
        user.setOrgId(enterprise.getOrgId());
        user.setOrgName(enterprise.getName());

        userMapper.insert(user);

        // 如果是新企业，设置管理员用户ID并保存企业
        if (isNewEnterprise) {
            enterprise.setAdminUserId(user.getId());
            enterpriseMapper.insert(enterprise);
        } else {
            // 更新企业成员数量
            enterpriseMapper.updateMemberCount(enterprise.getId(), 1);
        }

        // 创建企业成员关系
        EnterpriseMember member = new EnterpriseMember();
        member.setEnterpriseId(enterprise.getId());
        member.setUserId(user.getId());
        member.setRole(enterpriseRole);
        member.setStatus(1);
        member.setJoinedAt(LocalDateTime.now());
        member.setCreatedAt(LocalDateTime.now());
        member.setUpdatedAt(LocalDateTime.now());
        member.setDeleted(0);

        enterpriseMemberMapper.insert(member);

        log.info("用户注册成功: username={}, enterprise={}, role={}", 
                user.getUsername(), enterprise.getName(), enterpriseRole);

        // 构建响应
        return RegisterResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .enterpriseId(enterprise.getId())
                .enterpriseName(enterprise.getName())
                .orgId(enterprise.getOrgId())
                .industryId(industry.getId())
                .industryName(industry.getName())
                .enterpriseRole(enterpriseRole)
                .isNewEnterprise(isNewEnterprise)
                .build();
    }

    @Override
    public void logout(String token) {
        // 将Token加入黑名单
        long expiration = jwtUtils.getExpirationFromToken(token).getTime() - System.currentTimeMillis();
        if (expiration > 0) {
            if (redisService != null) {
                redisService.setEx(TOKEN_BLACKLIST_PREFIX + token, "1", expiration / 1000);
            } else {
                // Fallback to in-memory storage
                tokenBlacklist.put(TOKEN_BLACKLIST_PREFIX + token, "1");
            }
        }
        log.info("用户登出成功");
    }

    @Override
    public LoginResponse refreshToken(String refreshToken) {
        // 验证刷新Token
        if (!jwtUtils.validateToken(refreshToken)) {
            throw new BusinessException(ResultCode.TOKEN_INVALID);
        }

        // 检查Token类型
        String tokenType = jwtUtils.getTokenType(refreshToken);
        if (!"refresh".equals(tokenType)) {
            throw new BusinessException(ResultCode.TOKEN_INVALID);
        }

        // 获取用户信息
        Long userId = jwtUtils.getUserIdFromToken(refreshToken);
        String username = jwtUtils.getUsernameFromToken(refreshToken);

        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }

        // 生成新Token
        String newAccessToken = jwtUtils.generateAccessToken(
                user.getId(), 
                user.getUsername(), 
                user.getOrgId()
        );
        String newRefreshToken = jwtUtils.generateRefreshToken(
                user.getId(), 
                user.getUsername()
        );

        return LoginResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(86400L)
                .userId(user.getId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .avatar(user.getAvatar())
                .orgId(user.getOrgId())
                .orgName(user.getOrgName())
                .build();
    }

    @Override
    public String generateCaptcha() {
        String captchaKey = IdUtil.fastSimpleUUID();
        String captchaCode = IdUtil.fastSimpleUUID().substring(0, 4).toUpperCase();
        
        if (redisService != null) {
            // 存储验证码，5分钟有效
            redisService.setEx(CAPTCHA_PREFIX + captchaKey, captchaCode, 300);
        } else {
            // Fallback to in-memory storage
            captchaStore.put(CAPTCHA_PREFIX + captchaKey, captchaCode);
        }
        
        // 返回验证码Key（实际应返回图片Base64）
        return captchaKey;
    }

    @Override
    public List<Industry> getIndustryList() {
        return industryMapper.findAllEnabled();
    }

    @Override
    public List<Industry> getTopLevelIndustries() {
        return industryMapper.findTopLevel();
    }

    @Override
    public List<Industry> getChildIndustries(Long parentId) {
        return industryMapper.findByParentId(parentId);
    }
    
    /**
     * Check if token is blacklisted
     */
    public boolean isTokenBlacklisted(String token) {
        if (redisService != null) {
            return redisService.hasKey(TOKEN_BLACKLIST_PREFIX + token);
        } else {
            return tokenBlacklist.containsKey(TOKEN_BLACKLIST_PREFIX + token);
        }
    }
    
    /**
     * Validate captcha
     */
    public boolean validateCaptcha(String captchaKey, String captchaCode) {
        String storedCode;
        if (redisService != null) {
            storedCode = redisService.get(CAPTCHA_PREFIX + captchaKey);
            if (storedCode != null) {
                redisService.delete(CAPTCHA_PREFIX + captchaKey);
            }
        } else {
            storedCode = captchaStore.remove(CAPTCHA_PREFIX + captchaKey);
        }
        return storedCode != null && storedCode.equalsIgnoreCase(captchaCode);
    }
}