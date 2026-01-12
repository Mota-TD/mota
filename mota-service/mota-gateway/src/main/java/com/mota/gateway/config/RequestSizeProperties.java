package com.mota.gateway.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 请求体大小限制配置属性
 */
@Data
@Component
@ConfigurationProperties(prefix = "gateway.request-size")
public class RequestSizeProperties {
    
    /**
     * 是否启用请求体大小限制
     */
    private boolean enabled = true;
    
    /**
     * 默认最大请求体大小（字节），默认10MB
     */
    private long maxRequestSize = 10 * 1024 * 1024L;
    
    /**
     * 文件上传最大大小（字节），默认100MB
     */
    private long maxFileUploadSize = 100 * 1024 * 1024L;
    
    /**
     * 文件上传路径列表（支持Ant风格通配符）
     */
    private List<String> fileUploadPaths = new ArrayList<>() {{
        add("/api/v1/knowledge/files/**");
        add("/api/v1/documents/upload/**");
        add("/api/v1/tasks/*/attachments/**");
        add("/api/v1/projects/*/files/**");
    }};
    
    /**
     * 路径级别的大小限制配置
     * key: 路径模式（支持Ant风格通配符）
     * value: 最大大小（字节）
     */
    private Map<String, Long> pathLimits = new HashMap<>();
}