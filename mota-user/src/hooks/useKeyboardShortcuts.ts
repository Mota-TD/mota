import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { message } from 'antd'
import { useThemeStore } from '@/store/theme'

export interface ShortcutConfig {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  meta?: boolean
  description: string
  action: () => void
}

/**
 * 键盘快捷键 Hook
 * 提供全局键盘快捷键支持
 */
export const useKeyboardShortcuts = (customShortcuts?: ShortcutConfig[]) => {
  const navigate = useNavigate()
  const { toggleTheme } = useThemeStore()

  // 默认快捷键配置
  const defaultShortcuts: ShortcutConfig[] = [
    // 导航快捷键
    {
      key: 'g',
      alt: true,
      description: '跳转到工作台',
      action: () => navigate('/dashboard')
    },
    {
      key: 'p',
      alt: true,
      description: '跳转到项目列表',
      action: () => navigate('/projects')
    },
    {
      key: 'i',
      alt: true,
      description: '跳转到事项列表',
      action: () => navigate('/issues')
    },
    {
      key: 'k',
      alt: true,
      description: '跳转到看板',
      action: () => navigate('/kanban')
    },
    {
      key: 'w',
      alt: true,
      description: '跳转到知识库',
      action: () => navigate('/wiki')
    },
    {
      key: 'n',
      alt: true,
      description: '跳转到通知中心',
      action: () => navigate('/notifications')
    },
    
    // 创建快捷键
    {
      key: 'c',
      ctrl: true,
      shift: true,
      description: '创建新项目',
      action: () => navigate('/projects/create')
    },
    {
      key: 'n',
      ctrl: true,
      shift: true,
      description: '创建新事项',
      action: () => navigate('/issues/create')
    },
    
    // 功能快捷键
    {
      key: 'k',
      ctrl: true,
      description: '打开全局搜索',
      action: () => {
        // 聚焦到搜索框
        const searchInput = document.querySelector('.ant-input[placeholder*="搜索"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        } else {
          message.info('按 Ctrl+K 打开搜索')
        }
      }
    },
    {
      key: 'd',
      ctrl: true,
      shift: true,
      description: '切换主题',
      action: () => {
        toggleTheme()
        message.success('主题已切换')
      }
    },
    {
      key: '/',
      ctrl: true,
      description: '显示快捷键帮助',
      action: () => {
        showShortcutsHelp()
      }
    },
    {
      key: 'Escape',
      description: '关闭弹窗/取消操作',
      action: () => {
        // 关闭所有模态框
        const closeButtons = document.querySelectorAll('.ant-modal-close')
        closeButtons.forEach(btn => (btn as HTMLElement).click())
      }
    }
  ]

  // 合并自定义快捷键
  const allShortcuts = [...defaultShortcuts, ...(customShortcuts || [])]

  // 显示快捷键帮助
  const showShortcutsHelp = useCallback(() => {
    const helpLines = allShortcuts.map(s => {
      const keys = []
      if (s.ctrl) keys.push('Ctrl')
      if (s.alt) keys.push('Alt')
      if (s.shift) keys.push('Shift')
      if (s.meta) keys.push('⌘')
      keys.push(s.key.toUpperCase())
      return `${keys.join(' + ')}: ${s.description}`
    })
    
    message.info({
      content: `键盘快捷键\n\n${helpLines.join('\n')}`,
      duration: 5,
      style: { whiteSpace: 'pre-line', textAlign: 'left' }
    })
  }, [allShortcuts])

  // 键盘事件处理
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // 如果在输入框中，忽略大部分快捷键
    const target = event.target as HTMLElement
    const isInputElement = target.tagName === 'INPUT' || 
                          target.tagName === 'TEXTAREA' || 
                          target.isContentEditable

    for (const shortcut of allShortcuts) {
      const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey
      const altMatch = shortcut.alt ? event.altKey : !event.altKey
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()

      if (ctrlMatch && altMatch && shiftMatch && keyMatch) {
        // 在输入框中只允许特定快捷键
        if (isInputElement && !shortcut.ctrl && !shortcut.alt) {
          continue
        }

        event.preventDefault()
        shortcut.action()
        return
      }
    }
  }, [allShortcuts])

  // 注册键盘事件
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return {
    shortcuts: allShortcuts,
    showShortcutsHelp
  }
}

export default useKeyboardShortcuts