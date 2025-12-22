@echo off
chcp 65001 >nul
echo ========================================
echo   摩塔 Mota 后端服务启动脚本
echo ========================================
echo.

REM 检查 Docker 是否运行
docker info >nul 2>&1
if errorlevel 1 (
    echo [错误] Docker 未运行，请先启动 Docker Desktop
    echo.
    echo 请按以下步骤操作：
    echo 1. 打开 Docker Desktop 应用
    echo 2. 等待 Docker 启动完成（托盘图标变为绑定状态）
    echo 3. 重新运行此脚本
    pause
    exit /b 1
)

echo [1/4] Docker 已运行
echo.

REM 启动基础设施
echo [2/4] 启动基础设施（PostgreSQL、Redis、Nacos）...
docker-compose up -d

if errorlevel 1 (
    echo [错误] 启动基础设施失败
    pause
    exit /b 1
)

echo.
echo [3/4] 等待服务就绪（约30秒）...
timeout /t 30 /nobreak >nul

echo.
echo [4/4] 基础设施启动完成！
echo.
echo ========================================
echo   服务访问地址
echo ========================================
echo   PostgreSQL: localhost:5432
echo   Redis:      localhost:6379
echo   Nacos:      http://localhost:8848/nacos
echo              用户名: nacos
echo              密码:   nacos
echo ========================================
echo.
echo 现在可以启动后端微服务了：
echo   cd .. ^&^& java -jar mota-auth-service/target/mota-auth-service-1.0.0-SNAPSHOT.jar
echo.
pause