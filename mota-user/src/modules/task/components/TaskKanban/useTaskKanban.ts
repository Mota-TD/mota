/**
 * TaskKanban 数据处理 Hook
 */

import { useMemo, useCallback, useState } from 'react'
import type { Task, TaskQueryParams } from '../../types'
import { TaskStatus } from '../../types'
import type {
  KanbanColumnConfig,
  KanbanCard,
  DragResult,
} from './types'
import { DEFAULT_COLUMNS, STATUS_TO_COLUMN, COLUMN_TO_STATUS } from './types'
import { useTaskStore } from '../../store/taskStore'

interface UseTaskKanbanOptions {
  projectId: string
  tasks?: Task[]
  columns?: KanbanColumnConfig[]
  onDragEnd?: (result: DragResult) => Promise<boolean>
}

interface UseTaskKanbanReturn {
  /** 列配置 */
  columns: KanbanColumnConfig[]
  /** 按列分组的卡片 */
  cardsByColumn: Record<string, KanbanCard[]>
  /** 列统计 */
  columnStats: Record<string, { count: number; wipExceeded: boolean }>
  /** 处理拖拽结束 */
  handleDragEnd: (result: DragResult) => Promise<void>
  /** 是否正在拖拽 */
  isDragging: boolean
  /** 设置拖拽状态 */
  setIsDragging: (dragging: boolean) => void
  /** 获取列的卡片 */
  getColumnCards: (columnId: string) => KanbanCard[]
  /** 移动卡片 */
  moveCard: (cardId: string, targetColumnId: string) => Promise<boolean>
  /** 刷新数据 */
  refresh: () => void
}

/**
 * 将任务转换为看板卡片
 */
function taskToCard(task: Task, columnId: string, order: number): KanbanCard {
  return {
    id: task.id,
    task,
    columnId,
    order,
  }
}

/**
 * 获取任务对应的列ID
 */
function getColumnIdForTask(task: Task): string {
  const status = task.status || 'pending'
  return STATUS_TO_COLUMN[status] || 'pending'
}

/**
 * TaskKanban 数据处理 Hook
 */
export function useTaskKanban(options: UseTaskKanbanOptions): UseTaskKanbanReturn {
  const { projectId, tasks: propTasks, columns: propColumns, onDragEnd } = options

  const [isDragging, setIsDragging] = useState(false)

  // 从 store 获取任务
  const storeTasks = useTaskStore((state) => state.tasks)
  const updateTaskStatus = useTaskStore((state) => state.updateTaskStatus)
  const fetchTasks = useTaskStore((state) => state.fetchTasks)

  // 使用传入的任务或 store 中的任务
  const tasks = useMemo(() => {
    if (propTasks) return propTasks
    return storeTasks.filter((t) => t.projectId === projectId)
  }, [propTasks, storeTasks, projectId])

  // 使用传入的列配置或默认配置
  const columns = useMemo(() => {
    return propColumns || DEFAULT_COLUMNS
  }, [propColumns])

  // 按列分组卡片
  const cardsByColumn = useMemo(() => {
    const result: Record<string, KanbanCard[]> = {}

    // 初始化所有列
    columns.forEach((col) => {
      result[col.id] = []
    })

    // 将任务分配到对应列
    tasks.forEach((task) => {
      const columnId = getColumnIdForTask(task)
      if (result[columnId]) {
        const order = result[columnId].length
        result[columnId].push(taskToCard(task, columnId, order))
      }
    })

    // 按优先级和创建时间排序
    Object.keys(result).forEach((columnId) => {
      result[columnId].sort((a, b) => {
        // 优先级排序（高优先级在前）
        const priorityOrder: Record<string, number> = {
          urgent: 0,
          high: 1,
          medium: 2,
          low: 3,
        }
        const aPriority = priorityOrder[a.task.priority || 'medium'] ?? 2
        const bPriority = priorityOrder[b.task.priority || 'medium'] ?? 2
        if (aPriority !== bPriority) {
          return aPriority - bPriority
        }
        // 创建时间排序（新的在前）
        const aTime = new Date(a.task.createdAt || 0).getTime()
        const bTime = new Date(b.task.createdAt || 0).getTime()
        return bTime - aTime
      })

      // 更新排序后的 order
      result[columnId].forEach((card, index) => {
        card.order = index
      })
    })

    return result
  }, [tasks, columns])

  // 列统计
  const columnStats = useMemo(() => {
    const stats: Record<string, { count: number; wipExceeded: boolean }> = {}

    columns.forEach((col) => {
      const cards = cardsByColumn[col.id] || []
      const count = cards.length
      const wipExceeded = col.limit !== undefined && count > col.limit
      stats[col.id] = { count, wipExceeded }
    })

    return stats
  }, [columns, cardsByColumn])

  // 获取列的卡片
  const getColumnCards = useCallback(
    (columnId: string): KanbanCard[] => {
      return cardsByColumn[columnId] || []
    },
    [cardsByColumn]
  )

  // 移动卡片（更新任务状态）
  const moveCard = useCallback(
    async (cardId: string, targetColumnId: string): Promise<boolean> => {
      const targetStatus = COLUMN_TO_STATUS[targetColumnId]
      if (!targetStatus) return false

      // 将 KanbanColumnStatus 映射到 TaskStatus
      const taskStatusMap: Record<string, TaskStatus> = {
        pending: TaskStatus.PENDING,
        in_progress: TaskStatus.IN_PROGRESS,
        paused: TaskStatus.PAUSED,
        completed: TaskStatus.COMPLETED,
        cancelled: TaskStatus.CANCELLED,
      }
      const taskStatus = taskStatusMap[targetStatus]
      if (!taskStatus) return false

      try {
        await updateTaskStatus(cardId, taskStatus)
        return true
      } catch (error) {
        console.error('Failed to move card:', error)
        return false
      }
    },
    [updateTaskStatus]
  )

  // 处理拖拽结束
  const handleDragEnd = useCallback(
    async (result: DragResult): Promise<void> => {
      const { cardId, sourceColumnId, destinationColumnId } = result

      // 如果没有移动到新列，不处理
      if (sourceColumnId === destinationColumnId) {
        return
      }

      // 如果有自定义处理函数，使用自定义处理
      if (onDragEnd) {
        const success = await onDragEnd(result)
        if (!success) {
          // 处理失败，可能需要回滚
          console.warn('Drag end handler returned false')
        }
        return
      }

      // 默认处理：更新任务状态
      await moveCard(cardId, destinationColumnId)
    },
    [onDragEnd, moveCard]
  )

  // 刷新数据
  const refresh = useCallback(() => {
    const params: TaskQueryParams = { projectId }
    fetchTasks(params)
  }, [fetchTasks, projectId])

  return {
    columns,
    cardsByColumn,
    columnStats,
    handleDragEnd,
    isDragging,
    setIsDragging,
    getColumnCards,
    moveCard,
    refresh,
  }
}

/**
 * 看板列排序 Hook
 */
export function useColumnSort(cards: KanbanCard[]) {
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'createdAt'>('priority')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const sortedCards = useMemo(() => {
    const sorted = [...cards]

    sorted.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'priority': {
          const priorityOrder: Record<string, number> = {
            urgent: 0,
            high: 1,
            medium: 2,
            low: 3,
          }
          const aPriority = priorityOrder[a.task.priority || 'medium'] ?? 2
          const bPriority = priorityOrder[b.task.priority || 'medium'] ?? 2
          comparison = aPriority - bPriority
          break
        }
        case 'dueDate': {
          const aDate = a.task.endDate ? new Date(a.task.endDate).getTime() : Infinity
          const bDate = b.task.endDate ? new Date(b.task.endDate).getTime() : Infinity
          comparison = aDate - bDate
          break
        }
        case 'createdAt': {
          const aTime = new Date(a.task.createdAt || 0).getTime()
          const bTime = new Date(b.task.createdAt || 0).getTime()
          comparison = aTime - bTime
          break
        }
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [cards, sortBy, sortOrder])

  return {
    sortedCards,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
  }
}

/**
 * 看板过滤 Hook
 */
export function useKanbanFilter(cards: KanbanCard[]) {
  const [searchText, setSearchText] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string[]>([])
  const [assigneeFilter, setAssigneeFilter] = useState<string[]>([])

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      // 搜索过滤
      if (searchText) {
        const text = searchText.toLowerCase()
        const matchName = card.task.name?.toLowerCase().includes(text)
        const matchDesc = card.task.description?.toLowerCase().includes(text)
        if (!matchName && !matchDesc) return false
      }

      // 优先级过滤
      if (priorityFilter.length > 0) {
        if (!priorityFilter.includes(card.task.priority || 'medium')) {
          return false
        }
      }

      // 负责人过滤
      if (assigneeFilter.length > 0) {
        if (!assigneeFilter.includes(card.task.assigneeId || '')) {
          return false
        }
      }

      return true
    })
  }, [cards, searchText, priorityFilter, assigneeFilter])

  const clearFilters = useCallback(() => {
    setSearchText('')
    setPriorityFilter([])
    setAssigneeFilter([])
  }, [])

  return {
    filteredCards,
    searchText,
    setSearchText,
    priorityFilter,
    setPriorityFilter,
    assigneeFilter,
    setAssigneeFilter,
    clearFilters,
    hasFilters: searchText !== '' || priorityFilter.length > 0 || assigneeFilter.length > 0,
  }
}