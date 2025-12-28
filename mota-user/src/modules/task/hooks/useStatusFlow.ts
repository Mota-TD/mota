/**
 * 任务状态流转 Hook
 */

import { useCallback, useMemo } from 'react'
import { message, Modal } from 'antd'
import { TaskStatus } from '../types'
import { useTaskStore } from '../store/taskStore'
import {
  getAvailableTransitions,
  isValidTransition,
  getStatusLabel,
  getTransitionSideEffects,
  validateBatchTransition,
  StatusTransitionError,
} from '../utils/statusFlow'
import type { StatusTransitionAction } from '../utils/statusFlow'

interface UseStatusFlowOptions {
  taskId: string
  currentStatus: TaskStatus
  onStatusChange?: (newStatus: TaskStatus) => void
}

interface UseStatusFlowReturn {
  /** 当前状态 */
  currentStatus: TaskStatus
  /** 当前状态标签 */
  currentStatusLabel: string
  /** 可用的状态转换 */
  availableTransitions: StatusTransitionAction[]
  /** 执行状态转换 */
  transition: (targetStatus: TaskStatus) => Promise<boolean>
  /** 快捷操作：开始任务 */
  start: () => Promise<boolean>
  /** 快捷操作：暂停任务 */
  pause: () => Promise<boolean>
  /** 快捷操作：继续任务 */
  resume: () => Promise<boolean>
  /** 快捷操作：完成任务 */
  complete: () => Promise<boolean>
  /** 快捷操作：取消任务 */
  cancel: () => Promise<boolean>
  /** 是否可以开始 */
  canStart: boolean
  /** 是否可以暂停 */
  canPause: boolean
  /** 是否可以继续 */
  canResume: boolean
  /** 是否可以完成 */
  canComplete: boolean
  /** 是否可以取消 */
  canCancel: boolean
  /** 是否正在处理 */
  loading: boolean
}

/**
 * 任务状态流转 Hook
 */
export function useStatusFlow(options: UseStatusFlowOptions): UseStatusFlowReturn {
  const { taskId, currentStatus, onStatusChange } = options

  const updateTaskStatus = useTaskStore((state) => state.updateTaskStatus)
  const loading = useTaskStore((state) => state.loading)

  // 获取可用的状态转换
  const availableTransitions = useMemo(() => {
    return getAvailableTransitions(currentStatus)
  }, [currentStatus])

  // 检查是否可以转换到特定状态
  const canTransitionTo = useCallback(
    (targetStatus: TaskStatus) => {
      return isValidTransition(currentStatus, targetStatus)
    },
    [currentStatus]
  )

  // 执行状态转换
  const transition = useCallback(
    async (targetStatus: TaskStatus): Promise<boolean> => {
      // 验证转换是否有效
      if (!isValidTransition(currentStatus, targetStatus)) {
        message.error(`无法从"${getStatusLabel(currentStatus)}"转换到"${getStatusLabel(targetStatus)}"`)
        return false
      }

      // 获取转换动作配置
      const transitionAction = availableTransitions.find((t) => t.to === targetStatus)

      // 如果需要确认
      if (transitionAction?.confirm) {
        return new Promise((resolve) => {
          Modal.confirm({
            title: '确认操作',
            content: transitionAction.confirmMessage,
            okText: '确认',
            cancelText: '取消',
            onOk: async () => {
              try {
                await updateTaskStatus(taskId, targetStatus)
                
                // 获取副作用
                const sideEffects = getTransitionSideEffects(currentStatus, targetStatus)
                
                // 显示成功消息
                message.success(`任务已${getStatusLabel(targetStatus)}`)
                
                // 触发回调
                onStatusChange?.(targetStatus)
                
                resolve(true)
              } catch (error) {
                message.error(error instanceof Error ? error.message : '操作失败')
                resolve(false)
              }
            },
            onCancel: () => {
              resolve(false)
            },
          })
        })
      }

      // 直接执行转换
      try {
        await updateTaskStatus(taskId, targetStatus)
        message.success(`任务已${getStatusLabel(targetStatus)}`)
        onStatusChange?.(targetStatus)
        return true
      } catch (error) {
        message.error(error instanceof Error ? error.message : '操作失败')
        return false
      }
    },
    [taskId, currentStatus, availableTransitions, updateTaskStatus, onStatusChange]
  )

  // 快捷操作
  const start = useCallback(() => transition(TaskStatus.IN_PROGRESS), [transition])
  const pause = useCallback(() => transition(TaskStatus.PAUSED), [transition])
  const resume = useCallback(() => transition(TaskStatus.IN_PROGRESS), [transition])
  const complete = useCallback(() => transition(TaskStatus.COMPLETED), [transition])
  const cancel = useCallback(() => transition(TaskStatus.CANCELLED), [transition])

  return {
    currentStatus,
    currentStatusLabel: getStatusLabel(currentStatus),
    availableTransitions,
    transition,
    start,
    pause,
    resume,
    complete,
    cancel,
    canStart: canTransitionTo(TaskStatus.IN_PROGRESS) && currentStatus === TaskStatus.PENDING,
    canPause: canTransitionTo(TaskStatus.PAUSED),
    canResume: canTransitionTo(TaskStatus.IN_PROGRESS) && currentStatus === TaskStatus.PAUSED,
    canComplete: canTransitionTo(TaskStatus.COMPLETED),
    canCancel: canTransitionTo(TaskStatus.CANCELLED),
    loading,
  }
}

/**
 * 批量状态转换 Hook
 */
export function useBatchStatusFlow() {
  const updateTaskStatus = useTaskStore((state) => state.updateTaskStatus)
  const loading = useTaskStore((state) => state.loading)

  const batchTransition = useCallback(
    async (
      tasks: { id: string; status: TaskStatus }[],
      targetStatus: TaskStatus
    ): Promise<{ success: number; failed: number }> => {
      // 验证批量转换
      const { valid, invalid } = validateBatchTransition(tasks, targetStatus)

      if (invalid.length > 0) {
        message.warning(`${invalid.length} 个任务无法转换状态`)
      }

      if (valid.length === 0) {
        return { success: 0, failed: invalid.length }
      }

      // 确认操作
      return new Promise((resolve) => {
        Modal.confirm({
          title: '批量更新状态',
          content: `确定要将 ${valid.length} 个任务的状态更改为"${getStatusLabel(targetStatus)}"吗？`,
          okText: '确认',
          cancelText: '取消',
          onOk: async () => {
            let success = 0
            let failed = invalid.length

            for (const task of valid) {
              try {
                await updateTaskStatus(task.id, targetStatus)
                success++
              } catch {
                failed++
              }
            }

            if (success > 0) {
              message.success(`成功更新 ${success} 个任务`)
            }
            if (failed > 0) {
              message.error(`${failed} 个任务更新失败`)
            }

            resolve({ success, failed })
          },
          onCancel: () => {
            resolve({ success: 0, failed: tasks.length })
          },
        })
      })
    },
    [updateTaskStatus]
  )

  return {
    batchTransition,
    loading,
  }
}

/**
 * 状态统计 Hook
 */
export function useStatusStats(tasks: { status: TaskStatus }[]) {
  return useMemo(() => {
    const stats = {
      total: tasks.length,
      pending: 0,
      inProgress: 0,
      paused: 0,
      completed: 0,
      cancelled: 0,
      completionRate: 0,
    }

    tasks.forEach((task) => {
      switch (task.status) {
        case TaskStatus.PENDING:
          stats.pending++
          break
        case TaskStatus.IN_PROGRESS:
          stats.inProgress++
          break
        case TaskStatus.PAUSED:
          stats.paused++
          break
        case TaskStatus.COMPLETED:
          stats.completed++
          break
        case TaskStatus.CANCELLED:
          stats.cancelled++
          break
      }
    })

    // 计算完成率（不包括已取消的任务）
    const activeTasks = stats.total - stats.cancelled
    stats.completionRate = activeTasks > 0 ? Math.round((stats.completed / activeTasks) * 100) : 0

    return stats
  }, [tasks])
}