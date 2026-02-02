/**
 * Token管理工具
 */

const TOKEN_KEY = 'mota_admin_token';
const REFRESH_TOKEN_KEY = 'mota_admin_refresh_token';
const TOKEN_EXPIRE_KEY = 'mota_admin_token_expire';

/**
 * 保存Token
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * 获取Token
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * 移除Token
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRE_KEY);
}

/**
 * 保存RefreshToken
 */
export function setRefreshToken(refreshToken: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

/**
 * 获取RefreshToken
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * 保存Token过期时间
 */
export function setTokenExpire(expiresIn: number): void {
  const expireTime = Date.now() + expiresIn * 1000;
  localStorage.setItem(TOKEN_EXPIRE_KEY, expireTime.toString());
}

/**
 * 获取Token过期时间
 */
export function getTokenExpire(): number | null {
  const expireTime = localStorage.getItem(TOKEN_EXPIRE_KEY);
  return expireTime ? parseInt(expireTime, 10) : null;
}

/**
 * 检查Token是否过期
 */
export function isTokenExpired(): boolean {
  const expireTime = getTokenExpire();
  if (!expireTime) return true;

  // 提前5分钟判断为过期，用于刷新token
  return Date.now() > expireTime - 5 * 60 * 1000;
}

/**
 * 检查是否有Token
 */
export function hasToken(): boolean {
  return !!getToken();
}

/**
 * 保存完整的登录信息
 */
export function saveLoginInfo(
  token: string,
  refreshToken: string,
  expiresIn: number,
): void {
  setToken(token);
  setRefreshToken(refreshToken);
  setTokenExpire(expiresIn);
}

/**
 * 清除所有登录信息
 */
export function clearLoginInfo(): void {
  removeToken();
}
