@echo off
chcp 65001 >nul
echo ========================================
echo   MOTAI（摩塔智能） 前端开发环境启动脚本
echo ========================================
echo.

:: 获取脚本所在目录
set "ROOT_DIR=%~dp0"
set "WEB_DIR=%ROOT_DIR%mota-web"

:: 检查目录是否存在
if not exist "%WEB_DIR%" (
    echo [错误] 前端目录不存在: %WEB_DIR%
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
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [信息] Node.js 版本: %NODE_VERSION%

:: ========================================
:: 检查前端依赖
:: ========================================
echo.
echo [检查] 前端依赖状态...
set "WEB_NEED_INSTALL=0"

:: 检查 node_modules 是否存在
if not exist "%WEB_DIR%\node_modules" (
    echo [信息] 前端 node_modules 不存在，需要安装依赖
    set "WEB_NEED_INSTALL=1"
    goto :web_install
)

:: 检查 package-lock.json 是否存在
if not exist "%WEB_DIR%\package-lock.json" (
    echo [信息] 前端 package-lock.json 不存在，需要安装依赖
    set "WEB_NEED_INSTALL=1"
    goto :web_install
)

:: 比较 package.json 和 package-lock.json 的修改时间
powershell -Command "if ((Get-Item '%WEB_DIR%\package.json').LastWriteTime -gt (Get-Item '%WEB_DIR%\package-lock.json').LastWriteTime) { exit 1 } else { exit 0 }" >nul 2>&1
if errorlevel 1 (
    echo [信息] 前端 package.json 已更新，需要更新依赖
    set "WEB_NEED_INSTALL=1"
    goto :web_install
)

:: 检查 node_modules 中是否缺少关键依赖
if not exist "%WEB_DIR%\node_modules\vite" (
    echo [信息] 前端缺少关键依赖 vite，需要安装
    set "WEB_NEED_INSTALL=1"
    goto :web_install
)

if not exist "%WEB_DIR%\node_modules\react" (
    echo [信息] 前端缺少关键依赖 react，需要安装
    set "WEB_NEED_INSTALL=1"
    goto :web_install
)

echo [信息] 前端依赖已是最新状态
goto :env_check

:web_install
echo.
echo [安装] 正在安装/更新前端依赖...
cd /d "%WEB_DIR%"
call npm install
if errorlevel 1 (
    echo [错误] 前端依赖安装失败
    pause
    exit /b 1
)
echo [成功] 前端依赖安装完成

:env_check
:: 检查前端的 .env.local 文件是否存在
:: 检查 .env 文件（Vite 使用 .env 而不是 .env.local）
if not exist "%WEB_DIR%\.env" (
    echo.
    echo [警告] .env 文件不存在
    echo [信息] Vite 项目已包含默认 .env 配置
    echo [提示] 如需自定义配置，请编辑 mota-web\.env 文件
)

:start_services
echo.
echo ========================================
echo   依赖检查完成，准备启动服务
echo ========================================

echo.
echo [启动] 启动前端服务 (端口 3000)...
cd /d "%WEB_DIR%"
start "Mota Web Frontend [3000]" cmd /k "title Mota Web Frontend [3000] && npm run dev"

:: 等待前端服务启动后打开浏览器
echo [信息] 等待前端服务启动...
timeout /t 10 /nobreak >nul

echo [信息] 打开浏览器...
start http://localhost:3000

echo.
echo ========================================
echo   MOTAI（摩塔智能）前端服务启动完成！
echo ========================================
echo.
echo   前端地址: http://localhost:3000
echo   API Gateway: http://localhost:8080
echo.
echo   [重要] 前端使用 Vite 开发服务器
echo   [重要] 已配置代理，自动转发 API 请求到后端
echo   [提示] 内置 Mock 数据，无需后端即可预览
echo.
echo   [提示] 使用 stop-user.bat 停止服务
echo   [提示] 或直接关闭终端窗口
echo.
echo   按任意键关闭此窗口...
pause >nul