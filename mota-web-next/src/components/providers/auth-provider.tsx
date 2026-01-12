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
  tenantId: string;
  tenantName?: string;
  departmentId?: string;
  departmentName?: string;
  roles: string[];
  permissions: string[];
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

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 检查是否已认证
  const isAuthenticated = !!user;

  // 获取当前用户信息
  const fetchUser = useCallback(async () => {
    try {
      const token = Cookies.get('mota_token');
      if (!token) {
        setUser(null);
        return;
      }

      const response = await apiClient.get<User>('/api/v1/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
      Cookies.remove('mota_token');
      Cookies.remove('mota_refresh_token');
    }
  }, []);

  // 初始化时获取用户信息
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchUser();
      setIsLoading(false);
    };
    init();
  }, [fetchUser]);

  // 路由守卫
  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

    if (!isAuthenticated && !isPublicRoute) {
      // 未登录且访问需要认证的页面，跳转到登录页
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (isAuthenticated && isPublicRoute) {
      // 已登录且访问公开页面，跳转到首页
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // 登录
  const login = useCallback(
    async (username: string, password: string) => {
      try {
        // 后端返回的登录响应格式
        interface LoginResponse {
          accessToken: string;
          refreshToken: string;
          tokenType: string;
          expiresIn: string;
          userId: string;
          username: string;
          nickname: string;
          avatar: string | null;
          orgId: string;
          orgName: string;
        }

        const response = await apiClient.post<{ data: LoginResponse }>(
          '/api/v1/auth/login',
          { username, password }
        );

        // 从响应中提取数据
        const loginData = response.data.data;
        const { accessToken, refreshToken, expiresIn } = loginData;

        // 保存token到cookie
        const expiresInSeconds = parseInt(expiresIn, 10) || 86400;
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

        // 构建用户对象
        const userData: User = {
          id: loginData.userId,
          username: loginData.username,
          nickname: loginData.nickname || loginData.username,
          email: '',
          phone: '',
          avatar: loginData.avatar || undefined,
          tenantId: loginData.orgId,
          tenantName: loginData.orgName,
          roles: [],
          permissions: [],
        };

        setUser(userData);

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