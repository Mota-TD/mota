/**
 * 工作计划相关 API
 * 对应后端 WorkPlanController
 */

import { get, post, put, del } from '../request'

// 工作计划状态枚举
export enum WorkPlanStatus {
  DRAFT = 'draft',           // 草稿
  SUBMITTED = 'submitted',   // 已提交
  APPROVED = 'approved',     // 已通过
  REJECTED = 'rejected'      // 已驳回
}

// 工作计划信息
export interface WorkPlan {
  id: number
  departmentTaskId: number
  summary?: string
  resourceRequirement?: string
  status: WorkPlanStatus
  submittedBy?: number
  submittedAt?: string
  reviewedBy?: number
  reviewedAt?: string
  reviewComment?: string
  version: number
  createdAt?: string
  updatedAt?: string
  // 关联信息
  submitterName?: string
  reviewerName?: string
  departmentTaskName?: string
  attachments?: WorkPlanAttachment[]
}

// 工作计划附件
export interface WorkPlanAttachment {
  id: number
  workPlanId: number
  fileName: string
  fileUrl: string
  fileSize?: number
  fileType?: string
  uploadedBy: number
  createdAt?: string
  // 关联信息
  uploaderName?: string
}

// 工作计划列表响应
export interface WorkPlanListResponse {
  list: WorkPlan[]
  total: number
}

// 创建工作计划请求
export interface CreateWorkPlanRequest {
  departmentTaskId: number
  summary?: string
  resourceRequirement?: string
}

// 更新工作计划请求
export interface UpdateWorkPlanRequest {
  summary?: string
  resourceRequirement?: string
}

// 提交工作计划请求
export interface SubmitWorkPlanRequest {
  summary?: string
  resourceRequirement?: string
}

// 审批工作计划请求
export interface ApproveWorkPlanRequest {
  approved: boolean
  comment?: string
}

// 上传附件请求
export interface UploadAttachmentRequest {
  workPlanId: number
  file: File
}

// 分页查询参数
export interface WorkPlanQueryParams {
  [key: string]: string | number | boolean | undefined
  departmentTaskId?: number
  status?: WorkPlanStatus
  submittedBy?: number
  page?: number
  pageSize?: number
}

/**
 * 获取工作计划列表（分页）
 */
export async function getWorkPlans(params?: WorkPlanQueryParams): Promise<WorkPlanListResponse> {
  const response = await get<{ records: WorkPlan[]; total: number }>('/api/v1/work-plans', params)
  return {
    list: response?.records || [],
    total: response?.total || 0
  }
}

/**
 * 根据项目ID获取所有工作计划
 */
export async function getWorkPlansByProject(projectId: number): Promise<WorkPlan[]> {
  const response = await get<{ records: WorkPlan[]; total: number }>('/api/v1/work-plans', { projectId })
  return response?.records || []
}

/**
 * 根据部门任务ID获取工作计划
 */
export function getWorkPlanByDepartmentTaskId(departmentTaskId: number): Promise<WorkPlan | null> {
  return get<WorkPlan | null>(`/api/v1/work-plans/department-task/${departmentTaskId}`)
}

/**
 * 获取工作计划详情
 */
export function getWorkPlanById(id: number): Promise<WorkPlan> {
  return get<WorkPlan>(`/api/v1/work-plans/${id}`)
}

/**
 * 创建工作计划（草稿）
 */
export function createWorkPlan(data: CreateWorkPlanRequest): Promise<WorkPlan> {
  return post<WorkPlan>('/api/v1/work-plans', data)
}

/**
 * 更新工作计划
 */
export function updateWorkPlan(id: number, data: UpdateWorkPlanRequest): Promise<WorkPlan> {
  return put<WorkPlan>(`/api/v1/work-plans/${id}`, data)
}

/**
 * 删除工作计划
 */
export function deleteWorkPlan(id: number): Promise<void> {
  return del<void>(`/api/v1/work-plans/${id}`)
}

/**
 * 提交工作计划（提交审批）
 */
export function submitWorkPlan(id: number, data?: SubmitWorkPlanRequest): Promise<WorkPlan> {
  return post<WorkPlan>(`/api/v1/work-plans/${id}/submit`, data)
}

/**
 * 审批工作计划
 */
export function approveWorkPlan(id: number, data: ApproveWorkPlanRequest): Promise<WorkPlan> {
  return post<WorkPlan>(`/api/v1/work-plans/${id}/approve`, data)
}

/**
 * 获取工作计划附件列表
 */
export function getWorkPlanAttachments(workPlanId: number): Promise<WorkPlanAttachment[]> {
  return get<WorkPlanAttachment[]>(`/api/v1/work-plans/${workPlanId}/attachments`)
}

/**
 * 上传工作计划附件
 * 注意：这个函数需要使用 FormData 上传文件
 */
export async function uploadWorkPlanAttachment(workPlanId: number, file: File): Promise<WorkPlanAttachment> {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch(`/api/v1/work-plans/${workPlanId}/attachments`, {
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
 * 删除工作计划附件
 */
export function deleteWorkPlanAttachment(workPlanId: number, attachmentId: number): Promise<void> {
  return del<void>(`/api/v1/work-plans/${workPlanId}/attachments/${attachmentId}`)
}

/**
 * 获取状态显示文本
 */
export function getStatusText(status: WorkPlanStatus): string {
  const statusMap: Record<WorkPlanStatus, string> = {
    [WorkPlanStatus.DRAFT]: '草稿',
    [WorkPlanStatus.SUBMITTED]: '待审批',
    [WorkPlanStatus.APPROVED]: '已通过',
    [WorkPlanStatus.REJECTED]: '已驳回'
  }
  return statusMap[status] || status
}

/**
 * 获取状态颜色
 */
export function getStatusColor(status: WorkPlanStatus): string {
  const colorMap: Record<WorkPlanStatus, string> = {
    [WorkPlanStatus.DRAFT]: 'default',
    [WorkPlanStatus.SUBMITTED]: 'processing',
    [WorkPlanStatus.APPROVED]: 'success',
    [WorkPlanStatus.REJECTED]: 'error'
  }
  return colorMap[status] || 'default'
}