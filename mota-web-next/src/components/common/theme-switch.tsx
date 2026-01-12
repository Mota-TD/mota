'use client';

import { Button, Dropdown } from 'antd';
import { SunOutlined, MoonOutlined, DesktopOutlined } from '@ant-design/icons';

import { useTheme } from '@/components/providers/theme-provider';

const themeOptions = [
  {
    key: 'light',
    icon: <SunOutlined />,
    label: '浅色模式',
  },
  {
    key: 'dark',
    icon: <MoonOutlined />,
    label: '深色模式',
  },
  {
    key: 'system',
    icon: <DesktopOutlined />,
    label: '跟随系统',
  },
];

export function ThemeSwitch() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const currentIcon = resolvedTheme === 'dark' ? <MoonOutlined /> : <SunOutlined />;

  const menuItems = themeOptions.map((option) => ({
    key: option.key,
    icon: option.icon,
    label: option.label,
    onClick: () => setTheme(option.key as 'light' | 'dark' | 'system'),
  }));

  return (
    <Dropdown
      menu={{
        items: menuItems,
        selectedKeys: [theme],
      }}
      placement="bottomRight"
      trigger={['click']}
    >
      <Button type="text" icon={currentIcon} />
    </Dropdown>
  );
}