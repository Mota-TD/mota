/**
 * TaskKanban 组件类型定义
 */

import type { Task } from '../../types'

/**
 * 看板列状态
 */
export type KanbanColumnStatus = 'pending' | 'in_progress' | 'paused' | 'completed' | 'cancelled'

/**
 * 看板列配置
 */
export interface KanbanColumnConfig {
  id: string
  title: string
  status: KanbanColumnStatus
  color: string
  limit?: number // WIP 限制
  collapsed?: boolean
}

/**
 * 看板卡片数据
 */
export interface KanbanCard {
  id: string
  task: Task
  columnId: string
  order: number
}

/**
 * 拖拽结果
 */
export interface DragResult {
  cardId: string
  sourceColumnId: string
  destinationColumnId: string
  sourceIndex: number
  destinationIndex: number
}

/**
 * TaskKanban 组件 Props
 */
export interface TaskKanbanProps {
  /** 项目ID */
  projectId: string
  /** 任务列表 */
  tasks?: Task[]
  /** 列配置 */
  columns?: KanbanColumnConfig[]
  /** 拖拽结束回调 */
  onDragEnd?: (result: DragResult) => Promise<boolean>
  /** 卡片点击回调 */
  onCardClick?: (task: Task) => void
  /** 卡片双击回调 */
  onCardDoubleClick?: (task: Task) => void
  /** 添加任务回调 */
  onAddTask?: (columnId: string) => void
  /** 是否显示添加按钮 */
  showAddButton?: boolean
  /** 是否显示列统计 */
  showColumnStats?: boolean
  /** 是否显示 WIP 限制 */
  showWipLimit?: boolean
  /** 是否可拖拽 */
  draggable?: boolean
  /** 加载中 */
  loading?: boolean
  /** 空状态文案 */
  emptyText?: string
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
}

/**
 * 看板列 Props
 */
export interface KanbanColumnProps {
  column: KanbanColumnConfig
  cards: KanbanCard[]
  onCardClick?: (task: Task) => void
  onCardDoubleClick?: (task: Task) => void
  onAddTask?: () => void
  showAddButton?: boolean
  showStats?: boolean
  showWipLimit?: boolean
  draggable?: boolean
}

/**
 * 看板卡片 Props
 */
export interface KanbanCardProps {
  card: KanbanCard
  onClick?: () => void
  onDoubleClick?: () => void
  draggable?: boolean
  isDragging?: boolean
}

/**
 * 默认列配置
 */
export const DEFAULT_COLUMNS: KanbanColumnConfig[] = [
  { id: 'pending', title: '待开始', status: 'pending', color: '#d9d9d9' },
  { id: 'in_progress', title: '进行中', status: 'in_progress', color: '#1890ff' },
  { id: 'paused', title: '已暂停', status: 'paused', color: '#faad14' },
  { id: 'completed', title: '已完成', status: 'completed', color: '#52c41a' },
]

/**
 * 状态到列ID的映射
 */
export const STATUS_TO_COLUMN: Record<string, string> = {
  pending: 'pending',
  in_progress: 'in_progress',
  paused: 'paused',
  completed: 'completed',
  cancelled: 'cancelled',
}

/**
 * 列ID到状态的映射
 */
export const COLUMN_TO_STATUS: Record<string, KanbanColumnStatus> = {
  pending: 'pending',
  in_progress: 'in_progress',
  paused: 'paused',
  completed: 'completed',
  cancelled: 'cancelled',
}