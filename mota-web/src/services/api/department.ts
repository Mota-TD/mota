/**
 * 部门相关 API
 */

import { get, post, put, del } from '../request'

// 部门状态枚举
export enum DepartmentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

// 部门信息
export interface Department {
  id: string
  orgId: string
  name: string
  description?: string
  managerId?: string
  parentId?: string
  sortOrder: number
  status: DepartmentStatus
  createdAt?: string
  updatedAt?: string
  // 关联信息
  managerName?: string
  managerAvatar?: string
  memberCount?: number
  children?: Department[]
}

// 部门列表响应
export interface DepartmentListResponse {
  list: Department[]
  total: number
}

// 创建部门请求
export interface CreateDepartmentRequest {
  orgId: string
  name: string
  description?: string
  managerId?: string
  parentId?: string
  sortOrder?: number
}

// 更新部门请求
export interface UpdateDepartmentRequest {
  name?: string
  description?: string
  managerId?: string
  parentId?: string
  sortOrder?: number
  status?: DepartmentStatus
}

/**
 * 获取组织下的部门列表
 */
export function getDepartmentsByOrgId(orgId: string | number): Promise<Department[]> {
  return get<Department[]>(`/api/v1/departments/org/${orgId}`)
}

/**
 * 获取部门树形结构
 */
export function getDepartmentTree(orgId: string | number): Promise<Department[]> {
  return get<Department[]>(`/api/v1/departments/tree/${orgId}`)
}

/**
 * 获取部门详情
 */
export function getDepartmentById(id: string | number): Promise<Department> {
  return get<Department>(`/api/v1/departments/${id}`)
}

/**
 * 创建部门
 */
export function createDepartment(data: CreateDepartmentRequest): Promise<Department> {
  return post<Department>('/api/v1/departments', data)
}

/**
 * 更新部门
 */
export function updateDepartment(id: string | number, data: UpdateDepartmentRequest): Promise<Department> {
  return put<Department>(`/api/v1/departments/${id}`, data)
}

/**
 * 删除部门
 */
export function deleteDepartment(id: string | number): Promise<void> {
  return del<void>(`/api/v1/departments/${id}`)
}

/**
 * 获取部门成员列表
 */
export function getDepartmentMembers(departmentId: string | number): Promise<any[]> {
  return get<any[]>(`/api/v1/departments/${departmentId}/members`)
}

/**
 * 获取状态显示文本
 */
export function getStatusText(status: DepartmentStatus): string {
  const statusMap: Record<DepartmentStatus, string> = {
    [DepartmentStatus.ACTIVE]: '正常',
    [DepartmentStatus.INACTIVE]: '停用'
  }
  return statusMap[status] || status
}

/**
 * 获取状态颜色
 */
export function getStatusColor(status: DepartmentStatus): string {
  const colorMap: Record<DepartmentStatus, string> = {
    [DepartmentStatus.ACTIVE]: 'success',
    [DepartmentStatus.INACTIVE]: 'default'
  }
  return colorMap[status] || 'default'
}