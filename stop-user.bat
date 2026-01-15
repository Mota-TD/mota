@echo off
chcp 65001 >nul
echo ========================================
echo   MOTAI（摩塔智能）前端服务停止脚本
echo ========================================
echo.

echo [信息] 正在停止 MOTAI前端服务...
echo.

:: 停止 Node.js 进程（前端和 BFF）
:: 通过窗口标题查找并关闭进程
echo [步骤 1/2] 停止 BFF 服务...
taskkill /FI "WINDOWTITLE eq Mota BFF Service*" /F >nul 2>&1
if errorlevel 1 (
    echo [信息] BFF 服务未运行或已停止
) else (
    echo [成功] BFF 服务已停止
)

echo [步骤 2/2] 停止前端服务...
taskkill /FI "WINDOWTITLE eq Mota Web Frontend*" /F >nul 2>&1
if errorlevel 1 (
    echo [信息] 前端服务未运行或已停止
) else (
    echo [成功] 前端服务已停止
)

echo.
echo ========================================
echo   服务停止完成
echo ========================================
echo.

:: 询问是否要停止所有 Node.js 进程
set /p KILL_ALL=是否停止所有 Node.js 进程? (y/n): 
if /i "%KILL_ALL%"=="y" (
    echo.
    echo [信息] 停止所有 Node.js 进程...
    taskkill /IM node.exe /F >nul 2>&1
    if errorlevel 1 (
        echo [信息] 没有运行中的 Node.js 进程
    ) else (
        echo [成功] 所有 Node.js 进程已停止
    )
)

echo.
echo 按任意键退出...
pause >nul