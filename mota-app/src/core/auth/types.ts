/**
 * 认证模块类型定义
 */

// 用户信息
export interface User {
  id: string
  username: string
  nickname: string
  email?: string
  phone?: string
  avatar?: string
  departmentId?: string
  departmentName?: string
  roles: string[]
  permissions: string[]
  createdAt?: string
}

// 登录请求
export interface LoginRequest {
  username: string
  password: string
  captcha?: string
  captchaKey?: string
}

// 登录响应
export interface LoginResponse {
  token: string
  refreshToken: string
  user: User
  expiresIn: number
}

// 注册请求
export interface RegisterRequest {
  username: string
  password: string
  nickname: string
  email?: string
  phone?: string
  captcha: string
  captchaKey: string
}

// 刷新Token请求
export interface RefreshTokenRequest {
  refreshToken: string
}

// 修改密码请求
export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

// 重置密码请求
export interface ResetPasswordRequest {
  phone: string
  code: string
  newPassword: string
}

// 验证码响应
export interface CaptchaResponse {
  key: string
  image: string
}

// 认证状态
export enum AuthState {
  LOGGED_IN = 'logged_in',
  LOGGED_OUT = 'logged_out',
  TOKEN_EXPIRED = 'token_expired'
}