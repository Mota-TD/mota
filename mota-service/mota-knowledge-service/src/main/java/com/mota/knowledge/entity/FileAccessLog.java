package com.mota.knowledge.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 文件访问日志实体
 */
@Data
@TableName("file_access_log")
public class FileAccessLog {

    @TableId(type = IdType.AUTO)
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
     * 用户ID
     */
    private Long userId;

    /**
     * 访问类型：view/download/edit/share
     */
    private String accessType;

    /**
     * 访问时间
     */
    private LocalDateTime accessTime;

    /**
     * 访问时长（秒）
     */
    private Integer duration;

    /**
     * 访问IP
     */
    private String ipAddress;

    /**
     * 用户代理
     */
    private String userAgent;

    /**
     * 设备类型：pc/mobile/tablet
     */
    private String deviceType;

    /**
     * 来源页面
     */
    private String referer;

    /**
     * 搜索关键词（如果从搜索进入）
     */
    private String searchKeyword;
}