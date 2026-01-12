package com.mota.gateway.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * IP过滤器配置属性
 */
@Data
@Component
@ConfigurationProperties(prefix = "gateway.ip-filter")
public class IpFilterProperties {
    
    /**
     * 是否启用IP过滤
     */
    private boolean enabled = false;
    
    /**
     * 是否使用白名单模式
     * true: 只允许白名单中的IP访问
     * false: 禁止黑名单中的IP访问
     */
    private boolean whitelistMode = false;
    
    /**
     * IP白名单列表
     * 支持格式：
     * - 精确IP：192.168.1.1
     * - CIDR格式：192.168.1.0/24
     * - 通配符：192.168.1.*
     */
    private List<String> whitelist = new ArrayList<>();
    
    /**
     * IP黑名单列表
     * 支持格式同白名单
     */
    private List<String> blacklist = new ArrayList<>();
    
    /**
     * 是否启用动态黑名单（Redis存储）
     */
    private boolean dynamicBlacklistEnabled = true;
    
    /**
     * 动态黑名单默认过期时间（秒）
     */
    private int dynamicBlacklistTtl = 3600;
}