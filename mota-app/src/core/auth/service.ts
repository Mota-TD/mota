/**
 * 认证服务实现
 */

import { get, post } from '../http/request'
import type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RefreshTokenRequest,
  ChangePasswordRequest,
  ResetPasswordRequest,
  CaptchaResponse
} from './types'

class AuthService {
  private baseUrl = '/api/auth'
  private tokenKey = 'token'
  private refreshTokenKey = 'refreshToken'
  private userKey = 'user'

  /**
   * 登录
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await post<LoginResponse>(`${this.baseUrl}/login`, data)
    
    // 保存token和用户信息
    this.setToken(response.token)
    this.setRefreshToken(response.refreshToken)
    this.setUser(response.user)
    
    return response
  }

  /**
   * 注册
   */
  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await post<LoginResponse>(`${this.baseUrl}/register`, data)
    
    // 保存token和用户信息
    this.setToken(response.token)
    this.setRefreshToken(response.refreshToken)
    this.setUser(response.user)
    
    return response
  }

  /**
   * 登出
   */
  async logout(): Promise<void> {
    try {
      await post(`${this.baseUrl}/logout`)
    } finally {
      // 清除本地存储
      this.clearAuth()
    }
  }

  /**
   * 刷新Token
   */
  async refreshToken(): Promise<LoginResponse> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('未找到刷新令牌')
    }

    const response = await post<LoginResponse>(`${this.baseUrl}/refresh`, {
      refreshToken
    } as RefreshTokenRequest)
    
    // 更新token
    this.setToken(response.token)
    this.setRefreshToken(response.refreshToken)
    
    return response
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<User> {
    const user = await get<User>(`${this.baseUrl}/current`)
    this.setUser(user)
    return user
  }

  /**
   * 修改密码
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await post(`${this.baseUrl}/password/change`, data)
  }

  /**
   * 重置密码
   */
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await post(`${this.baseUrl}/password/reset`, data)
  }

  /**
   * 发送验证码
   */
  async sendVerifyCode(phone: string): Promise<void> {
    await post(`${this.baseUrl}/verify-code/send`, { phone })
  }

  /**
   * 获取图形验证码
   */
  async getCaptcha(): Promise<CaptchaResponse> {
    return get<CaptchaResponse>(`${this.baseUrl}/captcha`)
  }

  /**
   * 检查Token是否有效
   */
  async checkToken(): Promise<boolean> {
    try {
      await get(`${this.baseUrl}/check`)
      return true
    } catch {
      return false
    }
  }

  /**
   * 保存Token
   */
  setToken(token: string): void {
    uni.setStorageSync(this.tokenKey, token)
  }

  /**
   * 获取Token
   */
  getToken(): string | null {
    return uni.getStorageSync(this.tokenKey) || null
  }

  /**
   * 保存RefreshToken
   */
  setRefreshToken(token: string): void {
    uni.setStorageSync(this.refreshTokenKey, token)
  }

  /**
   * 获取RefreshToken
   */
  getRefreshToken(): string | null {
    return uni.getStorageSync(this.refreshTokenKey) || null
  }

  /**
   * 保存用户信息
   */
  setUser(user: User): void {
    uni.setStorageSync(this.userKey, JSON.stringify(user))
  }

  /**
   * 获取用户信息
   */
  getUser(): User | null {
    const userStr = uni.getStorageSync(this.userKey)
    if (!userStr) return null
    
    try {
      return JSON.parse(userStr) as User
    } catch {
      return null
    }
  }

  /**
   * 清除认证信息
   */
  clearAuth(): void {
    uni.removeStorageSync(this.tokenKey)
    uni.removeStorageSync(this.refreshTokenKey)
    uni.removeStorageSync(this.userKey)
  }

  /**
   * 检查是否已登录
   */
  isLoggedIn(): boolean {
    return !!this.getToken()
  }

  /**
   * 检查权限
   */
  hasPermission(permission: string): boolean {
    const user = this.getUser()
    if (!user) return false
    return user.permissions.includes(permission)
  }

  /**
   * 检查角色
   */
  hasRole(role: string): boolean {
    const user = this.getUser()
    if (!user) return false
    return user.roles.includes(role)
  }
}

export const authService = new AuthService()
export default authService