/**
 * 认证授权相关API服务
 */

import { request } from '@umijs/max';
import type {
  ApiResponse,
  LoginParams,
  LoginResult,
  UserInfo,
  RefreshTokenParams,
  RefreshTokenResult,
  LogoutParams,
  ChangePasswordParams,
  OperationResult,
} from '@/types';

/**
 * 用户登录
 */
export async function login(params: LoginParams) {
  return request<ApiResponse<LoginResult>>('/auth/login', {
    method: 'POST',
    data: params,
  });
}

/**
 * 用户登出
 */
export async function logout(params?: LogoutParams) {
  return request<ApiResponse<OperationResult>>('/auth/logout', {
    method: 'POST',
    data: params,
  });
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser() {
  return request<ApiResponse<UserInfo>>('/auth/current-user', {
    method: 'GET',
  });
}

/**
 * 刷新Token
 */
export async function refreshToken(params: RefreshTokenParams) {
  return request<ApiResponse<RefreshTokenResult>>('/auth/refresh-token', {
    method: 'POST',
    data: params,
  });
}

/**
 * 修改密码
 */
export async function changePassword(params: ChangePasswordParams) {
  return request<ApiResponse<OperationResult>>('/auth/change-password', {
    method: 'POST',
    data: params,
  });
}

/**
 * 验证Token是否有效
 */
export async function validateToken() {
  return request<ApiResponse<{ valid: boolean }>>('/auth/validate-token', {
    method: 'GET',
  });
}