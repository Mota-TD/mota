/**
 * 任务评论相关 API
 * 对应后端 TaskCommentController
 */

import { get, post, put, del } from '../request'

// 任务评论信息
export interface TaskComment {
  id: number
  taskId: number
  parentId?: number
  userId: number
  content: string
  mentionedUsers?: number[]
  likeCount: number
  createdAt?: string
  updatedAt?: string
  deletedAt?: string
  // 关联信息
  userName?: string
  userAvatar?: string
  taskName?: string
  // 子评论（回复）
  replies?: TaskComment[]
  // 附件
  attachments?: CommentAttachment[]
  // 当前用户是否已点赞
  liked?: boolean
}

// 评论附件
export interface CommentAttachment {
  id: number
  commentId: number
  fileName: string
  fileUrl: string
  fileSize?: number
  fileType?: string
  createdAt?: string
}

// 评论列表响应
export interface TaskCommentListResponse {
  list: TaskComment[]
  total: number
}

// 创建评论请求
export interface CreateTaskCommentRequest {
  taskId: number
  parentId?: number
  content: string
  mentionedUsers?: number[]
}

// 更新评论请求
export interface UpdateTaskCommentRequest {
  content: string
  mentionedUsers?: number[]
}

// 分页查询参数
export interface TaskCommentQueryParams {
  [key: string]: string | number | boolean | undefined
  taskId?: number
  userId?: number
  page?: number
  pageSize?: number
}

/**
 * 获取评论列表（分页）
 */
export async function getTaskComments(params?: TaskCommentQueryParams): Promise<TaskCommentListResponse> {
  const response = await get<{ records: TaskComment[]; total: number }>('/api/v1/task-comments', params)
  return {
    list: response?.records || [],
    total: response?.total || 0
  }
}

/**
 * 根据任务ID获取评论列表（包含嵌套回复）
 */
export function getCommentsByTaskId(taskId: number): Promise<TaskComment[]> {
  return get<TaskComment[]>(`/api/v1/task-comments/task/${taskId}`)
}

/**
 * 获取评论详情
 */
export function getTaskCommentById(id: number): Promise<TaskComment> {
  return get<TaskComment>(`/api/v1/task-comments/${id}`)
}

/**
 * 创建评论
 */
export function createTaskComment(data: CreateTaskCommentRequest): Promise<TaskComment> {
  return post<TaskComment>('/api/v1/task-comments', data)
}

/**
 * 更新评论
 */
export function updateTaskComment(id: number, data: UpdateTaskCommentRequest): Promise<TaskComment> {
  return put<TaskComment>(`/api/v1/task-comments/${id}`, data)
}

/**
 * 删除评论（软删除）
 */
export function deleteTaskComment(id: number): Promise<void> {
  return del<void>(`/api/v1/task-comments/${id}`)
}

/**
 * 回复评论
 */
export function replyToComment(parentId: number, data: Omit<CreateTaskCommentRequest, 'parentId'>): Promise<TaskComment> {
  return post<TaskComment>(`/api/v1/task-comments/${parentId}/reply`, data)
}

/**
 * 点赞评论
 */
export function likeComment(id: number): Promise<void> {
  return post<void>(`/api/v1/task-comments/${id}/like`)
}

/**
 * 取消点赞评论
 */
export function unlikeComment(id: number): Promise<void> {
  return del<void>(`/api/v1/task-comments/${id}/like`)
}

/**
 * 获取评论附件列表
 */
export function getCommentAttachments(commentId: number): Promise<CommentAttachment[]> {
  return get<CommentAttachment[]>(`/api/v1/task-comments/${commentId}/attachments`)
}

/**
 * 上传评论附件
 */
export async function uploadCommentAttachment(commentId: number, file: File): Promise<CommentAttachment> {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch(`/api/v1/task-comments/${commentId}/attachments`, {
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
 * 删除评论附件
 */
export function deleteCommentAttachment(commentId: number, attachmentId: number): Promise<void> {
  return del<void>(`/api/v1/task-comments/${commentId}/attachments/${attachmentId}`)
}

/**
 * 获取用户最近的评论
 */
export function getRecentCommentsByUser(userId: number, limit: number = 10): Promise<TaskComment[]> {
  return get<TaskComment[]>(`/api/v1/task-comments/user/${userId}/recent`, { limit })
}

/**
 * 搜索评论
 */
export function searchComments(taskId: number, keyword: string): Promise<TaskComment[]> {
  return get<TaskComment[]>(`/api/v1/task-comments/task/${taskId}/search`, { keyword })
}

/**
 * 解析评论内容中的@提及
 * 返回被提及的用户ID列表
 */
export function parseMentions(content: string): number[] {
  const mentionRegex = /@\[([^\]]+)\]\((\d+)\)/g
  const mentions: number[] = []
  let match
  
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(parseInt(match[2], 10))
  }
  
  return mentions
}

/**
 * 格式化评论内容（将@提及转换为显示格式）
 */
export function formatMentions(content: string, users: { id: number; name: string }[]): string {
  return content.replace(/@\[([^\]]+)\]\((\d+)\)/g, (_, name, id) => {
    const user = users.find(u => u.id === parseInt(id, 10))
    return `@${user?.name || name}`
  })
}

/**
 * 创建@提及标记
 */
export function createMention(userId: number, userName: string): string {
  return `@[${userName}](${userId})`
}

/**
 * 获取评论数量
 */
export function getCommentCount(taskId: number): Promise<number> {
  return get<number>(`/api/v1/task-comments/task/${taskId}/count`)
}