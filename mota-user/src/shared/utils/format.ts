/**
 * 格式化工具函数
 */

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @param decimals 小数位数，默认2
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

/**
 * 格式化数字（添加千分位分隔符）
 * @param num 数字
 */
export function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null) return '-';
  return num.toLocaleString('zh-CN');
}

/**
 * 格式化百分比
 * @param value 值（0-100 或 0-1）
 * @param decimals 小数位数，默认0
 * @param isDecimal 是否是小数形式（0-1），默认false
 */
export function formatPercent(value: number | undefined | null, decimals: number = 0, isDecimal: boolean = false): string {
  if (value === undefined || value === null) return '-';
  const percent = isDecimal ? value * 100 : value;
  return `${percent.toFixed(decimals)}%`;
}

/**
 * 格式化货币
 * @param amount 金额
 * @param currency 货币符号，默认 '¥'
 * @param decimals 小数位数，默认2
 */
export function formatCurrency(amount: number | undefined | null, currency: string = '¥', decimals: number = 2): string {
  if (amount === undefined || amount === null) return '-';
  return `${currency}${amount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

/**
 * 格式化时长（分钟转换为可读格式）
 * @param minutes 分钟数
 */
export function formatDuration(minutes: number | undefined | null): string {
  if (minutes === undefined || minutes === null || minutes === 0) return '-';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}分钟`;
  if (mins === 0) return `${hours}小时`;
  return `${hours}小时${mins}分钟`;
}

/**
 * 格式化时长（秒转换为可读格式）
 * @param seconds 秒数
 */
export function formatDurationSeconds(seconds: number | undefined | null): string {
  if (seconds === undefined || seconds === null || seconds === 0) return '-';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}小时`);
  if (minutes > 0) parts.push(`${minutes}分钟`);
  if (secs > 0 && hours === 0) parts.push(`${secs}秒`);
  
  return parts.join('') || '-';
}

/**
 * 截断文本
 * @param text 文本
 * @param maxLength 最大长度
 * @param suffix 后缀，默认 '...'
 */
export function truncateText(text: string | undefined | null, maxLength: number, suffix: string = '...'): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * 格式化手机号（隐藏中间4位）
 * @param phone 手机号
 */
export function formatPhone(phone: string | undefined | null): string {
  if (!phone) return '-';
  if (phone.length !== 11) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(7)}`;
}

/**
 * 格式化邮箱（隐藏部分字符）
 * @param email 邮箱
 */
export function formatEmail(email: string | undefined | null): string {
  if (!email) return '-';
  const [name, domain] = email.split('@');
  if (!domain) return email;
  const visibleLength = Math.min(3, Math.floor(name.length / 2));
  return `${name.slice(0, visibleLength)}***@${domain}`;
}

/**
 * 格式化进度条颜色
 * @param progress 进度（0-100）
 */
export function getProgressColor(progress: number): string {
  if (progress >= 100) return '#52c41a'; // 绿色
  if (progress >= 70) return '#1890ff'; // 蓝色
  if (progress >= 30) return '#faad14'; // 橙色
  return '#ff4d4f'; // 红色
}

/**
 * 格式化进度状态
 * @param progress 进度（0-100）
 */
export function getProgressStatus(progress: number): 'success' | 'normal' | 'exception' | 'active' {
  if (progress >= 100) return 'success';
  if (progress > 0) return 'active';
  return 'normal';
}

/**
 * 首字母大写
 * @param str 字符串
 */
export function capitalize(str: string | undefined | null): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 驼峰转短横线
 * @param str 字符串
 */
export function camelToKebab(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * 短横线转驼峰
 * @param str 字符串
 */
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * 生成随机ID
 * @param length 长度，默认8
 */
export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 格式化用户名显示（取姓名首字符）
 * @param name 姓名
 */
export function getNameInitials(name: string | undefined | null): string {
  if (!name) return '?';
  // 中文名取最后两个字，英文名取首字母
  if (/[\u4e00-\u9fa5]/.test(name)) {
    return name.length > 2 ? name.slice(-2) : name;
  }
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

/**
 * 获取头像背景色（根据名字生成固定颜色）
 * @param name 姓名
 */
export function getAvatarColor(name: string | undefined | null): string {
  const colors = [
    '#f56a00', '#7265e6', '#ffbf00', '#00a2ae',
    '#87d068', '#1890ff', '#722ed1', '#eb2f96'
  ];
  if (!name) return colors[0];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}