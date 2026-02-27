import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'system'
  priority: 'low' | 'normal' | 'high'
  category: 'task' | 'project' | 'system' | 'message'
  data?: any
  read: boolean
  timestamp: Date
  expiresAt?: Date
}

export class NotificationService {
  private static instance: NotificationService
  private notifications = ref<Notification[]>([])
  private isPermissionGranted = ref(false)
  private badgeCount = ref(0)

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  constructor() {
    // 构造函数中不自动初始化，由外部调用
  }

  async init() {
    // 检查权限
    await this.checkPermission()
    
    // 加载已保存的通知
    this.loadNotifications()
    
    // 设置定时清理过期通知
    setInterval(() => {
      this.cleanupExpiredNotifications()
    }, 60000) // 每分钟检查一次
    
    // 模拟接收推送（开发环境）
    this.startMockPush()
  }

  // 检查通知权限
  async checkPermission(): Promise<boolean> {
    try {
      // 在uni-app中，使用uni的API检查权限
      const result = await new Promise<boolean>((resolve) => {
        // 模拟权限检查
        setTimeout(() => {
          this.isPermissionGranted.value = true
          resolve(true)
        }, 100)
      })
      
      return result
    } catch (error) {
      console.error('检查通知权限失败:', error)
      return false
    }
  }

  // 请求通知权限
  async requestPermission(): Promise<boolean> {
    try {
      // 模拟权限请求
      const granted = await new Promise<boolean>((resolve) => {
        // 在实际应用中，这里会调用uni.requestPermission等API
        setTimeout(() => {
          this.isPermissionGranted.value = true
          resolve(true)
        }, 500)
      })
      
      return granted
    } catch (error) {
      console.error('请求通知权限失败:', error)
      return false
    }
  }

  // 发送通知
  async sendNotification(notification: Omit<Notification, 'id' | 'read' | 'timestamp'>): Promise<string> {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      read: false,
      timestamp: new Date()
    }

    this.notifications.value.unshift(newNotification)
    
    // 更新角标计数
    this.updateBadgeCount()
    
    // 保存到本地存储
    this.saveNotifications()
    
    // 显示系统通知（如果有权限）
    if (this.isPermissionGranted.value) {
      this.showSystemNotification(newNotification)
    }
    
    return newNotification.id
  }

  // 显示系统通知
  private showSystemNotification(notification: Notification) {
    // 在uni-app中，可以使用uni.showToast或uni.showModal
    switch (notification.priority) {
      case 'high':
        uni.showModal({
          title: notification.title,
          content: notification.message,
          showCancel: false
        })
        break
      case 'normal':
        uni.showToast({
          title: notification.title,
          icon: 'none',
          duration: 3000
        })
        break
      case 'low':
        // 低优先级通知只在通知中心显示
        break
    }
  }

  // 标记为已读
  markAsRead(id: string) {
    const notification = this.notifications.value.find(n => n.id === id)
    if (notification && !notification.read) {
      notification.read = true
      this.updateBadgeCount()
      this.saveNotifications()
    }
  }

  // 标记所有为已读
  markAllAsRead() {
    this.notifications.value.forEach(n => {
      n.read = true
    })
    this.badgeCount.value = 0
    this.saveNotifications()
    
    // 更新应用角标
    this.updateAppBadge()
  }

  // 删除通知
  deleteNotification(id: string) {
    const index = this.notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      const notification = this.notifications.value[index]
      if (!notification.read) {
        this.badgeCount.value = Math.max(0, this.badgeCount.value - 1)
      }
      this.notifications.value.splice(index, 1)
      this.saveNotifications()
    }
  }

  // 清理过期通知
  private cleanupExpiredNotifications() {
    const now = new Date()
    this.notifications.value = this.notifications.value.filter(n => {
      if (n.expiresAt && n.expiresAt < now) {
        return false
      }
      return true
    })
    this.saveNotifications()
  }

  // 更新角标计数
  private updateBadgeCount() {
    this.badgeCount.value = this.notifications.value.filter(n => !n.read).length
    this.updateAppBadge()
  }

  // 更新应用角标
  private updateAppBadge() {
    // 在uni-app中，可以使用uni.setTabBarBadge更新标签页角标
    if (this.badgeCount.value > 0) {
      uni.setTabBarBadge({
        index: 0, // 假设工作台是第一个标签页
        text: this.badgeCount.value > 99 ? '99+' : this.badgeCount.value.toString()
      })
    } else {
      uni.removeTabBarBadge({ index: 0 })
    }
  }

  // 保存通知到本地存储
  private saveNotifications() {
    uni.setStorageSync('notifications', this.notifications.value)
  }

  // 从本地存储加载通知
  private loadNotifications() {
    const saved = uni.getStorageSync('notifications')
    if (saved && Array.isArray(saved)) {
      this.notifications.value = saved.map(n => ({
        ...n,
        timestamp: new Date(n.timestamp),
        expiresAt: n.expiresAt ? new Date(n.expiresAt) : undefined
      }))
      this.updateBadgeCount()
    }
  }

  // 模拟推送（开发环境）
  private startMockPush() {
    // 只在开发环境启用
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        // 随机发送一些模拟通知
        if (Math.random() < 0.3) { // 30%概率
          const types: Notification['type'][] = ['info', 'success', 'warning']
          const categories: Notification['category'][] = ['task', 'project', 'system']
          
          this.sendNotification({
            title: this.getMockTitle(categories[Math.floor(Math.random() * categories.length)]),
            message: this.getMockMessage(),
            type: types[Math.floor(Math.random() * types.length)],
            priority: 'normal',
            category: categories[Math.floor(Math.random() * categories.length)]
          })
        }
      }, 30000) // 每30秒可能发送一次
    }
  }

  private getMockTitle(category: Notification['category']): string {
    const titles = {
      task: ['新任务分配', '任务状态更新', '任务即将到期'],
      project: ['项目进度更新', '新项目创建', '项目文档更新'],
      system: ['系统维护通知', '新版本发布', '数据备份完成']
    }
    
    const categoryTitles = titles[category] || titles.system
    return categoryTitles[Math.floor(Math.random() * categoryTitles.length)]
  }

  private getMockMessage(): string {
    const messages = [
      '请及时处理相关事务',
      '详细信息请查看应用内通知',
      '如有疑问请联系管理员',
      '请确保在截止日期前完成',
      '系统已自动处理相关操作'
    ]
    
    return messages[Math.floor(Math.random() * messages.length)]
  }

  // 获取通知列表
  getNotifications() {
    return computed(() => this.notifications.value)
  }

  // 获取未读通知
  getUnreadNotifications() {
    return computed(() => this.notifications.value.filter(n => !n.read))
  }

  // 获取角标计数
  getBadgeCount() {
    return computed(() => this.badgeCount.value)
  }

  // 获取权限状态
  getPermissionStatus() {
    return computed(() => this.isPermissionGranted.value)
  }

  // 按类别筛选通知
  getNotificationsByCategory(category: Notification['category']) {
    return computed(() => this.notifications.value.filter(n => n.category === category))
  }

  // 发送任务相关通知
  async sendTaskNotification(taskId: string, action: string, data?: any) {
    const titles = {
      created: '新任务创建',
      updated: '任务更新',
      completed: '任务完成',
      overdue: '任务逾期'
    }
    
    return this.sendNotification({
      title: titles[action as keyof typeof titles] || '任务通知',
      message: `任务ID: ${taskId} ${action}`,
      type: action === 'overdue' ? 'warning' : 'info',
      priority: action === 'overdue' ? 'high' : 'normal',
      category: 'task',
      data: { taskId, action, ...data }
    })
  }

  // 发送项目相关通知
  async sendProjectNotification(projectId: string, action: string, data?: any) {
    const titles = {
      created: '新项目创建',
      updated: '项目更新',
      completed: '项目完成'
    }
    
    return this.sendNotification({
      title: titles[action as keyof typeof titles] || '项目通知',
      message: `项目ID: ${projectId} ${action}`,
      type: 'info',
      priority: 'normal',
      category: 'project',
      data: { projectId, action, ...data }
    })
  }
}

// 导出单例实例
export const notificationService = NotificationService.getInstance()

// 组合式函数
export function useNotification() {
  const service = notificationService
  
  return {
    // 状态
    notifications: service.getNotifications(),
    unreadNotifications: service.getUnreadNotifications(),
    badgeCount: service.getBadgeCount(),
    permissionGranted: service.getPermissionStatus(),
    
    // 方法
    sendNotification: service.sendNotification.bind(service),
    markAsRead: service.markAsRead.bind(service),
    markAllAsRead: service.markAllAsRead.bind(service),
    deleteNotification: service.deleteNotification.bind(service),
    requestPermission: service.requestPermission.bind(service),
    sendTaskNotification: service.sendTaskNotification.bind(service),
    sendProjectNotification: service.sendProjectNotification.bind(service)
  }
}