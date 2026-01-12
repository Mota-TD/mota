package com.mota.common.core.result;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 结果码枚举
 */
@Getter
@AllArgsConstructor
public enum ResultCode implements IResultCode {

    // 成功
    SUCCESS(200, "操作成功"),

    // 客户端错误 4xx
    FAIL(400, "操作失败"),
    PARAM_ERROR(400, "参数错误"),
    BUSINESS_ERROR(400, "业务错误"),
    BAD_REQUEST(400, "请求参数错误"),
    UNAUTHORIZED(401, "未授权"),
    TOKEN_EXPIRED(401, "Token已过期"),
    TOKEN_INVALID(401, "Token无效"),
    FORBIDDEN(403, "禁止访问"),
    NOT_FOUND(404, "资源不存在"),
    METHOD_NOT_ALLOWED(405, "请求方法不允许"),
    CONFLICT(409, "资源冲突"),
    TOO_MANY_REQUESTS(429, "请求过于频繁"),

    // 服务端错误 5xx
    INTERNAL_SERVER_ERROR(500, "服务器内部错误"),
    SERVICE_UNAVAILABLE(503, "服务不可用"),
    GATEWAY_TIMEOUT(504, "网关超时"),

    // 业务错误 1xxx
    USER_NOT_FOUND(1001, "用户不存在"),
    USER_ALREADY_EXISTS(1002, "用户已存在"),
    USERNAME_OR_PASSWORD_ERROR(1003, "用户名或密码错误"),
    ACCOUNT_DISABLED(1004, "账号已禁用"),
    ACCOUNT_LOCKED(1005, "账号已锁定"),
    PASSWORD_ERROR(1006, "密码错误"),
    OLD_PASSWORD_ERROR(1007, "原密码错误"),
    CAPTCHA_ERROR(1008, "验证码错误"),
    CAPTCHA_EXPIRED(1009, "验证码已过期"),

    // 项目相关 2xxx
    PROJECT_NOT_FOUND(2001, "项目不存在"),
    PROJECT_ALREADY_EXISTS(2002, "项目已存在"),
    PROJECT_KEY_EXISTS(2003, "项目标识已存在"),
    NO_PROJECT_PERMISSION(2004, "无项目权限"),

    // 任务相关 3xxx
    ISSUE_NOT_FOUND(3001, "任务不存在"),
    ISSUE_STATUS_ERROR(3002, "任务状态错误"),
    SPRINT_NOT_FOUND(3003, "迭代不存在"),
    SPRINT_ALREADY_STARTED(3004, "迭代已开始"),

    // 文件相关 4xxx
    FILE_NOT_FOUND(4001, "文件不存在"),
    FILE_UPLOAD_ERROR(4002, "文件上传失败"),
    FILE_TYPE_NOT_ALLOWED(4003, "文件类型不允许"),
    FILE_SIZE_EXCEEDED(4004, "文件大小超限"),

    // AI相关 5xxx
    AI_SERVICE_ERROR(5001, "AI服务异常"),
    AI_QUOTA_EXCEEDED(5002, "AI配额已用尽"),
    AI_MODEL_NOT_AVAILABLE(5003, "AI模型不可用"),
    KNOWLEDGE_BASE_NOT_FOUND(5004, "知识库不存在");

    private final Integer code;
    private final String message;
}