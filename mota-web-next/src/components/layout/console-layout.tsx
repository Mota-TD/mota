'use client';

import { useState, useMemo, type ReactNode } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Input, Button, Tooltip, Space } from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ApartmentOutlined,
  RobotOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  SearchOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
  BarChartOutlined,
  MessageOutlined,
  FilePptOutlined,
  DatabaseOutlined,
  FileSearchOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
  HistoryOutlined,
  ApiOutlined,
  LineChartOutlined,
  PieChartOutlined,
  AppstoreOutlined,
  StarOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from '@/components/providers/auth-provider';
import { ThemeSwitch } from '@/components/common/theme-switch';

const { Header, Sider, Content } = Layout;

// 统一主题色 - 薄荷绿
const THEME_COLOR = '#10B981';

interface ConsoleLayoutProps {
  children: ReactNode;
}

type MenuItem = Required<MenuProps>['items'][number];

export function ConsoleLayout({ children }: ConsoleLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  // 菜单项配置 - 根据mota-web V2.0设计稿优化
  const menuItems: MenuItem[] = useMemo(() => [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard">工作台</Link>,
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
          key: '/ai',
          icon: <MessageOutlined />,
          label: <Link href="/ai">AI助手</Link>,
        },
        {
          key: '/ai/proposal',
          icon: <RobotOutlined />,
          label: <Link href="/ai/proposal">方案生成</Link>,
        },
        {
          key: '/ai/ppt',
          icon: <FilePptOutlined />,
          label: <Link href="/ai/ppt">PPT生成</Link>,
        },
        {
          key: '/ai/knowledge-base',
          icon: <DatabaseOutlined />,
          label: <Link href="/ai/knowledge-base">AI知识库</Link>,
        },
        {
          key: '/search',
          icon: <FileSearchOutlined />,
          label: <Link href="/search">智能搜索</Link>,
        },
        {
          key: '/news',
          icon: <GlobalOutlined />,
          label: <Link href="/news">新闻追踪</Link>,
        },
        {
          key: '/ai/training',
          icon: <ThunderboltOutlined />,
          label: <Link href="/ai/training">模型训练</Link>,
        },
        {
          key: '/ai/history',
          icon: <HistoryOutlined />,
          label: <Link href="/ai/history">历史记录</Link>,
        },
        {
          key: '/ai/models',
          icon: <ApiOutlined />,
          label: <Link href="/ai/models">模型管理</Link>,
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
          label: <Link href="/projects">项目管理</Link>,
        },
        {
          key: '/tasks',
          icon: <CheckSquareOutlined />,
          label: <Link href="/tasks">我的任务</Link>,
        },
        {
          key: '/calendar',
          icon: <CalendarOutlined />,
          label: <Link href="/calendar">日程管理</Link>,
        },
        {
          key: '/progress',
          icon: <LineChartOutlined />,
          label: <Link href="/progress">进度跟踪</Link>,
        },
        {
          key: '/resources',
          icon: <TeamOutlined />,
          label: <Link href="/resources">资源管理</Link>,
        },
        {
          key: '/reports',
          icon: <BarChartOutlined />,
          label: <Link href="/reports">报表分析</Link>,
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
          label: <Link href="/knowledge">知识图谱</Link>,
        },
        {
          key: '/documents',
          icon: <FileTextOutlined />,
          label: <Link href="/documents">文档管理</Link>,
        },
        {
          key: '/templates',
          icon: <AppstoreOutlined />,
          label: <Link href="/templates">模板库</Link>,
        },
        {
          key: '/knowledge-statistics',
          icon: <PieChartOutlined />,
          label: <Link href="/knowledge-statistics">知识统计</Link>,
        },
        {
          key: '/favorites',
          icon: <StarOutlined />,
          label: <Link href="/favorites">我的收藏</Link>,
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      key: 'org-group',
      type: 'group',
      label: collapsed ? '' : '组织架构',
      children: [
        {
          key: '/departments',
          icon: <ApartmentOutlined />,
          label: <Link href="/departments">组织管理</Link>,
        },
        {
          key: '/members',
          icon: <TeamOutlined />,
          label: <Link href="/members">成员管理</Link>,
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
          label: <Link href="/notifications">通知中心</Link>,
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
          label: <Link href="/system">系统管理</Link>,
        },
        {
          key: '/settings',
          icon: <SettingOutlined />,
          label: <Link href="/settings">系统设置</Link>,
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      key: '/help',
      icon: <QuestionCircleOutlined />,
      label: <Link href="/help">帮助中心</Link>,
    },
  ], [collapsed]);

  // 获取当前选中的菜单项
  const getSelectedKeys = () => {
    // 处理任务相关路由的选中状态
    if (pathname.startsWith('/tasks')) {
      return ['/tasks'];
    }
    return [pathname];
  };

  // 用户下拉菜单
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人设置',
      onClick: () => router.push('/profile'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: logout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', minWidth: '1440px' }}>
      {/* 侧边栏 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        collapsedWidth={72}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1001,
          background: '#fff',
          borderRight: '1px solid #E2E8F0',
          overflow: 'hidden',
        }}
        theme="light"
      >
        {/* Logo */}
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          borderBottom: '1px solid #F1F5F9',
          flexShrink: 0,
        }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg
              width="36"
              height="36"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
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
            {!collapsed && (
              <span style={{ fontSize: 18, fontWeight: 700, color: THEME_COLOR }}>摩塔 Mota</span>
            )}
          </Link>
        </div>

        {/* 菜单 */}
        <div style={{
          height: 'calc(100vh - 64px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '8px 0',
          scrollbarWidth: 'thin',
          scrollbarColor: '#E2E8F0 transparent',
        }}>
          <Menu
            mode="inline"
            selectedKeys={getSelectedKeys()}
            items={menuItems}
            style={{ borderRight: 'none', background: 'transparent' }}
            onClick={({ key }) => {
              if (key.startsWith('/')) {
                router.push(key);
              }
            }}
          />
        </div>
      </Sider>

      {/* 主内容区 */}
      <Layout style={{ marginLeft: collapsed ? 72 : 240, transition: 'margin-left 0.2s' }}>
        {/* 头部 */}
        <Header style={{
          position: 'sticky',
          top: 0,
          height: 64,
          background: '#fff',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          zIndex: 100,
        }}>
          {/* 左侧 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ width: 36, height: 36, borderRadius: 8 }}
            />
          </div>

          {/* 中间搜索框 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <Input
              placeholder="搜索项目、任务、文档... (Ctrl+K)"
              prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
              suffix={<span style={{ fontSize: 11, padding: '2px 6px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 4, color: '#94A3B8', fontFamily: 'monospace' }}>⌘K</span>}
              style={{ width: 320, height: 40, borderRadius: 10, background: '#F8FAFC', border: '1px solid transparent' }}
              allowClear
            />
          </div>

          {/* 右侧 */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Space size={8}>
              <Tooltip title="通知">
                <Badge count={5} size="small" offset={[-2, 2]}>
                  <Button
                    type="text"
                    icon={<BellOutlined />}
                    onClick={() => router.push('/notifications')}
                    style={{ width: 36, height: 36, borderRadius: 8 }}
                  />
                </Badge>
              </Tooltip>
              <Tooltip title="帮助">
                <Button
                  type="text"
                  icon={<QuestionCircleOutlined />}
                  onClick={() => router.push('/help')}
                  style={{ width: 36, height: 36, borderRadius: 8 }}
                />
              </Tooltip>
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  padding: '6px 10px',
                  borderRadius: 10,
                  marginLeft: 8,
                }}>
                  <Avatar
                    size={32}
                    style={{ backgroundColor: THEME_COLOR }}
                  >
                    {user?.nickname?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </Avatar>
                  <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#1E293B' }}>{user?.nickname || user?.username || '用户'}</span>
                    <span style={{ fontSize: 12, color: '#94A3B8' }}>管理员</span>
                  </div>
                </div>
              </Dropdown>
            </Space>
          </div>
        </Header>

        {/* 内容区 */}
        <Content style={{ padding: 24, minHeight: 'calc(100vh - 64px)', background: '#F8FAFC' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}