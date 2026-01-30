/**
 * HTTP 请求相关类型定义
 */

// API 响应结果类型
export interface ApiResult<T = any> {
  code: number
  message: string
  data: T
  timestamp?: number
}

// 请求配置类型
export interface RequestConfig extends UniApp.RequestOptions {
  showLoading?: boolean
  showError?: boolean
  loadingText?: string
}

// 请求错误类型
export class RequestError extends Error {
  code: number
  data?: any

  constructor(code: number, message: string, data?: any) {
    super(message)
    this.name = 'RequestError'
    this.code = code
    this.data = data
  }
}