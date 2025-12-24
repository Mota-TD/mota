import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Input, Badge, Button, Space, Tooltip } from 'antd'
import type { MenuProps } from 'antd'
import {
  DashboardOutlined,
  ProjectOutlined,
  BellOutlined,
  SearchOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  UserOutlined,
  RobotOutlined,
  FilePptOutlined,
  GlobalOutlined,
  HistoryOutlined,
  ThunderboltOutlined,
  QuestionCircleOutlined,
  CheckSquareOutlined
} from '@ant-design/icons'
import { useAuthStore } from '@/store/auth'
import styles from './index.module.css'

const { Header, Sider, Content } = Layout

type MenuItem = Required<MenuProps>['items'][number]

/**
 * 控制台布局组件
 */
const ConsoleLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)

  // 菜单项配置 - 根据V2.0设计稿优化
  const menuItems: MenuItem[] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '工作台',
    },
    {
      type: 'divider',
    },
    {
      key: 'ai-group',
      type: 'group',
      label: collapsed ? '' : 'AI助理',
      children: [
        {
          key: '/ai/solution',
          icon: <RobotOutlined />,
          label: '方案生成',
        },
        {
          key: '/ai/ppt',
          icon: <FilePptOutlined />,
          label: 'PPT生成',
        },
        {
          key: '/ai/training',
          icon: <ThunderboltOutlined />,
          label: '模型训练',
        },
        {
          key: '/ai/news',
          icon: <GlobalOutlined />,
          label: '新闻追踪',
        },
        {
          key: '/ai/history',
          icon: <HistoryOutlined />,
          label: '历史记录',
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      key: 'project-group',
      type: 'group',
      label: collapsed ? '' : '项目协同',
      children: [
        {
          key: '/projects',
          icon: <ProjectOutlined />,
          label: '项目管理',
        },
        {
          key: '/my-tasks',
          icon: <CheckSquareOutlined />,
          label: '我的任务',
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      key: '/help',
      icon: <QuestionCircleOutlined />,
      label: '帮助中心',
    },
  ]

  // 用户下拉菜单
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人设置',
      onClick: () => navigate('/profile'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        logout()
        navigate('/login')
      },
    },
  ]

  // 获取当前选中的菜单项
  const getSelectedKeys = () => {
    const path = location.pathname
    // 处理任务相关路由的选中状态
    if (path.startsWith('/tasks') || path.startsWith('/my-tasks')) {
      return ['/my-tasks']
    }
    if (path.startsWith('/department-tasks')) {
      return ['/projects']
    }
    return [path]
  }

  // 根据当前路由获取主题配置 - 使用克莱因蓝作为主色
  const getThemeConfig = () => {
    const path = location.pathname
    // 工作台 - 克莱因蓝
    if (path.startsWith('/dashboard')) {
      return { menuClass: styles.themeBlue, logoClass: styles.logoBlue, logoColor: '#002FA7' }
    }
    // AI助理 - 每个子页面不同颜色
    else if (path.startsWith('/ai/solution')) {
      return { menuClass: styles.themeAiIndigo, logoClass: styles.logoAiIndigo, logoColor: '#616AE5' }
    } else if (path.startsWith('/ai/ppt')) {
      return { menuClass: styles.themeAiOrange, logoClass: styles.logoAiOrange, logoColor: '#f97316' }
    } else if (path.startsWith('/ai/training')) {
      return { menuClass: styles.themeAiPurple, logoClass: styles.logoAiPurple, logoColor: '#8b5cf6' }
    } else if (path.startsWith('/ai/news')) {
      return { menuClass: styles.themeAiGreen, logoClass: styles.logoAiGreen, logoColor: '#10b981' }
    } else if (path.startsWith('/ai/history')) {
      return { menuClass: styles.themeAiYellow, logoClass: styles.logoAiYellow, logoColor: '#f59e0b' }
    }
    // 项目协同 - 克莱因蓝
    else if (path.startsWith('/projects') || path.startsWith('/department-tasks')) {
      return { menuClass: styles.themeBlue, logoClass: styles.logoBlue, logoColor: '#002FA7' }
    } else if (path.startsWith('/tasks') || path.startsWith('/my-tasks')) {
      return { menuClass: styles.themeGreen, logoClass: styles.logoGreen, logoColor: '#52c41a' }
    }
    // 帮助中心
    else if (path.startsWith('/help')) {
      return { menuClass: styles.themeSky, logoClass: styles.logoSky, logoColor: '#0ea5e9' }
    }
    // 默认克莱因蓝
    return { menuClass: styles.themeBlue, logoClass: '', logoColor: '#002FA7' }
  }

  const themeConfig = getThemeConfig()

  // 设置全局主题色CSS变量
  const themeStyle = {
    '--theme-color': themeConfig.logoColor,
    '--theme-color-light': `${themeConfig.logoColor}15`,
    '--theme-color-hover': `${themeConfig.logoColor}dd`,
    '--theme-color-shadow': `${themeConfig.logoColor}25`,
    '--theme-color-glow': `${themeConfig.logoColor}40`,
  } as React.CSSProperties

  return (
    <Layout className={styles.layout} style={themeStyle}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className={styles.sider}
        width={240}
        collapsedWidth={72}
      >
        <div className={styles.siderHeader}>
          <div className={styles.logo} onClick={() => navigate('/dashboard')}>
            <svg
              width="36"
              height="36"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.logoImage}
            >
              <rect
                width="48"
                height="48"
                rx="10"
                fill={themeConfig.logoColor}
                style={{ transition: 'fill 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
              <rect x="4" y="36" width="40" height="8" rx="2" fill="white" opacity="0.35"/>
              <rect x="8" y="26" width="32" height="8" rx="2" fill="white" opacity="0.35"/>
              <rect x="12" y="16" width="24" height="8" rx="2" fill="white" opacity="0.35"/>
              <rect x="16" y="6" width="16" height="8" rx="2" fill="white" opacity="0.35"/>
              <path d="M5 36 L5 6 L15 6 L24 18 L33 6 L43 6 L43 36 L35 36 L35 18 L24 34 L13 18 L13 36 Z" fill="white"/>
            </svg>
            {!collapsed && <span className={`${styles.logoText} ${themeConfig.logoClass}`}>摩塔 Mota</span>}
          </div>
        </div>
        <div className={styles.siderContent}>
          <Menu
            mode="inline"
            selectedKeys={getSelectedKeys()}
            items={menuItems}
            className={`${styles.menu} ${themeConfig.menuClass}`}
            onClick={({ key }) => {
              if (key.startsWith('/')) {
                navigate(key)
              }
            }}
          />
        </div>
      </Sider>
      <Layout className={styles.mainLayout}>
        <Header className={styles.header}>
          <div className={styles.headerLeft}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className={styles.collapseBtn}
            />
            <div className={styles.searchWrapper}>
              <Input
                placeholder="搜索项目、任务、文档..."
                prefix={<SearchOutlined className={styles.searchIcon} />}
                className={styles.searchInput}
                suffix={<span className={styles.searchShortcut}>⌘K</span>}
              />
            </div>
          </div>
          <div className={styles.headerRight}>
            <Space size={8}>
              <Tooltip title="通知">
                <Badge count={5} size="small" offset={[-2, 2]}>
                  <Button
                    type="text"
                    icon={<BellOutlined />}
                    onClick={() => navigate('/notifications')}
                    className={styles.headerBtn}
                  />
                </Badge>
              </Tooltip>
              <Tooltip title="帮助">
                <Button
                  type="text"
                  icon={<QuestionCircleOutlined />}
                  className={styles.headerBtn}
                />
              </Tooltip>
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <div className={styles.userInfo}>
                  <Avatar
                    size={32}
                    className={styles.userAvatar}
                    style={{ backgroundColor: '#002FA7' }}
                  >
                    {user?.name?.charAt(0) || 'U'}
                  </Avatar>
                  <div className={styles.userMeta}>
                    <span className={styles.userName}>{user?.name || '用户'}</span>
                    <span className={styles.userRole}>管理员</span>
                  </div>
                </div>
              </Dropdown>
            </Space>
          </div>
        </Header>
        <Content className={styles.content}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default ConsoleLayout