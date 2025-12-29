/**
 * 跨Store数据同步管理器
 * 负责协调projectStore、taskStore、aiStore之间的数据同步
 */

import { useProjectStore } from '@/modules/project/store/projectStore'
import { useTaskStore } from '@/modules/task/store/taskStore'
import { useAIStore } from '@/modules/ai/store/aiStore'

// 事件类型定义
export type SyncEventType = 
  | 'project_updated'
  | 'project_deleted'
  | 'task_status_changed' 
  | 'department_task_updated'
  | 'milestone_completed'
  | 'member_added'
  | 'member_removed'
  | 'ai_recommendation_applied'

// 事件数据接口
export interface SyncEvent {
  type: SyncEventType
  payload: any
  timestamp: number
  source: 'project' | 'task' | 'ai'
}

// 事件监听器类型
export type SyncEventListener = (event: SyncEvent) => void | Promise<void>

/**
 * 数据同步管理器类
 */
class DataSyncManager {
  private listeners: Map<SyncEventType, Set<SyncEventListener>> = new Map()
  private eventQueue: SyncEvent[] = []
  private isProcessing = false

  /**
   * 注册事件监听器
   */
  on(eventType: SyncEventType, listener: SyncEventListener): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    this.listeners.get(eventType)!.add(listener)
  }

  /**
   * 移除事件监听器
   */
  off(eventType: SyncEventType, listener: SyncEventListener): void {
    const listeners = this.listeners.get(eventType)
    if (listeners) {
      listeners.delete(listener)
    }
  }

  /**
   * 发布事件
   */
  async emit(event: Omit<SyncEvent, 'timestamp'>): Promise<void> {
    const fullEvent: SyncEvent = {
      ...event,
      timestamp: Date.now()
    }

    // 添加到事件队列
    this.eventQueue.push(fullEvent)
    
    // 如果没有正在处理，开始处理队列
    if (!this.isProcessing) {
      await this.processEventQueue()
    }
  }

  /**
   * 处理事件队列
   */
  private async processEventQueue(): Promise<void> {
    this.isProcessing = true

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!
      const listeners = this.listeners.get(event.type)

      if (listeners) {
        // 并行执行所有监听器
        await Promise.allSettled(
          Array.from(listeners).map(listener => {
            try {
              return listener(event)
            } catch (error) {
              console.error(`Error in sync listener for ${event.type}:`, error)
              return Promise.resolve()
            }
          })
        )
      }
    }

    this.isProcessing = false
  }

  /**
   * 初始化Store间的数据同步
   */
  initializeSync(): void {
    this.setupProjectSync()
    this.setupTaskSync()
    this.setupAISync()
  }

  /**
   * 设置项目Store同步
   */
  private setupProjectSync(): void {
    // 监听项目更新事件
    this.on('project_updated', async (event) => {
      const { projectId, updates } = event.payload
      
      // 更新任务Store中的相关数据
      const taskStore = useTaskStore.getState()
      if (taskStore.departmentTasks.some(dt => dt.projectId === projectId)) {
        // 重新加载项目相关的部门任务
        await taskStore.fetchDepartmentTasks(projectId)
      }
      
      // 清理AI Store中的相关缓存
      if (event.source !== 'ai') {
        const aiStore = useAIStore.getState()
        aiStore.clearDecomposeResult()
        aiStore.clearAssignmentRecommendations()
      }
    })

    // 监听项目删除事件
    this.on('project_deleted', async (event) => {
      const { projectId } = event.payload
      
      // 清理任务Store中的相关数据
      const taskStore = useTaskStore.getState()
      const stateCopy = { ...taskStore }
      
      // 清理部门任务
      stateCopy.departmentTasks = stateCopy.departmentTasks.filter(dt => dt.projectId !== projectId)
      // 清理执行任务
      stateCopy.tasks = stateCopy.tasks.filter(t => t.projectId !== projectId)
      
      taskStore.reset()
      Object.assign(taskStore, stateCopy)

      // 清理AI Store
      const aiStore = useAIStore.getState()
      aiStore.clearDecomposeResult()
      aiStore.clearAssignmentRecommendations()
    })

    // 监听成员变更事件
    this.on('member_added', async (event) => {
      const { projectId, userId } = event.payload
      
      // 刷新AI推荐（因为可分配人员发生变化）
      const aiStore = useAIStore.getState()
      if (aiStore.assignmentRecommendations.length > 0) {
        aiStore.clearAssignmentRecommendations()
      }
    })
  }

  /**
   * 设置任务Store同步
   */
  private setupTaskSync(): void {
    // 监听任务状态变化事件
    this.on('task_status_changed', async (event) => {
      const { taskId, newStatus, departmentTaskId, projectId } = event.payload
      
      // 更新项目Store中的统计信息
      if (projectId) {
        const projectStore = useProjectStore.getState()
        if (projectStore.currentProject?.id === projectId) {
          // 重新获取项目统计
          await projectStore.fetchProjectDetail(projectId)
        }
      }

      // 如果任务完成，清理相关AI推荐
      if (newStatus === 'completed') {
        const aiStore = useAIStore.getState()
        // 清理该任务的分工推荐
        if (aiStore.assignmentRecommendations.length > 0) {
          aiStore.clearAssignmentRecommendations()
        }
      }
    })

    // 监听部门任务更新事件
    this.on('department_task_updated', async (event) => {
      const { departmentTaskId, projectId, milestoneId } = event.payload
      
      // 更新项目Store中的里程碑进度
      if (projectId && milestoneId) {
        const projectStore = useProjectStore.getState()
        if (projectStore.currentProject?.id === projectId) {
          await projectStore.fetchProjectMilestones(projectId)
        }
      }
    })

    // 监听里程碑完成事件
    this.on('milestone_completed', async (event) => {
      const { milestoneId, projectId } = event.payload
      
      // 更新项目Store
      const projectStore = useProjectStore.getState()
      if (projectStore.currentProject?.id === projectId) {
        await projectStore.fetchProjectDetail(projectId)
      }

      // 触发AI分析（可能需要重新评估项目风险等）
      const aiStore = useAIStore.getState()
      // 重新获取项目风险预警
      try {
        await aiStore.fetchRiskWarnings(projectId)
      } catch (error) {
        console.log('获取风险预警失败，继续执行')
      }
    })
  }

  /**
   * 设置AI Store同步
   */
  private setupAISync(): void {
    // 监听AI推荐应用事件
    this.on('ai_recommendation_applied', async (event) => {
      const { type, targetId, userId } = event.payload
      
      if (type === 'task_assignment') {
        // 重新加载相关任务数据
        const taskStore = useTaskStore.getState()
        await taskStore.fetchTaskDetail(targetId)
        
        // 重新加载项目数据
        const task = taskStore.currentTask
        if (task?.projectId) {
          const projectStore = useProjectStore.getState()
          await projectStore.fetchProjectDetail(task.projectId)
        }
      }
    })
  }

  /**
   * 手动触发数据同步
   */
  async forceSync(projectId?: string): Promise<void> {
    try {
      const projectStore = useProjectStore.getState()
      const taskStore = useTaskStore.getState()
      const aiStore = useAIStore.getState()

      if (projectId) {
        // 同步特定项目的数据
        await Promise.allSettled([
          projectStore.fetchProjectDetail(projectId),
          taskStore.fetchDepartmentTasks(projectId),
          taskStore.fetchTasksByProject(projectId)
        ])
      } else {
        // 同步所有数据
        await Promise.allSettled([
          projectStore.fetchProjects(),
          taskStore.fetchTasks()
        ])
      }

      // 清理AI缓存
      aiStore.clearDecomposeResult()
      aiStore.clearAssignmentRecommendations()

    } catch (error) {
      console.error('Force sync failed:', error)
    }
  }

  /**
   * 获取同步状态
   */
  getSyncStatus(): {
    queueLength: number
    isProcessing: boolean
    listenersCount: number
  } {
    return {
      queueLength: this.eventQueue.length,
      isProcessing: this.isProcessing,
      listenersCount: Array.from(this.listeners.values())
        .reduce((sum, set) => sum + set.size, 0)
    }
  }
}

// 创建全局单例
export const syncManager = new DataSyncManager()

/**
 * React Hook：使用数据同步管理器
 */
export function useSyncManager() {
  return {
    emit: syncManager.emit.bind(syncManager),
    on: syncManager.on.bind(syncManager),
    off: syncManager.off.bind(syncManager),
    forceSync: syncManager.forceSync.bind(syncManager),
    getSyncStatus: syncManager.getSyncStatus.bind(syncManager)
  }
}

/**
 * 初始化数据同步（应在应用启动时调用）
 */
export function initializeDataSync(): void {
  syncManager.initializeSync()
  console.log('Data sync manager initialized')
}

/**
 * 便捷的事件发布函数
 */
export const emitSyncEvent = {
  projectUpdated: (projectId: string, updates: any) =>
    syncManager.emit({
      type: 'project_updated',
      source: 'project',
      payload: { projectId, updates }
    }),

  projectDeleted: (projectId: string) =>
    syncManager.emit({
      type: 'project_deleted', 
      source: 'project',
      payload: { projectId }
    }),

  taskStatusChanged: (taskId: string, newStatus: string, departmentTaskId?: string, projectId?: string) =>
    syncManager.emit({
      type: 'task_status_changed',
      source: 'task', 
      payload: { taskId, newStatus, departmentTaskId, projectId }
    }),

  departmentTaskUpdated: (departmentTaskId: string, projectId: string, milestoneId?: string) =>
    syncManager.emit({
      type: 'department_task_updated',
      source: 'task',
      payload: { departmentTaskId, projectId, milestoneId }
    }),

  milestoneCompleted: (milestoneId: string, projectId: string) =>
    syncManager.emit({
      type: 'milestone_completed',
      source: 'task',
      payload: { milestoneId, projectId }
    }),

  memberAdded: (projectId: string, userId: string) =>
    syncManager.emit({
      type: 'member_added',
      source: 'project',
      payload: { projectId, userId }
    }),

  memberRemoved: (projectId: string, userId: string) =>
    syncManager.emit({
      type: 'member_removed',
      source: 'project', 
      payload: { projectId, userId }
    }),

  aiRecommendationApplied: (type: string, targetId: string, userId?: string) =>
    syncManager.emit({
      type: 'ai_recommendation_applied',
      source: 'ai',
      payload: { type, targetId, userId }
    })
}