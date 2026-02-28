/**
 * Token自动刷新机制
 *
 * 实现了以下特性：
 * 1. 防止并发刷新：使用 isRefreshing 标志确保同一时间只有一个刷新请求
 * 2. 请求队列：当正在刷新时，新的请求会被加入队列等待
 * 3. 完整的错误处理：刷新失败时通知所有等待的请求
 * 4. 自动重试机制：增加重试次数限制
 */

import { refreshToken as refreshTokenApi } from '@/services/auth';
import {
  clearLoginInfo,
  getRefreshToken,
  getToken,
  isTokenExpired,
  saveLoginInfo,
} from './token';

// 是否正在刷新token
let isRefreshing = false;

// 重试队列 - 使用 Promise 的 resolve/reject 来处理成功和失败
interface RefreshSubscriber {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}
let refreshSubscribers: RefreshSubscriber[] = [];

// 最大重试次数
const MAX_RETRY_COUNT = 3;
// 当前重试次数
let retryCount = 0;

/**
 * 添加到刷新队列
 */
function subscribeTokenRefresh(subscriber: RefreshSubscriber) {
  refreshSubscribers.push(subscriber);
}

/**
 * 通知所有等待的请求 - 成功
 */
function onRefreshed(token: string) {
  for (const subscriber of refreshSubscribers) {
    subscriber.resolve(token);
  }
  refreshSubscribers = [];
  retryCount = 0; // 重置重试计数
}

/**
 * 通知所有等待的请求 - 失败
 */
function onRefreshFailed(error: Error) {
  for (const subscriber of refreshSubscribers) {
    subscriber.reject(error);
  }
  refreshSubscribers = [];
}

/**
 * 刷新Token
 * @returns 新的access token 或 null（刷新失败时）
 */
export async function tryRefreshToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearLoginInfo();
    return null;
  }

  // 如果正在刷新，则加入队列等待
  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      subscribeTokenRefresh({ resolve, reject });
    }).catch((error) => {
      console.error('Token refresh queue error:', error);
      return null;
    });
  }

  isRefreshing = true;

  try {
    const response = await refreshTokenApi({ refreshToken });

    if (response.code === 200 && response.data) {
      const { token, refreshToken: newRefreshToken, expiresIn } = response.data;

      // 保存新的token信息
      saveLoginInfo(token, newRefreshToken, expiresIn);

      // 通知所有等待的请求
      onRefreshed(token);

      return token;
    } else {
      // 刷新失败
      const errorMsg = response.message || '刷新Token失败';
      const error = new Error(errorMsg);
      
      // 清除登录信息并通知等待的请求
      clearLoginInfo();
      onRefreshFailed(error);
      
      return null;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    
    // 如果是网络错误且未超过重试次数，可以考虑重试
    if (retryCount < MAX_RETRY_COUNT && isNetworkError(error)) {
      retryCount++;
      console.log(`Token refresh retry ${retryCount}/${MAX_RETRY_COUNT}`);
      isRefreshing = false;
      // 延迟重试
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      return tryRefreshToken();
    }
    
    clearLoginInfo();
    onRefreshFailed(error instanceof Error ? error : new Error('Token refresh failed'));
    return null;
  } finally {
    isRefreshing = false;
  }
}

/**
 * 判断是否为网络错误
 */
function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('network') ||
           message.includes('timeout') ||
           message.includes('connection') ||
           message.includes('fetch');
  }
  return false;
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
