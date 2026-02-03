/**
 * 认证授权相关类型定义
 */

import type { RoleEnum } from './common';

/**
 * 登录请求参数
 */
export interface LoginParams {
  username: string;
  password: string;
  captcha?: string;
  captchaKey?: string;
  rememberMe?: boolean;
}

/**
 * 登录响应数据
 */
export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: string | number;
  tokenType: string;
  userId: string;
  username: string;
  nickname: string;
  avatar?: string;
  orgId: string;
  orgName: string;
}

/**
 * 用户信息
 */
export interface UserInfo {
  id: string;
  username: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: RoleEnum;
  tenantId?: string;
  tenantName?: string;
  status: 'active' | 'inactive' | 'locked';
  lastLoginTime?: string;
  createdAt: string;
  permissions?: string[];
}

/**
 * Token刷新请求
 */
export interface RefreshTokenParams {
  refreshToken: string;
}

/**
 * Token刷新响应
 */
export interface RefreshTokenResult {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * 修改密码请求
 */
export interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * 登出请求
 */
export interface LogoutParams {
  token?: string;
}
