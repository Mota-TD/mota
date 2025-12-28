/**
 * 任务状态管理
 * 使用 Zustand 进行状态管理，支持部门任务和执行任务
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import * as taskApi from '@/services/api/task'
import * as departmentTaskApi from '@/services/api/departmentTask'
import type {
  Task,
  DepartmentTask,
  TaskQueryParams,
  TaskStatusCount,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateDepartmentTaskRequest,
  UpdateDepartmentTaskRequest,
} from '../types'
import {
  TaskStatus,
  TaskPriority,
  DepartmentTaskStatus,
} from '../types'

// 本地筛选状态接口
interface TaskFilters {
  projectId: string | null
  departmentTaskId: string | null
  status: string // 使用 string 以兼容 TaskStatus 和 DepartmentTaskStatus
  priority: string // 使用 string 以兼容不同优先级类型
  assigneeId: string | null
}

// ==================== 状态接口 ====================

interface TaskState {
  // 部门任务
  departmentTasks: DepartmentTask[]
  currentDepartmentTask: DepartmentTask | null
  
  // 执行任务
  tasks: Task[]
  currentTask: Task | null
  
  // 加载状态
  loading: boolean
  detailLoading: boolean
  error: string | null
  
  // 筛选
  filters: TaskFilters
  
  // 统计
  taskStats: TaskStatusCount[]
  
  // ==================== 操作方法 ====================
  
  // 部门任务操作
  fetchDepartmentTasks: (projectId: string) => Promise<void>
  fetchDepartmentTasksByMilestone: (milestoneId: string) => Promise<void>
  fetchDepartmentTaskDetail: (id: string) => Promise<void>
  createDepartmentTask: (data: CreateDepartmentTaskRequest) => Promise<DepartmentTask>
  updateDepartmentTask: (id: string, data: UpdateDepartmentTaskRequest) => Promise<void>
  deleteDepartmentTask: (id: string) => Promise<void>
  updateDepartmentTaskStatus: (id: string, status: DepartmentTaskStatus) => Promise<void>
  updateDepartmentTaskProgress: (id: string, progress: number) => Promise<void>
  
  // 执行任务操作
  fetchTasks: (params?: TaskQueryParams) => Promise<void>
  fetchTasksByDepartmentTask: (departmentTaskId: string) => Promise<void>
  fetchTasksByProject: (projectId: string) => Promise<void>
  fetchTasksByAssignee: (assigneeId: string) => Promise<void>
  fetchTaskDetail: (id: string) => Promise<void>
  createTask: (data: CreateTaskRequest) => Promise<Task>
  updateTask: (id: string, data: UpdateTaskRequest) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  
  // 任务状态操作
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>
  updateTaskProgress: (id: string, progress: number, note?: string) => Promise<void>
  completeTask: (id: string) => Promise<void>
  assignTask: (id: string, assigneeId: string) => Promise<void>
  
  // 我的任务
  fetchMyTasks: () => Promise<void>
  fetchTodoList: (userId: string) => Promise<void>
  fetchUpcomingTasks: (userId: string, days?: number) => Promise<void>
  fetchOverdueTasks: (userId: string) => Promise<void>
  
  // 统计
  fetchTaskStats: (projectId: string) => Promise<void>
  fetchDepartmentTaskStats: (departmentTaskId: string) => Promise<void>
  
  // 筛选
  setFilters: (filters: Partial<TaskFilters>) => void
  clearFilters: () => void
  
  // 错误处理
  clearError: () => void
  
  // 重置
  reset: () => void
}

// ==================== 初始状态 ====================

const initialFilters: TaskFilters = {
  projectId: null,
  departmentTaskId: null,
  status: 'all',
  priority: 'all',
  assigneeId: null
}

const initialState = {
  departmentTasks: [] as DepartmentTask[],
  currentDepartmentTask: null as DepartmentTask | null,
  tasks: [] as Task[],
  currentTask: null as Task | null,
  loading: false,
  detailLoading: false,
  error: null as string | null,
  filters: initialFilters,
  taskStats: [] as TaskStatusCount[]
}

// ==================== 创建 Store ====================

export const useTaskStore = create<TaskState>()(
  devtools(
    immer((set, get) => ({
      ...initialState,
      
      // ==================== 部门任务操作 ====================
      
      fetchDepartmentTasks: async (projectId) => {
        set({ loading: true, error: null })
        try {
          const tasks = await departmentTaskApi.getDepartmentTasksByProjectId(projectId)
          set({ departmentTasks: (tasks || []) as DepartmentTask[], loading: false })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '加载部门任务失败'
          set({ error: errorMessage, loading: false })
        }
      },
      
      fetchDepartmentTasksByMilestone: async (milestoneId) => {
        set({ loading: true, error: null })
        try {
          // 使用通用查询接口，按里程碑ID筛选
          const res = await departmentTaskApi.getDepartmentTasks({ milestoneId } as departmentTaskApi.DepartmentTaskQueryParams)
          set({ departmentTasks: (res.list || []) as DepartmentTask[], loading: false })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '加载部门任务失败'
          set({ error: errorMessage, loading: false })
        }
      },
      
      fetchDepartmentTaskDetail: async (id) => {
        set({ detailLoading: true, error: null })
        try {
          const task = await departmentTaskApi.getDepartmentTaskById(id)
          set({ currentDepartmentTask: task as DepartmentTask, detailLoading: false })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '加载部门任务详情失败'
          set({ error: errorMessage, detailLoading: false })
        }
      },
      
      createDepartmentTask: async (data) => {
        set({ loading: true, error: null })
        try {
          const task = await departmentTaskApi.createDepartmentTask(data as departmentTaskApi.CreateDepartmentTaskRequest)
          set((state) => {
            state.departmentTasks.push(task as DepartmentTask)
            state.loading = false
          })
          return task as DepartmentTask
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '创建部门任务失败'
          set({ error: errorMessage, loading: false })
          throw error
        }
      },
      
      updateDepartmentTask: async (id, data) => {
        try {
          await departmentTaskApi.updateDepartmentTask(id, data as departmentTaskApi.UpdateDepartmentTaskRequest)
          set((state) => {
            const idx = state.departmentTasks.findIndex((t: DepartmentTask) => t.id === id)
            if (idx !== -1) {
              state.departmentTasks[idx] = { ...state.departmentTasks[idx], ...data }
            }
            if (state.currentDepartmentTask?.id === id) {
              state.currentDepartmentTask = { ...state.currentDepartmentTask, ...data }
            }
          })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '更新部门任务失败'
          set({ error: errorMessage })
          throw error
        }
      },
      
      deleteDepartmentTask: async (id) => {
        try {
          await departmentTaskApi.deleteDepartmentTask(id)
          set((state) => {
            state.departmentTasks = state.departmentTasks.filter((t: DepartmentTask) => t.id !== id)
            if (state.currentDepartmentTask?.id === id) {
              state.currentDepartmentTask = null
            }
          })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '删除部门任务失败'
          set({ error: errorMessage })
          throw error
        }
      },
      
      updateDepartmentTaskStatus: async (id, status) => {
        const { departmentTasks } = get()
        const originalTask = departmentTasks.find((t: DepartmentTask) => t.id === id)
        
        // 乐观更新
        set((state) => {
          const task = state.departmentTasks.find((t: DepartmentTask) => t.id === id)
          if (task) {
            task.status = status
          }
        })
        
        try {
          await departmentTaskApi.updateDepartmentTaskStatus(id, status as departmentTaskApi.DepartmentTaskStatus)
        } catch (error: unknown) {
          // 回滚
          if (originalTask) {
            set((state) => {
              const task = state.departmentTasks.find((t: DepartmentTask) => t.id === id)
              if (task) {
                task.status = originalTask.status
              }
            })
          }
          const errorMessage = error instanceof Error ? error.message : '更新状态失败'
          set({ error: errorMessage })
          throw error
        }
      },
      
      updateDepartmentTaskProgress: async (id, progress) => {
        try {
          await departmentTaskApi.updateDepartmentTaskProgress(id, progress)
          set((state) => {
            const task = state.departmentTasks.find((t: DepartmentTask) => t.id === id)
            if (task) {
              task.progress = progress
            }
            if (state.currentDepartmentTask?.id === id) {
              state.currentDepartmentTask.progress = progress
            }
          })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '更新进度失败'
          set({ error: errorMessage })
          throw error
        }
      },
      
      // ==================== 执行任务操作 ====================
      
      fetchTasks: async (params) => {
        set({ loading: true, error: null })
        try {
          const res = await taskApi.getTasks(params as taskApi.TaskQueryParams)
          set({ tasks: (res.list || []) as Task[], loading: false })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '加载任务列表失败'
          set({ error: errorMessage, loading: false })
        }
      },
      
      fetchTasksByDepartmentTask: async (departmentTaskId) => {
        set({ loading: true, error: null })
        try {
          const tasks = await taskApi.getTasksByDepartmentTaskId(departmentTaskId)
          set({ tasks: (tasks || []) as Task[], loading: false })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '加载任务列表失败'
          set({ error: errorMessage, loading: false })
        }
      },
      
      fetchTasksByProject: async (projectId) => {
        set({ loading: true, error: null })
        try {
          const tasks = await taskApi.getTasksByProjectId(projectId)
          set({ tasks: (tasks || []) as Task[], loading: false })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '加载任务列表失败'
          set({ error: errorMessage, loading: false })
        }
      },
      
      fetchTasksByAssignee: async (assigneeId) => {
        set({ loading: true, error: null })
        try {
          const tasks = await taskApi.getTasksByAssigneeId(assigneeId)
          set({ tasks: (tasks || []) as Task[], loading: false })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '加载任务列表失败'
          set({ error: errorMessage, loading: false })
        }
      },
      
      fetchTaskDetail: async (id) => {
        set({ detailLoading: true, error: null })
        try {
          const task = await taskApi.getTaskById(id)
          set({ currentTask: task as Task, detailLoading: false })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '加载任务详情失败'
          set({ error: errorMessage, detailLoading: false })
        }
      },
      
      createTask: async (data) => {
        set({ loading: true, error: null })
        try {
          const task = await taskApi.createTask(data as taskApi.CreateTaskRequest)
          set((state) => {
            state.tasks.push(task as Task)
            state.loading = false
          })
          return task as Task
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '创建任务失败'
          set({ error: errorMessage, loading: false })
          throw error
        }
      },
      
      updateTask: async (id, data) => {
        try {
          await taskApi.updateTask(id, data as taskApi.UpdateTaskRequest)
          set((state) => {
            const idx = state.tasks.findIndex((t: Task) => t.id === id)
            if (idx !== -1) {
              state.tasks[idx] = { ...state.tasks[idx], ...data }
            }
            if (state.currentTask?.id === id) {
              state.currentTask = { ...state.currentTask, ...data }
            }
          })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '更新任务失败'
          set({ error: errorMessage })
          throw error
        }
      },
      
      deleteTask: async (id) => {
        try {
          await taskApi.deleteTask(id)
          set((state) => {
            state.tasks = state.tasks.filter((t: Task) => t.id !== id)
            if (state.currentTask?.id === id) {
              state.currentTask = null
            }
          })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '删除任务失败'
          set({ error: errorMessage })
          throw error
        }
      },
      
      // ==================== 任务状态操作 ====================
      
      updateTaskStatus: async (id, status) => {
        const { tasks } = get()
        const originalTask = tasks.find((t: Task) => t.id === id)
        
        // 乐观更新
        set((state) => {
          const task = state.tasks.find((t: Task) => t.id === id)
          if (task) {
            task.status = status
          }
        })
        
        try {
          await taskApi.updateTaskStatus(id, status as taskApi.TaskStatus)
        } catch (error: unknown) {
          // 回滚
          if (originalTask) {
            set((state) => {
              const task = state.tasks.find((t: Task) => t.id === id)
              if (task) {
                task.status = originalTask.status
              }
            })
          }
          const errorMessage = error instanceof Error ? error.message : '更新状态失败'
          set({ error: errorMessage })
          throw error
        }
      },
      
      updateTaskProgress: async (id, progress, note) => {
        try {
          await taskApi.updateTaskProgress(id, progress, note)
          set((state) => {
            const task = state.tasks.find((t: Task) => t.id === id)
            if (task) {
              task.progress = progress
              if (note) task.progressNote = note
            }
            if (state.currentTask?.id === id) {
              state.currentTask.progress = progress
              if (note) state.currentTask.progressNote = note
            }
          })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '更新进度失败'
          set({ error: errorMessage })
          throw error
        }
      },
      
      completeTask: async (id) => {
        try {
          await taskApi.completeTask(id)
          set((state) => {
            const task = state.tasks.find((t: Task) => t.id === id)
            if (task) {
              task.status = 'completed'
              task.progress = 100
              task.completedAt = new Date().toISOString()
            }
            if (state.currentTask?.id === id) {
              state.currentTask.status = 'completed'
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
      
      assignTask: async (id, assigneeId) => {
        try {
          await taskApi.assignTask(id, assigneeId)
          set((state) => {
            const task = state.tasks.find((t: Task) => t.id === id)
            if (task) {
              task.assigneeId = assigneeId
            }
            if (state.currentTask?.id === id) {
              state.currentTask.assigneeId = assigneeId
            }
          })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '分配任务失败'
          set({ error: errorMessage })
          throw error
        }
      },
      
      // ==================== 我的任务 ====================
      
      fetchMyTasks: async () => {
        set({ loading: true, error: null })
        try {
          const res = await taskApi.getMyTasks()
          set({ tasks: (res.list || []) as Task[], loading: false })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '加载我的任务失败'
          set({ error: errorMessage, loading: false })
        }
      },
      
      fetchTodoList: async (userId) => {
        set({ loading: true, error: null })
        try {
          const tasks = await taskApi.getTodoList(userId)
          set({ tasks: (tasks || []) as Task[], loading: false })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '加载待办任务失败'
          set({ error: errorMessage, loading: false })
        }
      },
      
      fetchUpcomingTasks: async (userId, days = 7) => {
        set({ loading: true, error: null })
        try {
          const tasks = await taskApi.getUpcomingTasks(userId, days)
          set({ tasks: (tasks || []) as Task[], loading: false })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '加载即将到期任务失败'
          set({ error: errorMessage, loading: false })
        }
      },
      
      fetchOverdueTasks: async (userId) => {
        set({ loading: true, error: null })
        try {
          const tasks = await taskApi.getOverdueTasks(userId)
          set({ tasks: (tasks || []) as Task[], loading: false })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '加载逾期任务失败'
          set({ error: errorMessage, loading: false })
        }
      },
      
      // ==================== 统计 ====================
      
      fetchTaskStats: async (projectId) => {
        try {
          const stats = await taskApi.getTaskStatsByProject(projectId)
          set({ taskStats: (stats || []) as TaskStatusCount[] })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '加载统计失败'
          set({ error: errorMessage })
        }
      },
      
      fetchDepartmentTaskStats: async (departmentTaskId) => {
        try {
          const stats = await taskApi.getTaskStatsByDepartmentTask(departmentTaskId)
          set({ taskStats: (stats || []) as TaskStatusCount[] })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '加载统计失败'
          set({ error: errorMessage })
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
      
      // ==================== 错误处理 ====================
      
      clearError: () => {
        set({ error: null })
      },
      
      // ==================== 重置 ====================
      
      reset: () => {
        set(initialState)
      }
    })),
    { name: 'TaskStore' }
  )
)

// ==================== 选择器 ====================

export const useDepartmentTasks = () => useTaskStore((state) => state.departmentTasks)
export const useCurrentDepartmentTask = () => useTaskStore((state) => state.currentDepartmentTask)
export const useTasks = () => useTaskStore((state) => state.tasks)
export const useCurrentTask = () => useTaskStore((state) => state.currentTask)
export const useTaskLoading = () => useTaskStore((state) => state.loading)
export const useTaskError = () => useTaskStore((state) => state.error)
export const useTaskFilters = () => useTaskStore((state) => state.filters)
export const useTaskStats = () => useTaskStore((state) => state.taskStats)

// 计算属性选择器
export const useFilteredTasks = () => {
  const tasks = useTaskStore((state) => state.tasks)
  const filters = useTaskStore((state) => state.filters)
  
  return tasks.filter((task: Task) => {
    // 项目筛选
    if (filters.projectId && task.projectId !== filters.projectId) {
      return false
    }
    
    // 部门任务筛选
    if (filters.departmentTaskId && task.departmentTaskId !== filters.departmentTaskId) {
      return false
    }
    
    // 状态筛选
    if (filters.status !== 'all' && task.status !== filters.status) {
      return false
    }
    
    // 优先级筛选
    if (filters.priority !== 'all' && task.priority !== filters.priority) {
      return false
    }
    
    // 执行人筛选
    if (filters.assigneeId && task.assigneeId !== filters.assigneeId) {
      return false
    }
    
    return true
  })
}

export const useFilteredDepartmentTasks = () => {
  const departmentTasks = useTaskStore((state) => state.departmentTasks)
  const filters = useTaskStore((state) => state.filters)
  
  return departmentTasks.filter((task: DepartmentTask) => {
    // 项目筛选
    if (filters.projectId && task.projectId !== filters.projectId) {
      return false
    }
    
    // 状态筛选
    if (filters.status !== 'all' && task.status !== filters.status) {
      return false
    }
    
    // 优先级筛选
    if (filters.priority !== 'all' && task.priority !== filters.priority) {
      return false
    }
    
    return true
  })
}

export const usePendingTasks = () => {
  const tasks = useTaskStore((state) => state.tasks)
  return tasks.filter((t: Task) => t.status === 'pending')
}

export const useInProgressTasks = () => {
  const tasks = useTaskStore((state) => state.tasks)
  return tasks.filter((t: Task) => t.status === 'in_progress')
}

export const useCompletedTasks = () => {
  const tasks = useTaskStore((state) => state.tasks)
  return tasks.filter((t: Task) => t.status === 'completed')
}

export const useTasksByStatus = (status: TaskStatus) => {
  const tasks = useTaskStore((state) => state.tasks)
  return tasks.filter((t: Task) => t.status === status)
}

export const useTasksByPriority = (priority: TaskPriority) => {
  const tasks = useTaskStore((state) => state.tasks)
  return tasks.filter((t: Task) => t.priority === priority)
}