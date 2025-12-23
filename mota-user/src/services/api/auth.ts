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
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  userId: number
  username: string
  nickname: string
  avatar: string
  orgId: string
  orgName: string
}

// 注册请求参数
export interface RegisterRequest {
  username: string
  email: string
  password: string
  confirmPassword: string
  captcha?: string
  captchaKey?: string
}

// 用户信息
export interface UserInfo {
  id: number
  username: string
  email: string
  phone?: string
  nickname: string
  avatar?: string
  status: number
  orgId?: string
  orgName?: string
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
export function register(data: RegisterRequest): Promise<UserInfo> {
  return post<UserInfo>('/api/v1/auth/register', data)
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser(): Promise<UserInfo> {
  return get<UserInfo>('/api/v1/user/me')
}