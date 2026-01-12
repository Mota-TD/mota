package com.mota.common.core.constant;

/**
 * 通用常量
 * 
 * @author Mota
 * @since 1.0.0
 */
public interface CommonConstants {

    // ========== 系统常量 ==========

    /**
     * 系统名称
     */
    String SYSTEM_NAME = "Mota";

    /**
     * 默认字符集
     */
    String DEFAULT_CHARSET = "UTF-8";

    /**
     * 默认时区
     */
    String DEFAULT_TIMEZONE = "Asia/Shanghai";

    // ========== 状态常量 ==========

    /**
     * 启用状态
     */
    Integer STATUS_ENABLED = 1;

    /**
     * 禁用状态
     */
    Integer STATUS_DISABLED = 0;

    /**
     * 删除标记 - 未删除
     */
    Integer NOT_DELETED = 0;

    /**
     * 删除标记 - 已删除
     */
    Integer DELETED = 1;

    // ========== 布尔常量 ==========

    /**
     * 是
     */
    Integer YES = 1;

    /**
     * 否
     */
    Integer NO = 0;

    /**
     * 真
     */
    String TRUE = "true";

    /**
     * 假
     */
    String FALSE = "false";

    // ========== 分页常量 ==========

    /**
     * 默认页码
     */
    Integer DEFAULT_PAGE_NUM = 1;

    /**
     * 默认每页大小
     */
    Integer DEFAULT_PAGE_SIZE = 10;

    /**
     * 最大每页大小
     */
    Integer MAX_PAGE_SIZE = 1000;

    // ========== 请求头常量 ==========

    /**
     * 租户ID请求头
     */
    String HEADER_TENANT_ID = "X-Tenant-Id";

    /**
     * 用户ID请求头
     */
    String HEADER_USER_ID = "X-User-Id";

    /**
     * 用户名请求头
     */
    String HEADER_USERNAME = "X-Username";

    /**
     * 用户昵称请求头
     */
    String HEADER_NICKNAME = "X-Nickname";

    /**
     * 部门ID请求头
     */
    String HEADER_DEPT_ID = "X-Dept-Id";

    /**
     * 角色请求头
     */
    String HEADER_ROLES = "X-Roles";

    /**
     * 权限请求头
     */
    String HEADER_PERMISSIONS = "X-Permissions";

    /**
     * 数据权限范围请求头
     */
    String HEADER_DATA_SCOPE = "X-Data-Scope";

    /**
     * 超级管理员请求头
     */
    String HEADER_SUPER_ADMIN = "X-Super-Admin";

    /**
     * 请求ID请求头
     */
    String HEADER_REQUEST_ID = "X-Request-Id";

    /**
     * 请求来源请求头
     */
    String HEADER_REQUEST_SOURCE = "X-Request-Source";

    /**
     * 授权请求头
     */
    String HEADER_AUTHORIZATION = "Authorization";

    /**
     * Bearer前缀
     */
    String BEARER_PREFIX = "Bearer ";

    // ========== 缓存Key前缀 ==========

    /**
     * 缓存Key前缀
     */
    String CACHE_PREFIX = "mota:";

    /**
     * 用户缓存前缀
     */
    String CACHE_USER_PREFIX = CACHE_PREFIX + "user:";

    /**
     * 租户缓存前缀
     */
    String CACHE_TENANT_PREFIX = CACHE_PREFIX + "tenant:";

    /**
     * 权限缓存前缀
     */
    String CACHE_PERMISSION_PREFIX = CACHE_PREFIX + "permission:";

    /**
     * 字典缓存前缀
     */
    String CACHE_DICT_PREFIX = CACHE_PREFIX + "dict:";

    /**
     * 配置缓存前缀
     */
    String CACHE_CONFIG_PREFIX = CACHE_PREFIX + "config:";

    /**
     * 验证码缓存前缀
     */
    String CACHE_CAPTCHA_PREFIX = CACHE_PREFIX + "captcha:";

    /**
     * Token缓存前缀
     */
    String CACHE_TOKEN_PREFIX = CACHE_PREFIX + "token:";

    /**
     * 分布式锁前缀
     */
    String LOCK_PREFIX = CACHE_PREFIX + "lock:";

    // ========== 缓存过期时间（秒） ==========

    /**
     * 默认缓存过期时间（1小时）
     */
    long CACHE_DEFAULT_EXPIRE = 3600L;

    /**
     * 短期缓存过期时间（5分钟）
     */
    long CACHE_SHORT_EXPIRE = 300L;

    /**
     * 长期缓存过期时间（24小时）
     */
    long CACHE_LONG_EXPIRE = 86400L;

    /**
     * 验证码过期时间（5分钟）
     */
    long CAPTCHA_EXPIRE = 300L;

    /**
     * Token过期时间（7天）
     */
    long TOKEN_EXPIRE = 604800L;

    /**
     * 刷新Token过期时间（30天）
     */
    long REFRESH_TOKEN_EXPIRE = 2592000L;

    // ========== 数据权限范围 ==========

    /**
     * 全部数据权限
     */
    Integer DATA_SCOPE_ALL = 1;

    /**
     * 自定义数据权限
     */
    Integer DATA_SCOPE_CUSTOM = 2;

    /**
     * 本部门数据权限
     */
    Integer DATA_SCOPE_DEPT = 3;

    /**
     * 本部门及以下数据权限
     */
    Integer DATA_SCOPE_DEPT_AND_CHILD = 4;

    /**
     * 仅本人数据权限
     */
    Integer DATA_SCOPE_SELF = 5;

    // ========== 操作类型 ==========

    /**
     * 新增
     */
    String OPERATION_CREATE = "CREATE";

    /**
     * 修改
     */
    String OPERATION_UPDATE = "UPDATE";

    /**
     * 删除
     */
    String OPERATION_DELETE = "DELETE";

    /**
     * 查询
     */
    String OPERATION_QUERY = "QUERY";

    /**
     * 导入
     */
    String OPERATION_IMPORT = "IMPORT";

    /**
     * 导出
     */
    String OPERATION_EXPORT = "EXPORT";

    // ========== 文件相关 ==========

    /**
     * 默认文件大小限制（50MB）
     */
    long DEFAULT_MAX_FILE_SIZE = 50 * 1024 * 1024L;

    /**
     * 图片文件扩展名
     */
    String[] IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"};

    /**
     * 文档文件扩展名
     */
    String[] DOCUMENT_EXTENSIONS = {"doc", "docx", "xls", "xlsx", "ppt", "pptx", "pdf", "txt", "md"};

    /**
     * 视频文件扩展名
     */
    String[] VIDEO_EXTENSIONS = {"mp4", "avi", "mov", "wmv", "flv", "mkv"};

    /**
     * 音频文件扩展名
     */
    String[] AUDIO_EXTENSIONS = {"mp3", "wav", "flac", "aac", "ogg"};

    // ========== 正则表达式 ==========

    /**
     * 手机号正则
     */
    String REGEX_MOBILE = "^1[3-9]\\d{9}$";

    /**
     * 邮箱正则
     */
    String REGEX_EMAIL = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";

    /**
     * 用户名正则（字母开头，允许字母数字下划线，4-20位）
     */
    String REGEX_USERNAME = "^[a-zA-Z][a-zA-Z0-9_]{3,19}$";

    /**
     * 密码正则（至少包含字母和数字，6-20位）
     */
    String REGEX_PASSWORD = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{6,20}$";

    /**
     * 身份证号正则
     */
    String REGEX_ID_CARD = "^\\d{17}[\\dXx]$";
}