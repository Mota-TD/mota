package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 文档访问记录实体
 */
@Data
@TableName("document_access_log")
public class DocumentAccessLog {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 文档ID
     */
    private Long documentId;

    /**
     * 访问用户ID
     */
    private Long userId;

    /**
     * 项目ID
     */
    private Long projectId;

    /**
     * 访问类型: view, download, share, copy, reference
     */
    private String accessType;

    /**
     * 访问来源: search, direct, recommendation, link
     */
    private String accessSource;

    /**
     * 停留时长（秒）
     */
    private Integer durationSeconds;

    /**
     * 设备类型: desktop, mobile, tablet
     */
    private String deviceType;

    /**
     * 浏览器
     */
    private String browser;

    /**
     * IP地址
     */
    private String ipAddress;

    /**
     * 访问日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate accessDate;

    /**
     * 访问时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime accessTime;
}