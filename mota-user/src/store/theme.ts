import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeState {
  mode: ThemeMode
  isDark: boolean
  setMode: (mode: ThemeMode) => void
  toggleTheme: () => void
}

/**
 * 获取系统主题偏好
 */
const getSystemTheme = (): boolean => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return false
}

/**
 * 计算是否为暗色模式
 */
const calculateIsDark = (mode: ThemeMode): boolean => {
  if (mode === 'system') {
    return getSystemTheme()
  }
  return mode === 'dark'
}

/**
 * 应用主题到 DOM
 */
const applyTheme = (isDark: boolean) => {
  const root = document.documentElement
  if (isDark) {
    root.classList.add('dark')
    root.setAttribute('data-theme', 'dark')
  } else {
    root.classList.remove('dark')
    root.setAttribute('data-theme', 'light')
  }
}

/**
 * 主题状态管理
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'light',
      isDark: false,
      
      setMode: (mode: ThemeMode) => {
        const isDark = calculateIsDark(mode)
        applyTheme(isDark)
        set({ mode, isDark })
      },
      
      toggleTheme: () => {
        const currentMode = get().mode
        let newMode: ThemeMode
        
        if (currentMode === 'light') {
          newMode = 'dark'
        } else if (currentMode === 'dark') {
          newMode = 'light'
        } else {
          // system mode - toggle to opposite of current
          newMode = get().isDark ? 'light' : 'dark'
        }
        
        const isDark = calculateIsDark(newMode)
        applyTheme(isDark)
        set({ mode: newMode, isDark })
      }
    }),
    {
      name: 'mota-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          const isDark = calculateIsDark(state.mode)
          applyTheme(isDark)
          state.isDark = isDark
        }
      }
    }
  )
)

// 监听系统主题变化
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const state = useThemeStore.getState()
    if (state.mode === 'system') {
      const isDark = e.matches
      applyTheme(isDark)
      useThemeStore.setState({ isDark })
    }
  })
}

export default useThemeStore