'use client';

import { useState, type ReactNode } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Input, Button, Tooltip } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  CalendarOutlined,
  FileTextOutlined,
  BookOutlined,
  RobotOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  SearchOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from '@/components/providers/auth-provider';
import { ThemeSwitch } from '@/components/common/theme-switch';

const { Header, Sider, Content } = Layout;

interface ConsoleLayoutProps {
  children: ReactNode;
}

// 菜单项配置
const menuItems = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '工作台',
  },
  {
    key: '/projects',
    icon: <ProjectOutlined />,
    label: '项目管理',
  },
  {
    key: '/tasks',
    icon: <CheckSquareOutlined />,
    label: '任务中心',
    children: [
      { key: '/tasks/my', label: '我的任务' },
      { key: '/tasks/assigned', label: '分配给我' },
      { key: '/tasks/created', label: '我创建的' },
    ],
  },
  {
    key: '/calendar',
    icon: <CalendarOutlined />,
    label: '日程管理',
  },
  {
    key: '/documents',
    icon: <FileTextOutlined />,
    label: '文档协作',
  },
  {
    key: '/knowledge',
    icon: <BookOutlined />,
    label: '知识库',
    children: [
      { key: '/knowledge/files', label: '文件管理' },
      { key: '/knowledge/graph', label: '知识图谱' },
      { key: '/knowledge/templates', label: '模板库' },
    ],
  },
  {
    key: '/ai',
    icon: <RobotOutlined />,
    label: 'AI助手',
    children: [
      { key: '/ai/chat', label: '智能对话' },
      { key: '/ai/news', label: '智能新闻' },
      { key: '/ai/proposal', label: '方案生成' },
      { key: '/ai/search', label: '智能搜索' },
    ],
  },
  {
    key: '/reports',
    icon: <BarChartOutlined />,
    label: '报表分析',
    children: [
      { key: '/reports/project', label: '项目报表' },
      { key: '/reports/team', label: '团队效能' },
      { key: '/reports/resource', label: '资源分析' },
    ],
  },
  {
    key: '/team',
    icon: <TeamOutlined />,
    label: '团队管理',
    children: [
      { key: '/team/members', label: '成员管理' },
      { key: '/team/departments', label: '部门管理' },
      { key: '/team/roles', label: '角色权限' },
    ],
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: '系统设置',
  },
];

export function ConsoleLayout({ children }: ConsoleLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  // 获取当前选中的菜单项
  const selectedKeys = [pathname];
  const openKeys = menuItems
    .filter((item) => item.children?.some((child) => pathname.startsWith(child.key)))
    .map((item) => item.key);

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => router.push('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '账号设置',
      onClick: () => router.push('/settings/account'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: logout,
    },
  ];

  return (
    <Layout className="min-h-screen">
      {/* 侧边栏 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        className="fixed left-0 top-0 bottom-0 z-50 overflow-auto border-r border-border"
        theme="light"
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-bold">
              M
            </div>
            {!collapsed && (
              <span className="text-lg font-semibold text-foreground">Mota</span>
            )}
          </Link>
        </div>

        {/* 菜单 */}
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={openKeys}
          items={menuItems.map((item) => ({
            ...item,
            label: item.children ? (
              item.label
            ) : (
              <Link href={item.key}>{item.label}</Link>
            ),
            children: item.children?.map((child) => ({
              ...child,
              label: <Link href={child.key}>{child.label}</Link>,
            })),
          }))}
          className="border-none"
        />
      </Sider>

      {/* 主内容区 */}
      <Layout className={`transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-60'}`}>
        {/* 头部 */}
        <Header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card px-4">
          {/* 左侧 */}
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-lg"
            />
            <Input
              placeholder="搜索项目、任务、文档..."
              prefix={<SearchOutlined className="text-muted-foreground" />}
              className="w-64"
              allowClear
            />
          </div>

          {/* 右侧 */}
          <div className="flex items-center gap-3">
            {/* 帮助 */}
            <Tooltip title="帮助中心">
              <Button
                type="text"
                icon={<QuestionCircleOutlined />}
                onClick={() => router.push('/help')}
              />
            </Tooltip>

            {/* 主题切换 */}
            <ThemeSwitch />

            {/* 通知 */}
            <Tooltip title="通知">
              <Badge count={5} size="small">
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  onClick={() => router.push('/notifications')}
                />
              </Badge>
            </Tooltip>

            {/* 用户头像 */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 hover:bg-muted">
                <Avatar
                  src={user?.avatar}
                  icon={!user?.avatar && <UserOutlined />}
                  size="small"
                />
                <span className="text-sm font-medium">{user?.nickname || user?.username}</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* 内容区 */}
        <Content className="p-6">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}