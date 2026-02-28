import { LinkOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import { history, Link } from '@umijs/max';
import React from 'react';
import {
  AvatarDropdown,
  AvatarName,
  Footer,
  Question,
  SelectLang,
} from '@/components';
import { getCurrentUser } from '@/services/auth';
import {
  checkAndRefreshToken,
  startTokenRefreshTimer,
  stopTokenRefreshTimer,
} from '@/utils/refreshToken';
import { clearLoginInfo, getToken } from '@/utils/token';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import '@ant-design/v5-patch-for-react-19';

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

// Token自动刷新定时器
let refreshTimer: NodeJS.Timeout | null = null;

/**
 * 将后端 UserVO 数据映射为前端 API.CurrentUser 格式
 *
 * 后端 /api/v1/users/me 返回的字段:
 * - id: 用户ID
 * - username: 用户名
 * - nickname: 昵称
 * - email: 邮箱
 * - phone: 手机号
 * - avatar: 头像
 * - status: 状态 ("active" 或 "inactive")
 * - role: 角色 (admin, member 等)
 *
 * @param userVO 后端返回的用户数据
 * @returns 前端使用的用户数据格式
 */
function mapUserVOToCurrentUser(userVO: any): API.CurrentUser {
  // 根据 role 映射权限
  // role: admin=管理员, member=普通成员
  let access = 'user';
  if (userVO.role === 'admin' || userVO.role === 'super_admin') {
    access = 'admin';
  }

  return {
    userid: String(userVO.id || ''),
    name: userVO.nickname || userVO.username || '',
    email: userVO.email || '',
    phone: userVO.phone || '',
    avatar: userVO.avatar || '',
    access,
  };
}

/**
 * 从JWT Token中解析用户信息（作为getCurrentUser接口的备选方案）
 */
function parseUserInfoFromToken(token: string): API.CurrentUser | undefined {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return undefined;
    
    const payload = JSON.parse(atob(parts[1]));
    return {
      userid: String(payload.userId || ''),
      name: payload.username || '',
      email: '',
      phone: '',
      access: 'admin', // 默认管理员权限
    };
  } catch {
    return undefined;
  }
}

/**
 * @see https://umijs.org/docs/api/runtime-config#getinitialstate
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const token = getToken();
      if (!token) {
        history.push(loginPath);
        return undefined;
      }

      // 尝试从后端获取用户信息
      try {
        const response = await getCurrentUser();
        if (response.code === 200 && response.data) {
          // 将后端 UserVO 映射为前端 API.CurrentUser 格式
          return mapUserVOToCurrentUser(response.data);
        }
      } catch (err) {
        // getCurrentUser 接口失败，使用JWT中的信息作为备选
        console.warn('getCurrentUser接口不可用，使用JWT中的用户信息', err);
      }

      // 从JWT Token中解析用户信息作为备选
      const userInfo = parseUserInfoFromToken(token);
      if (userInfo) {
        return userInfo;
      }

      throw new Error('Failed to fetch user info');
    } catch (_error) {
      console.error('Fetch user info error:', _error);
      clearLoginInfo();
      history.push(loginPath);
      return undefined;
    }
  };
  // 如果不是登录页面，执行
  const { location } = history;
  const isLoginPage = [
    loginPath,
    '/user/register',
    '/user/register-result',
  ].includes(location.pathname);

  if (!isLoginPage) {
    const token = getToken();
    if (!token) {
      history.push(loginPath);
      return {
        fetchUserInfo,
        settings: defaultSettings as Partial<LayoutSettings>,
      };
    }

    const currentUser = await fetchUserInfo();

    // 启动token自动刷新定时器
    if (currentUser && !refreshTimer) {
      refreshTimer = startTokenRefreshTimer();
    }

    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }

  // 停止token刷新定时器（登录页面）
  if (refreshTimer) {
    stopTokenRefreshTimer(refreshTimer);
    refreshTimer = null;
  }

  return {
    fetchUserInfo,
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
// 摩塔管理后台 - 薄荷绿主题布局配置
export const layout: RunTimeLayoutConfig = ({
  initialState,
  setInitialState,
}) => {
  return {
    actionsRender: () => [
      <Question key="doc" />,
      <SelectLang key="SelectLang" />,
    ],
    avatarProps: {
      src: initialState?.currentUser?.avatar,
      title: <AvatarName />,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
      style: {
        backgroundColor: '#10B981',
      },
    },
    waterMarkProps: {
      content: initialState?.currentUser?.name,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    // 移除 Alipay 背景图，使用简洁风格
    bgLayoutImgList: [],
    links: isDev
      ? [
          <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
            <LinkOutlined />
            <span>OpenAPI 文档</span>
          </Link>,
        ]
      : [],
    // Logo 渲染
    menuHeaderRender: undefined,
    // Logo 配置
    logo: '/logo.svg',
    title: '摩塔管理后台',
    // 确保菜单显示
    menu: {
      locale: true,
    },
    // 布局样式配置
    layout: 'side',
    navTheme: 'light',
    contentWidth: 'Fluid',
    fixedHeader: true,
    fixSiderbar: true,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {isDev && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request: RequestConfig = {
  // 使用相对路径，通过代理转发到后端
  baseURL: '/api/v1',
  timeout: 30000,
  ...errorConfig,
  requestInterceptors: [
    (url, options) => {
      // 从token工具获取token
      const token = getToken();
      if (token) {
        const headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
        return {
          url,
          options: { ...options, headers },
        };
      }
      return { url, options };
    },
  ],
  responseInterceptors: [
    (response) => {
      // 处理401未认证
      const data = response.data as any;
      if (data && data.code === 401) {
        clearLoginInfo();
        if (refreshTimer) {
          stopTokenRefreshTimer(refreshTimer);
          refreshTimer = null;
        }
        history.push(loginPath);
      }
      return response;
    },
  ],
};
