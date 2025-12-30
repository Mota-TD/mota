/**
 * 认证相关 API
 */

import { post, get } from '../request'

// 登录请求参数
export interface LoginRequest {
  username: string
  password: string
  captcha?: string
  captchaKey?: string
  rememberMe?: boolean
}

// 登录响应
// 注意：userId 使用 string 类型，因为后端返回的 Long 类型会被序列化为字符串以避免 JavaScript 精度问题
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  userId: string | number
  username: string
  nickname: string
  avatar: string
  orgId: string
  orgName: string
}

// 注册请求参数
export interface RegisterRequest {
  username: string
  phone: string
  email?: string
  password: string
  confirmPassword: string
  enterpriseName: string
  industryId: number
  captcha?: string
  captchaKey?: string
  inviteCode?: string
}

// 注册响应
// 注意：userId 和 enterpriseId 使用 string 类型，因为后端返回的 Long 类型会被序列化为字符串以避免 JavaScript 精度问题
export interface RegisterResponse {
  userId: string | number
  username: string
  email?: string
  enterpriseId: string | number
  enterpriseName: string
  orgId: string
  industryId: number
  industryName: string
  enterpriseRole: string
  isNewEnterprise: boolean
}

// 行业信息
export interface Industry {
  id: number
  code: string
  name: string
  parentId?: number
  level: number
  sortOrder: number
  icon?: string
  description?: string
  status: number
}

// 邀请验证结果
export interface InvitationValidateResult {
  valid: boolean
  errorMessage?: string
  enterpriseId?: number
  enterpriseName?: string
  enterpriseLogo?: string
  industryName?: string
  role?: string
  roleName?: string
  departmentName?: string
  invitedByName?: string
  expiredAt?: string
}

// 用户信息
// 注意：id 和 enterpriseId 使用 string 类型，因为后端返回的 Long 类型会被序列化为字符串以避免 JavaScript 精度问题
export interface UserInfo {
  id: string | number
  username: string
  email: string
  phone?: string
  nickname: string
  avatar?: string
  status: number
  orgId?: string
  orgName?: string
  enterpriseId?: string | number
  enterpriseRole?: string
  lastLoginAt?: string
  createdAt?: string
}

/**
 * 用户登录
 */
export function login(data: LoginRequest): Promise<LoginResponse> {
  return post<LoginResponse>('/api/v1/auth/login', data)
}

/**
 * 用户登出
 */
export function logout(): Promise<void> {
  return post<void>('/api/v1/auth/logout')
}

/**
 * 刷新 Token
 */
export function refreshToken(token: string): Promise<LoginResponse> {
  return post<LoginResponse>(`/api/v1/auth/refresh?refreshToken=${encodeURIComponent(token)}`, null)
}

/**
 * 获取验证码
 */
export function getCaptcha(): Promise<string> {
  return get<string>('/api/v1/auth/captcha')
}

/**
 * 用户注册
 */
export function register(data: RegisterRequest): Promise<RegisterResponse> {
  return post<RegisterResponse>('/api/v1/auth/register', data)
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser(): Promise<UserInfo> {
  return get<UserInfo>('/api/v1/user/me')
}

/**
 * 获取所有行业列表
 */
export function getIndustries(): Promise<Industry[]> {
  return get<Industry[]>('/api/v1/auth/industries')
}

/**
 * 获取一级行业列表
 */
export function getTopLevelIndustries(): Promise<Industry[]> {
  return get<Industry[]>('/api/v1/auth/industries/top')
}

/**
 * 获取子行业列表
 */
export function getChildIndustries(parentId: number): Promise<Industry[]> {
  return get<Industry[]>(`/api/v1/auth/industries/${parentId}/children`)
}

/**
 * 验证邀请码
 */
export function validateInvitation(inviteCode: string): Promise<InvitationValidateResult> {
  return get<InvitationValidateResult>(`/api/v1/enterprise/invitations/validate?inviteCode=${encodeURIComponent(inviteCode)}`)
}