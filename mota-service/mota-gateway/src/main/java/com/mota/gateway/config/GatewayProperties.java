package com.mota.gateway.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * 网关配置属性
 */
@Data
@Component
@ConfigurationProperties(prefix = "gateway")
public class GatewayProperties {
    
    /**
     * 白名单路径列表（不需要认证的路径）
     */
    private List<String> whiteList = new ArrayList<>();
}