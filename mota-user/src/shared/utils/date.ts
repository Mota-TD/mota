/**
 * 日期工具函数
 */

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

// 配置 dayjs
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

/**
 * 格式化日期
 * @param date 日期
 * @param format 格式，默认 'YYYY-MM-DD'
 */
export function formatDate(date: string | Date | undefined | null, format: string = 'YYYY-MM-DD'): string {
  if (!date) return '-';
  return dayjs(date).format(format);
}

/**
 * 格式化日期时间
 * @param date 日期
 * @param format 格式，默认 'YYYY-MM-DD HH:mm'
 */
export function formatDateTime(date: string | Date | undefined | null, format: string = 'YYYY-MM-DD HH:mm'): string {
  if (!date) return '-';
  return dayjs(date).format(format);
}

/**
 * 格式化时间
 * @param date 日期
 * @param format 格式，默认 'HH:mm:ss'
 */
export function formatTime(date: string | Date | undefined | null, format: string = 'HH:mm:ss'): string {
  if (!date) return '-';
  return dayjs(date).format(format);
}

/**
 * 获取相对时间（如：3天前）
 * @param date 日期
 */
export function fromNow(date: string | Date | undefined | null): string {
  if (!date) return '-';
  return dayjs(date).fromNow();
}

/**
 * 获取两个日期之间的天数差
 * @param start 开始日期
 * @param end 结束日期
 */
export function getDaysDiff(start: string | Date, end: string | Date): number {
  return dayjs(end).diff(dayjs(start), 'day');
}

/**
 * 获取距离目标日期的天数
 * @param targetDate 目标日期
 */
export function getDaysRemaining(targetDate: string | Date): number {
  return dayjs(targetDate).diff(dayjs(), 'day');
}

/**
 * 检查日期是否已过期
 * @param date 日期
 */
export function isOverdue(date: string | Date | undefined | null): boolean {
  if (!date) return false;
  return dayjs(date).isBefore(dayjs(), 'day');
}

/**
 * 检查日期是否即将到期（默认7天内）
 * @param date 日期
 * @param days 天数，默认7天
 */
export function isUpcoming(date: string | Date | undefined | null, days: number = 7): boolean {
  if (!date) return false;
  const targetDate = dayjs(date);
  const now = dayjs();
  return targetDate.isAfter(now) && targetDate.diff(now, 'day') <= days;
}

/**
 * 检查日期是否是今天
 * @param date 日期
 */
export function isToday(date: string | Date | undefined | null): boolean {
  if (!date) return false;
  return dayjs(date).isSame(dayjs(), 'day');
}

/**
 * 获取日期范围的显示文本
 * @param start 开始日期
 * @param end 结束日期
 */
export function getDateRangeText(start: string | Date | undefined | null, end: string | Date | undefined | null): string {
  if (!start && !end) return '-';
  if (!start) return `截止 ${formatDate(end)}`;
  if (!end) return `${formatDate(start)} 起`;
  return `${formatDate(start)} ~ ${formatDate(end)}`;
}

/**
 * 获取工作日数量（排除周末）
 * @param start 开始日期
 * @param end 结束日期
 */
export function getWorkingDays(start: string | Date, end: string | Date): number {
  let count = 0;
  let current = dayjs(start);
  const endDate = dayjs(end);
  
  while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
    const dayOfWeek = current.day();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current = current.add(1, 'day');
  }
  
  return count;
}

/**
 * 获取本周的开始和结束日期
 */
export function getThisWeekRange(): { start: Date; end: Date } {
  return {
    start: dayjs().startOf('week').toDate(),
    end: dayjs().endOf('week').toDate()
  };
}

/**
 * 获取本月的开始和结束日期
 */
export function getThisMonthRange(): { start: Date; end: Date } {
  return {
    start: dayjs().startOf('month').toDate(),
    end: dayjs().endOf('month').toDate()
  };
}

/**
 * 获取本季度的开始和结束日期
 */
export function getThisQuarterRange(): { start: Date; end: Date } {
  const month = dayjs().month();
  const quarterStart = Math.floor(month / 3) * 3;
  return {
    start: dayjs().month(quarterStart).startOf('month').toDate(),
    end: dayjs().month(quarterStart + 2).endOf('month').toDate()
  };
}

/**
 * 获取本年的开始和结束日期
 */
export function getThisYearRange(): { start: Date; end: Date } {
  return {
    start: dayjs().startOf('year').toDate(),
    end: dayjs().endOf('year').toDate()
  };
}