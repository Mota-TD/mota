/**
 * Token自动刷新机制
 */

import { refreshToken as refreshTokenApi } from '@/services/auth';
import {
  getToken,
  getRefreshToken,
  isTokenExpired,
  saveLoginInfo,
  clearLoginInfo,
} from './token';

// 是否正在刷新token
let isRefreshing = false;
// 重试队列
let refreshSubscribers: ((token: string) => void)[] = [];

/**
 * 添加到刷新队列
 */
function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

/**
 * 通知所有等待的请求
 */
function onRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

/**
 * 刷新Token
 */
export async function tryRefreshToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    clearLoginInfo();
    return null;
  }

  // 如果正在刷新，则加入队列等待
  if (isRefreshing) {
    return new Promise((resolve) => {
      subscribeTokenRefresh((token: string) => {
        resolve(token);
      });
    });
  }

  isRefreshing = true;

  try {
    const response = await refreshTokenApi({ refreshToken });
    
    if (response.code === 0 && response.data) {
      const { token, refreshToken: newRefreshToken, expiresIn } = response.data;
      
      // 保存新的token信息
      saveLoginInfo(token, newRefreshToken, expiresIn);
      
      // 通知所有等待的请求
      onRefreshed(token);
      
      return token;
    } else {
      // 刷新失败，清除登录信息
      clearLoginInfo();
      return null;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    clearLoginInfo();
    return null;
  } finally {
    isRefreshing = false;
  }
}

/**
 * 检查并刷新Token（如果需要）
 */
export async function checkAndRefreshToken(): Promise<boolean> {
  const token = getToken();
  
  if (!token) {
    return false;
  }

  if (isTokenExpired()) {
    const newToken = await tryRefreshToken();
    return !!newToken;
  }

  return true;
}

/**
 * 启动Token自动刷新定时器
 */
export function startTokenRefreshTimer(): NodeJS.Timeout | null {
  // 每分钟检查一次
  return setInterval(() => {
    checkAndRefreshToken().catch((error) => {
      console.error('Auto refresh token failed:', error);
    });
  }, 60 * 1000);
}

/**
 * 停止Token自动刷新定时器
 */
export function stopTokenRefreshTimer(timer: NodeJS.Timeout | null): void {
  if (timer) {
    clearInterval(timer);
  }
}