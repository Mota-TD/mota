import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 用户类型定义
export interface User {
  id: number
  name: string
  email: string
  avatar?: string
  role: string
}

// 认证状态类型
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

/**
 * 认证状态管理
 * 使用 Zustand 进行状态管理，并持久化到 localStorage
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // 登录
      login: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
        })
      },

      // 登出
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },

      // 更新用户信息
      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }))
      },
    }),
    {
      name: 'mota-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)