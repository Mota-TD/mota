/**
 * 共享类型定义
 */

// ==================== 通用响应 ====================

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// ==================== 通用请求 ====================

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface SearchParams {
  keyword?: string
}

// ==================== 用户相关 ====================

export interface User {
  id: string
  username: string
  nickname?: string
  email?: string
  phone?: string
  avatar?: string
  departmentId?: string
  departmentName?: string
  role?: string
  status?: 'active' | 'inactive' | 'disabled'
  createdAt?: string
  updatedAt?: string
}

export interface UserBasic {
  id: string
  name: string
  avatar?: string
}

// ==================== 部门相关 ====================

export interface Department {
  id: string
  name: string
  parentId?: string
  managerId?: string
  managerName?: string
  memberCount?: number
  description?: string
  sortOrder?: number
  createdAt?: string
  updatedAt?: string
}

// ==================== 组织相关 ====================

export interface Organization {
  id: string
  name: string
  logo?: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

// ==================== 活动记录 ====================

export interface Activity {
  id: string
  userId: string
  userName?: string
  userAvatar?: string
  action: string
  target: string
  targetId?: string
  targetType?: string
  description?: string
  time: string
  createdAt?: string
}

// ==================== 通知相关 ====================

export interface Notification {
  id: string
  userId: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  content: string
  read: boolean
  link?: string
  createdAt: string
}

// ==================== 视图配置 ====================

export interface ViewConfig {
  id?: string
  name: string
  viewType: string
  config: ViewConfigData
  isDefault?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ViewConfigData {
  filters?: Record<string, unknown>
  sort?: {
    field: string
    order: 'asc' | 'desc'
  }
  columns?: string[]
  viewMode?: string
}

// ==================== 文件相关 ====================

export interface FileInfo {
  id: string
  name: string
  url: string
  size: number
  type: string
  uploadedBy?: string
  createdAt?: string
}

// ==================== 选项类型 ====================

export interface SelectOption<T = string> {
  label: string
  value: T
  disabled?: boolean
  children?: SelectOption<T>[]
}

// ==================== 表格列配置 ====================

export interface TableColumn<T = unknown> {
  key: string
  title: string
  dataIndex?: string
  width?: number | string
  fixed?: 'left' | 'right'
  sortable?: boolean
  filterable?: boolean
  render?: (value: unknown, record: T, index: number) => React.ReactNode
}

// ==================== 表单字段配置 ====================

export interface FormField {
  name: string
  label: string
  type: 'input' | 'textarea' | 'select' | 'date' | 'dateRange' | 'number' | 'switch' | 'checkbox' | 'radio' | 'upload'
  required?: boolean
  placeholder?: string
  rules?: FormRule[]
  options?: SelectOption[]
  props?: Record<string, unknown>
}

export interface FormRule {
  required?: boolean
  message?: string
  min?: number
  max?: number
  pattern?: RegExp
  validator?: (value: unknown) => boolean | Promise<boolean>
}

// ==================== 操作结果 ====================

export interface OperationResult {
  success: boolean
  message?: string
  data?: unknown
}

// ==================== 确认对话框 ====================

export interface ConfirmConfig {
  title: string
  content?: string
  okText?: string
  cancelText?: string
  type?: 'info' | 'warning' | 'error' | 'confirm'
  onOk?: () => void | Promise<void>
  onCancel?: () => void
}

// ==================== 加载状态 ====================

export interface LoadingState {
  loading: boolean
  error: string | null
}

// ==================== 异步状态 ====================

export interface AsyncState<T> extends LoadingState {
  data: T | null
}

// ==================== 日期范围 ====================

export interface DateRange {
  startDate: string
  endDate: string
}

// ==================== 颜色配置 ====================

export interface ColorConfig {
  primary: string
  success: string
  warning: string
  error: string
  info: string
}

// ==================== 主题配置 ====================

export interface ThemeConfig {
  mode: 'light' | 'dark'
  primaryColor: string
  borderRadius: number
  fontSize: number
}