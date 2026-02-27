import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { notificationService } from '@/services/notification'
import { offlineManager } from '@/services/offline'

interface AppConfig {
  theme: 'light' | 'dark' | 'auto'
  language: string
  offlineMode: boolean
  pushNotifications: boolean
}

export const useAppStore = defineStore('app', () => {
  // 状态
  const loading = ref(false)
  const networkStatus = ref<'online' | 'offline'>('online')
  const config = ref<AppConfig>({
    theme: 'light',
    language: 'zh-CN',
    offlineMode: false,
    pushNotifications: true
  })

  // 计算属性
  const isLoading = computed(() => loading.value)
  const isOnline = computed(() => networkStatus.value === 'online')

  // 操作
  const setLoading = (status: boolean) => {
    loading.value = status
  }

  const setNetworkStatus = (status: 'online' | 'offline') => {
    networkStatus.value = status
    
    // 网络状态变化时发送通知
    if (status === 'offline') {
      notificationService.sendNotification({
        title: '网络连接已断开',
        message: '当前处于离线模式，部分功能可能受限',
        type: 'warning',
        priority: 'normal',
        category: 'system'
      })
    } else {
      notificationService.sendNotification({
        title: '网络连接已恢复',
        message: '已重新连接到服务器',
        type: 'success',
        priority: 'normal',
        category: 'system'
      })
    }
  }

  const updateConfig = (newConfig: Partial<AppConfig>) => {
    config.value = { ...config.value, ...newConfig }
    
    // 保存到本地存储
    uni.setStorageSync('app_config', config.value)
    
    // 配置变更时发送通知
    if (newConfig.pushNotifications !== undefined) {
      notificationService.sendNotification({
        title: '推送通知设置已更新',
        message: `推送通知已${newConfig.pushNotifications ? '开启' : '关闭'}`,
        type: 'info',
        priority: 'low',
        category: 'system'
      })
    }
  }

  const loadConfig = () => {
    const savedConfig = uni.getStorageSync('app_config')
    if (savedConfig) {
      config.value = { ...config.value, ...savedConfig }
    }
  }

  // 获取离线统计信息
  const getOfflineStats = () => {
    return offlineManager.getStorageStats()
  }

  // 手动同步离线数据
  const syncOfflineData = async () => {
    try {
      setLoading(true)
      await offlineManager.manualSync()
      
      notificationService.sendNotification({
        title: '数据同步完成',
        message: '离线数据已成功同步到服务器',
        type: 'success',
        priority: 'normal',
        category: 'system'
      })
      
    } catch (error) {
      console.error('数据同步失败:', error)
      
      notificationService.sendNotification({
        title: '数据同步失败',
        message: '请检查网络连接后重试',
        type: 'error',
        priority: 'normal',
        category: 'system'
      })
      
      throw error
    } finally {
      setLoading(false)
    }
  }

  // 请求通知权限
  const requestNotificationPermission = async () => {
    try {
      const granted = await notificationService.requestPermission()
      
      if (granted) {
        notificationService.sendNotification({
          title: '通知权限已授权',
          message: '您将收到重要的应用通知',
          type: 'success',
          priority: 'normal',
          category: 'system'
        })
      }
      
      return granted
    } catch (error) {
      console.error('请求通知权限失败:', error)
      return false
    }
  }

  // 初始化
  const initialize = () => {
    loadConfig()
    
    // 监听网络状态
    uni.onNetworkStatusChange((res) => {
      setNetworkStatus(res.isConnected ? 'online' : 'offline')
    })
    
    // 获取当前网络状态
    uni.getNetworkType({
      success: (res) => {
        setNetworkStatus(res.networkType !== 'none' ? 'online' : 'offline')
      }
    })
  }

  return {
    // 状态
    loading,
    networkStatus,
    config,
    
    // 计算属性
    isLoading,
    isOnline,
    
    // 操作
    setLoading,
    setNetworkStatus,
    updateConfig,
    loadConfig,
    getOfflineStats,
    syncOfflineData,
    requestNotificationPermission,
    initialize
  }
})