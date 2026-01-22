import { get, post, put, del } from '../request'

/**
 * 角色视图对象
 */
export interface Role {
  id: number
  name: string
  code: string
  sort: number
  dataScope: number
  status: number
  isSystem: number
  remark: string
  createdAt: string
  updatedAt: string
  permissionIds?: number[]
  userCount?: number
}

/**
 * 创建角色请求
 */
export interface RoleCreateRequest {
  name: string
  code: string
  sort?: number
  dataScope?: number
  remark?: string
  permissionIds?: number[]
}

/**
 * 更新角色请求
 */
export interface RoleUpdateRequest {
  name?: string
  code?: string
  sort?: number
  dataScope?: number
  status?: number
  remark?: string
  permissionIds?: number[]
}

/**
 * 角色查询请求
 */
export interface RoleQueryRequest {
  name?: string
  code?: string
  status?: number
  pageNum?: number
  pageSize?: number
}

/**
 * 分页结果
 */
export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

/**
 * 创建角色
 */
export function createRole(data: RoleCreateRequest): Promise<number> {
  return post<number>('/api/v1/roles', data)
}

/**
 * 更新角色
 */
export function updateRole(roleId: number, data: RoleUpdateRequest): Promise<void> {
  return put<void>(`/api/v1/roles/${roleId}`, data)
}

/**
 * 删除角色
 */
export function deleteRole(roleId: number): Promise<void> {
  return del<void>(`/api/v1/roles/${roleId}`)
}

/**
 * 批量删除角色
 */
export function deleteRoles(roleIds: number[]): Promise<void> {
  return post<void>('/api/v1/roles/batch-delete', roleIds)
}

/**
 * 获取角色详情
 */
export function getRoleById(roleId: number): Promise<Role> {
  return get<Role>(`/api/v1/roles/${roleId}`)
}

/**
 * 分页查询角色
 */
export function pageRoles(params: RoleQueryRequest): Promise<PageResult<Role>> {
  const queryParams: Record<string, string | number | boolean | undefined> = {}
  if (params.name) queryParams.name = params.name
  if (params.code) queryParams.code = params.code
  if (params.status !== undefined) queryParams.status = params.status
  if (params.pageNum !== undefined) queryParams.pageNum = params.pageNum
  if (params.pageSize !== undefined) queryParams.pageSize = params.pageSize
  return get<PageResult<Role>>('/api/v1/roles', queryParams)
}

/**
 * 获取所有启用的角色
 */
export function listAllEnabledRoles(): Promise<Role[]> {
  return get<Role[]>('/api/v1/roles/enabled')
}

/**
 * 启用角色
 */
export function enableRole(roleId: number): Promise<void> {
  return put<void>(`/api/v1/roles/${roleId}/enable`, null)
}

/**
 * 禁用角色
 */
export function disableRole(roleId: number): Promise<void> {
  return put<void>(`/api/v1/roles/${roleId}/disable`, null)
}

/**
 * 分配权限
 */
export function assignPermissions(roleId: number, permissionIds: number[]): Promise<void> {
  return put<void>(`/api/v1/roles/${roleId}/permissions`, permissionIds)
}

/**
 * 获取角色权限ID列表
 */
export function getRolePermissionIds(roleId: number): Promise<number[]> {
  return get<number[]>(`/api/v1/roles/${roleId}/permissions`)
}

/**
 * 检查角色编码是否存在
 */
export function existsByCode(code: string): Promise<boolean> {
  return get<boolean>('/api/v1/roles/exists/code', { code })
}

/**
 * 数据范围选项
 */
export const DATA_SCOPE_OPTIONS = [
  { value: 1, label: '全部数据' },
  { value: 2, label: '自定义数据' },
  { value: 3, label: '本部门数据' },
  { value: 4, label: '本部门及以下数据' },
  { value: 5, label: '仅本人数据' },
]

/**
 * 状态选项
 */
export const STATUS_OPTIONS = [
  { value: 1, label: '正常' },
  { value: 0, label: '停用' },
]