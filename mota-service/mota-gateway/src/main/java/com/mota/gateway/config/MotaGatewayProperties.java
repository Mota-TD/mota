package com.mota.gateway.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

/**
 * 网关配置属性
 */
@Data
@ConfigurationProperties(prefix = "gateway")
public class MotaGatewayProperties {
    
    /**
     * 白名单路径列表（不需要认证的路径）
     */
    private List<String> whiteList = new ArrayList<>();
}