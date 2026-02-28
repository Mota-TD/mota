package com.mota.auth.service;

import com.mota.api.auth.dto.LoginRequest;
import com.mota.api.auth.dto.LoginResponse;
import com.mota.api.auth.dto.RegisterRequest;
import com.mota.api.auth.dto.RegisterResponse;
import com.mota.auth.entity.Industry;

import java.util.List;

/**
 * 认证服务接口
 * <p>
 * 提供用户认证相关的核心业务操作，包括：
 * <ul>
 *     <li>用户登录/登出</li>
 *     <li>用户注册</li>
 *     <li>Token刷新</li>
 *     <li>验证码生成</li>
 *     <li>行业信息查询</li>
 * </ul>
 * </p>
 *
 * @author Mota
 * @since 1.0.0
 * @see com.mota.auth.service.impl.AuthServiceImpl
 */
public interface AuthService {

    /**
     * 用户登录
     * <p>
     * 验证用户凭证，成功后返回访问令牌和刷新令牌。
     * </p>
     *
     * @param request 登录请求，包含用户名和密码
     * @return 登录响应，包含访问令牌、刷新令牌和用户信息
     * @throws com.mota.common.core.exception.BusinessException 用户名或密码错误时抛出
     */
    LoginResponse login(LoginRequest request);

    /**
     * 用户注册
     * <p>
     * 创建新用户账户，密码将进行加密存储。
     * </p>
     *
     * @param request 注册请求，包含用户名、密码、手机号等信息
     * @return 注册响应，包含新用户ID
     * @throws com.mota.common.core.exception.BusinessException 用户名已存在时抛出
     */
    RegisterResponse register(RegisterRequest request);

    /**
     * 用户登出
     * <p>
     * 使指定的访问令牌失效，用户需要重新登录。
     * </p>
     *
     * @param token 要失效的访问令牌
     */
    void logout(String token);

    /**
     * 刷新Token
     * <p>
     * 使用刷新令牌获取新的访问令牌，刷新令牌本身不会改变。
     * </p>
     *
     * @param refreshToken 刷新令牌
     * @return 新的登录响应，包含新的访问令牌
     * @throws com.mota.common.core.exception.BusinessException 刷新令牌无效或已过期时抛出
     */
    LoginResponse refreshToken(String refreshToken);

    /**
     * 生成验证码
     * <p>
     * 生成图形验证码并返回Base64编码的图片。
     * 验证码有效期为5分钟。
     * </p>
     *
     * @return Base64编码的验证码图片
     */
    String generateCaptcha();

    /**
     * 获取所有行业列表
     * <p>
     * 返回系统中所有行业信息，包括一级和二级行业。
     * </p>
     *
     * @return 行业列表
     */
    List<Industry> getIndustryList();

    /**
     * 获取一级行业列表
     * <p>
     * 仅返回顶级行业分类。
     * </p>
     *
     * @return 一级行业列表
     */
    List<Industry> getTopLevelIndustries();

    /**
     * 获取子行业列表
     * <p>
     * 根据父行业ID获取其下属的子行业。
     * </p>
     *
     * @param parentId 父行业ID
     * @return 子行业列表，如果没有子行业返回空列表
     */
    List<Industry> getChildIndustries(Long parentId);
}