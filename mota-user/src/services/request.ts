/**
 * HTTP 请求封装
 * 基于 fetch API，支持拦截器、错误处理等
 */

import { useAuthStore } from '@/store/auth'

// API 基础配置 - 使用 ?? 运算符，只有 undefined/null 时才使用默认值
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

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
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      try {
        const errorData = await response.json()
        if (errorData.message) {
          errorMessage = errorData.message
        }
      } catch {
        // 响应不是 JSON，使用默认错误消息
      }
      
      if (response.status === 401) {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
      
      throw new ApiError(response.status, errorMessage)
    }
    
    // 检查响应内容类型
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      throw new ApiError(-1, '服务器返回了非 JSON 响应')
    }
    
    // 解析响应
    const result: ApiResult<T> = await response.json()
    
    // 检查业务状态码
    if (result.code === 200) {
      return result.data
    }
    
    // 处理特定错误码
    if (result.code === 401) {
      // 未授权，清除登录状态
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    
    throw new ApiError(result.code, result.message, result.data)
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error instanceof ApiError) {
      throw error
    }
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError(-1, '请求超时')
      }
      // 更详细的错误信息
      console.error('Request error:', error)
      throw new ApiError(-1, error.message || '网络错误，请检查后端服务是否启动')
    }
    
    throw new ApiError(-1, '未知错误')
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