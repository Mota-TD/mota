import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Input, Badge, Button, Space, Tooltip } from 'antd'
import type { MenuProps } from 'antd'
import {
  DashboardOutlined,
  ProjectOutlined,
  BugOutlined,
  CalendarOutlined,
  FileTextOutlined,
  BookOutlined,
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
  PlusOutlined,
  CheckSquareOutlined,
  ExperimentOutlined
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

  // 菜单项配置 - 只显示一级菜单，二级菜单在工作区切换
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
          key: '/issues',
          icon: <CheckSquareOutlined />,
          label: '任务管理',
        },
        {
          key: '/requirements',
          icon: <FileTextOutlined />,
          label: '需求管理',
        },
        {
          key: '/testing',
          icon: <ExperimentOutlined />,
          label: '测试管理',
        },
        {
          key: '/iterations',
          icon: <CalendarOutlined />,
          label: '迭代管理',
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      key: 'knowledge-group',
      type: 'group',
      label: collapsed ? '' : '知识库',
      children: [
        {
          key: '/wiki',
          icon: <BookOutlined />,
          label: '知识库',
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

  // 快速创建菜单
  const quickCreateItems: MenuProps['items'] = [
    {
      key: 'create-solution',
      icon: <RobotOutlined />,
      label: '生成方案',
      onClick: () => navigate('/ai/solution'),
    },
    {
      key: 'create-project',
      icon: <ProjectOutlined />,
      label: '新建项目',
      onClick: () => navigate('/projects'),
    },
    {
      key: 'create-issue',
      icon: <BugOutlined />,
      label: '创建任务',
      onClick: () => navigate('/issues'),
    },
    {
      key: 'create-doc',
      icon: <FileTextOutlined />,
      label: '新建文档',
      onClick: () => navigate('/wiki'),
    },
  ]

  // 获取当前选中的菜单项
  const getSelectedKeys = () => {
    const path = location.pathname
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
            <img src="/logo.svg" alt="摩塔 Mota" className={styles.logoImage} />
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
              <Dropdown menu={{ items: quickCreateItems }} placement="bottomRight">
                <Button type="primary" icon={<PlusOutlined />} className={styles.createBtn}>
                  {!collapsed && '新建'}
                </Button>
              </Dropdown>
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
                    style={{ backgroundColor: '#2b7de9' }}
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