# 用户服务 Dockerfile
FROM eclipse-temurin:21-jre-alpine

LABEL maintainer="Mota Team"
LABEL description="Mota User Service - 用户管理服务"

# 设置工作目录
WORKDIR /app

# 设置时区
ENV TZ=Asia/Shanghai
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

# 创建非root用户
RUN addgroup -g 1000 mota && \
    adduser -u 1000 -G mota -s /bin/sh -D mota

# 复制jar�?
COPY target/mota-user-service-*.jar app.jar

# 设置权限
RUN chown -R mota:mota /app

# 切换到非root用户
USER mota

# 暴露端口
EXPOSE 8082

# JVM参数
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"

# 健康检�?
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -q --spider http://localhost:8082/actuator/health || exit 1

# 启动命令
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
