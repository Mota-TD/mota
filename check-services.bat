@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

echo ========================================
echo    MOTA 服务状态检查
echo ========================================
echo.

:: 检查 Docker 是否运行
docker --version >nul 2>&1
if errorlevel 1 (
    echo [错误] Docker 未安装或未运行
    pause
    exit /b 1
)

echo [信息] 正在检查服务状态...
echo.

:: 切换到部署目录
cd /d "%~dp0mota-service\deploy"

echo ========================================
echo   中间件服务状态
echo ========================================
echo.
docker-compose -f docker-compose.middleware.yml ps

echo.
echo ========================================
echo   微服务状态
echo ========================================
echo.
docker-compose -f docker-compose.services.yml ps

echo.
echo ========================================
echo   服务健康状态汇总
echo ========================================
echo.

:: 统计健康状态
set HEALTHY_COUNT=0
set STARTING_COUNT=0
set UNHEALTHY_COUNT=0
set TOTAL_COUNT=0

for /f "tokens=*" %%i in ('docker ps --filter "name=mota-" --format "{{.Status}}"') do (
    set /a TOTAL_COUNT+=1
    echo %%i | findstr /C:"healthy" >nul
    if !errorlevel! equ 0 (
        set /a HEALTHY_COUNT+=1
    ) else (
        echo %%i | findstr /C:"starting" >nul
        if !errorlevel! equ 0 (
            set /a STARTING_COUNT+=1
        ) else (
            set /a UNHEALTHY_COUNT+=1
        )
    )
)

echo 总服务数: !TOTAL_COUNT!
echo 健康服务: !HEALTHY_COUNT!
echo 启动中:   !STARTING_COUNT!
echo 异常服务: !UNHEALTHY_COUNT!

echo.
echo ========================================
echo   访问地址
echo ========================================
echo.
echo   - API 网关:   http://localhost:8080
echo   - Nacos:      http://localhost:8848/nacos
echo   - MinIO:      http://localhost:9001
echo   - Kafka UI:   http://localhost:8090 (需启用 tools profile)
echo.
echo   微服务端口:
echo   - Gateway:    8080
echo   - Auth:       8081
echo   - Project:    8082
echo   - AI:         8083
echo   - Knowledge:  8084
echo   - Notify:     8085
echo   - Calendar:   8086
echo   - User:       8087
echo.
echo   中间件端口:
echo   - MySQL:      3306
echo   - Redis:      6379
echo   - Nacos:      8848
echo   - Kafka:      9092
echo   - ES:         9200
echo   - Milvus:     19530
echo   - MinIO:      9000
echo.

pause