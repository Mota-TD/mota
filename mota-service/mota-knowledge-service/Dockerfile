# =====================================================
# Mota Knowledge Service Dockerfile
# =====================================================

FROM eclipse-temurin:21-jre-alpine

LABEL maintainer="Mota Team"
LABEL description="Mota Knowledge Service"

# Set working directory
WORKDIR /app

# Set timezone
ENV TZ=Asia/Shanghai
RUN apk add --no-cache tzdata curl && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

# Create non-root user
RUN addgroup -g 1000 mota && \
    adduser -u 1000 -G mota -s /bin/sh -D mota

# Copy jar
COPY target/*.jar app.jar

# Set file permissions
RUN chown -R mota:mota /app

# Switch to non-root user
USER mota

# Expose port
EXPOSE 8084

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8084/actuator/health || exit 1

# JVM parameters
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC -XX:MaxGCPauseMillis=100 -XX:+HeapDumpOnOutOfMemoryError"

# Start command
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
