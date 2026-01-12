package com.mota.file.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 文件访问日志实体
 * 
 * @author mota
 */
@Data
@TableName("file_access_log")
public class FileAccessLog {

    /**
     * 日志ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 租户ID
     */
    private Long tenantId;

    /**
     * 文件ID
     */
    private Long fileId;

    /**
     * 访问类型：view/download/preview/share
     */
    private String accessType;

    /**
     * 访问用户ID
     */
    private Long userId;

    /**
     * 访问用户名
     */
    private String userName;

    /**
     * 访问IP
     */
    private String accessIp;

    /**
     * 用户代理
     */
    private String userAgent;

    /**
     * 来源页面
     */
    private String referer;

    /**
     * 访问时间
     */
    private LocalDateTime accessTime;

    /**
     * 响应时间（毫秒）
     */
    private Long responseTime;

    /**
     * 是否成功
     */
    private Boolean success;

    /**
     * 错误信息
     */
    private String errorMessage;

    /**
     * 访问类型常量
     */
    public static class AccessType {
        public static final String VIEW = "view";
        public static final String DOWNLOAD = "download";
        public static final String PREVIEW = "preview";
        public static final String SHARE = "share";
    }
}