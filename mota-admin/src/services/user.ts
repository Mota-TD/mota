/**
 * 用户管理相关API服务
 */

import { request } from '@umijs/max';
import type {
  ApiResponse,
  PageParams,
  PageData,
  User,
  CreateUserParams,
  UpdateUserParams,
  Feedback,
  RespondFeedbackParams,
  UserStats,
  OperationResult,
} from '@/types';

/**
 * 获取用户列表（分页）
 */
export async function getUserList(params: PageParams & { tenantId?: string }) {
  return request<ApiResponse<PageData<User>>>('/users', {
    method: 'GET',
    params,
  });
}

/**
 * 获取用户详情
 */
export async function getUserDetail(id: string) {
  return request<ApiResponse<User>>(`/users/${id}`, {
    method: 'GET',
  });
}

/**
 * 创建用户
 */
export async function createUser(params: CreateUserParams) {
  return request<ApiResponse<User>>('/users', {
    method: 'POST',
    data: params,
  });
}

/**
 * 更新用户
 */
export async function updateUser(params: UpdateUserParams) {
  const { id, ...data } = params;
  return request<ApiResponse<User>>(`/users/${id}`, {
    method: 'PUT',
    data,
  });
}

/**
 * 删除用户
 */
export async function deleteUser(id: string) {
  return request<ApiResponse<OperationResult>>(`/users/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 启用/禁用用户
 */
export async function toggleUserStatus(id: string, status: 'active' | 'inactive') {
  return request<ApiResponse<OperationResult>>(`/users/${id}/status`, {
    method: 'PATCH',
    data: { status },
  });
}

/**
 * 重置用户密码
 */
export async function resetUserPassword(id: string, newPassword: string) {
  return request<ApiResponse<OperationResult>>(`/users/${id}/reset-password`, {
    method: 'POST',
    data: { newPassword },
  });
}

/**
 * 获取用户反馈列表
 */
export async function getFeedbackList(params: PageParams & { userId?: string; status?: string }) {
  return request<ApiResponse<PageData<Feedback>>>('/feedbacks', {
    method: 'GET',
    params,
  });
}

/**
 * 获取反馈详情
 */
export async function getFeedbackDetail(id: string) {
  return request<ApiResponse<Feedback>>(`/feedbacks/${id}`, {
    method: 'GET',
  });
}

/**
 * 回复反馈
 */
export async function respondFeedback(params: RespondFeedbackParams) {
  const { id, ...data } = params;
  return request<ApiResponse<Feedback>>(`/feedbacks/${id}/respond`, {
    method: 'POST',
    data,
  });
}

/**
 * 获取用户统计信息
 */
export async function getUserStats() {
  return request<ApiResponse<UserStats>>('/users/stats', {
    method: 'GET',
  });
}