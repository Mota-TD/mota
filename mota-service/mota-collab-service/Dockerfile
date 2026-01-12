# Mota协作服务 Dockerfile
# 多阶段构�?

# ==================== 构建阶段 ====================
FROM maven:3.9-eclipse-temurin-17-alpine AS builder

WORKDIR /build

# 复制父POM和模块POM
COPY pom.xml .
COPY mota-common/pom.xml mota-common/
COPY mota-common/mota-common-core/pom.xml mota-common/mota-common-core/
COPY mota-common/mota-common-mybatis/pom.xml mota-common/mota-common-mybatis/
COPY mota-common/mota-common-redis/pom.xml mota-common/mota-common-redis/
COPY mota-common/mota-common-security/pom.xml mota-common/mota-common-security/
COPY mota-common/mota-common-feign/pom.xml mota-common/mota-common-feign/
COPY mota-common/mota-common-kafka/pom.xml mota-common/mota-common-kafka/
COPY mota-common/mota-common-log/pom.xml mota-common/mota-common-log/
COPY mota-collab-service/pom.xml mota-collab-service/

# 下载依赖（利用Docker缓存�?
RUN mvn dependency:go-offline -B

# 复制源代�?
COPY mota-common mota-common
COPY mota-collab-service mota-collab-service

# 构建项目
RUN mvn clean package -DskipTests -pl mota-collab-service -am

# ==================== 运行阶段 ====================
FROM eclipse-temurin:21-jre-alpine

LABEL maintainer="Mota Team"
LABEL description="Mota Collaboration Service - 文档协作与实时编辑服�?
LABEL version="1.0.0"

# 设置时区
ENV TZ=Asia/Shanghai
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone && \
    apk del tzdata

# 创建应用用户
RUN addgroup -g 1000 mota && \
    adduser -u 1000 -G mota -s /bin/sh -D mota

# 创建应用目录
WORKDIR /app

# 从构建阶段复制JAR文件
COPY --from=builder /build/mota-collab-service/target/*.jar app.jar

# 设置文件权限
RUN chown -R mota:mota /app

# 切换到应用用�?
USER mota

# 暴露端口
EXPOSE 8086

# JVM参数
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -Djava.security.egd=file:/dev/./urandom"

# 健康检�?
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8086/actuator/health || exit 1

# 启动命令
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
