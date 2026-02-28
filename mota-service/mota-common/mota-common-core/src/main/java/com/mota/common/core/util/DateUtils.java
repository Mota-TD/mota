package com.mota.common.core.util;

import com.mota.common.core.constant.CommonConstants;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.Date;

/**
 * 日期时间工具类
 * 
 * 提供常用的日期时间操作方法，避免代码重复
 * 所有方法使用Java 8+ 时间API
 *
 * @author Mota
 * @since 1.0.0
 */
public final class DateUtils {

    // ========== 常用日期格式 ==========

    /**
     * 日期格式：yyyy-MM-dd
     */
    public static final String DATE_PATTERN = "yyyy-MM-dd";

    /**
     * 时间格式：HH:mm:ss
     */
    public static final String TIME_PATTERN = "HH:mm:ss";

    /**
     * 日期时间格式：yyyy-MM-dd HH:mm:ss
     */
    public static final String DATETIME_PATTERN = "yyyy-MM-dd HH:mm:ss";

    /**
     * 日期时间格式（带���秒）：yyyy-MM-dd HH:mm:ss.SSS
     */
    public static final String DATETIME_MS_PATTERN = "yyyy-MM-dd HH:mm:ss.SSS";

    /**
     * ISO 8601格式：yyyy-MM-dd'T'HH:mm:ss'Z'
     */
    public static final String ISO_DATETIME_PATTERN = "yyyy-MM-dd'T'HH:mm:ss'Z'";

    /**
     * 紧凑日期格式：yyyyMMdd
     */
    public static final String COMPACT_DATE_PATTERN = "yyyyMMdd";

    /**
     * 紧凑日期时间格式：yyyyMMddHHmmss
     */
    public static final String COMPACT_DATETIME_PATTERN = "yyyyMMddHHmmss";

    // ========== 预编译的格式化器 ==========

    public static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern(DATE_PATTERN);
    public static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern(TIME_PATTERN);
    public static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern(DATETIME_PATTERN);
    public static final DateTimeFormatter DATETIME_MS_FORMATTER = DateTimeFormatter.ofPattern(DATETIME_MS_PATTERN);
    public static final DateTimeFormatter COMPACT_DATE_FORMATTER = DateTimeFormatter.ofPattern(COMPACT_DATE_PATTERN);
    public static final DateTimeFormatter COMPACT_DATETIME_FORMATTER = DateTimeFormatter.ofPattern(COMPACT_DATETIME_PATTERN);

    /**
     * 默认时区
     */
    public static final ZoneId DEFAULT_ZONE = ZoneId.of(CommonConstants.DEFAULT_TIMEZONE);

    private DateUtils() {
        throw new UnsupportedOperationException("工具类不允许实例化");
    }

    // ========== 获取当前时间 ==========

    /**
     * 获取当前日期
     */
    public static LocalDate today() {
        return LocalDate.now(DEFAULT_ZONE);
    }

    /**
     * 获取当前时间
     */
    public static LocalTime now() {
        return LocalTime.now(DEFAULT_ZONE);
    }

    /**
     * 获取当前日期时间
     */
    public static LocalDateTime nowDateTime() {
        return LocalDateTime.now(DEFAULT_ZONE);
    }

    /**
     * 获取当前时间戳（毫秒）
     */
    public static long currentTimeMillis() {
        return System.currentTimeMillis();
    }

    /**
     * 获取当前时间戳（秒）
     */
    public static long currentTimeSeconds() {
        return System.currentTimeMillis() / 1000;
    }

    // ========== 格式化 ==========

    /**
     * 格式化日期：yyyy-MM-dd
     */
    public static String formatDate(LocalDate date) {
        return date != null ? date.format(DATE_FORMATTER) : null;
    }

    /**
     * 格式化时间：HH:mm:ss
     */
    public static String formatTime(LocalTime time) {
        return time != null ? time.format(TIME_FORMATTER) : null;
    }

    /**
     * 格式化日期时间：yyyy-MM-dd HH:mm:ss
     */
    public static String formatDateTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DATETIME_FORMATTER) : null;
    }

    /**
     * 格式化日期时间（自定义格式）
     */
    public static String format(LocalDateTime dateTime, String pattern) {
        return dateTime != null ? dateTime.format(DateTimeFormatter.ofPattern(pattern)) : null;
    }

    /**
     * 格式化Date为字符串：yyyy-MM-dd HH:mm:ss
     */
    public static String formatDate(Date date) {
        return date != null ? formatDateTime(toLocalDateTime(date)) : null;
    }

    // ========== 解析 ==========

    /**
     * 解析日期：yyyy-MM-dd
     */
    public static LocalDate parseDate(String dateStr) {
        return dateStr != null && !dateStr.isEmpty() ? LocalDate.parse(dateStr, DATE_FORMATTER) : null;
    }

    /**
     * 解析时间：HH:mm:ss
     */
    public static LocalTime parseTime(String timeStr) {
        return timeStr != null && !timeStr.isEmpty() ? LocalTime.parse(timeStr, TIME_FORMATTER) : null;
    }

    /**
     * 解析日期时间：yyyy-MM-dd HH:mm:ss
     */
    public static LocalDateTime parseDateTime(String dateTimeStr) {
        return dateTimeStr != null && !dateTimeStr.isEmpty() 
                ? LocalDateTime.parse(dateTimeStr, DATETIME_FORMATTER) : null;
    }

    /**
     * 解析日期时间（自定义格式）
     */
    public static LocalDateTime parse(String dateTimeStr, String pattern) {
        return dateTimeStr != null && !dateTimeStr.isEmpty()
                ? LocalDateTime.parse(dateTimeStr, DateTimeFormatter.ofPattern(pattern)) : null;
    }

    // ========== 类型转换 ==========

    /**
     * LocalDateTime 转 Date
     */
    public static Date toDate(LocalDateTime localDateTime) {
        if (localDateTime == null) return null;
        return Date.from(localDateTime.atZone(DEFAULT_ZONE).toInstant());
    }

    /**
     * LocalDate 转 Date
     */
    public static Date toDate(LocalDate localDate) {
        if (localDate == null) return null;
        return Date.from(localDate.atStartOfDay(DEFAULT_ZONE).toInstant());
    }

    /**
     * Date 转 LocalDateTime
     */
    public static LocalDateTime toLocalDateTime(Date date) {
        if (date == null) return null;
        return LocalDateTime.ofInstant(date.toInstant(), DEFAULT_ZONE);
    }

    /**
     * Date 转 LocalDate
     */
    public static LocalDate toLocalDate(Date date) {
        if (date == null) return null;
        return toLocalDateTime(date).toLocalDate();
    }

    /**
     * 时间戳（毫秒）转 LocalDateTime
     */
    public static LocalDateTime fromMillis(long millis) {
        return LocalDateTime.ofInstant(Instant.ofEpochMilli(millis), DEFAULT_ZONE);
    }

    /**
     * LocalDateTime 转时间戳（毫秒）
     */
    public static long toMillis(LocalDateTime localDateTime) {
        return localDateTime.atZone(DEFAULT_ZONE).toInstant().toEpochMilli();
    }

    // ========== 日期计算 ==========

    /**
     * 获取今天开始时间（00:00:00）
     */
    public static LocalDateTime startOfToday() {
        return today().atStartOfDay();
    }

    /**
     * 获取今天结束时间（23:59:59.999999999）
     */
    public static LocalDateTime endOfToday() {
        return today().atTime(LocalTime.MAX);
    }

    /**
     * 获取指定日期的开始时间
     */
    public static LocalDateTime startOfDay(LocalDate date) {
        return date != null ? date.atStartOfDay() : null;
    }

    /**
     * 获取指定日期的结束时间
     */
    public static LocalDateTime endOfDay(LocalDate date) {
        return date != null ? date.atTime(LocalTime.MAX) : null;
    }

    /**
     * 获取本周一
     */
    public static LocalDate mondayOfThisWeek() {
        return today().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }

    /**
     * 获取本月第一天
     */
    public static LocalDate firstDayOfMonth() {
        return today().with(TemporalAdjusters.firstDayOfMonth());
    }

    /**
     * 获取本月最后一天
     */
    public static LocalDate lastDayOfMonth() {
        return today().with(TemporalAdjusters.lastDayOfMonth());
    }

    /**
     * 计算两个日期之间的天数
     */
    public static long daysBetween(LocalDate start, LocalDate end) {
        return ChronoUnit.DAYS.between(start, end);
    }

    /**
     * 计算两个时间之间的小时数
     */
    public static long hoursBetween(LocalDateTime start, LocalDateTime end) {
        return ChronoUnit.HOURS.between(start, end);
    }

    /**
     * 计算两个时间之间的分钟数
     */
    public static long minutesBetween(LocalDateTime start, LocalDateTime end) {
        return ChronoUnit.MINUTES.between(start, end);
    }

    /**
     * 判断是否是今天
     */
    public static boolean isToday(LocalDate date) {
        return date != null && date.equals(today());
    }

    /**
     * 判断是否是同一天
     */
    public static boolean isSameDay(LocalDateTime dateTime1, LocalDateTime dateTime2) {
        if (dateTime1 == null || dateTime2 == null) return false;
        return dateTime1.toLocalDate().equals(dateTime2.toLocalDate());
    }

    /**
     * 判断日期是否在范围内（包含边界）
     */
    public static boolean isBetween(LocalDate date, LocalDate start, LocalDate end) {
        if (date == null || start == null || end == null) return false;
        return !date.isBefore(start) && !date.isAfter(end);
    }

    /**
     * 加天数
     */
    public static LocalDateTime plusDays(LocalDateTime dateTime, long days) {
        return dateTime != null ? dateTime.plusDays(days) : null;
    }

    /**
     * 加小时
     */
    public static LocalDateTime plusHours(LocalDateTime dateTime, long hours) {
        return dateTime != null ? dateTime.plusHours(hours) : null;
    }

    /**
     * 加分钟
     */
    public static LocalDateTime plusMinutes(LocalDateTime dateTime, long minutes) {
        return dateTime != null ? dateTime.plusMinutes(minutes) : null;
    }

    /**
     * 计算过期时间
     * 
     * @param expireSeconds 过期秒数
     * @return 过期时间点
     */
    public static LocalDateTime expireAt(long expireSeconds) {
        return nowDateTime().plusSeconds(expireSeconds);
    }

    /**
     * 判断是否已过期
     */
    public static boolean isExpired(LocalDateTime expireTime) {
        return expireTime != null && expireTime.isBefore(nowDateTime());
    }

    /**
     * 获取友好的时间描述（如：刚刚、5分钟前、1小��前等）
     */
    public static String friendlyTime(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        
        LocalDateTime now = nowDateTime();
        long minutes = minutesBetween(dateTime, now);
        
        if (minutes < 0) {
            return "未来";
        } else if (minutes < 1) {
            return "刚刚";
        } else if (minutes < 60) {
            return minutes + "分钟前";
        } else if (minutes < 1440) { // 24小时
            return (minutes / 60) + "小时前";
        } else if (minutes < 10080) { // 7天
            return (minutes / 1440) + "天前";
        } else if (minutes < 43200) { // 30天
            return (minutes / 10080) + "周前";
        } else if (minutes < 525600) { // 365天
            return (minutes / 43200) + "月前";
        } else {
            return (minutes / 525600) + "年前";
        }
    }
}