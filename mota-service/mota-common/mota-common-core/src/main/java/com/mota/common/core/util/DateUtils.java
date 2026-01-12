package com.mota.common.core.util;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.Date;

/**
 * 日期时间工具类
 * 
 * @author Mota
 * @since 1.0.0
 */
public class DateUtils {

    /**
     * 默认日期格式
     */
    public static final String DATE_PATTERN = "yyyy-MM-dd";

    /**
     * 默认时间格式
     */
    public static final String TIME_PATTERN = "HH:mm:ss";

    /**
     * 默认日期时间格式
     */
    public static final String DATETIME_PATTERN = "yyyy-MM-dd HH:mm:ss";

    /**
     * ISO日期时间格式
     */
    public static final String ISO_DATETIME_PATTERN = "yyyy-MM-dd'T'HH:mm:ss";

    /**
     * 紧凑日期格式
     */
    public static final String COMPACT_DATE_PATTERN = "yyyyMMdd";

    /**
     * 紧凑日期时间格式
     */
    public static final String COMPACT_DATETIME_PATTERN = "yyyyMMddHHmmss";

    /**
     * 默认日期格式化器
     */
    public static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern(DATE_PATTERN);

    /**
     * 默认时间格式化器
     */
    public static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern(TIME_PATTERN);

    /**
     * 默认日期时间格式化器
     */
    public static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern(DATETIME_PATTERN);

    private DateUtils() {
        // 私有构造函数
    }

    // ========== 获取当前时间 ==========

    /**
     * 获取当前日期
     *
     * @return 当前日期
     */
    public static LocalDate today() {
        return LocalDate.now();
    }

    /**
     * 获取当前时间
     *
     * @return 当前时间
     */
    public static LocalTime now() {
        return LocalTime.now();
    }

    /**
     * 获取当前日期时间
     *
     * @return 当前日期时间
     */
    public static LocalDateTime nowDateTime() {
        return LocalDateTime.now();
    }

    /**
     * 获取当前时间戳（毫秒）
     *
     * @return 时间戳
     */
    public static long currentTimeMillis() {
        return System.currentTimeMillis();
    }

    /**
     * 获取当前时间戳（秒）
     *
     * @return 时间戳
     */
    public static long currentTimeSeconds() {
        return System.currentTimeMillis() / 1000;
    }

    // ========== 格式化 ==========

    /**
     * 格式化日期
     *
     * @param date 日期
     * @return 格式化后的字符串
     */
    public static String format(LocalDate date) {
        return date != null ? date.format(DATE_FORMATTER) : null;
    }

    /**
     * 格式化日期时间
     *
     * @param dateTime 日期时间
     * @return 格式化后的字符串
     */
    public static String format(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DATETIME_FORMATTER) : null;
    }

    /**
     * 格式化日期
     *
     * @param date    日期
     * @param pattern 格式
     * @return 格式化后的字符串
     */
    public static String format(LocalDate date, String pattern) {
        return date != null ? date.format(DateTimeFormatter.ofPattern(pattern)) : null;
    }

    /**
     * 格式化日期时间
     *
     * @param dateTime 日期时间
     * @param pattern  格式
     * @return 格式化后的字符串
     */
    public static String format(LocalDateTime dateTime, String pattern) {
        return dateTime != null ? dateTime.format(DateTimeFormatter.ofPattern(pattern)) : null;
    }

    // ========== 解析 ==========

    /**
     * 解析日期
     *
     * @param dateStr 日期字符串
     * @return 日期
     */
    public static LocalDate parseDate(String dateStr) {
        return dateStr != null ? LocalDate.parse(dateStr, DATE_FORMATTER) : null;
    }

    /**
     * 解析日期时间
     *
     * @param dateTimeStr 日期时间字符串
     * @return 日期时间
     */
    public static LocalDateTime parseDateTime(String dateTimeStr) {
        return dateTimeStr != null ? LocalDateTime.parse(dateTimeStr, DATETIME_FORMATTER) : null;
    }

    /**
     * 解析日期
     *
     * @param dateStr 日期字符串
     * @param pattern 格式
     * @return 日期
     */
    public static LocalDate parseDate(String dateStr, String pattern) {
        return dateStr != null ? LocalDate.parse(dateStr, DateTimeFormatter.ofPattern(pattern)) : null;
    }

    /**
     * 解析日期时间
     *
     * @param dateTimeStr 日期时间字符串
     * @param pattern     格式
     * @return 日期时间
     */
    public static LocalDateTime parseDateTime(String dateTimeStr, String pattern) {
        return dateTimeStr != null ? LocalDateTime.parse(dateTimeStr, DateTimeFormatter.ofPattern(pattern)) : null;
    }

    // ========== 转换 ==========

    /**
     * Date转LocalDateTime
     *
     * @param date Date对象
     * @return LocalDateTime
     */
    public static LocalDateTime toLocalDateTime(Date date) {
        return date != null ? LocalDateTime.ofInstant(date.toInstant(), ZoneId.systemDefault()) : null;
    }

    /**
     * Date转LocalDate
     *
     * @param date Date对象
     * @return LocalDate
     */
    public static LocalDate toLocalDate(Date date) {
        return date != null ? toLocalDateTime(date).toLocalDate() : null;
    }

    /**
     * LocalDateTime转Date
     *
     * @param dateTime LocalDateTime对象
     * @return Date
     */
    public static Date toDate(LocalDateTime dateTime) {
        return dateTime != null ? Date.from(dateTime.atZone(ZoneId.systemDefault()).toInstant()) : null;
    }

    /**
     * LocalDate转Date
     *
     * @param date LocalDate对象
     * @return Date
     */
    public static Date toDate(LocalDate date) {
        return date != null ? Date.from(date.atStartOfDay(ZoneId.systemDefault()).toInstant()) : null;
    }

    /**
     * 时间戳转LocalDateTime
     *
     * @param timestamp 时间戳（毫秒）
     * @return LocalDateTime
     */
    public static LocalDateTime toLocalDateTime(long timestamp) {
        return LocalDateTime.ofInstant(Instant.ofEpochMilli(timestamp), ZoneId.systemDefault());
    }

    /**
     * LocalDateTime转时间戳
     *
     * @param dateTime LocalDateTime对象
     * @return 时间戳（毫秒）
     */
    public static long toTimestamp(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli() : 0;
    }

    // ========== 计算 ==========

    /**
     * 计算两个日期之间的天数
     *
     * @param start 开始日期
     * @param end   结束日期
     * @return 天数
     */
    public static long daysBetween(LocalDate start, LocalDate end) {
        return ChronoUnit.DAYS.between(start, end);
    }

    /**
     * 计算两个日期时间之间的小时数
     *
     * @param start 开始时间
     * @param end   结束时间
     * @return 小时数
     */
    public static long hoursBetween(LocalDateTime start, LocalDateTime end) {
        return ChronoUnit.HOURS.between(start, end);
    }

    /**
     * 计算两个日期时间之间的分钟数
     *
     * @param start 开始时间
     * @param end   结束时间
     * @return 分钟数
     */
    public static long minutesBetween(LocalDateTime start, LocalDateTime end) {
        return ChronoUnit.MINUTES.between(start, end);
    }

    /**
     * 日期加天数
     *
     * @param date 日期
     * @param days 天数
     * @return 新日期
     */
    public static LocalDate plusDays(LocalDate date, long days) {
        return date.plusDays(days);
    }

    /**
     * 日期减天数
     *
     * @param date 日期
     * @param days 天数
     * @return 新日期
     */
    public static LocalDate minusDays(LocalDate date, long days) {
        return date.minusDays(days);
    }

    /**
     * 日期时间加小时
     *
     * @param dateTime 日期时间
     * @param hours    小时数
     * @return 新日期时间
     */
    public static LocalDateTime plusHours(LocalDateTime dateTime, long hours) {
        return dateTime.plusHours(hours);
    }

    /**
     * 日期时间减小时
     *
     * @param dateTime 日期时间
     * @param hours    小时数
     * @return 新日期时间
     */
    public static LocalDateTime minusHours(LocalDateTime dateTime, long hours) {
        return dateTime.minusHours(hours);
    }

    // ========== 边界 ==========

    /**
     * 获取一天的开始时间
     *
     * @param date 日期
     * @return 开始时间
     */
    public static LocalDateTime startOfDay(LocalDate date) {
        return date.atStartOfDay();
    }

    /**
     * 获取一天的结束时间
     *
     * @param date 日期
     * @return 结束时间
     */
    public static LocalDateTime endOfDay(LocalDate date) {
        return date.atTime(LocalTime.MAX);
    }

    /**
     * 获取本周第一天
     *
     * @return 本周第一天
     */
    public static LocalDate firstDayOfWeek() {
        return LocalDate.now().with(DayOfWeek.MONDAY);
    }

    /**
     * 获取本周最后一天
     *
     * @return 本周最后一天
     */
    public static LocalDate lastDayOfWeek() {
        return LocalDate.now().with(DayOfWeek.SUNDAY);
    }

    /**
     * 获取本月第一天
     *
     * @return 本月第一天
     */
    public static LocalDate firstDayOfMonth() {
        return LocalDate.now().with(TemporalAdjusters.firstDayOfMonth());
    }

    /**
     * 获取本月最后一天
     *
     * @return 本月最后一天
     */
    public static LocalDate lastDayOfMonth() {
        return LocalDate.now().with(TemporalAdjusters.lastDayOfMonth());
    }

    /**
     * 获取本年第一天
     *
     * @return 本年第一天
     */
    public static LocalDate firstDayOfYear() {
        return LocalDate.now().with(TemporalAdjusters.firstDayOfYear());
    }

    /**
     * 获取本年最后一天
     *
     * @return 本年最后一天
     */
    public static LocalDate lastDayOfYear() {
        return LocalDate.now().with(TemporalAdjusters.lastDayOfYear());
    }

    // ========== 判断 ==========

    /**
     * 判断是否是今天
     *
     * @param date 日期
     * @return 是否是今天
     */
    public static boolean isToday(LocalDate date) {
        return date != null && date.equals(LocalDate.now());
    }

    /**
     * 判断是否是过去
     *
     * @param dateTime 日期时间
     * @return 是否是过去
     */
    public static boolean isPast(LocalDateTime dateTime) {
        return dateTime != null && dateTime.isBefore(LocalDateTime.now());
    }

    /**
     * 判断是否是未来
     *
     * @param dateTime 日期时间
     * @return 是否是未来
     */
    public static boolean isFuture(LocalDateTime dateTime) {
        return dateTime != null && dateTime.isAfter(LocalDateTime.now());
    }

    /**
     * 判断是否在指定范围内
     *
     * @param dateTime 日期时间
     * @param start    开始时间
     * @param end      结束时间
     * @return 是否在范围内
     */
    public static boolean isBetween(LocalDateTime dateTime, LocalDateTime start, LocalDateTime end) {
        return dateTime != null && !dateTime.isBefore(start) && !dateTime.isAfter(end);
    }

    /**
     * 判断是否是工作日
     *
     * @param date 日期
     * @return 是否是工作日
     */
    public static boolean isWeekday(LocalDate date) {
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        return dayOfWeek != DayOfWeek.SATURDAY && dayOfWeek != DayOfWeek.SUNDAY;
    }

    /**
     * 判断是否是周末
     *
     * @param date 日期
     * @return 是否是周末
     */
    public static boolean isWeekend(LocalDate date) {
        return !isWeekday(date);
    }
}