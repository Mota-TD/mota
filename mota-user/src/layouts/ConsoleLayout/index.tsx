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
  CheckSquareOutlined,
  CalendarOutlined,
  ApartmentOutlined,
  FileTextOutlined,
  StarOutlined,
  MessageOutlined,
  DatabaseOutlined,
  FileSearchOutlined,
  LineChartOutlined,
  TeamOutlined,
  BarChartOutlined,
  PieChartOutlined,
  AppstoreOutlined,
  SettingOutlined,
  ApiOutlined
} from '@ant-design/icons'
import { useAuthStore } from '@/store/auth'
import styles from './index.module.css'

const { Header, Sider, Content } = Layout

type MenuItem = Required<MenuProps>['items'][number]

// 统一主题色 - 薄荷绿
const THEME_COLOR = '#10B981'

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
          key: '/ai/assistant',
          icon: <MessageOutlined />,
          label: 'AI助手',
        },
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
          key: '/ai/knowledge-base',
          icon: <DatabaseOutlined />,
          label: 'AI知识库',
        },
        {
          key: '/ai/search',
          icon: <FileSearchOutlined />,
          label: '智能搜索',
        },
        {
          key: '/ai/news',
          icon: <GlobalOutlined />,
          label: '新闻追踪',
        },
        {
          key: '/ai/training',
          icon: <ThunderboltOutlined />,
          label: '模型训练',
        },
        {
          key: '/ai/history',
          icon: <HistoryOutlined />,
          label: '历史记录',
        },
        {
          key: '/ai/model-management',
          icon: <ApiOutlined />,
          label: '模型管理',
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
        {
          key: '/calendar',
          icon: <CalendarOutlined />,
          label: '日程管理',
        },
        {
          key: '/progress-tracking',
          icon: <LineChartOutlined />,
          label: '进度跟踪',
        },
        {
          key: '/resource-management',
          icon: <TeamOutlined />,
          label: '资源管理',
        },
        {
          key: '/report-analytics',
          icon: <BarChartOutlined />,
          label: '报表分析',
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      key: 'knowledge-group',
      type: 'group',
      label: collapsed ? '' : '知识管理',
      children: [
        {
          key: '/knowledge',
          icon: <ApartmentOutlined />,
          label: '知识图谱',
        },
        {
          key: '/documents',
          icon: <FileTextOutlined />,
          label: '文档管理',
        },
        {
          key: '/templates',
          icon: <AppstoreOutlined />,
          label: '模板库',
        },
        {
          key: '/knowledge-statistics',
          icon: <PieChartOutlined />,
          label: '知识统计',
        },
        {
          key: '/favorites',
          icon: <StarOutlined />,
          label: '我的收藏',
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      key: 'notification-group',
      type: 'group',
      label: collapsed ? '' : '消息中心',
      children: [
        {
          key: '/notifications',
          icon: <BellOutlined />,
          label: '通知中心',
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      key: 'system-group',
      type: 'group',
      label: collapsed ? '' : '系统管理',
      children: [
        {
          key: '/system',
          icon: <SettingOutlined />,
          label: '系统管理',
        },
        {
          key: '/settings',
          icon: <SettingOutlined />,
          label: '系统设置',
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
        navigate('/')
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

  return (
    <Layout className={styles.layout}>
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
                fill={THEME_COLOR}
              />
              <rect x="4" y="36" width="40" height="8" rx="2" fill="white" opacity="0.35"/>
              <rect x="8" y="26" width="32" height="8" rx="2" fill="white" opacity="0.35"/>
              <rect x="12" y="16" width="24" height="8" rx="2" fill="white" opacity="0.35"/>
              <rect x="16" y="6" width="16" height="8" rx="2" fill="white" opacity="0.35"/>
              <path d="M5 36 L5 6 L15 6 L24 18 L33 6 L43 6 L43 36 L35 36 L35 18 L24 34 L13 18 L13 36 Z" fill="white"/>
            </svg>
            {!collapsed && <span className={styles.logoText}>摩塔 Mota</span>}
          </div>
        </div>
        <div className={styles.siderContent}>
          <Menu
            mode="inline"
            selectedKeys={getSelectedKeys()}
            items={menuItems}
            className={styles.menu}
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
                    style={{ backgroundColor: THEME_COLOR }}
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