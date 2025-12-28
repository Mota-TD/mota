/**
 * TaskForm 组件类型定义
 */

import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../../types'
import { TaskStatus, TaskPriority } from '../../types'

/**
 * TaskForm 组件 Props
 */
export interface TaskFormProps {
  /** 编辑模式下的任务数据 */
  task?: Task
  /** 项目ID（创建时必填） */
  projectId?: string
  /** 部门任务ID（创建时必填） */
  departmentTaskId?: string
  /** 是否显示为模态框 */
  asModal?: boolean
  /** 模态框是否可见 */
  visible?: boolean
  /** 关闭回调 */
  onClose?: () => void
  /** 提交成功回调 */
  onSuccess?: (task: Task) => void
  /** 提交失败回调 */
  onError?: (error: Error) => void
  /** 是否只读 */
  readonly?: boolean
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
}

/**
 * 表单数据
 */
export interface TaskFormData {
  name: string
  description?: string
  departmentTaskId: string
  projectId: string
  assigneeId?: string
  priority: TaskPriority
  startDate?: string
  endDate?: string
}

/**
 * 表单验证规则
 */
export interface TaskFormRules {
  name: { required: boolean; message: string }[]
  departmentTaskId: { required: boolean; message: string }[]
  projectId: { required: boolean; message: string }[]
}

/**
 * 表单字段配置
 */
export interface TaskFormFieldConfig {
  name: keyof TaskFormData
  label: string
  type: 'input' | 'textarea' | 'select' | 'date' | 'dateRange'
  required?: boolean
  placeholder?: string
  options?: { label: string; value: string }[]
}

/**
 * 默认表单值
 */
export const DEFAULT_FORM_VALUES: TaskFormData = {
  name: '',
  description: '',
  departmentTaskId: '',
  projectId: '',
  assigneeId: undefined,
  priority: TaskPriority.MEDIUM,
  startDate: undefined,
  endDate: undefined,
}

/**
 * 优先级选项
 */
export const PRIORITY_OPTIONS = [
  { label: '低', value: TaskPriority.LOW },
  { label: '中', value: TaskPriority.MEDIUM },
  { label: '高', value: TaskPriority.HIGH },
  { label: '紧急', value: TaskPriority.URGENT },
]

/**
 * 表单验证规则
 */
export const FORM_RULES: TaskFormRules = {
  name: [{ required: true, message: '请输入任务名称' }],
  departmentTaskId: [{ required: true, message: '请选择所属部门任务' }],
  projectId: [{ required: true, message: '请选择所属项目' }],
}