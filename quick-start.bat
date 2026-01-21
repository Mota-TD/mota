@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo    MOTA 快速启动脚本
echo ========================================
echo.

set "DEPLOY_DIR=%~dp0mota-service\deploy"
set "SERVICE_DIR=%~dp0mota-service"

echo [1/3] 启动中间件...
cd /d "%DEPLOY_DIR%"
docker-compose -f docker-compose.middleware.yml up -d
if errorlevel 1 (
    echo [错误] 中间件启动失败
    pause
    exit /b 1
)

echo.
echo [2/3] 等待中间件就绪 (60秒)...
timeout /t 60 /nobreak >nul

echo.
echo [3/3] 启动微服务...
docker-compose -f docker-compose.services.yml up -d --build
if errorlevel 1 (
    echo [错误] 微服务启动失败
    pause
    exit /b 1
)

echo.
echo ========================================
echo   启动完成!
echo.
echo   API 网关: http://localhost:8080
echo   Nacos:    http://localhost:8848/nacos
echo ========================================
echo.
pause