/**
 * 认证授权相关类型定义
 *
 * 包含登录、登出、Token刷新等认证相关的接口定义。
 *
 * @author Mota
 * @since 1.0.0
 */

import type { RoleEnum } from './common';

/**
 * 登录请求参数
 *
 * @example
 * ```ts
 * const params: LoginParams = {
 *   username: 'admin',
 *   password: '123456',
 *   rememberMe: true
 * };
 * ```
 */
export interface LoginParams {
  /** 用户名/邮箱/手机号 */
  username: string;
  /** 登录密码 */
  password: string;
  /** 验证码（可选） */
  captcha?: string;
  /** 验证码标识（可选） */
  captchaKey?: string;
  /** 是否记住登录状态，默认false */
  rememberMe?: boolean;
}

/**
 * 登录响应数据
 *
 * 登录成功后返回的令牌信息和用户基本信息。
 */
export interface LoginResult {
  /** JWT访问令牌 */
  accessToken: string;
  /** 刷新令牌 */
  refreshToken: string;
  /** 令牌过期时间（秒） */
  expiresIn: string | number;
  /** 令牌类型，固定为Bearer */
  tokenType: string;
  /** 用户ID */
  userId: string;
  /** 用户名 */
  username: string;
  /** 用户昵称 */
  nickname: string;
  /** 用户头像URL（可选） */
  avatar?: string;
  /** 所属组织ID */
  orgId: string;
  /** 所属组织名称 */
  orgName: string;
}

/**
 * 当前登录用户信息
 *
 * 包含用户的详细信息和权限。
 */
export interface UserInfo {
  /** 用户唯一标识 */
  id: string;
  /** 登录用户名 */
  username: string;
  /** 用户姓名 */
  name: string;
  /** 电子邮箱 */
  email: string;
  /** 手机号码（可选） */
  phone?: string;
  /** 头像URL（可选） */
  avatar?: string;
  /** 用户角色 */
  role: RoleEnum;
  /** 租户ID（可选） */
  tenantId?: string;
  /** 租户名称（可选） */
  tenantName?: string;
  /** 账户状态：active-正常, inactive-未激活, locked-已锁定 */
  status: 'active' | 'inactive' | 'locked';
  /** 最后登录时间（可选） */
  lastLoginTime?: string;
  /** 账户创建时间 */
  createdAt: string;
  /** 用户权限列表（可选） */
  permissions?: string[];
}

/**
 * Token刷新请求参数
 */
export interface RefreshTokenParams {
  /** 刷新令牌 */
  refreshToken: string;
}

/**
 * Token刷新响应数据
 */
export interface RefreshTokenResult {
  /** 新的访问令牌 */
  token: string;
  /** 新的刷新令牌 */
  refreshToken: string;
  /** 新令牌的过期时间（秒） */
  expiresIn: number;
}

/**
 * 修改密码请求参数
 */
export interface ChangePasswordParams {
  /** 原密码 */
  oldPassword: string;
  /** 新密码 */
  newPassword: string;
  /** 确认新密码 */
  confirmPassword: string;
}

/**
 * 登出请求参数
 */
export interface LogoutParams {
  /** 要失效的令牌（可选，默认使用当前令牌） */
  token?: string;
}
