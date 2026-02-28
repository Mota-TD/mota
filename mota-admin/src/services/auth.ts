/**
 * 认证授权相关API服务
 *
 * 提供用户认证相关的API调用封装，包括：
 * - 登录/登出
 * - 获取当前用户信息
 * - Token刷新
 * - 密码修改
 * - Token验证
 *
 * @author Mota
 * @since 1.0.0
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
 *
 * 使用用户名和密码进行登录认证，成功后返回访问令牌和刷新令牌。
 *
 * @param params 登录参数，包含用户名、密码等
 * @returns 登录响应，包含令牌信息和用户基本信息
 *
 * @example
 * ```ts
 * const result = await login({ username: 'admin', password: '123456' });
 * if (result.code === 200) {
 *   localStorage.setItem('token', result.data.accessToken);
 * }
 * ```
 */
export async function login(params: LoginParams) {
  return request<ApiResponse<LoginResult>>('/auth/login', {
    method: 'POST',
    data: params,
    // 登录接口跳过全局错误处理，由登录页面自行处理错误提示
    skipErrorHandler: true,
  });
}

/**
 * 用户登出
 *
 * 使当前用户的访问令牌失效，用户需要重新登录。
 *
 * @param params 登出参数（可选）
 * @returns 操作结果
 */
export async function logout(params?: LogoutParams) {
  return request<ApiResponse<OperationResult>>('/auth/logout', {
    method: 'POST',
    data: params,
  });
}

/**
 * 获取当前登录用户信息
 *
 * 获取当前已认证用户的详细信息，包括权限列表。
 * 注意：调用的是 user-service 的 /users/me 接口
 *
 * @returns 当前用户信息
 */
export async function getCurrentUser() {
  return request<ApiResponse<UserInfo>>('/users/me', {
    method: 'GET',
  });
}

/**
 * 刷新访问令牌
 *
 * 当访问令牌过期时，使用刷新令牌获取新的访问令牌。
 * 如果刷新令牌也已过期，需要重新登录。
 *
 * @param params 刷新令牌参数
 * @returns 新的令牌信息
 */
export async function refreshToken(params: RefreshTokenParams) {
  return request<ApiResponse<RefreshTokenResult>>('/auth/refresh-token', {
    method: 'POST',
    data: params,
  });
}

/**
 * 修改密码
 *
 * 修改当前登录用户的密码，需要验证原密码。
 *
 * @param params 修改密码参数，包含原密码和新密码
 * @returns 操作结果
 */
export async function changePassword(params: ChangePasswordParams) {
  return request<ApiResponse<OperationResult>>('/auth/change-password', {
    method: 'POST',
    data: params,
  });
}

/**
 * 验证Token是否有效
 *
 * 检查当前访问令牌是否仍然有效，用于前端判断是否需要重新登录。
 *
 * @returns 验证结果，valid为true表示令牌有效
 */
export async function validateToken() {
  return request<ApiResponse<{ valid: boolean }>>('/auth/validate-token', {
    method: 'GET',
  });
}