<template>
  <view class="settings-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left">
        <view class="back-btn" @click="goBack">
          <text class="iconfont icon-arrow-left"></text>
        </view>
      </view>
      <view class="nav-title">设置</view>
      <view class="nav-right"></view>
    </view>

    <scroll-view scroll-y class="scroll-content">
      <!-- 用户信息 -->
      <view class="user-section">
        <view class="user-avatar">
          <text class="avatar-text">{{ userInitial }}</text>
        </view>
        <view class="user-info">
          <text class="user-name">{{ currentUser?.name || '未登录' }}</text>
          <text class="user-email">{{ currentUser?.email || '请先登录' }}</text>
        </view>
        <view class="user-action" @click="editProfile">
          <text class="iconfont icon-edit"></text>
        </view>
      </view>

      <!-- 应用设置 -->
      <view class="settings-group">
        <view class="group-title">应用设置</view>
        
        <view class="setting-item" @click="toggleTheme">
          <view class="setting-left">
            <text class="iconfont icon-theme"></text>
            <text class="setting-label">主题模式</text>
          </view>
          <view class="setting-right">
            <text class="setting-value">{{ themeText }}</text>
            <text class="iconfont icon-arrow-right"></text>
          </view>
        </view>

        <view class="setting-item" @click="navigateToLanguage">
          <view class="setting-left">
            <text class="iconfont icon-language"></text>
            <text class="setting-label">语言设置</text>
          </view>
          <view class="setting-right">
            <text class="setting-value">{{ languageText }}</text>
            <text class="iconfont icon-arrow-right"></text>
          </view>
        </view>

        <view class="setting-item">
          <view class="setting-left">
            <text class="iconfont icon-notification"></text>
            <text class="setting-label">推送通知</text>
          </view>
          <view class="setting-right">
            <switch 
              :checked="config.pushNotifications" 
              @change="togglePushNotifications"
              color="#10b981"
            />
          </view>
        </view>

        <view class="setting-item">
          <view class="setting-left">
            <text class="iconfont icon-offline"></text>
            <text class="setting-label">离线模式</text>
          </view>
          <view class="setting-right">
            <switch 
              :checked="config.offlineMode" 
              @change="toggleOfflineMode"
              color="#10b981"
            />
          </view>
        </view>
      </view>

      <!-- 通知设置 -->
      <view class="settings-group">
        <view class="group-title">通知设置</view>
        
        <view class="setting-item">
          <view class="setting-left">
            <text class="iconfont icon-task"></text>
            <text class="setting-label">任务通知</text>
          </view>
          <view class="setting-right">
            <switch 
              :checked="true" 
              @change="toggleTaskNotifications"
              color="#10b981"
            />
          </view>
        </view>

        <view class="setting-item">
          <view class="setting-left">
            <text class="iconfont icon-project"></text>
            <text class="setting-label">项目通知</text>
          </view>
          <view class="setting-right">
            <switch 
              :checked="true" 
              @change="toggleProjectNotifications"
              color="#10b981"
            />
          </view>
        </view>

        <view class="setting-item">
          <view class="setting-left">
            <text class="iconfont icon-system"></text>
            <text class="setting-label">系统通知</text>
          </view>
          <view class="setting-right">
            <switch 
              :checked="true" 
              @change="toggleSystemNotifications"
              color="#10b981"
            />
          </view>
        </view>

        <view class="setting-item" @click="manageNotifications">
          <view class="setting-left">
            <text class="iconfont icon-bell"></text>
            <text class="setting-label">通知中心</text>
            <view v-if="unreadCount > 0" class="badge">{{ unreadCount }}</view>
          </view>
          <view class="setting-right">
            <text class="iconfont icon-arrow-right"></text>
          </view>
        </view>
      </view>

      <!-- 数据管理 -->
      <view class="settings-group">
        <view class="group-title">数据管理</view>
        
        <view class="setting-item" @click="syncData">
          <view class="setting-left">
            <text class="iconfont icon-sync"></text>
            <text class="setting-label">同步数据</text>
          </view>
          <view class="setting-right">
            <text class="setting-status" :class="{ 'syncing': isSyncing }">
              {{ syncStatus }}
            </text>
            <text v-if="!isSyncing" class="iconfont icon-refresh"></text>
          </view>
        </view>

        <view class="setting-item" @click="showStorageInfo">
          <view class="setting-left">
            <text class="iconfont icon-storage"></text>
            <text class="setting-label">存储空间</text>
          </view>
          <view class="setting-right">
            <text class="setting-value">{{ storageInfo }}</text>
            <text class="iconfont icon-arrow-right"></text>
          </view>
        </view>

        <view class="setting-item" @click="exportData">
          <view class="setting-left">
            <text class="iconfont icon-export"></text>
            <text class="setting-label">导出数据</text>
          </view>
          <view class="setting-right">
            <text class="iconfont icon-arrow-right"></text>
          </view>
        </view>

        <view class="setting-item danger" @click="clearCache">
          <view class="setting-left">
            <text class="iconfont icon-clear"></text>
            <text class="setting-label">清除缓存</text>
          </view>
          <view class="setting-right">
            <text class="setting-value">{{ cacheSize }}</text>
            <text class="iconfont icon-arrow-right"></text>
          </view>
        </view>
      </view>

      <!-- 关于应用 -->
      <view class="settings-group">
        <view class="group-title">关于应用</view>
        
        <view class="setting-item" @click="checkUpdate">
          <view class="setting-left">
            <text class="iconfont icon-update"></text>
            <text class="setting-label">检查更新</text>
          </view>
          <view class="setting-right">
            <text class="setting-value">v{{ appVersion }}</text>
            <text class="iconfont icon-arrow-right"></text>
          </view>
        </view>

        <view class="setting-item" @click="showAbout">
          <view class="setting-left">
            <text class="iconfont icon-info"></text>
            <text class="setting-label">关于摩塔</text>
          </view>
          <view class="setting-right">
            <text class="iconfont icon-arrow-right"></text>
          </view>
        </view>

        <view class="setting-item" @click="showHelp">
          <view class="setting-left">
            <text class="iconfont icon-help"></text>
            <text class="setting-label">帮助中心</text>
          </view>
          <view class="setting-right">
            <text class="iconfont icon-arrow-right"></text>
          </view>
        </view>

        <view class="setting-item" @click="contactSupport">
          <view class="setting-left">
            <text class="iconfont icon-support"></text>
            <text class="setting-label">联系支持</text>
          </view>
          <view class="setting-right">
            <text class="iconfont icon-arrow-right"></text>
          </view>
        </view>
      </view>

      <!-- 账户操作 -->
      <view class="settings-group">
        <view class="setting-item danger" @click="logout">
          <view class="setting-left">
            <text class="iconfont icon-logout"></text>
            <text class="setting-label">退出登录</text>
          </view>
          <view class="setting-right">
            <text class="iconfont icon-arrow-right"></text>
          </view>
        </view>

        <view class="setting-item danger" @click="deleteAccount">
          <view class="setting-left">
            <text class="iconfont icon-delete"></text>
            <text class="setting-label">删除账户</text>
          </view>
          <view class="setting-right">
            <text class="iconfont icon-arrow-right"></text>
          </view>
        </view>
      </view>

      <!-- 版本信息 -->
      <view class="version-info">
        <text class="version-text">摩塔移动端 v{{ appVersion }}</text>
        <text class="copyright">© 2024 摩塔科技. 保留所有权利.</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { useNotification } from '@/services/notification'
import { useOffline } from '@/services/offline'

// Store
const appStore = useAppStore()
const userStore = useUserStore()
const { badgeCount, markAllAsRead } = useNotification()
const { pendingCount, getStorageStats } = useOffline()

// 状态
const isSyncing = ref(false)
const appVersion = ref('1.0.0')
const cacheSize = ref('0 MB')

// 计算属性
const currentUser = computed(() => userStore.currentUser)
const config = computed(() => appStore.config)
const unreadCount = computed(() => badgeCount.value)

const userInitial = computed(() => {
  return currentUser.value?.name?.charAt(0).toUpperCase() || 'U'
})

const themeText = computed(() => {
  const themes = {
    light: '浅色模式',
    dark: '深色模式',
    auto: '跟随系统'
  }
  return themes[config.value.theme] || '浅色模式'
})

const languageText = computed(() => {
  const languages = {
    'zh-CN': '简体中文',
    'en-US': 'English',
    'ja-JP': '日本語'
  }
  return languages[config.value.language] || '简体中文'
})

const syncStatus = computed(() => {
  if (isSyncing.value) return '同步中...'
  return pendingCount.value > 0 ? `${pendingCount.value} 项待同步` : '已同步'
})

const storageInfo = computed(() => {
  const stats = getStorageStats()
  return `${stats.tasks} 任务 / ${stats.projects} 项目`
})

// 生命周期
onMounted(() => {
  loadCacheSize()
})

// 方法
const goBack = () => {
  uni.navigateBack()
}

const editProfile = () => {
  if (!currentUser.value) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }
  
  uni.navigateTo({
    url: '/pages/profile/edit/index'
  })
}

const toggleTheme = () => {
  const themes: Array<'light' | 'dark' | 'auto'> = ['light', 'dark', 'auto']
  const currentIndex = themes.indexOf(config.value.theme)
  const nextIndex = (currentIndex + 1) % themes.length
  
  appStore.updateConfig({ theme: themes[nextIndex] })
  
  uni.showToast({
    title: `已切换到${themeText.value}`,
    icon: 'success'
  })
}

const navigateToLanguage = () => {
  uni.navigateTo({
    url: '/pages/settings/language/index'
  })
}

const togglePushNotifications = async (e: any) => {
  const enabled = e.detail.value
  
  if (enabled) {
    const granted = await appStore.requestNotificationPermission()
    if (!granted) {
      // 如果权限被拒绝，恢复开关状态
      appStore.updateConfig({ pushNotifications: false })
      return
    }
  }
  
  appStore.updateConfig({ pushNotifications: enabled })
}

const toggleOfflineMode = (e: any) => {
  appStore.updateConfig({ offlineMode: e.detail.value })
}

const toggleTaskNotifications = (e: any) => {
  uni.showToast({
    title: e.detail.value ? '任务通知已开启' : '任务通知已关闭',
    icon: 'success'
  })
}

const toggleProjectNotifications = (e: any) => {
  uni.showToast({
    title: e.detail.value ? '项目通知已开启' : '项目通知已关闭',
    icon: 'success'
  })
}

const toggleSystemNotifications = (e: any) => {
  uni.showToast({
    title: e.detail.value ? '系统通知已开启' : '系统通知已关闭',
    icon: 'success'
  })
}

const manageNotifications = () => {
  uni.navigateTo({
    url: '/pages/notifications/index'
  })
}

const syncData = async () => {
  if (isSyncing.value) return
  
  isSyncing.value = true
  
  try {
    await appStore.syncOfflineData()
    uni.showToast({
      title: '数据同步成功',
      icon: 'success'
    })
  } catch (error) {
    console.error('数据同步失败:', error)
  } finally {
    isSyncing.value = false
  }
}

const showStorageInfo = () => {
  const stats = getStorageStats()
  
  uni.showModal({
    title: '存储信息',
    content: `用户数: ${stats.users}\n项目数: ${stats.projects}\n任务数: ${stats.tasks}\n待同步操作: ${stats.pendingOperations}\n最后同步: ${new Date(stats.lastSync).toLocaleString()}`,
    showCancel: false
  })
}

const exportData = () => {
  uni.showToast({
    title: '导出功能开发中',
    icon: 'none'
  })
}

const clearCache = () => {
  uni.showModal({
    title: '清除缓存',
    content: '确定要清除所有缓存数据吗？这将删除本地存储的应用数据。',
    success: (res) => {
      if (res.confirm) {
        // 清除本地存储
        uni.clearStorageSync()
        
        // 重新初始化应用
        appStore.initialize()
        userStore.initialize()
        
        cacheSize.value = '0 MB'
        
        uni.showToast({
          title: '缓存已清除',
          icon: 'success'
        })
      }
    }
  })
}

const checkUpdate = () => {
  uni.showToast({
    title: '已是最新版本',
    icon: 'success'
  })
}

const showAbout = () => {
  uni.showModal({
    title: '关于摩塔',
    content: '摩塔移动端是一款专业的项目管理和团队协作工具，帮助您高效管理任务和项目进度。',
    showCancel: false
  })
}

const showHelp = () => {
  uni.navigateTo({
    url: '/pages/help/index'
  })
}

const contactSupport = () => {
  uni.showModal({
    title: '联系支持',
    content: '技术支持邮箱: support@mota.com\n客服电话: 400-123-4567',
    showCancel: false
  })
}

const logout = () => {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.showToast({
          title: '已退出登录',
          icon: 'success'
        })
        
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/login/index'
          })
        }, 1500)
      }
    }
  })
}

const deleteAccount = () => {
  uni.showModal({
    title: '删除账户',
    content: '此操作将永久删除您的账户和所有数据，且无法恢复。确定要继续吗？',
    confirmText: '删除',
    confirmColor: '#ef4444',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({
          title: '账户删除功能开发中',
          icon: 'none'
        })
      }
    }
  })
}

const loadCacheSize = () => {
  // 模拟计算缓存大小
  const size = Math.floor(Math.random() * 50) + 10
  cacheSize.value = `${size} MB`
}
</script>

<style lang="scss" scoped>
.settings-page {
  min-height: 100vh;
  background-color: #f8fafc;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background: white;
  border-bottom: 1rpx solid #e5e7eb;
  
  .nav-left, .nav-right {
    flex: 1;
  }
  
  .nav-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #1f2937;
    text-align: center;
  }
  
  .back-btn {
    padding: 20rpx;
    .iconfont {
      font-size: 36rpx;
      color: #6b7280;
    }
  }
}

.scroll-content {
  height: calc(100vh - 120rpx);
  padding-bottom: 40rpx;
}

.user-section {
  display: flex;
  align-items: center;
  padding: 40rpx 30rpx;
  background: white;
  margin-bottom: 20rpx;
  
  .user-avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #10b981, #3b82f6);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 30rpx;
    
    .avatar-text {
      font-size: 48rpx;
      font-weight: 600;
      color: white;
    }
  }
  
  .user-info {
    flex: 1;
    
    .user-name {
      display: block;
      font-size: 36rpx;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 8rpx;
    }
    
    .user-email {
      font-size: 28rpx;
      color: #6b7280;
    }
  }
  
  .user-action {
    padding: 20rpx;
    .iconfont {
      font-size: 36rpx;
      color: #6b7280;
    }
  }
}

.settings-group {
  background: white;
  margin-bottom: 20rpx;
  
  .group-title {
    padding: 30rpx 30rpx 20rpx;
    font-size: 28rpx;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 1rpx;
  }
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
  }
  
  &.danger {
    .setting-left {
      .iconfont, .setting-label {
        color: #ef4444;
      }
    }
    
    .setting-right {
      .iconfont {
        color: #ef4444;
      }
    }
  }
  
  .setting-left {
    display: flex;
    align-items: center;
    flex: 1;
    
    .iconfont {
      font-size: 36rpx;
      color: #6b7280;
      margin-right: 20rpx;
      width: 40rpx;
      text-align: center;
    }
    
    .setting-label {
      font-size: 32rpx;
      color: #1f2937;
      font-weight: 500;
    }
    
    .badge {
      background: #ef4444;
      color: white;
      font-size: 24rpx;
      padding: 4rpx 12rpx;
      border-radius: 20rpx;
      margin-left: 12rpx;
      min-width: 36rpx;
      text-align: center;
    }
  }
  
  .setting-right {
    display: flex;
    align-items: center;
    
    .setting-value {
      font-size: 28rpx;
      color: #6b7280;
      margin-right: 16rpx;
    }
    
    .setting-status {
      font-size: 28rpx;
      color: #6b7280;
      margin-right: 16rpx;
      
      &.syncing {
        color: #10b981;
      }
    }
    
    .iconfont {
      font-size: 28rpx;
      color: #9ca3af;
    }
  }
}

.version-info {
  text-align: center;
  padding: 60rpx 30rpx;
  
  .version-text {
    display: block;
    font-size: 28rpx;
    color: #6b7280;
    margin-bottom: 12rpx;
  }
  
  .copyright {
    font-size: 24rpx;
    color: #9ca3af;
  }
}

// 动画
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.syncing .iconfont {
  animation: spin 1s linear infinite;
}
</style>