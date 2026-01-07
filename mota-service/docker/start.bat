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

echo [1/5] Docker 已运行
echo.

REM 启动基础设施
echo [2/5] 启动基础设施（MySQL、Redis、Nacos）...
docker-compose up -d

if errorlevel 1 (
    echo [错误] 启动基础设施失败
    pause
    exit /b 1
)

echo.
echo [3/5] 等待MySQL启动（约15秒）...
timeout /t 15 /nobreak >nul

echo.
echo [4/5] 正在执行数据库初始化脚本...
echo      文件: ./init-db.sql
echo      架构: 微服务多库设计
echo.

docker exec -i mota-mysql mysql -uroot -proot123 < ./init-db.sql

if %errorlevel% equ 0 (
    echo      数据库初始化成功！
) else (
    echo      [警告] 数据库初始化可能失败，请检查日志
    echo      如果是首次运行，可能需要等待MySQL完全启动后重试
)

echo.
echo [5/5] 基础设施启动完成！
echo.
echo ========================================
echo   服务访问地址
echo ========================================
echo   MySQL:      localhost:3306
echo              root密码: root123
echo   Redis:      localhost:6379
echo   Nacos:      http://localhost:8848/nacos
echo              用户名: nacos
echo              密码:   nacos
echo ========================================
echo.
echo   微服务数据库架构：
echo   ----------------------------------------
echo   mota_auth      - 认证服务数据库
echo   mota_project   - 项目服务数据库
echo   mota_ai        - AI服务数据库
echo   mota_knowledge - 知识服务数据库
echo   mota_notify    - 通知服务数据库
echo   mota_calendar  - 日历服务数据库
echo   ----------------------------------------
echo   服务账户密码统一为: mota123
echo.
echo 现在可以启动后端微服务了：
echo   cd .. ^&^& java -jar mota-auth-service/target/mota-auth-service-1.0.0-SNAPSHOT.jar
echo.
pause