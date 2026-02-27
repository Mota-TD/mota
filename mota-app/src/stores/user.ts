import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface User {
  id: string
  username: string
  email: string
  avatar?: string
  role: 'admin' | 'user' | 'guest'
  lastLogin?: Date
  preferences: {
    emailNotifications: boolean
    pushNotifications: boolean
    darkMode: boolean
    language: string
  }
}

interface UserStats {
  projects: number
  tasks: number
  completedTasks: number
  messages: number
  loginDays: number
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const currentUser = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const userStats = ref<UserStats>({
    projects: 0,
    tasks: 0,
    completedTasks: 0,
    messages: 0,
    loginDays: 0
  })
  const loginError = ref<string | null>(null)

  // 计算属性
  const userInfo = computed(() => currentUser.value)
  const isAdmin = computed(() => currentUser.value?.role === 'admin')
  const taskCompletionRate = computed(() => {
    if (userStats.value.tasks === 0) return 0
    return Math.round((userStats.value.completedTasks / userStats.value.tasks) * 100)
  })

  // 操作
  const login = async (credentials: { username: string; password: string }) => {
    try {
      loginError.value = null
      
      // 模拟登录API调用
      const response = await new Promise<{ data: User; stats: UserStats }>((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              id: '1',
              username: credentials.username,
              email: `${credentials.username}@example.com`,
              role: 'user',
              preferences: {
                emailNotifications: true,
                pushNotifications: true,
                darkMode: false,
                language: 'zh-CN'
              }
            },
            stats: {
              projects: 12,
              tasks: 47,
              completedTasks: 35,
              messages: 8,
              loginDays: 15
            }
          })
        }, 1000)
      })

      currentUser.value = response.data
      userStats.value = response.stats
      isAuthenticated.value = true
      
      // 保存用户信息到本地存储
      uni.setStorageSync('current_user', currentUser.value)
      uni.setStorageSync('user_stats', userStats.value)
      
      return { success: true }
    } catch (error) {
      loginError.value = '登录失败，请检查用户名和密码'
      return { success: false, error: loginError.value }
    }
  }

  const logout = async () => {
    try {
      // 模拟登出API调用
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      currentUser.value = null
      isAuthenticated.value = false
      userStats.value = {
        projects: 0,
        tasks: 0,
        completedTasks: 0,
        messages: 0,
        loginDays: 0
      }
      
      // 清除本地存储
      uni.removeStorageSync('current_user')
      uni.removeStorageSync('user_stats')
      
      return { success: true }
    } catch (error) {
      console.error('登出失败:', error)
      return { success: false }
    }
  }

  const updateProfile = async (profileData: Partial<User>) => {
    if (!currentUser.value) return { success: false }
    
    try {
      // 模拟更新API调用
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      currentUser.value = { ...currentUser.value, ...profileData }
      
      // 更新本地存储
      uni.setStorageSync('current_user', currentUser.value)
      
      return { success: true }
    } catch (error) {
      console.error('更新资料失败:', error)
      return { success: false }
    }
  }

  const updatePreferences = async (preferences: Partial<User['preferences']>) => {
    if (!currentUser.value) return { success: false }
    
    try {
      currentUser.value.preferences = { 
        ...currentUser.value.preferences, 
        ...preferences 
      }
      
      // 更新本地存储
      uni.setStorageSync('current_user', currentUser.value)
      
      return { success: true }
    } catch (error) {
      console.error('更新偏好设置失败:', error)
      return { success: false }
    }
  }

  const loadUserFromStorage = () => {
    const savedUser = uni.getStorageSync('current_user')
    const savedStats = uni.getStorageSync('user_stats')
    
    if (savedUser) {
      currentUser.value = savedUser
      isAuthenticated.value = true
    }
    
    if (savedStats) {
      userStats.value = savedStats
    }
  }

  const refreshStats = async () => {
    if (!currentUser.value) return
    
    try {
      // 模拟刷新统计数据
      const newStats = await new Promise<UserStats>((resolve) => {
        setTimeout(() => {
          resolve({
            projects: Math.floor(Math.random() * 20) + 5,
            tasks: Math.floor(Math.random() * 100) + 20,
            completedTasks: Math.floor(Math.random() * 80) + 10,
            messages: Math.floor(Math.random() * 15) + 3,
            loginDays: Math.floor(Math.random() * 30) + 10
          })
        }, 500)
      })
      
      userStats.value = newStats
      uni.setStorageSync('user_stats', userStats.value)
      
      return { success: true }
    } catch (error) {
      console.error('刷新统计数据失败:', error)
      return { success: false }
    }
  }

  // 初始化
  const initialize = () => {
    loadUserFromStorage()
  }

  return {
    // 状态
    currentUser,
    isAuthenticated,
    userStats,
    loginError,
    
    // 计算属性
    userInfo,
    isAdmin,
    taskCompletionRate,
    
    // 操作
    login,
    logout,
    updateProfile,
    updatePreferences,
    loadUserFromStorage,
    refreshStats,
    initialize
  }
})