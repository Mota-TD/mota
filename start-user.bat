@echo off
chcp 65001 >nul
echo ========================================
echo   MOTAI（摩塔智能） 前端端开发环境启动脚本
echo ========================================
echo.

:: 获取脚本所在目录
set "ROOT_DIR=%~dp0"
set "WEB_DIR=%ROOT_DIR%mota-web-next"
set "BFF_DIR=%ROOT_DIR%mota-bff\mota-user-bff"

:: 检查目录是否存在
if not exist "%WEB_DIR%" (
    echo [错误] 前端目录不存在: %WEB_DIR%
    pause
    exit /b 1
)

if not exist "%BFF_DIR%" (
    echo [错误] BFF 目录不存在: %BFF_DIR%
    pause
    exit /b 1
)

:: 检查 Node.js 环境
echo [检查] Node.js 环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] Node.js 未安装
    echo 请安装 Node.js 18+: https://nodejs.org/
    pause
    exit /b 1
)
echo [信息] Node.js 检查通过

:: 检查 BFF 的 node_modules 是否存在
if not exist "%BFF_DIR%\node_modules" (
    echo.
    echo [信息] BFF 依赖未安装，正在安装...
    cd /d "%BFF_DIR%"
    call npm install
    if errorlevel 1 (
        echo [错误] BFF 依赖安装失败
        pause
        exit /b 1
    )
)

:: 检查 BFF 的 .env 文件是否存在
if not exist "%BFF_DIR%\.env" (
    echo.
    echo [信息] 创建 BFF 环境配置文件...
    (
        echo # Application
        echo NODE_ENV=development
        echo PORT=3001
        echo.
        echo # JWT Configuration
        echo JWT_SECRET=mota-jwt-secret-key-2024
        echo JWT_EXPIRES_IN=7d
        echo.
        echo # Redis Configuration
        echo REDIS_HOST=localhost
        echo REDIS_PORT=6379
        echo REDIS_PASSWORD=
        echo REDIS_DB=0
        echo.
        echo # Cache Configuration
        echo CACHE_TTL=300000
        echo CACHE_MAX=1000
        echo.
        echo # Rate Limiting
        echo THROTTLE_TTL=60000
        echo THROTTLE_LIMIT=100
        echo.
        echo # Backend Services URLs
        echo USER_SERVICE_URL=http://localhost:8081
        echo TENANT_SERVICE_URL=http://localhost:8082
        echo PROJECT_SERVICE_URL=http://localhost:8083
        echo TASK_SERVICE_URL=http://localhost:8084
        echo COLLAB_SERVICE_URL=http://localhost:8085
        echo KNOWLEDGE_SERVICE_URL=http://localhost:8086
        echo AI_SERVICE_URL=http://localhost:8087
        echo NOTIFY_SERVICE_URL=http://localhost:8088
        echo CALENDAR_SERVICE_URL=http://localhost:8089
        echo SEARCH_SERVICE_URL=http://localhost:8090
        echo FILE_SERVICE_URL=http://localhost:8091
        echo REPORT_SERVICE_URL=http://localhost:8092
        echo.
        echo # Service Client Configuration
        echo SERVICE_TIMEOUT=30000
        echo.
        echo # Logging
        echo LOG_LEVEL=debug
    ) > "%BFF_DIR%\.env"
    echo [信息] 已创建默认 .env 文件
)

:: 检查前端的 node_modules 是否存在
if not exist "%WEB_DIR%\node_modules" (
    echo.
    echo [信息] 前端依赖未安装，正在安装...
    cd /d "%WEB_DIR%"
    call npm install
    if errorlevel 1 (
        echo [错误] 前端依赖安装失败
        pause
        exit /b 1
    )
)

echo.
echo [1/2] 启动 BFF 服务 (端口 3001)...
cd /d "%BFF_DIR%"
start "Mota BFF Service [3001]" cmd /k "title Mota BFF Service [3001] && npm run start:dev"

:: 等待 BFF 服务启动
echo [信息] 等待 BFF 服务启动...
timeout /t 5 /nobreak >nul

echo.
echo [2/2] 启动前端服务 (端口 3000)...
cd /d "%WEB_DIR%"
start "Mota Web Frontend [3000]" cmd /k "title Mota Web Frontend [3000] && npm run dev"

:: 等待前端服务启动后打开浏览器
echo [信息] 等待前端服务启动...
timeout /t 8 /nobreak >nul

echo [信息] 打开浏览器...
start http://localhost:3000

echo.
echo ========================================
echo   MOTAI（摩塔智能）前端服务启动完成！
echo ========================================
echo.
echo   前端地址: http://localhost:3000
echo   BFF 地址: http://localhost:3001
echo.
echo   [提示] 使用 stop-user.bat 停止所有服务
echo   [提示] 或直接关闭对应的终端窗口
echo.
echo   按任意键关闭此窗口...
pause >nul