# =====================================================
# Mota Calendar Service Dockerfile
# =====================================================

FROM eclipse-temurin:17-jre-alpine

LABEL maintainer="Mota Team"
LABEL description="Mota Calendar Service - 日历、日程管理服务"

# 设置工作目录
WORKDIR /app

# 设置时区
ENV TZ=Asia/Shanghai
RUN apk add --no-cache tzdata && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

# 创建非root用户
RUN addgroup -g 1000 mota && \
    adduser -u 1000 -G mota -s /bin/sh -D mota

# 复制jar包
COPY target/*.jar app.jar

# 设置文件权限
RUN chown -R mota:mota /app

# 切换到非root用户
USER mota

# 暴露端口
EXPOSE 8086

# JVM参数
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC -XX:MaxGCPauseMillis=100"

# 启动命令
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -jar app.jar"]