/**
 * 验证工具函数
 */

/**
 * 验证邮箱格式
 * @param email 邮箱
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证手机号格式（中国大陆）
 * @param phone 手机号
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * 验证URL格式
 * @param url URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证密码强度
 * @param password 密码
 * @returns 强度等级 0-4
 */
export function getPasswordStrength(password: string): number {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
  
  return Math.min(4, strength);
}

/**
 * 获取密码强度文本
 * @param strength 强度等级
 */
export function getPasswordStrengthText(strength: number): string {
  const texts = ['非常弱', '弱', '一般', '强', '非常强'];
  return texts[strength] || texts[0];
}

/**
 * 获取密码强度颜色
 * @param strength 强度等级
 */
export function getPasswordStrengthColor(strength: number): string {
  const colors = ['#ff4d4f', '#ff7a45', '#ffc53d', '#73d13d', '#52c41a'];
  return colors[strength] || colors[0];
}

/**
 * 验证身份证号（中国大陆）
 * @param idCard 身份证号
 */
export function isValidIdCard(idCard: string): boolean {
  const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
  if (!idCardRegex.test(idCard)) return false;
  
  // 校验码验证
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
  
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(idCard[i]) * weights[i];
  }
  
  const checkCode = checkCodes[sum % 11];
  return idCard[17].toUpperCase() === checkCode;
}

/**
 * 验证是否为空
 * @param value 值
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * 验证是否为数字
 * @param value 值
 */
export function isNumber(value: unknown): boolean {
  if (typeof value === 'number') return !isNaN(value);
  if (typeof value === 'string') return !isNaN(parseFloat(value)) && isFinite(parseFloat(value));
  return false;
}

/**
 * 验证是否为正整数
 * @param value 值
 */
export function isPositiveInteger(value: unknown): boolean {
  if (typeof value === 'number') return Number.isInteger(value) && value > 0;
  if (typeof value === 'string') {
    const num = parseInt(value, 10);
    return !isNaN(num) && num > 0 && num.toString() === value;
  }
  return false;
}

/**
 * 验证日期范围是否有效
 * @param startDate 开始日期
 * @param endDate 结束日期
 */
export function isValidDateRange(startDate: string | Date, endDate: string | Date): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
}

/**
 * 验证文件类型
 * @param fileName 文件名
 * @param allowedTypes 允许的类型列表
 */
export function isValidFileType(fileName: string, allowedTypes: string[]): boolean {
  const ext = fileName.split('.').pop()?.toLowerCase();
  return ext ? allowedTypes.includes(ext) : false;
}

/**
 * 验证文件大小
 * @param fileSize 文件大小（字节）
 * @param maxSize 最大大小（字节）
 */
export function isValidFileSize(fileSize: number, maxSize: number): boolean {
  return fileSize <= maxSize;
}

/**
 * 常用文件类型
 */
export const FILE_TYPES = {
  IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'],
  DOCUMENT: ['doc', 'docx', 'pdf', 'txt', 'rtf', 'odt'],
  SPREADSHEET: ['xls', 'xlsx', 'csv'],
  PRESENTATION: ['ppt', 'pptx'],
  ARCHIVE: ['zip', 'rar', '7z', 'tar', 'gz'],
  VIDEO: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'],
  AUDIO: ['mp3', 'wav', 'flac', 'aac', 'ogg'],
};

/**
 * 常用文件大小限制
 */
export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  VIDEO: 100 * 1024 * 1024, // 100MB
  AUDIO: 20 * 1024 * 1024, // 20MB
  DEFAULT: 50 * 1024 * 1024, // 50MB
};

/**
 * 表单验证规则生成器
 */
export const formRules = {
  required: (message: string = '此项为必填项') => ({
    required: true,
    message,
  }),
  
  email: (message: string = '请输入有效的邮箱地址') => ({
    type: 'email' as const,
    message,
  }),
  
  phone: (message: string = '请输入有效的手机号') => ({
    pattern: /^1[3-9]\d{9}$/,
    message,
  }),
  
  minLength: (min: number, message?: string) => ({
    min,
    message: message || `最少输入${min}个字符`,
  }),
  
  maxLength: (max: number, message?: string) => ({
    max,
    message: message || `最多输入${max}个字符`,
  }),
  
  range: (min: number, max: number, message?: string) => ({
    min,
    max,
    message: message || `请输入${min}-${max}个字符`,
  }),
  
  pattern: (pattern: RegExp, message: string) => ({
    pattern,
    message,
  }),
  
  url: (message: string = '请输入有效的URL') => ({
    type: 'url' as const,
    message,
  }),
  
  number: (message: string = '请输入数字') => ({
    type: 'number' as const,
    message,
  }),
};