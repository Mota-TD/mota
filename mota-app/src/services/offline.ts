import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { useProjectStore } from '@/stores/project'
import { useTaskStore } from '@/stores/task'
import { api } from './api'

interface SyncOperation {
  id: string
  type: 'create' | 'update' | 'delete'
  entity: 'task' | 'project' | 'comment'
  data: any
  timestamp: Date
  retryCount: number
}

export class OfflineManager {
  private static instance: OfflineManager
  private operations = ref<SyncOperation[]>([])
  private isOnline = ref(true)
  private syncInterval: number | null = null

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager()
    }
    return OfflineManager.instance
  }

  constructor() {
    // 构造函数中不自动初始化，由外部调用
  }

  init() {
    // 监听网络状态变化
    uni.onNetworkStatusChange((res) => {
      this.isOnline.value = res.isConnected
      
      if (res.isConnected) {
        this.onReconnect()
      }
      
      // 更新应用状态
      const appStore = useAppStore()
      appStore.setNetworkStatus(res.isConnected)
    })

    // 初始化网络状态
    uni.getNetworkType({
      success: (res) => {
        this.isOnline.value = res.networkType !== 'none'
        const appStore = useAppStore()
        appStore.setNetworkStatus(res.networkType !== 'none')
      }
    })

    // 启动同步定时器
    this.startSyncTimer()
    
    // 加载待同步操作
    this.loadPendingOperations()
  }

  // 网络状态
  get onlineStatus() {
    return computed(() => this.isOnline.value)
  }

  get pendingOperations() {
    return computed(() => this.operations.value)
  }

  get pendingCount() {
    return computed(() => this.operations.value.length)
  }

  // 添加同步操作
  addOperation(type: SyncOperation['type'], entity: SyncOperation['entity'], data: any) {
    const operation: SyncOperation = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      entity,
      data,
      timestamp: new Date(),
      retryCount: 0
    }

    this.operations.value.push(operation)
    this.savePendingOperations()
    
    // 如果在线，尝试立即同步
    if (this.isOnline.value) {
      this.syncOperations()
    }

    return operation.id
  }

  // 同步操作到服务器
  private async syncOperations() {
    if (!this.isOnline.value || this.operations.value.length === 0) {
      return
    }

    const operationsToSync = [...this.operations.value]
    
    for (const operation of operationsToSync) {
      try {
        const success = await this.executeOperation(operation)
        
        if (success) {
          // 同步成功，移除操作
          this.removeOperation(operation.id)
        } else {
          // 同步失败，增加重试计数
          operation.retryCount++
          
          // 如果重试次数过多，标记为失败
          if (operation.retryCount >= 3) {
            console.warn(`操作 ${operation.id} 同步失败，已达到最大重试次数`)
            this.removeOperation(operation.id)
          }
        }
      } catch (error) {
        console.error(`同步操作 ${operation.id} 时出错:`, error)
        operation.retryCount++
        
        if (operation.retryCount >= 3) {
          this.removeOperation(operation.id)
        }
      }
    }

    this.savePendingOperations()
  }

  // 执行具体操作
  private async executeOperation(operation: SyncOperation): Promise<boolean> {
    try {
      switch (operation.entity) {
        case 'task':
          switch (operation.type) {
            case 'create':
              await api.createTask(operation.data)
              break
            case 'update':
              await api.updateTask(operation.data.id, operation.data)
              break
            case 'delete':
              await api.deleteTask(operation.data.id)
              break
          }
          break
        
        case 'project':
          switch (operation.type) {
            case 'create':
              await api.createProject(operation.data)
              break
            case 'update':
              await api.updateProject(operation.data.id, operation.data)
              break
            case 'delete':
              await api.deleteProject(operation.data.id)
              break
          }
          break
        
        case 'comment':
          if (operation.type === 'create') {
            await api.addTaskComment(operation.data.taskId, operation.data.comment)
          }
          break
      }
      
      return true
    } catch (error) {
      console.error(`执行操作失败:`, error)
      return false
    }
  }

  // 移除操作
  private removeOperation(id: string) {
    const index = this.operations.value.findIndex(op => op.id === id)
    if (index !== -1) {
      this.operations.value.splice(index, 1)
      this.savePendingOperations()
    }
  }

  // 网络恢复时的处理
  private onReconnect() {
    console.log('网络已恢复，开始同步待处理操作...')
    this.syncOperations()
  }

  // 保存待同步操作到本地存储
  private savePendingOperations() {
    uni.setStorageSync('pending_operations', this.operations.value)
  }

  // 从本地存储加载待同步操作
  private loadPendingOperations() {
    const saved = uni.getStorageSync('pending_operations')
    if (saved && Array.isArray(saved)) {
      this.operations.value = saved.map(op => ({
        ...op,
        timestamp: new Date(op.timestamp)
      }))
    }
  }

  // 启动同步定时器
  private startSyncTimer() {
    this.syncInterval = setInterval(() => {
      if (this.isOnline.value && this.operations.value.length > 0) {
        this.syncOperations()
      }
    }, 30000) // 每30秒尝试同步一次
  }

  // 停止同步定时器
  stopSyncTimer() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  // 手动触发同步
  async manualSync() {
    if (!this.isOnline.value) {
      throw new Error('当前处于离线状态，无法同步')
    }
    
    await this.syncOperations()
  }

  // 清除所有待同步操作
  clearAllOperations() {
    this.operations.value = []
    this.savePendingOperations()
  }

  // 获取离线存储统计
  getStorageStats() {
    const userStore = useUserStore()
    const projectStore = useProjectStore()
    const taskStore = useTaskStore()

    return {
      users: userStore.users.length,
      projects: projectStore.projects.length,
      tasks: taskStore.tasks.length,
      pendingOperations: this.operations.value.length,
      lastSync: new Date().toISOString()
    }
  }
}

// 导出单例实例
export const offlineManager = OfflineManager.getInstance()

// 组合式函数
export function useOffline() {
  const manager = offlineManager
  
  return {
    // 状态
    isOnline: manager.onlineStatus,
    pendingOperations: manager.pendingOperations,
    pendingCount: manager.pendingCount,
    
    // 方法
    addOperation: manager.addOperation.bind(manager),
    manualSync: manager.manualSync.bind(manager),
    clearAllOperations: manager.clearAllOperations.bind(manager),
    getStorageStats: manager.getStorageStats.bind(manager)
  }
}