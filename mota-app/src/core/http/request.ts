/**
 * HTTP 请求封装
 * 基于 uni.request，支持拦截器、错误处理等
 */

import type { RequestConfig, ApiResult, RequestError } from './types'

// API 基础 URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// 错误消息映射
const ERROR_MESSAGES: Record<number, string> = {
  400: '请求参数错误',
  401: '登录已过期，请重新登录',
  403: '没有权限访问该资源',
  404: '请求的资源不存在',
  500: '服务器错误，请稍后重试',
  502: '网关错误',
  503: '服务暂时不可用',
  504: '网关超时'
}

/**
 * 发送 HTTP 请求
 */
export async function request<T = any>(config: RequestConfig): Promise<T> {
  const {
    showLoading = false,
    showError = true,
    loadingText = '加载中...',
    ...options
  } = config

  // 显示加载提示
  if (showLoading) {
    uni.showLoading({
      title: loadingText,
      mask: true
    })
  }

  try {
    // 获取 token
    const token = uni.getStorageSync('token')

    // 构建完整 URL
    const url = options.url?.startsWith('http')
      ? options.url
      : `${BASE_URL}${options.url}`

    // 发送请求
    const [error, response] = await uni.request({
      ...options,
      url,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      timeout: options.timeout || 30000
    })

    // 隐藏加载提示
    if (showLoading) {
      uni.hideLoading()
    }

    // 处理网络错误
    if (error) {
      const errorMsg = '网络错误，请检查网络连接'
      if (showError) {
        uni.showToast({
          title: errorMsg,
          icon: 'none'
        })
      }
      throw new Error(errorMsg)
    }

    // 检查 HTTP 状态码
    if (response.statusCode !== 200) {
      const errorMsg = ERROR_MESSAGES[response.statusCode] || `HTTP ${response.statusCode}`
      
      // 401 未授权，跳转登录页
      if (response.statusCode === 401) {
        uni.removeStorageSync('token')
        uni.removeStorageSync('user')
        uni.reLaunch({
          url: '/pages/login/index'
        })
      }

      if (showError) {
        uni.showToast({
          title: errorMsg,
          icon: 'none'
        })
      }
      throw new Error(errorMsg)
    }

    const data = response.data as any

    // 兼容两种响应格式：
    // 1. Result 格式：{ code: 200, message: "操作成功", data: [...] }
    // 2. 直接数据格式：[...] 或 {...}
    if (Array.isArray(data) || data?.code === undefined) {
      return data as T
    }

    // 标准 Result 格式处理
    const result = data as ApiResult<T>

    if (result.code === 200) {
      return result.data
    }

    // 处理业务错误码
    const errorMsg = result.message || '操作失败'
    
    if (result.code === 401) {
      uni.removeStorageSync('token')
      uni.removeStorageSync('user')
      uni.reLaunch({
        url: '/pages/login/index'
      })
    }

    if (showError) {
      uni.showToast({
        title: errorMsg,
        icon: 'none'
      })
    }

    throw new Error(errorMsg)
  } catch (error) {
    // 隐藏加载提示
    if (showLoading) {
      uni.hideLoading()
    }

    throw error
  }
}

/**
 * GET 请求
 */
export function get<T = any>(
  url: string,
  params?: Record<string, any>,
  config?: Omit<RequestConfig, 'url' | 'method' | 'data'>
): Promise<T> {
  return request<T>({
    url,
    method: 'GET',
    data: params,
    ...config
  })
}

/**
 * POST 请求
 */
export function post<T = any>(
  url: string,
  data?: Record<string, any>,
  config?: Omit<RequestConfig, 'url' | 'method' | 'data'>
): Promise<T> {
  return request<T>({
    url,
    method: 'POST',
    data,
    ...config
  })
}

/**
 * PUT 请求
 */
export function put<T = any>(
  url: string,
  data?: Record<string, any>,
  config?: Omit<RequestConfig, 'url' | 'method' | 'data'>
): Promise<T> {
  return request<T>({
    url,
    method: 'PUT',
    data,
    ...config
  })
}

/**
 * DELETE 请求
 */
export function del<T = any>(
  url: string,
  params?: Record<string, any>,
  config?: Omit<RequestConfig, 'url' | 'method' | 'data'>
): Promise<T> {
  return request<T>({
    url,
    method: 'DELETE',
    data: params,
    ...config
  })
}

export default {
  request,
  get,
  post,
  put,
  del
}