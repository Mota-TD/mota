@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo    测试启动脚本
echo ========================================
echo.

set "DEPLOY_DIR=%~dp0mota-service\deploy"
set "SERVICE_DIR=%~dp0mota-service"

echo [步骤 1/3] 启动完整版中间件...
cd /d "%DEPLOY_DIR%"
echo 当前目录: %CD%
echo.

docker-compose -f docker-compose.middleware.yml up -d
if errorlevel 1 (
    echo.
    echo [错误] 中间件启动失败
    pause
    exit /b 1
)

echo.
echo [信息] 中间件启动成功,等待就绪 (10秒测试)...
timeout /t 10 /nobreak >nul 2>&1

echo.
echo [步骤 2/3] 检查 Maven...
cd /d "%SERVICE_DIR%"
if exist "mvnw.cmd" (
    echo [信息] 找到 Maven Wrapper
) else (
    echo [信息] 未找到 Maven Wrapper，跳过编译
)

echo.
echo [步骤 3/3] 启动微服务...
cd /d "%DEPLOY_DIR%"
docker-compose -f docker-compose.services.yml up -d --build
if errorlevel 1 (
    echo.
    echo [错误] 微服务启动失败
    pause
    exit /b 1
)

echo.
echo ========================================
echo   全部服务启动完成!
echo.
echo   访问地址:
echo   - API 网关:   http://localhost:8080
echo   - Nacos:      http://localhost:8848/nacos
echo ========================================
echo.
echo 测试成功! 按任意键退出...
pause