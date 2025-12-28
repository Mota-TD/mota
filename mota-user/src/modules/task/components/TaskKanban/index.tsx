/**
 * TaskKanban 组件
 * 任务看板视图，支持拖拽排序和状态切换
 */

import React, { useCallback, useState, useMemo } from 'react'
import { Spin, Empty, Button, Tooltip, Dropdown, message } from 'antd'
import {
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
  WarningOutlined,
  CalendarOutlined,
  UserOutlined,
  MoreOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import type { Task } from '../../types'
import type {
  TaskKanbanProps,
  KanbanColumnConfig,
  KanbanCard,
  DragResult,
} from './types'
import { DEFAULT_COLUMNS } from './types'
import { useTaskKanban } from './useTaskKanban'
import styles from './index.module.css'

/**
 * 看板卡片组件
 */
interface CardComponentProps {
  card: KanbanCard
  onClick?: () => void
  onDoubleClick?: () => void
  draggable?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onDragEnd?: (e: React.DragEvent) => void
}

const KanbanCardComponent: React.FC<CardComponentProps> = ({
  card,
  onClick,
  onDoubleClick,
  draggable = true,
  onDragStart,
  onDragEnd,
}) => {
  const { task } = card
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    e.dataTransfer.setData('text/plain', card.id)
    e.dataTransfer.effectAllowed = 'move'
    onDragStart?.(e)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false)
    onDragEnd?.(e)
  }

  // 计算截止日期状态
  const getDueDateStatus = () => {
    if (!task.endDate) return null
    const now = new Date()
    const dueDate = new Date(task.endDate)
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'overdue'
    if (diffDays <= 3) return 'soon'
    return null
  }

  const dueDateStatus = getDueDateStatus()

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  // 获取优先级类名
  const getPriorityClass = () => {
    switch (task.priority) {
      case 'urgent': return styles.urgent
      case 'high': return styles.high
      case 'medium': return styles.medium
      case 'low': return styles.low
      default: return styles.medium
    }
  }

  return (
    <div
      className={`${styles.card} ${isDragging ? styles.dragging : ''}`}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>{task.name}</div>
        <div className={styles.cardPriority}>
          <Tooltip title={`优先级: ${task.priority}`}>
            <div className={`${styles.priorityDot} ${getPriorityClass()}`} />
          </Tooltip>
        </div>
      </div>

      {task.description && (
        <div className={styles.cardBody}>
          <div className={styles.cardDescription}>{task.description}</div>
        </div>
      )}

      {task.progress > 0 && (
        <div className={styles.cardProgress}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${task.progress}%` }}
            />
          </div>
          <div className={styles.progressText}>{task.progress}%</div>
        </div>
      )}

      <div className={styles.cardFooter}>
        <div className={styles.cardMeta}>
          {task.assigneeName && (
            <div className={styles.cardAssignee}>
              <div className={styles.assigneeAvatar}>
                {task.assigneeAvatar ? (
                  <img src={task.assigneeAvatar} alt={task.assigneeName} />
                ) : (
                  <UserOutlined />
                )}
              </div>
              <span className={styles.assigneeName}>{task.assigneeName}</span>
            </div>
          )}
        </div>

        {task.endDate && (
          <div className={`${styles.cardDueDate} ${dueDateStatus ? styles[dueDateStatus] : ''}`}>
            <CalendarOutlined />
            <span>{formatDate(task.endDate)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * 看板列组件
 */
interface ColumnComponentProps {
  column: KanbanColumnConfig
  cards: KanbanCard[]
  stats: { count: number; wipExceeded: boolean }
  onCardClick?: (task: Task) => void
  onCardDoubleClick?: (task: Task) => void
  onAddTask?: () => void
  showAddButton?: boolean
  showStats?: boolean
  showWipLimit?: boolean
  draggable?: boolean
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent, columnId: string) => void
}

const KanbanColumnComponent: React.FC<ColumnComponentProps> = ({
  column,
  cards,
  stats,
  onCardClick,
  onCardDoubleClick,
  onAddTask,
  showAddButton = true,
  showStats = true,
  showWipLimit = true,
  draggable = true,
  onDragOver,
  onDrop,
}) => {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
    onDragOver?.(e)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    onDrop?.(e, column.id)
  }

  const menuItems: MenuProps['items'] = [
    { key: 'collapse', label: '折叠列' },
    { key: 'sort', label: '排序' },
    { type: 'divider' },
    { key: 'settings', label: '列设置' },
  ]

  return (
    <div className={styles.column}>
      <div className={styles.columnHeader}>
        <div className={styles.columnTitle}>
          <div
            className={styles.columnIndicator}
            style={{ backgroundColor: column.color }}
          />
          <span className={styles.columnName}>{column.title}</span>
          {showStats && (
            <span className={`${styles.columnCount} ${stats.wipExceeded ? styles.exceeded : ''}`}>
              {stats.count}
              {column.limit && showWipLimit && `/${column.limit}`}
            </span>
          )}
        </div>
        <div className={styles.columnActions}>
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </div>
      </div>

      {showWipLimit && stats.wipExceeded && (
        <div className={styles.wipWarning}>
          <WarningOutlined />
          <span>超出 WIP 限制</span>
        </div>
      )}

      <div
        className={`${styles.columnBody} ${isDragOver ? styles.dragOver : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {cards.length === 0 ? (
          <div className={styles.emptyColumn}>
            <div className={styles.emptyIcon}>📋</div>
            <div className={styles.emptyText}>暂无任务</div>
          </div>
        ) : (
          cards.map((card) => (
            <KanbanCardComponent
              key={card.id}
              card={card}
              onClick={() => onCardClick?.(card.task)}
              onDoubleClick={() => onCardDoubleClick?.(card.task)}
              draggable={draggable}
            />
          ))
        )}
      </div>

      {showAddButton && (
        <div className={styles.columnFooter}>
          <button className={styles.addTaskBtn} onClick={onAddTask}>
            <PlusOutlined style={{ marginRight: 4 }} />
            添加任务
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * TaskKanban 主组件
 */
const TaskKanban: React.FC<TaskKanbanProps> = ({
  projectId,
  tasks: propTasks,
  columns: propColumns,
  onDragEnd,
  onCardClick,
  onCardDoubleClick,
  onAddTask,
  showAddButton = true,
  showColumnStats = true,
  showWipLimit = true,
  draggable = true,
  loading = false,
  emptyText = '暂无任务',
  className,
  style,
}) => {
  const {
    columns,
    cardsByColumn,
    columnStats,
    handleDragEnd,
    refresh,
    moveCard,
  } = useTaskKanban({
    projectId,
    tasks: propTasks,
    columns: propColumns,
    onDragEnd,
  })

  const [draggedCardId, setDraggedCardId] = useState<string | null>(null)
  const [sourceColumnId, setSourceColumnId] = useState<string | null>(null)

  // 处理拖拽开始
  const handleCardDragStart = useCallback((cardId: string, columnId: string) => {
    setDraggedCardId(cardId)
    setSourceColumnId(columnId)
  }, [])

  // 处理放置
  const handleColumnDrop = useCallback(
    async (e: React.DragEvent, targetColumnId: string) => {
      const cardId = e.dataTransfer.getData('text/plain')
      if (!cardId || !sourceColumnId) return

      if (sourceColumnId === targetColumnId) {
        // 同列内排序，暂不处理
        return
      }

      // 构建拖拽结果
      const result: DragResult = {
        cardId,
        sourceColumnId,
        destinationColumnId: targetColumnId,
        sourceIndex: 0,
        destinationIndex: 0,
      }

      try {
        await handleDragEnd(result)
        message.success('任务状态已更新')
      } catch (error) {
        message.error('更新失败')
      }

      setDraggedCardId(null)
      setSourceColumnId(null)
    },
    [sourceColumnId, handleDragEnd]
  )

  // 计算总任务数
  const totalTasks = useMemo(() => {
    return Object.values(cardsByColumn).reduce((sum, cards) => sum + cards.length, 0)
  }, [cardsByColumn])

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  if (totalTasks === 0 && !loading) {
    return (
      <div className={`${styles.kanbanContainer} ${className || ''}`} style={style}>
        <Empty description={emptyText} />
      </div>
    )
  }

  return (
    <div className={`${styles.kanbanContainer} ${className || ''}`} style={style}>
      <div className={styles.kanbanHeader}>
        <div className={styles.kanbanTitle}>任务看板</div>
        <div className={styles.kanbanActions}>
          <Tooltip title="刷新">
            <Button type="text" icon={<ReloadOutlined />} onClick={refresh} />
          </Tooltip>
          <Tooltip title="设置">
            <Button type="text" icon={<SettingOutlined />} />
          </Tooltip>
        </div>
      </div>

      <div className={styles.kanbanBody}>
        {columns.map((column) => (
          <KanbanColumnComponent
            key={column.id}
            column={column}
            cards={cardsByColumn[column.id] || []}
            stats={columnStats[column.id] || { count: 0, wipExceeded: false }}
            onCardClick={onCardClick}
            onCardDoubleClick={onCardDoubleClick}
            onAddTask={() => onAddTask?.(column.id)}
            showAddButton={showAddButton}
            showStats={showColumnStats}
            showWipLimit={showWipLimit}
            draggable={draggable}
            onDrop={handleColumnDrop}
          />
        ))}
      </div>
    </div>
  )
}

export default TaskKanban
export type { TaskKanbanProps } from './types'
export { useTaskKanban, useColumnSort, useKanbanFilter } from './useTaskKanban'