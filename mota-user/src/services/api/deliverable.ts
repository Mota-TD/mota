/**
 * 交付物相关 API
 * 对应后端 DeliverableController
 */

import { get, post, put, del } from '../request'

// 交付物信息
export interface Deliverable {
  id: number
  taskId: number
  name: string
  fileName?: string
  fileUrl?: string
  fileSize?: number
  fileType?: string
  description?: string
  uploadedBy: number
  createdAt?: string
  // 关联信息
  uploaderName?: string
  uploaderAvatar?: string
  taskName?: string
}

// 交付物列表响应
export interface DeliverableListResponse {
  list: Deliverable[]
  total: number
}

// 创建交付物请求（不含文件）
export interface CreateDeliverableRequest {
  taskId: number
  name: string
  description?: string
}

// 更新交付物请求
export interface UpdateDeliverableRequest {
  name?: string
  description?: string
}

// 分页查询参数
export interface DeliverableQueryParams {
  [key: string]: string | number | boolean | undefined
  taskId?: number
  uploadedBy?: number
  page?: number
  pageSize?: number
}

/**
 * 获取交付物列表（分页）
 */
export async function getDeliverables(params?: DeliverableQueryParams): Promise<DeliverableListResponse> {
  const response = await get<{ records: Deliverable[]; total: number }>('/api/v1/deliverables', params)
  return {
    list: response?.records || [],
    total: response?.total || 0
  }
}

/**
 * 根据任务ID获取交付物列表
 */
export function getDeliverablesByTaskId(taskId: number): Promise<Deliverable[]> {
  return get<Deliverable[]>(`/api/v1/deliverables/task/${taskId}`)
}

/**
 * 获取交付物详情
 */
export function getDeliverableById(id: number): Promise<Deliverable> {
  return get<Deliverable>(`/api/v1/deliverables/${id}`)
}

/**
 * 创建交付物（不含文件）
 */
export function createDeliverable(data: CreateDeliverableRequest): Promise<Deliverable> {
  return post<Deliverable>('/api/v1/deliverables', data)
}

/**
 * 上传交付物（含文件）
 */
export async function uploadDeliverable(
  taskId: number, 
  file: File, 
  name?: string, 
  description?: string
): Promise<Deliverable> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('taskId', taskId.toString())
  if (name) formData.append('name', name)
  if (description) formData.append('description', description)
  
  const response = await fetch('/api/v1/deliverables/upload', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    }
  })
  
  if (!response.ok) {
    throw new Error('上传失败')
  }
  
  const result = await response.json()
  return result.data
}

/**
 * 更新交付物信息
 */
export function updateDeliverable(id: number, data: UpdateDeliverableRequest): Promise<Deliverable> {
  return put<Deliverable>(`/api/v1/deliverables/${id}`, data)
}

/**
 * 删除交付物
 */
export function deleteDeliverable(id: number): Promise<void> {
  return del<void>(`/api/v1/deliverables/${id}`)
}

/**
 * 下载交付物
 */
export async function downloadDeliverable(id: number): Promise<Blob> {
  const response = await fetch(`/api/v1/deliverables/${id}/download`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    }
  })
  
  if (!response.ok) {
    throw new Error('下载失败')
  }
  
  return response.blob()
}

/**
 * 预览交付物（获取预览URL）
 */
export function getDeliverablePreviewUrl(id: number): Promise<string> {
  return get<string>(`/api/v1/deliverables/${id}/preview`)
}

/**
 * 获取用户上传的交付物列表
 */
export function getDeliverablesByUser(userId: number): Promise<Deliverable[]> {
  return get<Deliverable[]>(`/api/v1/deliverables/user/${userId}`)
}

/**
 * 获取任务的交付物数量
 */
export function getDeliverableCount(taskId: number): Promise<number> {
  return get<number>(`/api/v1/deliverables/task/${taskId}/count`)
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes) return '未知'
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let unitIndex = 0
  let size = bytes
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

/**
 * 获取文件类型图标
 */
export function getFileTypeIcon(fileType?: string): string {
  if (!fileType) return 'file'
  
  const typeMap: Record<string, string> = {
    'application/pdf': 'file-pdf',
    'application/msword': 'file-word',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'file-word',
    'application/vnd.ms-excel': 'file-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'file-excel',
    'application/vnd.ms-powerpoint': 'file-ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'file-ppt',
    'image/jpeg': 'file-image',
    'image/png': 'file-image',
    'image/gif': 'file-image',
    'image/webp': 'file-image',
    'video/mp4': 'video-camera',
    'video/webm': 'video-camera',
    'audio/mpeg': 'audio',
    'audio/wav': 'audio',
    'application/zip': 'file-zip',
    'application/x-rar-compressed': 'file-zip',
    'text/plain': 'file-text',
    'text/html': 'file-text',
    'text/css': 'file-text',
    'application/javascript': 'file-text',
    'application/json': 'file-text'
  }
  
  return typeMap[fileType] || 'file'
}

/**
 * 检查文件类型是否可预览
 */
export function isPreviewable(fileType?: string): boolean {
  if (!fileType) return false
  
  const previewableTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain',
    'text/html'
  ]
  
  return previewableTypes.includes(fileType)
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(fileName?: string): string {
  if (!fileName) return ''
  const parts = fileName.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}