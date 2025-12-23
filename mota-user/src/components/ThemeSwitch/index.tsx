import { Dropdown, Button, Tooltip } from 'antd'
import type { MenuProps } from 'antd'
import { 
  SunOutlined, 
  MoonOutlined, 
  DesktopOutlined,
  CheckOutlined
} from '@ant-design/icons'
import { useThemeStore, ThemeMode } from '@/store/theme'
import styles from './index.module.css'

interface ThemeSwitchProps {
  showLabel?: boolean
  size?: 'small' | 'middle' | 'large'
}

/**
 * 主题切换组件
 * 支持亮色、暗色、跟随系统三种模式
 */
const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ 
  showLabel = false,
  size = 'middle'
}) => {
  const { mode, isDark, setMode, toggleTheme } = useThemeStore()

  // 获取当前图标
  const getCurrentIcon = () => {
    if (mode === 'system') {
      return <DesktopOutlined />
    }
    return isDark ? <MoonOutlined /> : <SunOutlined />
  }

  // 获取当前标签
  const getCurrentLabel = () => {
    switch (mode) {
      case 'light':
        return '亮色模式'
      case 'dark':
        return '暗色模式'
      case 'system':
        return '跟随系统'
      default:
        return '亮色模式'
    }
  }

  // 下拉菜单项
  const menuItems: MenuProps['items'] = [
    {
      key: 'light',
      icon: <SunOutlined />,
      label: (
        <div className={styles.menuItem}>
          <span>亮色模式</span>
          {mode === 'light' && <CheckOutlined className={styles.checkIcon} />}
        </div>
      ),
      onClick: () => setMode('light')
    },
    {
      key: 'dark',
      icon: <MoonOutlined />,
      label: (
        <div className={styles.menuItem}>
          <span>暗色模式</span>
          {mode === 'dark' && <CheckOutlined className={styles.checkIcon} />}
        </div>
      ),
      onClick: () => setMode('dark')
    },
    {
      key: 'system',
      icon: <DesktopOutlined />,
      label: (
        <div className={styles.menuItem}>
          <span>跟随系统</span>
          {mode === 'system' && <CheckOutlined className={styles.checkIcon} />}
        </div>
      ),
      onClick: () => setMode('system')
    }
  ]

  // 简单切换模式（点击按钮直接切换）
  if (!showLabel) {
    return (
      <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click']}>
        <Tooltip title={getCurrentLabel()}>
          <Button 
            type="text" 
            size={size}
            icon={getCurrentIcon()}
            className={styles.switchBtn}
          />
        </Tooltip>
      </Dropdown>
    )
  }

  // 带标签的切换模式
  return (
    <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click']}>
      <Button 
        type="text" 
        size={size}
        icon={getCurrentIcon()}
        className={styles.switchBtn}
      >
        {getCurrentLabel()}
      </Button>
    </Dropdown>
  )
}

export default ThemeSwitch