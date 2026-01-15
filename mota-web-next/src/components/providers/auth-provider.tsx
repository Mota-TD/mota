'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import Cookies from 'js-cookie';

import { apiClient } from '@/lib/api-client';

// 用户信息类型
interface User {
  id: string;
  username: string;
  nickname: string;
  email: string;
  phone?: string;
  avatar?: string;
  tenantId?: string;
  tenantName?: string;
  departmentId?: string;
  departmentName?: string;
  roles: string[];
  permissions: string[];
  status?: string;
  role?: string;
}

// 后端返回的用户数据类型
interface BackendUser {
  id: number | string;
  username: string;
  nickname: string;
  email: string;
  phone?: string;
  avatar?: string;
  status?: string;
  role?: string;
  departmentId?: number | string;
  departmentName?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 认证上下文类型
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 不需要认证的路由
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

// 开发模式模拟用户数据
const DEV_MOCK_USER: User = {
  id: 'dev-user-1',
  username: 'developer',
  nickname: '开发者',
  email: 'dev@mota.com',
  phone: '13800138000',
  avatar: undefined,
  tenantId: 'tenant-1',
  tenantName: '开发租户',
  departmentId: 'dept-1',
  departmentName: '技术部',
  roles: ['admin'],
  permissions: ['*'],
  status: 'active',
  role: 'admin',
};

// 检查是否为开发模式的函数
function checkDevMode(): boolean {
  // 在客户端检查 hostname
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const notDisabled = process.env.NEXT_PUBLIC_AUTO_DEV_MODE !== 'false';
    return isLocalhost && notDisabled;
  }
  // 在服务端使用 NODE_ENV
  return process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_AUTO_DEV_MODE !== 'false';
}

interface AuthProviderProps {
  children: ReactNode;
}


export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // 检查是否已认证
  const isAuthenticated = !!user;

  // 初始化认证状态
  useEffect(() => {
    const initAuth = async () => {
      // 检查是否为开发模式
      const isDevMode = checkDevMode();
      console.log('[Auth] Initializing, dev mode:', isDevMode);
      
      const token = Cookies.get('mota_token');
      
      // 如果有 token，尝试获取用户信息
      if (token) {
        try {
          const response = await apiClient.get<{ data: BackendUser }>('/api/v1/users/me');
          const backendUser = response.data.data;
          if (backendUser) {
            const userData: User = {
              id: String(backendUser.id),
              username: backendUser.username,
              nickname: backendUser.nickname || backendUser.username,
              email: backendUser.email || '',
              phone: backendUser.phone,
              avatar: backendUser.avatar,
              status: backendUser.status,
              role: backendUser.role,
              departmentId: backendUser.departmentId ? String(backendUser.departmentId) : undefined,
              departmentName: backendUser.departmentName,
              roles: backendUser.role ? [backendUser.role] : [],
              permissions: [],
            };
            setUser(userData);
            console.log('[Auth] User loaded from API');
          }
        } catch (error) {
          console.error('[Auth] Failed to fetch user:', error);
          // 清除无效的 token
          Cookies.remove('mota_token');
          Cookies.remove('mota_refresh_token');
          // 不再使用模拟用户，让用户重新登录
          setUser(null);
        }
      }
      // 没有 token 时不使用模拟用户，让用户正常登录
      
      setIsLoading(false);
      setInitialized(true);
    };
    
    initAuth();
  }, []);

  // 路由守卫
  useEffect(() => {
    // 等待初始化完成
    if (!initialized) {
      console.log('[Auth] Route guard: waiting for initialization');
      return;
    }

    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
    console.log('[Auth] Route guard:', { isAuthenticated, isPublicRoute, pathname, user: !!user });

    if (!isAuthenticated && !isPublicRoute) {
      // 未登录且访问需要认证的页面，跳转到登录页
      console.log('[Auth] Redirecting to login');
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (isAuthenticated && isPublicRoute) {
      // 已登录且访问公开页面，跳转到首页
      console.log('[Auth] Redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [isAuthenticated, initialized, pathname, router, user]);

  // 登录
  const login = useCallback(
    async (username: string, password: string) => {
      try {
        // BFF 返回的登录响应格式
        interface LoginResponse {
          accessToken: string;
          refreshToken: string;
          expiresIn: number;
          user: {
            id: string;
            username: string;
            nickname: string;
            avatar?: string;
            email: string;
            tenantId: string;
            roles: string[];
            permissions: string[];
          };
        }

        const response = await apiClient.post<LoginResponse>(
          '/api/v1/auth/login',
          { username, password }
        );

        // BFF 直接返回 LoginResponse，不需要 .data 包装
        const loginData = response.data;
        const { accessToken, refreshToken, expiresIn, user: userData } = loginData;

        // 保存token到cookie
        const expiresInSeconds = expiresIn || 86400;
        Cookies.set('mota_token', accessToken, {
          expires: expiresInSeconds / (24 * 60 * 60), // 转换为天数
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
        Cookies.set('mota_refresh_token', refreshToken, {
          expires: 7, // 7天
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });

        // 使用 BFF 返回的用户对象
        const user: User = {
          id: userData.id,
          username: userData.username,
          nickname: userData.nickname || userData.username,
          email: userData.email || '',
          phone: '',
          avatar: userData.avatar,
          tenantId: userData.tenantId,
          tenantName: '',
          roles: userData.roles || [],
          permissions: userData.permissions || [],
        };

        setUser(user);

        // 跳转到之前的页面或首页
        const searchParams = new URLSearchParams(window.location.search);
        const redirect = searchParams.get('redirect') || '/dashboard';
        router.push(redirect);
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },
    [router]
  );

  // 登出
  const logout = useCallback(async () => {
    try {
      await apiClient.post('/api/v1/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      Cookies.remove('mota_token');
      Cookies.remove('mota_refresh_token');
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  // 刷新token
  const refreshToken = useCallback(async () => {
    try {
      const refresh = Cookies.get('mota_refresh_token');
      if (!refresh) {
        throw new Error('No refresh token');
      }

      const response = await apiClient.post<{
        accessToken: string;
        expiresIn: number;
      }>('/api/v1/auth/refresh', { refreshToken: refresh });

      const { accessToken, expiresIn } = response.data;

      Cookies.set('mota_token', accessToken, {
        expires: expiresIn / (24 * 60 * 60),
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
      throw error;
    }
  }, [logout]);

  // 检查权限
  const hasPermission = useCallback(
    (permission: string) => {
      if (!user) return false;
      return user.permissions.includes(permission) || user.permissions.includes('*');
    },
    [user]
  );

  // 检查角色
  const hasRole = useCallback(
    (role: string) => {
      if (!user) return false;
      return user.roles.includes(role) || user.roles.includes('admin');
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        refreshToken,
        hasPermission,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}