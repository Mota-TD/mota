/**
 * 用户 API
 */
import { get, post, put, del } from '../request'

export interface User {
  id: number
  username: string
  nickname: string
  email: string
  avatar?: string
  phone?: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface UserListResult {
  list: User[]
  total: number
}

/**
 * 获取用户列表
 */
export function getUsers(params?: {
  keyword?: string
  status?: string
  page?: number
  pageSize?: number
}): Promise<UserListResult> {
  return get('/api/v1/users', params)
}

/**
 * 获取用户详情
 */
export function getUser(id: number): Promise<User> {
  return get(`/api/v1/users/${id}`)
}

/**
 * 创建用户
 */
export function createUser(data: Partial<User>): Promise<User> {
  return post('/api/v1/users', data)
}

/**
 * 更新用户
 */
export function updateUser(id: number, data: Partial<User>): Promise<User> {
  return put(`/api/v1/users/${id}`, data)
}

/**
 * 删除用户
 */
export function deleteUser(id: number): Promise<void> {
  return del(`/api/v1/users/${id}`)
}

/**
 * 获取当前用户信息
 */
export function getUserProfile(): Promise<User> {
  return get('/api/v1/users/me')
}

/**
 * 更新当前用户信息
 */
export function updateUserProfile(data: Partial<User>): Promise<User> {
  return put('/api/v1/users/me', data)
}