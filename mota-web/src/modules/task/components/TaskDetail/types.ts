/**
 * TaskDetail 组件类型定义
 */

import type { Task, Subtask, TaskComment, TaskAttachment, TaskTimeLog } from '../../types'

/**
 * TaskDetail 组件 Props
 */
export interface TaskDetailProps {
  /** 任务ID */
  taskId: string
  /** 任务数据（可选，如果不传则从 store 获取） */
  task?: Task
  /** 是否显示为抽屉 */
  asDrawer?: boolean
  /** 抽屉是否可见 */
  visible?: boolean
  /** 关闭回调 */
  onClose?: () => void
  /** 编辑回调 */
  onEdit?: (task: Task) => void
  /** 删除回调 */
  onDelete?: (taskId: string) => void
  /** 状态变更回调 */
  onStatusChange?: (taskId: string, status: string) => void
  /** 是否只读 */
  readonly?: boolean
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
}

/**
 * 任务详情数据
 */
export interface TaskDetailData {
  task: Task | null
  subtasks: Subtask[]
  comments: TaskComment[]
  attachments: TaskAttachment[]
  timeLogs: TaskTimeLog[]
  loading: boolean
  error: string | null
}

/**
 * 任务详情 Tab 类型
 */
export type TaskDetailTab = 'overview' | 'subtasks' | 'comments' | 'attachments' | 'timeLogs' | 'history'

/**
 * 任务详情 Tab 配置
 */
export interface TaskDetailTabConfig {
  key: TaskDetailTab
  label: string
  icon?: string
  badge?: number
}

/**
 * 子任务操作
 */
export interface SubtaskActions {
  add: (name: string) => Promise<void>
  update: (id: string, data: Partial<Subtask>) => Promise<void>
  delete: (id: string) => Promise<void>
  toggle: (id: string) => Promise<void>
  reorder: (ids: string[]) => Promise<void>
}

/**
 * 评论操作
 */
export interface CommentActions {
  add: (content: string) => Promise<void>
  update: (id: string, content: string) => Promise<void>
  delete: (id: string) => Promise<void>
}

/**
 * 附件操作
 */
export interface AttachmentActions {
  upload: (file: File) => Promise<void>
  delete: (id: string) => Promise<void>
  download: (id: string) => void
}

/**
 * 时间日志操作
 */
export interface TimeLogActions {
  add: (data: { startTime: string; endTime?: string; description?: string }) => Promise<void>
  update: (id: string, data: Partial<TaskTimeLog>) => Promise<void>
  delete: (id: string) => Promise<void>
}

/**
 * 任务历史记录
 */
export interface TaskHistory {
  id: string
  taskId: string
  userId: string
  userName?: string
  action: 'created' | 'updated' | 'status_changed' | 'assigned' | 'commented' | 'attachment_added'
  field?: string
  oldValue?: string
  newValue?: string
  createdAt: string
}

/**
 * 默认 Tab 配置
 */
export const DEFAULT_TABS: TaskDetailTabConfig[] = [
  { key: 'overview', label: '概览', icon: 'info-circle' },
  { key: 'subtasks', label: '子任务', icon: 'unordered-list' },
  { key: 'comments', label: '评论', icon: 'comment' },
  { key: 'attachments', label: '附件', icon: 'paper-clip' },
  { key: 'timeLogs', label: '工时', icon: 'clock-circle' },
  { key: 'history', label: '历史', icon: 'history' },
]