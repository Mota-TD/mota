import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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

// 认证状态
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  login: (user: User, token: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setToken: (token) => set({ token }),
      
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      
      login: (user, token, refreshToken) =>
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
        }),
      
      logout: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
      
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      
      hasPermission: (permission) => {
        const { user } = get();
        if (!user) return false;
        return user.permissions.includes(permission) || user.permissions.includes('*');
      },
      
      hasRole: (role) => {
        const { user } = get();
        if (!user) return false;
        return user.roles.includes(role) || user.roles.includes('admin');
      },
    }),
    {
      name: 'mota-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);