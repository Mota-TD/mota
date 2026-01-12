# 报表服务 Dockerfile
FROM eclipse-temurin:21-jre-alpine

LABEL maintainer="mota-team"
LABEL description="Mota Report Service - 报表服务"

# 设置工作目录
WORKDIR /app

# 设置时区
ENV TZ=Asia/Shanghai
RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/$TZ /etc/localtime \
    && echo $TZ > /etc/timezone

# 安装字体支持（用于PDF生成�?
RUN apk add --no-cache fontconfig ttf-dejavu

# 创建必要的目�?
RUN mkdir -p /app/logs /app/temp /data/reports /fonts

# 复制字体文件（如果有的话�?
# COPY fonts/* /fonts/

# 复制应用jar�?
COPY target/mota-report-service-*.jar app.jar

# 设置JVM参数
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -Djava.security.egd=file:/dev/./urandom"

# 暴露端口
EXPOSE 8090

# 健康检�?
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -q --spider http://localhost:8090/actuator/health || exit 1

# 启动命令
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
