/**
 * 项目表单相关类型定义
 */

import type { Dayjs } from 'dayjs'

// 部门任务分配
export interface DepartmentTaskItem {
  departmentId: string | number
  managerId?: string | number
  name?: string
  description?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}

// 里程碑
export interface MilestoneItem {
  id: string
  name: string
  targetDate: string
  description?: string
  departmentTasks?: DepartmentTaskItem[]
}

// 表单数据
export interface ProjectFormData {
  name?: string
  description?: string
  dateRange?: [Dayjs, Dayjs]
  ownerId?: string | number
  visibility?: 'private' | 'public'
}

// 项目颜色选项
export const PROJECT_COLORS = [
  '#2b7de9', '#52c41a', '#722ed1', '#fa8c16',
  '#13c2c2', '#eb2f96', '#f5222d', '#faad14'
]

// 步骤配置
export interface StepConfig {
  title: string
  icon: React.ReactNode
}

// 部门信息
export interface DepartmentInfo {
  id: string | number
  name: string
  memberCount?: number
  managerId?: string | number
  managerName?: string
}

// 用户信息
export interface UserInfo {
  id: string | number
  username?: string
  nickname?: string
  avatar?: string
  departmentId?: string | number
  role?: string
}

// 表单提交数据
export interface ProjectSubmitData {
  name: string
  description?: string
  color: string
  startDate?: string
  endDate?: string
  ownerId?: string
  departmentIds: string[]
  memberIds: string[]
  milestones: {
    name: string
    targetDate: string
    description?: string
    departmentTasks?: {
      departmentId: string
      managerId?: string
      name?: string
      description?: string
      priority: string
      endDate?: string
    }[]
  }[]
}

// 表单模式
export type FormMode = 'create' | 'edit'

// 表单 Props
export interface ProjectFormProps {
  mode?: FormMode
  initialData?: Partial<ProjectSubmitData>
  onSubmit?: (data: ProjectSubmitData) => Promise<void>
  onCancel?: () => void
}