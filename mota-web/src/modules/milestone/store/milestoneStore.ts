/**
 * 里程碑状态管理
 * 使用 Zustand 进行状态管理
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import * as milestoneApi from '@/services/api/milestone'
import type {
  Milestone,
  MilestoneAssignee,
  MilestoneTask,
  MilestoneStatistics,
} from '../types'
import { MilestoneStatus } from '../types'

// ==================== 状态接口 ====================

interface MilestoneFilters {
  projectId: string | null
  status: string // 'all' | MilestoneStatus
  isOverdue: boolean | null
  isUpcoming: boolean | null
}

interface MilestoneState {
  // 里程碑列表
  milestones: Milestone[]
  currentMilestone: Milestone | null
  
  // 负责人
  assignees: MilestoneAssignee[]
  
  // 任务
  tasks: MilestoneTask[]
  currentTask: MilestoneTask | null
  
  // 加载状态
  loading: boolean
  detailLoading: boolean
  taskLoading: boolean
  error: string | null
  
  // 筛选
  filters: MilestoneFilters
  
  // 统计
  statistics: MilestoneStatistics | null
  
  // ==================== 操作方法 ====================
  
  // 里程碑操作
  fetchMilestones: (projectId: string) => Promise<void>
  fetchMilestoneDetail: (id: string) => Promise<void>
  createMilestone: (data: milestoneApi.CreateMilestoneRequest) => Promise<Milestone>
  updateMilestone: (id: string, data: milestoneApi.UpdateMilestoneRequest) => Promise<void>
  deleteMilestone: (id: string) => Promise<void>
  completeMilestone: (id: string) => Promise<void>
  delayMilestone: (id: string) => Promise<void>
  reorderMilestones: (projectId: string, milestoneIds: string[]) => Promise<void>
  
  // 即将到期和已延期
  fetchUpcomingMilestones: (projectId: string, days?: number) => Promise<void>
  fetchDelayedMilestones: (projectId: string) => Promise<void>
  
  // 负责人操作
  fetchAssignees: (milestoneId: string) => Promise<void>
  updateAssignees: (milestoneId: string, assigneeIds: string[]) => Promise<void>
  addAssignee: (milestoneId: string, userId: string, isPrimary?: boolean) => Promise<void>
  removeAssignee: (milestoneId: string, userId: string) => Promise<void>
  
  // 任务操作
  fetchTasks: (milestoneId: string) => Promise<void>
  fetchTaskDetail: (taskId: string) => Promise<void>
  createTask: (milestoneId: string, task: Partial<MilestoneTask>) => Promise<MilestoneTask>
  createSubTask: (taskId: string, task: Partial<MilestoneTask>) => Promise<MilestoneTask>
  updateTask: (taskId: string, task: Partial<MilestoneTask>) => Promise<void>
  updateTaskProgress: (taskId: string, progress: number) => Promise<void>
  completeTask: (taskId: string) => Promise<void>
  assignTask: (taskId: string, userId: string) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  
  // 筛选
  setFilters: (filters: Partial<MilestoneFilters>) => void
  clearFilters: () => void
  
  // 统计
  calculateStatistics: (milestone: Milestone) => MilestoneStatistics
  
  // 错误处理
  clearError: () => void
  
  // 重置
  reset: () => void
}

// ==================== 初始状态 ====================

const initialFilters: MilestoneFilters = {
  projectId: null,
  status: 'all',
  isOverdue: null,
  isUpcoming: null
}

const initialState = {
  milestones: [] as Milestone[],
  currentMilestone: null as Milestone | null,
  assignees: [] as MilestoneAssignee[],
  tasks: [] as MilestoneTask[],
  currentTask: null as MilestoneTask | null,
  loading: false,
  detailLoading: false,
  taskLoading: false,
  error: null as string | null,
  filters: initialFilters,
  statistics: null as MilestoneStatistics | null
}

// ==================== 创建 Store ====================

export const useMilestoneStore = create<MilestoneState>()(
  devtools(
    immer((set, get) => ({
      ...initialState,
      
      // ==================== 里程碑操作 ====================
      
      fetchMilestones: async (projectId) => {
        set({ loading: true, error: null })
        try {
          const milestones = await milestoneApi.getMilestonesByProjectId(projectId)
          set({ milestones: (milestones || []) as Milestone[], loading: false })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '加载里程碑失败'
          set({ error: errorMessage, loading: false })
        }
      },
      
      fetchMilestoneDetail: async (id) => {
        set({ detailLoading: true, error: null })
        try {
          const milestone = await milestoneApi.getMilestoneById(id)
          set({ currentMilestone: milestone as Milestone, detailLoading: false })
          
          // 同时加载负责人和任务
          const [assignees, tasks] = await Promise.all([
            milestoneApi.getMilestoneAssignees(id),
            milestoneApi.getMilestoneTasks(id)
          ])
          set({ 
            assignees: (assignees || []) as MilestoneAssignee[], 
            tasks: (tasks || []) as MilestoneTask[] 
          })
          
          // 计算统计数据
          const statistics = get().calculateStatistics(milestone as Milestone)
          set({ statistics })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '加载里程碑详情失败'
          set({ error: errorMessage, detailLoading: false })
        }
      },
      
      createMilestone: async (data) => {
        set({ loading: true, error: null })
        try {
          const milestone = await milestoneApi.createMilestone(data)
          set((state) => {
            state.milestones.push(milestone as Milestone)
            state.loading = false
          })
          return milestone as Milestone
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '创建里程碑失败'
          set({ error: errorMessage, loading: false })
          throw error
        }
      },
      
      updateMilestone: async (id, data) => {
        try {
          await milestoneApi.updateMilestone(id, data)
          set((state) => {
            const idx = state.milestones.findIndex((m: Milestone) => m.id === id)
            if (idx !== -1) {
              state.milestones[idx] = { ...state.milestones[idx], ...data }
            }
            if (state.currentMilestone?.id === id) {
              state.currentMilestone = { ...state.currentMilestone, ...data }
            }
          })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '更新里程碑失败'
          set({ error: errorMessage })
          throw error
        }
      },
      
      deleteMilestone: async (id) => {
        try {
          await milestoneApi.deleteMilestone(id)
          set((state) => {
            state.milestones = state.milestones.filter((m: Milestone) => m.id !== id)
            if (state.currentMilestone?.id === id) {
              state.currentMilestone = null
            }
          })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '删除里程碑失败'
          set({ error: errorMessage })
          throw error
        }
      },
      
      completeMilestone: async (id) => {
        const { milestones } = get()
        const originalMilestone = milestones.find((m: Milestone) => m.id === id)
        
        // 乐观更新
        set((state) => {
          const milestone = state.milestones.find((m: Milestone) => m.id === id)
          if (milestone) {
            milestone.status = MilestoneStatus.COMPLETED
            milestone.completedAt = new Date().toISOString()
          }
        })
        
        try {
          await milestoneApi.completeMilestone(id)
        } catch (error: unknown) {
          // 回滚
          if (originalMilestone) {
            set((state) => {
              const milestone = state.milestones.find((m: Milestone) => m.id === id)
              if (milestone) {
                milestone.status = originalMilestone.status
                milestone.completedAt = originalMilestone.completedAt
              }
            })
          }
          const errorMessage = error instanceof Error ? error.message : '完成里程碑失败'
          set({ error: errorMessage })
          throw error
        }
      },
      
      delayMilestone: async (id) => {
        const { milestones } = get()
        const originalMilestone = milestones.find((m: Milestone) => m.id === id)
        
        // 乐观更新
        set((state) => {
          const milestone = state.milestones.find((m: Milestone) => m.id === id)
          if (milestone) {
            milestone.status = MilestoneStatus.DELAYED
          }
        })
        
        try {
          await milestoneApi.delayMilestone(id)
        } catch (error: unknown) {
          // 回滚
          if (originalMilestone) {
            set((state) => {
              const milestone = state.milestones.find((m: Milestone) => m.id === id)
              if (milestone) {
                milestone.status = originalMilestone.status
              }
            })
          }
          const errorMessage = error instanceof Error ? error.message : '标记延期失败'
          set({ error: errorMessage })
          throw error
        }
      },
      
      reorderMilestones: async (projectId, milestoneIds) => {
        const { milestones } = get()
        const originalOrder = [...milestones]
        
        // 乐观更新
        set((state) => {
          const reordered = milestoneIds
            .map((id: string) => state.milestones.find((m: Milestone) => m.id === id))
            .filter(Boolean) as Milestone[]
          state.milestones = reordered
        })
        
        try {
          await milestoneApi.reorderMilestones(projectId, milestoneIds)
        } catch (error: unknown) {
          // 回滚
          set({ milestones: originalOrder })
          const errorMessage = error instanceof Error ? error.message : '重新排序失败'
          set({ error: errorMessage })
          throw error
        }
      },
      
      // ==================== 即将到期和已延期 ====================
      
      fetchUpcomingMilestones: async (projectId, days = 7) => {
        set({ loading: true, error: null })
        try {
          const milestones = await milestoneApi.getUpcomingMilestones(projectId, days)
          set({ milestones: (milestones || []) as Milestone[], loading: false })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '加载即将到期里程碑失败'
          set({ error: errorMessage, loading: false })
        }
      },
      
      fetchDelayedMilestones: async (projectId) => {
        set({ loading: true, error: null })
        try {
          const milestones = await milestoneApi.getDelayedMilestones(projectId)
          set({ milestones: (milestones || []) as Milestone[], loading: false })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '加载已延期里程碑失败'
          set({ error: errorMessage, loading: false })
        }
      },
      
      // ==================== 负责人操作 ====================
      
      fetchAssignees: async (milestoneId) => {
        try {
          const assignees = await milestoneApi.getMilestoneAssignees(milestoneId)
          set({ assignees: (assignees || []) as MilestoneAssignee[] })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '加载负责人失败'
          set({ error: errorMessage })
        }
      },
      
      updateAssignees: async (milestoneId, assigneeIds) => {
        try {
          await milestoneApi.updateMilestoneAssignees(milestoneId, assigneeIds)
          // 重新加载负责人列表
          const assignees = await milestoneApi.getMilestoneAssignees(milestoneId)
          set({ assignees: (assignees || []) as MilestoneAssignee[] })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '更新负责人失败'
          set({ error: errorMessage })
          throw error
        }
      },
      
      addAssignee: async (milestoneId, userId, isPrimary = false) => {
        try {
          await milestoneApi.addMilestoneAssignee(milestoneId, userId, isPrimary)
          // 重新加载负责人列表
          const assignees = await milestoneApi.getMilestoneAssignees(milestoneId)
          set({ assignees: (assignees || []) as MilestoneAssignee[] })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '添加负责人失败'
          set({ error: errorMessage })
          throw error
        }
      },
      
      removeAssignee: async (milestoneId, userId) => {
        try {
          await milestoneApi.removeMilestoneAssignee(milestoneId, userId)
          set((state) => {
            state.assignees = state.assignees.filter((a: MilestoneAssignee) => a.userId !== userId)
          })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '移除负责人失败'
          set({ error: errorMessage })
          throw error
        }
      },
      
      // ==================== 任务操作 ====================
      
      fetchTasks: async (milestoneId) => {
        set({ taskLoading: true, error: null })
        try {
          const tasks = await milestoneApi.getMilestoneTasks(milestoneId)
          set({ tasks: (tasks || []) as MilestoneTask[], taskLoading: false })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '加载任务失败'
          set({ error: errorMessage, taskLoading: false })
        }
      },
      
      fetchTaskDetail: async (taskId) => {
        set({ taskLoading: true, error: null })
        try {
          const task = await milestoneApi.getTaskDetail(taskId)
          set({ currentTask: task as MilestoneTask, taskLoading: false })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '加载任务详情失败'
          set({ error: errorMessage, taskLoading: false })
        }
      },
      
      createTask: async (milestoneId, task) => {
        set({ taskLoading: true, error: null })
        try {
          const newTask = await milestoneApi.createMilestoneTask(milestoneId, task)
          set((state) => {
            state.tasks.push(newTask as MilestoneTask)
            state.taskLoading = false
          })
          return newTask as MilestoneTask
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '创建任务失败'
          set({ error: errorMessage, taskLoading: false })
          throw error
        }
      },
      
      createSubTask: async (taskId, task) => {
        set({ taskLoading: true, error: null })
        try {
          const newTask = await milestoneApi.createSubTask(taskId, task)
          // 重新加载任务列表以获取更新的层级结构
          const { currentMilestone } = get()
          if (currentMilestone) {
            const tasks = await milestoneApi.getMilestoneTasks(currentMilestone.id)
            set({ tasks: (tasks || []) as MilestoneTask[], taskLoading: false })
          } else {
            set({ taskLoading: false })
          }
          return newTask as MilestoneTask
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '创建子任务失败'
          set({ error: errorMessage, taskLoading: false })
          throw error
        }
      },
      
      updateTask: async (taskId, task) => {
        try {
          await milestoneApi.updateTask(taskId, task)
          set((state) => {
            const updateTaskInList = (tasks: MilestoneTask[]): boolean => {
              const idx = tasks.findIndex((t: MilestoneTask) => t.id === taskId)
              if (idx !== -1) {
                tasks[idx] = { ...tasks[idx], ...task }
                return true
              }
              // 递归查找子任务
              for (const t of tasks) {
                if (t.subTasks && updateTaskInList(t.subTasks)) {
                  return true
                }
              }
              return false
            }
            updateTaskInList(state.tasks)
            
            if (state.currentTask?.id === taskId) {
              state.currentTask = { ...state.currentTask, ...task }
            }
          })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '更新任务失败'
          set({ error: errorMessage })
          throw error
        }
      },
      
      updateTaskProgress: async (taskId, progress) => {
        try {
          await milestoneApi.updateTaskProgress(taskId, progress)
          set((state) => {
            const updateProgressInList = (tasks: MilestoneTask[]): boolean => {
              const task = tasks.find((t: MilestoneTask) => t.id === taskId)
              if (task) {
                task.progress = progress
                return true
              }
              for (const t of tasks) {
                if (t.subTasks && updateProgressInList(t.subTasks)) {
                  return true
                }
              }
              return false
            }
            updateProgressInList(state.tasks)
            
            if (state.currentTask?.id === taskId) {
              state.currentTask.progress = progress
            }
          })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '更新进度失败'
          set({ error: errorMessage })
          throw error
        }
      },
      
      completeTask: async (taskId) => {
        try {
          await milestoneApi.completeTask(taskId)
          set((state) => {
            const completeTaskInList = (tasks: MilestoneTask[]): boolean => {
              const task = tasks.find((t: MilestoneTask) => t.id === taskId)
              if (task) {
                task.status = milestoneApi.TaskStatus.COMPLETED
                task.progress = 100
                task.completedAt = new Date().toISOString()
                return true
              }
              for (const t of tasks) {
                if (t.subTasks && completeTaskInList(t.subTasks)) {
                  return true
                }
              }
              return false
            }
            completeTaskInList(state.tasks)
            
            if (state.currentTask?.id === taskId) {
              state.currentTask.status = milestoneApi.TaskStatus.COMPLETED
              state.currentTask.progress = 100
              state.currentTask.completedAt = new Date().toISOString()
            }
          })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '完成任务失败'
          set({ error: errorMessage })
          throw error
        }
      },
      
      assignTask: async (taskId, userId) => {
        try {
          await milestoneApi.assignTask(taskId, userId)
          set((state) => {
            const assignTaskInList = (tasks: MilestoneTask[]): boolean => {
              const task = tasks.find((t: MilestoneTask) => t.id === taskId)
              if (task) {
                task.assigneeId = userId
                return true
              }
              for (const t of tasks) {
                if (t.subTasks && assignTaskInList(t.subTasks)) {
                  return true
                }
              }
              return false
            }
            assignTaskInList(state.tasks)
            
            if (state.currentTask?.id === taskId) {
              state.currentTask.assigneeId = userId
            }
          })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '分配任务失败'
          set({ error: errorMessage })
          throw error
        }
      },
      
      deleteTask: async (taskId) => {
        try {
          await milestoneApi.deleteTask(taskId)
          set((state) => {
            const deleteTaskFromList = (tasks: MilestoneTask[]): MilestoneTask[] => {
              return tasks.filter((t: MilestoneTask) => {
                if (t.id === taskId) return false
                if (t.subTasks) {
                  t.subTasks = deleteTaskFromList(t.subTasks)
                }
                return true
              })
            }
            state.tasks = deleteTaskFromList(state.tasks)
            
            if (state.currentTask?.id === taskId) {
              state.currentTask = null
            }
          })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '删除任务失败'
          set({ error: errorMessage })
          throw error
        }
      },
      
      // ==================== 筛选 ====================
      
      setFilters: (newFilters) => {
        set((state) => {
          state.filters = { ...state.filters, ...newFilters }
        })
      },
      
      clearFilters: () => {
        set({ filters: initialFilters })
      },
      
      // ==================== 统计 ====================
      
      calculateStatistics: (milestone) => {
        const tasks = milestone.tasks || []
        
        const countTasks = (taskList: MilestoneTask[]): { total: number; completed: number; inProgress: number; pending: number; cancelled: number } => {
          let total = 0
          let completed = 0
          let inProgress = 0
          let pending = 0
          let cancelled = 0
          
          for (const task of taskList) {
            total++
            switch (task.status) {
              case milestoneApi.TaskStatus.COMPLETED:
                completed++
                break
              case milestoneApi.TaskStatus.IN_PROGRESS:
                inProgress++
                break
              case milestoneApi.TaskStatus.PENDING:
                pending++
                break
              case milestoneApi.TaskStatus.CANCELLED:
                cancelled++
                break
            }
            
            if (task.subTasks) {
              const subCounts = countTasks(task.subTasks)
              total += subCounts.total
              completed += subCounts.completed
              inProgress += subCounts.inProgress
              pending += subCounts.pending
              cancelled += subCounts.cancelled
            }
          }
          
          return { total, completed, inProgress, pending, cancelled }
        }
        
        const counts = countTasks(tasks)
        const progress = counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0
        
        const targetDate = new Date(milestone.targetDate)
        const now = new Date()
        const daysRemaining = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        const isOverdue = milestone.status === MilestoneStatus.PENDING && daysRemaining < 0
        
        // 判断是否按计划进行（简单逻辑：如果进度百分比 >= 预期进度百分比）
        const totalDays = Math.ceil((targetDate.getTime() - new Date(milestone.createdAt || now).getTime()) / (1000 * 60 * 60 * 24))
        const elapsedDays = totalDays - daysRemaining
        const expectedProgress = totalDays > 0 ? Math.round((elapsedDays / totalDays) * 100) : 0
        const isOnTrack = progress >= expectedProgress || milestone.status === MilestoneStatus.COMPLETED
        
        return {
          totalTasks: counts.total,
          completedTasks: counts.completed,
          inProgressTasks: counts.inProgress,
          pendingTasks: counts.pending,
          cancelledTasks: counts.cancelled,
          progress,
          isOnTrack,
          daysRemaining: Math.max(0, daysRemaining),
          isOverdue
        }
      },
      
      // ==================== 错误处理 ====================
      
      clearError: () => {
        set({ error: null })
      },
      
      // ==================== 重置 ====================
      
      reset: () => {
        set(initialState)
      }
    })),
    { name: 'MilestoneStore' }
  )
)

// ==================== 选择器 ====================

export const useMilestones = () => useMilestoneStore((state) => state.milestones)
export const useCurrentMilestone = () => useMilestoneStore((state) => state.currentMilestone)
export const useMilestoneAssignees = () => useMilestoneStore((state) => state.assignees)
export const useMilestoneTasks = () => useMilestoneStore((state) => state.tasks)
export const useCurrentMilestoneTask = () => useMilestoneStore((state) => state.currentTask)
export const useMilestoneLoading = () => useMilestoneStore((state) => state.loading)
export const useMilestoneError = () => useMilestoneStore((state) => state.error)
export const useMilestoneFilters = () => useMilestoneStore((state) => state.filters)
export const useMilestoneStatistics = () => useMilestoneStore((state) => state.statistics)

// 计算属性选择器
export const useFilteredMilestones = () => {
  const milestones = useMilestoneStore((state) => state.milestones)
  const filters = useMilestoneStore((state) => state.filters)
  
  return milestones.filter((milestone: Milestone) => {
    // 项目筛选
    if (filters.projectId && milestone.projectId !== filters.projectId) {
      return false
    }
    
    // 状态筛选
    if (filters.status !== 'all' && milestone.status !== filters.status) {
      return false
    }
    
    // 是否过期筛选
    if (filters.isOverdue !== null) {
      const isOverdue = milestoneApi.isOverdue(milestone)
      if (filters.isOverdue !== isOverdue) {
        return false
      }
    }
    
    // 是否即将到期筛选
    if (filters.isUpcoming !== null) {
      const isUpcoming = milestoneApi.isUpcoming(milestone)
      if (filters.isUpcoming !== isUpcoming) {
        return false
      }
    }
    
    return true
  })
}

export const usePendingMilestones = () => {
  const milestones = useMilestoneStore((state) => state.milestones)
  return milestones.filter((m: Milestone) => m.status === MilestoneStatus.PENDING)
}

export const useCompletedMilestones = () => {
  const milestones = useMilestoneStore((state) => state.milestones)
  return milestones.filter((m: Milestone) => m.status === MilestoneStatus.COMPLETED)
}

export const useDelayedMilestones = () => {
  const milestones = useMilestoneStore((state) => state.milestones)
  return milestones.filter((m: Milestone) => m.status === MilestoneStatus.DELAYED)
}

export const useUpcomingMilestones = () => {
  const milestones = useMilestoneStore((state) => state.milestones)
  return milestones.filter((m: Milestone) => milestoneApi.isUpcoming(m))
}

export const useOverdueMilestones = () => {
  const milestones = useMilestoneStore((state) => state.milestones)
  return milestones.filter((m: Milestone) => milestoneApi.isOverdue(m))
}

export const useMilestonesByStatus = (status: MilestoneStatus) => {
  const milestones = useMilestoneStore((state) => state.milestones)
  return milestones.filter((m: Milestone) => m.status === status)
}