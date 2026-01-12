package com.mota.search.config;

import io.milvus.client.MilvusServiceClient;
import io.milvus.param.ConnectParam;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Milvus向量数据库配置类
 * 
 * @author mota
 */
@Configuration
public class MilvusConfig {

    @Value("${milvus.host:localhost}")
    private String host;

    @Value("${milvus.port:19530}")
    private int port;

    @Value("${milvus.username:}")
    private String username;

    @Value("${milvus.password:}")
    private String password;

    @Value("${milvus.database:default}")
    private String database;

    @Value("${milvus.connect-timeout:10000}")
    private long connectTimeout;

    @Value("${milvus.keep-alive-time:55000}")
    private long keepAliveTime;

    @Value("${milvus.idle-timeout:24}")
    private long idleTimeout;

    @Bean
    public MilvusServiceClient milvusServiceClient() {
        ConnectParam.Builder builder = ConnectParam.newBuilder()
                .withHost(host)
                .withPort(port)
                .withDatabaseName(database)
                .withConnectTimeout(connectTimeout, java.util.concurrent.TimeUnit.MILLISECONDS)
                .withKeepAliveTime(keepAliveTime, java.util.concurrent.TimeUnit.MILLISECONDS)
                .withIdleTimeout(idleTimeout, java.util.concurrent.TimeUnit.HOURS);

        // 配置认证
        if (username != null && !username.isEmpty()) {
            builder.withAuthorization(username, password);
        }

        return new MilvusServiceClient(builder.build());
    }
}