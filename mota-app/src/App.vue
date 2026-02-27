<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import pinia from './stores'
import { useAppStore } from './stores/app'
import { useUserStore } from './stores/user'
import { useProjectStore } from './stores/project'
import { useTaskStore } from './stores/task'
import { offlineManager } from './services/offline'
import { notificationService } from './services/notification'

// 挂载Pinia到全局
uni.$pinia = pinia

onLaunch(() => {
  console.log('摩塔应用启动')
  
  // 初始化所有store
  const appStore = useAppStore()
  const userStore = useUserStore()
  const projectStore = useProjectStore()
  const taskStore = useTaskStore()
  
  try {
    // 初始化应用配置
    appStore.initialize()
    
    // 初始化用户数据
    userStore.initialize()
    
    // 初始化项目数据
    projectStore.initialize()
    
    // 初始化任务数据
    taskStore.initialize()
    
    // 初始化离线管理器（自动启动）
    offlineManager.init()
    console.log('离线管理器初始化完成')
    
    // 初始化通知服务（自动启动）
    notificationService.init()
    console.log('通知服务初始化完成')
    
    console.log('应用初始化完成')
    
    // 发送启动通知
    notificationService.sendNotification({
      title: '应用启动成功',
      message: '摩塔移动端已准备就绪',
      type: 'success',
      priority: 'normal',
      category: 'system'
    })
    
    // 检查更新
    checkForUpdates()
    
  } catch (error) {
    console.error('应用初始化失败:', error)
    
    notificationService.sendNotification({
      title: '初始化失败',
      message: '应用初始化过程中出现错误',
      type: 'error',
      priority: 'high',
      category: 'system'
    })
  }
})

onShow(() => {
  console.log('应用显示')
  
  // 应用显示时刷新数据
  refreshData()
})

onHide(() => {
  console.log('应用隐藏')
  
  // 应用隐藏时保存数据
  saveData()
})

// 检查应用更新
const checkForUpdates = async () => {
  if (uni.getUpdateManager) {
    const updateManager = uni.getUpdateManager()
    
    updateManager.onCheckForUpdate((res) => {
      if (res.hasUpdate) {
        console.log('发现新版本')
        
        const appStore = useAppStore()
        appStore.addNotification({
          type: 'info',
          title: '发现新版本',
          message: '应用有新版本可用，准备更新'
        })
      }
    })
    
    updateManager.onUpdateReady(() => {
      uni.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: (res) => {
          if (res.confirm) {
            updateManager.applyUpdate()
          }
        }
      })
    })
    
    updateManager.onUpdateFailed(() => {
      console.error('更新失败')
      
      const appStore = useAppStore()
      appStore.addNotification({
        type: 'error',
        title: '更新失败',
        message: '应用更新失败，请稍后重试'
      })
    })
  }
}

// 刷新数据
const refreshData = async () => {
  try {
    const userStore = useUserStore()
    const projectStore = useProjectStore()
    const taskStore = useTaskStore()
    
    // 如果用户已登录，刷新用户数据
    if (userStore.isAuthenticated) {
      await userStore.refreshStats()
    }
    
    // 刷新项目数据
    await projectStore.loadProjects()
    
    // 刷新任务数据
    await taskStore.loadTasks()
    
    console.log('数据刷新完成')
    
  } catch (error) {
    console.error('数据刷新失败:', error)
  }
}

// 保存数据
const saveData = () => {
  try {
    const projectStore = useProjectStore()
    const taskStore = useTaskStore()
    
    // 保存项目数据
    projectStore.saveToStorage()
    
    // 保存任务数据
    taskStore.saveToStorage()
    
    console.log('数据保存完成')
    
  } catch (error) {
    console.error('数据保存失败:', error)
  }
}
</script>

<style lang="scss">
/* 引入全局样式 */
@import './styles/global.scss';

/* 全局动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

/* 加载动画 */
.loading-spinner {
  display: inline-block;
  width: 40rpx;
  height: 40rpx;
  border: 4rpx solid #f3f3f3;
  border-top: 4rpx solid #10B981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误状态样式 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
  text-align: center;
  
  .error-icon {
    font-size: 120rpx;
    margin-bottom: 40rpx;
    opacity: 0.5;
  }
  
  .error-text {
    font-size: 32rpx;
    color: #6B7280;
    margin-bottom: 20rpx;
  }
  
  .error-desc {
    font-size: 28rpx;
    color: #9CA3AF;
    line-height: 1.6;
  }
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  text-align: center;
  
  .empty-icon {
    font-size: 120rpx;
    margin-bottom: 40rpx;
    opacity: 0.3;
  }
  
  .empty-text {
    font-size: 32rpx;
    color: #6B7280;
    margin-bottom: 20rpx;
  }
  
  .empty-desc {
    font-size: 28rpx;
    color: #9CA3AF;
    line-height: 1.6;
  }
}

/* 响应式适配 */
@media (max-width: 375px) {
  .container {
    padding: 24rpx;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 750px;
    margin: 0 auto;
  }
}
</style>