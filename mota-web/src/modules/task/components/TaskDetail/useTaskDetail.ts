/**
 * TaskDetail 数据处理 Hook
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Task, Subtask, TaskComment, TaskAttachment, TaskTimeLog } from '../../types'
import { TaskStatus } from '../../types'
import type { TaskDetailData, TaskDetailTab, SubtaskActions, CommentActions, AttachmentActions, TimeLogActions } from './types'
import { useTaskStore } from '../../store/taskStore'

interface UseTaskDetailOptions {
  taskId: string
  task?: Task
}

interface UseTaskDetailReturn {
  /** 任务详情数据 */
  data: TaskDetailData
  /** 当前 Tab */
  activeTab: TaskDetailTab
  /** 设置当前 Tab */
  setActiveTab: (tab: TaskDetailTab) => void
  /** 刷新数据 */
  refresh: () => Promise<void>
  /** 更新任务 */
  updateTask: (data: Partial<Task>) => Promise<void>
  /** 更新任务状态 */
  updateStatus: (status: TaskStatus) => Promise<void>
  /** 删除任务 */
  deleteTask: () => Promise<void>
  /** 子任务操作 */
  subtaskActions: SubtaskActions
  /** 评论操作 */
  commentActions: CommentActions
  /** 附件操作 */
  attachmentActions: AttachmentActions
  /** 时间日志操作 */
  timeLogActions: TimeLogActions
  /** 是否正在保存 */
  saving: boolean
}

/**
 * TaskDetail 数据处理 Hook
 */
export function useTaskDetail(options: UseTaskDetailOptions): UseTaskDetailReturn {
  const { taskId, task: propTask } = options

  const [activeTab, setActiveTab] = useState<TaskDetailTab>('overview')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 子任务、评论、附件、时间日志状态
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [comments, setComments] = useState<TaskComment[]>([])
  const [attachments, setAttachments] = useState<TaskAttachment[]>([])
  const [timeLogs, setTimeLogs] = useState<TaskTimeLog[]>([])

  // 从 store 获取任务
  const storeTask = useTaskStore((state) => state.tasks.find((t) => t.id === taskId))
  const currentTask = useTaskStore((state) => state.currentTask)
  const fetchTaskDetail = useTaskStore((state) => state.fetchTaskDetail)
  const updateTaskInStore = useTaskStore((state) => state.updateTask)
  const updateTaskStatusInStore = useTaskStore((state) => state.updateTaskStatus)
  const deleteTaskFromStore = useTaskStore((state) => state.deleteTask)

  // 使用传入的任务或 store 中的任务
  const task = propTask || storeTask || currentTask || null

  // 加载任务详情
  const loadTaskDetail = useCallback(async () => {
    if (!taskId) return

    setLoading(true)
    setError(null)

    try {
      // 如果没有任务数据，从 API 获取
      if (!task) {
        await fetchTaskDetail(taskId)
      }

      // TODO: 加载子任务、评论、附件、时间日志
      // 这里暂时使用模拟数据
      setSubtasks([])
      setComments([])
      setAttachments([])
      setTimeLogs([])
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [taskId, task, fetchTaskDetail])

  // 初始加载
  useEffect(() => {
    loadTaskDetail()
  }, [loadTaskDetail])

  // 刷新数据
  const refresh = useCallback(async () => {
    await loadTaskDetail()
  }, [loadTaskDetail])

  // 更新任务
  const updateTask = useCallback(
    async (data: Partial<Task>) => {
      if (!taskId) return

      setSaving(true)
      try {
        await updateTaskInStore(taskId, data)
      } finally {
        setSaving(false)
      }
    },
    [taskId, updateTaskInStore]
  )

  // 更新任务状态
  const updateStatus = useCallback(
    async (status: TaskStatus) => {
      if (!taskId) return

      setSaving(true)
      try {
        await updateTaskStatusInStore(taskId, status)
      } finally {
        setSaving(false)
      }
    },
    [taskId, updateTaskStatusInStore]
  )

  // 删除任务
  const deleteTask = useCallback(async () => {
    if (!taskId) return

    setSaving(true)
    try {
      await deleteTaskFromStore(taskId)
    } finally {
      setSaving(false)
    }
  }, [taskId, deleteTaskFromStore])

  // 子任务操作
  const subtaskActions: SubtaskActions = useMemo(
    () => ({
      add: async (name: string) => {
        // TODO: 调用 API 添加子任务
        const newSubtask: Subtask = {
          id: `subtask-${Date.now()}`,
          taskId,
          name,
          completed: false,
          sortOrder: subtasks.length,
          createdAt: new Date().toISOString(),
        }
        setSubtasks((prev) => [...prev, newSubtask])
      },
      update: async (id: string, data: Partial<Subtask>) => {
        // TODO: 调用 API 更新子任务
        setSubtasks((prev) =>
          prev.map((s) => (s.id === id ? { ...s, ...data } : s))
        )
      },
      delete: async (id: string) => {
        // TODO: 调用 API 删除子任务
        setSubtasks((prev) => prev.filter((s) => s.id !== id))
      },
      toggle: async (id: string) => {
        // TODO: 调用 API 切换子任务状态
        setSubtasks((prev) =>
          prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
        )
      },
      reorder: async (ids: string[]) => {
        // TODO: 调用 API 重新排序
        const reordered = ids.map((id, index) => {
          const subtask = subtasks.find((s) => s.id === id)
          return subtask ? { ...subtask, sortOrder: index } : null
        }).filter(Boolean) as Subtask[]
        setSubtasks(reordered)
      },
    }),
    [taskId, subtasks]
  )

  // 评论操作
  const commentActions: CommentActions = useMemo(
    () => ({
      add: async (content: string) => {
        // TODO: 调用 API 添加评论
        const newComment: TaskComment = {
          id: `comment-${Date.now()}`,
          taskId,
          userId: 'current-user',
          userName: '当前用户',
          content,
          createdAt: new Date().toISOString(),
        }
        setComments((prev) => [...prev, newComment])
      },
      update: async (id: string, content: string) => {
        // TODO: 调用 API 更新评论
        setComments((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, content, updatedAt: new Date().toISOString() } : c
          )
        )
      },
      delete: async (id: string) => {
        // TODO: 调用 API 删除评论
        setComments((prev) => prev.filter((c) => c.id !== id))
      },
    }),
    [taskId]
  )

  // 附件操作
  const attachmentActions: AttachmentActions = useMemo(
    () => ({
      upload: async (file: File) => {
        // TODO: 调用 API 上传附件
        const newAttachment: TaskAttachment = {
          id: `attachment-${Date.now()}`,
          taskId,
          fileName: file.name,
          fileUrl: URL.createObjectURL(file),
          fileSize: file.size,
          fileType: file.type,
          uploadedBy: 'current-user',
          uploadedAt: new Date().toISOString(),
        }
        setAttachments((prev) => [...prev, newAttachment])
      },
      delete: async (id: string) => {
        // TODO: 调用 API 删除附件
        setAttachments((prev) => prev.filter((a) => a.id !== id))
      },
      download: (id: string) => {
        const attachment = attachments.find((a) => a.id === id)
        if (attachment) {
          window.open(attachment.fileUrl, '_blank')
        }
      },
    }),
    [taskId, attachments]
  )

  // 时间日志操作
  const timeLogActions: TimeLogActions = useMemo(
    () => ({
      add: async (data: { startTime: string; endTime?: string; description?: string }) => {
        // TODO: 调用 API 添加时间日志
        const startDate = new Date(data.startTime)
        const endDate = data.endTime ? new Date(data.endTime) : new Date()
        const duration = Math.round((endDate.getTime() - startDate.getTime()) / 60000)

        const newTimeLog: TaskTimeLog = {
          id: `timelog-${Date.now()}`,
          taskId,
          userId: 'current-user',
          userName: '当前用户',
          startTime: data.startTime,
          endTime: data.endTime,
          duration,
          description: data.description,
          createdAt: new Date().toISOString(),
        }
        setTimeLogs((prev) => [...prev, newTimeLog])
      },
      update: async (id: string, data: Partial<TaskTimeLog>) => {
        // TODO: 调用 API 更新时间日志
        setTimeLogs((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...data } : t))
        )
      },
      delete: async (id: string) => {
        // TODO: 调用 API 删除时间日志
        setTimeLogs((prev) => prev.filter((t) => t.id !== id))
      },
    }),
    [taskId]
  )

  // 组装详情数据
  const data: TaskDetailData = useMemo(
    () => ({
      task,
      subtasks,
      comments,
      attachments,
      timeLogs,
      loading,
      error,
    }),
    [task, subtasks, comments, attachments, timeLogs, loading, error]
  )

  return {
    data,
    activeTab,
    setActiveTab,
    refresh,
    updateTask,
    updateStatus,
    deleteTask,
    subtaskActions,
    commentActions,
    attachmentActions,
    timeLogActions,
    saving,
  }
}

/**
 * 计算任务完成度
 */
export function useTaskProgress(subtasks: Subtask[]) {
  return useMemo(() => {
    if (subtasks.length === 0) return 0
    const completed = subtasks.filter((s) => s.completed).length
    return Math.round((completed / subtasks.length) * 100)
  }, [subtasks])
}

/**
 * 计算总工时
 */
export function useTotalTimeSpent(timeLogs: TaskTimeLog[]) {
  return useMemo(() => {
    const totalMinutes = timeLogs.reduce((sum, log) => sum + log.duration, 0)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return { hours, minutes, totalMinutes }
  }, [timeLogs])
}