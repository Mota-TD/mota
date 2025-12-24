/**
 * HTTP 请求封装
 * 基于 fetch API，支持拦截器、错误处理等
 */

import { message } from 'antd'
import { useAuthStore } from '@/store/auth'

// API 基础配置 - 使用 ?? 运算符，只有 undefined/null 时才使用默认值
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

// 错误消息映射
const ERROR_MESSAGES: Record<number, string> = {
  400: '请求参数错误',
  401: '登录已过期，请重新登录',
  403: '没有权限访问该资源',
  404: '请求的资源不存在',
  405: '请求方法不支持',
  408: '请求超时',
  500: '服务器错误，请稍后重试',
  502: '网关错误',
  503: '服务暂时不可用',
  504: '网关超时',
}

// 是否正在显示401错误（防止重复提示）
let isShowingAuthError = false

// 响应结果类型
export interface ApiResult<T = unknown> {
  code: number
  message: string
  data: T
  timestamp: number
}

// 请求配置
interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
  timeout?: number
}

// 错误类型
export class ApiError extends Error {
  code: number
  data?: unknown

  constructor(code: number, message: string, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.data = data
  }
}

/**
 * 构建 URL 参数
 */
function buildUrl(url: string, params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return url
  
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value))
    }
  })
  
  const queryString = searchParams.toString()
  return queryString ? `${url}?${queryString}` : url
}

/**
 * 发送请求
 */
async function request<T>(url: string, config: RequestConfig = {}): Promise<T> {
  const { params, timeout = 30000, ...fetchConfig } = config
  
  // 构建完整 URL
  const fullUrl = buildUrl(`${API_BASE_URL}${url}`, params)
  
  // 获取 token
  const token = useAuthStore.getState().token
  
  // 默认请求头
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchConfig.headers,
  }
  
  // 添加认证头
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }
  
  // 创建 AbortController 用于超时控制
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(fullUrl, {
      ...fetchConfig,
      headers,
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    
    // 检查 HTTP 状态码
    if (!response.ok) {
      // 尝试解析错误响应
      let errorMessage = ERROR_MESSAGES[response.status] || `HTTP ${response.status}: ${response.statusText}`
      let errorData: unknown
      
      try {
        errorData = await response.json()
        if (errorData && typeof errorData === 'object' && 'message' in errorData) {
          errorMessage = (errorData as { message: string }).message || errorMessage
        }
      } catch {
        // 响应不是 JSON，使用默认错误消息
      }
      
      // 处理不同的 HTTP 状态码
      switch (response.status) {
        case 401:
          // 未授权，清除登录状态并跳转登录页
          if (!isShowingAuthError) {
            isShowingAuthError = true
            message.error('登录已过期，请重新登录')
            useAuthStore.getState().logout()
            setTimeout(() => {
              window.location.href = '/login'
              isShowingAuthError = false
            }, 1500)
          }
          break
        case 403:
          message.error('没有权限访问该资源')
          break
        case 404:
          message.error('请求的资源不存在')
          break
        case 500:
          message.error(errorMessage || '服务器错误，请稍后重试')
          break
        default:
          message.error(errorMessage || '请求失败')
      }
      
      throw new ApiError(response.status, errorMessage, errorData)
    }
    
    // 检查响应内容类型
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const errorMsg = '服务器返回了非 JSON 响应'
      message.error(errorMsg)
      throw new ApiError(-1, errorMsg)
    }
    
    // 解析响应
    const result: ApiResult<T> = await response.json()
    
    // 检查业务状态码
    if (result.code === 200) {
      return result.data
    }
    
    // 处理业务错误码
    switch (result.code) {
      case 401:
        // 未授权，清除登录状态
        if (!isShowingAuthError) {
          isShowingAuthError = true
          message.error('登录已过期，请重新登录')
          useAuthStore.getState().logout()
          setTimeout(() => {
            window.location.href = '/login'
            isShowingAuthError = false
          }, 1500)
        }
        break
      case 403:
        message.error(result.message || '没有权限执行此操作')
        break
      default:
        // 其他业务错误，显示服务器返回的消息
        message.error(result.message || '操作失败')
    }
    
    throw new ApiError(result.code, result.message, result.data)
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error instanceof ApiError) {
      throw error
    }
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        const errorMsg = '请求超时，请检查网络连接'
        message.error(errorMsg)
        throw new ApiError(-1, errorMsg)
      }
      
      // 网络错误
      console.error('Request error:', error)
      const errorMsg = '网络错误，请检查网络连接'
      message.error(errorMsg)
      throw new ApiError(-1, errorMsg)
    }
    
    const errorMsg = '未知错误'
    message.error(errorMsg)
    throw new ApiError(-1, errorMsg)
  }
}

/**
 * GET 请求
 */
export function get<T>(url: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  return request<T>(url, { method: 'GET', params })
}

/**
 * POST 请求
 */
export function post<T>(url: string, data?: unknown): Promise<T> {
  return request<T>(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * PUT 请求
 */
export function put<T>(url: string, data?: unknown): Promise<T> {
  return request<T>(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * DELETE 请求
 */
export function del<T>(url: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  return request<T>(url, { method: 'DELETE', params })
}

/**
 * PATCH 请求
 */
export function patch<T>(url: string, data?: unknown): Promise<T> {
  return request<T>(url, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  })
}

export default {
  get,
  post,
  put,
  del,
  patch,
}