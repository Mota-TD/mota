/**
 * Wiki API
 */
import { get, post, put, del } from '../request'

export interface WikiPage {
  id: number
  title: string
  content: string
  projectId: number
  parentId?: number
  authorId: number
  authorName?: string
  status: string
  createdAt: string
  updatedAt: string
  children?: WikiPage[]
}

export interface WikiListResult {
  list: WikiPage[]
  total: number
}

/**
 * 获取 Wiki 页面列表
 */
export function getWikiPages(params?: {
  projectId?: number
  parentId?: number
  keyword?: string
  page?: number
  pageSize?: number
}): Promise<WikiListResult> {
  return get('/api/v1/wiki/pages', params)
}

/**
 * 获取 Wiki 页面详情
 */
export function getWikiPage(id: number): Promise<WikiPage> {
  return get(`/api/v1/wiki/pages/${id}`)
}

/**
 * 创建 Wiki 页面
 */
export function createWikiPage(data: Partial<WikiPage>): Promise<WikiPage> {
  return post('/api/v1/wiki/pages', data)
}

/**
 * 更新 Wiki 页面
 */
export function updateWikiPage(id: number, data: Partial<WikiPage>): Promise<WikiPage> {
  return put(`/api/v1/wiki/pages/${id}`, data)
}

/**
 * 删除 Wiki 页面
 */
export function deleteWikiPage(id: number): Promise<void> {
  return del(`/api/v1/wiki/pages/${id}`)
}

/**
 * 获取 Wiki 树形结构
 */
export function getWikiTree(projectId: number): Promise<WikiPage[]> {
  return get('/api/v1/wiki/tree', { projectId })
}