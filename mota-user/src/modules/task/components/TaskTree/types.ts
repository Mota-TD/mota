/**
 * TaskTree 组件类型定义
 */

import type { Task, DepartmentTask } from '../../types'

/**
 * 树节点类型
 */
export type TreeNodeType = 'project' | 'milestone' | 'department-task' | 'task'

/**
 * 树节点数据
 */
export interface TreeNodeData {
  key: string
  title: string
  type: TreeNodeType
  data: Task | DepartmentTask | { id: string; name: string }
  children?: TreeNodeData[]
  isLeaf?: boolean
  disabled?: boolean
  selectable?: boolean
  checkable?: boolean
  icon?: React.ReactNode
  status?: string
  progress?: number
  priority?: string
  assigneeName?: string
  assigneeAvatar?: string
  startDate?: string
  endDate?: string
}

/**
 * TaskTree 组件 Props
 */
export interface TaskTreeProps {
  /** 项目ID */
  projectId: string
  /** 部门任务列表 */
  departmentTasks?: DepartmentTask[]
  /** 执行任务列表 */
  tasks?: Task[]
  /** 是否显示复选框 */
  checkable?: boolean
  /** 选中的节点 keys */
  checkedKeys?: string[]
  /** 选中节点变化回调 */
  onCheck?: (checkedKeys: string[], info: { node: TreeNodeData; checked: boolean }) => void
  /** 选择的节点 key */
  selectedKey?: string
  /** 选择节点变化回调 */
  onSelect?: (key: string, node: TreeNodeData) => void
  /** 展开的节点 keys */
  expandedKeys?: string[]
  /** 展开节点变化回调 */
  onExpand?: (expandedKeys: string[]) => void
  /** 是否显示搜索框 */
  showSearch?: boolean
  /** 搜索关键词 */
  searchValue?: string
  /** 搜索变化回调 */
  onSearch?: (value: string) => void
  /** 是否显示工具栏 */
  showToolbar?: boolean
  /** 是否可拖拽 */
  draggable?: boolean
  /** 拖拽结束回调 */
  onDrop?: (info: DropInfo) => void
  /** 是否显示进度 */
  showProgress?: boolean
  /** 是否显示状态 */
  showStatus?: boolean
  /** 是否显示执行人 */
  showAssignee?: boolean
  /** 是否显示日期 */
  showDate?: boolean
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
 * 拖拽信息
 */
export interface DropInfo {
  dragNode: TreeNodeData
  dropNode: TreeNodeData
  dropPosition: number // -1: 上方, 0: 内部, 1: 下方
}

/**
 * 树节点操作
 */
export interface TreeNodeAction {
  key: string
  label: string
  icon?: React.ReactNode
  danger?: boolean
  disabled?: boolean
  onClick: (node: TreeNodeData) => void
}

/**
 * 分组方式
 */
export type GroupBy = 'department-task' | 'milestone' | 'status' | 'priority' | 'assignee' | 'none'

/**
 * 排序方式
 */
export interface SortOption {
  field: 'name' | 'priority' | 'status' | 'startDate' | 'endDate' | 'progress' | 'createdAt'
  order: 'asc' | 'desc'
}

/**
 * 工具栏配置
 */
export interface ToolbarConfig {
  showExpandAll?: boolean
  showCollapseAll?: boolean
  showGroupBy?: boolean
  showSort?: boolean
  showFilter?: boolean
  showRefresh?: boolean
}