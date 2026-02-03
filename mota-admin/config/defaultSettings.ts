import type { ProLayoutProps } from '@ant-design/pro-components';

/**
 * @name 摩塔管理后台 - 全局设置
 * @description 基于 mota-web 的薄荷绿主题色系
 */
const Settings: ProLayoutProps & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  // 薄荷绿主题色 (Mint Green)
  colorPrimary: '#10B981',
  layout: 'side',
  contentWidth: 'Fluid',
  fixedHeader: true,
  fixSiderbar: true,
  colorWeak: false,
  title: '摩塔管理后台',
  pwa: true,
  logo: '/logo.svg',
  iconfontUrl: '',
  token: {
    // ProLayout Token 配置 - 薄荷绿主题
    // 参考: https://procomponents.ant.design/components/layout#通过-token-修改样式
    header: {
      colorBgHeader: '#ffffff',
      colorHeaderTitle: '#1E293B',
      colorTextMenu: '#475569',
      colorTextMenuSecondary: '#64748B',
      colorTextMenuSelected: '#10B981',
      colorBgMenuItemSelected: 'rgba(16, 185, 129, 0.1)',
      colorTextMenuActive: '#10B981',
      colorTextRightActionsItem: '#475569',
    },
    sider: {
      colorMenuBackground: '#ffffff',
      colorMenuItemDivider: '#F1F5F9',
      colorTextMenu: '#475569',
      colorTextMenuSelected: '#10B981',
      colorTextMenuItemHover: '#10B981',
      colorTextMenuActive: '#10B981',
      colorBgMenuItemSelected: 'rgba(16, 185, 129, 0.1)',
      colorBgMenuItemHover: 'rgba(16, 185, 129, 0.08)',
      colorBgMenuItemCollapsedElevated: '#ffffff',
    },
    pageContainer: {
      paddingBlockPageContainerContent: 24,
      paddingInlinePageContainerContent: 24,
    },
  },
};

export default Settings;
