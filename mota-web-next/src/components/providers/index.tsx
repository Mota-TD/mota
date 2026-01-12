'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { App as AntdApp } from 'antd';
import { useState, type ReactNode } from 'react';

import { ThemeProvider } from './theme-provider';
import { AuthProvider } from './auth-provider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 默认缓存时间5分钟
            staleTime: 5 * 60 * 1000,
            // 默认缓存保留时间30分钟
            gcTime: 30 * 60 * 1000,
            // 窗口聚焦时不自动重新获取
            refetchOnWindowFocus: false,
            // 重连时不自动重新获取
            refetchOnReconnect: false,
            // 重试次数
            retry: 1,
          },
          mutations: {
            // 重试次数
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AntdApp>{children}</AntdApp>
        </AuthProvider>
      </ThemeProvider>
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

export { ThemeProvider } from './theme-provider';
export { AuthProvider, useAuth } from './auth-provider';