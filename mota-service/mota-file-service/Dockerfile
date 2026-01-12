# 文件服务 Dockerfile
FROM eclipse-temurin:21-jre-alpine

LABEL maintainer="mota"
LABEL description="Mota File Service - 文件上传、分片上传、断点续传、秒传、预览、缩略图"

# 设置时区
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# 安装必要工具
RUN apk add --no-cache curl

# 创建应用目录
WORKDIR /app

# 创建非root用户
RUN addgroup -g 1000 mota && adduser -u 1000 -G mota -s /bin/sh -D mota

# 复制jar�?
COPY target/*.jar app.jar

# 创建临时目录和日志目�?
RUN mkdir -p /app/logs /app/temp && chown -R mota:mota /app

# 切换到非root用户
USER mota

# 暴露端口
EXPOSE 8090

# 健康检�?
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8090/actuator/health || exit 1

# JVM参数
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -Djava.security.egd=file:/dev/./urandom"

# 启动命令
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
