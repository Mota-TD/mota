/**
 * 通用类型定义
 */

/**
 * API 响应基础结构
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  success: boolean;
  timestamp?: number;
}

/**
 * 分页请求参数
 */
export interface PageParams {
  current?: number;
  pageSize?: number;
  keyword?: string;
  sorter?: Record<string, 'ascend' | 'descend'>;
  filter?: Record<string, any>;
}

/**
 * 分页响应数据
 */
export interface PageData<T> {
  list: T[];
  total: number;
  current: number;
  pageSize: number;
}

/**
 * 错误响应
 */
export interface ErrorResponse {
  code: number;
  message: string;
  details?: any;
}

/**
 * 操作结果
 */
export interface OperationResult {
  success: boolean;
  message?: string;
}

/**
 * 选项类型
 */
export interface Option {
  label: string;
  value: string | number;
  disabled?: boolean;
}

/**
 * 状态枚举
 */
export enum StatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

/**
 * 角色枚举
 */
export enum RoleEnum {
  ADMIN = 'admin',
  OPERATOR = 'operator',
  SUPPORT = 'support',
  ANALYST = 'analyst',
  OPS = 'ops',
}