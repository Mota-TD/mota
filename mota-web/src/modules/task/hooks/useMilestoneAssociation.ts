/**
 * 任务与里程碑关联 Hook
 */

import { useCallback, useMemo, useEffect } from 'react'
import { message } from 'antd'
import type { Task, DepartmentTask } from '../types'
import { useTaskStore } from '../store/taskStore'
import { useMilestoneStore } from '../../milestone/store/milestoneStore'
import { MilestoneStatus } from '@/services/api/milestone'
import type { Milestone } from '../../milestone/types'

interface UseMilestoneAssociationOptions {
  projectId: string
}

interface MilestoneWithTasks extends Milestone {
  departmentTasks: DepartmentTask[]
  taskCount: number
  completedTaskCount: number
  progress: number
}

interface UseMilestoneAssociationReturn {
  /** 里程碑列表（带关联任务） */
  milestonesWithTasks: MilestoneWithTasks[]
  /** 未关联里程碑的部门任务 */
  unassociatedDepartmentTasks: DepartmentTask[]
  /** 加载状态 */
  loading: boolean
  /** 刷新数据 */
  refresh: () => Promise<void>
  /** 将部门任务关联到里程碑 */
  associateToMilestone: (departmentTaskId: string, milestoneId: string) => Promise<void>
  /** 取消部门任务与里程碑的关联 */
  disassociateFromMilestone: (departmentTaskId: string) => Promise<void>
  /** 获取里程碑下的所有任务 */
  getTasksByMilestone: (milestoneId: string) => Task[]
  /** 计算里程碑进度 */
  calculateMilestoneProgress: (milestoneId: string) => number
}

/**
 * 任务与里程碑关联 Hook
 */
export function useMilestoneAssociation(
  options: UseMilestoneAssociationOptions
): UseMilestoneAssociationReturn {
  const { projectId } = options

  // 从 store 获取数据
  const milestones = useMilestoneStore((state) => state.milestones)
  const fetchMilestones = useMilestoneStore((state) => state.fetchMilestones)
  const milestoneLoading = useMilestoneStore((state) => state.loading)

  const departmentTasks = useTaskStore((state) => state.departmentTasks)
  const tasks = useTaskStore((state) => state.tasks)
  const fetchDepartmentTasks = useTaskStore((state) => state.fetchDepartmentTasks)
  const updateDepartmentTask = useTaskStore((state) => state.updateDepartmentTask)
  const taskLoading = useTaskStore((state) => state.loading)

  // 加载数据
  useEffect(() => {
    if (projectId) {
      fetchMilestones(projectId)
      fetchDepartmentTasks(projectId)
    }
  }, [projectId, fetchMilestones, fetchDepartmentTasks])

  // 计算里程碑进度
  const calculateMilestoneProgress = useCallback(
    (milestoneId: string): number => {
      const milestoneDeptTasks = departmentTasks.filter(
        (dt) => dt.milestoneId === milestoneId
      )

      if (milestoneDeptTasks.length === 0) return 0

      const totalProgress = milestoneDeptTasks.reduce(
        (sum, dt) => sum + (dt.progress || 0),
        0
      )

      return Math.round(totalProgress / milestoneDeptTasks.length)
    },
    [departmentTasks]
  )

  // 获取里程碑下的所有执行任务
  const getTasksByMilestone = useCallback(
    (milestoneId: string): Task[] => {
      const milestoneDeptTaskIds = departmentTasks
        .filter((dt) => dt.milestoneId === milestoneId)
        .map((dt) => dt.id)

      return tasks.filter((t) => milestoneDeptTaskIds.includes(t.departmentTaskId))
    },
    [departmentTasks, tasks]
  )

  // 构建带任务的里程碑列表
  const milestonesWithTasks = useMemo<MilestoneWithTasks[]>(() => {
    return milestones.map((milestone) => {
      const milestoneDeptTasks = departmentTasks.filter(
        (dt) => dt.milestoneId === milestone.id
      )

      const milestoneTasks = getTasksByMilestone(milestone.id)
      const completedTasks = milestoneTasks.filter((t) => t.status === 'completed')

      return {
        ...milestone,
        departmentTasks: milestoneDeptTasks,
        taskCount: milestoneTasks.length,
        completedTaskCount: completedTasks.length,
        progress: calculateMilestoneProgress(milestone.id),
      }
    })
  }, [milestones, departmentTasks, getTasksByMilestone, calculateMilestoneProgress])

  // 未关联里程碑的部门任务
  const unassociatedDepartmentTasks = useMemo(() => {
    return departmentTasks.filter((dt) => !dt.milestoneId)
  }, [departmentTasks])

  // 刷新数据
  const refresh = useCallback(async () => {
    await Promise.all([
      fetchMilestones(projectId),
      fetchDepartmentTasks(projectId),
    ])
  }, [projectId, fetchMilestones, fetchDepartmentTasks])

  // 将部门任务关联到里程碑
  // 注意：API 的 UpdateDepartmentTaskRequest 不包含 milestoneId，
  // 但 DepartmentTask 接口有此字段，使用类型断言处理
  const associateToMilestone = useCallback(
    async (departmentTaskId: string, milestoneId: string) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await updateDepartmentTask(departmentTaskId, { milestoneId } as any)
        message.success('已关联到里程碑')
      } catch (error) {
        message.error('关联失败')
        throw error
      }
    },
    [updateDepartmentTask]
  )

  // 取消部门任务与里程碑的关联
  const disassociateFromMilestone = useCallback(
    async (departmentTaskId: string) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await updateDepartmentTask(departmentTaskId, { milestoneId: null } as any)
        message.success('已取消关联')
      } catch (error) {
        message.error('取消关联失败')
        throw error
      }
    },
    [updateDepartmentTask]
  )

  return {
    milestonesWithTasks,
    unassociatedDepartmentTasks,
    loading: milestoneLoading || taskLoading,
    refresh,
    associateToMilestone,
    disassociateFromMilestone,
    getTasksByMilestone,
    calculateMilestoneProgress,
  }
}

/**
 * 里程碑进度统计 Hook
 */
export function useMilestoneProgress(milestoneId: string) {
  const departmentTasks = useTaskStore((state) => state.departmentTasks)
  const tasks = useTaskStore((state) => state.tasks)

  return useMemo(() => {
    // 获取里程碑下的部门任务
    const milestoneDeptTasks = departmentTasks.filter(
      (dt) => dt.milestoneId === milestoneId
    )

    // 获取里程碑下的所有执行任务
    const deptTaskIds = milestoneDeptTasks.map((dt) => dt.id)
    const milestoneTasks = tasks.filter((t) => deptTaskIds.includes(t.departmentTaskId))

    // 统计
    const stats = {
      departmentTaskCount: milestoneDeptTasks.length,
      taskCount: milestoneTasks.length,
      completedTaskCount: milestoneTasks.filter((t) => t.status === 'completed').length,
      inProgressTaskCount: milestoneTasks.filter((t) => t.status === 'in_progress').length,
      pendingTaskCount: milestoneTasks.filter((t) => t.status === 'pending').length,
      progress: 0,
      isCompleted: false,
      isOverdue: false,
    }

    // 计算进度
    if (milestoneDeptTasks.length > 0) {
      const totalProgress = milestoneDeptTasks.reduce(
        (sum, dt) => sum + (dt.progress || 0),
        0
      )
      stats.progress = Math.round(totalProgress / milestoneDeptTasks.length)
    }

    // 检查是否完成
    stats.isCompleted = stats.progress === 100

    return stats
  }, [milestoneId, departmentTasks, tasks])
}

/**
 * 里程碑时间线 Hook
 */
export function useMilestoneTimeline(projectId: string) {
  const milestones = useMilestoneStore((state) => state.milestones)
  const departmentTasks = useTaskStore((state) => state.departmentTasks)

  return useMemo(() => {
    // 按目标日期排序
    const sortedMilestones = [...milestones].sort((a, b) => {
      const dateA = new Date(a.targetDate || 0).getTime()
      const dateB = new Date(b.targetDate || 0).getTime()
      return dateA - dateB
    })

    // 构建时间线数据
    return sortedMilestones.map((milestone) => {
      const milestoneDeptTasks = departmentTasks.filter(
        (dt) => dt.milestoneId === milestone.id
      )

      const totalProgress = milestoneDeptTasks.length > 0
        ? milestoneDeptTasks.reduce((sum, dt) => sum + (dt.progress || 0), 0) / milestoneDeptTasks.length
        : 0

      const now = new Date()
      const targetDate = milestone.targetDate ? new Date(milestone.targetDate) : null
      const isOverdue = targetDate ? now > targetDate && totalProgress < 100 : false

      return {
        id: milestone.id,
        name: milestone.name,
        targetDate: milestone.targetDate,
        status: milestone.status,
        progress: Math.round(totalProgress),
        departmentTaskCount: milestoneDeptTasks.length,
        isOverdue,
        // MilestoneStatus 只有 PENDING, COMPLETED, DELAYED
        // PENDING 且有进度表示进行中
        isCurrent: milestone.status === MilestoneStatus.PENDING && totalProgress > 0,
        isCompleted: milestone.status === MilestoneStatus.COMPLETED,
      }
    })
  }, [milestones, departmentTasks])
}

/**
 * 部门任务里程碑选择 Hook
 */
export function useMilestoneSelector(projectId: string) {
  const milestones = useMilestoneStore((state) => state.milestones)
  const fetchMilestones = useMilestoneStore((state) => state.fetchMilestones)
  const loading = useMilestoneStore((state) => state.loading)

  useEffect(() => {
    if (projectId) {
      fetchMilestones(projectId)
    }
  }, [projectId, fetchMilestones])

  const options = useMemo(() => {
    // MilestoneStatus 只有 PENDING, COMPLETED, DELAYED
    // 排除已完成的里程碑
    return milestones
      .filter((m) => m.status !== MilestoneStatus.COMPLETED)
      .map((m) => ({
        label: m.name,
        value: m.id,
        targetDate: m.targetDate,
      }))
  }, [milestones])

  return {
    options,
    loading,
  }
}