/**
 * 用户管理相关类型定义
 */

import { StatusEnum, RoleEnum } from './common';

/**
 * 用户基础信息
 */
export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  tenantId?: string;
  tenantName?: string;
  role: RoleEnum;
  status: StatusEnum;
  lastLoginTime?: string;
  loginCount: number;
  aiUsageCount: number;
  createdAt: string;
  updatedAt: string;
  remark?: string;
}

/**
 * 用户创建请求
 */
export interface CreateUserParams {
  username: string;
  password: string;
  name: string;
  email: string;
  phone?: string;
  tenantId?: string;
  role: RoleEnum;
  remark?: string;
}

/**
 * 用户更新请求
 */
export interface UpdateUserParams extends Partial<Omit<CreateUserParams, 'password'>> {
  id: string;
  status?: StatusEnum;
  avatar?: string;
}

/**
 * 用户反馈
 */
export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  tenantId?: string;
  tenantName?: string;
  type: 'bug' | 'feature' | 'improvement' | 'other';
  title: string;
  content: string;
  status: 'pending' | 'processing' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attachments?: string[];
  response?: string;
  respondedBy?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 反馈回复请求
 */
export interface RespondFeedbackParams {
  id: string;
  response: string;
  status: 'processing' | 'resolved' | 'closed';
}

/**
 * 用户统计信息
 */
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisMonth: number;
  totalAiUsage: number;
}